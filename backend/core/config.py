from pydantic import BaseSettings, Field
from typing import Optional, Dict, Any

class Settings(BaseSettings):
    """Configuration settings for the Driver Monitoring System"""
    
    # Eye detection thresholds
    ear_threshold: float = Field(default=0.140, description="Eye Aspect Ratio threshold")
    eye_closed_frames_threshold: int = Field(default=9, description="Frames before eye closure alert")
    blink_rate_threshold: int = Field(default=5, description="Blinks per minute threshold")
    
    # Mouth/Yawn detection
    mar_threshold: float = Field(default=0.6, description="Mouth Aspect Ratio threshold")
    yawn_threshold: int = Field(default=3, description="Frames before yawn alert")
    
    # Video settings
    frame_width: int = Field(default=1920, description="Video frame width")
    frame_height: int = Field(default=1080, description="Video frame height")
    scale_factor: float = Field(default=1.0, description="Resolution scaling factor")
    
    # Head pose and gaze
    gaze_deviation_threshold: float = Field(default=0.05, description="Gaze deviation threshold")
    head_turn_threshold: float = Field(default=0.08, description="Head turn threshold")
    
    # Hand detection
    hand_near_face_px: int = Field(default=200, description="Pixel distance for hand near face")
    
    # Alert settings
    alert_duration: int = Field(default=3, description="Alert display duration in seconds")
    
    class Config:
        env_prefix = "DMS_"
        case_sensitive = False
    
    def dict(self) -> Dict[str, Any]:
        """Return settings as dictionary"""
        return {
            "ear_threshold": self.ear_threshold,
            "eye_closed_frames_threshold": self.eye_closed_frames_threshold,
            "blink_rate_threshold": self.blink_rate_threshold,
            "mar_threshold": self.mar_threshold,
            "yawn_threshold": self.yawn_threshold,
            "frame_width": self.frame_width,
            "frame_height": self.frame_height,
            "scale_factor": self.scale_factor,
            "gaze_deviation_threshold": self.gaze_deviation_threshold,
            "head_turn_threshold": self.head_turn_threshold,
            "hand_near_face_px": self.hand_near_face_px,
            "alert_duration": self.alert_duration
        }
    
    def update(self, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update settings with new values"""
        for key, value in updates.items():
            if hasattr(self, key):
                setattr(self, key, value)
        return self.dict()