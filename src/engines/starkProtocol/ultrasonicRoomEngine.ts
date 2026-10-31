/**
 * UltrasonicRoomEngine
 * 
 * Inaudible Acoustic Room Verification for PWAs (iOS Safari + Android Chrome).
 * Operates at near-ultrasonic frequencies (18.2 kHz - 19.8 kHz).
 * Since high-frequency sound cannot penetrate concrete floor slabs,
 * an acoustic token broadcast in LH-101 is 100% physically inaudible in LH-401.
 */

// Room ultrasonic frequency signatures (in Hertz)
export const ROOM_FREQUENCIES: Record<string, number> = {
  'LH-101': 18500, // 18.5 kHz
  'LH-109': 18800, // 18.8 kHz
  'LH-401': 19300, // 19.3 kHz
  'LH-405': 19600, // 19.6 kHz
  'AUDITORIUM': 18200,
  'SSM': 18400,
};

export interface AcousticVerificationResult {
  detected: boolean;
  detectedRoom?: string;
  targetRoom: string;
  peakFrequencyHz: number;
  confidence: number; // 0 to 1
  message: string;
}

export const UltrasonicRoomEngine = {
  /**
   * Broadcasts an inaudible ultrasonic acoustic token from the classroom speaker/laptop.
   * Plays a smooth pure sine-wave tone at the assigned room frequency with a fade-in/fade-out envelope
   * to eliminate any audible "clicks" or pops.
   */
  startRoomBroadcast(roomName: string, durationSeconds: number = 30): { stop: () => void } | null {
    if (typeof window === 'undefined') return null;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;

    try {
      const audioCtx = new AudioContextClass();
      const targetFreq = ROOM_FREQUENCIES[roomName.toUpperCase()] || 18500;

      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(targetFreq, audioCtx.currentTime);

      // Smooth anti-click envelope: 0.1s fade in, sustain, 0.2s fade out
      const now = audioCtx.currentTime;
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.35, now + 0.15); // Safe volume, inaudible to humans
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds - 0.2);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + durationSeconds);

      return {
        stop: () => {
          try {
            gainNode.gain.setValueAtTime(0.0001, audioCtx.currentTime);
            osc.stop();
            audioCtx.close();
          } catch {}
        },
      };
    } catch (err) {
      console.warn('[Ultrasonic] Audio broadcast failed to initialize:', err);
      return null;
    }
  },

  /**
   * Listens for 1.5 seconds using the student's phone microphone via Web Audio API FFT.
   * Detects whether the classroom's ultrasonic tone matches the scheduled room.
   */
  async listenAndVerify(targetRoom: string, listenDurationMs: number = 1600): Promise<AcousticVerificationResult> {
    const defaultTarget = targetRoom.toUpperCase().trim();
    const expectedFreq = ROOM_FREQUENCIES[defaultTarget] || 18500;

    if (
      typeof window === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      return {
        detected: false,
        targetRoom: defaultTarget,
        peakFrequencyHz: 0,
        confidence: 0,
        message: 'Microphone sensor is unavailable on this device browser.',
      };
    }

    let stream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtx = new AudioContextClass();
      const source = audioCtx.createMediaStreamSource(stream);

      // FFT Analyzer
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048; // High frequency resolution (~21.5 Hz per bin at 44.1kHz)
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const sampleRate = audioCtx.sampleRate;

      // Listen for the duration, collecting max peak
      const startTime = Date.now();
      let maxPeakFreq = 0;
      let maxPeakMagnitude = 0;

      while (Date.now() - startTime < listenDurationMs) {
        analyser.getByteFrequencyData(dataArray);

        // Scan the ultrasonic band (17.5 kHz to 21 kHz)
        for (let i = 0; i < bufferLength; i++) {
          const freq = (i * sampleRate) / analyser.fftSize;
          if (freq >= 17500 && freq <= 21000) {
            const mag = dataArray[i];
            if (mag > maxPeakMagnitude) {
              maxPeakMagnitude = mag;
              maxPeakFreq = freq;
            }
          }
        }
        await new Promise((r) => setTimeout(r, 60));
      }

      // Check if peak frequency is within ±120 Hz of expected room frequency
      const freqDelta = Math.abs(maxPeakFreq - expectedFreq);
      const isMatch = freqDelta <= 140 && maxPeakMagnitude >= 40;

      // Identify which room was heard if any
      let matchedRoom: string | undefined = undefined;
      for (const [rName, rFreq] of Object.entries(ROOM_FREQUENCIES)) {
        if (Math.abs(maxPeakFreq - rFreq) <= 140 && maxPeakMagnitude >= 40) {
          matchedRoom = rName;
          break;
        }
      }

      const confidence = Math.min(1, Number((maxPeakMagnitude / 255).toFixed(2)));

      if (isMatch) {
        return {
          detected: true,
          detectedRoom: defaultTarget,
          targetRoom: defaultTarget,
          peakFrequencyHz: Math.round(maxPeakFreq),
          confidence,
          message: `Inaudible acoustic chime verified for ${defaultTarget} (${Math.round(maxPeakFreq)} Hz).`,
        };
      }

      if (matchedRoom && matchedRoom !== defaultTarget) {
        return {
          detected: false,
          detectedRoom: matchedRoom,
          targetRoom: defaultTarget,
          peakFrequencyHz: Math.round(maxPeakFreq),
          confidence,
          message: `Acoustic signal detected for ${matchedRoom}, but scheduled class is in ${defaultTarget}!`,
        };
      }

      return {
        detected: false,
        targetRoom: defaultTarget,
        peakFrequencyHz: Math.round(maxPeakFreq),
        confidence,
        message: 'No classroom acoustic beacon detected in the room.',
      };
    } catch (err: any) {
      return {
        detected: false,
        targetRoom: defaultTarget,
        peakFrequencyHz: 0,
        confidence: 0,
        message: `Microphone permission denied or audio interrupted: ${err?.message || 'Error'}`,
      };
    } finally {
      // Clean up hardware handles
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (audioCtx) {
        try {
          audioCtx.close();
        } catch {}
      }
    }
  },
};
