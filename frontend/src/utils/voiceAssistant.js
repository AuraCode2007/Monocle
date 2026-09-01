// Robust Web Speech API Engine with Graceful Error Handling & Fallback
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
      try {
        this.recognition = new SpeechRec();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-IN';
      } catch (e) {
        console.warn('Speech recognition init failed', e);
      }
    }
  }

  speak(text) {
    if (!this.synth) return;
    try {
      this.synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      const voices = this.synth.getVoices();
      const voice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-US') || v.lang.includes('en-GB'));
      if (voice) utterance.voice = voice;

      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error', e);
    }
  }

  listen(onResult, onError) {
    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      if (onError) onError('Speech recognition not supported on this browser. Try Chrome/Edge.');
      return;
    }

    try {
      // Abort any existing instance to prevent "already started" error
      if (this.isListening) {
        try { this.recognition.abort(); } catch (e) {}
      }

      this.isListening = true;

      this.recognition.onresult = (event) => {
        this.isListening = false;
        if (event.results && event.results[0] && event.results[0][0]) {
          const transcript = event.results[0][0].transcript;
          if (onResult) onResult(transcript);
        }
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        const err = event.error;
        console.warn('Speech recognition event error:', err);

        if (err === 'no-speech') {
          if (onError) onError('No speech detected. Please speak clearly into your mic.');
        } else if (err === 'not-allowed' || err === 'service-not-allowed') {
          if (onError) onError('Microphone access blocked. Please allow mic permissions in browser.');
        } else if (err === 'network') {
          if (onError) onError('Network connection error with speech recognition service.');
        } else {
          if (onError) onError(`Speech error: ${err}`);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.start();
    } catch (e) {
      this.isListening = false;
      if (onError) onError('Unable to start microphone. Please try again.');
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
    }
  }
}

export const voiceAssistant = new VoiceAssistantEngine();