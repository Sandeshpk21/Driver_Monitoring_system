# Driver Monitoring System - Web Application

A comprehensive real-time driver monitoring system that detects drowsiness and distraction using computer vision and AI, with advanced alert management and analytics. Built with FastAPI (backend), React/TypeScript (frontend), SQLite (Database), and WebSocket for real-time communication.

## Features

- **Real-time Detection**:
  - Eye closure and blink rate monitoring
  - Yawn detection with duration tracking
  - Head pose tracking (turn, tilt, droop)
  - Gaze deviation monitoring
  - Hand detection (phone use, texting)
  - Multi-state detection (drowsiness, distraction, combined states)
  
- **Progressive Sound Alert System**:
  - **Phase 1 (0-5s)**: Grace period - no sound alerts
  - **Phase 2 (5-10s)**: Initial urgency - sound every 2 seconds
  - **Phase 3 (10s+)**: Maximum urgency - sound every 1 second
  - Custom alert sound support (`/sounds/severe-alert.wav`)
  - Web Audio API fallback for system beep
  - Manual sound test button for verification
  - Smart reset logic (3-second gap resets phases)
  
- **Alert Management**:
  - Color-coded alerts (white/yellow/red)
  - Severity levels (mild/moderate/severe/warning)
  - Combined drowsiness and distraction assessment
  - Real-time alert panel with timestamps
  - Alert frequency tracking and analysis
  
- **User Management System**:
  - Role-based access control (Admin, Supervisor, Driver)
  - Driver profile management with license tracking
  - Supervisor assignment and team management
  - User authentication and session management
  - Profile editing and status management
  
- **Analytics Dashboard**:
  - Real-time alert statistics
  - Daily alert trends visualization
  - Risk score calculation and tracking
  - Alert distribution by severity
  - Driver performance metrics
  - Team-level analytics for supervisors
  
- **Interactive UI**:
  - Live webcam feed with overlay
  - Real-time metrics display
  - Configurable thresholds
  - One-click calibration system
  - Responsive design for mobile/desktop
  - Dark mode support

## Project Structure

```
Driver_MS/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── core/
│   │   ├── processor.py     # Detection logic
│   │   └── config.py        # Settings management
│   ├── models/
│   │   └── detection.py     # Data models
│   ├── database/
│   │   ├── models.py        # SQLAlchemy models
│   │   └── crud.py          # Database operations
│   ├── routers/
│   │   ├── users.py         # User management endpoints
│   │   └── analytics.py     # Analytics endpoints
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── VideoMonitor.tsx    # Video feed component
│   │   │   ├── AlertPanel.tsx      # Alert display
│   │   │   └── MetricsDisplay.tsx  # Metrics visualization
│   │   ├── pages/           # Page components
│   │   │   ├── Dashboard.tsx       # Main dashboard
│   │   │   ├── Monitoring.tsx      # Live monitoring
│   │   │   ├── UserManagement.tsx  # User administration
│   │   │   └── Analytics.tsx       # Analytics dashboard
│   │   ├── services/        
│   │   │   ├── websocket.ts        # WebSocket service
│   │   │   ├── soundAlert.ts       # Sound alert system
│   │   │   └── api.ts              # API client
│   │   ├── types/           # TypeScript types
│   │   └── App.tsx          # Main application
│   ├── public/
│   │   └── sounds/          # Alert sound files
│   ├── package.json
│   └── vite.config.ts
├── database.db              # SQLite database
└── dmsv7.py                # Original reference script
```

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Start the Backend

```bash
cd backend
python main.py
```

The backend will start on `http://localhost:8000`

### Start the Frontend

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000`

## Usage

1. **Allow Camera Access**: When prompted, allow the browser to access your webcam

2. **Calibration**: 
   - Position yourself naturally in front of the camera
   - Look straight ahead at the screen
   - Click the "Calibrate" button when ready

3. **Monitoring**: The system will continuously monitor and display:
   - Real-time alerts for various states
   - Eye and mouth aspect ratios
   - Blink count
   - Active states (drowsiness, distraction, etc.)

4. **Configuration**: Adjust detection thresholds in the Configuration panel:
   - Eye detection parameters
   - Yawn detection settings
   - Head pose and gaze thresholds
   - Video settings

## API Endpoints

### REST API

#### Core System
- `GET /api/config` - Get current configuration
- `POST /api/config` - Update configuration
- `POST /api/calibrate` - Calibrate the system
- `POST /api/process-frame` - Process a single frame

#### User Management
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user details
- `DELETE /api/users/{id}` - Delete user
- `POST /api/users/login` - User authentication
- `GET /api/users/current` - Get current user info

#### Analytics
- `GET /api/analytics/alerts` - Get alert statistics
- `GET /api/analytics/daily-trends` - Get daily alert trends
- `GET /api/analytics/risk-scores` - Get driver risk scores
- `GET /api/analytics/team-stats` - Get team statistics (supervisors)

### WebSocket

- `ws://localhost:8000/ws` - Real-time frame processing and alert streaming

