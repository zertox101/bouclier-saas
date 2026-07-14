# Alert Sound Files

This directory contains audio files for security alert notifications.

## Files Required

- `alert-critical.mp3` - Critical severity alerts (urgent, loud)
- `alert-high.mp3` - High severity alerts (warning tone)
- `alert-medium.mp3` - Medium severity alerts (notification beep)
- `alert-info.mp3` - Info severity alerts (soft notification)

## Sound Specifications

### Critical Alert
- Duration: 1-2 seconds
- Type: Siren or urgent alarm
- Volume: Loud (will be controlled by user settings)
- Example: Two-tone siren, emergency alert

### High Alert
- Duration: 0.5-1 second
- Type: Warning beep (3 rapid beeps)
- Volume: Medium-high
- Example: Beep-beep-beep pattern

### Medium Alert
- Duration: 0.3-0.5 seconds
- Type: Single notification beep
- Volume: Medium
- Example: Single "ding" or "beep"

### Info Alert
- Duration: 0.2-0.3 seconds
- Type: Soft notification
- Volume: Low-medium
- Example: Soft "pop" or "click"

## Fallback

If audio files are not found, the system will generate synthetic beeps using Web Audio API with different frequencies for each severity level.

## Adding Custom Sounds

1. Place your MP3 files in this directory
2. Ensure filenames match exactly: `alert-{severity}.mp3`
3. Test using the Settings → Notifications page
4. Adjust volume in notification settings

## Free Sound Resources

- **Freesound.org**: https://freesound.org/
- **Zapsplat**: https://www.zapsplat.com/
- **Notification Sounds**: https://notificationsounds.com/

## License

Ensure any sounds you add are properly licensed for commercial use.
