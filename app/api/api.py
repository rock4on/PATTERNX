from flask import Blueprint, request, jsonify
from datetime import datetime
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from app.models.user import User
from app.models.user_profile import UserProfile
from app.models.survey import Survey, SurveyCompletion
from app.models.reward import Reward, UserReward
from app.models.point import Point
from app.models.notification import Notification
from app.extensions import db
from app.api.auth import token_required, generate_token
from app.services.points_service import PointsService
from app.services.survey_service import SurveyService
from app.services.firebase_service import FirebaseService

api = Blueprint('api', __name__, url_prefix='/api')

# Import error handlers
from . import errors

# Authentication endpoints
@api.route('/auth/login', methods=['POST'])
def login():
    """Login user and return JWT token."""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.verify_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    if not user.is_active:
        return jsonify({'error': 'Account is deactivated'}), 401
    
    token = generate_token(user.id)
    
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'total_points': user.total_points,
            'available_points': user.available_points
        }
    })

@api.route('/auth/register', methods=['POST'])
def register():
    """Register new user."""
    try:
        data = request.get_json()
        
        required_fields = ['email', 'username', 'password', 'first_name', 'last_name']
        if not data or not all(field in data for field in required_fields):
            return jsonify({'error': 'All fields required: email, username, password, first_name, last_name'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already taken'}), 400
        
        user = User(
            email=data['email'],
            username=data['username'],
            first_name=data['first_name'],
            last_name=data['last_name']
        )
        user.password = data['password']
        
        db.session.add(user)
        db.session.commit()
        
        # Create welcome notification for new user
        Notification.create_welcome_notification(user.id)
        
        token = generate_token(user.id)
        
        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'total_points': 0,
                'available_points': 0
            }
        }), 201
    
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'User with this email or username already exists'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed'}), 500

@api.route('/auth/firebase', methods=['POST'])
def firebase_auth():
    """Authenticate user with Firebase ID token."""
    try:
        data = request.get_json()
        
        if not data or not data.get('id_token'):
            return jsonify({'error': 'ID token is required'}), 400
        
        id_token = data.get('id_token')
        provider = data.get('provider', 'unknown')  # 'google', 'facebook', 'apple'
        
        # Check if Firebase is available
        if not FirebaseService.is_available():
            return jsonify({'error': 'Firebase authentication is not configured'}), 503
        
        # Verify the ID token with Firebase
        try:
            decoded_token = FirebaseService.verify_id_token(id_token)
        except Exception as e:
            return jsonify({'error': f'Token verification failed: {str(e)}'}), 401
        
        firebase_uid = decoded_token['uid']
        email = decoded_token.get('email')
        name = decoded_token.get('name', '')
        
        if not email:
            return jsonify({'error': 'Email not provided by OAuth provider'}), 400
        
        # Check if user exists by email or firebase_uid
        user = User.query.filter(
            (User.email == email) | (User.firebase_uid == firebase_uid)
        ).first()
        
        if not user:
            # Create new user
            name_parts = name.split(' ', 1) if name else ['', '']
            first_name = name_parts[0] if len(name_parts) > 0 else ''
            last_name = name_parts[1] if len(name_parts) > 1 else ''
            
            # Generate a unique username from email
            base_username = email.split('@')[0]
            username = base_username
            counter = 1
            while User.query.filter_by(username=username).first():
                username = f"{base_username}{counter}"
                counter += 1
            
            user = User(
                email=email,
                username=username,
                first_name=first_name,
                last_name=last_name,
                password_hash='',  # OAuth users don't need password
                firebase_uid=firebase_uid,
                oauth_provider=provider,
                is_verified=True  # OAuth users are pre-verified
            )
            
            db.session.add(user)
            db.session.commit()
            
            # Create welcome notification for new OAuth user
            try:
                Notification.create_welcome_notification(user.id)
            except Exception as e:
                # Log error but don't fail the authentication
                print(f"Failed to create welcome notification: {e}")
        else:
            # Update existing user's Firebase UID and OAuth provider if not set
            if not user.firebase_uid:
                user.firebase_uid = firebase_uid
                user.oauth_provider = provider
                user.is_verified = True
                db.session.commit()
            elif user.firebase_uid != firebase_uid:
                # This shouldn't happen normally, but handle edge case
                return jsonify({'error': 'Account linking conflict'}), 409
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 401
        
        # Generate JWT token for the app
        token = generate_token(user.id)
        
        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'total_points': user.total_points,
                'available_points': user.available_points
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Authentication failed: {str(e)}'}), 500

