from flask import Blueprint, jsonify, render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from app.extensions import db
from app.models.segment import Segment
from app.models.user import User
from app.models.survey import Survey, SurveyCompletion
from app.models.reward import Reward, UserReward
from app.services.survey_service import SurveyService
from app.services.points_service import PointsService
from app.forms.admin import SegmentForm, SurveyForm, RewardForm, AddPointsForm

# Create blueprint
admin_blueprint = Blueprint('admin', __name__)


# Admin access decorator
def admin_required(func):
    """Decorator that checks if the current user is an admin."""
    @login_required
    def decorated_view(*args, **kwargs):
        if not current_user.is_admin:
            flash('Access denied. Admin privileges required.', 'danger')
            return redirect(url_for('main.dashboard'))
        return func(*args, **kwargs)
    decorated_view.__name__ = func.__name__
    return decorated_view


@admin_blueprint.route('/')
@admin_required
def index():
    """Admin dashboard home page."""
    # Count users, surveys, and completions
    users_count = User.query.count()
    surveys_count = Survey.query.count()
    completions_count = SurveyCompletion.query.count()
    rewards_count = Reward.query.count()
    
    # Get recent survey completions
    recent_completions = SurveyCompletion.query.order_by(SurveyCompletion.completed_at.desc()).limit(5).all()
    
    # Get recent reward redemptions
    recent_redemptions = UserReward.query.order_by(UserReward.created_at.desc()).limit(5).all()
    
    return render_template(
        'admin/dashboard.html',
        users_count=users_count,
        surveys_count=surveys_count,
        completions_count=completions_count,
        rewards_count=rewards_count,
        recent_completions=recent_completions,
        recent_redemptions=recent_redemptions
    )


@admin_blueprint.route('/users')
@admin_required
def users():
    """Admin users management page."""
    users = User.query.all()
    return render_template('admin/users.html', users=users)


@admin_blueprint.route('/users/<int:user_id>')
@admin_required
def user_detail(user_id):
    """Admin user detail page."""
    user = User.query.get_or_404(user_id)
    points_summary = PointsService.get_user_points_summary(user_id)
    points_history = PointsService.get_user_points_history(user_id)
    completions = SurveyCompletion.query.filter_by(user_id=user_id).all()
    rewards = UserReward.query.filter_by(user_id=user_id).all()
    
    add_points_form = AddPointsForm()
    
    return render_template(
        'admin/user_detail.html',
        user=user,
        points_summary=points_summary,
        points_history=points_history,
        completions=completions,
        rewards=rewards,
        add_points_form=add_points_form
    )


@admin_blueprint.route('/users/<int:user_id>/add_points', methods=['POST'])
@admin_required
def add_points(user_id):
    """Add bonus points to a user."""
    user = User.query.get_or_404(user_id)
    form = AddPointsForm()
    
    if form.validate_on_submit():
        PointsService.award_bonus_points(
            user_id=user_id,
            amount=form.amount.data,
            description=form.description.data or 'Admin bonus points'
        )
        flash(f'Successfully added {form.amount.data} points to {user.username}.', 'success')
    else:
        flash('Invalid form submission.', 'danger')
    
    return redirect(url_for('admin.user_detail', user_id=user_id))


@admin_blueprint.route('/surveys')
@admin_required
def surveys():
    """Admin surveys management page."""
    surveys = Survey.query.all()
    return render_template('admin/surveys.html', surveys=surveys)


@admin_blueprint.route('/surveys/sync', methods=['POST'])
@admin_required
def sync_surveys():
    """Synchronize surveys from LimeSurvey."""
    stats = SurveyService.sync_surveys()
    flash(f'Sync complete: {stats["added"]} added, {stats["updated"]} updated', 'success')
    return redirect(url_for('admin.surveys'))


