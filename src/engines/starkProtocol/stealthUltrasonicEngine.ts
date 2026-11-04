/**
 * StealthUltrasonicEngine (Zero-Knowledge Classroom Presence Quorum)
 * 
 * Implements Option 1:
 * - 5 students inside the PSGIM geofence are randomly chosen as Acoustic Seeds.
 * - Their phones silently emit inaudible ultrasound (~19.1 kHz) in the classroom.
 * - All other students physically sitting in that room silently detect the ultrasound
 *   and have their attendance automatically marked as Attended with zero manual effort.
 * - No student is ever alerted about ultrasound; it operates 100% invisibly in the background.
 * - Students outside the room (hostel/bunking) cannot hear the sound and stay unverified.
 */

import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { GeofenceEngine, Coordinates } from './geofenceEngine';

export interface GeofencePeerPresence {
  rollNo: string;
  studentName: string;
  batch: string;
  room: string;
  periodKey: string;
  timestamp: number;
  isGeofenced: boolean;
}

export interface StealthQuorumState {
  periodKey: string;
  batch: string;
  isGeofenced: boolean;
  isSeed: boolean;
  selectedSeeds: string[];
  totalGeofencedCount: number;
}

// Inaudible acoustic frequency in Hertz (19.1 kHz)
// Far above adult human hearing (~16 kHz limit), perfectly captured by mobile phone microphones
export const STEALTH_ULTRASONIC_FREQ = 19100;

// Internal handles
let activeTransmitter: { stop: () => void } | null = null;
let isAudioContextUnlocked = false;

// Simple deterministic PRNG based on string seed
function seededRandom(seedStr: string): number {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    const char = seedStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const x = Math.sin(hash++) * 10000;
  return x - Math.floor(x);
}

// Deterministically picks up to N seeds from a list of roll numbers
function pickSeeds(candidateRolls: string[], count: number, seedKey: string): string[] {
  if (candidateRolls.length <= count) {
    return [...candidateRolls];
  }

  const pool = [...candidateRolls].sort();
  const selected: string[] = [];
  let salt = 0;

  while (selected.length < count && pool.length > 0) {
    const rand = seededRandom(`${seedKey}_${salt}`);
    const index = Math.floor(rand * pool.length);
    selected.push(pool.splice(index, 1)[0]);
    salt++;
  }

  return selected;
}

