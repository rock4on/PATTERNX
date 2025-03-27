from datetime import datetime
from flask_babel import format_datetime, format_date, format_time

def format_datetime_localized(dt, format='medium'):
    """
    Format a datetime object according to the current locale.
    
    Args:
        dt: The datetime object to format
        format: The format to use ('short', 'medium', 'long', 'full')
        
    Returns:
        Formatted datetime string
    """
    if not dt:
        return ""
    
    return format_datetime(dt, format)