# CORS Setup for React Native Web

## Issue Fixed
The React Native web app (localhost:3000) was unable to communicate with the Flask API (localhost:5000) due to CORS (Cross-Origin Resource Sharing) restrictions.

## What Was Done

### 1. Added Flask-CORS Dependency
- Added `flask-cors` to `requirements.txt`
- This allows the Flask backend to accept requests from different origins

### 2. Configured CORS in Flask App
- Added CORS configuration in `app/__init__.py`
- Allowed origins: `http://localhost:3000` and `http://127.0.0.1:3000`
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed headers: Content-Type, Authorization

### 3. Exempted API Routes from CSRF Protection
- API routes are now exempt from CSRF tokens
- This allows the React Native web app to make API calls without CSRF tokens

## Setup Instructions

1. **Install the new dependency:**
```bash
cd /home/andrei/Desktop/survey
pip install flask-cors
```

2. **Restart your Flask development server:**
```bash
python run.py
```

3. **Start your React Native web app:**
```bash
cd react-native-frontend
npm run web
```

## Testing

Now you should be able to:
- ✅ Register new users from the web app
- ✅ Login from the web app
- ✅ Make API calls without CORS errors
- ✅ Use all features that work on mobile

## CORS Configuration Details

The CORS configuration allows:
- **Origins**: localhost:3000 (React Native web dev server)
- **Methods**: All HTTP methods needed for the API
- **Headers**: Content-Type and Authorization headers
- **API Routes**: All routes under `/api/*` are CORS-enabled

This setup ensures your React Native web app can communicate with the Flask backend seamlessly!