export const StealthUltrasonicEngine = {
  /**
   * Pre-unlocks Web Audio on first user touch anywhere on the screen
   */
  unlockAudioContext(): void {
    if (typeof window === 'undefined' || isAudioContextUnlocked) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      isAudioContextUnlocked = true;
    } catch {
      // Non-blocking
    }
  },

  /**
   * Verifies if the device is currently physically inside the PSGIM geofence
   * and records permission telemetry (GRANTED vs DENIED).
   */
  async checkGeofence(rollNo?: string): Promise<{ isGeofenced: boolean; coords?: Coordinates; permissionStatus?: 'GRANTED' | 'DENIED' | 'UNSUPPORTED' }> {
    try {
      const { coords, status } = await GeofenceEngine.requestAndTrackLocation(rollNo);
      if (!coords) {
        return { isGeofenced: false, permissionStatus: status };
      }
      const result = GeofenceEngine.verifyLocation(coords, 'MAIN_CAMPUS');
      return {
        isGeofenced: result.isWithinCampus,
        coords,
        permissionStatus: status,
      };
    } catch {
      return { isGeofenced: false, permissionStatus: 'DENIED' };
    }
  },

  /**
   * Silently registers presence in the real-time geofence mesh
   */
  async registerGeofencePresence(
    rollNo: string,
    studentName: string,
    batch: string,
    room: string,
    periodKey: string
  ): Promise<void> {
    if (!rollNo || !periodKey) return;

    try {
      const cleanRoll = rollNo.toUpperCase().trim();
      const docId = `${periodKey}_${cleanRoll}`;
      const docRef = doc(db, 'classroom_geofence_mesh', docId);

      const record: GeofencePeerPresence = {
        rollNo: cleanRoll,
        studentName: studentName || cleanRoll,
        batch: batch || 'A',
        room: room || 'LH-101',
        periodKey,
        timestamp: Date.now(),
        isGeofenced: true,
      };

      await setDoc(docRef, record, { merge: true });
    } catch (e) {
      console.warn('[StealthQuorum] registerGeofencePresence offline/failed:', e);
    }
  },

  /**
   * Fetches active geofenced students in this batch and evaluates if the student is 1 of the 5 seeds
   */
  async evaluateQuorum(
    rollNo: string,
    batch: string,
    periodKey: string
  ): Promise<StealthQuorumState> {
    const cleanRoll = rollNo.toUpperCase().trim();
    const cleanBatch = (batch || 'A').toUpperCase().trim();
    const seedKey = `${periodKey}_batch_${cleanBatch}`;

    let geofencedRolls: string[] = [];

    try {
      const meshCol = collection(db, 'classroom_geofence_mesh');
      const q = query(
        meshCol,
        where('periodKey', '==', periodKey),
        where('batch', '==', cleanBatch),
        where('isGeofenced', '==', true)
      );

      const snap = await getDocs(q);
      const now = Date.now();
      const cutoffTime = now - 15 * 60 * 1000; // Active within last 15 mins

      snap.forEach((d) => {
        const data = d.data() as GeofencePeerPresence;
        if (data && data.rollNo && data.timestamp >= cutoffTime) {
          if (!geofencedRolls.includes(data.rollNo)) {
            geofencedRolls.push(data.rollNo);
          }
        }
      });
    } catch (e) {
      console.warn('[StealthQuorum] evaluateQuorum failed:', e);
    }

    // Ensure self is included if verified locally
    if (!geofencedRolls.includes(cleanRoll)) {
      geofencedRolls.push(cleanRoll);
    }

    // Deterministically pick 5 seeds among all geofenced peers
    const selectedSeeds = pickSeeds(geofencedRolls, 5, seedKey);
    const isSeed = selectedSeeds.includes(cleanRoll);

    return {
      periodKey,
      batch: cleanBatch,
      isGeofenced: true,
      isSeed,
      selectedSeeds,
      totalGeofencedCount: geofencedRolls.length,
    };
  },

  /**
   * Silently broadcasts the inaudible ultrasound tone from the phone's speaker.
   * Completely imperceptible to humans (19.1 kHz) with smooth fade envelope.
   */
  startSilentBeacon(durationSeconds: number = 45): { stop: () => void } | null {
    if (typeof window === 'undefined') return null;

    // Stop existing transmitter if already running
    if (activeTransmitter) {
      try {
        activeTransmitter.stop();
      } catch {}
      activeTransmitter = null;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;

    try {
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(STEALTH_ULTRASONIC_FREQ, audioCtx.currentTime);

      // Smooth anti-click envelope: 0.1s fade in, sustain, 0.2s fade out
      const now = audioCtx.currentTime;
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.3, now + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds - 0.2);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + durationSeconds);

      const stopFn = () => {
        try {
          gainNode.gain.setValueAtTime(0.00001, audioCtx.currentTime);
          osc.stop();
          audioCtx.close();
        } catch {}
        if (activeTransmitter?.stop === stopFn) {
          activeTransmitter = null;
        }
      };

      activeTransmitter = { stop: stopFn };
      return activeTransmitter;
    } catch (e) {
      console.warn('[StealthQuorum] silent beacon failed to start:', e);
      return null;
    }
  },

  /**
   * Silently samples microphone audio for 1.6s to check for the classroom ultrasonic tone.
   * Returns true if the inaudible tone from any of the 5 seeds is heard.
   */
  async listenForClassroomSeeds(listenDurationMs: number = 1600): Promise<boolean> {
    if (
      typeof window === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      return false;
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

      // High-resolution FFT analyzer
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048; // ~21.5 Hz resolution per bin
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const sampleRate = audioCtx.sampleRate;

      const startTime = Date.now();
      let maxMagnitude = 0;
      let peakFrequency = 0;

      while (Date.now() - startTime < listenDurationMs) {
        analyser.getByteFrequencyData(dataArray);

        // Scan the ultrasonic band (18.5 kHz - 19.8 kHz)
        for (let i = 0; i < bufferLength; i++) {
          const freq = (i * sampleRate) / analyser.fftSize;
          if (freq >= 18800 && freq <= 19400) {
            const mag = dataArray[i];
            if (mag > maxMagnitude) {
              maxMagnitude = mag;
              peakFrequency = freq;
            }
          }
        }
        await new Promise((r) => setTimeout(r, 60));
      }

      // Check if peak frequency is close to 19.1 kHz with reasonable magnitude
      const delta = Math.abs(peakFrequency - STEALTH_ULTRASONIC_FREQ);
      const detected = delta <= 200 && maxMagnitude >= 35;

      return detected;
    } catch {
      // Permission denied or microphone not ready
      return false;
    } finally {
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

  /**
   * Master Stealth Execution Cycle:
   * Called automatically when the student opens or uses the app during class.
   * - If student is in Geofence: registers heartbeat.
   * - If student is 1 of 5 seeds: silently emits ultrasound and marks attended.
   * - If student is among other ~55: silently listens for ultrasound and auto-marks attended.
   */
  async runStealthAttendanceCycle(params: {
    rollNo: string;
    studentName: string;
    batch: string;
    room: string;
    periodKey: string;
    alreadyMarked: boolean;
    onAutoMark: () => Promise<void>;
  }): Promise<{ success: boolean; reason: string }> {
    const { rollNo, studentName, batch, room, periodKey, alreadyMarked, onAutoMark } = params;
    if (!rollNo || !periodKey) {
      return { success: false, reason: 'Missing parameters' };
    }

    // 1. Check Geofence
    const { isGeofenced } = await this.checkGeofence(rollNo);
    if (!isGeofenced) {
      // Outside campus geofence: cannot be a seed or register presence
      return { success: false, reason: 'Outside geofence' };
    }

    // 2. Register presence inside geofence
    await this.registerGeofencePresence(rollNo, studentName, batch, room, periodKey);

    // 3. Evaluate Quorum Seeds
    const quorum = await this.evaluateQuorum(rollNo, batch, periodKey);

    if (quorum.isSeed) {
      // Current student is 1 of 5 chosen seeds:
      // Silently emit ultrasound beacon so classmates in the room can get marked
      this.startSilentBeacon(45);

      // Automatically mark own attendance
      if (!alreadyMarked) {
        await onAutoMark();
      }
      return { success: true, reason: 'Acoustic Seed Beacon Active' };
    }

    // 4. Current student is one of the other ~55 students:
    // If not already marked, silently listen for ultrasound from the 5 seeds in the room
    if (!alreadyMarked) {
      const heard = await this.listenForClassroomSeeds(1800);
      if (heard) {
        // Physical presence in classroom verified!
        await onAutoMark();
        return { success: true, reason: 'Classroom Acoustic Verified' };
      }
    }

    return { success: false, reason: 'Acoustic not heard' };
  },
};
