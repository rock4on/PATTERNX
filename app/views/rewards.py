from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from app.extensions import db
from app.models.reward import Reward, UserReward
from app.services.points_service import PointsService

# Create blueprint
rewards_blueprint = Blueprint('rewards', __name__)


@rewards_blueprint.route('/')
@login_required
def index():
    """List available rewards."""
    # Get all active rewards
    rewards = Reward.query.filter_by(is_active=True).all()
    
    # Get user's points summary
    points_summary = PointsService.get_user_points_summary(current_user.id)
    
    return render_template(
        'rewards/list.html',
        rewards=rewards,
        points_summary=points_summary
    )


@rewards_blueprint.route('/<int:reward_id>')
@login_required
def detail(reward_id):
    """Reward detail page."""
    reward = Reward.query.get_or_404(reward_id)
    
    # Check if reward is active
    if not reward.is_active:
        flash('This reward is not available.', 'warning')
        return redirect(url_for('rewards.index'))
    
    # Get user's points summary
    points_summary = PointsService.get_user_points_summary(current_user.id)
    
    # Check if user can afford the reward
    can_afford = points_summary['available_points'] >= reward.points_cost
    
    return render_template(
        'rewards/detail.html',
        reward=reward,
        points_summary=points_summary,
        can_afford=can_afford
    )


@rewards_blueprint.route('/<int:reward_id>/redeem', methods=['POST'])
@login_required
def redeem(reward_id):
    """Redeem a reward."""
    reward = Reward.query.get_or_404(reward_id)
    
    # Check if reward is active
    if not reward.is_active:
        flash('This reward is not available.', 'warning')
        return redirect(url_for('rewards.index'))
    
    # Attempt to redeem the reward
    redemption, success, message = UserReward.redeem_reward(
        user_id=current_user.id,
        reward_id=reward_id
    )
    
    flash(message, 'success' if success else 'danger')
    
    if success:
        return redirect(url_for('rewards.my_rewards'))
    else:
        return redirect(url_for('rewards.detail', reward_id=reward_id))


@rewards_blueprint.route('/my-rewards')
@login_required
def my_rewards():
    """Show user's redeemed rewards."""
    redemptions = UserReward.query.filter_by(user_id=current_user.id).order_by(
        UserReward.created_at.desc()
    ).all()
    
    # Get user's points summary
    points_summary = PointsService.get_user_points_summary(current_user.id)
    
    return render_template(
        'rewards/my_rewards.html',
        redemptions=redemptions,
        points_summary=points_summary
    )
