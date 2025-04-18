# Glimpse - Video-Based Social App

Glimpse is a video-based social app focused on helping people maintain connections with friends, partners, and family who are geographically distant. Unlike traditional social media, Glimpse is designed for authentic sharing among people who genuinely care about each other's lives but can't be together physically.

![Glimpse App](https://via.placeholder.com/800x400?text=Glimpse+App)

## 🌟 Core Concept

Glimpse allows users to share short video updates (up to 90 seconds) within private groups of close connections. The app features a TikTok/Reels-style vertical video feed as the primary viewing experience, with content organized by private groups rather than public following.

## 👥 Target Users

- Long-distance couples
- Friends who moved to different cities/countries
- Families spread across multiple locations
- Remote teams who want to maintain personal connections

## ✨ Key Features

### User Authentication & Profiles
- Email signup and login
- Simple profile with name, photo, and timezone
- User settings and preferences

### Group Management
- Create named private groups (e.g., "Family", "College Friends")
- Invite members via link, email, or phone number
- Group customization (cover photo, description)
- Group membership management

### Vertical Video Feed
- TikTok/Reels-style full-screen vertical feed
- Swipe up/down to navigate between videos
- Group filtering at top of feed
- Auto-playing videos with custom player controls
- Progress indicators showing position in feed

### Video Creation
- In-app recording with front/back camera toggle
- 90-second maximum recording length
- Basic enhancement features (lighting adjustment)
- Caption input and group selection
- Upload progress and background uploading

### Engagement Features
- Like/heart reactions
- Comment section
- Short video replies
- Notifications for new videos and engagement

### Daily Prompts
- Optional daily questions/prompts (e.g., "Share something that made you smile today")
- Highlight prompted videos in feed
- Prompt notification reminders

### Notifications
- Push notifications for new videos from connections
- Activity notifications (reactions, comments)
- Daily prompt reminders
- Notification preferences and controls

## 🛠️ Technology Stack

- **Frontend**: React Native for cross-platform mobile development
- **Backend**: Firebase (Authentication, Firestore, Storage, Cloud Functions)
- **Video Processing**: Expo Camera and AV libraries
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Firebase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/glimpse.git
   cd glimpse
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a Firebase project and add your configuration to `src/services/firebase/config.ts`.

4. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

5. Run on your preferred platform:
   ```bash
   # For iOS
   npm run ios
   # For Android
   npm run android
   # For web
   npm run web
   ```

## 📁 Project Structure

```
glimpse/
├── assets/             # Static assets (images, fonts)
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── common/     # Common UI components
│   │   ├── video/      # Video-related components
│   │   └── groups/     # Group-related components
│   ├── screens/        # App screens
│   │   ├── auth/       # Authentication screens
│   │   ├── feed/       # Video feed screens
│   │   ├── groups/     # Group management screens
│   │   ├── profile/    # User profile screens
│   │   └── recording/  # Video recording screens
│   ├── navigation/     # Navigation configuration
│   ├── services/       # API and service functions
│   │   └── firebase/   # Firebase service functions
│   ├── store/          # Redux store configuration
│   │   └── slices/     # Redux slices
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Utility functions
│   ├── constants/      # App constants
│   └── types/          # TypeScript type definitions
├── App.tsx             # Main app component
└── index.ts            # Entry point
```

## 🎨 UI/UX Design

Glimpse features a clean, warm, and personal aesthetic that's not overly flashy or performative. The color scheme includes:

- Soft teal primary (#4ECDC4)
- Warm coral accent (#FF6B6B)
- Neutral grays
- Muted yellow highlight (#FFEB3B)

## 📱 Key Screens

- Vertical Video Feed
- Group Management
- Video Recording
- Comments & Reactions
- Profile & Settings
- Onboarding

## 🔒 Privacy & Security

Glimpse prioritizes user privacy:

- All groups are private by default
- Content is only visible to group members
- Users have full control over their data
- Videos can be deleted at any time

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📬 Contact

For any questions or feedback, please reach out to [your-email@example.com](mailto:your-email@example.com).

---

Built with ❤️ for keeping people connected.