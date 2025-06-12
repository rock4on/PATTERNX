from flask import Blueprint, request, jsonify
from datetime import datetime
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from app.models.user import User
from app.models.user_profile import UserProfile
from app.models.survey import Survey, SurveyCompletion
from app.models.reward import Reward, UserReward
from app.models.point import Point
from app.extensions import db
from app.api.auth import token_required, generate_token
from app.services.points_service import PointsService
from app.services.survey_service import SurveyService

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
    data = request.get_json()
    
    # For completion, we can accept either limesurvey_response_id or just mark as complete
    # This allows for flexibility in how the frontend handles survey completion
    limesurvey_response_id = data.get('limesurvey_response_id') if data else None
    
    survey = Survey.query.get_or_404(survey_id)
    
    # Check if already completed
    existing_completion = SurveyCompletion.query.filter_by(
        user_id=current_user_id,
        survey_id=survey_id
    ).first()
    
    if existing_completion:
        return jsonify({'error': 'Survey already completed'}), 400
    
    # Create completion record
    completion = SurveyCompletion(
        user_id=current_user_id,
        survey_id=survey_id,
        limesurvey_response_id=limesurvey_response_id,
        points_awarded=survey.points_value
    )
    db.session.add(completion)
    db.session.flush()
    
    # Award points
    Point.award_points_for_survey(
        user_id=current_user_id,
        survey_completion_id=completion.id,
        survey_id=survey_id,
        points_amount=survey.points_value
    )
    
    return jsonify({
        'message': 'Survey completed successfully',
        'points_awarded': survey.points_value
    })

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