from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from app.extensions import db
from app.models.user import User
from app.models.survey import Survey, SurveyCompletion
from app.models.reward import Reward, UserReward
from app.services.survey_service import SurveyService
from app.services.points_service import PointsService
from app.forms.admin import SurveyForm, RewardForm, AddPointsForm

# Create blueprint
admin_blueprint = Blueprint('admin', __name__)


# Admin access decorator
def admin_required(func):
    """Decorator that checks if the current user is an admin."""
    @login_required
    def decorated_view(*args, **kwargs):
        if not current_user.is_admin:
            flash('Access denied. Admin privileges required.', 'danger')
            return redirect(url_for('main.dashboard'))
        return func(*args, **kwargs)
    decorated_view.__name__ = func.__name__
    return decorated_view


@admin_blueprint.route('/')
@admin_required
def index():
    """Admin dashboard home page."""
    # Count users, surveys, and completions
    users_count = User.query.count()
    surveys_count = Survey.query.count()
    completions_count = SurveyCompletion.query.count()
    rewards_count = Reward.query.count()
    
    # Get recent survey completions
    recent_completions = SurveyCompletion.query.order_by(SurveyCompletion.completed_at.desc()).limit(5).all()
    
    # Get recent reward redemptions
    recent_redemptions = UserReward.query.order_by(UserReward.created_at.desc()).limit(5).all()
    
    return render_template(
        'admin/dashboard.html',
        users_count=users_count,
        surveys_count=surveys_count,
        completions_count=completions_count,
        rewards_count=rewards_count,
        recent_completions=recent_completions,
        recent_redemptions=recent_redemptions
    )


@admin_blueprint.route('/users')
@admin_required
def users():
    """Admin users management page."""
    users = User.query.all()
    return render_template('admin/users.html', users=users)


@admin_blueprint.route('/users/<int:user_id>')
@admin_required
def user_detail(user_id):
    """Admin user detail page."""
    user = User.query.get_or_404(user_id)
    points_summary = PointsService.get_user_points_summary(user_id)
    points_history = PointsService.get_user_points_history(user_id)
    completions = SurveyCompletion.query.filter_by(user_id=user_id).all()
    rewards = UserReward.query.filter_by(user_id=user_id).all()
    
    add_points_form = AddPointsForm()
    
    return render_template(
        'admin/user_detail.html',
        user=user,
        points_summary=points_summary,
        points_history=points_history,
        completions=completions,
        rewards=rewards,
        add_points_form=add_points_form
    )


@admin_blueprint.route('/users/<int:user_id>/add_points', methods=['POST'])
@admin_required
def add_points(user_id):
    """Add bonus points to a user."""
    user = User.query.get_or_404(user_id)
    form = AddPointsForm()
    
    if form.validate_on_submit():
        PointsService.award_bonus_points(
            user_id=user_id,
            amount=form.amount.data,
            description=form.description.data or 'Admin bonus points'
        )
        flash(f'Successfully added {form.amount.data} points to {user.username}.', 'success')
    else:
        flash('Invalid form submission.', 'danger')
    
    return redirect(url_for('admin.user_detail', user_id=user_id))


@admin_blueprint.route('/surveys')
@admin_required
def surveys():
    """Admin surveys management page."""
    surveys = Survey.query.all()
    return render_template('admin/surveys.html', surveys=surveys)


@admin_blueprint.route('/surveys/sync', methods=['POST'])
@admin_required
def sync_surveys():
    """Synchronize surveys from LimeSurvey."""
    stats = SurveyService.sync_surveys()
    flash(f'Sync complete: {stats["added"]} added, {stats["updated"]} updated', 'success')
    return redirect(url_for('admin.surveys'))


@admin_blueprint.route('/surveys/<int:survey_id>', methods=['GET', 'POST'])
@admin_required
def survey_detail(survey_id):
    """Admin survey detail page."""
    survey = Survey.query.get_or_404(survey_id)
    form = SurveyForm(obj=survey)
    
    if form.validate_on_submit():
        form.populate_obj(survey)
        db.session.commit()
        flash('Survey updated successfully.', 'success')
        return redirect(url_for('admin.surveys'))
    
    completions = SurveyCompletion.query.filter_by(survey_id=survey_id).all()
    
    return render_template(
        'admin/survey_detail.html',
        survey=survey,
        form=form,
        completions=completions
    )


@admin_blueprint.route('/rewards')
@admin_required
def rewards():
    """Admin rewards management page."""
    rewards = Reward.query.all()
    return render_template('admin/rewards.html', rewards=rewards)


@admin_blueprint.route('/rewards/new', methods=['GET', 'POST'])
@admin_required
def new_reward():
    """Admin create new reward page."""
    form = RewardForm()
    
    if form.validate_on_submit():
        reward = Reward(
            name=form.name.data,
            description=form.description.data,
            points_cost=form.points_cost.data,
            quantity_available=form.quantity_available.data,
            is_active=form.is_active.data,
            image_url=form.image_url.data
        )
        db.session.add(reward)
        db.session.commit()
        flash('Reward created successfully.', 'success')
        return redirect(url_for('admin.rewards'))
    
    return render_template('admin/reward_form.html', form=form, is_new=True)


@admin_blueprint.route('/rewards/<int:reward_id>', methods=['GET', 'POST'])
@admin_required
def edit_reward(reward_id):
    """Admin edit reward page."""
    reward = Reward.query.get_or_404(reward_id)
    form = RewardForm(obj=reward)
    
    if form.validate_on_submit():
        form.populate_obj(reward)
        db.session.commit()
        flash('Reward updated successfully.', 'success')
        return redirect(url_for('admin.rewards'))
    
    redemptions = UserReward.query.filter_by(reward_id=reward_id).all()
    
    return render_template(
        'admin/reward_form.html',
        form=form,
        reward=reward,
        redemptions=redemptions,
        is_new=False
    )


@admin_blueprint.route('/redemptions')
@admin_required
def redemptions():
    """Admin reward redemptions management page."""
    redemptions = UserReward.query.order_by(UserReward.created_at.desc()).all()
    return render_template('admin/redemptions.html', redemptions=redemptions)


@admin_blueprint.route('/redemptions/<int:redemption_id>/status', methods=['POST'])
@admin_required
def update_redemption_status(redemption_id):
    """Update redemption status."""
    redemption = UserReward.query.get_or_404(redemption_id)
    new_status = request.form.get('status')
    
    if new_status in ['pending', 'completed', 'cancelled']:
        redemption.status = new_status
        db.session.commit()
        flash(f'Redemption status updated to {new_status}.', 'success')
    else:
        flash('Invalid status.', 'danger')
    
    return redirect(url_for('admin.redemptions'))
