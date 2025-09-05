# Building APK for Driver Monitoring System

## Prerequisites

1. **Java Development Kit (JDK)**
   - Install JDK 17 or higher
   - Download from: https://adoptium.net/ or https://www.oracle.com/java/technologies/downloads/
   - Set JAVA_HOME environment variable

2. **Android Studio**
   - Download from: https://developer.android.com/studio
   - Install Android Studio with default settings
   - During installation, ensure Android SDK is installed

3. **Android SDK**
   - Open Android Studio → SDK Manager
   - Install:
     - Android SDK Platform 33 or higher
     - Android SDK Build-Tools
     - Android SDK Platform-Tools
     - Android SDK Command-line Tools

4. **Environment Variables** (Windows)
   ```
   ANDROID_HOME = C:\Users\[YourUsername]\AppData\Local\Android\Sdk
   PATH += %ANDROID_HOME%\platform-tools
   PATH += %ANDROID_HOME%\tools
   PATH += %ANDROID_HOME%\tools\bin
   ```

## Quick Build Commands

```bash
# Navigate to frontend directory
cd frontend

# Build the web app
npm run build

# Sync with Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android
```

## Step-by-Step APK Build Process

### 1. Configure Backend Connection

Before building, update the backend server IP in `frontend/src/config/mobile.ts`:

```typescript
const BACKEND_HOST = '192.168.1.100'; // Your computer's IP address
const BACKEND_PORT = '8000';
```

To find your IP address:
- Windows: `ipconfig` (look for IPv4 Address)
- Mac/Linux: `ifconfig` or `ip addr`

### 2. Build Production Version

```bash
cd frontend
npm run build
```

### 3. Sync with Capacitor

```bash
npx cap sync android
```

### 4. Build APK using Android Studio

#### Option A: Using Android Studio GUI

1. Run `npx cap open android` to open the project in Android Studio
2. Wait for Gradle sync to complete
3. From the menu: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
4. Wait for the build to complete
5. Click "locate" in the notification to find your APK
6. APK location: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

#### Option B: Using Command Line

```bash
cd frontend/android
./gradlew assembleDebug
```

On Windows:
```bash
cd frontend\android
gradlew.bat assembleDebug
```

### 5. Build Release APK (Signed)

#### Generate Keystore (First time only)

```bash
cd frontend/android/app
keytool -genkey -v -keystore driver-monitor.keystore -alias driver-monitor -keyalg RSA -keysize 2048 -validity 10000
```

Remember your keystore password and alias!

#### Configure Signing

Create `frontend/android/app/keystore.properties`:
```properties
storePassword=your_store_password
keyPassword=your_key_password
keyAlias=driver-monitor
storeFile=driver-monitor.keystore
```

#### Build Release APK

```bash
cd frontend/android
./gradlew assembleRelease
```

Release APK location: `frontend/android/app/build/outputs/apk/release/app-release.apk`

## Installing APK on Device

### Method 1: Direct USB Installation

1. Enable Developer Options on Android device:
   - Settings → About Phone → Tap "Build Number" 7 times
2. Enable USB Debugging:
   - Settings → Developer Options → USB Debugging
3. Connect device via USB
4. Install APK:
   ```bash
   adb install frontend/android/app/build/outputs/apk/debug/app-debug.apk
   ```

### Method 2: Manual Transfer

1. Copy APK to device (via USB, email, cloud storage)
2. On device: Settings → Security → Allow Unknown Sources
3. Open file manager and install APK

## Important Configuration Notes

### Network Permissions

The app requires these permissions (already configured in AndroidManifest.xml):
- INTERNET
- CAMERA
- ACCESS_NETWORK_STATE

### Backend Connectivity

For the app to connect to your backend:

1. **Same WiFi Network**: Ensure phone and computer are on the same network
2. **Firewall**: Allow port 8000 through Windows Firewall
3. **Backend Server**: Start with `python main.py --host 0.0.0.0`

### Testing Connectivity

Before building APK, test from mobile browser:
```
http://[YOUR_COMPUTER_IP]:8000/docs
```

If this works, the app should connect successfully.

## Troubleshooting

### Build Errors

1. **Gradle sync failed**
   - Check internet connection
   - File → Invalidate Caches and Restart

2. **SDK not found**
   - Verify ANDROID_HOME is set correctly
   - Install missing SDK components via SDK Manager

3. **Java version issues**
   - Ensure JDK 17+ is installed
   - Update JAVA_HOME environment variable

### Runtime Issues

1. **Camera not working**
   - Check camera permissions in device settings
   - Verify camera service implementation

2. **Cannot connect to backend**
   - Verify IP address in mobile.ts
   - Check firewall settings
   - Ensure backend is running with --host 0.0.0.0

3. **WebSocket connection failed**
   - Check CORS settings in backend
   - Verify WebSocket URL includes correct IP and port

## Development Tips

### Hot Reload During Development

For faster development iteration:

```bash
# Terminal 1: Run backend
cd backend
python main.py --host 0.0.0.0

# Terminal 2: Run frontend dev server
cd frontend
npm run dev

# Terminal 3: Run Capacitor live reload
npx cap run android --livereload --external
```

### Debug APK via Chrome DevTools

1. Enable USB debugging on device
2. Connect device via USB
3. Open Chrome: `chrome://inspect`
4. Select your app to open DevTools

## Production Deployment

### Optimize APK Size

1. Enable ProGuard in `android/app/build.gradle`:
```gradle
buildTypes {
    release {
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

2. Use App Bundle for Google Play:
```bash
./gradlew bundleRelease
```

### Cloud Backend Setup

For production, host your backend on a cloud service:
- AWS EC2
- Google Cloud Platform
- Azure
- DigitalOcean

Update `mobile.ts` with production server URL:
```typescript
const BACKEND_HOST = 'your-server.com';
const BACKEND_PORT = '443'; // Use HTTPS in production
```

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [React Native Camera](https://github.com/react-native-camera/react-native-camera)

## Support

If you encounter issues:
1. Check the [Capacitor Troubleshooting Guide](https://capacitorjs.com/docs/troubleshooting)
2. Review Android Studio logs
3. Check device logs: `adb logcat`