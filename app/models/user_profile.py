from datetime import datetime
from app.extensions import db

class UserProfile(db.Model):
    __tablename__ = 'user_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True) # Asigură unicitatea pentru relația 1-la-1

    # Demographic fields
    date_of_birth = db.Column(db.Date, nullable=True)
    gender = db.Column(db.String(50), nullable=True)  # e.g., Male, Female, Other, Prefer not to say
    county = db.Column(db.String(100), nullable=True)  # Județ
    city = db.Column(db.String(100), nullable=True)  # Oraș
    education_level = db.Column(db.String(100), nullable=True)  # e.g., Gymnasium, High School, Bachelor, Master, PhD
    residence_environment = db.Column(db.String(50), nullable=True)  # e.g., Urban, Rural

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship (backref can be defined in User model or here)


    def __repr__(self):
        return f"<UserProfile for User ID: {self.user_id}>"

    @property
    def age(self):
        if not self.date_of_birth:
            return None
        today = datetime.utcnow().date()
        return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))