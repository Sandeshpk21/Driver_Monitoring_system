export interface Alert {
  message: string;
  severity: string;
  timestamp: string;
  color: string;
}

export interface DetectionResult {
  alerts: Alert[];
  states: Record<string, any>;
  metrics: Record<string, number>;
  calibration_mode: boolean;
  calibration_data?: {
    gaze_x: number;
    head_x: number;
    head_y: number;
  };
  face_landmarks?: Array<{ x: number; y: number }>;
  hand_landmarks?: Array<Array<{ x: number; y: number }>>;
}

export interface Config {
  ear_threshold: number;
  eye_closed_frames_threshold: number;
  blink_rate_threshold: number;
  mar_threshold: number;
  yawn_threshold: number;
  frame_width: number;
  frame_height: number;
  scale_factor: number;
  gaze_deviation_threshold: number;
  head_turn_threshold: number;
  hand_near_face_px: number;
  alert_duration: number;
}

export interface CalibrationData {
  gaze_center: number;
  head_center_x: number;
  head_center_y: number;
}