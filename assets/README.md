# Glimpse App Assets

This directory contains the assets used in the Glimpse app. The following files need to be created:

## App Icons

### icon.png

- **Purpose**: Main app icon used across platforms
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Design Guidelines**:
  - Simple, recognizable design
  - Use the primary teal color (#4ECDC4) as the background
  - Include a simple camera or video icon in white
  - Keep adequate padding around the edges

### adaptive-icon.png

- **Purpose**: Adaptive icon for Android devices
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Design Guidelines**:
  - Similar to the main icon but designed to work with Android's adaptive icon system
  - The foreground image should be centered and take up about 66% of the total area
  - The background will be filled with the teal color (#4ECDC4) as specified in app.json

### favicon.png

- **Purpose**: Icon for web browser tabs
- **Size**: 32x32 pixels
- **Format**: PNG with transparency
- **Design Guidelines**:
  - Simplified version of the main icon
  - Should be recognizable even at small sizes

### notification-icon.png

- **Purpose**: Icon shown in notification trays
- **Size**: 96x96 pixels
- **Format**: PNG with transparency
- **Design Guidelines**:
  - Simple, monochrome design (white)
  - Transparent background
  - Should be recognizable in notification trays

## Splash Screen

### splash.png

- **Purpose**: Shown when the app is loading
- **Size**: 1242x2436 pixels (optimized for iPhone X and newer)
- **Format**: PNG with transparency
- **Design Guidelines**:
  - Center the app logo/name
  - Use the primary teal color (#4ECDC4) as the background (set in app.json)
  - Keep the design simple and clean
  - Include adequate padding for different screen sizes

## Additional Assets

### notification-sound.wav

- **Purpose**: Sound played when a notification is received
- **Format**: WAV audio file
- **Duration**: 1-2 seconds
- **Guidelines**:
  - Gentle, non-intrusive sound
  - Should be distinctive but not annoying
  - Keep the file size small

## Placeholder Images

The following placeholder images are used in the app for testing and development:

### placeholder-avatar.png

- **Purpose**: Default user avatar
- **Size**: 200x200 pixels
- **Format**: PNG with transparency
- **Design**: Simple user silhouette on a light gray background

### placeholder-group-cover.png

- **Purpose**: Default group cover image
- **Size**: 800x400 pixels
- **Format**: PNG or JPG
- **Design**: Abstract pattern or gradient using the app's color scheme

### placeholder-video-thumbnail.png

- **Purpose**: Default video thumbnail
- **Size**: 640x1136 pixels (16:9 aspect ratio)
- **Format**: PNG or JPG
- **Design**: Simple camera or play button icon on a dark background

## Design Guidelines

All assets should follow these general guidelines:

1. Use the app's color scheme:

   - Primary: #4ECDC4 (teal)
   - Accent: #FF6B6B (coral)
   - Highlight: #FFEB3B (muted yellow)
   - Neutrals: Various grays

2. Keep designs simple and recognizable

3. Ensure all assets are properly optimized for file size

4. Test assets on different devices and screen sizes

## Creating the Assets

You can create these assets using design tools like:

- Adobe Illustrator or Photoshop
- Figma
- Sketch
- Canva

For generating the different sizes required for various platforms, you can use tools like:

- [App Icon Generator](https://appicon.co/)
- [MakeAppIcon](https://makeappicon.com/)
- [Expo's Image Tools](https://docs.expo.dev/guides/icons/)
