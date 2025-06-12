from datetime import datetime
from app.extensions import db


class Reward(db.Model):
    """Model for available rewards."""
    
    __tablename__ = 'rewards'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    points_cost = db.Column(db.Integer, nullable=False)
    image_url = db.Column(db.String(255))
    quantity_available = db.Column(db.Integer, default=-1)  # -1 means unlimited
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    redemptions = db.relationship('UserReward', backref='reward', lazy='dynamic')
    
    @property
    def quantity_redeemed(self):
        """Get the number of times this reward has been redeemed."""
        return self.redemptions.filter_by(status='completed').count()
    
    @property
    def is_available(self):
        """Check if reward is available based on quantity and active status."""
        if not self.is_active:
            return False
        if self.quantity_available == -1:  # Unlimited
            return True
        return self.quantity_redeemed < self.quantity_available
    
    def __repr__(self):
        """Represent instance as a string."""
        return f"<Reward({self.name!r})>"


class UserReward(db.Model):
    """Model for tracking user reward redemptions."""
    
    __tablename__ = 'user_rewards'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    reward_id = db.Column(db.Integer, db.ForeignKey('rewards.id'), nullable=False)
    points_spent = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, completed, cancelled
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        """Represent instance as a string."""
        return f"<UserReward(User: {self.user_id}, Reward: {self.reward_id}, Status: {self.status})>"
    
    @classmethod
    def redeem_reward(cls, user_id, reward_id):
        """
        Redeem a reward for a user.
        
        Args:
            user_id: ID of the user redeeming the reward
            reward_id: ID of the reward to redeem
            
        Returns:
            tuple: (UserReward, success, message)
        """
        from app.models.user import User
        from app.models.point import Point
        
        user = User.query.get(user_id)
        reward = Reward.query.get(reward_id)
        
        if not reward:
            return None, False, "Reward not found."
            
        if not reward.is_available:
            return None, False, "This reward is no longer available."
            
        if user.available_points < reward.points_cost:
            return None, False, "You don't have enough points for this reward."
        
        # Create the redemption record
        redemption = cls(
            user_id=user_id,
            reward_id=reward_id,
            points_spent=reward.points_cost,
            status='pending'  # Stays pending until admin fulfills the request
        )
        db.session.add(redemption)
        
        # Mark points as spent
        # Create a negative point entry to track the spent points
        spent_points = Point(
            user_id=user_id,
            amount=-reward.points_cost,  # Negative amount for spent points
            source='reward',
            source_id=reward_id,
            description=f"Redeemed reward: {reward.name}",
            is_spent=True
        )
        db.session.add(spent_points)
        
        db.session.commit()
        
        return redemption, True, "Reward redeemed successfully!"
