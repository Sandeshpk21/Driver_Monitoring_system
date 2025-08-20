import cv2
import mediapipe as mp
import numpy as np
import time
from collections import deque, defaultdict
from datetime import datetime
from typing import Optional, List, Tuple, Dict, Any

# Import timezone utilities
from utils.timezone import format_ist_timestamp

from models.detection import DetectionResult, Alert, CalibrationData
from core.config import Settings

class DriverMonitorProcessor:
    def __init__(self):
        self.settings = Settings()
        
        # MediaPipe setup
        self.mp_face_mesh = mp.solutions.face_mesh
        self.mp_hands = mp.solutions.hands
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.hands = self.mp_hands.Hands(
            max_num_hands=2,
            min_detection_confidence=0.6,
            min_tracking_confidence=0.5
        )
        
        # Landmark indices
        self.LEFT_EYE = [33, 160, 158, 133, 153, 144]
        self.RIGHT_EYE = [362, 385, 387, 263, 373, 380]
        self.MOUTH = [13, 14, 78, 308]
        self.LEFT_IRIS = [474, 475, 476, 477]
        self.RIGHT_IRIS = [469, 470, 471, 472]
        self.NOSE_TIP = 1
        self.LEFT_EAR_TIP = 234
        self.RIGHT_EAR_TIP = 454
        
        # State variables
        self.eye_closure_counter = 0
        self.blink_counter = 0
        self.blink_timer = time.time()
        self.yawn_counter = 0
        self.mar_deque = deque(maxlen=30)
        self.active_alerts: Dict[str, float] = {}
        
        # Calibration
        self.calibration_mode = True
        self.gaze_center = 0.5
        self.head_center_x = 0.5
        self.head_center_y = 0.5
        
    def update_settings(self, settings: Settings):
        """Update processor settings"""
        self.settings = settings
        
    def calibrate(self, calibration: CalibrationData):
        """Calibrate the system with user's normal position"""
        self.gaze_center = calibration.gaze_center
        self.head_center_x = calibration.head_center_x
        self.head_center_y = calibration.head_center_y
        self.calibration_mode = False
    
    def reset_state(self):
        """Reset all monitoring state variables"""
        self.eye_closure_counter = 0
        self.blink_counter = 0
        self.blink_timer = time.time()
        self.yawn_counter = 0
        self.mar_deque = deque(maxlen=30)
        self.active_alerts = {}
        
    def get_aspect_ratio(self, landmarks, eye_indices: List[int], w: int, h: int) -> float:
        """Calculate Eye Aspect Ratio (EAR)"""
        def pt(i): 
            return np.array([landmarks[i].x * w, landmarks[i].y * h])
        
        A = np.linalg.norm(pt(eye_indices[1]) - pt(eye_indices[5]))
        B = np.linalg.norm(pt(eye_indices[2]) - pt(eye_indices[4]))
        C = np.linalg.norm(pt(eye_indices[0]) - pt(eye_indices[3]))
        
        ear = (A + B) / (2.0 * C) if C > 0 else 0
        return ear
    
    def get_mar(self, landmarks, mouth_idx: List[int], w: int, h: int) -> float:
        """Calculate Mouth Aspect Ratio (MAR)"""
        top = np.array([landmarks[mouth_idx[0]].x * w, landmarks[mouth_idx[0]].y * h])
        bottom = np.array([landmarks[mouth_idx[1]].x * w, landmarks[mouth_idx[1]].y * h])
        left = np.array([landmarks[mouth_idx[2]].x * w, landmarks[mouth_idx[2]].y * h])
        right = np.array([landmarks[mouth_idx[3]].x * w, landmarks[mouth_idx[3]].y * h])
        
        vertical = np.linalg.norm(top - bottom)
        horizontal = np.linalg.norm(left - right)
        return vertical / horizontal if horizontal > 0 else 0
    
    def get_iris_center(self, landmarks, indices: List[int], w: int, h: int) -> np.ndarray:
        """Get the center of iris landmarks"""
        points = np.array([[landmarks[i].x * w, landmarks[i].y * h] for i in indices])
        return np.mean(points, axis=0)
    
    def hand_near_ear(self, landmarks, hand_landmarks, w: int, h: int) -> bool:
        """Check if hand is near ear (phone call detection)"""
        ear_l = np.array([landmarks[self.LEFT_EAR_TIP].x * w, landmarks[self.LEFT_EAR_TIP].y * h])
        ear_r = np.array([landmarks[self.RIGHT_EAR_TIP].x * w, landmarks[self.RIGHT_EAR_TIP].y * h])
        
        for lm in hand_landmarks.landmark:
            hx, hy = lm.x * w, lm.y * h
            dx_l, dy_l = abs(hx - ear_l[0]), abs(hy - ear_l[1])
            dx_r, dy_r = abs(hx - ear_r[0]), abs(hy - ear_r[1])
            
            if (dx_l < 40 and dy_l < 90) or (dx_r < 40 and dy_r < 90):
                return True
        return False
    
    def hand_near_face(self, face_center: Tuple[int, int], hand_landmarks, shape: Tuple[int, int]) -> bool:
        """Check if hand is near face"""
        fcx, fcy = face_center
        ih, iw = shape[:2]
        
        for lm in hand_landmarks.landmark:
            x, y = int(lm.x * iw), int(lm.y * ih)
            if np.hypot(fcx - x, fcy - y) < self.settings.hand_near_face_px:
                return True
        return False
    
    def add_alert(self, message: str, severity: str = "warning") -> Alert:
        """Add an alert with timestamp"""
        ts = format_ist_timestamp()
        key = f"{ts} {message}"
        self.active_alerts[key] = time.time()
        
        # Determine color based on message content
        if "Mild" in message or "Warning" in message:
            color = "white"
        elif "Moderate" in message or "Alert" in message:
            color = "yellow"
        elif "Severe" in message:
            color = "red"
        else:
            color = "red"
            
        return Alert(
            message=message,
            severity=severity,
            timestamp=ts,
            color=color
        )
    
    def process_frame(self, frame: np.ndarray) -> DetectionResult:
        """Process a single frame and return detection results"""
        h, w = frame.shape[:2]
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process with MediaPipe
        face_result = self.face_mesh.process(rgb)
        hand_result = self.hands.process(rgb)
        
        current_time = time.time()
        
        # Initialize result
        result = DetectionResult()
        result.calibration_mode = self.calibration_mode
        
        # State variables
        eye_closed = 0
        head_turn = 0
        hands_free = False
        head_tilt = 0
        head_droop = 0
        yawn = False
        
        if face_result.multi_face_landmarks:
            landmarks = face_result.multi_face_landmarks[0].landmark
            face_center = (int(landmarks[self.NOSE_TIP].x * w), int(landmarks[self.NOSE_TIP].y * h))
            
            # Eye closure detection
            left_ear = self.get_aspect_ratio(landmarks, self.LEFT_EYE, w, h)
            right_ear = self.get_aspect_ratio(landmarks, self.RIGHT_EYE, w, h)
            avg_ear = (left_ear + right_ear) / 2
            result.metrics["avg_ear"] = avg_ear
            
            # Iris visibility check
            visible_iris_points = [
                idx for idx in self.LEFT_IRIS + self.RIGHT_IRIS
                if 0 <= idx < len(landmarks) and hasattr(landmarks[idx], 'visibility') 
                and landmarks[idx].visibility > 0.1
            ]
            iris_visible = len(visible_iris_points) >= 4
            
            left_iris = self.get_iris_center(landmarks, self.LEFT_IRIS, w, h)
            right_iris = self.get_iris_center(landmarks, self.RIGHT_IRIS, w, h)
            iris_center_avg = (left_iris + right_iris) / 2
            iris_y_avg = iris_center_avg[1] / h
            
            iris_missing_or_low = (not iris_visible) or (iris_y_avg > 0.5)
            eye_closed_by_ear = avg_ear < self.settings.ear_threshold
            
            if eye_closed_by_ear and iris_missing_or_low:
                self.eye_closure_counter += 1
                
                if self.eye_closure_counter > 30:
                    alert = self.add_alert("Alert: Eyes Closed Too Long", "severe")
                    result.alerts.append(alert)
                    eye_closed = 2
                    result.states["eyes_closed"] = True
                elif self.eye_closure_counter > self.settings.eye_closed_frames_threshold:
                    alert = self.add_alert("Warning: Eyes Closed", "warning")
                    result.alerts.append(alert)
                    eye_closed = 1
                    result.states["eyes_closed"] = True
            else:
                if 2 <= self.eye_closure_counter < self.settings.eye_closed_frames_threshold:
                    self.blink_counter += 1
                    result.states["blink"] = True
                self.eye_closure_counter = 0
            
            # Blink rate monitoring
            if current_time - self.blink_timer > 60:
                if self.blink_counter >= self.settings.blink_rate_threshold:
                    alert = self.add_alert("High Blinking Rate", "warning")
                    result.alerts.append(alert)
                self.blink_counter = 0
                self.blink_timer = current_time
            
            result.metrics["blink_count"] = self.blink_counter
            
            # Yawn detection
            mar = self.get_mar(landmarks, self.MOUTH, w, h)
            self.mar_deque.append(mar)
            result.metrics["mar"] = mar
            
            if mar > self.settings.mar_threshold:
                self.yawn_counter += 1
                
            if self.yawn_counter > self.settings.yawn_threshold:
                alert = self.add_alert("Warning: Yawning", "warning")
                result.alerts.append(alert)
                yawn = True
                result.states["yawning"] = True
                self.yawn_counter = 0
            
            # Gaze and head pose estimation
            gaze_x_norm = iris_center_avg[0] / w
            head_x = landmarks[self.NOSE_TIP].x
            head_y = landmarks[self.NOSE_TIP].y
            
            if self.calibration_mode:
                result.calibration_data = {
                    "gaze_x": gaze_x_norm,
                    "head_x": head_x,
                    "head_y": head_y
                }
            else:
                gaze_offset = abs(gaze_x_norm - self.gaze_center)
                head_x_offset = abs(head_x - self.head_center_x)
                head_y_offset = abs(head_y - self.head_center_y)
                
                # Gaze deviation
                if gaze_offset > self.settings.gaze_deviation_threshold:
                    if gaze_offset < 0.1:
                        alert = self.add_alert("Mild Gaze Deviation", "mild")
                    elif gaze_offset < 0.2:
                        alert = self.add_alert("Moderate Gaze Deviation", "moderate")
                    else:
                        alert = self.add_alert("Severe Gaze Deviation", "severe")
                    result.alerts.append(alert)
                    result.states["gaze_deviation"] = True
                
                # Head turn detection
                if head_x_offset > self.settings.head_turn_threshold:
                    if head_x_offset < 0.1:
                        alert = self.add_alert("Mild Head Turn", "mild")
                        head_turn = 1
                    elif head_x_offset < 0.2:
                        alert = self.add_alert("Moderate Head Turn", "moderate")
                        head_turn = 2
                    else:
                        alert = self.add_alert("Severe Head Turn", "severe")
                        head_turn = 3
                    result.alerts.append(alert)
                    result.states["head_turn"] = True
                
                # Head tilt/droop detection
                if abs(head_y_offset) > self.settings.head_turn_threshold:
                    if head_y < self.head_center_y:
                        # Looking up
                        if abs(head_y_offset) < 0.08:
                            alert = self.add_alert("Mild Looking Upward", "mild")
                            head_tilt = 1
                        elif abs(head_y_offset) < 0.15:
                            alert = self.add_alert("Moderate Looking Upward", "moderate")
                            head_tilt = 2
                        else:
                            alert = self.add_alert("Severe Looking Upward", "severe")
                            head_tilt = 3
                        result.states["head_tilt_up"] = True
                    else:
                        # Head drooping
                        if abs(head_y_offset) < 0.07:
                            alert = self.add_alert("Head drooping symptom", "mild")
                            head_droop = 1
                        elif abs(head_y_offset) < 0.12:
                            alert = self.add_alert("Head drooping started", "moderate")
                            head_droop = 2
                        else:
                            alert = self.add_alert("Head drooped", "severe")
                            head_droop = 3
                        result.states["head_droop"] = True
                    result.alerts.append(alert)
            
            # Extract face landmarks for visualization
            result.face_landmarks = [
                {"x": lm.x, "y": lm.y} for lm in landmarks
            ]
        
        # Hand detection
        if hand_result.multi_hand_landmarks:
            hand_coords = []
            for hand_landmarks in hand_result.multi_hand_landmarks:
                if face_result.multi_face_landmarks:
                    landmarks = face_result.multi_face_landmarks[0].landmark
                    face_center = (int(landmarks[self.NOSE_TIP].x * w), int(landmarks[self.NOSE_TIP].y * h))
                    
                    if self.hand_near_ear(landmarks, hand_landmarks, w, h):
                        alert = self.add_alert("Likely mobile call", "warning")
                        result.alerts.append(alert)
                        hands_free = True
                        result.states["phone_use"] = True
                    elif self.hand_near_face(face_center, hand_landmarks, (h, w)):
                        alert = self.add_alert("Hand near the face", "warning")
                        result.alerts.append(alert)
                        hands_free = True
                        result.states["hand_near_face"] = True
                
                xs = [lm.x for lm in hand_landmarks.landmark]
                ys = [lm.y for lm in hand_landmarks.landmark]
                hand_coords.append((np.mean(xs), np.mean(ys)))
                
                # Store hand landmarks
                result.hand_landmarks.append([
                    {"x": lm.x, "y": lm.y} for lm in hand_landmarks.landmark
                ])
            
            # Texting detection
            if not self.calibration_mode and len(hand_coords) == 2:
                (x1, y1), (x2, y2) = hand_coords
                dist = np.hypot(x2 - x1, y2 - y1)
                
                both_hands_low = y1 > 0.6 and y2 > 0.6
                
                if dist < 0.35 and both_hands_low:
                    alert = self.add_alert("Possible texting observed", "warning")
                    result.alerts.append(alert)
                    hands_free = True
                    result.states["texting"] = True
        
        # Combined drowsiness and distraction detection
        if eye_closed == 2 and head_droop >= 1 or eye_closed == 2 and yawn:
            alert = self.add_alert("Severe DROWSINESS Observed", "severe")
            result.alerts.append(alert)
            result.states["drowsiness"] = "severe"
        elif eye_closed == 1 and head_droop >= 1 or eye_closed == 1 and yawn:
            alert = self.add_alert("Moderate DROWSINESS Observed", "moderate")
            result.alerts.append(alert)
            result.states["drowsiness"] = "moderate"
        
        if head_turn >= 1 and hands_free or head_tilt >= 1 and hands_free:
            alert = self.add_alert("Moderate DISTRACTION Observed", "moderate")
            result.alerts.append(alert)
            result.states["distraction"] = "moderate"
        elif head_turn >= 2 and hands_free or head_tilt >= 2 and hands_free:
            alert = self.add_alert("Severe DISTRACTION Observed", "severe")
            result.alerts.append(alert)
            result.states["distraction"] = "severe"
        
        # Clean up expired alerts
        expired = [k for k, t in self.active_alerts.items() 
                  if current_time - t > self.settings.alert_duration]
        for k in expired:
            del self.active_alerts[k]
        
        # Add all active alerts to result
        for alert_key in self.active_alerts:
            # Parse alert message from key
            parts = alert_key.split(" ", 1)
            if len(parts) == 2:
                ts, msg = parts
                if not any(a.message == msg for a in result.alerts):
                    # Determine severity and color
                    if "Mild" in msg or "Warning" in msg:
                        severity = "mild"
                        color = "white"
                    elif "Moderate" in msg or "Alert" in msg:
                        severity = "moderate"
                        color = "yellow"
                    elif "Severe" in msg:
                        severity = "severe"
                        color = "red"
                    else:
                        severity = "warning"
                        color = "red"
                    
                    result.alerts.append(Alert(
                        message=msg,
                        severity=severity,
                        timestamp=ts,
                        color=color
                    ))
        
        return result