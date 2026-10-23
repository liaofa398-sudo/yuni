let currentUtterance: SpeechSynthesisUtterance | null = null;

export interface TTSService {
  speak: (text: string, onEnd?: () => void, onError?: () => void) => boolean;
  stopSpeaking: () => void;
  isSpeaking: () => boolean;
}

export const ttsService: TTSService = {
  speak: (text: string, onEnd?: () => void, onError?: () => void): boolean => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis not supported in this environment');
      return false;
    }

    try {
      // Clean speech text from markdown or system code
      const cleanText = text
        .replace(/[*#`_~[\]()]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .trim();

      if (!cleanText) return false;

      // Stop previous speech if any
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'zh-CN';
      utterance.rate = 1.05; // Slightly lively
      utterance.pitch = 1.2; // Gentle, cute anime companion pitch

      // Try to find a natural Chinese voice if available
      const voices = window.speechSynthesis.getVoices();
      const zhVoice = voices.find((v) => v.lang.includes('zh') || v.lang.includes('cmn'));
      if (zhVoice) {
        utterance.voice = zhVoice;
      }

      utterance.onend = () => {
        currentUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('TTS error:', e);
        currentUtterance = null;
        if (onError) onError();
      };

      currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (err) {
      console.error('TTS execution failed:', err);
      if (onError) onError();
      return false;
    }
  },

  stopSpeaking: () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    currentUtterance = null;
  },

  isSpeaking: () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }
    return window.speechSynthesis.speaking;
  },
};