## Configuration Options

| Parameter | Description | Default |
|-----------|-------------|---------|
| `ear_threshold` | Eye Aspect Ratio threshold | 0.140 |
| `eye_closed_frames_threshold` | Frames before eye closure alert | 9 |
| `blink_rate_threshold` | Blinks per minute threshold | 5 |
| `mar_threshold` | Mouth Aspect Ratio threshold | 0.6 |
| `yawn_threshold` | Frames before yawn alert | 3 |
| `gaze_deviation_threshold` | Gaze deviation from center | 0.05 |
| `head_turn_threshold` | Head turning detection | 0.08 |
| `hand_near_face_px` | Distance for hand near face | 200 |

## Data Flow

1. **Frontend** captures video frames from webcam (15 FPS)
2. Frames are sent to backend via WebSocket as base64 JPEG
3. **Backend** processes frames using MediaPipe:
   - Extracts facial landmarks (468 points)
   - Detects hand positions
   - Calculates metrics (EAR, MAR, etc.)
   - Applies detection algorithms
   - Stores alerts in SQLite database
4. Detection results are sent back to frontend
5. **Frontend** processes alerts:
   - Displays alert overlays on video
   - Updates real-time metrics
   - Triggers progressive sound alerts based on severity
   - Shows alert history in panel
6. **Sound Alert System**:
   - Phase 1 (0-5s): Grace period monitoring
   - Phase 2 (5-10s): Sound every 2 seconds
   - Phase 3 (10s+): Sound every 1 second
7. **Analytics** are computed from stored data:
   - Real-time risk scores
   - Daily trend analysis
   - Team performance metrics

## Performance Considerations

- Processing runs at ~15 FPS for optimal balance
- WebSocket used for low-latency communication
- Frame compression via JPEG encoding
- Efficient landmark detection with MediaPipe

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Edge
- Safari (webcam permissions may vary)

## Troubleshooting

### Backend Issues

- **MediaPipe installation fails**: Ensure Python 3.8-3.10 is used
- **Port already in use**: Change port in `main.py`

### Frontend Issues

- **Camera not working**: Check browser permissions
- **WebSocket connection fails**: Ensure backend is running
- **Slow performance**: Reduce frame resolution in settings

## Sound Alert Configuration

The progressive sound alert system provides intelligent audio feedback:

### Alert Phases
1. **Grace Period (0-5s)**: No sound, allowing brief incidents to self-correct
2. **Initial Urgency (5-10s)**: Sound every 2 seconds for persistent issues
3. **Maximum Urgency (10s+)**: Sound every 1 second for critical situations

### Sound Files
- Place custom alert sounds in `frontend/public/sounds/`
- Default file: `severe-alert.wav`
- Fallback: Web Audio API system beep

### Testing Sound Alerts
- Use the 🔊 button in the video monitor to test audio
- Monitor console logs for detailed alert processing
- Status indicators: "🔇 Audio Ready", "⏳ Grace Period", "⚠ Initial Alert", "🚨 Maximum Alert"

## User Roles and Permissions

| Role | Permissions |
|------|------------|
| **Admin** | Full system access, user management, all analytics |
| **Supervisor** | View team analytics, manage assigned drivers |
| **Driver** | View own monitoring data, basic settings |

## Future Improvements

- ✅ ~~Add audio alerts~~ (Implemented with progressive system)
- ✅ ~~Implement alert history/logging~~ (Implemented in database)
- Add recording functionality
- Support multiple camera angles
- Machine learning model fine-tuning
- Mobile app development
- Cloud deployment and multi-tenant support
- Advanced reporting and export features
- Integration with fleet management systems

## License

This project is for educational and research purposes.