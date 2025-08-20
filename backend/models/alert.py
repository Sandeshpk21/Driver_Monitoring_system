from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class AlertCreate(BaseModel):
    """Alert creation model"""
    alert_type: str
    severity: str
    message: str
    eye_aspect_ratio: Optional[float] = None
    mouth_aspect_ratio: Optional[float] = None
    blink_count: Optional[int] = None
    head_position: Optional[Dict[str, float]] = None
    gaze_metrics: Optional[Dict[str, float]] = None
    states: Optional[Dict[str, Any]] = None
    duration_ms: Optional[int] = None

class AlertResponse(BaseModel):
    """Alert response model"""
    id: str
    user_id: str
    session_id: Optional[str]
    timestamp: datetime
    alert_type: str
    severity: str
    message: str
    eye_aspect_ratio: Optional[float]
    mouth_aspect_ratio: Optional[float]
    blink_count: Optional[int]
    head_position: Optional[Dict[str, float]]
    gaze_metrics: Optional[Dict[str, float]]
    states: Optional[Dict[str, Any]]
    duration_ms: Optional[int]
    
    class Config:
        orm_mode = True
        from_attributes = True

class SessionResponse(BaseModel):
    """Monitoring session response"""
    id: str
    user_id: str
    start_time: datetime
    end_time: Optional[datetime]
    duration_seconds: Optional[int]
    total_alerts: int
    drowsiness_alerts: int
    distraction_alerts: int
    session_metadata: Optional[Dict[str, Any]]
    
    class Config:
        orm_mode = True
        from_attributes = True

class AlertAnalytics(BaseModel):
    """Alert analytics response"""
    period: str
    start_date: datetime
    end_date: datetime
    total_alerts: int
    drowsiness_alerts: int
    distraction_alerts: int
    severity_breakdown: Dict[str, int]
    hourly_distribution: Dict[int, int]
    most_common_alerts: List[Dict[str, Any]]
    risk_score: float
    total_monitoring_time: int
    sessions_count: int

class AlertStatisticsResponse(BaseModel):
    """Daily statistics response"""
    date: datetime
    total_monitoring_time: int
    total_alerts: int
    drowsiness: Dict[str, int]
    distraction: Dict[str, int]
    specific_events: Dict[str, int]
    risk_score: float