# app/utils/logging_utils.py
import logging
import json
import hashlib
from flask import request, g, current_app, has_request_context
from flask_login import current_user
import traceback
import time
from datetime import datetime
import os
from logging.handlers import RotatingFileHandler # Import RotatingFileHandler here

# ANSI color codes
COLORS = {
    'DEBUG': '\033[94m',    # Blue
    'INFO': '\033[92m',     # Green
    'WARNING': '\033[93m',  # Yellow
    'ERROR': '\033[91m',    # Red
    'CRITICAL': '\033[95m', # Magenta
    'RESET': '\033[0m',     # Reset color
    'BOLD': '\033[1m',      # Bold
    'UNDERLINE': '\033[4m'  # Underline
}

class ColoredFormatter(logging.Formatter):
    """
    Custom formatter to add color to log output based on level.
    """
    def __init__(self, fmt, datefmt=None, style='%'):
        super().__init__(fmt, datefmt, style)

    def format(self, record):
        """
        Format the log record, adding color codes.
        """
        log_message = super().format(record)
        level_color = COLORS.get(record.levelname, COLORS['RESET'])
        return f"{level_color}{log_message}{COLORS['RESET']}"


def setup_logging(app):
    """Configure comprehensive application logging."""
    # Clear any existing handlers to prevent duplicate logs in Flask's debug mode
    if app.logger.handlers:
        for handler in app.logger.handlers:
            app.logger.removeHandler(handler)
    if logging.root.handlers:
         for handler in logging.root.handlers:
            logging.root.removeHandler(handler)

    log_level = app.config.get('LOG_LEVEL', 'INFO')
    numeric_level = getattr(logging, log_level.upper(), None)

    # Define a common format
    log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    date_format = '%Y-%m-%d %H:%M:%S'

    # Configure handlers based on environment
    if app.config['TESTING']:
        # Minimal logging in test environment
        logging.basicConfig(level=numeric_level, format=log_format, datefmt=date_format)
    elif app.config['DEBUG']:
        # Console logging with color for development
        console_handler = logging.StreamHandler()
        console_handler.setLevel(numeric_level)
        console_formatter = ColoredFormatter(log_format, datefmt=date_format)
        console_handler.setFormatter(console_formatter)
        logging.root.addHandler(console_handler)
        logging.root.setLevel(numeric_level)
        # Ensure Flask's logger uses the root logger's handlers
        app.logger.handlers = [] # Clear existing handlers from app.logger
        app.logger.propagate = True # Allow logs to propagate to the root logger

    else:
        # Production logging to file with rotation
        log_dir = os.environ.get('LOG_DIR', 'logs')
        if not os.path.exists(log_dir):
            os.mkdir(log_dir)

        formatter = logging.Formatter(log_format, datefmt=date_format)

        # Set up application log
        app_handler = RotatingFileHandler(
            os.path.join(log_dir, 'app.log'),
            maxBytes=10485760,  # 10MB
            backupCount=10
        )
        app_handler.setFormatter(formatter)
        app_handler.setLevel(numeric_level)

        # Set up security log - separate file for security events
        security_handler = RotatingFileHandler(
            os.path.join(log_dir, 'security.log'),
            maxBytes=10485760,  # 10MB
            backupCount=20  # Keep more backups of security logs
        )
        security_handler.setFormatter(formatter)
        security_handler.setLevel(logging.INFO) # Security logs are INFO level or higher

        # Set up error log - separate file for errors
        error_handler = RotatingFileHandler(
            os.path.join(log_dir, 'error.log'),
            maxBytes=10485760,  # 10MB
            backupCount=20
        )
        error_handler.setFormatter(formatter)
        error_handler.setLevel(logging.ERROR)

        # Get root logger and add handlers
        root_logger = logging.getLogger()
        root_logger.setLevel(numeric_level)
        root_logger.addHandler(app_handler)
        root_logger.addHandler(error_handler)

        # Create security logger and add its handler
        security_logger = logging.getLogger('security')
        security_logger.setLevel(logging.INFO)
        security_logger.addHandler(security_handler)

        # Ensure Flask's logger also uses these handlers
        app.logger.handlers = [] # Clear existing handlers from app.logger
        app.logger.propagate = True # Allow logs to propagate to the root logger


    # Register logging middleware
    register_logging_middleware(app)

    # Register error handlers (although init_error_handlers in error_utils might override)
    register_error_logging(app)

    return app

