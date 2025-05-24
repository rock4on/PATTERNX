"""Models package."""
from app.extensions import db
from .user import User  #
from .point import Point #
from .survey import Survey, SurveyCompletion #
from .reward import Reward, UserReward #
from .user_profile import UserProfile # Adaugă acest import
from .segment import Segment, survey_segment_association # Add this line
