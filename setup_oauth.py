#!/usr/bin/env python3
"""
OAuth Setup Script for Survey Platform
=====================================

This script sets up OAuth authentication with Firebase for the survey platform.

Prerequisites:
1. Firebase project created with Authentication enabled
2. Firebase service account key downloaded (optional, for enhanced security)
3. Python virtual environment activated

Setup Steps:
1. Install required dependencies
2. Run database migration
3. Configure environment variables
4. Test Firebase connection

Usage:
    python setup_oauth.py [--install-deps] [--migrate] [--test]
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path

def install_dependencies():
    """Install required Python dependencies."""
    print("📦 Installing Firebase Admin SDK...")
    try:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'firebase-admin>=6.0.0'])
        print("✅ Firebase Admin SDK installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def run_migration():
    """Run database migration to add OAuth fields."""
    print("🗄️ Running database migration...")
    try:
        # Check if Flask app can be imported
        from flask import Flask
        from app import create_app
        from flask_migrate import upgrade
        
        app = create_app()
        with app.app_context():
            upgrade()
        print("✅ Database migration completed successfully")
        return True
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        print("💡 Try running manually: flask db upgrade")
        return False

def test_firebase_setup():
    """Test Firebase configuration."""
    print("🔥 Testing Firebase setup...")
    try:
        from app.services.firebase_service import FirebaseService
        from app import create_app
        
        app = create_app()
        with app.app_context():
            FirebaseService.initialize_app(app)
            if FirebaseService.is_available():
                print("✅ Firebase is configured and ready")
                return True
            else:
                print("⚠️ Firebase is not configured (this is okay for testing)")
                print("💡 To enable Firebase:")
                print("   1. Download service account key from Firebase Console")
                print("   2. Set FIREBASE_SERVICE_ACCOUNT_KEY_PATH environment variable")
                print("   3. Or deploy to a cloud environment with default credentials")
                return True
    except Exception as e:
        print(f"❌ Firebase test failed: {e}")
        return False

def show_configuration_guide():
    """Show configuration guide for environment variables."""
    print("\n📋 Configuration Guide")
    print("=" * 50)
    print("Add these environment variables to your .env file:")
    print()
    print("# Firebase Configuration (optional)")
    print("FIREBASE_SERVICE_ACCOUNT_KEY_PATH=/path/to/your/firebase-service-account.json")
    print()
    print("💡 Tips:")
    print("1. Download the service account key from Firebase Console > Project Settings > Service Accounts")
    print("2. Place the JSON file in a secure location outside your project directory")
    print("3. Set the full path in FIREBASE_SERVICE_ACCOUNT_KEY_PATH")
    print("4. For production, use Google Cloud default credentials instead")
    print()

def main():
    parser = argparse.ArgumentParser(description='Setup OAuth authentication for Survey Platform')
    parser.add_argument('--install-deps', action='store_true', help='Install required dependencies')
    parser.add_argument('--migrate', action='store_true', help='Run database migration')
    parser.add_argument('--test', action='store_true', help='Test Firebase configuration')
    parser.add_argument('--all', action='store_true', help='Run all setup steps')
    
    args = parser.parse_args()
    
    print("🚀 OAuth Setup for Survey Platform")
    print("=" * 40)
    
    success = True
    
    if args.all or args.install_deps:
        success &= install_dependencies()
        print()
    
    if args.all or args.migrate:
        success &= run_migration()
        print()
    
    if args.all or args.test:
        success &= test_firebase_setup()
        print()
    
    if args.all or not any([args.install_deps, args.migrate, args.test]):
        show_configuration_guide()
    
    if success:
        print("🎉 OAuth setup completed successfully!")
        print("\n📍 Next steps:")
        print("1. Configure Firebase Console authentication providers")
        print("2. Update frontend with Web Client ID for Google Sign-In")
        print("3. Test OAuth flow end-to-end")
    else:
        print("❌ Some setup steps failed. Please check the errors above.")
        sys.exit(1)

if __name__ == '__main__':
    main()