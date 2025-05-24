from app.extensions import db
from sqlalchemy.dialects.postgresql import JSONB # For PostgreSQL
# from sqlalchemy import JSON # For other DBs like SQLite, MySQL (adjust as needed)
from datetime import datetime

# Association table for Survey and Segment (many-to-many)
survey_segment_association = db.Table('survey_segment_association',
    db.Column('survey_id', db.Integer, db.ForeignKey('surveys.id'), primary_key=True),
    db.Column('segment_id', db.Integer, db.ForeignKey('segments.id'), primary_key=True)
)

class Segment(db.Model):
    __tablename__ = 'segments'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)
    # Store criteria as JSON. Example:
    # {
    # "age_min": 25, "age_max": 35,
    # "gender": ["Male"], # List of allowed values
    # "county": ["Ilfov", "Bucuresti"],
    # "city": ["Bragadiru"],
    # "education_level": ["Bachelor Degree", "Master Degree"],
    # "residence_environment": ["Urban"]
    # }
    criteria = db.Column(db.JSON, nullable=False) # Use db.JSON
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # The backref 'surveys' will be created on the Survey model via the relationship.

    def __repr__(self):
        return f'<Segment {self.name}>'