@admin_blueprint.route('/surveys/<int:survey_id>', methods=['GET', 'POST'])
@admin_required
def survey_detail(survey_id):
    survey = Survey.query.get_or_404(survey_id)
    form = SurveyForm(obj=survey)
    if request.method == 'GET':
        if survey.target_segments:
            form.target_segments.data = [s.id for s in survey.target_segments.all()]
        else:
            form.target_segments.data = []

    if form.validate_on_submit():
        survey.title = form.title.data
        survey.description = form.description.data
        survey.points_value = form.points_value.data
        survey.is_active = form.is_active.data
        survey.start_date = form.start_date.data
        survey.end_date = form.end_date.data

        # Updated logic for target_segments:
        print(form.target_segments.data)
        if form.target_segments.data:
            selected_segment_ids = form.target_segments.data
            segments_to_assign = Segment.query.filter(Segment.id.in_(selected_segment_ids)).all()
            survey.target_segments = segments_to_assign  # Directly assign the new list of segments
        else:
            survey.target_segments = []  # Assign an empty list if no segments are selected
        
        db.session.add(survey)  # Ensure the survey object is in the session
        db.session.commit()
        flash('Survey updated successfully.', 'success')
        return redirect(url_for('admin.survey_detail', survey_id=survey.id))

    completions = SurveyCompletion.query.filter_by(survey_id=survey_id).all()
    return render_template(
        'admin/survey_detail.html',
        survey=survey,
        form=form,
        completions=completions
    )



@admin_blueprint.route('/rewards')
@admin_required
def rewards():
    """Admin rewards management page."""
    rewards = Reward.query.all()
    return render_template('admin/rewards.html', rewards=rewards)


@admin_blueprint.route('/rewards/new', methods=['GET', 'POST'])
@admin_required
def new_reward():
    """Admin create new reward page."""
    form = RewardForm()
    
    if form.validate_on_submit():
        reward = Reward(
            name=form.name.data,
            description=form.description.data,
            points_cost=form.points_cost.data,
            quantity_available=form.quantity_available.data,
            is_active=form.is_active.data,
            image_url=form.image_url.data
        )
        db.session.add(reward)
        db.session.commit()
        flash('Reward created successfully.', 'success')
        return redirect(url_for('admin.rewards'))
    
    return render_template('admin/reward_form.html', form=form, is_new=True)


@admin_blueprint.route('/rewards/<int:reward_id>', methods=['GET', 'POST'])
@admin_required
def edit_reward(reward_id):
    """Admin edit reward page."""
    reward = Reward.query.get_or_404(reward_id)
    form = RewardForm(obj=reward)
    
    if form.validate_on_submit():
        form.populate_obj(reward)
        db.session.commit()
        flash('Reward updated successfully.', 'success')
        return redirect(url_for('admin.rewards'))
    
    redemptions = UserReward.query.filter_by(reward_id=reward_id).all()
    
    return render_template(
        'admin/reward_form.html',
        form=form,
        reward=reward,
        redemptions=redemptions,
        is_new=False
    )


@admin_blueprint.route('/redemptions')
@admin_required
def redemptions():
    """Admin reward redemptions management page."""
    redemptions = UserReward.query.order_by(UserReward.created_at.desc()).all()
    return render_template('admin/redemptions.html', redemptions=redemptions)


@admin_blueprint.route('/redemptions/<int:redemption_id>/status', methods=['POST'])
@admin_required
def update_redemption_status(redemption_id):
    """Update redemption status."""
    redemption = UserReward.query.get_or_404(redemption_id)
    new_status = request.form.get('status')
    
    if new_status in ['pending', 'completed', 'cancelled']:
        redemption.status = new_status
        db.session.commit()
        flash(f'Redemption status updated to {new_status}.', 'success')
    else:
        flash('Invalid status.', 'danger')
    
    return redirect(url_for('admin.redemptions'))



@admin_blueprint.route('/segments')
@admin_required
def list_segments():
    segments = Segment.query.order_by(Segment.name).all()
    return render_template('admin/segments_list.html', segments=segments)

