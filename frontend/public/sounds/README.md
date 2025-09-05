# Sound Alert Files

This directory should contain audio files for driver alert notifications.

## Required Files:

### severe-alert.wav
- **Duration**: 0.3-0.5 seconds
- **Format**: WAV or MP3
- **Purpose**: Play when severe alerts are repeated 3+ times in 5 seconds
- **Characteristics**: 
  - Clear, attention-grabbing tone
  - Not too jarring or startling
  - Medium pitch (600-1000 Hz)
  - Professional alert sound

## Fallback Behavior:
If audio files are not available, the system will:
1. Use Web Audio API to generate a synthetic beep tone
2. 800Hz sine wave for 0.3 seconds
3. Configurable volume level

## Browser Compatibility:
- Modern browsers support MP3 and WAV
- Some browsers require user interaction before playing audio
- Autoplay policies may affect initial playback
- Service includes permission handling for audio

## Testing:
- Ensure files load properly in browser
- Test volume levels are appropriate
- Verify fallback behavior works
- Check performance impact of audio loading