# app/utils/security_utils.py
from flask import Flask, request, g, session, redirect, url_for,current_app, flash
from functools import wraps
import time
import secrets
import logging

# Set up security logger
logger = logging.getLogger('security')

def configure_security_headers(app):
    """
    Configure secure HTTP headers for the Flask application.
    
    Args:
        app: Flask application instance
    """
    @app.after_request
    def add_security_headers(response):
        """Add security headers to all responses."""
        # Content Security Policy
        # Customize this based on your application's needs
        csp_directives = {
            'default-src': ["'self'"],
            'script-src': [
                "'self'", 
                "https://cdn.jsdelivr.net",        # For Bootstrap, Chart.js
                "https://code.jquery.com",        # For jQuery
                "https://cdnjs.cloudflare.com",   # For Font Awesome
                "https://unpkg.com",              # For Leaflet
                "'unsafe-inline'"                 # To allow your inline script with data (consider nonce for better security)
            ],
            'style-src': [
                "'self'", 
                "https://cdn.jsdelivr.net",        # For Bootstrap
                "https://cdnjs.cloudflare.com",   # For Font Awesome
                "https://unpkg.com",              # For Leaflet CSS
                "'unsafe-inline'"                 # Often needed for Bootstrap or other libraries' dynamic styles
            ],
            'img-src': ["'self'", "data:", "https:", "https://*.tile.openstreetmap.org"], # Added openstreetmap for tiles
            'font-src': ["'self'", "https://cdnjs.cloudflare.com"], # For Font Awesome fonts
            'connect-src': ["'self'"], # If your scripts make XHR/fetch requests
            'frame-src': ["'self'"],   # If you use iframes
            'object-src': ["'none'"],
            'base-uri': ["'self'"]
        }
        
        # Convert to CSP header format
        csp_string = '; '.join([f"{key} {' '.join(value)}" for key, value in csp_directives.items()])
        response.headers['Content-Security-Policy'] = csp_string
        
        # X-Content-Type-Options to prevent MIME sniffing
        response.headers['X-Content-Type-Options'] = 'nosniff'
        
        # X-Frame-Options to prevent clickjacking
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'
        
        # X-XSS-Protection
        response.headers['X-XSS-Protection'] = '1; mode=block'
        
        # Referrer Policy
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Feature Policy / Permissions Policy
        response.headers['Permissions-Policy'] = (
            'camera=(), microphone=(), geolocation=(), interest-cohort=()'
        )
        
        # HTTP Strict Transport Security (HSTS)
        # Only enable in production with HTTPS
        if not app.debug and not app.testing and app.config.get('SECURE_COOKIES', True):
            response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        # Cache control for sensitive pages
        if request.path.startswith('/auth/') or request.path.startswith('/admin/'):
            response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'
        
        return response
    
    # Configure sessions
    app.config.update(
        # Set session cookie flags
        SESSION_COOKIE_SECURE=app.config.get('SECURE_COOKIES', True),
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE='Lax',
        PERMANENT_SESSION_LIFETIME=3600,  # 1 hour
        
        # CSRF protection
        WTF_CSRF_ENABLED=True,
        WTF_CSRF_TIME_LIMIT=3600,  # 1 hour
        
        # Ensure secret key is strong
        SECRET_KEY=app.config.get('SECRET_KEY') or secrets.token_hex(32)
    )
    
    # Add session protection
    @app.before_request
    def protect_session():
        # Folosește current_app.logger pentru consistență și pentru a te asigura că e logger-ul aplicației
        current_app.logger.info(f"PROTECT_SESSION: path '{request.path}'")

        # Folosește cheia setată de Flask-Login pentru verificarea principală a existenței utilizatorului în sesiune
        user_id_in_session = session.get('_user_id') # Verifică cheia Flask-Login

        if user_id_in_session:
            current_app.logger.info(f"PROTECT_SESSION: Found '_user_id' {user_id_in_session} in session. Full session: {dict(session)}")

            # Verifică dacă 'created_at' există în sesiune; acest câmp este setat de set_secure_session
            if 'created_at' not in session: #
                current_app.logger.warning(f"PROTECT_SESSION: Session for user {user_id_in_session} missing 'created_at'. Clearing session. IP: {request.remote_addr}")
                session.clear() #
                flash('Your session was invalid, please log in again.', 'warning')
                return redirect(url_for('auth.login')) #

            # Verifică vârsta sesiunii
            session_age = time.time() - session['created_at'] #
            max_age = current_app.config.get('PERMANENT_SESSION_LIFETIME', 3600) #
            current_app.logger.info(f"PROTECT_SESSION: Session age: {session_age:.2f}s, Max age: {max_age}s for user {user_id_in_session}")

            if session_age > max_age: #
                current_app.logger.info(f"PROTECT_SESSION: Session expired for user {user_id_in_session}. Clearing session. IP: {request.remote_addr}")
                session.clear() #
                flash('Your session has expired, please log in again.', 'info')
                return redirect(url_for('auth.login')) #

            # Verifică schimbarea IP-ului
            # Compară cu atenție, request.remote_addr poate fi None în anumite contexte (deși rar)
            session_ip = session.get('ip') #
            request_ip = request.remote_addr
            if session_ip and request_ip and session_ip != request_ip: #
                current_app.logger.warning(f"PROTECT_SESSION: IP change detected for user {user_id_in_session}. Session IP: {session_ip}, Request IP: {request_ip}. Clearing session.")
                session.clear() #
                flash('Session IP changed, please log in again for security.', 'warning')
                return redirect(url_for('auth.login')) #

            # Verifică schimbarea User-Agent-ului
            session_ua = session.get('user_agent') #
            request_ua = request.user_agent.string if request.user_agent else ""
            if session_ua and request_ua and session_ua != request_ua: #
                current_app.logger.warning(f"PROTECT_SESSION: User-agent change detected for user {user_id_in_session}. Session UA: '{session_ua}', Request UA: '{request_ua}'. Clearing session.")
                session.clear() #
                flash('Session user agent changed, please log in again for security.', 'warning')
                return redirect(url_for('auth.login')) #
        else:
            current_app.logger.info("PROTECT_SESSION: No '_user_id' in session prior to accessing protected route.")





    return app

