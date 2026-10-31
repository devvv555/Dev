import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BriefingData {
  studentName: string;
  totalClassesToday: number;
  firstClassCourse: string;
  firstClassRoom: string;
  firstClassTime: string;
  canteenStatus: string;
}

export type VoicePersonaId = 'KAREN' | 'FRIDAY' | 'JARVIS' | 'INDIAN_ENGLISH';

export interface VoicePersona {
  id: VoicePersonaId;
  name: string;
  accent: string;
  description: string;
  langPrefix: string;
  nameKeywords: string[];
  pitch: number;
  rate: number;
  previewText: string;
}

export const VOICE_PERSONAS: VoicePersona[] = [
  {
    id: 'KAREN',
    name: 'Karen (US Natural)',
    accent: 'American English',
    description: 'Calm, articulate natural AI companion',
    langPrefix: 'en-US',
    nameKeywords: ['Samantha', 'Karen', 'Natural', 'Jenny', 'Aria', 'Google US English', 'Zira', 'Victoria'],
    pitch: 1.0,
    rate: 1.0,
    previewText: 'Hello Cadet. Karen voice module is calibrated and active.',
  },
  {
    id: 'FRIDAY',
    name: 'Friday (UK AI)',
    accent: 'British English',
    description: 'Sophisticated, crisp British suit AI',
    langPrefix: 'en-GB',
    nameKeywords: ['Stephanie', 'Serena', 'Hazel', 'Susan', 'Google UK English Female', 'Libby', 'Sonia'],
    pitch: 0.98,
    rate: 0.95,
    previewText: 'Good day. Friday audio protocol is primed and online.',
  },
  {
    id: 'JARVIS',
    name: 'Jarvis (Deep Tactical)',
    accent: 'Command Baritone',
    description: 'Authoritative, deep tactical suit AI',
    langPrefix: 'en',
    nameKeywords: ['David', 'Guy', 'George', 'Daniel', 'Oliver', 'Google UK English Male', 'Mark', 'Ravi'],
    pitch: 0.82,
    rate: 0.92,
    previewText: 'All tactical systems reporting green. At your command, Cadet.',
  },
  {
    id: 'INDIAN_ENGLISH',
    name: 'Campus AI (Indian English)',
    accent: 'Indian English',
    description: 'Familiar campus cadence and clear pronunciation',
    langPrefix: 'en-IN',
    nameKeywords: ['India', 'Heera', 'Neerja', 'Prabhat', 'Google English (India)', 'en-IN'],
    pitch: 1.0,
    rate: 1.0,
    previewText: 'Welcome to PSGIM One. Voice system ready for your schedule.',
  },
];

const STORAGE_KEY = '@stark_voice_persona';

export const KarenVoiceEngine = {
  /**
   * Retrieves all available voices from the browser / OS
   */
  getVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve([]);
        return;
      }
      const existing = window.speechSynthesis.getVoices();
      if (existing && existing.length > 0) {
        resolve(existing);
        return;
      }
      // On some platforms, voices are loaded asynchronously
      const onVoices = () => {
        const loaded = window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = null;
        resolve(loaded || []);
      };
      window.speechSynthesis.onvoiceschanged = onVoices;
      // Fallback timeout in case onvoiceschanged does not fire
      setTimeout(() => {
        resolve(window.speechSynthesis.getVoices() || []);
      }, 350);
    });
  },

  /**
   * Gets the active persona ID from storage (defaults to KAREN)
   */
  async getSelectedPersona(): Promise<VoicePersonaId> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored && VOICE_PERSONAS.some((p) => p.id === stored)) {
        return stored as VoicePersonaId;
      }
    } catch {}
    return 'KAREN';
  },

  /**
   * Saves user persona preference
   */
  async setSelectedPersona(id: VoicePersonaId): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, id);
    } catch {}
  },

  /**
   * Helper to find matching voice object on this device
   */
  findVoiceForPersona(persona: VoicePersona, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    if (!voices || voices.length === 0) return null;

    // 1. Try matching by keyword in voice name
    for (const kw of persona.nameKeywords) {
      const match = voices.find((v) => v.name.toLowerCase().includes(kw.toLowerCase()));
      if (match) return match;
    }

    // 2. Try matching by exact language code (e.g. en-GB, en-IN)
    if (persona.langPrefix.includes('-')) {
      const match = voices.find((v) => v.lang.toLowerCase().startsWith(persona.langPrefix.toLowerCase()));
      if (match) return match;
    }

    // 3. Fallback to any English voice
    return voices.find((v) => v.lang.toLowerCase().startsWith('en')) || voices[0] || null;
  },

  /**
   * Previews a voice persona with a short calibration sentence
   */
  async previewPersona(personaId: VoicePersonaId): Promise<boolean> {
    const persona = VOICE_PERSONAS.find((p) => p.id === personaId) || VOICE_PERSONAS[0];
    return new Promise(async (resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve(false);
        return;
      }

      try {
        window.speechSynthesis.cancel();
        const voices = await this.getVoices();
        const voice = this.findVoiceForPersona(persona, voices);

        const utterance = new SpeechSynthesisUtterance(persona.previewText);
        utterance.rate = persona.rate;
        utterance.pitch = persona.pitch;
        utterance.lang = persona.langPrefix;
        if (voice) utterance.voice = voice;

        utterance.onend = () => resolve(true);
        utterance.onerror = () => resolve(false);

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[KarenVoice] Preview failed:', err);
        resolve(false);
      }
    });
  },

  /**
   * Speaks the morning briefing using the active persona
   */
  async speakMorningBriefing(briefing: BriefingData): Promise<boolean> {
    const selectedId = await this.getSelectedPersona();
    const persona = VOICE_PERSONAS.find((p) => p.id === selectedId) || VOICE_PERSONAS[0];

    return new Promise(async (resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        console.warn('[KarenVoice] SpeechSynthesis is not supported on this device.');
        resolve(false);
        return;
      }

      try {
        window.speechSynthesis.cancel();
        const voices = await this.getVoices();
        const voice = this.findVoiceForPersona(persona, voices);

        const message = `Good morning, ${briefing.studentName}. Tactical suit mode active. You have ${briefing.totalClassesToday} scheduled classes today. Your first lecture is ${briefing.firstClassCourse} in ${briefing.firstClassRoom} at ${briefing.firstClassTime}. Canteen reports ${briefing.canteenStatus}. All systems operational.`;

        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = persona.rate;
        utterance.pitch = persona.pitch;
        utterance.lang = persona.langPrefix;
        if (voice) utterance.voice = voice;

        utterance.onend = () => resolve(true);
        utterance.onerror = () => resolve(false);

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[KarenVoice] Briefing failed:', err);
        resolve(false);
      }
    });
  },

  stopSpeaking(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  },
};
