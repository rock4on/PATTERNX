from datetime import datetime
from app.extensions import db


class Notification(db.Model):
    """Model for user notifications."""
    
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=False, default='info')  # info, success, warning, error
    source = db.Column(db.String(50), nullable=True)  # survey, reward, admin, system
    source_id = db.Column(db.Integer, nullable=True)  # Related object ID (survey_id, reward_id, etc.)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    read_at = db.Column(db.DateTime, nullable=True)
    
    # Relationship
    user = db.relationship('User', backref=db.backref('notifications', lazy='dynamic'))
    
    def __repr__(self):
        """Represent instance as a string."""
        return f"<Notification(User: {self.user_id}, Title: {self.title})>"
    
    def mark_as_read(self):
        """Mark notification as read."""
        if not self.is_read:
            self.is_read = True
            self.read_at = datetime.utcnow()
            db.session.commit()
    
    def to_dict(self):
        """Convert notification to dictionary."""
        return {
            'id': self.id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'source': self.source,
            'source_id': self.source_id,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat(),
            'read_at': self.read_at.isoformat() if self.read_at else None,
        }
    
    @classmethod
    def create_notification(cls, user_id, title, message, notification_type='info', source=None, source_id=None):
        """
        Create a new notification for a user.
        
        Args:
            user_id: ID of the user to notify
            title: Notification title
            message: Notification message
            notification_type: Type of notification (info, success, warning, error)
            source: Source of notification (survey, reward, admin, system)
            source_id: ID of related object
            
        Returns:
            Notification: The created notification instance
        """
        notification = cls(
            user_id=user_id,
            title=title,
            message=message,
            type=notification_type,
            source=source,
            source_id=source_id
        )
        
        db.session.add(notification)
        db.session.commit()
        
        return notification
    
    @classmethod
    def create_survey_completion_notification(cls, user_id, survey_title, points_earned):
        """Create notification for survey completion."""
        return cls.create_notification(
            user_id=user_id,
            title=f"Survey Completed! ⭐",
            message=f"You earned {points_earned} points from completing '{survey_title}'!",
            notification_type='success',
            source='survey'
        )
    
    @classmethod
    def create_new_survey_notification(cls, user_id, survey_title, points_value):
        """Create notification for new available survey."""
        return cls.create_notification(
            user_id=user_id,
            title=f"New Survey Available! 📋",
            message=f"'{survey_title}' is now available. Earn {points_value} points!",
            notification_type='info',
            source='survey'
        )
    
    @classmethod
    def create_reward_redemption_notification(cls, user_id, reward_name, points_spent):
        """Create notification for reward redemption."""
        return cls.create_notification(
            user_id=user_id,
            title=f"Reward Redeemed! 🎁",
            message=f"You successfully redeemed '{reward_name}' for {points_spent} points!",
            notification_type='success',
            source='reward'
        )
    
    @classmethod
    def create_welcome_notification(cls, user_id):
        """Create welcome notification for new users."""
        return cls.create_notification(
            user_id=user_id,
            title="Welcome to Survey App! 👋",
            message="Complete surveys to earn points and redeem amazing rewards!",
            notification_type='info',
            source='system'
        )
    
    @classmethod
    def mark_all_as_read_for_user(cls, user_id):
        """Mark all notifications as read for a user."""
        notifications = cls.query.filter_by(user_id=user_id, is_read=False).all()
        for notification in notifications:
            notification.is_read = True
            notification.read_at = datetime.utcnow()
        
        db.session.commit()
        return len(notifications)