export class SoundAlertService {
  private audio: HTMLAudioElement | null = null;
  private isEnabled: boolean = true;
  private volume: number = 0.7;

  constructor() {
    this.initializeAudio();
  }

  private initializeAudio() {
    try {
      // Try to load custom alert sound
      this.audio = new Audio('/sounds/severe-alert.wav');
      this.audio.volume = this.volume;
      this.audio.preload = 'auto';
      
      // Fallback if custom sound fails to load
      this.audio.onerror = () => {
        console.warn('Custom alert sound failed to load, using fallback');
        this.audio = null;
      };
    } catch (error) {
      console.warn('Failed to initialize custom alert sound:', error);
      this.audio = null;
    }
  }

  public async playAlertSound(): Promise<void> {
    if (!this.isEnabled) {
      console.log('[SoundAlert] Audio disabled, skipping sound');
      return;
    }

    console.log('[SoundAlert] Attempting to play sound...', {
      hasAudio: !!this.audio,
      audioReady: this.audio?.readyState >= 2,
      volume: this.volume
    });

    try {
      if (this.audio && this.audio.readyState >= 2) {
        // Reset audio to beginning and play
        this.audio.currentTime = 0;
        console.log('[SoundAlert] Playing custom audio file');
        await this.audio.play();
        console.log('[SoundAlert] Custom audio played successfully');
      } else {
        console.log('[SoundAlert] Custom audio not ready, using system beep');
        // Fallback to system beep
        this.playSystemBeep();
      }
    } catch (error) {
      console.warn('[SoundAlert] Failed to play alert sound, using fallback:', error);
      this.playSystemBeep();
    }
  }

