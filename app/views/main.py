from flask import Blueprint, render_template, current_app, session, redirect,request, url_for
from flask_login import login_required, current_user

from app.models.survey import Survey
from app.services.survey_service import SurveyService
from app.services.points_service import PointsService

# Create blueprint
main_blueprint = Blueprint('main', __name__)


@main_blueprint.route('/')
def index():
    """Home page."""
    # Get active surveys count
    active_surveys_count = Survey.query.filter_by(is_active=True).count()
    
    return render_template(
        'main/index.html',
        active_surveys_count=active_surveys_count
    )

@main_blueprint.route('/language/<language>')
def set_language(language):
    """Set the session language."""
    if language not in ['en', 'ro']:
        language = 'ro'
    session['language'] = language
    print(language)
    return redirect(request.referrer)

@main_blueprint.route('/dashboard')
@login_required
def dashboard():
    """User dashboard page."""
    # Get available surveys for the user
    available_surveys = SurveyService.get_available_surveys(current_user.id)
    
    # Get points summary
    points_summary = PointsService.get_user_points_summary(current_user.id)

    # Get recent points history
    points_history = PointsService.get_user_points_history(current_user.id)[:5]
    
    return render_template(
        'main/dashboard.html',
        available_surveys=available_surveys,
        points_summary=points_summary,
        points_history=points_history
    )
