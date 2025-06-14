"""Firebase service for handling OAuth authentication."""
import firebase_admin
from firebase_admin import credentials, auth
from flask import current_app
import os


class FirebaseService:
    """Service for Firebase authentication."""
    
    _app = None
    
    @classmethod
    def initialize_app(cls, app=None):
        """Initialize Firebase Admin SDK."""
        if cls._app is None:
            try:
                # Try to get the service account key path from config
                service_account_path = app.config.get('FIREBASE_SERVICE_ACCOUNT_KEY_PATH') if app else None
                
                if service_account_path and os.path.exists(service_account_path):
                    # Use service account key file
                    cred = credentials.Certificate(service_account_path)
                    cls._app = firebase_admin.initialize_app(cred)
                    if app:
                        app.logger.info(f"Firebase initialized with service account: {service_account_path}")
                else:
                    # Try to use default credentials (for production/cloud environments)
                    try:
                        cred = credentials.ApplicationDefault()
                        cls._app = firebase_admin.initialize_app(cred)
                        if app:
                            app.logger.info("Firebase initialized with application default credentials")
                    except Exception as e:
                        if app:
                            app.logger.warning(f"Firebase initialization failed: {e}")
                            app.logger.warning("Firebase authentication will not be available")
                        cls._app = False  # Mark as failed
                        
            except Exception as e:
                if app:
                    app.logger.error(f"Firebase initialization error: {e}")
                cls._app = False
    
    @classmethod
    def verify_id_token(cls, id_token):
        """Verify Firebase ID token and return decoded token."""
        if cls._app is False:
            raise Exception("Firebase is not initialized")
        
        if cls._app is None:
            cls.initialize_app()
        
        try:
            decoded_token = auth.verify_id_token(id_token)
            return decoded_token
        except auth.InvalidIdTokenError as e:
            raise Exception(f"Invalid ID token: {e}")
        except Exception as e:
            raise Exception(f"Token verification failed: {e}")
    
    @classmethod
    def is_available(cls):
        """Check if Firebase is available."""
        return cls._app is not None and cls._app is not False