  private playSystemBeep(): void {
    // Create a short beep using Web Audio API
    try {
      console.log('[SoundAlert] Creating system beep with Web Audio API');
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800Hz tone
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      console.log('[SoundAlert] System beep initiated successfully');
    } catch (error) {
      console.warn('[SoundAlert] Failed to create system beep:', error);
    }
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public isAudioEnabled(): boolean {
    return this.isEnabled;
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  // Request audio permission (for browsers that require user interaction)
  public async requestAudioPermission(): Promise<boolean> {
    try {
      if (this.audio) {
        await this.audio.play();
        this.audio.pause();
        this.audio.currentTime = 0;
      }
      return true;
    } catch (error) {
      console.warn('Audio permission not granted:', error);
      return false;
    }
  }
}

export class SevereAlertTracker {
  private timestamps: number[] = [];
  private lastSoundPlayed: number = 0;
  private firstAlertTime: number = 0;
  private lastAlertTime: number = 0;
  private currentPhase: number = 0; // 0=no alerts, 1=grace period, 2=initial urgency, 3=max urgency
  
  // Phase configuration
  private readonly gracePeriod: number = 5000; // 5 seconds - no sound
  private readonly phase2Duration: number = 5000; // 5 seconds - sound every 2s 
  private readonly phase2Interval: number = 2000; // 2 seconds between sounds
  private readonly phase3Interval: number = 1000; // 1 second between sounds
  private readonly alertGapReset: number = 3000; // Reset if no alerts for 3 seconds
  private readonly alertThreshold: number = 2; // Still need 2 alerts to start tracking

  private soundService: SoundAlertService;

  constructor(soundService: SoundAlertService) {
    this.soundService = soundService;
  }

  public processSevereAlerts(alerts: Array<{ severity: string; timestamp: string; message?: string }>): boolean {
    const now = Date.now();
    
    // Enhanced debug logging - show ALL alert details first
    console.log('[SoundAlert] === ALERT PROCESSING START ===');
    console.log('[SoundAlert] Raw alerts received:', alerts.map(a => ({
      severity: a.severity,
      message: a.message,
      timestamp: a.timestamp
    })));
    
    const currentCriticalAlerts = alerts.filter(alert => alert.severity === 'severe' || alert.severity === 'warning');

    // Check if we have critical alerts
    const hasCriticalAlerts = currentCriticalAlerts.length > 0;
    
    // Reset logic: if no critical alerts for alertGapReset period, reset everything
    if (!hasCriticalAlerts && (now - this.lastAlertTime) > this.alertGapReset) {
      this.resetAlertTracking(now);
    }
    
    // Update last alert time if we have critical alerts
    if (hasCriticalAlerts) {
      this.lastAlertTime = now;
      
      // Initialize first alert time if this is the start of a new alert series
      if (this.firstAlertTime === 0 || this.currentPhase === 0) {
        this.firstAlertTime = now;
        this.currentPhase = 1; // Enter grace period
        console.log('[SoundAlert] Starting new alert series - entering grace period');
      }
    }
    
    // Update current phase based on time elapsed
    this.updateCurrentPhase(now);
    
    // Determine if sound should be triggered based on current phase
    const shouldPlaySound = this.shouldTriggerSoundByPhase(now, hasCriticalAlerts);
    
    console.log('[SoundAlert] Progressive alert state:', {
      hasCriticalAlerts,
      currentPhase: this.currentPhase,
      timeSinceFirstAlert: this.firstAlertTime > 0 ? (now - this.firstAlertTime) / 1000 + 's' : 'N/A',
      timeSinceLastSound: this.lastSoundPlayed > 0 ? (now - this.lastSoundPlayed) / 1000 + 's' : 'never',
      shouldPlaySound,
      criticalMessages: currentCriticalAlerts.map(a => a.message || 'no message')
    });

    if (shouldPlaySound) {
      console.log('[SoundAlert] TRIGGERING SOUND ALERT! Phase:', this.currentPhase);
      console.log('[SoundAlert] === ALERT PROCESSING END ===', {
        finalResult: true,
        phase: this.currentPhase
      });
      this.triggerSoundAlert(now);
      return true;
    }

    console.log('[SoundAlert] === ALERT PROCESSING END ===', {
      finalResult: false,
      phase: this.currentPhase,
      hasCriticalAlerts
    });
    
    return false;
  }

  private resetAlertTracking(currentTime: number): void {
    if (this.currentPhase !== 0) {
      console.log('[SoundAlert] Resetting alert tracking - no alerts for', this.alertGapReset / 1000, 'seconds');
    }
    this.firstAlertTime = 0;
    this.lastAlertTime = 0;
    this.currentPhase = 0;
    this.timestamps = [];
  }
  
  private updateCurrentPhase(currentTime: number): void {
    if (this.firstAlertTime === 0) {
      this.currentPhase = 0;
      return;
    }
    
    const timeSinceFirst = currentTime - this.firstAlertTime;
    const oldPhase = this.currentPhase;
    
    if (timeSinceFirst < this.gracePeriod) {
      this.currentPhase = 1; // Grace period - no sound
    } else if (timeSinceFirst < (this.gracePeriod + this.phase2Duration)) {
      this.currentPhase = 2; // Initial urgency - sound every 2s
    } else {
      this.currentPhase = 3; // Maximum urgency - sound every 1s
    }
    
    if (oldPhase !== this.currentPhase) {
      const phaseNames = ['idle', 'grace period', 'initial urgency', 'maximum urgency'];
      console.log('[SoundAlert] Phase transition:', phaseNames[oldPhase], '->', phaseNames[this.currentPhase]);
    }
  }
  
  private shouldTriggerSoundByPhase(currentTime: number, hasCriticalAlerts: boolean): boolean {
    // No sound during grace period or when no critical alerts
    if (this.currentPhase <= 1 || !hasCriticalAlerts) {
      return false;
    }
    
    // Determine cooldown interval based on current phase
    const cooldownInterval = this.currentPhase === 2 ? this.phase2Interval : this.phase3Interval;
    
    // Check if enough time has passed since last sound
    const timeSinceLastSound = currentTime - this.lastSoundPlayed;
    const cooldownExpired = timeSinceLastSound >= cooldownInterval;
    
    console.log('[SoundAlert] Cooldown check:', {
      phase: this.currentPhase,
      requiredInterval: cooldownInterval / 1000 + 's',
      timeSinceLastSound: timeSinceLastSound / 1000 + 's',
      cooldownExpired
    });
    
    return cooldownExpired;
  }

  private async triggerSoundAlert(currentTime: number): Promise<void> {
    console.log('[SoundAlert] Triggering sound alert at:', new Date(currentTime).toLocaleTimeString());
    this.lastSoundPlayed = currentTime;
    await this.soundService.playAlertSound();
    console.log('[SoundAlert] Sound alert completed');
  }

  public getCurrentAlertCount(): number {
    // Return current phase instead of raw alert count for better UI feedback
    return this.currentPhase;
  }

  public getTimeSinceLastSound(): number {
    return Date.now() - this.lastSoundPlayed;
  }

  public getRemainingCooldown(): number {
    if (this.currentPhase <= 1) return 0;
    const interval = this.currentPhase === 2 ? this.phase2Interval : this.phase3Interval;
    const remaining = interval - this.getTimeSinceLastSound();
    return Math.max(0, remaining);
  }

  public reset(): void {
    this.resetAlertTracking(Date.now());
    this.lastSoundPlayed = 0;
  }

  public getCurrentPhase(): number {
    return this.currentPhase;
  }

  public getPhaseDescription(): string {
    const descriptions = ['Idle', 'Grace Period', 'Initial Urgency', 'Maximum Urgency'];
    return descriptions[this.currentPhase] || 'Unknown';
  }

  public getTimeSinceFirstAlert(): number {
    return this.firstAlertTime > 0 ? Date.now() - this.firstAlertTime : 0;
  }

  // Configuration getters
  public getConfig() {
    return {
      gracePeriod: this.gracePeriod,
      phase2Duration: this.phase2Duration,
      phase2Interval: this.phase2Interval,
      phase3Interval: this.phase3Interval,
      alertGapReset: this.alertGapReset,
    };
  }
}