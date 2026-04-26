# Gully

Gully is a beginner-friendly React Native + Firebase mobile app for finding teammates for games like cricket, football, badminton, basketball, and volleyball.

## Main features

- Register and login with Firebase Authentication
- Create a game post with sport, address, time, and player limit
- View open games on the home screen
- Search and filter games by sport or address
- Send a request to join a game
- Let the game creator accept or reject requests
- Store app data in Firebase Firestore
- Get real-time updates from Firestore listeners

## Folder structure

```text
mad/
|-- App.js
|-- app.json
|-- babel.config.js
|-- package.json
|-- firestore.rules
|-- .env
|-- .env.example
`-- src/
    |-- components/
    |   |-- GameCard.js
    |   |-- InputField.js
    |   |-- PrimaryButton.js
    |   |-- RequestCard.js
    |   `-- SectionTitle.js
    |-- config/
    |   `-- firebase.js
    |-- constants/
    |   `-- sports.js
    |-- context/
    |   `-- AuthContext.js
    |-- navigation/
    |   `-- AppNavigator.js
    |-- screens/
    |   |-- CreateGameScreen.js
    |   |-- GameDetailsScreen.js
    |   |-- HomeScreen.js
    |   |-- LoginScreen.js
    |   |-- ProfileScreen.js
    |   `-- RegisterScreen.js
    |-- services/
    |   `-- gameService.js
    |-- theme/
    |   `-- colors.js
    `-- utils/
        `-- date.js
```

## Setup

### 1. Install dependencies

Run this inside the `mad` folder:

```powershell
npm install
```

### 2. Create Firebase project

1. Open Firebase Console
2. Create a new project
3. Enable `Authentication`
4. Enable `Email/Password` sign in
5. Create a Firestore database
6. Add a web app in project settings
7. Copy the Firebase config values

### 3. Fill `.env`

Open [.env](/c:/Users/ml907/OneDrive/Desktop/mad/.env:1) and replace the placeholder values with your Firebase values.

Example:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=xxxx
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxx
EXPO_PUBLIC_FIREBASE_PROJECT_ID=xxxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxx
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxx
EXPO_PUBLIC_FIREBASE_APP_ID=xxxx
```

### 4. Firestore rules

Open Firestore rules and paste the content from [firestore.rules](/c:/Users/ml907/OneDrive/Desktop/mad/firestore.rules:1).

### 5. Run the app

```powershell
npm start
```

Then open it in Expo Go or an Android emulator.

## Firestore data structure

`users/{uid}`

```json
{
  "uid": "user id",
  "name": "player name",
  "email": "user email"
}
```

`games/{gameId}`

```json
{
  "creatorId": "uid",
  "creatorName": "Rahul",
  "sport": "Cricket",
  "gameTime": "2026-04-26T17:30:00.000Z",
  "locationName": "Shivaji Park, Dadar, Mumbai",
  "maxPlayers": 10,
  "playerCount": 1,
  "status": "open"
}
```

`games/{gameId}/requests/{userId}`

```json
{
  "userId": "joining user id",
  "userName": "Aman",
  "status": "pending"
}
```

## Screen explanation

### Login

- User enters email and password
- Firebase Auth signs the user in

### Register

- User creates an account
- User profile is saved in Firestore

### Home

- App listens to Firestore in real time
- User can search by address or sport
- User can filter by sport chips

### Create Game

- Organizer chooses sport
- Organizer selects time
- Organizer types ground name or address
- Game is saved to Firestore

### Game Details

- Shows sport, address, time, and player count
- Player can send join request
- Creator can accept or reject requests

### Profile

- Shows logged in user name and email
- Logout button is available

## UI ideas

- Use rounded white cards on a light grey background
- Keep buttons bold and easy to tap
- Use blue as the main action color
- Use chips for sports
- Keep the layout simple and clean for demo day

## Notes

- This version does not use Google Maps
- This version does not use device GPS
- Firebase is still required because login and game data come from Firebase
- I could not run `npm install` in this environment, so you still need to install packages locally