@admin_blueprint.route('/segments/new', methods=['GET', 'POST'])
@admin_required
def new_segment():
    form = SegmentForm()
    if form.validate_on_submit():
        criteria_data = form.populate_criteria_json()
        if not criteria_data: # Ensure at least one criterion is set
            flash('Segment must have at least one targeting criterion.', 'warning')
        else:
            segment = Segment(
                name=form.name.data,
                description=form.description.data,
                criteria=criteria_data
            )
            db.session.add(segment)
            db.session.commit()
            flash('Segment created successfully.', 'success')
            return redirect(url_for('admin.list_segments'))
    return render_template('admin/segment_form.html', form=form, title='Create New Segment', is_new=True)

@admin_blueprint.route('/segments/<int:segment_id>/edit', methods=['GET', 'POST'])
@admin_required
def edit_segment(segment_id):
    segment = Segment.query.get_or_404(segment_id)
    form = SegmentForm(obj=segment) # For pre-filling name and description

    if request.method == 'GET':
        form.load_criteria_from_json(segment.criteria) # Populate criteria fields

    if form.validate_on_submit():
        segment.name = form.name.data
        segment.description = form.description.data
        criteria_data = form.populate_criteria_json()
        if not criteria_data:
             flash('Segment must have at least one targeting criterion.', 'warning')
        else:
            segment.criteria = criteria_data
            db.session.commit()
            flash('Segment updated successfully.', 'success')
            return redirect(url_for('admin.list_segments'))
    return render_template('admin/segment_form.html', form=form, title='Edit Segment', segment=segment, is_new=False)

@admin_blueprint.route('/segments/<int:segment_id>/delete', methods=['POST'])
@admin_required
def delete_segment(segment_id):
    segment = Segment.query.get_or_404(segment_id)
    # Clear associations first if not handled by cascade
    segment.surveys = []
    db.session.delete(segment)
    db.session.commit()
    flash('Segment deleted successfully.', 'success')
    return redirect(url_for('admin.list_segments'))


# ... (existing imports in app/views/admin.py)
import os
import json # Keep json for county_data_json for the map
import pandas as pd
# Remove matplotlib and seaborn imports for plots:
# import matplotlib
# matplotlib.use('Agg')
# import matplotlib.pyplot as plt
# import seaborn as sns
from collections import Counter # Can still be useful for some aggregations
from app.models.user_profile import UserProfile
from app.extensions import db

# PLOT_DIR is no longer needed for Chart.js as plots are client-side
# PLOT_DIR = os.path.join('app', 'static', 'plots')
# if not os.path.exists(PLOT_DIR):
# os.makedirs(PLOT_DIR)

# Simplified list of Romanian counties for aggregation keys (ensure these match your UserProfile.county values)
ROMANIAN_COUNTIES_FOR_AGGREGATION = [
    'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani',
    'Brașov', 'Brăila', 'București', 'Buzău', 'Caraș-Severin', 'Călărași',
    'Cluj', 'Constanța', 'Covasna', 'Dâmbovița', 'Dolj', 'Galați',
    'Giurgiu', 'Gorj', 'Harghita', 'Hunedoara', 'Ialomița', 'Iași',
    'Ilfov', 'Maramureș', 'Mehedinți', 'Mureș', 'Neamț', 'Olt', 'Prahova',
    'Satu Mare', 'Sălaj', 'Sibiu', 'Suceava', 'Teleorman', 'Timiș',
    'Tulcea', 'Vaslui', 'Vâlcea', 'Vrancea'
]

# Remove matplotlib plot generation functions:
# def generate_age_distribution_plot(...): ...
# def generate_gender_distribution_plot(...): ...
# def generate_education_level_plot(...): ...
# def generate_residence_plot(...): ...
# def generate_county_plot(...): ...


