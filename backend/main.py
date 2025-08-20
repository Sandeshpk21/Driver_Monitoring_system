from fastapi import FastAPI, WebSocket, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json
import base64
import cv2
import numpy as np
from typing import Dict, Any, Optional
import asyncio
from datetime import datetime
from sqlalchemy.orm import Session

# Import timezone utilities
from utils.timezone import get_ist_datetime_for_db

from core.processor import DriverMonitorProcessor
from core.config import Settings
from models.detection import DetectionResult, CalibrationData, ConfigUpdate
from models.alert import AlertCreate

# Database and Auth
from database.connection import init_db, get_db
from database.models import User, MonitoringSession, Alert as AlertModel
from auth.security import get_current_active_user, decode_token
from auth.routes import router as auth_router
from api.alerts import router as alerts_router

app = FastAPI(title="Driver Monitoring System API")

# Initialize database
init_db()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(alerts_router)

# Import and include users router
from api.users import router as users_router
app.include_router(users_router)

# Global processor instances (per user)
processors: Dict[str, DriverMonitorProcessor] = {}
user_settings: Dict[str, Settings] = {}

def get_user_processor(user_id: str) -> DriverMonitorProcessor:
    """Get or create processor for user"""
    if user_id not in processors:
        processors[user_id] = DriverMonitorProcessor()
        user_settings[user_id] = Settings()
    return processors[user_id]

@app.get("/")
async def health_check():
    return {"status": "healthy", "service": "Driver Monitoring System", "version": "2.0.0"}

@app.get("/api/config")
async def get_config(
    current_user: User = Depends(get_current_active_user)
):
    """Get current configuration settings for authenticated user"""
    if current_user.id not in user_settings:
        user_settings[current_user.id] = Settings()
    return user_settings[current_user.id].dict()

@app.post("/api/config")
async def update_config(
    config: ConfigUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Update configuration settings for authenticated user"""
    if current_user.id not in user_settings:
        user_settings[current_user.id] = Settings()
    
    updated = user_settings[current_user.id].update(config.dict(exclude_unset=True))
    processor = get_user_processor(current_user.id)
    processor.update_settings(user_settings[current_user.id])
    
    return {"status": "success", "config": updated}

@app.post("/api/calibrate")
async def calibrate(
    calibration: CalibrationData,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Calibrate the system with user's normal position"""
    processor = get_user_processor(current_user.id)
    processor.calibrate(calibration)
    
    # Store calibration in database
    from database.models import Calibration
    
    # Deactivate previous calibrations
    db.query(Calibration).filter(
        Calibration.user_id == current_user.id
    ).update({"is_active": False})
    
    # Create new calibration
    new_calibration = Calibration(
        user_id=current_user.id,
        gaze_center=calibration.gaze_center,
        head_center_x=calibration.head_center_x,
        head_center_y=calibration.head_center_y,
        calibration_data=calibration.dict()
    )
    db.add(new_calibration)
    db.commit()
    
    return {"status": "success", "message": "Calibration completed"}

@app.post("/api/process-frame")
async def process_frame(
    data: Dict[str, Any],
    current_user: User = Depends(get_current_active_user)
):
    """Process a single frame and return detection results"""
    try:
        # Decode base64 image
        image_data = data.get("frame")
        if not image_data:
            raise HTTPException(status_code=400, detail="No frame data provided")
        
        # Remove data URL prefix if present
        if "," in image_data:
            image_data = image_data.split(",")[1]
        
        # Decode and process
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image data")
        
        # Process frame with user's processor
        processor = get_user_processor(current_user.id)
        result = processor.process_frame(frame)
        
        return result.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time video processing"""
    await websocket.accept()
    monitoring_active = False
    user_id = None
    db_session = None
    current_session = None
    
    try:
        while True:
            # Receive data
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle authentication
            if message.get("type") == "authenticate":
                token = message.get("token")
                if token:
                    payload = decode_token(token)
                    if payload:
                        user_id = payload.get("sub")
                        await websocket.send_json({
                            "type": "auth_success",
                            "user_id": user_id
                        })
                    else:
                        await websocket.send_json({
                            "type": "auth_error",
                            "message": "Invalid token"
                        })
                continue
            
            # Require authentication for other operations
            if not user_id:
                await websocket.send_json({
                    "type": "error",
                    "message": "Authentication required"
                })
                continue
            
            processor = get_user_processor(user_id)
            
            if message.get("type") == "start_monitoring":
                monitoring_active = True
                processor.reset_state()
                
                # Create new monitoring session
                from database.connection import SessionLocal
                db_session = SessionLocal()
                current_session = MonitoringSession(user_id=user_id)
                db_session.add(current_session)
                db_session.commit()
                
                await websocket.send_json({
                    "type": "monitoring_status",
                    "status": "started",
                    "is_monitoring": True,
                    "session_id": current_session.id
                })
            
            elif message.get("type") == "stop_monitoring":
                monitoring_active = False
                processor.reset_state()
                
                # End monitoring session
                if current_session and db_session:
                    current_session.end_time = get_ist_datetime_for_db()
                    current_session.duration_seconds = int(
                        (current_session.end_time - current_session.start_time).total_seconds()
                    )
                    db_session.commit()
                    db_session.close()
                    current_session = None
                    db_session = None
                
                await websocket.send_json({
                    "type": "monitoring_status",
                    "status": "stopped",
                    "is_monitoring": False
                })
            
            elif message.get("type") == "frame" and monitoring_active:
                # Process frame only if monitoring is active
                image_data = message.get("data")
                if "," in image_data:
                    image_data = image_data.split(",")[1]
                
                image_bytes = base64.b64decode(image_data)
                nparr = np.frombuffer(image_bytes, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if frame is not None:
                    result = processor.process_frame(frame)
                    result_dict = result.dict()
                    result_dict["is_monitoring"] = monitoring_active
                    
                    # Store alerts in database
                    if result.alerts and db_session and current_session:
                        for alert in result.alerts:
                            alert_model = AlertModel(
                                user_id=user_id,
                                session_id=current_session.id,
                                alert_type="drowsiness" if "drowsiness" in alert.message.lower() else "distraction",
                                severity=alert.severity,
                                message=alert.message,
                                eye_aspect_ratio=result.metrics.get("avg_ear"),
                                mouth_aspect_ratio=result.metrics.get("mar"),
                                blink_count=result.metrics.get("blink_count"),
                                states=result.states
                            )
                            db_session.add(alert_model)
                            
                            # Update session counters
                            current_session.total_alerts += 1
                            if "drowsiness" in alert.message.lower():
                                current_session.drowsiness_alerts += 1
                            elif "distraction" in alert.message.lower():
                                current_session.distraction_alerts += 1
                        
                        db_session.commit()
                    
                    await websocket.send_json(result_dict)
            
            elif message.get("type") == "frame" and not monitoring_active:
                # Send empty result when not monitoring
                await websocket.send_json({
                    "alerts": [],
                    "states": {},
                    "metrics": {},
                    "calibration_mode": False,
                    "is_monitoring": False
                })
            
            elif message.get("type") == "calibrate":
                calibration_data = CalibrationData(**message.get("data", {}))
                processor.calibrate(calibration_data)
                
                # Store calibration if authenticated
                if user_id and db_session:
                    from database.models import Calibration
                    
                    # Deactivate previous calibrations
                    db_session.query(Calibration).filter(
                        Calibration.user_id == user_id
                    ).update({"is_active": False})
                    
                    # Create new calibration
                    new_calibration = Calibration(
                        user_id=user_id,
                        gaze_center=calibration_data.gaze_center,
                        head_center_x=calibration_data.head_center_x,
                        head_center_y=calibration_data.head_center_y
                    )
                    db_session.add(new_calibration)
                    db_session.commit()
                
                await websocket.send_json({
                    "type": "calibration_complete",
                    "status": "success"
                })
            
            elif message.get("type") == "update_config":
                config_data = message.get("data", {})
                if user_id not in user_settings:
                    user_settings[user_id] = Settings()
                user_settings[user_id].update(config_data)
                processor.update_settings(user_settings[user_id])
                
                await websocket.send_json({
                    "type": "config_updated",
                    "config": user_settings[user_id].dict()
                })
                
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        # Clean up session if still active
        if current_session and db_session:
            if not current_session.end_time:
                current_session.end_time = get_ist_datetime_for_db()
                current_session.duration_seconds = int(
                    (current_session.end_time - current_session.start_time).total_seconds()
                )
                db_session.commit()
            db_session.close()
        
        # Only close websocket if it's not already closed
        try:
            from starlette.websockets import WebSocketState
            if websocket.client_state != WebSocketState.DISCONNECTED:
                await websocket.close()
        except Exception:
            # WebSocket might already be closed, ignore the error
            pass

