import { FridayDiagnosis, FridayAnalyzer } from './fridayAnalyzer';

export interface EdithSystemStatus {
  service: 'ULTRON' | 'JARVIS' | 'FRIDAY' | 'DUME_U' | 'KAREN' | 'MISS_MINUTES';
  status: 'ONLINE' | 'ACTIVE' | 'DEVIATION_DETECTED' | 'STANDBY';
  lastActivity: number;
  unauthorizedCommunicationAttempts: number;
}

export interface EdithAuditLog {
  timestamp: number;
  event: string;
  sender: string;
  target?: string;
  authorized: boolean;
  actionTaken: string;
}

/**
 * E.D.I.T.H. (Even Dead, I'm The Hero)
 * Holds ultimate supervisory authority. Ensures all AIs perform their duties correctly.
 * Enforces the strict rule: NO AI can communicate with another AI,
 * EXCEPT Friday and Edith who have an exclusive bilateral tactical link.
 * Humans/Admins retain full control.
 */
class EdithSupervisorService {
  private auditLogs: EdithAuditLog[] = [];
  private receivedDiagnoses: FridayDiagnosis[] = [];

  constructor() {
    // Automatically establish the bilateral communication channel with Friday
    FridayAnalyzer.connectToEdith(this.receiveMessageFromFriday.bind(this));
  }

  /**
   * Receives incoming messages from Friday (the ONLY authorized AI partner)
   */
  async receiveMessageFromFriday(directive: {
    origin: 'FRIDAY';
    payload: FridayDiagnosis;
    sentAt: number;
  }): Promise<{ acknowledged: boolean; directiveId: string }> {
    const directiveId = `EDITH-ACK-${Date.now()}`;
    this.receivedDiagnoses.push(directive.payload);

    this.auditLogs.unshift({
      timestamp: Date.now(),
      event: `Received Root Cause Diagnostic from Friday for ${directive.payload.targetVulnerabilityId}`,
      sender: 'FRIDAY',
      target: 'EDITH',
      authorized: true,
      actionTaken: 'Authorized tactical intelligence received and logged.',
    });

    return {
      acknowledged: true,
      directiveId,
    };
  }

  /**
   * Intercepts and blocks any unauthorized inter-AI communications.
   * If any other AI attempts to talk to another AI, EDITH shuts it down.
   */
  validateInterAiCommunication(senderAi: string, receiverAi: string): boolean {
    const isFridayToEdith = senderAi === 'FRIDAY' && receiverAi === 'EDITH';
    const isEdithToFriday = senderAi === 'EDITH' && receiverAi === 'FRIDAY';

    if (isFridayToEdith || isEdithToFriday) {
      return true; // Authorized bilateral alliance
    }

    // Strict compromise policy: No other AI-to-AI communication permitted
    this.auditLogs.unshift({
      timestamp: Date.now(),
      event: `Blocked unauthorized communication attempt: ${senderAi} -> ${receiverAi}`,
      sender: senderAi,
      target: receiverAi,
      authorized: false,
      actionTaken: 'Inter-AI communication channel severed by EDITH protocol.',
    });

    return false;
  }

  /**
   * Evaluates system health across all AI modules
   */
  getSystemSupervisionOverview(): {
    aiFleet: EdithSystemStatus[];
    recentLogs: EdithAuditLog[];
    receivedDiagnosesCount: number;
    enforcementPolicy: string;
  } {
    const now = Date.now();
    const aiFleet: EdithSystemStatus[] = [
      { service: 'ULTRON', status: 'ACTIVE', lastActivity: now, unauthorizedCommunicationAttempts: 0 },
      { service: 'JARVIS', status: 'ONLINE', lastActivity: now, unauthorizedCommunicationAttempts: 0 },
      { service: 'FRIDAY', status: 'ONLINE', lastActivity: now, unauthorizedCommunicationAttempts: 0 },
      { service: 'DUME_U', status: 'ONLINE', lastActivity: now, unauthorizedCommunicationAttempts: 0 },
      { service: 'KAREN', status: 'ONLINE', lastActivity: now, unauthorizedCommunicationAttempts: 0 },
      { service: 'MISS_MINUTES', status: 'STANDBY', lastActivity: now, unauthorizedCommunicationAttempts: 0 },
    ];

    return {
      aiFleet,
      recentLogs: this.auditLogs.slice(0, 20),
      receivedDiagnosesCount: this.receivedDiagnoses.length,
      enforcementPolicy: 'Strict isolation active: Friday <-> Edith communication permitted. All other inter-AI chatter blocked.',
    };
  }
}

export const EdithSupervisor = new EdithSupervisorService();
