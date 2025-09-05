import { DetectionResult, Config } from '../types';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private authenticated: boolean = false;
  private token: string | null = null;
  
  public onMessage?: (data: DetectionResult) => void;
  public onConnect?: () => void;
  public onDisconnect?: () => void;
  public onError?: (error: Event) => void;
  public onAuthSuccess?: () => void;
  public onAuthError?: (message: string) => void;

  constructor(url: string, token?: string) {
    this.url = url;
    this.token = token || localStorage.getItem('access_token');
    this.connect();
  }

  private connect() {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        
        // Authenticate immediately after connection
        if (this.token) {
          this.authenticate(this.token);
        }
        
        if (this.onConnect) {
          this.onConnect();
        }
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle authentication responses
          if (data.type === 'auth_success') {
            this.authenticated = true;
            if (this.onAuthSuccess) {
              this.onAuthSuccess();
            }
          } else if (data.type === 'auth_error') {
            this.authenticated = false;
            if (this.onAuthError) {
              this.onAuthError(data.message);
            }
          } else if (this.onMessage) {
            // Handle regular messages
            this.onMessage(data);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (this.onError) {
          this.onError(error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        if (this.onDisconnect) {
          this.onDisconnect();
        }
        // Attempt to reconnect after 3 seconds
        this.reconnectTimeout = setTimeout(() => {
          console.log('Attempting to reconnect...');
          this.connect();
        }, 3000);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }

  public authenticate(token: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'authenticate',
        token: token,
      }));
    }
  }

  public sendFrame(imageData: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.authenticated) {
      this.ws.send(JSON.stringify({
        type: 'frame',
        data: imageData,
      }));
    }
  }

  public startMonitoring() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.authenticated) {
      this.ws.send(JSON.stringify({
        type: 'start_monitoring',
      }));
    }
  }

  public stopMonitoring() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.authenticated) {
      this.ws.send(JSON.stringify({
        type: 'stop_monitoring',
      }));
    }
  }

  public startCalibration() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.authenticated) {
      this.ws.send(JSON.stringify({
        type: 'start_calibration',
      }));
    }
  }

  public calibrate(calibrationData: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'calibrate',
        data: calibrationData,
      }));
    }
  }

  public updateConfig(config: Partial<Config>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'update_config',
        data: config,
      }));
    }
  }

  public disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}