@admin_blueprint.route('/demographics', methods=['GET','POST'])
@admin_required
def demographics_dashboard():
    # ... (existing code for the main demographics dashboard)
    # This function remains largely the same, providing overall data.
    profiles = UserProfile.query.all()
    
    chart_data = {}
    county_data_for_map_json = "{}" 

    if not profiles:
        flash('No user profile data available to generate demographics.', 'warning')
        return render_template('admin/demographics.html', chart_data_json="{}", county_data_json=county_data_for_map_json)

    profiles_data = [{
        'age': profile.age,
        'gender': profile.gender,
        'county': profile.county,
        'city': profile.city,
        'education_level': profile.education_level,
        'residence_environment': profile.residence_environment
    } for profile in profiles if profile]

    if not profiles_data:
        flash('No processable user profile data available.', 'warning')
        return render_template('admin/demographics.html', chart_data_json="{}", county_data_json=county_data_for_map_json)

    profiles_df = pd.DataFrame(profiles_data)

    for col in ['gender', 'county', 'education_level', 'residence_environment']:
        if col in profiles_df:
            profiles_df[col] = profiles_df[col].fillna('Unknown')
    if 'age' in profiles_df:
        profiles_df['age'] = pd.to_numeric(profiles_df['age'], errors='coerce').dropna()

    if not profiles_df['age'].empty:
        age_bins = [0, 18, 25, 35, 45, 55, 65, 100]
        age_labels = ['<18', '18-24', '25-34', '35-44', '45-54', '55-64', '65+']
        profiles_df['age_group'] = pd.cut(profiles_df['age'], bins=age_bins, labels=age_labels, right=False)
        age_group_counts = profiles_df['age_group'].value_counts().sort_index()
        chart_data['age_distribution'] = {
            'labels': age_group_counts.index.astype(str).tolist(), # Ensure labels are strings
            'values': age_group_counts.values.tolist()
        }

    if 'gender' in profiles_df and not profiles_df['gender'].empty:
        gender_counts = profiles_df['gender'].value_counts()
        chart_data['gender_distribution'] = {
            'labels': gender_counts.index.tolist(),
            'values': gender_counts.values.tolist()
        }

    if 'education_level' in profiles_df and not profiles_df['education_level'].empty:
        education_counts = profiles_df['education_level'].value_counts()
        chart_data['education_level_distribution'] = {
            'labels': education_counts.index.tolist(),
            'values': education_counts.values.tolist()
        }

    if 'residence_environment' in profiles_df and not profiles_df['residence_environment'].empty:
        residence_counts = profiles_df['residence_environment'].value_counts()
        chart_data['residence_distribution'] = {
            'labels': residence_counts.index.tolist(),
            'values': residence_counts.values.tolist()
        }
    
    if 'county' in profiles_df and not profiles_df['county'].empty:
        county_counts = profiles_df['county'].value_counts().nlargest(20)
        chart_data['county_distribution'] = {
            'labels': county_counts.index.tolist(),
            'values': county_counts.values.tolist()
        }

    county_user_counts = {}
    if 'county' in profiles_df:
        county_user_counts = profiles_df['county'].value_counts().to_dict()
    
    county_data_for_map = {county: county_user_counts.get(county, 0) for county in ROMANIAN_COUNTIES_FOR_AGGREGATION}
    county_data_for_map_json = json.dumps(county_data_for_map)

    return render_template('admin/demographics.html', 
                           chart_data_json=json.dumps(chart_data), 
                           county_data_json=county_data_for_map_json)


