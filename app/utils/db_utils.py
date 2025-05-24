# app/utils/db_utils.py
from functools import wraps
from flask import current_app
from sqlalchemy.exc import SQLAlchemyError
from app.extensions import db
import logging

# Create a logger for database operations
logger = logging.getLogger('database')

def transactional(f):
    """
    Decorator to wrap a function in a database transaction.
    Automatically commits on success and rolls back on exception.
    
    Usage:
        @transactional
        def my_function():
            # Database operations here
            user = User(...)
            db.session.add(user)
            # No need to commit - decorator will handle it
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            # Execute the function with automatic commit on success
            result = f(*args, **kwargs)
            db.session.commit()
            return result
        except Exception as e:
            # Roll back the transaction on any exception
            db.session.rollback()
            
            # Log the error
            logger.error(f"Database transaction error in {f.__name__}: {str(e)}")
            
            # Re-raise the exception
            raise
    return decorated_function

def with_transaction(session=None):
    """
    Context manager for database transactions with explicit session.
    
    Usage:
        with with_transaction() as session:
            user = User(...)
            session.add(user)
            # No need to commit - context manager will handle it
    """
    from contextlib import contextmanager
    
    @contextmanager
    def transaction_context():
        session = session or db.session
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Database transaction error: {str(e)}")
            raise
            
    return transaction_context()

def safe_get_or_404(model, id, user_id=None, admin_only=False):
    """
    Safely retrieve a model instance by ID with access control.
    
    Args:
        model: SQLAlchemy model class
        id: ID of the instance to retrieve
        user_id: User ID to check ownership against (optional)
        admin_only: Whether only admins can access this resource
        
    Returns:
        Model instance or raises 404
    """
    from flask import abort
    from flask_login import current_user
    
    # Check admin access if required
    if admin_only and not current_user.is_admin:
        logger.warning(f"Non-admin user {current_user.id} attempted to access admin-only resource {model.__name__}:{id}")
        abort(403)
    
    # Retrieve the instance
    instance = model.query.get_or_404(id)
    
    # Check ownership if user_id is provided
    if user_id is not None and hasattr(instance, 'user_id'):
        if instance.user_id != user_id and not current_user.is_admin:
            logger.warning(f"User {current_user.id} attempted to access unauthorized resource {model.__name__}:{id}")
            abort(403)
    
    return instance