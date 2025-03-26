from flask import Blueprint, render_template, redirect, url_for, flash, request, current_app, jsonify
from flask_login import login_required, current_user
from app.models.survey import Survey, SurveyCompletion
from app.services.survey_service import SurveyService

# Create blueprint
surveys_blueprint = Blueprint('surveys', __name__)


@surveys_blueprint.route('/')
@login_required
def index():
    """List available surveys."""
    available_surveys = SurveyService.get_available_surveys(current_user.id)
    return render_template('surveys/list.html', surveys=available_surveys)


@surveys_blueprint.route('/<int:survey_id>')
@login_required
def detail(survey_id):
    """Survey detail page."""
    survey = Survey.query.get_or_404(survey_id)
    
    # Check if survey is available for the user
    available_surveys = SurveyService.get_available_surveys(current_user.id)
    if survey not in available_surveys and not current_user.is_admin:
        flash('This survey is not available.', 'warning')
        return redirect(url_for('surveys.index'))
    
    # Generate URL for LimeSurvey using the new format
    limesurvey_url = f"{current_app.config['LIMESURVEY_URL'].replace('/admin/remotecontrol', '')}/index.php/{survey.limesurvey_id}?newtest=Y&lang=en&uid={current_user.id}"
    
    return render_template(
        'surveys/detail.html',
        survey=survey,
        limesurvey_url=limesurvey_url
    )


@surveys_blueprint.route('/<int:survey_id>/complete', methods=['POST'])
@login_required
def complete(survey_id):
    """Record survey completion."""
    response_id = request.form.get('response_id')
    
    if not response_id:
        flash('Invalid survey response.', 'danger')
        return redirect(url_for('surveys.detail', survey_id=survey_id))
    
    # Process the survey completion
    success, message, completion = SurveyService.record_completion(
        user_id=current_user.id,
        survey_id=survey_id,
        limesurvey_response_id=int(response_id)
    )
    
    flash(message, 'success' if success else 'danger')
    
    if success:
        return redirect(url_for('main.dashboard'))
    else:
        return redirect(url_for('surveys.detail', survey_id=survey_id))


@surveys_blueprint.route('/history')
@login_required
def history():
    """Show user's survey completion history."""
    completions = SurveyCompletion.query.filter_by(user_id=current_user.id).order_by(
        SurveyCompletion.completed_at.desc()
    ).all()
    
    return render_template('surveys/history.html', completions=completions)


@surveys_blueprint.route('/webhook', methods=['POST'])
def webhook():
    """
    Webhook for LimeSurvey to notify about completed surveys.
    This would be implemented according to your LimeSurvey setup.
    """
    # This would need to be implemented based on how your LimeSurvey instance
    # is configured to send notifications when surveys are completed.
    
    # For security, you would validate the request with a shared secret
    # Example implementation:
    
    data = request.json
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'}), 400
    
    # Validate webhook secret token
    token = request.headers.get('X-Webhook-Token')
    if token != current_app.config.get('WEBHOOK_SECRET_TOKEN'):
        return jsonify({'success': False, 'message': 'Invalid token'}), 403
    
    # Process the notification
    survey_id = data.get('survey_id')
    response_id = data.get('response_id')
    user_id = data.get('token')  # Assuming token is set to user_id
    
    if not all([survey_id, response_id, user_id]):
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    # Find the local survey by LimeSurvey ID
    survey = Survey.query.filter_by(limesurvey_id=survey_id).first()
    if not survey:
        return jsonify({'success': False, 'message': 'Survey not found'}), 404
    
    # Record the completion
    success, message, completion = SurveyService.record_completion(
        user_id=user_id,
        survey_id=survey.id,
        limesurvey_response_id=response_id
    )
    
    return jsonify({
        'success': success,
        'message': message,
        'completion_id': completion.id if completion else None
    })