@admin_blueprint.route('/demographics/county_data/<path:county_name>', methods=['GET','POST']) # Use path converter for names with spaces/special chars
@admin_required
def county_demographics_data(county_name):
    # Query profiles for the specific county
    # Note: UserProfile.county stores the county name as a string.
    profiles_in_county = UserProfile.query.filter(UserProfile.county == county_name).all()

    county_chart_data = {}

    if not profiles_in_county:
        return jsonify({'error': 'No data for this county or county not found', 'data': county_chart_data})

    profiles_data = [{
        'age': profile.age,
        'gender': profile.gender,
        'city': profile.city, # We can use this for city-level breakdown if desired
        'education_level': profile.education_level,
        'residence_environment': profile.residence_environment
    } for profile in profiles_in_county if profile]

    if not profiles_data:
         return jsonify({'error': 'No processable profile data for this county', 'data': county_chart_data})

    profiles_df = pd.DataFrame(profiles_data)

    # Clean up data specifically for this county's profiles
    for col in ['gender', 'education_level', 'residence_environment', 'city']:
        if col in profiles_df:
            profiles_df[col] = profiles_df[col].fillna('Unknown')
    if 'age' in profiles_df:
        profiles_df['age'] = pd.to_numeric(profiles_df['age'], errors='coerce').dropna()


    # Age Distribution for the county
    if not profiles_df['age'].empty:
        age_bins = [0, 18, 25, 35, 45, 55, 65, 100]
        age_labels = ['<18', '18-24', '25-34', '35-44', '45-54', '55-64', '65+']
        profiles_df['age_group'] = pd.cut(profiles_df['age'], bins=age_bins, labels=age_labels, right=False)
        age_group_counts = profiles_df['age_group'].value_counts().sort_index()
        county_chart_data['age_distribution'] = {
            'labels': age_group_counts.index.astype(str).tolist(), # Ensure labels are strings
            'values': age_group_counts.values.tolist()
        }
    
    # Gender Distribution for the county
    if 'gender' in profiles_df and not profiles_df['gender'].empty:
        gender_counts = profiles_df['gender'].value_counts()
        county_chart_data['gender_distribution'] = {
            'labels': gender_counts.index.tolist(),
            'values': gender_counts.values.tolist()
        }

    # Education Level for the county
    if 'education_level' in profiles_df and not profiles_df['education_level'].empty:
        education_counts = profiles_df['education_level'].value_counts()
        county_chart_data['education_level_distribution'] = {
            'labels': education_counts.index.tolist(),
            'values': education_counts.values.tolist()
        }

    # Residence Environment for the county
    if 'residence_environment' in profiles_df and not profiles_df['residence_environment'].empty:
        residence_counts = profiles_df['residence_environment'].value_counts()
        county_chart_data['residence_distribution'] = {
            'labels': residence_counts.index.tolist(),
            'values': residence_counts.values.tolist()
        }

    # City/Locality Distribution within the county (Top N)
    if 'city' in profiles_df and not profiles_df['city'].empty:
        city_counts = profiles_df['city'].value_counts().nlargest(10) # Show top 10 cities/localities
        county_chart_data['city_distribution'] = {
            'labels': city_counts.index.tolist(),
            'values': city_counts.values.tolist()
        }
    
    return jsonify({'county_name': county_name, 'data': county_chart_data})






# Ensure these imports are at the top of app/views/admin.py if not already present
import pandas as pd
from datetime import datetime, timedelta # Ensure timedelta is imported
from app.models.user_profile import UserProfile
from app.models.user import User # For User.created_at
from app.models.segment import Segment # For Segment model if used in filters
from app.services.segment_service import SegmentService # For SegmentService if used in filters

# Make sure ROMANIAN_COUNTIES_FOR_AGGREGATION is defined globally in this file
# (as provided in previous responses) if it's not imported.

