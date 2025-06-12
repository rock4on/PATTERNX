# Survey App - React Native Frontend

A React Native application for the survey platform with Material Design 3 UI components.

## Features

- 🔐 **Authentication**: Login and registration with JWT tokens
- 📊 **Dashboard**: Overview of points, surveys, and rewards
- 📝 **Surveys**: Browse and complete available surveys
- 🎁 **Rewards**: Redeem points for rewards
- 👤 **Profile**: Manage user profile and view activity
- 🎨 **Material Design 3**: Modern, accessible UI components
- 📱 **Cross-platform**: Works on iOS, Android, and Web
- 🌐 **React Native Web**: Same codebase runs on web browsers
- 📱 **Responsive Design**: Adapts to different screen sizes
- ⚡ **Hot Reloading**: Fast development on all platforms

## Tech Stack

- **React Native** 0.72.6
- **React Native Web** 0.19.9 (Web compatibility)
- **React Native Paper** 5.11.3 (Material Design 3)
- **React Navigation** 6.x
- **TypeScript** for type safety
- **Webpack** 5.x (Web bundling)
- **Axios** for API communication
- **AsyncStorage** for local data persistence

## Getting Started

### Prerequisites

- Node.js 16 or higher
- React Native development environment set up
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **For iOS (macOS only):**
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Configure API endpoint:**
   Update the `BASE_URL` in `src/services/apiService.ts` with your server URL:
   ```typescript
   const BASE_URL = 'http://your-server.com/api';
   ```

### Running the App

### Mobile Development

1. **Start Metro bundler:**
   ```bash
   npm start
   ```

2. **Run on Android:**
   ```bash
   npm run android
   ```

3. **Run on iOS:**
   ```bash
   npm run ios
   ```

### Web Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start web development server:**
   ```bash
   npm run web
   ```
   This will start the webpack dev server on http://localhost:3000

3. **Build for web production:**
   ```bash
   npm run web:build
   ```
   This creates a production build in the `dist/` folder

4. **Serve production build locally:**
   ```bash
   npm run web:serve
   ```

## Project Structure

```
src/
├── contexts/           # React contexts (Auth, etc.)
├── navigation/         # Navigation configuration
├── screens/           # Screen components
│   ├── auth/          # Authentication screens
│   ├── main/          # Main app screens
│   └── profile/       # Profile-related screens
├── services/          # API and external services
├── theme/             # Material Design 3 theme
└── types/             # TypeScript type definitions
```

## Screens

### Authentication
- **LoginScreen**: User login with email/password
- **RegisterScreen**: New user registration

### Main App
- **DashboardScreen**: Home screen with overview
- **SurveysScreen**: Browse and complete surveys
- **RewardsScreen**: Browse rewards and view redemptions
- **ProfileScreen**: User profile and account info
- **EditProfileScreen**: Edit user profile information

## API Integration

The app communicates with the Flask backend through the following endpoints:

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/surveys` - Get available surveys
- `POST /api/surveys/{id}/complete` - Complete survey
- `GET /api/rewards` - Get available rewards
- `POST /api/rewards/{id}/redeem` - Redeem reward
- `GET /api/dashboard` - Get dashboard data

## Material Design 3

The app follows Material Design 3 principles:

- **Dynamic Color**: Adaptive color scheme
- **Typography**: Material Design 3 type scale
- **Components**: Paper components with MD3 styling
- **Navigation**: Bottom tabs with proper iconography
- **Elevation**: Proper shadows and surfaces

## State Management

- **AuthContext**: Manages user authentication state
- **Local Storage**: AsyncStorage for token persistence
- **API Service**: Centralized API communication

## Development

### Code Style
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type checking

### Testing
```bash
npm test
```

## Building for Production

### Android
```bash
cd android
./gradlew assembleRelease
```

### iOS
1. Open `ios/SurveyApp.xcworkspace` in Xcode
2. Select your device/simulator
3. Product → Archive

## Environment Configuration

Create environment-specific configurations:

1. **Development**: Point to local development server
2. **Staging**: Point to staging server
3. **Production**: Point to production server

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx react-native start --reset-cache`
2. **Android build issues**: Clean project with `cd android && ./gradlew clean`
3. **iOS build issues**: Clean build folder in Xcode

### API Connection Issues

1. Ensure your API server is running
2. Check network permissions in app
3. Verify API endpoint URLs
4. Check for CORS issues on the server

## Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Test on both iOS and Android
4. Update documentation as needed

## License

This project is part of the Survey Platform application.