def set_secure_session(session_obj, user_id_from_signal): # Am redenumit 'session' pentru a evita conflictul cu 'session' importat
    current_app.logger.info(f"SET_SECURE_SESSION: Modifying session for user_id {user_id_from_signal}.")
    current_app.logger.info(f"SET_SECURE_SESSION: Session *before* adding custom attributes: {dict(session_obj)}")

    # NU șterge sesiunea: session_obj.clear() <--- Comentează sau șterge această linie

    # Adaugă atributele custom necesare pentru protect_session
    # Flask-Login a setat deja session_obj['_user_id'] și session_obj['_fresh']
    session_obj['created_at'] = time.time()
    session_obj['ip'] = request.remote_addr # Asigură-te că 'request' este disponibil (importă from flask import request)
    session_obj['user_agent'] = request.user_agent.string if request.user_agent else ""
    session_obj['custom_session_id'] = secrets.token_hex(16) # O cheie custom, dacă e necesară

    # Verifică dacă protect_session se bazează pe 'user_id' sau '_user_id'.
    # Logul tău arăta că protect_session căuta 'user_id'.
    # Pentru a menține compatibilitatea cu protect_session existent, poți adăuga și 'user_id'.
    # Ideal ar fi ca protect_session să folosească '_user_id'.
    session_obj['user_id_for_protect_session'] = str(user_id_from_signal) # Cheie distinctă pentru claritate

    current_app.logger.info(f"SET_SECURE_SESSION: Session *after* adding custom attributes: {dict(session_obj)}")