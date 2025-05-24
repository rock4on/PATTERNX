from app.models.user import User
from app.models.user_profile import UserProfile
from app.models.segment import Segment
from app.extensions import db
from sqlalchemy import and_, or_ 
from datetime import date, timedelta 

class SegmentService:
    @staticmethod
    def _apply_criterion(query, model_field, criterion_values, is_list_criterion=True):
        """Helper to apply a single criterion to the query."""
        if criterion_values: 
            if is_list_criterion: 
                query = query.filter(model_field.in_(criterion_values))
            else: 
                query = query.filter(model_field == criterion_values)
        return query

    @staticmethod
    def get_users_in_segment_query(segment_id):
        """
        Returns a SQLAlchemy query object for users matching the segment criteria.
        Does not execute the query.
        """
        segment = Segment.query.get(segment_id)
        if not segment:
            return User.query.filter(db.false()) 

        query = User.query.join(UserProfile, User.id == UserProfile.user_id)
        criteria = segment.criteria

        if 'age_min' in criteria or 'age_max' in criteria:
            today = date.today()
            if 'age_min' in criteria and criteria['age_min'] is not None:
                max_birth_date = today - timedelta(days=criteria['age_min'] * 365.25)
                query = query.filter(UserProfile.date_of_birth <= max_birth_date)
            if 'age_max' in criteria and criteria['age_max'] is not None:
                min_birth_date = today - timedelta(days=(criteria['age_max'] + 1) * 365.25) 
                query = query.filter(UserProfile.date_of_birth >= min_birth_date)

        if criteria.get('gender'):
            query = query.filter(UserProfile.gender.in_(criteria['gender']))

        # County criteria for exact match from a list (if counties is SelectMultipleField)
        if criteria.get('county'):
            query = query.filter(UserProfile.county.in_(criteria['county']))

        # City criteria - revert to case-insensitive partial match for admin-defined list
        if criteria.get('city'): # criteria['city'] is now a list of strings entered by admin
            city_filters = []
            for city_val in criteria['city']:
                city_filters.append(UserProfile.city.ilike(f"%{city_val}%"))
            if city_filters:
                query = query.filter(or_(*city_filters))

        if criteria.get('education_level'):
            query = query.filter(UserProfile.education_level.in_(criteria['education_level']))

        if criteria.get('residence_environment'):
            query = query.filter(UserProfile.residence_environment.in_(criteria['residence_environment']))

        return query

    @staticmethod
    def get_user_ids_in_segment(segment_id):
        """Returns a list of user IDs matching the segment criteria."""
        query = SegmentService.get_users_in_segment_query(segment_id).with_entities(User.id)
        return [uid for uid, in query.all()]

    @staticmethod
    def evaluate_user_for_segment(user_id, segment_id):
        """Checks if a single user (by ID) belongs to a segment."""
        user = User.query.get(user_id)
        segment = Segment.query.get(segment_id)

        if not user or not user.profile or not segment:
            return False

        profile = user.profile
        criteria = segment.criteria

        user_age = profile.age 
        if user_age is None: 
             if 'age_min' in criteria or 'age_max' in criteria:
                return False
        else:
            if 'age_min' in criteria and criteria['age_min'] is not None and user_age < criteria['age_min']:
                return False
            if 'age_max' in criteria and criteria['age_max'] is not None and user_age > criteria['age_max']:
                return False

        if criteria.get('gender') and (profile.gender is None or profile.gender not in criteria['gender']):
            return False

        # County evaluation for exact match in list (if counties is SelectMultipleField)
        if criteria.get('county'):
            if profile.county is None or profile.county not in criteria['county']:
                return False
        
        # City evaluation - revert to case-insensitive partial match for admin-defined list
        if criteria.get('city'): # criteria['city'] is a list of strings
            match = False
            if profile.city: # User has entered a city
                for c_val in criteria['city']: # c_val is one of the cities admin wants to match
                    if c_val.lower() in profile.city.lower(): # Partial, case-insensitive match
                        match = True
                        break
            if not match: return False
        
        if criteria.get('education_level') and \
           (profile.education_level is None or profile.education_level not in criteria['education_level']):
            return False

        if criteria.get('residence_environment') and \
           (profile.residence_environment is None or profile.residence_environment not in criteria['residence_environment']):
            return False

        return True