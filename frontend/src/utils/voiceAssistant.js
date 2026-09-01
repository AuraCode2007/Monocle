// Web Speech API Engine for Indian Railways Voice Commands
// Native browser speech recognition & speech synthesis

class VoiceAssistantEngine {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.initRecognition();
  }

  initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      this.recognition = new SpeechRec();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-IN'; // Indian English
    }
  }

  // Voice Synthesis (AI Audio Output)
  speak(text) {
    if (!this.synth) return;
    try {
      this.synth.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      
      // Look for pleasant English voice
      const voices = this.synth.getVoices();
      const engVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.includes('en-US'));
      if (engVoice) utterance.voice = engVoice;

      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error', e);
    }
  }

  // Start Voice Listening
  listen(onResult, onError) {
    if (!this.recognition) {
      if (onError) onError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    try {
      this.isListening = true;

      this.recognition.onresult = (event) => {
        this.isListening = false;
        const transcript = event.results[0][0].transcript;
        if (onResult) onResult(transcript);
      };

      this.recognition.onerror = (err) => {
        this.isListening = false;
        if (onError) onError(err.error || 'Voice recognition error');
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.start();
    } catch (e) {
      this.isListening = false;
      if (onError) onError('Microphone access denied or busy.');
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}

export const voiceAssistant = new VoiceAssistantEngine();