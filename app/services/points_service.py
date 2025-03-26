from app.extensions import db
from app.models.point import Point
from app.models.user import User


class PointsService:
    """Service for points-related operations."""
    
    @staticmethod
    def get_user_points_history(user_id):
        """
        Get a user's points history.
        
        Args:
            user_id: ID of the user
            
        Returns:
            list: Points history records
        """
        return Point.query.filter_by(user_id=user_id).order_by(Point.created_at.desc()).all()
    
    @staticmethod
    def get_user_points_summary(user_id):
        """
        Get a summary of a user's points.
        
        Args:
            user_id: ID of the user
            
        Returns:
            dict: Points summary
        """
        user = User.query.get(user_id)
        if not user:
            return {
                'total_points': 0,
                'available_points': 0,
                'spent_points': 0
            }
        
        # Get total points
        total_points = db.session.query(db.func.sum(Point.amount)).filter(
            Point.user_id == user_id,
            Point.amount > 0
        ).scalar() or 0
        
        # Get spent points
        spent_points = db.session.query(db.func.sum(Point.amount * -1)).filter(
            Point.user_id == user_id,
            Point.amount < 0,
            Point.is_spent == True
        ).scalar() or 0
        
        # Calculate available points
        available_points = total_points - spent_points
        
        return {
            'total_points': total_points,
            'available_points': available_points,
            'spent_points': spent_points
        }
    
    @staticmethod
    def award_bonus_points(user_id, amount, description):
        """
        Award bonus points to a user.
        
        Args:
            user_id: ID of the user
            amount: Amount of points to award
            description: Description of the bonus
            
        Returns:
            Point: The created Point instance
        """
        if amount <= 0:
            return None
            
        point = Point(
            user_id=user_id,
            amount=amount,
            source='bonus',
            description=description
        )
        
        db.session.add(point)
        db.session.commit()
        
        return point
    
    @staticmethod
    def award_points_to_multiple_users(user_ids, amount, description):
        """
        Award points to multiple users.
        
        Args:
            user_ids: List of user IDs
            amount: Amount of points to award
            description: Description of the bonus
            
        Returns:
            int: Number of users who received points
        """
        if amount <= 0:
            return 0
            
        count = 0
        for user_id in user_ids:
            point = Point(
                user_id=user_id,
                amount=amount,
                source='bonus',
                description=description
            )
            
            db.session.add(point)
            count += 1
            
        db.session.commit()
        
        return count
