# app/utils/translation_helpers.py

from flask import current_app, g
from flask_babel import get_locale

def get_locale_code():
    """Returns the current locale code."""
    return str(get_locale())

def is_locale(locale):
    """Check if the current locale matches the given locale."""
    return get_locale_code() == locale

def translate_date_format(format_string):
    """Translate date format patterns based on locale."""
    locale = get_locale_code()
    
    # Define format mappings for Romanian dates
    if locale == 'ro':
        # Replace month/day names with Romanian equivalents
        replacements = {
            'January': 'Ianuarie',
            'February': 'Februarie',
            'March': 'Martie',
            'April': 'Aprilie',
            'May': 'Mai',
            'June': 'Iunie',
            'July': 'Iulie',
            'August': 'August',
            'September': 'Septembrie',
            'October': 'Octombrie',
            'November': 'Noiembrie',
            'December': 'Decembrie',
            
            'Jan': 'Ian',
            'Feb': 'Feb',
            'Mar': 'Mar',
            'Apr': 'Apr',
            'May': 'Mai',
            'Jun': 'Iun',
            'Jul': 'Iul',
            'Aug': 'Aug',
            'Sep': 'Sep',
            'Oct': 'Oct',
            'Nov': 'Noi',
            'Dec': 'Dec',
            
            'Monday': 'Luni',
            'Tuesday': 'Marți',
            'Wednesday': 'Miercuri',
            'Thursday': 'Joi',
            'Friday': 'Vineri',
            'Saturday': 'Sâmbătă',
            'Sunday': 'Duminică',
            
            'Mon': 'Lun',
            'Tue': 'Mar',
            'Wed': 'Mie',
            'Thu': 'Joi',
            'Fri': 'Vin',
            'Sat': 'Sâm',
            'Sun': 'Dum',
        }
        
        for eng, rom in replacements.items():
            format_string = format_string.replace(eng, rom)
            
    return format_string

def get_language_name(code):
    """Get the display name of a language from its code."""
    language_names = {
        'en': 'English',
        'ro': 'Română'
    }
    return language_names.get(code, code)

# Make these functions available to templates
def register_template_helpers(app):
    """Register translation helper functions with the Flask app."""
    app.jinja_env.globals.update(
        get_locale_code=get_locale_code,
        is_locale=is_locale,
        translate_date_format=translate_date_format,
        get_language_name=get_language_name
    )