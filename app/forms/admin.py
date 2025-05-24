from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, IntegerField, BooleanField, DateTimeField, SelectField, SubmitField, SelectMultipleField
from wtforms.validators import DataRequired, Length, NumberRange, Optional
from app.models.segment import Segment

ROMANIAN_COUNTIES_CHOICES = [
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

class SurveyForm(FlaskForm):
    title = StringField('Title', validators=[DataRequired(), Length(max=255)])
    description = TextAreaField('Description', validators=[Optional()])
    points_value = IntegerField('Points Value', validators=[DataRequired(), NumberRange(min=1)])
    is_active = BooleanField('Active', default=True)
    start_date = DateTimeField('Start Date', format='%Y-%m-%d %H:%M:%S', validators=[Optional()])
    end_date = DateTimeField('End Date', format='%Y-%m-%d %H:%M:%S', validators=[Optional()])
    target_segments = SelectMultipleField(
        'Target Segments (Ctrl+Click to select multiple)',
        coerce=int,
        validators=[Optional()]
    )
    submit = SubmitField('Save Survey')

    def __init__(self, *args, **kwargs):
        super(SurveyForm, self).__init__(*args, **kwargs)
        self.target_segments.choices = [(s.id, s.name) for s in Segment.query.order_by('name').all()]


class RewardForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired(), Length(max=100)])
    description = TextAreaField('Description', validators=[Optional()])
    points_cost = IntegerField('Points Cost', validators=[DataRequired(), NumberRange(min=1)])
    image_url = StringField('Image URL', validators=[Optional(), Length(max=255)])
    quantity_available = IntegerField('Quantity Available', validators=[DataRequired(), NumberRange(min=-1)], default=-1)
    is_active = BooleanField('Active', default=True)
    submit = SubmitField('Save Reward')


class AddPointsForm(FlaskForm):
    amount = IntegerField('Points Amount', validators=[DataRequired(), NumberRange(min=1)])
    description = StringField('Description', validators=[Optional(), Length(max=255)])
    submit = SubmitField('Add Points')


class UserFilterForm(FlaskForm):
    search = StringField('Search', validators=[Optional()])
    status = SelectField('Status', choices=[
        ('', 'All'), ('active', 'Active'), ('inactive', 'Inactive')
    ], validators=[Optional()])
    submit = SubmitField('Filter')


class RedemptionStatusForm(FlaskForm):
    status = SelectField('Status', choices=[
        ('pending', 'Pending'), ('completed', 'Completed'), ('cancelled', 'Cancelled')
    ], validators=[DataRequired()])
    submit = SubmitField('Update Status')


class SegmentForm(FlaskForm):
    name = StringField('Segment Name', validators=[DataRequired(), Length(max=100)])
    description = TextAreaField('Description', validators=[Optional(), Length(max=500)])
    age_min = IntegerField('Minimum Age', validators=[Optional(), NumberRange(min=0, max=120)])
    age_max = IntegerField('Maximum Age', validators=[Optional(), NumberRange(min=0, max=120)])
    gender_choices = [('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other'), ('Prefer not to say', 'Prefer not to say')]
    genders = SelectMultipleField('Gender(s)', choices=gender_choices, validators=[Optional()])
    
    counties = SelectMultipleField('Counties', choices=ROMANIAN_COUNTIES_CHOICES, validators=[Optional()])
    # Changed cities back to StringField for comma-separated input
    cities = StringField('Cities / Localities (comma-separated, partial match)', validators=[Optional(), Length(max=500)])

    education_choices = [
        ('Gymnasium', 'Gymnasium'), ('High School', 'High School'),
        ('Vocational School', 'Vocational School'), ('Post-high School', 'Post-high School'),
        ('Bachelor Degree', 'Bachelor Degree'), ('Master Degree', 'Master Degree'), ('PhD Degree', 'PhD Degree')
    ]
    education_levels = SelectMultipleField('Education Level(s)', choices=education_choices, validators=[Optional()])
    residence_choices = [('Urban', 'Urban'), ('Rural', 'Rural')]
    residence_environments = SelectMultipleField('Residence Environment(s)', choices=residence_choices, validators=[Optional()])
    submit = SubmitField('Save Segment')

    def populate_criteria_json(self):
        """Helper to gather form data into a JSON structure for the model."""
        criteria = {}
        if self.age_min.data is not None: criteria['age_min'] = self.age_min.data
        if self.age_max.data is not None: criteria['age_max'] = self.age_max.data
        if self.genders.data: criteria['gender'] = self.genders.data
        if self.counties.data: criteria['county'] = self.counties.data
        # For cities, split the comma-separated string into a list
        if self.cities.data: criteria['city'] = [c.strip() for c in self.cities.data.split(',') if c.strip()]
        if self.education_levels.data: criteria['education_level'] = self.education_levels.data
        if self.residence_environments.data: criteria['residence_environment'] = self.residence_environments.data
        return criteria

    def load_criteria_from_json(self, criteria_json):
        """Helper to populate form fields from a JSON structure."""
        if criteria_json:
            self.age_min.data = criteria_json.get('age_min')
            self.age_max.data = criteria_json.get('age_max')
            self.genders.data = criteria_json.get('gender', [])
            self.counties.data = criteria_json.get('county', [])
            # For cities, join the list into a comma-separated string
            self.cities.data = ', '.join(criteria_json.get('city', []))
            self.education_levels.data = criteria_json.get('education_level', [])
            self.residence_environments.data = criteria_json.get('residence_environment', [])