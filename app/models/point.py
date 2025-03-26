from datetime import datetime
from app.extensions import db


class Point(db.Model):
    """Model for tracking user points."""
    
    __tablename__ = 'points'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    source = db.Column(db.String(50), nullable=False)  # e.g., 'survey', 'bonus', 'admin'
    source_id = db.Column(db.Integer, nullable=True)  # e.g., survey_completion_id if source is 'survey'
    description = db.Column(db.String(255))
    is_spent = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        """Represent instance as a string."""
        return f"<Point(User: {self.user_id}, Amount: {self.amount}, Source: {self.source})>"
    
    @classmethod
    def award_points_for_survey(cls, user_id, survey_completion_id, survey_id, points_amount, description=None):
        """
        Award points to a user for completing a survey.
        
        Args:
            user_id: ID of the user to award points to
            survey_completion_id: ID of the survey completion record
            survey_id: ID of the survey completed
            points_amount: Number of points to award
            description: Optional description of the points
            
        Returns:
            Point: The created Point instance
        """
        if description is None:
            from app.models.survey import Survey
            survey = Survey.query.get(survey_id)
            description = f"Completed survey: {survey.title}"
            
        point = cls(
            user_id=user_id,
            amount=points_amount,
            source='survey',
            source_id=survey_completion_id,
            description=description
        )
        
        db.session.add(point)
        db.session.commit()
        
        return point
