from functools import wraps
from flask import jsonify, request
from flask_login import current_user
import jwt
from datetime import datetime, timedelta
from app.models.user import User
from config import Config

def token_required(f):
    """Decorator to require JWT token for API endpoints."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
            
        try:
            if token.startswith('Bearer '):
                token = token.split(' ')[1]
            
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
            current_user_id = data['user_id']
            user = User.query.get(current_user_id)
            
            if not user or not user.is_active:
                return jsonify({'error': 'Token is invalid'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token is invalid'}), 401
            
        return f(current_user_id, *args, **kwargs)
    return decorated

def generate_token(user_id):
    """Generate JWT token for user."""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=30)
    }
    return jwt.encode(payload, Config.SECRET_KEY, algorithm='HS256')