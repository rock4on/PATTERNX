from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, IntegerField, BooleanField, DateTimeField, SelectField, SubmitField
from wtforms.validators import DataRequired, Length, NumberRange, Optional


class SurveyForm(FlaskForm):
    """Form for editing surveys."""
    title = StringField('Title', validators=[
        DataRequired(),
        Length(max=255)
    ])
    description = TextAreaField('Description')
    points_value = IntegerField('Points Value', validators=[
        DataRequired(),
        NumberRange(min=1)
    ])
    is_active = BooleanField('Active')
    start_date = DateTimeField('Start Date', format='%Y-%m-%d %H:%M:%S', validators=[Optional()])
    end_date = DateTimeField('End Date', format='%Y-%m-%d %H:%M:%S', validators=[Optional()])
    submit = SubmitField('Save Survey')


class RewardForm(FlaskForm):
    """Form for creating and editing rewards."""
    name = StringField('Name', validators=[
        DataRequired(),
        Length(max=100)
    ])
    description = TextAreaField('Description')
    points_cost = IntegerField('Points Cost', validators=[
        DataRequired(),
        NumberRange(min=1)
    ])
    image_url = StringField('Image URL', validators=[Length(max=255)])
    quantity_available = IntegerField('Quantity Available', validators=[
        DataRequired(),
        NumberRange(min=-1)  # -1 means unlimited
    ], default=-1)
    is_active = BooleanField('Active', default=True)
    submit = SubmitField('Save Reward')


class AddPointsForm(FlaskForm):
    """Form for adding points to a user."""
    amount = IntegerField('Points Amount', validators=[
        DataRequired(),
        NumberRange(min=1)
    ])
    description = StringField('Description', validators=[
        Length(max=255)
    ])
    submit = SubmitField('Add Points')


class UserFilterForm(FlaskForm):
    """Form for filtering users."""
    search = StringField('Search')
    status = SelectField('Status', choices=[
        ('', 'All'),
        ('active', 'Active'),
        ('inactive', 'Inactive')
    ])
    submit = SubmitField('Filter')


class RedemptionStatusForm(FlaskForm):
    """Form for updating redemption status."""
    status = SelectField('Status', choices=[
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    ], validators=[DataRequired()])
    submit = SubmitField('Update Status')
