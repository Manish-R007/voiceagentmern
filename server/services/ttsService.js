const axios = require('axios');

class TTSService {
  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    this.voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel voice
  }

  async textToSpeechStream(text, options = {}) {
    try {
      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/text-to-speech/${this.voiceId}/stream`,
        data: {
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true
          }
        },
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      });

      return response.data;
    } catch (error) {
      console.error('TTS Error:', error);
      throw error;
    }
  }

  async generateWelcomeMessage() {
    return "Hello! Welcome to SmileCare Dental Clinic. I'm Sarah, your virtual assistant. How can I help you today? You can ask me about appointments, services, or any dental concerns you might have.";
  }
}

module.exports = new TTSService();