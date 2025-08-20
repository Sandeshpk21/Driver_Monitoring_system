# Driver Monitoring System - Web Application

A real-time driver monitoring system that detects drowsiness and distraction using computer vision and AI. Built with FastAPI (backend) and React (frontend).

## Features

- **Real-time Detection**:
  - Eye closure and blink rate monitoring
  - Yawn detection
  - Head pose tracking (turn, tilt, droop)
  - Gaze deviation monitoring
  - Hand detection (phone use, texting)
  
- **Alert System**:
  - Color-coded alerts (white/yellow/red)
  - Severity levels (mild/moderate/severe)
  - Combined drowsiness and distraction assessment
  
- **Interactive UI**:
  - Live webcam feed with overlay
  - Real-time metrics display
  - Configurable thresholds
  - Calibration system

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
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # WebSocket service
│   │   ├── types/           # TypeScript types
│   │   └── App.tsx          # Main application
│   ├── package.json
│   └── vite.config.ts
└── dmsv7.py                  # Original reference script
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

- `GET /api/config` - Get current configuration
- `POST /api/config` - Update configuration
- `POST /api/calibrate` - Calibrate the system
- `POST /api/process-frame` - Process a single frame

### WebSocket

- `ws://localhost:8000/ws` - Real-time frame processing

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
4. Detection results are sent back to frontend
5. **Frontend** displays:
   - Alert overlays on video
   - Real-time metrics
   - State indicators

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

## Future Improvements

- Add recording functionality
- Implement alert history/logging
- Add audio alerts
- Support multiple camera angles
- Machine learning model fine-tuning
- Mobile app development

## License

This project is for educational and research purposes.