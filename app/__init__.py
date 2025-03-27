import os
from flask import Flask, request,session

from .extensions import db, migrate, login_manager, bcrypt, csrf,babel
from config import config
import pymysql
pymysql.install_as_MySQLdb()

def create_app(config_name=None):
    """Application factory for creating Flask instances."""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'default')
    
    # Create and configure the app
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    app.config["BABEL_TRANSLATION_DIRECTORIES"]='/home/andrei/Desktop/survey/app/translations'

    from .utils.date_utils import format_datetime_localized
    
    # Register with Jinja2
    app.jinja_env.globals.update(
        format_datetime_localized=format_datetime_localized
    )


    from .utils.translation_helpers import register_template_helpers
    register_template_helpers(app)

    # Initialize extensions
    register_extensions(app)
    
    # Register blueprints
    register_blueprints(app)
    
    # Register error handlers
    register_errorhandlers(app)
    
    return app


def register_extensions(app):
    """Register Flask extensions."""
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    bcrypt.init_app(app)
    csrf.init_app(app)

    def get_locale():

        if session.get('language'):
            lang=session['language']
        else:
            session['language']='ro'
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
    
    return None


def register_blueprints(app):
    """Register Flask blueprints."""
    from .views.main import main_blueprint
    from .views.auth import auth_blueprint
    from .views.admin import admin_blueprint
    from .views.surveys import surveys_blueprint
    from .views.rewards import rewards_blueprint
    
    app.register_blueprint(main_blueprint)
    app.register_blueprint(auth_blueprint, url_prefix='/auth')
    app.register_blueprint(admin_blueprint, url_prefix='/admin')
    app.register_blueprint(surveys_blueprint, url_prefix='/surveys')
    app.register_blueprint(rewards_blueprint, url_prefix='/rewards')
    
    return None


def register_errorhandlers(app):
    """Register error handlers."""
    from flask import render_template
    
    @app.errorhandler(401)
    def unauthorized(error):
        return render_template('errors/401.html'), 401
    
    @app.errorhandler(404)
    def page_not_found(error):
        return render_template('errors/404.html'), 404
    
    @app.errorhandler(500)
    def internal_server_error(error):
        return render_template('errors/500.html'), 500
    
    return None
