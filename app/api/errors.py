from flask import jsonify
from app.api.api import api

@api.errorhandler(400)
def bad_request(error):
    """Handle bad request errors."""
    return jsonify({
        'error': 'Bad Request',
        'message': str(error.description) if error.description else 'The request could not be understood.'
    }), 400

@api.errorhandler(401)
def unauthorized(error):
    """Handle unauthorized errors."""
    return jsonify({
        'error': 'Unauthorized',
        'message': 'Authentication required.'
    }), 401

@api.errorhandler(403)
def forbidden(error):
    """Handle forbidden errors."""
    return jsonify({
        'error': 'Forbidden',
        'message': 'You do not have permission to access this resource.'
    }), 403

@api.errorhandler(404)
def not_found(error):
    """Handle not found errors."""
    return jsonify({
        'error': 'Not Found',
        'message': 'The requested resource was not found.'
    }), 404

@api.errorhandler(500)
def internal_error(error):
    """Handle internal server errors."""
    return jsonify({
        'error': 'Internal Server Error',
        'message': 'An unexpected error occurred.'
    }), 500

@api.errorhandler(Exception)
def handle_exception(error):
    """Handle all other exceptions."""
    return jsonify({
        'error': 'Server Error',
        'message': 'An unexpected error occurred.'
    }), 500