# User endpoints
@api.route('/user/profile', methods=['GET'])
@token_required
def get_profile(current_user_id):
    """Get user profile."""
    user = User.query.get(current_user_id)
    profile = user.profile
    
    profile_data = {
        'date_of_birth': profile.date_of_birth.isoformat() if profile and profile.date_of_birth else None,
        'gender': profile.gender if profile else None,
        'county': profile.county if profile else None,
        'city': profile.city if profile else None,
        'education_level': profile.education_level if profile else None,
        'residence_environment': profile.residence_environment if profile else None,
        'age': profile.age if profile else None
    }
    
    return jsonify({
        'user': {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'total_points': user.total_points,
            'available_points': user.available_points,
            'created_at': user.created_at.isoformat()
        },
        'profile': profile_data
    })

@api.route('/user/profile', methods=['PUT'])
@token_required
def update_profile(current_user_id):
    """Update user profile."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Update user basic info
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        
        # Update or create profile
        profile = user.profile
        if not profile:
            profile = UserProfile(user_id=current_user_id)
            db.session.add(profile)
        
        if 'date_of_birth' in data and data['date_of_birth']:
            try:
                profile.date_of_birth = datetime.fromisoformat(data['date_of_birth']).date()
            except ValueError:
                return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        if 'gender' in data:
            profile.gender = data['gender']
        if 'county' in data:
            profile.county = data['county']
        if 'city' in data:
            profile.city = data['city']
        if 'education_level' in data:
            profile.education_level = data['education_level']
        if 'residence_environment' in data:
            profile.residence_environment = data['residence_environment']
        
        db.session.commit()
        
        return jsonify({'message': 'Profile updated successfully'})
    
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Profile update failed'}), 500

# Survey endpoints
@api.route('/surveys', methods=['GET'])
@token_required
def get_surveys(current_user_id):
    """Get available surveys for user."""
    surveys = SurveyService.get_available_surveys(current_user_id)
    
    survey_list = []
    for survey in surveys:
        survey_list.append({
            'id': survey.id,
            'limesurvey_id': survey.limesurvey_id,
            'title': survey.title,
            'description': survey.description,
            'points_value': survey.points_value,
            'start_date': survey.start_date.isoformat() if survey.start_date else None,
            'end_date': survey.end_date.isoformat() if survey.end_date else None,
            'total_completions': survey.total_completions
        })
    
    return jsonify({'surveys': survey_list})

@api.route('/surveys/<int:survey_id>', methods=['GET'])
@token_required
def get_survey_detail(current_user_id, survey_id):
    """Get survey details."""
    survey = Survey.query.get_or_404(survey_id)
    
    # Check if user already completed this survey
    completion = SurveyCompletion.query.filter_by(
        user_id=current_user_id,
        survey_id=survey_id
    ).first()
    
    return jsonify({
        'survey': {
            'id': survey.id,
            'limesurvey_id': survey.limesurvey_id,
            'title': survey.title,
            'description': survey.description,
            'points_value': survey.points_value,
            'start_date': survey.start_date.isoformat() if survey.start_date else None,
            'end_date': survey.end_date.isoformat() if survey.end_date else None,
            'is_available': survey.is_available,
            'total_completions': survey.total_completions,
            'completed_by_user': completion is not None
        }
    })

@api.route('/surveys/<int:survey_id>/start', methods=['POST'])
@token_required
def start_survey(current_user_id, survey_id):
    """Start a survey and return the LimeSurvey URL."""
    from flask import current_app
    
    survey = Survey.query.get_or_404(survey_id)
    
    # Check if already completed
    existing_completion = SurveyCompletion.query.filter_by(
        user_id=current_user_id,
        survey_id=survey_id
    ).first()
    
    if existing_completion:
        return jsonify({'error': 'Survey already completed'}), 400
    
    # Check if survey is available
    if not survey.is_available:
        return jsonify({'error': 'Survey is not available'}), 400
    
    # Generate LimeSurvey URL based on the provided pattern
    limesurvey_base_url = current_app.config.get('LIMESURVEY_URL')
    print(f"LIMESURVEY_URL config: {limesurvey_base_url}")
    if limesurvey_base_url:
        # Remove '/admin/remotecontrol' from the URL and build the survey URL
        base_url = limesurvey_base_url.replace('/admin/remotecontrol', '')
        survey_url = f"{base_url}/index.php/{survey.limesurvey_id}?newtest=Y&lang=en&uid={current_user_id}"
        print(f"Generated survey URL: {survey_url}")
    else:
        # Fallback if LIMESURVEY_URL is not configured - create a demo URL
        print("LIMESURVEY_URL not configured, using demo URL")
        survey_url = f"https://demo.limesurvey.org/index.php/{survey.limesurvey_id}?newtest=Y&lang=en&uid={current_user_id}"
        print(f"Generated demo survey URL: {survey_url}")
    
    return jsonify({
        'survey_url': survey_url,
        'survey': {
            'id': survey.id,
            'title': survey.title,
            'points_value': survey.points_value
        }
    })

@api.route('/surveys/<int:survey_id>/complete', methods=['POST'])
@token_required
def complete_survey(current_user_id, survey_id):
    """Mark survey as completed."""
    from flask import current_app
    
    current_app.logger.info(f"DEBUG: Starting complete_survey for user_id={current_user_id}, survey_id={survey_id}")
    
    try:
        # Handle cases where no JSON data is sent or Content-Type is missing
        try:
            data = request.get_json(force=True) or {}
        except:
            data = {}
        current_app.logger.info(f"DEBUG: Request data: {data}")
        
        # Get limesurvey_response_id from request data (optional)
        limesurvey_response_id = data.get('limesurvey_response_id') if data else None
        current_app.logger.info(f"DEBUG: limesurvey_response_id from request: {limesurvey_response_id}")
        
        current_app.logger.info(f"DEBUG: Using SurveyService.record_completion")
        
        # Use the same service as Flask UI for consistent validation and logic
        # The service will automatically fetch the response_id from LimeSurvey based on user_id
        success, message, completion = SurveyService.record_completion(
            user_id=current_user_id,
            survey_id=survey_id,
            limesurvey_response_id=limesurvey_response_id  # Can be None, service will fetch it
        )
        
        current_app.logger.info(f"DEBUG: SurveyService.record_completion result: success={success}, message={message}")
        
        if not success:
            return jsonify({'error': message}), 400
        
        # Create notification for survey completion
        if success and completion:
            survey = Survey.query.get(survey_id)
            Notification.create_survey_completion_notification(
                user_id=current_user_id,
                survey_title=survey.title,
                points_earned=completion.points_awarded
            )
            current_app.logger.info(f"DEBUG: Created completion notification")
        
        current_app.logger.info(f"DEBUG: Returning success response")
        return jsonify({
            'message': message,
            'points_awarded': completion.points_awarded if completion else 0
        })
        
    except Exception as e:
        current_app.logger.error(f"DEBUG: Exception in complete_survey: {type(e).__name__}: {str(e)}")
        current_app.logger.error(f"DEBUG: Exception traceback:", exc_info=True)
        return jsonify({'error': 'Server Error', 'message': 'An unexpected error occurred.'}), 500

# Rewards endpoints
@api.route('/rewards', methods=['GET'])
@token_required
def get_rewards(current_user_id):
    """Get available rewards."""
    rewards = Reward.query.filter_by(is_active=True).all()
    user = User.query.get(current_user_id)
    
    reward_list = []
    for reward in rewards:
        reward_list.append({
            'id': reward.id,
            'name': reward.name,
            'description': reward.description,
            'points_cost': reward.points_cost,
            'image_url': reward.image_url,
            'quantity_available': reward.quantity_available,
            'quantity_redeemed': reward.quantity_redeemed,
            'is_available': reward.is_available,
            'can_afford': user.available_points >= reward.points_cost
        })
    
    return jsonify({'rewards': reward_list})

@api.route('/rewards/<int:reward_id>/redeem', methods=['POST'])
@token_required
def redeem_reward(current_user_id, reward_id):
    """Redeem a reward."""
    redemption, success, message = UserReward.redeem_reward(current_user_id, reward_id)
    
    if not success:
        return jsonify({'error': message}), 400
    
    # Create notification for reward redemption
    if success and redemption:
        Notification.create_reward_redemption_notification(
            user_id=current_user_id,
            reward_name=redemption.reward.name,
            points_spent=redemption.points_spent
        )
    
    return jsonify({
        'message': message,
        'redemption': {
            'id': redemption.id,
            'points_spent': redemption.points_spent,
            'status': redemption.status,
            'created_at': redemption.created_at.isoformat()
        }
    })

@api.route('/user/rewards', methods=['GET'])
@token_required
def get_user_rewards(current_user_id):
    """Get user's reward redemptions."""
    redemptions = UserReward.query.filter_by(user_id=current_user_id).order_by(UserReward.created_at.desc()).all()
    
    redemption_list = []
    for redemption in redemptions:
        redemption_list.append({
            'id': redemption.id,
            'reward': {
                'id': redemption.reward.id,
                'name': redemption.reward.name,
                'description': redemption.reward.description
            },
            'points_spent': redemption.points_spent,
            'status': redemption.status,
            'notes': redemption.notes,
            'created_at': redemption.created_at.isoformat()
        })
    
    return jsonify({'redemptions': redemption_list})

