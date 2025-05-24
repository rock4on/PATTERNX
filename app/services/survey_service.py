from datetime import datetime
from app.extensions import db
from app.models.survey import Survey, SurveyCompletion
from app.models.point import Point
from app.services.limesurvey import LimeSurveyAPI
from app.services.segment_service import SegmentService
from config import Config
from sqlalchemy import or_

class SurveyService:
    """Service for survey-related operations."""
    
    @staticmethod
    def is_user_in_survey(survey_id, user_id):
        """
        Check if a user is a participant in a specific LimeSurvey survey.
        
        Args:
            survey_id (int): LimeSurvey survey ID 
            user_id (int): User ID to check
        
        Returns:
            bool: True if user is in the survey, False otherwise
        """
        # Create LimeSurvey API instance
        api = LimeSurveyAPI(
            Config.LIMESURVEY_URL, 
            Config.LIMESURVEY_USERNAME, 
            Config.LIMESURVEY_PASSWORD
        )
        
        try:
            # Export all responses for the survey
            responses = api.export_responses(survey_id)
            
            # Convert user_id to string for comparison
            user_id_str = str(user_id)

            # Check if responses were successfully retrieved
            if isinstance(responses, dict) and 'responses' in responses:
                # Iterate through responses
                
                for response in responses['responses']:
                    # Check if the user ID matches the expected field
                    # You might need to adjust the exact field name based on your survey setup
                    if str(response.get('UID')) == user_id_str:
                        is_complete = api.check_response_complete(survey_id, response.get('ID'))
                        if is_complete:
                            return True,response.get('id')
            
            return False, None
        
        except Exception as e:
            print(f"Error checking user in survey: {e}")
            return False, None
        finally:
            # Ensure session key is released
            api.release_session_key()




    @staticmethod
    def sync_surveys():
        """
        Synchronize surveys from LimeSurvey.
        
        Returns:
            dict: Stats about sync operation
        """
        print('Functioneaza')
        api = LimeSurveyAPI(Config.LIMESURVEY_URL,Config.LIMESURVEY_USERNAME,Config.LIMESURVEY_PASSWORD)
        surveys = api.list_surveys()
        print('test')
        stats = {
            'added': 0,
            'updated': 0,
            'total': len(surveys) if surveys else 0
        }
        
        if not surveys:
            return stats
        
        for ls_survey in surveys:
            limesurvey_id = int(ls_survey['sid'])
            survey = Survey.query.filter_by(limesurvey_id=limesurvey_id).first()
            
            # Get detailed survey info
            details = api.get_survey_properties(limesurvey_id)
            
            if survey:
                # Update existing survey
                survey.title = ls_survey['surveyls_title']
                survey.description = details.get('description', '')
                survey.is_active = details.get('active', 'Y') == 'Y'
                
                if 'startdate' in details and details['startdate']:
                    try:
                        survey.start_date = datetime.strptime(details['startdate'], '%Y-%m-%d %H:%M:%S')
                    except ValueError:
                        pass
                
                if 'expires' in details and details['expires']:
                    try:
                        survey.end_date = datetime.strptime(details['expires'], '%Y-%m-%d %H:%M:%S')
                    except ValueError:
                        pass
                
                db.session.commit()
                stats['updated'] += 1
            else:
                # Create new survey
                new_survey = Survey(
                    limesurvey_id=limesurvey_id,
                    title=ls_survey['surveyls_title'],
                    description=details.get('description', ''),
                    is_active=details.get('active', 'Y') == 'Y'
                )
                
                if 'startdate' in details and details['startdate']:
                    try:
                        new_survey.start_date = datetime.strptime(details['startdate'], '%Y-%m-%d %H:%M:%S')
                    except ValueError:
                        pass
                
                if 'expires' in details and details['expires']:
                    try:
                        new_survey.end_date = datetime.strptime(details['expires'], '%Y-%m-%d %H:%M:%S')
                    except ValueError:
                        pass
                
                db.session.add(new_survey)
                db.session.commit()
                stats['added'] += 1
        
        return stats
    
    @staticmethod
    def get_available_surveys(user_id):
        """
        Get available surveys for a user, considering segments.
        """
        # Base query for active surveys within date range
        now = datetime.utcnow()
        base_query = Survey.query.filter(Survey.is_active == True)\
                                .filter(
                                    or_(Survey.start_date == None, Survey.start_date <= now)
                                )\
                                .filter(
                                    or_(Survey.end_date == None, Survey.end_date >= now)
                                )

        potential_surveys = base_query.all()
        available_surveys = []

        # Get IDs of surveys already completed by the user
        completed_survey_ids = {
            comp.survey_id for comp in SurveyCompletion.query.filter_by(user_id=user_id).with_entities(SurveyCompletion.survey_id).all()
        }

        for survey in potential_surveys:
            if survey.id in completed_survey_ids:
                continue # Skip if already completed

            # Segmentation Logic
            target_segments_for_survey = survey.target_segments.all() # Get Segment objects

            if target_segments_for_survey: # If the survey is targeted
                user_is_eligible_for_segmented_survey = False
                for segment in target_segments_for_survey:
                    if SegmentService.evaluate_user_for_segment(user_id, segment.id): #
                        user_is_eligible_for_segmented_survey = True
                        break # User matches at least one segment, so they are eligible

                if not user_is_eligible_for_segmented_survey:
                    continue # Skip survey if user doesn't match any target segment (hide from UI)
   
  #          else:
  #              continue        
            # If survey is not segmented OR user matches at least one of its target segments
            available_surveys.append(survey) #

        return available_surveys
    
    @staticmethod
    def record_completion(user_id, survey_id, limesurvey_response_id):
        """
        Record a survey completion and award points.
        
        Args:
            user_id: ID of the user
            survey_id: ID of the survey
            limesurvey_response_id: LimeSurvey response ID
            
        Returns:
            tuple: (success, message, completion)
        """
        # Check if response is valid and complete
        api = LimeSurveyAPI(Config.LIMESURVEY_URL,Config.LIMESURVEY_USERNAME,Config.LIMESURVEY_PASSWORD)

        survey = Survey.query.get(survey_id)
        
        if not survey:
            return False, "Survey not found", None
        
        # Check if user is actually in this survey
        is_in_survey, response_id= SurveyService.is_user_in_survey(survey.limesurvey_id, user_id)
        if not is_in_survey:
            return False, "User is not a participant in this survey", None

        # Check if already completed
        existing_completion = SurveyCompletion.query.filter_by(
            user_id=user_id,
            survey_id=survey_id
        ).first()
        
        if existing_completion:
            return False, "You have already completed this survey", None
        
        
        # Record completion
        completion = SurveyCompletion(
            user_id=user_id,
            survey_id=survey_id,
            limesurvey_response_id=limesurvey_response_id,
            points_awarded=survey.points_value
        )
        
        db.session.add(completion)
        db.session.commit()
        
        # Award points
        Point.award_points_for_survey(
            user_id=user_id,
            survey_completion_id=completion.id,
            survey_id=survey_id,
            points_amount=survey.points_value,
            description=f"Completed survey: {survey.title}"
        )
        
        return True, f"Survey completed! You earned {survey.points_value} points.", completion
    