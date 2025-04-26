# Sticky Hands - Mobile Web App

A mobile-friendly web app version of the Sticky Hands game that can be installed on smartphones.

## Setup

1. Clone this repository
2. Generate the app icons and splash screens:
   ```
   npm install sharp fs-extra
   node create-icons.js
   ```
3. Serve the app with your preferred web server

## Installation Instructions for Users

### iOS (iPhone/iPad)
1. Open Safari and navigate to the game URL
2. Tap the Share button (square with an arrow)
3. Scroll down and tap "Add to Home Screen"
4. Name the app and tap "Add"
5. The app will now appear on your home screen with its icon

### Android
1. Open Chrome and navigate to the game URL
2. Tap the menu button (three dots)
3. Tap "Add to Home screen" or "Install app"
4. Follow the prompts to add the app to your home screen

## Features
- Full-screen experience (no browser UI)
- Works offline after the first visit
- App icon on home screen
- Splash screen during loading
- Native app-like experience

## Development Notes
- The `manifest.json` file defines the app metadata for Android devices
- iOS specific meta tags are added in the HTML head
- Service worker provides offline capabilities
- Icons are available in multiple sizes for different devices 