# Expense Tracker Mobile App

A React Native mobile application for tracking and splitting expenses with friends, built with Expo.

## Features

- 🔐 **Authentication**: Secure login and registration with JWT tokens
- 💰 **Expense Management**: Create, view, and track expenses
- 👥 **Friend System**: Add friends, manage friend requests, and search for users
- 💬 **Real-time Chat**: Chat with friends in real-time
- 📊 **Dashboard**: View expense statistics and quick actions
- 📱 **Cross-platform**: Works on iOS, Android, and Web

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Backend server running on `http://localhost:8080`

## Installation

1. Navigate to the project directory:
   ```bash
   cd C:\Users\A\Desktop\eTracker\expenseTrackerMobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the App

1. Start the Expo development server:
   ```bash
   npm start
   ```

2. Choose how to run the app:
   - Press `w` to open in web browser
   - Press `a` to open in Android emulator
   - Press `i` to open in iOS simulator (Mac only)
   - Scan the QR code with Expo Go app on your phone

## Configuration

### API Base URL

The API base URL is configured in `src/config/constants.js`:

```javascript
export const API_BASE_URL = 'http://localhost:8080';
```

**For testing on a physical device**, update this to your computer's local IP address:

```javascript
export const API_BASE_URL = 'http://192.168.1.XXX:8080';
```

To find your local IP:
- Windows: Run `ipconfig` in Command Prompt
- Mac/Linux: Run `ifconfig` in Terminal

### Backend CORS Configuration

The backend has been updated to allow connections from:
- `http://localhost:8081` (Expo default)
- `http://192.168.*.*:8081` (Local network)
- `http://10.*.*.*:8081` (Local network)

## Project Structure

```
expenseTrackerMobile/
├── App.js                      # Main app entry point
├── src/
│   ├── config/
│   │   └── constants.js        # App constants and configuration
│   ├── context/
│   │   └── AuthContext.js      # Authentication context
│   ├── navigation/
│   │   ├── AuthNavigator.js    # Auth screens navigation
│   │   └── MainNavigator.js    # Main app navigation
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   ├── expenses/
│   │   │   ├── CreateExpenseScreen.js
│   │   │   ├── MyExpensesScreen.js
│   │   │   ├── ExpenseRequestsScreen.js
│   │   │   └── ExpenseDetailsScreen.js
│   │   ├── friends/
│   │   │   └── FriendsListScreen.js
│   │   ├── chat/
│   │   │   ├── ConversationsScreen.js
│   │   │   └── ChatScreen.js
│   │   ├── DashboardScreen.js
│   │   └── ProfileScreen.js
│   └── services/
│       └── api.js              # API service layer
├── package.json
└── app.json
```

## Features Overview

### Authentication
- Login with username and password
- Register new account with optional profile picture
- JWT token-based authentication
- Automatic token refresh

### Dashboard
- View total amount owed and to receive
- Quick access to all features
- Expense statistics

### Expense Management
- Create new expenses with multiple participants
- View all expenses you've created
- See expenses where you're a participant
- Mark expenses as paid
- Split expenses equally among friends

### Friend System
- Search for users by name or email
- Send and receive friend requests
- Accept or reject friend requests
- Remove friends
- View all friends list

### Chat
- Real-time messaging with friends
- View conversation history
- Message notifications
- User avatars and names

## Dependencies

- **expo**: React Native framework
- **@react-navigation**: Navigation library
- **axios**: HTTP client
- **@react-native-async-storage/async-storage**: Local storage
- **expo-image-picker**: Image selection
- **react-native-gifted-chat**: Chat UI components

## Troubleshooting

### Issues starting the app

1. **"ExpoMetroConfig.loadAsync is not a function" error**:
   - This happens when using the global `expo-cli`.
   - Use `npx expo start` instead of `expo start`.

2. **Dependency warnings**:
   - Run `npx expo install --fix` to ensure all packages match your Expo SDK version.

### Cannot connect to backend

1. **Verify Backend Status**:
   - Ensure the server is running on port 8080.
   - Check the server logs for any exceptions or timeouts.

2. **Network Configuration**:
   - Update `API_BASE_URL` in `src/config/constants.js` to your local IP (e.g., `http://192.168.1.XXX:8080`) if testing on a physical device.
   - Ensure your firewall allows connections to port 8080.

3. **CORS Issues**:
   - If you see CORS errors in the debug console, verify the backend `SecurityConfig.java` allows `http://localhost:8081` (or your device's IP).

### Image upload not working

1. Grant camera/photo library permissions when prompted
2. Check that Cloudinary is configured in the backend

### Chat not loading

1. Verify WebSocket endpoint is accessible at `/ws/**`
2. Check network connectivity
3. Ensure conversation is created before sending messages

## Building for Production

### Android
```bash
expo build:android
```

### iOS
```bash
expo build:ios
```

## License

This project is part of the Expense Tracker application.
