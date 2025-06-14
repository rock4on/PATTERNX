# app/__init__.py
import os
from flask import Flask, request, session, g

from .extensions import db, migrate, login_manager, bcrypt, csrf, babel, cors
from config import config
import pymysql
pymysql.install_as_MySQLdb()

# Import the security utilities
from .utils.security_utils import configure_security_headers, set_secure_session
from .utils.error_utils import init_error_handlers # Import error handler utility
from .utils.logging_utils import setup_logging # Import logging utility


def create_app(config_name=None):
    """Application factory for creating Flask instances."""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'default')

    # Create and configure the app
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    app.config["BABEL_TRANSLATION_DIRECTORIES"]='/home/andrei/Desktop/survey/app/translations'

    # Setup logging early in the app creation process
    setup_logging(app)

    from .utils.date_utils import format_datetime_localized

    # Register with Jinja2
    app.jinja_env.globals.update(
        format_datetime_localized=format_datetime_localized
    )


    from .utils.translation_helpers import register_template_helpers
    register_template_helpers(app)

    # Initialize extensions
    register_extensions(app)

    # Initialize Firebase
    from .services.firebase_service import FirebaseService
    FirebaseService.initialize_app(app)

    # Register blueprints
    register_blueprints(app)

    # Register comprehensive error handlers
    # This replaces the basic error handlers defined below
    init_error_handlers(app)

    # Configure security headers and session protection
    configure_security_headers(app)

    # You might also want to apply request data sanitization globally
    # from .utils.validation import sanitize_request_data
    # Uncomment the line below to sanitize all request data before processing
    # app.before_request(sanitize_request_data())
    # Be aware of potential side effects and test thoroughly if enabling global sanitization.

    return app


def register_extensions(app):
    """Register Flask extensions."""
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    bcrypt.init_app(app)
    
    # Configure CORS for API endpoints
    cors.init_app(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001","*"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
            "supports_credentials": True
        }
    })
    
    # Initialize CSRF protection with configuration
    csrf.init_app(app)
    
    # Configure CSRF settings
    app.config['WTF_CSRF_ENABLED'] = True
    app.config['WTF_CSRF_CHECK_DEFAULT'] = True
    
    # Override CSRF protection to skip API routes
    original_protect = csrf.protect
    
    def protect_with_api_exemption():
        # Skip CSRF protection for API routes
        if request.endpoint and request.endpoint.startswith('api.'):
            return
        return original_protect()
    
    csrf.protect = protect_with_api_exemption

    def get_locale():
        # Prevent session modification during session protection checks to avoid loops
        if hasattr(g, '_protecting_session') and g._protecting_session:
            return session.get('language', 'ro')
        
        if session.get('language'):
            return session['language']
        else:
            # Only set language if not in protection mode
            session['language'] = 'ro'
        return session['language']
    # Configure the login manager
    from .models.user import User

    babel.init_app(app,locale_selector=get_locale)




    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this page.'
    login_manager.login_message_category = 'info'

    # Hook into Flask-Login's user_logged_in signal to set secure session attributes
    from flask_login import user_logged_in
    @user_logged_in.connect_via(app)
    def _user_logged_in(sender, user):
        set_secure_session(session, user.id)

    return None


def register_blueprints(app):
    """Register Flask blueprints."""
    from .views.main import main_blueprint
    from .views.auth import auth_blueprint
    from .views.admin import admin_blueprint
    from .views.surveys import surveys_blueprint
    from .views.rewards import rewards_blueprint
    from .api.api import api

    app.register_blueprint(main_blueprint)
    app.register_blueprint(auth_blueprint, url_prefix='/auth')
    app.register_blueprint(admin_blueprint, url_prefix='/admin')
    app.register_blueprint(surveys_blueprint, url_prefix='/surveys')
    app.register_blueprint(rewards_blueprint, url_prefix='/rewards')
    app.register_blueprint(api)
    
    # API routes will be handled without CSRF tokens

    return None


def register_errorhandlers(app):
    """Register error handlers."""
    # These basic error handlers are now less critical as init_error_handlers
    # from error_utils provides more comprehensive and centralized handling.
    # You can remove this function entirely if init_error_handlers covers all desired error codes.
    from flask import render_template

    @app.errorhandler(401)
    def unauthorized(error):
        # The handler in error_utils will likely be called first
        return render_template('errors/401.html'), 401

    @app.errorhandler(404)
    def page_not_found(error):
        # The handler in error_utils will likely be called first
        return render_template('errors/404.html'), 404

    @app.errorhandler(500)
    def internal_server_error(error):
         # The handler in error_utils will likely be called first
        return render_template('errors/500.html'), 500

    return None