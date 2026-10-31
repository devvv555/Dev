/**
 * KarenVoiceEngine
 * 
 * Features #025: Karen Suit Audio Voice Briefing
 * Uses the Web Speech Synthesis API (built natively into iOS Safari, Chrome, and Android)
 * to vocalize a calm, articulate suit-companion morning briefing.
 */

export interface BriefingData {
  studentName: string;
  totalClassesToday: number;
  firstClassCourse: string;
  firstClassRoom: string;
  firstClassTime: string;
  canteenStatus: string;
}

export const KarenVoiceEngine = {
  /**
   * Generates and speaks the personalized morning briefing audio
   */
  speakMorningBriefing(briefing: BriefingData): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        console.warn('[KarenVoice] SpeechSynthesis is not supported on this device.');
        resolve(false);
        return;
      }

      try {
        window.speechSynthesis.cancel(); // Stop any pending utterances

        const message = `Good morning, ${briefing.studentName}. Training wheels are disengaged. You have ${briefing.totalClassesToday} scheduled classes today. Your first lecture is ${briefing.firstClassCourse} in ${briefing.firstClassRoom} at ${briefing.firstClassTime}. Canteen radar reports ${briefing.canteenStatus}. All systems are fully operational.`;

        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 1.0;
        utterance.pitch = 1.1; // Friendly, intelligent tone
        utterance.lang = 'en-US';

        // Prefer natural female English voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
          (v) => (v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Natural') || v.name.includes('Google US English')) && v.lang.startsWith('en')
        ) || voices.find((v) => v.lang.startsWith('en'));

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onend = () => resolve(true);
        utterance.onerror = () => resolve(false);

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[KarenVoice] Voice synthesis failed:', err);
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