def register_logging_middleware(app):
    """Register middleware for request/response logging."""
    @app.before_request
    def before_request():
        """Log request details and start timing."""
        g.start_time = time.time()

        if has_request_context():
            # Create a request ID for tracing
            # Using time.time() might not be unique enough under heavy load
            # A better approach might involve a UUID or a combination of identifiers
            g.request_id = hashlib.md5(
                f"{request.remote_addr}:{request.user_agent}:{time.time()}:{os.getpid()}".encode()
            ).hexdigest()[:12]

            # Log basic request info
            app.logger.info(
                "Request [%s]: %s %s - IP: %s, User-Agent: %s",
                g.request_id,
                request.method,
                request.path,
                request.remote_addr,
                request.user_agent
            )

            # Get user ID if authenticated
            user_id = current_user.id if current_user and not current_user.is_anonymous else 'anonymous'

            # Log additional details for sensitive operations
            # Exclude static file requests from this log
            if request.method != 'GET' and not request.path.startswith('/static/'):
                security_logger = logging.getLogger('security')
                security_logger.info(
                    "Operation [%s]: User %s performing %s on %s",
                    g.request_id,
                    user_id,
                    request.method,
                    request.path
                )


    @app.after_request
    def after_request(response):
        """Log response details and timing."""
        if hasattr(g, 'start_time'):
            duration = time.time() - g.start_time

            if has_request_context() and hasattr(g, 'request_id'):
                 # Exclude static file responses from this log
                if not request.path.startswith('/static/'):
                    app.logger.info(
                        "Response [%s]: %s %s - Status: %s, Duration: %.3fs",
                        g.request_id,
                        request.method,
                        request.path,
                        response.status_code,
                        duration
                    )

                    # Log slow requests (exclude static files)
                    if duration > current_app.config.get('SLOW_REQUEST_THRESHOLD', 1.0) and not request.path.startswith('/static/'):  # More than 1 second threshold from config
                        app.logger.warning(
                            "Slow Request [%s]: %s %s took %.3fs",
                            g.request_id,
                            request.method,
                            request.path,
                            duration
                        )

        return response

def register_error_logging(app):
    """Register error handlers for comprehensive error logging."""
    @app.errorhandler(Exception)
    def handle_exception(e):
        """Log unhandled exceptions."""
        # Check if headers have already been sent
        if request and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
             # For AJAX requests, just log and return a generic error
             pass # Error handling will be done by init_error_handlers

        if not hasattr(g, 'request_id'):
            g.request_id = hashlib.md5(str(time.time()).encode()).hexdigest()[:12] # Fallback request ID

        # Get user ID if possible
        user_id = current_user.id if current_user and not current_user.is_anonymous else 'anonymous'

        # Log detailed error information
        error_logger = logging.getLogger('error')
        error_logger.error(
            "Exception [%s]: %s - User: %s, URL: %s",
            g.request_id,
            str(e),
            user_id,
            request.path if has_request_context() else 'N/A',
            exc_info=True # Include traceback
        )

        # Log security relevant exceptions separately
        # Add more specific security-related exception types as needed
        if isinstance(e, (PermissionError, ValueError, TypeError, KeyError)) and has_request_context():
             # Also check for common web vulnerabilities exceptions like werkzeug.exceptions.BadRequest
             if isinstance(e, (PermissionError, ValueError)) or isinstance(e, current_app.extensions['csrf']._csrf_errors): # Check CSRF errors
                 security_logger = logging.getLogger('security')
                 security_logger.warning(
                     "Security Exception [%s]: %s - User: %s, URL: %s",
                     g.request_id,
                     str(e),
                     user_id,
                     request.path
                 )


        # Let the default error handlers (now handled by init_error_handlers) take care of the response
        return current_app.handle_exception(e)

# Security event logging functions
def log_auth_event(event_type, user_id, success, details=None):
    """
    Log authentication-related security events.

    Args:
        event_type: Type of event (login, logout, password_change, etc.)
        user_id: ID of the user involved
        success: Whether the operation succeeded
        details: Additional event details
    """
    logger = logging.getLogger('security')

    request_id = getattr(g, 'request_id', 'N/A')
    ip_address = request.remote_addr if has_request_context() else 'N/A'
    user_agent = request.user_agent.string if has_request_context() else 'N/A'

    log_data = {
        'timestamp': datetime.utcnow().isoformat(),
        'event_type': event_type,
        'user_id': user_id,
        'success': success,
        'request_id': request_id,
        'ip_address': ip_address,
        'user_agent': user_agent
    }

    if details:
        log_data['details'] = details

    logger.info("Auth Event: %s", json.dumps(log_data))

def log_data_access(resource_type, resource_id, user_id, action, details=None):
    """
    Log data access events for sensitive operations.

    Args:
        resource_type: Type of resource (user, survey, reward, etc.)
        resource_id: ID of the resource
        user_id: ID of the user performing the action
        action: Action performed (view, create, update, delete)
        details: Additional event details
    """
    logger = logging.getLogger('security')

    request_id = getattr(g, 'request_id', 'N/A')
    ip_address = request.remote_addr if has_request_context() else 'N/A'

    log_data = {
        'timestamp': datetime.utcnow().isoformat(),
        'event_type': 'data_access',
        'resource_type': resource_type,
        'resource_id': resource_id,
        'user_id': user_id,
        'action': action,
        'request_id': request_id,
        'ip_address': ip_address
    }

    if details:
        log_data['details'] = details

    # Log data access events at INFO level in security log
    logger.info("Data Access: %s", json.dumps(log_data))


def log_admin_action(user_id, action, target_type, target_id, details=None):
    """
    Log administrative actions for audit purposes.

    Args:
        user_id: ID of the admin user
        action: Action performed
        target_type: Type of the target (user, survey, reward, etc.)
        target_id: ID of the target
        details: Additional action details
    """
    logger = logging.getLogger('security')

    request_id = getattr(g, 'request_id', 'N/A')
    ip_address = request.remote_addr if has_request_context() else 'N/A'

    log_data = {
        'timestamp': datetime.utcnow().isoformat(),
        'event_type': 'admin_action',
        'user_id': user_id,
        'action': action,
        'target_type': target_type,
        'target_id': target_id,
        'request_id': request_id,
        'ip_address': ip_address
    }

    if details:
        log_data['details'] = details

    # Log admin actions at INFO level in security log
    logger.info("Admin Action: %s", json.dumps(log_data))