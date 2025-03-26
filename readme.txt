# Survey Platform

A professional Flask application for managing surveys, points, and rewards. This platform integrates with LimeSurvey and features a comprehensive rewards and points system.

## Features

- User authentication (registration, login, profiles)
- Admin dashboard for platform management
- LimeSurvey integration for survey handling
- Points system for completed surveys
- Rewards marketplace for point redemption
- Mobile-responsive design

## Project Structure

The application follows a professional Flask structure:

```
survey_platform/
│
├── app/                      # Application package
│   ├── models/               # Database models
│   ├── views/                # Route handlers
│   ├── services/             # Business logic
│   ├── forms/                # WTForms
│   ├── templates/            # Jinja2 templates
│   └── static/               # CSS, JS, images
│
├── migrations/               # Database migrations
├── tests/                    # Test suite
├── config.py                 # Configuration settings
├── requirements.txt          # Project dependencies
└── run.py                    # Application entry point
```

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/survey-platform.git
   cd survey-platform
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file based on `.env.example` and configure your environment variables:
   ```
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Initialize the database:
   ```
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

6. Run the application:
   ```
   flask run
   ```

## LimeSurvey Integration

This platform integrates with LimeSurvey's Remote Control API. To set up:

1. Ensure your LimeSurvey instance has the Remote Control API enabled
2. Configure the API credentials in your `.env` file:
   ```
   LIMESURVEY_URL=https://your-limesurvey-instance.com/admin/remotecontrol
   LIMESURVEY_USERNAME=your-username
   LIMESURVEY_PASSWORD=your-password
   ```

## Database Configuration

The application uses MySQL by default but can be configured to use other databases:

1. Ensure you have the appropriate database server installed and running
2. Configure the database connection in your `.env` file:
   ```
   DB_USERNAME=root
   DB_PASSWORD=password
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=survey_platform
   ```

## User Roles

- **Regular Users**: Can register, log in, complete surveys, earn points, and redeem rewards
- **Administrators**: Full access to admin dashboard, can manage users, surveys, and rewards

## Points System

- Users earn points for completing surveys
- Points can be redeemed for rewards
- Admins can configure point values for each survey
- Bonus points can be awarded manually by administrators

## Deployment

To deploy to a production environment:

1. Set up a production server (using NGINX, Apache, etc.)
2. Configure environment variables for production:
   ```
   FLASK_ENV=production
   SECRET_KEY=your-secure-secret-key
   ```
3. Use Gunicorn for WSGI server:
   ```
   gunicorn run:app
   ```

## License

[MIT License](LICENSE)

## Support

For any questions or support, please contact [your-email@example.com](mailto:your-email@example.com).