# Points endpoints
@api.route('/user/points', methods=['GET'])
@token_required
def get_user_points(current_user_id):
    """Get user's points summary and history."""
    summary = PointsService.get_user_points_summary(current_user_id)
    history = Point.query.filter_by(user_id=current_user_id).order_by(Point.created_at.desc()).limit(50).all()
    
    history_list = []
    for point in history:
        history_list.append({
            'id': point.id,
            'amount': point.amount,
            'source': point.source,
            'description': point.description,
            'is_spent': point.is_spent,
            'created_at': point.created_at.isoformat()
        })
    
    return jsonify({
        'summary': summary,
        'history': history_list
    })

# Dashboard data endpoint
@api.route('/dashboard', methods=['GET'])
@token_required
def get_dashboard_data(current_user_id):
    """Get dashboard data for user."""
    user = User.query.get(current_user_id)
    
    # Get available surveys count
    available_surveys_count = len(SurveyService.get_available_surveys(current_user_id))
    
    # Get completed surveys count
    completed_surveys_count = SurveyCompletion.query.filter_by(user_id=current_user_id).count()
    
    # Get recent activity (last 10 points transactions)
    recent_points = Point.query.filter_by(user_id=current_user_id).order_by(Point.created_at.desc()).limit(10).all()
    
    activity_list = []
    for point in recent_points:
        activity_list.append({
            'type': 'points',
            'amount': point.amount,
            'description': point.description,
            'created_at': point.created_at.isoformat()
        })
    
    return jsonify({
        'user': {
            'first_name': user.first_name,
            'total_points': user.total_points,
            'available_points': user.available_points
        },
        'stats': {
            'available_surveys': available_surveys_count,
            'completed_surveys': completed_surveys_count,
            'total_rewards': UserReward.query.filter_by(user_id=current_user_id).count()
        },
        'recent_activity': activity_list
    })

