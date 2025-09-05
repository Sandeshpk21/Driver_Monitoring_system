import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export class CameraService {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  
  isNativePlatform(): boolean {
    return Capacitor.isNativePlatform();
  }

  async initializeCamera(videoElement: HTMLVideoElement): Promise<void> {
    this.videoElement = videoElement;

    if (this.isNativePlatform()) {
      // Mobile platform - use Capacitor Camera
      await this.startMobileCamera();
    } else {
      // Web platform - use WebRTC
      await this.startWebCamera();
    }
  }

  private async startWebCamera(): Promise<void> {
    try {
      if (!this.videoElement) throw new Error('Video element not set');
      
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();
    } catch (error) {
      console.error('Error accessing web camera:', error);
      throw error;
    }
  }

  private async startMobileCamera(): Promise<void> {
    // For mobile, we'll need to capture frames periodically
    // This is a simplified version - you might need to enhance this
    try {
      const permissions = await Camera.checkPermissions();
      
      if (permissions.camera !== 'granted') {
        const request = await Camera.requestPermissions();
        if (request.camera !== 'granted') {
          throw new Error('Camera permission denied');
        }
      }

      // Mobile camera will be handled differently
      // We'll capture frames and process them
      console.log('Mobile camera initialized');
    } catch (error) {
      console.error('Error accessing mobile camera:', error);
      throw error;
    }
  }

  async captureFrame(): Promise<string | null> {
    if (this.isNativePlatform()) {
      // Capture from mobile camera
      try {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Camera
        });
        
        return image.base64String || null;
      } catch (error) {
        console.error('Error capturing mobile frame:', error);
        return null;
      }
    } else {
      // Capture from web camera
      if (!this.videoElement) return null;
      
      const canvas = document.createElement('canvas');
      canvas.width = this.videoElement.videoWidth;
      canvas.height = this.videoElement.videoHeight;
      
      const context = canvas.getContext('2d');
      if (!context) return null;
      
      context.drawImage(this.videoElement, 0, 0);
      
      // Convert to base64
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      return dataUrl.split(',')[1]; // Return only the base64 part
    }
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  isStreamActive(): boolean {
    if (this.isNativePlatform()) {
      // For mobile, we assume it's active if initialized
      return true;
    }
    
    return this.stream !== null && this.stream.active;
  }
}