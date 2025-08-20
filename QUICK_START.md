# 🚀 Quick Start Guide - Driver Monitoring System

## Prerequisites
- Python 3.8-3.10
- Node.js 16+
- Webcam connected to your computer

## Step 1: Backend Setup

### 1.1 Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 1.2 Start the Backend Server
```bash
python main.py
```

The backend will start on `http://localhost:8000`

### 1.3 Create Demo User (Optional)
Open a new terminal and run:
```bash
cd backend
python create_demo_user.py
```

This will create a demo user with:
- Username: `demo_driver`
- Password: `demo123`

## Step 2: Frontend Setup

### 2.1 Install Frontend Dependencies
Open a new terminal:
```bash
cd frontend
npm install
```

### 2.2 Start the Frontend Development Server
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## Step 3: Using the Application

### 3.1 First Time Setup

1. **Open Browser**: Navigate to `http://localhost:3000`
2. **Register** (if you didn't create demo user):
   - Click "Sign up"
   - Fill in your details
   - Choose role (Driver/Supervisor/Admin)
   - Click "Sign Up"

3. **Login**:
   - Use demo credentials or your registered account
   - Username: `demo_driver`
   - Password: `demo123`

### 3.2 Start Monitoring

1. **Allow Camera Access**: When prompted, allow browser to access your webcam
2. **Calibrate**:
   - Position yourself naturally in front of camera
   - Look straight at the screen
   - Click "Calibrate" button
3. **Start Monitoring**:
   - Click "Start Monitoring" button
   - System will begin real-time detection

### 3.3 View Analytics

- **Alert History**: Click "Alert History" in navigation
- **Analytics**: Click "Analytics" to view dashboard
- **Settings**: Adjust detection thresholds

## 🔧 Troubleshooting

### Backend Issues

#### Error: "Module not found"
```bash
pip install sqlalchemy python-jose[cryptography] passlib[bcrypt] email-validator
```

#### Port 8000 already in use
Change port in `backend/main.py`:
```python
uvicorn.run(app, host="0.0.0.0", port=8001)  # Change to different port
```

### Frontend Issues

#### Blank screen or "Something went wrong"
1. Check browser console (F12)
2. Clear browser cache and cookies
3. Ensure backend is running
4. Re-install dependencies:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### Cannot connect to backend
1. Ensure backend is running on port 8000
2. Check CORS settings in backend
3. Try clearing localStorage:
   - Open browser console (F12)
   - Run: `localStorage.clear()`
   - Refresh page

### Authentication Issues

#### 401 Unauthorized errors
1. Clear browser storage:
```javascript
localStorage.clear()
```
2. Login again

#### WebSocket not connecting
1. Check if token exists:
```javascript
console.log(localStorage.getItem('access_token'))
```
2. Ensure backend WebSocket is running

## 📊 Features Overview

### For Drivers
- Real-time drowsiness detection
- Distraction monitoring
- Alert notifications
- Personal analytics dashboard

### For Supervisors
- View multiple driver statistics
- Export reports
- Risk assessment
- Historical data analysis

## 🔐 Security Notes

For production deployment:
1. Change `SECRET_KEY` in `backend/auth/security.py`
2. Use PostgreSQL instead of SQLite
3. Enable HTTPS
4. Implement rate limiting

## 📱 Browser Compatibility

Recommended browsers:
- Chrome (latest)
- Firefox (latest)
- Edge (latest)

## 💡 Tips

1. **Best Lighting**: Ensure good lighting on your face
2. **Camera Position**: Place camera at eye level
3. **Distance**: Sit 50-70cm from camera
4. **Calibration**: Re-calibrate if you change position

## 📞 Support

For issues or questions:
1. Check console logs (F12 in browser)
2. Check backend terminal for errors
3. Verify all dependencies are installed
4. Ensure webcam permissions are granted

---

## Quick Commands Reference

### Backend
```bash
cd backend
python main.py                 # Start server
python create_demo_user.py     # Create demo user
```

### Frontend
```bash
cd frontend
npm install                     # Install dependencies
npm run dev                     # Start development server
npm run build                   # Build for production
```

### Database Reset (if needed)
```bash
cd backend
rm dms_database.db             # Delete database
python main.py                 # Restart (will create new DB)
python create_demo_user.py     # Recreate demo user
```