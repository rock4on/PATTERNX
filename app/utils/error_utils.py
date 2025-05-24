# app/utils/error_utils.py
import logging
import traceback
from functools import wraps
from flask import render_template, jsonify, request, current_app
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from werkzeug.exceptions import HTTPException

# Configure error logger
logger = logging.getLogger('error')

def init_error_handlers(app):
    """
    Register error handlers for the application.
    
    Args:
        app: Flask application instance
    """
    # Handle 400 Bad Request
    @app.errorhandler(400)
    def bad_request(error):
        return _handle_error(error, 'Bad request', 400)
    
    # Handle 401 Unauthorized
    @app.errorhandler(401)
    def unauthorized(error):
        return _handle_error(error, 'Unauthorized', 401, template='errors/401.html')
    
    # Handle 403 Forbidden
    @app.errorhandler(403)
    def forbidden(error):
        return _handle_error(error, 'Forbidden', 403, template='errors/403.html')
    
    # Handle 404 Not Found
    @app.errorhandler(404)
    def not_found(error):
        return _handle_error(error, 'Not found', 404, template='errors/404.html')
    
    # Handle 500 Internal Server Error
    @app.errorhandler(500)
    def server_error(error):
        return _handle_error(error, 'Server error', 500, template='errors/500.html')
    
    # Handle SQLAlchemy errors
    @app.errorhandler(SQLAlchemyError)
    def handle_sqlalchemy_error(error):
        logger.error(f"SQLAlchemy error: {error}")
        logger.debug(traceback.format_exc())
        
        # Handle specific database errors
        if isinstance(error, IntegrityError):
            if 'unique constraint' in str(error).lower():
                return _handle_error(error, 'Duplicate entry', 409)
            else:
                return _handle_error(error, 'Data integrity error', 422)
        
        # Generic database error
        return _handle_error(error, 'Database error', 500, template='errors/500.html')
    
    # Handle all other exceptions
    @app.errorhandler(Exception)
    def handle_exception(error):
        # Log the error with full traceback
        logger.error(f"Unhandled exception: {error}")
        logger.debug(traceback.format_exc())
        
        # Check if it's a built-in HTTP exception
        if isinstance(error, HTTPException):
            return _handle_error(error, error.description, error.code)
        
        # Unexpected error
        return _handle_error(error, 'An unexpected error occurred', 500, template='errors/500.html')
    
    return app

def _handle_error(error, default_message, status_code, template=None):
    """
    Handle an error consistently based on request type.
    
    Args:
        error: The error that occurred
        default_message: Default human-readable message
        status_code: HTTP status code to return
        template: Optional template to render for HTML responses
        
    Returns:
        Appropriate response based on request Accept header
    """
    error_response = {
        'error': default_message,
        'status_code': status_code
    }
    
    # Add error details in development, but not in production
    if current_app.debug:
        error_response['details'] = str(error)
    
    # Return JSON for API requests
    if request.is_json or request.headers.get('Accept') == 'application/json':
        return jsonify(error_response), status_code
    
    # Return HTML for browser requests
    if template:
        return render_template(template, error=error_response), status_code
    else:
        # Generic error page if no specific template
        return render_template('errors/generic.html', error=error_response), status_code

def handle_errors(f):
    """
    Decorator to handle errors in controller functions.
    
    Example:
        @auth_blueprint.route('/login', methods=['GET', 'POST'])
        @handle_errors
        def login():
            # Function code that might raise exceptions
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except HTTPException:
            # Let Flask's built-in error handlers handle HTTP exceptions
            raise
        except SQLAlchemyError as e:
            logger.error(f"Database error in {f.__name__}: {e}")
            logger.debug(traceback.format_exc())
            
            # Rollback any pending database changes
            from app.extensions import db
            db.session.rollback()
            
            if current_app.debug:
                # Show detailed error in development
                raise
            else:
                # Return friendly error in production
                if isinstance(e, IntegrityError):
                    if 'unique constraint' in str(e).lower():
                        return _handle_error(e, 'A record with this information already exists.', 409)
                    else:
                        return _handle_error(e, 'Data validation error.', 422)
                return _handle_error(e, 'A database error occurred.', 500, template='errors/500.html')
        except Exception as e:
            logger.error(f"Unhandled exception in {f.__name__}: {e}")
            logger.debug(traceback.format_exc())
            
            if current_app.debug:
                # Show detailed error in development
                raise
            else:
                # Return friendly error in production
                return _handle_error(e, 'An unexpected error occurred.', 500, template='errors/500.html')
    
    return decorated_function