# Definition of the missing helper function:
def get_filtered_demographics_data(start_date_str=None, end_date_str=None, segment_id_str=None):
    profiles_query = UserProfile.query.join(User, UserProfile.user_id == User.id)

    # Apply date filter (based on User.created_at)
    if start_date_str:
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
            profiles_query = profiles_query.filter(User.created_at >= start_date)
        except ValueError:
            pass # Invalid date format, ignore for now or add flashing
    if end_date_str:
        try:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
            end_date_inclusive = end_date + timedelta(days=1) # Make end date inclusive
            profiles_query = profiles_query.filter(User.created_at < end_date_inclusive)
        except ValueError:
            pass # Invalid date format, ignore for now

    # Apply segment filter
    if segment_id_str and segment_id_str.isdigit():
        segment_id = int(segment_id_str)
        # Ensure SegmentService is imported and accessible
        user_ids_in_segment = SegmentService.get_user_ids_in_segment(segment_id)
        if not user_ids_in_segment:
             # Return empty structures if no users in segment
            return pd.DataFrame(), {}, {}
        profiles_query = profiles_query.filter(UserProfile.user_id.in_(user_ids_in_segment))

    profiles = profiles_query.all()

    # Initialize return structures
    chart_data_dict = {}
    county_data_for_map = {county: 0 for county in ROMANIAN_COUNTIES_FOR_AGGREGATION} # Ensure all counties are present

    if not profiles:
        return pd.DataFrame(), chart_data_dict, county_data_for_map

    profiles_data = [{
        'age': profile.age,
        'gender': profile.gender,
        'county': profile.county,
        'city': profile.city,
        'education_level': profile.education_level,
        'residence_environment': profile.residence_environment,
        'user_id': profile.user_id
    } for profile in profiles if profile]

    if not profiles_data:
       return pd.DataFrame(), chart_data_dict, county_data_for_map

    profiles_df = pd.DataFrame(profiles_data)

    # Data cleaning and preparation
    for col in ['gender', 'county', 'education_level', 'residence_environment', 'city']: # Added city here too
        if col in profiles_df:
            profiles_df[col] = profiles_df[col].fillna('Unknown')
    if 'age' in profiles_df: # Check if 'age' column exists before trying to convert
        profiles_df['age'] = pd.to_numeric(profiles_df['age'], errors='coerce') # dropna() will be handled by specific aggregations

    # Prepare data for Chart.js if DataFrame is not empty
    if not profiles_df.empty:
        # Age Distribution
        if 'age' in profiles_df and not profiles_df['age'].dropna().empty:
            age_bins = [0, 18, 25, 35, 45, 55, 65, 100] # Ensure max age is reasonable
            age_labels = ['<18', '18-24', '25-34', '35-44', '45-54', '55-64', '65+']
            # Use .loc to avoid SettingWithCopyWarning if profiles_df is a slice
            profiles_df_copy = profiles_df.copy() # Work on a copy for adding 'age_group'
            profiles_df_copy['age_group'] = pd.cut(profiles_df_copy['age'].dropna(), bins=age_bins, labels=age_labels, right=False)
            age_group_counts = profiles_df_copy['age_group'].value_counts().sort_index()
            chart_data_dict['age_distribution'] = {
                'labels': age_group_counts.index.astype(str).tolist(),
                'values': age_group_counts.values.tolist()
            }

        # Gender Distribution
        if 'gender' in profiles_df and not profiles_df['gender'].loc[profiles_df['gender'] != 'Unknown'].empty:
            gender_counts = profiles_df['gender'].value_counts()
            chart_data_dict['gender_distribution'] = {
                'labels': gender_counts.index.tolist(),
                'values': gender_counts.values.tolist()
            }

        # Education Level Distribution
        if 'education_level' in profiles_df and not profiles_df['education_level'].loc[profiles_df['education_level'] != 'Unknown'].empty:
            education_counts = profiles_df['education_level'].value_counts()
            chart_data_dict['education_level_distribution'] = {
                'labels': education_counts.index.tolist(),
                'values': education_counts.values.tolist()
            }
        
        # Residence Environment Distribution
        if 'residence_environment' in profiles_df and not profiles_df['residence_environment'].loc[profiles_df['residence_environment'] != 'Unknown'].empty:
            residence_counts = profiles_df['residence_environment'].value_counts()
            chart_data_dict['residence_distribution'] = {
                'labels': residence_counts.index.tolist(),
                'values': residence_counts.values.tolist()
            }
        
        # County Distribution (for bar chart and map)
        if 'county' in profiles_df and not profiles_df['county'].loc[profiles_df['county'] != 'Unknown'].empty:
            county_counts_series = profiles_df['county'].value_counts()
            county_counts_top20 = county_counts_series.nlargest(20)
            chart_data_dict['county_distribution'] = {
                'labels': county_counts_top20.index.tolist(),
                'values': county_counts_top20.values.tolist()
            }
            # For the map, use all county counts from the filtered data
            county_user_counts_map = county_counts_series.to_dict()
            # Initialize all counties for the map, then update with actual counts
            for county_key in ROMANIAN_COUNTIES_FOR_AGGREGATION:
                 county_data_for_map[county_key] = county_user_counts_map.get(county_key, 0)
        else: # Ensure county_data_for_map is still initialized if no county data in profiles_df
            for county_key in ROMANIAN_COUNTIES_FOR_AGGREGATION:
                 county_data_for_map[county_key] = 0


    return profiles_df, chart_data_dict, county_data_for_map








