# Survey App API Documentation

This API provides endpoints for a React Native app to interact with the survey platform. All endpoints return JSON responses and use JWT authentication where required.

## Base URL
```
http://your-server.com/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### POST /auth/login
Login user and receive JWT token.

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

**Response (200):**
```json
{
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
        "id": 1,
        "email": "user@example.com",
        "username": "johndoe",
        "first_name": "John",
        "last_name": "Doe",
        "total_points": 150,
        "available_points": 120
    }
}
```

#### POST /auth/register
Register new user account.

**Request Body:**
```json
{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe"
}
```

**Response (201):**
```json
{
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
        "id": 1,
        "email": "user@example.com",
        "username": "johndoe",
        "first_name": "John",
        "last_name": "Doe",
        "total_points": 0,
        "available_points": 0
    }
}
```

### User Profile

#### GET /user/profile
Get user profile information. **Requires authentication.**

**Response (200):**
```json
{
    "user": {
        "id": 1,
        "email": "user@example.com",
        "username": "johndoe",
        "first_name": "John",
        "last_name": "Doe",
        "total_points": 150,
        "available_points": 120,
        "created_at": "2024-01-15T10:30:00"
    },
    "profile": {
        "date_of_birth": "1990-05-15",
        "gender": "Male",
        "county": "Bucharest",
        "city": "Bucharest",
        "education_level": "Bachelor",
        "residence_environment": "Urban",
        "age": 34
    }
}
```

#### PUT /user/profile
Update user profile. **Requires authentication.**

**Request Body:**
```json
{
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1990-05-15",
    "gender": "Male",
    "county": "Bucharest",
    "city": "Bucharest",
    "education_level": "Bachelor",
    "residence_environment": "Urban"
}
```

**Response (200):**
```json
{
    "message": "Profile updated successfully"
}
```

### Surveys

#### GET /surveys
Get available surveys for the authenticated user. **Requires authentication.**

**Response (200):**
```json
{
    "surveys": [
        {
            "id": 1,
            "limesurvey_id": 123456,
            "title": "Customer Satisfaction Survey",
            "description": "Help us improve our services",
            "points_value": 25,
            "start_date": "2024-01-01T00:00:00",
            "end_date": "2024-12-31T23:59:59",
            "total_completions": 45
        }
    ]
}
```

#### GET /surveys/{id}
Get detailed information about a specific survey. **Requires authentication.**

**Response (200):**
```json
{
    "survey": {
        "id": 1,
        "limesurvey_id": 123456,
        "title": "Customer Satisfaction Survey",
        "description": "Help us improve our services",
        "points_value": 25,
        "start_date": "2024-01-01T00:00:00",
        "end_date": "2024-12-31T23:59:59",
        "is_available": true,
        "total_completions": 45,
        "completed_by_user": false
    }
}
```

#### POST /surveys/{id}/complete
Mark a survey as completed. **Requires authentication.**

**Request Body:**
```json
{
    "limesurvey_response_id": 789
}
```

**Response (200):**
```json
{
    "message": "Survey completed successfully",
    "points_awarded": 25
}
```

### Rewards

#### GET /rewards
Get available rewards. **Requires authentication.**

**Response (200):**
```json
{
    "rewards": [
        {
            "id": 1,
            "name": "Gift Card 50 RON",
            "description": "Amazon gift card worth 50 RON",
            "points_cost": 100,
            "image_url": "https://example.com/image.jpg",
            "quantity_available": 10,
            "quantity_redeemed": 3,
            "is_available": true,
            "can_afford": true
        }
    ]
}
```

#### POST /rewards/{id}/redeem
Redeem a reward. **Requires authentication.**

**Response (200):**
```json
{
    "message": "Reward redeemed successfully!",
    "redemption": {
        "id": 1,
        "points_spent": 100,
        "status": "pending",
        "created_at": "2024-01-15T14:30:00"
    }
}
```

#### GET /user/rewards
Get user's reward redemption history. **Requires authentication.**

**Response (200):**
```json
{
    "redemptions": [
        {
            "id": 1,
            "reward": {
                "id": 1,
                "name": "Gift Card 50 RON",
                "description": "Amazon gift card worth 50 RON"
            },
            "points_spent": 100,
            "status": "completed",
            "notes": null,
            "created_at": "2024-01-15T14:30:00"
        }
    ]
}
```

### Points

#### GET /user/points
Get user's points summary and transaction history. **Requires authentication.**

**Response (200):**
```json
{
    "summary": {
        "total_points": 150,
        "available_points": 120,
        "spent_points": 30
    },
    "history": [
        {
            "id": 1,
            "amount": 25,
            "source": "survey",
            "description": "Completed survey: Customer Satisfaction Survey",
            "is_spent": false,
            "created_at": "2024-01-15T10:30:00"
        },
        {
            "id": 2,
            "amount": -100,
            "source": "reward",
            "description": "Redeemed reward: Gift Card 50 RON",
            "is_spent": true,
            "created_at": "2024-01-15T14:30:00"
        }
    ]
}
```

### Dashboard

#### GET /dashboard
Get dashboard data with user stats and recent activity. **Requires authentication.**

**Response (200):**
```json
{
    "user": {
        "first_name": "John",
        "total_points": 150,
        "available_points": 120
    },
    "stats": {
        "available_surveys": 5,
        "completed_surveys": 3,
        "total_rewards": 2
    },
    "recent_activity": [
        {
            "type": "points",
            "amount": 25,
            "description": "Completed survey: Customer Satisfaction Survey",
            "created_at": "2024-01-15T10:30:00"
        }
    ]
}
```

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
    "error": "Bad Request",
    "message": "The request could not be understood."
}
```

### 401 Unauthorized
```json
{
    "error": "Unauthorized",
    "message": "Authentication required."
}
```

### 403 Forbidden
```json
{
    "error": "Forbidden",
    "message": "You do not have permission to access this resource."
}
```

### 404 Not Found
```json
{
    "error": "Not Found",
    "message": "The requested resource was not found."
}
```

### 500 Internal Server Error
```json
{
    "error": "Internal Server Error",
    "message": "An unexpected error occurred."
}
```

## React Native Integration Tips

1. **Store JWT Token**: Save the JWT token in AsyncStorage after login
2. **Add Authorization Header**: Include the token in all API requests
3. **Handle Token Expiration**: Implement token refresh or redirect to login
4. **Error Handling**: Display user-friendly messages for API errors
5. **Loading States**: Show loading indicators during API calls

### Example React Native Code

```javascript
// Store token after login
await AsyncStorage.setItem('authToken', response.token);

// Add to API requests
const token = await AsyncStorage.getItem('authToken');
const response = await fetch('http://your-server.com/api/surveys', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});
```