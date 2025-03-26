from datetime import datetime
from app.extensions import db


class Survey(db.Model):
    """Survey model for storing survey information."""
    
    __tablename__ = 'surveys'
    
    id = db.Column(db.Integer, primary_key=True)
    limesurvey_id = db.Column(db.Integer, nullable=False, unique=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    points_value = db.Column(db.Integer, default=10)  # Default points rewarded for completion
    is_active = db.Column(db.Boolean, default=True)
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    completions = db.relationship('SurveyCompletion', backref='survey', lazy='dynamic')
    
    @property
    def total_completions(self):
        """Return total number of completions."""
        return self.completions.count()
    
    @property
    def is_available(self):
        """Check if survey is available based on dates and active status."""
        now = datetime.utcnow()
        if not self.is_active:
            return False
        if self.start_date and now < self.start_date:
            return False
        if self.end_date and now > self.end_date:
            return False
        return True
    
    def __repr__(self):
        """Represent instance as a string."""
        return f"<Survey({self.title!r})>"


class SurveyCompletion(db.Model):
    """Model for tracking survey completions by users."""
    
    __tablename__ = 'survey_completions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    survey_id = db.Column(db.Integer, db.ForeignKey('surveys.id'), nullable=False)
    limesurvey_response_id = db.Column(db.Integer, nullable=False)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)
    points_awarded = db.Column(db.Integer, default=0)
    
    def __repr__(self):
        """Represent instance as a string."""
        return f"<SurveyCompletion(User: {self.user_id}, Survey: {self.survey_id})>"
