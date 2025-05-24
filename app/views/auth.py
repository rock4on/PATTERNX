from flask import Blueprint, render_template, redirect, url_for, flash, request, current_app, session
from flask_login import login_user, logout_user, login_required, current_user
from app.extensions import db
from app.models.reward import UserReward
from app.models.survey import SurveyCompletion
from app.models.user import User
from app.models.user_profile import UserProfile
from app.forms.auth import LoginForm, RegistrationForm
from app.services.points_service import PointsService

# Create blueprint
auth_blueprint = Blueprint('auth', __name__)


@auth_blueprint.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))

    form = LoginForm()

    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and user.verify_password(form.password.data):
            login_user(user, remember=form.remember_me.data)
            # Loghează starea sesiunii IMEDIAT după login_user
            current_app.logger.info(f"LOGIN_ROUTE: Session after login_user: {dict(session)}")
            current_app.logger.info(f"LOGIN_ROUTE: current_user.is_authenticated after login_user: {current_user.is_authenticated}")

            # Sesiunea este setată și prin semnalul user_logged_in care apelează set_secure_session
            # set_secure_session(session, user.id) # Poți adăuga și aici un log în set_secure_session

            next_page = request.args.get('next')
            current_app.logger.info(f"LOGIN_ROUTE: Redirecting to next_page: {next_page or url_for('main.dashboard')}")
            if next_page is None or not next_page.startswith('/'):
                next_page = url_for('main.dashboard')
            return redirect(next_page)
        else:
            current_app.logger.warning(f"LOGIN_ROUTE: Invalid login attempt for email: {form.email.data}")
            flash('Invalid email or password.', 'danger')
    else:
        if request.method == 'POST': # Loghează erorile de validare dacă formularul nu e valid la POST
            current_app.logger.warning(f"LOGIN_ROUTE: Form validation errors: {form.errors}")


    return render_template('auth/login.html', form=form)



@auth_blueprint.route('/register', methods=['GET', 'POST']) #
def register(): #
    """User registration page.""" #
    if current_user.is_authenticated: #
        return redirect(url_for('main.dashboard')) #
    
    form = RegistrationForm() #
    
    if form.validate_on_submit(): #
        # Creează utilizatorul
        user = User(
            email=form.email.data, #
            username=form.username.data, #
            first_name=form.first_name.data, #
            last_name=form.last_name.data #
        )
        user.password = form.password.data #
        
        db.session.add(user) #
        # Este important să facem flush aici pentru a obține user.id pentru UserProfile
        # Alternativ, putem adăuga user_profile la user DUPĂ user.commit() și apoi profile.commit()
        # Dar e mai curat să legăm obiectele înainte de commit-ul final
        # db.session.flush() # Asigură-te că user.id este disponibil, dacă legi profilul imediat

        # Creează profilul utilizatorului
        user_profile = UserProfile(
            user_id = user.id, # Se va seta automat prin backref dacă legăm obiectele
            date_of_birth=form.date_of_birth.data if form.date_of_birth.data else None,
            gender=form.gender.data if form.gender.data else None,
            county=form.county.data if form.county.data else None,
            city=form.city.data if form.city.data else None,
            education_level=form.education_level.data if form.education_level.data else None,
            residence_environment=form.residence_environment.data if form.residence_environment.data else None
        )
        
        # Asociază profilul cu utilizatorul
        user.profile = user_profile 
        # db.session.add(user_profile) # Nu e necesar dacă `cascade="all, delete-orphan"` este setat și `user.profile = user_profile`

        try:
            db.session.commit() #
            flash('Registration successful! You can now log in.', 'success') #
            return redirect(url_for('auth.login')) #
        except Exception as e:
            db.session.rollback()
            print(e)
            flash(f'An error occurred during registration: {str(e)}', 'danger')



    return render_template('auth/register.html', form=form) #


@auth_blueprint.route('/logout')
@login_required
def logout():
    """Log out the current user."""
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('main.index'))


@auth_blueprint.route('/profile')
@login_required
def profile():
    """User profile page."""
    # Preluare istoric sondaje completate
    survey_completions = SurveyCompletion.query.filter_by(user_id=current_user.id)\
        .order_by(SurveyCompletion.completed_at.desc())\
        .all()

    # Preluare istoric recompense revendicate
    user_rewards = UserReward.query.filter_by(user_id=current_user.id)\
        .order_by(UserReward.created_at.desc())\
        .all()

    # Preluare istoric puncte folosind PointsService
    points_history = PointsService.get_user_points_history(current_user.id) # Acesta returnează deja sortat descrescător
    
    # Preluare sumar puncte (opțional, dacă vrei să-l afișezi și aici)
    points_summary = PointsService.get_user_points_summary(current_user.id)

    return render_template(
        'auth/profile.html',
        user=current_user, # Trimitem obiectul current_user complet
        survey_completions=survey_completions,
        user_rewards=user_rewards,
        points_history=points_history,
        points_summary=points_summary
    )


