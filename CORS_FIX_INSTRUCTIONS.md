# Fix CORS and CSRF Issues

## What Was Done

### 1. Added Flask-CORS Support
- Added `flask-cors` to requirements.txt
- Configured CORS to allow React Native web app (localhost:3000) to access Flask API (localhost:5000)

### 2. Fixed CSRF Protection
- Properly exempted API routes from CSRF protection
- Maintained CSRF protection for regular web forms
- Created missing error template

### 3. Created Missing Template
- Added `app/templates/errors/generic.html` for proper error handling

## Setup Instructions

### Step 1: Install Flask-CORS
```bash
cd /home/andrei/Desktop/survey
pip install flask-cors
```

### Step 2: Restart Flask Server
```bash
# Stop the current Flask server (Ctrl+C)
# Then restart it:
python run.py
```

### Step 3: Test Both Interfaces

**Test Flask Web UI:**
1. Go to http://localhost:5000/auth/login
2. Try logging in with existing credentials
3. Should work without CSRF errors

**Test React Native Web:**
1. Go to http://localhost:3000
2. Try registering or logging in
3. Should work without CORS errors

## Expected Results

### ✅ Flask Web UI:
- Login/Register forms work properly
- CSRF protection enabled for web forms
- No CSRF token missing errors

### ✅ React Native Web:
- API calls work without CORS errors
- Registration and login work
- All features functional

## Troubleshooting

If you still get CSRF errors on the Flask web UI:

1. **Clear browser cache and cookies:**
   - Go to browser settings
   - Clear cache and cookies for localhost:5000

2. **Check form template:**
   - Ensure `{{ form.hidden_tag() }}` is present in login.html (it is)

3. **Restart Flask server:**
   - Stop with Ctrl+C
   - Start again with `python run.py`

If you still get CORS errors on React Native Web:

1. **Verify Flask-CORS is installed:**
   ```bash
   pip list | grep Flask-CORS
   ```

2. **Check Flask server console:**
   - Look for CORS-related logs
   - Ensure server restarted after installing flask-cors

3. **Test with curl:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test"}'
   ```

## Architecture Summary

- **Flask Web UI** (localhost:5000): Traditional web forms with CSRF protection
- **React Native Web** (localhost:3000): SPA that makes API calls to Flask backend
- **Flask API** (/api/*): CORS-enabled, CSRF-exempt endpoints for React Native
- **Mobile Apps**: Use the same Flask API endpoints as the web version

Both interfaces can coexist and work simultaneously!