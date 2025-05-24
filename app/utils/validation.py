# app/utils/validation.py

import re
import html
import bleach
from functools import wraps
from flask import request, abort, flash, redirect, url_for
from werkzeug.datastructures import MultiDict

# Allowed attributes and tags for HTML sanitization
ALLOWED_TAGS = [
    'a', 'abbr', 'acronym', 'b', 'blockquote', 'code', 'em', 'i', 'li', 'ol', 
    'strong', 'ul', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'br'
]

ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title', 'rel'],
    'abbr': ['title'],
    'acronym': ['title'],
}

# Validation patterns
PATTERNS = {
    'username': r'^[a-zA-Z0-9_-]{3,64}$',
    'email': r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$',
    'name': r'^[a-zA-Z\s\'-]{1,100}$',
    'uuid': r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
    'integer': r'^-?\d+$',
    'float': r'^-?\d+(\.\d+)?$',
    'phone': r'^\+?[0-9]{9,15}$'
}

def sanitize_string(value):
    """
    Sanitize a string by HTML-escaping it.
    
    Args:
        value: String to sanitize
        
    Returns:
        Sanitized string
    """
    if value is None:
        return None
    return html.escape(str(value))

def sanitize_html(value):
    """
    Sanitize a string that may contain HTML by keeping only allowed tags.
    
    Args:
        value: String to sanitize
        
    Returns:
        Sanitized HTML string
    """
    if value is None:
        return None
    return bleach.clean(
        str(value),
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        strip=True
    )

def validate_pattern(value, pattern_name):
    """
    Validate a string against a predefined pattern.
    
    Args:
        value: String to validate
        pattern_name: Name of the pattern to use
        
    Returns:
        True if valid, False otherwise
    """
    if value is None:
        return False
    
    pattern = PATTERNS.get(pattern_name)
    if not pattern:
        raise ValueError(f"Unknown validation pattern: {pattern_name}")
    
    return bool(re.match(pattern, str(value)))

def sanitize_request_data():
    """
    Decorator to sanitize request data.
    
    Sanitizes form data, query parameters, and JSON input.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Sanitize form data
            if request.form:
                sanitized_form = MultiDict()
                for key, value in request.form.items():
                    sanitized_form.add(key, sanitize_string(value))
                request.form = sanitized_form
            
            # Sanitize query parameters
            if request.args:
                sanitized_args = MultiDict()
                for key, value in request.args.items():
                    sanitized_args.add(key, sanitize_string(value))
                request.args = sanitized_args
            
            # Sanitize JSON data
            if request.is_json:
                json_data = request.get_json(silent=True)
                if json_data and isinstance(json_data, dict):
                    sanitized_json = {}
                    for key, value in json_data.items():
                        if isinstance(value, str):
                            sanitized_json[key] = sanitize_string(value)
                        else:
                            sanitized_json[key] = value
                    # Note: We can't modify request.json directly, but the
                    # sanitized data will be available via g.sanitized_json
                    from flask import g
                    g.sanitized_json = sanitized_json
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator