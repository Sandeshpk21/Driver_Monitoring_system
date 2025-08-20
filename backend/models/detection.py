from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class Alert(BaseModel):
    """Alert model for driver state warnings"""
    message: str
    severity: str  # mild, moderate, severe, warning
    timestamp: str
    color: str  # white, yellow, red

class CalibrationData(BaseModel):
    """Calibration data for user's normal position"""
    gaze_center: float = Field(default=0.5)
    head_center_x: float = Field(default=0.5)
    head_center_y: float = Field(default=0.5)

class ConfigUpdate(BaseModel):
    """Configuration update request"""
    ear_threshold: Optional[float] = None
    eye_closed_frames_threshold: Optional[int] = None
    blink_rate_threshold: Optional[int] = None
    mar_threshold: Optional[float] = None
    yawn_threshold: Optional[int] = None
    frame_width: Optional[int] = None
    frame_height: Optional[int] = None
    scale_factor: Optional[float] = None
    gaze_deviation_threshold: Optional[float] = None
    head_turn_threshold: Optional[float] = None
    hand_near_face_px: Optional[int] = None
    alert_duration: Optional[int] = None

class DetectionResult(BaseModel):
    """Result of frame processing"""
    alerts: List[Alert] = Field(default_factory=list)
    states: Dict[str, Any] = Field(default_factory=dict)
    metrics: Dict[str, float] = Field(default_factory=dict)
    calibration_mode: bool = False
    calibration_data: Optional[Dict[str, float]] = None
    face_landmarks: List[Dict[str, float]] = Field(default_factory=list)
    hand_landmarks: List[List[Dict[str, float]]] = Field(default_factory=list)
    
    class Config:
        arbitrary_types_allowed = True