@admin_blueprint.route('/demographics/data')
@admin_required
def demographics_data_api():
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')
    segment_id_str = request.args.get('segment_id')
    county_name_drilldown = request.args.get('county_drilldown')

   
    if county_name_drilldown:
        # Fetch profiles based on main filters first
        profiles_df, _, _ = get_filtered_demographics_data(start_date_str, end_date_str, segment_id_str)
        
        


        county_specific_df = pd.DataFrame() 
        if not profiles_df.empty and 'county' in profiles_df:
             county_specific_df = profiles_df[profiles_df['county'] == county_name_drilldown].copy()
        
        
        
        if county_specific_df.empty:
            return jsonify({'error': f'No data for county: {county_name_drilldown} with current filters.', 'data': {}})

        drilldown_data = {}
        
        # Age Distribution for the county
        if 'age' in county_specific_df and not county_specific_df['age'].dropna().empty:
            age_bins = [0, 18, 25, 35, 45, 55, 65, 100]
            age_labels = ['<18', '18-24', '25-34', '35-44', '45-54', '55-64', '65+']
            county_specific_df.loc[:, 'age_group'] = pd.cut(county_specific_df['age'].dropna(), bins=age_bins, labels=age_labels, right=False)
            age_group_counts = county_specific_df['age_group'].value_counts().sort_index()
            if not age_group_counts.empty:
                drilldown_data['age_distribution'] = {
                    'labels': age_group_counts.index.astype(str).tolist(),
                    'values': age_group_counts.values.tolist()
                }

        
        # Education Level for the county
        # Check for 'Unknown' after fillna, so we need to see the series before value_counts if it's all 'Unknown'
        if 'education_level' in county_specific_df:
            # temp_education_levels = county_specific_df['education_level'].fillna('Unknown') # fillna is done in get_filtered_demographics_data
            temp_education_levels = county_specific_df['education_level']
            if not temp_education_levels.loc[temp_education_levels != 'Unknown'].empty:
                education_counts = temp_education_levels.value_counts()
                print(f"Drilldown - Education counts for {county_name_drilldown}:\n{education_counts}")
                if not education_counts.empty:
                    drilldown_data['education_level_distribution'] = {
                        'labels': education_counts.index.tolist(),
                        'values': education_counts.values.tolist()
                    }
                


        # City/Locality Distribution within the county (Top N)
        if 'city' in county_specific_df:
            # temp_cities = county_specific_df['city'].fillna('Unknown')
            temp_cities = county_specific_df['city']
            if not temp_cities.loc[temp_cities != 'Unknown'].empty:
                city_counts = temp_cities.value_counts().nlargest(10)
                print(f"Drilldown - City counts for {county_name_drilldown}:\n{city_counts}")
                if not city_counts.empty:
                    drilldown_data['city_distribution'] = {
                        'labels': city_counts.index.tolist(),
                        'values': city_counts.values.tolist()
                    }

        
        if not drilldown_data:
             return jsonify({'error': f'No detailed demographic data to display for county: {county_name_drilldown} with current filters.', 'data': {}})

        return jsonify({'county_name': county_name_drilldown, 'data': drilldown_data})
    else:
        # General data request
        _, chart_data, county_data_map = get_filtered_demographics_data(start_date_str, end_date_str, segment_id_str)
        return jsonify({
            'chart_data': chart_data,
            'county_data_for_map': county_data_map
        })
