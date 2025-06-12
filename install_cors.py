#!/usr/bin/env python3
"""
Quick script to install Flask-CORS and verify the setup.
"""
import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors."""
    print(f"Running: {description}")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} - Success")
            if result.stdout:
                print(f"Output: {result.stdout.strip()}")
        else:
            print(f"❌ {description} - Failed")
            print(f"Error: {result.stderr.strip()}")
            return False
        return True
    except Exception as e:
        print(f"❌ {description} - Exception: {e}")
        return False

def main():
    print("🔧 Setting up Flask-CORS for Survey App")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists('requirements.txt'):
        print("❌ Error: requirements.txt not found. Please run this script from the survey project root.")
        sys.exit(1)
    
    # Install Flask-CORS
    success = run_command(
        "pip install flask-cors", 
        "Installing Flask-CORS"
    )
    
    if not success:
        print("\n❌ Installation failed. Please try manually:")
        print("   pip install flask-cors")
        sys.exit(1)
    
    # Verify installation
    success = run_command(
        "python -c 'import flask_cors; print(f\"Flask-CORS version: {flask_cors.__version__}\")'",
        "Verifying Flask-CORS installation"
    )
    
    if success:
        print("\n🎉 Setup Complete!")
        print("\nNext steps:")
        print("1. Restart your Flask server:")
        print("   python run.py")
        print("\n2. Test both interfaces:")
        print("   - Flask Web UI: http://localhost:5000/auth/login")
        print("   - React Native Web: http://localhost:3000")
        print("\n3. Both should now work without CORS or CSRF errors!")
    else:
        print("\n❌ Verification failed. Please check the installation manually.")

if __name__ == "__main__":
    main()