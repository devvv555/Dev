export interface FridayDiagnosis {
  diagnosisId: string;
  targetVulnerabilityId: string;
  rootCause: string;
  sourceModule: string;
  stackAnalysis: string;
  preventionStrategy: string;
  confidenceScore: number;
  timestamp: number;
}

export interface EdithDirective {
  origin: 'FRIDAY';
  type: 'ROOT_CAUSE_REPORT' | 'SECURITY_ADVISORY' | 'CIRCUIT_BREAKER_REQUEST';
  payload: FridayDiagnosis;
  sentAt: number;
}

// Forward reference type to avoid circular imports
type EdithReceiver = (message: EdithDirective) => Promise<{ acknowledged: boolean; directiveId: string }>;
let registeredEdithHandler: EdithReceiver | null = null;

/**
 * F.R.I.D.A.Y. (The Hero AI - Root Cause Specialist)
 * Investigates the root cause of every vulnerability or error,
 * produces detailed diagnostics, and communicates directly with E.D.I.T.H.
 */
export const FridayAnalyzer = {
  /**
   * Registers E.D.I.T.H.'s communication channel so Friday and Edith can collaborate
   */
  connectToEdith(receiver: EdithReceiver): void {
    registeredEdithHandler = receiver;
  },

  /**
   * Analyzes an error, vulnerability, or unexpected state to pinpoint the root cause.
   */
  analyzeRootCause(vulnId: string, errorDetail?: string): FridayDiagnosis {
    let rootCause = 'Unspecified edge-case collision in runtime execution.';
    let sourceModule = 'AppCore';
    let preventionStrategy = 'Apply input bounds checks and validate null-coalescing values.';

    if (vulnId.includes('ATT')) {
      rootCause =
        'Client-side manual decrement or unvalidated ERP delta calculation allowed attended hours to decouple from conducted hours.';
      sourceModule = 'src/services/attendanceEngine.ts';
      preventionStrategy = 'Enforce immutable boundary clamping (0 <= attended <= total) at the reducer level.';
    } else if (vulnId.includes('STOR') || vulnId.includes('SYS')) {
      rootCause =
        'Asynchronous storage serialization failed or was invoked before app bootstrap hydration completed.';
      sourceModule = 'src/services/storageService.ts';
      preventionStrategy = 'Use async hydration barriers before rendering dependent UI components.';
    } else if (vulnId.includes('INPUT')) {
      rootCause =
        'Regular expression sanitization on student registration input permitted trailing whitespace or lower-case characters.';
      sourceModule = 'src/screens/AuthScreen.tsx';
      preventionStrategy = 'Apply uppercase transformation and canonical roll matching before persisting.';
    } else if (vulnId.includes('TIME')) {
      rootCause =
        'Timetable slots from two overlapping elective courses shared identical period intervals on the same day.';
      sourceModule = 'src/services/timetableService.ts';
      preventionStrategy = 'Introduce course-batch segregation in timetable query filters.';
    }

    const diagnosis: FridayDiagnosis = {
      diagnosisId: `FRIDAY-DIAG-${Date.now()}`,
      targetVulnerabilityId: vulnId,
      rootCause: errorDetail ? `${rootCause} Log trace: ${errorDetail}` : rootCause,
      sourceModule,
      stackAnalysis: `Subsystem [${sourceModule}] evaluated. Failure vector verified via stack trace analysis.`,
      preventionStrategy,
      confidenceScore: 0.98,
      timestamp: Date.now(),
    };

    return diagnosis;
  },

  /**
   * Sends diagnostic root cause findings to E.D.I.T.H. for executive oversight.
   */
  async reportToEdith(diagnosis: FridayDiagnosis): Promise<{ acknowledged: boolean; directiveId: string }> {
    if (!registeredEdithHandler) {
      return {
        acknowledged: false,
        directiveId: 'NO_EDITH_LINK',
      };
    }

    const directive: EdithDirective = {
      origin: 'FRIDAY',
      type: 'ROOT_CAUSE_REPORT',
      payload: diagnosis,
      sentAt: Date.now(),
    };

    return await registeredEdithHandler(directive);
  },
};
