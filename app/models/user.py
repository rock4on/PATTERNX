from datetime import datetime
from flask_login import UserMixin
from app.extensions import db, bcrypt


class User(UserMixin, db.Model):
    """User model for storing user account information."""
    
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    is_admin = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    points = db.relationship('Point', backref='user', lazy='dynamic')
    completions = db.relationship('SurveyCompletion', backref='user', lazy='dynamic')
    rewards = db.relationship('UserReward', backref='user', lazy='dynamic')
    
    @property
    def password(self):
        """Prevent password from being accessed."""
        raise AttributeError('password is not a readable attribute')
    
    @password.setter
    def password(self, password):
        """Set password."""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def verify_password(self, password):
        """Check password."""
        return bcrypt.check_password_hash(self.password_hash, password)
    
    @property
    def full_name(self):
        """Return user's full name."""
        return f"{self.first_name} {self.last_name}"
    
    @property
    def total_points(self):
        """Return total points user has earned."""
        from app.models.point import Point
        return db.session.query(db.func.sum(Point.amount)).filter(Point.user_id == self.id).scalar() or 0
    
    @property
    def available_points(self):
        from app.services.points_service import PointsService
        summary = PointsService.get_user_points_summary(self.id)
        return summary['available_points']
    
    def __repr__(self):
        """Represent instance as a string."""
        
        return f"<User({self.username!r})>"
