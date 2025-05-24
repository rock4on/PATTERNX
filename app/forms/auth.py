from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField, DateField, SelectField
from wtforms.validators import DataRequired, Length, Email, EqualTo, ValidationError, Optional
from app.models.user import User

# Define Romanian counties for registration choices
ROMANIAN_COUNTIES_REGISTRATION = [
    ('', 'Select County'),
    ('Alba', 'Alba'), ('Arad', 'Arad'), ('Argeș', 'Argeș'), ('Bacău', 'Bacău'),
    ('Bihor', 'Bihor'), ('Bistrița-Năsăud', 'Bistrița-Năsăud'), ('Botoșani', 'Botoșani'),
    ('Brașov', 'Brașov'), ('Brăila', 'Brăila'), ('București', 'București'),
    ('Buzău', 'Buzău'), ('Caraș-Severin', 'Caraș-Severin'), ('Călărași', 'Călărași'),
    ('Cluj', 'Cluj'), ('Constanța', 'Constanța'), ('Covasna', 'Covasna'),
    ('Dâmbovița', 'Dâmbovița'), ('Dolj', 'Dolj'), ('Galați', 'Galați'),
    ('Giurgiu', 'Giurgiu'), ('Gorj', 'Gorj'), ('Harghita', 'Harghita'),
    ('Hunedoara', 'Hunedoara'), ('Ialomița', 'Ialomița'), ('Iași', 'Iași'),
    ('Ilfov', 'Ilfov'), ('Maramureș', 'Maramureș'), ('Mehedinți', 'Mehedinți'),
    ('Mureș', 'Mureș'), ('Neamț', 'Neamț'), ('Olt', 'Olt'), ('Prahova', 'Prahova'),
    ('Satu Mare', 'Satu Mare'), ('Sălaj', 'Sălaj'), ('Sibiu', 'Sibiu'),
    ('Suceava', 'Suceava'), ('Teleorman', 'Teleorman'), ('Timiș', 'Timiș'),
    ('Tulcea', 'Tulcea'), ('Vaslui', 'Vaslui'), ('Vâlcea', 'Vâlcea'), ('Vrancea', 'Vrancea')
]

class LoginForm(FlaskForm):
    """Form for user login."""
    email = StringField('Email', validators=[
        DataRequired(),
        Email()
    ])
    password = PasswordField('Password', validators=[
        DataRequired()
    ])
    remember_me = BooleanField('Remember Me')
    submit = SubmitField('Log In')


class RegistrationForm(FlaskForm):
    """Form for user registration."""
    username = StringField('Username', validators=[
        DataRequired(),
        Length(min=3, max=64)
    ])
    email = StringField('Email', validators=[
        DataRequired(),
        Email()
    ])
    first_name = StringField('First Name', validators=[
        DataRequired(),
        Length(max=100)
    ])
    last_name = StringField('Last Name', validators=[
        DataRequired(),
        Length(max=100)
    ])
    password = PasswordField('Password', validators=[
        DataRequired(),
        Length(min=8)
    ])
    confirm_password = PasswordField('Confirm Password', validators=[
        DataRequired(),
        EqualTo('password', message='Passwords must match.')
    ])

    date_of_birth = DateField('Date of Birth (YYYY-MM-DD)', format='%Y-%m-%d', validators=[Optional()])
    gender = SelectField('Gender', choices=[
        ('', 'Select Gender'),
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
        ('Prefer not to say', 'Prefer not to say')
    ], validators=[Optional()])
    
    county = SelectField('County', choices=ROMANIAN_COUNTIES_REGISTRATION, validators=[Optional()])
    city = StringField('City / Locality', validators=[Optional(), Length(max=100)]) # Changed back to StringField
    
    education_level = SelectField('Education Level', choices=[
        ('', 'Select Education Level'),
        ('Gymnasium', 'Gymnasium'),
        ('High School', 'High School'),
        ('Vocational School', 'Vocational School'),
        ('Post-high School', 'Post-high School'),
        ('Bachelor Degree', 'Bachelor Degree'),
        ('Master Degree', 'Master Degree'),
        ('PhD Degree', 'PhD Degree')
    ], validators=[Optional()])
    residence_environment = SelectField('Residence Environment', choices=[
        ('', 'Select Residence Environment'),
        ('Urban', 'Urban'),
        ('Rural', 'Rural')
    ], validators=[Optional()])

    submit = SubmitField('Register')

    def validate_username(self, username):
        """Validate that the username is unique."""
        user = User.query.filter_by(username=username.data).first()
        if user:
            raise ValidationError('Username already in use. Please choose a different one.')

    def validate_email(self, email):
        """Validate that the email is unique."""
        user = User.query.filter_by(email=email.data).first()
        if user:
            raise ValidationError('Email already registered. Please use a different one or log in.')