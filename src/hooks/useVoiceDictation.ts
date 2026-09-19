import { useState, useRef, useCallback, useEffect } from 'react';

interface UseVoiceDictationOptions {
  onTranscript: (text: string) => void;
  getCurrentText: () => string;
}

// Convert Blob to base64 string
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function useVoiceDictation({ onTranscript, getCurrentText }: UseVoiceDictationOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0); // 0 to 1

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isListeningRef = useRef(false);
  const baseTextRef = useRef('');
  const speechTranscriptRef = useRef('');
  const hasTranscribedAnyTextRef = useRef(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const stopAudioCapture = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    setVolumeLevel(0);
  };

  // Transcribe recorded audio with server AI fallback
  const sendAudioForTranscription = async (blob: Blob, mimeType: string) => {
    if (blob.size < 500) return; // Discard accidental taps with zero audio

    try {
      setIsTranscribing(true);
      const base64Data = await blobToBase64(blob);

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64Data,
          mimeType,
        }),
      });

      if (!res.ok) {
        throw new Error(`Transcription request returned status ${res.status}`);
      }

      const data = await res.json();
      const aiTranscript = data?.transcript ? data.transcript.trim() : '';

      if (aiTranscript) {
        const base = baseTextRef.current;
        const fullText = (base + (base && !base.endsWith(' ') ? ' ' : '') + aiTranscript).trimStart();
        onTranscript(fullText);
      }
    } catch (err) {
      console.warn('Backend audio transcription notice:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);

    // Stop native speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    // Stop MediaRecorder and trigger server fallback if needed
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    } else {
      stopAudioCapture();
    }
  }, []);

  const startListening = useCallback(async () => {
    const current = getCurrentText();
    baseTextRef.current = current ? (current.endsWith(' ') ? current : current + ' ') : '';
    speechTranscriptRef.current = '';
    hasTranscribedAnyTextRef.current = false;
    audioChunksRef.current = [];

    // Request microphone
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;
    } catch (err) {
      console.warn('Could not access microphone:', err);
      alert('Microphone access was denied or is not available. Please allow microphone permissions.');
      return;
    }

    isListeningRef.current = true;
    setIsListening(true);

    // 1. Setup AudioContext Volume Analyser for Waveform Animation
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);

        const timeData = new Uint8Array(analyser.frequencyBinCount);

        const checkVolume = () => {
          if (!isListeningRef.current || !analyserRef.current) return;
          analyserRef.current.getByteTimeDomainData(timeData);

          let sumSquares = 0;
          for (let i = 0; i < timeData.length; i++) {
            const sample = (timeData[i] - 128) / 128;
            sumSquares += sample * sample;
          }
          const rms = Math.sqrt(sumSquares / timeData.length);
          const normalized = Math.min(1, Math.max(0, rms * 5));
          setVolumeLevel(normalized);

          animFrameRef.current = requestAnimationFrame(checkVolume);
        };

        checkVolume();
      }
    } catch (e) {
      console.warn('AudioContext analysis error:', e);
    }

    // 2. Setup MediaRecorder for Reliable AI Audio Transcription Fallback
    let recorderMimeType = 'audio/webm';
    if (typeof MediaRecorder !== 'undefined') {
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        recorderMimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        recorderMimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        recorderMimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        recorderMimeType = 'audio/ogg';
      }

      try {
        const recorder = new MediaRecorder(stream, recorderMimeType ? { mimeType: recorderMimeType } : undefined);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          stopAudioCapture();
          const recordedBlob = new Blob(audioChunksRef.current, { type: recorderMimeType });

          // If browser Web Speech API did not produce text or failed, send to AI transcription
          if (!hasTranscribedAnyTextRef.current || !speechTranscriptRef.current.trim()) {
            sendAudioForTranscription(recordedBlob, recorderMimeType);
          }
        };

        recorder.start(250); // Slice chunks every 250ms
      } catch (recErr) {
        console.warn('MediaRecorder initialization notice:', recErr);
      }
    }

    // 3. Setup Browser Native Web Speech API for Real-Time Dictation
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = navigator.language || 'en-US';
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let newlyFinalized = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const res = event.results[i];
            if (res.isFinal) {
              newlyFinalized += res[0].transcript + ' ';
            } else {
              interimTranscript += res[0].transcript;
            }
          }

          if (newlyFinalized) {
            speechTranscriptRef.current += newlyFinalized;
          }

          const fullSpoken = (speechTranscriptRef.current + interimTranscript).trim();
          if (fullSpoken) {
            hasTranscribedAnyTextRef.current = true;
            const combined = (baseTextRef.current + fullSpoken).trimStart();
            onTranscript(combined);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Web Speech API status:', event?.error);
          // Do not close listening if it's a minor error; MediaRecorder continues recording!
          if (event?.error === 'not-allowed') {
            stopListening();
          }
        };

        recognition.onend = () => {
          // If still listening and MediaRecorder is active, attempt to restart recognition
          if (isListeningRef.current) {
            try {
              recognition.start();
            } catch {}
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (speechErr) {
        console.warn('Speech recognition not available or blocked in this browser:', speechErr);
      }
    }
  }, [getCurrentText, onTranscript, stopListening]);

  const toggleListening = useCallback(() => {
    if (isListeningRef.current) {
      stopListening();
    } else {
      startListening();
    }
  }, [startListening, stopListening]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    isTranscribing,
    volumeLevel,
    startListening,
    stopListening,
    toggleListening,
  };
}
