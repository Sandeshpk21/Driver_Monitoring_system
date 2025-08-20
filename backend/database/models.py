from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

# Import timezone utilities
from utils.timezone import get_ist_datetime_for_db

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=get_ist_datetime_for_db)
    updated_at = Column(DateTime, default=get_ist_datetime_for_db, onupdate=get_ist_datetime_for_db)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    sessions = relationship("MonitoringSession", back_populates="user", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="user", cascade="all, delete-orphan")
    calibrations = relationship("Calibration", back_populates="user", cascade="all, delete-orphan")

class MonitoringSession(Base):
    __tablename__ = "monitoring_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    start_time = Column(DateTime, default=get_ist_datetime_for_db)
    end_time = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    total_alerts = Column(Integer, default=0)
    drowsiness_alerts = Column(Integer, default=0)
    distraction_alerts = Column(Integer, default=0)
    session_metadata = Column(JSON, nullable=True)  # Store additional session data
    
    # Relationships
    user = relationship("User", back_populates="sessions")
    alerts = relationship("Alert", back_populates="session", cascade="all, delete-orphan")

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    session_id = Column(String, ForeignKey("monitoring_sessions.id"), nullable=True)
    timestamp = Column(DateTime, default=get_ist_datetime_for_db)
    alert_type = Column(String, nullable=False)  # drowsiness, distraction, etc.
    severity = Column(String, nullable=False)  # mild, moderate, severe
    message = Column(String, nullable=False)
    
    # Detailed metrics at time of alert
    eye_aspect_ratio = Column(Float, nullable=True)
    mouth_aspect_ratio = Column(Float, nullable=True)
    blink_count = Column(Integer, nullable=True)
    head_position = Column(JSON, nullable=True)  # {x, y, turn, tilt}
    gaze_metrics = Column(JSON, nullable=True)
    
    # Alert context
    states = Column(JSON, nullable=True)  # All active states
    duration_ms = Column(Integer, nullable=True)  # How long the condition persisted
    image_path = Column(String, nullable=True)  # Optional: path to saved frame
    
    # Relationships
    user = relationship("User", back_populates="alerts")
    session = relationship("MonitoringSession", back_populates="alerts")

class Calibration(Base):
    __tablename__ = "calibrations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, default=get_ist_datetime_for_db)
    gaze_center = Column(Float, nullable=False)
    head_center_x = Column(Float, nullable=False)
    head_center_y = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
    calibration_data = Column(JSON, nullable=True)  # Additional calibration parameters
    
    # Relationships
    user = relationship("User", back_populates="calibrations")

class AlertStatistics(Base):
    __tablename__ = "alert_statistics"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    
    # Daily statistics
    total_monitoring_time = Column(Integer, default=0)  # seconds
    total_alerts = Column(Integer, default=0)
    
    # Drowsiness stats
    drowsiness_mild = Column(Integer, default=0)
    drowsiness_moderate = Column(Integer, default=0)
    drowsiness_severe = Column(Integer, default=0)
    avg_eye_closure_time = Column(Float, nullable=True)
    total_yawns = Column(Integer, default=0)
    
    # Distraction stats
    distraction_mild = Column(Integer, default=0)
    distraction_moderate = Column(Integer, default=0)
    distraction_severe = Column(Integer, default=0)
    phone_usage_count = Column(Integer, default=0)
    head_turn_count = Column(Integer, default=0)
    
    # Risk score (0-100)
    daily_risk_score = Column(Float, nullable=True)
    
    # Relationships
    user_rel = relationship("User")

class Configuration(Base):
    __tablename__ = "configurations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    config_name = Column(String, nullable=True)
    
    # Thresholds
    ear_threshold = Column(Float, default=0.140)
    eye_closed_frames_threshold = Column(Integer, default=9)
    blink_rate_threshold = Column(Integer, default=5)
    mar_threshold = Column(Float, default=0.6)
    yawn_threshold = Column(Integer, default=3)
    gaze_deviation_threshold = Column(Float, default=0.05)
    head_turn_threshold = Column(Float, default=0.08)
    hand_near_face_px = Column(Integer, default=200)
    alert_duration = Column(Integer, default=3)
    
    # Video settings
    frame_width = Column(Integer, default=1920)
    frame_height = Column(Integer, default=1080)
    scale_factor = Column(Float, default=1.0)
    
    created_at = Column(DateTime, default=get_ist_datetime_for_db)
    updated_at = Column(DateTime, default=get_ist_datetime_for_db, onupdate=get_ist_datetime_for_db)
    
    # Relationships
    user_rel = relationship("User")