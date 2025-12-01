import { pipeline, env } from '@xenova/transformers';

// Disable local model files (use CDN)
env.allowLocalModels = false;
env.allowRemoteModels = true;

// Cache the pipeline instance
let transcriber: any = null;

/**
 * Initialize Whisper model for speech transcription
 * Uses 'Xenova/whisper-tiny.en' for English transcription
 */
export async function initializeWhisper() {
  if (transcriber) {
    return transcriber;
  }

  try {
    transcriber = await pipeline(
      'automatic-speech-recognition',
      'Xenova/whisper-tiny.en',
      {
        quantized: true, // Use quantized model for faster loading
      }
    );
    return transcriber;
  } catch (error) {
    console.error('Error initializing Whisper:', error);
    throw new Error('Failed to initialize speech recognition model');
  }
}

/**
 * Transcribe audio blob to text using Whisper
 * @param audioBlob - Audio blob from MediaRecorder
 * @returns Transcribed text
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    // Ensure model is initialized
    const model = await initializeWhisper();

    // Create an audio context to decode the blob
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const arrayBuffer = await audioBlob.arrayBuffer();
    const decodedAudio = await audioContext.decodeAudioData(arrayBuffer);

    // Get the audio data as Float32Array (mono channel)
    const audioArray = decodedAudio.getChannelData(0);

    // Transcribe using Whisper
    const result = await model(audioArray, {
      return_timestamps: false,
      language: 'en',
      task: 'transcribe',
    });

    return result.text || '';
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio');
  }
}

/**
 * Alternative method: Transcribe from AudioBuffer directly
 */
export async function transcribeFromBuffer(audioBuffer: AudioBuffer): Promise<string> {
  try {
    const model = await initializeWhisper();
    
    // Get mono channel data
    const audioData = audioBuffer.getChannelData(0);
    
    const result = await model(audioData, {
      return_timestamps: false,
      language: 'en',
      task: 'transcribe',
    });

    return result.text || '';
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio');
  }
}

