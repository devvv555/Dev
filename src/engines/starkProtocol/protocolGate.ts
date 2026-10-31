import AsyncStorage from '@react-native-async-storage/async-storage';

export type ProtocolMode = 'TRAINING_WHEELS' | 'ENHANCED_SUIT';

export interface ProtocolFeatures {
  // Level 1: Standard Features (Always visible to regular users)
  attendanceTracking: boolean;
  timetableSchedule: boolean;
  cutoffSafetyMargin: boolean;
  studzoneSync: boolean;
  moodleDeadlines: boolean;

  // Level 2: Unlocked Jibble-grade Features (Activated via Ned Bypass)
  gpsCampusGeofencing: boolean;
  biometricSelfieAudit: boolean;
  classroomKioskMode: boolean;
  liveTimesheetEngine: boolean;
  proxyAttendanceAudit: boolean;
  disputeEvidenceVault: boolean;
  whatIfLeaveForecaster: boolean;
  acousticRoomRadar: boolean;
  crowdMeshConsensus: boolean;
}

const STORAGE_KEYS = {
  PROTOCOL_MODE: '@stark_protocol_mode',
  PASSCODE_HASH: '@stark_protocol_passcode',
  TAP_STAMP: '@stark_protocol_tap_stamp',
};

// Sliding window timestamp tracker for 5-tap detection
let tapTimestamps: number[] = [];
let modeListeners: Array<(mode: ProtocolMode) => void> = [];

// Default standard state (Spider-Man suit on Training Wheels)
const DEFAULT_FEATURES: Record<ProtocolMode, ProtocolFeatures> = {
  TRAINING_WHEELS: {
    attendanceTracking: true,
    timetableSchedule: true,
    cutoffSafetyMargin: true,
    studzoneSync: true,
    moodleDeadlines: true,
    gpsCampusGeofencing: false,
    biometricSelfieAudit: false,
    classroomKioskMode: false,
    liveTimesheetEngine: false,
    proxyAttendanceAudit: false,
    disputeEvidenceVault: false,
    whatIfLeaveForecaster: false,
    acousticRoomRadar: false,
    crowdMeshConsensus: false,
  },
  ENHANCED_SUIT: {
    attendanceTracking: true,
    timetableSchedule: true,
    cutoffSafetyMargin: true,
    studzoneSync: true,
    moodleDeadlines: true,
    gpsCampusGeofencing: true,
    biometricSelfieAudit: true,
    classroomKioskMode: true,
    liveTimesheetEngine: true,
    proxyAttendanceAudit: true,
    disputeEvidenceVault: true,
    whatIfLeaveForecaster: true,
    acousticRoomRadar: true,
    crowdMeshConsensus: true,
  },
};

// Secret passcodes that instantly disengage Training Wheels
const UNLOCK_PASSCODES = ['STARK576', 'KAREN', 'PETERPARKER', 'EDITH', 'PSGIM2026'];

export const ProtocolGate = {
  /**
   * Retrieves the current protocol tier
   */
  async getCurrentMode(): Promise<ProtocolMode> {
    try {
      const mode = await AsyncStorage.getItem(STORAGE_KEYS.PROTOCOL_MODE);
      return mode === 'ENHANCED_SUIT' ? 'ENHANCED_SUIT' : 'TRAINING_WHEELS';
    } catch {
      return 'TRAINING_WHEELS';
    }
  },

  /**
   * Returns active feature permissions based on protocol tier
   */
  async getFeatures(): Promise<ProtocolFeatures> {
    const mode = await this.getCurrentMode();
    return DEFAULT_FEATURES[mode];
  },

  /**
   * Checks whether the Enhanced Suit is active
   */
  async isSuitUnlocked(): Promise<boolean> {
    const mode = await this.getCurrentMode();
    return mode === 'ENHANCED_SUIT';
  },

  /**
   * Unlocks the full suit using a secret bypass code
   */
  async unlockSuit(passcode: string): Promise<{ success: boolean; message: string }> {
    const clean = passcode.trim().toUpperCase();
    if (UNLOCK_PASSCODES.includes(clean)) {
      await AsyncStorage.setItem(STORAGE_KEYS.PROTOCOL_MODE, 'ENHANCED_SUIT');
      modeListeners.forEach((fn) => {
        try { fn('ENHANCED_SUIT'); } catch {}
      });
      return {
        success: true,
        message: 'Training Wheels Protocol disengaged. Full Enhanced Suit capabilities active.',
      };
    }
    return {
      success: false,
      message: 'Access Denied: Invalid protocol bypass sequence.',
    };
  },

  /**
   * Re-engages the Training Wheels protocol (resets to subtle student mode)
   */
  async engageTrainingWheels(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.PROTOCOL_MODE, 'TRAINING_WHEELS');
    modeListeners.forEach((fn) => {
      try { fn('TRAINING_WHEELS'); } catch {}
    });
  },

  /**
   * Subscribe to real-time mode changes
   */
  onModeChange(callback: (mode: ProtocolMode) => void): () => void {
    modeListeners.push(callback);
    return () => {
      modeListeners = modeListeners.filter((cb) => cb !== callback);
    };
  },

  /**
   * Sliding window tap detector (5 taps within 2.5 seconds on logo)
   */
  recordTap(timeWindowMs: number = 2500, threshold: number = 5): boolean {
    const now = Date.now();
    tapTimestamps = tapTimestamps.filter((t) => now - t <= timeWindowMs);
    tapTimestamps.push(now);
    if (tapTimestamps.length >= threshold) {
      tapTimestamps = []; // reset after trigger
      return true;
    }
    return false;
  },

  resetTaps(): void {
    tapTimestamps = [];
  },

  /**
   * Easter egg tap detector (legacy threshold check)
   */
  registerTap(tapCount: number, timeWindowMs: number = 2500): boolean {
    return tapCount >= 5;
  },
};