# Notification endpoints
@api.route('/notifications', methods=['GET'])
@token_required
def get_notifications(current_user_id):
    """Get user's notifications."""
    # Get query parameters
    limit = request.args.get('limit', 50, type=int)
    offset = request.args.get('offset', 0, type=int)
    unread_only = request.args.get('unread_only', 'false').lower() == 'true'
    
    # Build query
    query = Notification.query.filter_by(user_id=current_user_id)
    
    if unread_only:
        query = query.filter_by(is_read=False)
    
    # Get total count
    total_count = query.count()
    unread_count = Notification.query.filter_by(user_id=current_user_id, is_read=False).count()
    
    # Get notifications with pagination
    notifications = query.order_by(Notification.created_at.desc()).offset(offset).limit(limit).all()
    
    notification_list = []
    for notification in notifications:
        notification_list.append(notification.to_dict())
    
    return jsonify({
        'notifications': notification_list,
        'total_count': total_count,
        'unread_count': unread_count,
        'has_more': (offset + limit) < total_count
    })

@api.route('/notifications/<int:notification_id>/read', methods=['POST'])
@token_required
def mark_notification_read(current_user_id, notification_id):
    """Mark a specific notification as read."""
    notification = Notification.query.filter_by(
        id=notification_id, 
        user_id=current_user_id
    ).first()
    
    if not notification:
        return jsonify({'error': 'Notification not found'}), 404
    
    notification.mark_as_read()
    
    return jsonify({
        'message': 'Notification marked as read',
        'notification': notification.to_dict()
    })

@api.route('/notifications/mark-all-read', methods=['POST'])
@token_required
def mark_all_notifications_read(current_user_id):
    """Mark all notifications as read for the user."""
    marked_count = Notification.mark_all_as_read_for_user(current_user_id)
    
    return jsonify({
        'message': f'Marked {marked_count} notifications as read',
        'marked_count': marked_count
    })

@api.route('/notifications/unread-count', methods=['GET'])
@token_required
def get_unread_count(current_user_id):
    """Get unread notification count for the user."""
    unread_count = Notification.query.filter_by(
        user_id=current_user_id, 
        is_read=False
    ).count()
    
    return jsonify({
        'unread_count': unread_count
    })