import React, { useState, useEffect, useRef } from 'react';
import { X, Pause, Play, Check, ArrowUp, Mic } from 'lucide-react';

interface VoiceTranscriptionBarProps {
  value?: string;
  initialText?: string;
  onTextChange?: (text: string) => void;
  onConfirm: (text: string) => void;
  onCancel: () => void;
  onSubmitPrompt?: (text: string) => void;
  variant?: 'box' | 'pill';
  placeholder?: string;
  className?: string;
}

export const VoiceTranscriptionBar: React.FC<VoiceTranscriptionBarProps> = ({
  value = '',
  initialText = '',
  onTextChange,
  onConfirm,
  onCancel,
  onSubmitPrompt,
  variant = 'box',
  placeholder = 'Start speaking... your words will appear here in real-time',
  className = '',
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState(value || initialText);
  const [interimText, setInterimText] = useState('');
  const [volumeLevels, setVolumeLevels] = useState<number[]>(
    new Array(24).fill(3)
  );
  const [micStatus, setMicStatus] = useState<'listening' | 'denied' | 'unsupported'>('listening');

  const timerRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const isPausedRef = useRef(false);
  const isRecordingRef = useRef(true);
  const currentLevelsRef = useRef<number[]>(new Array(24).fill(3));
  const finalTranscriptRef = useRef(value || initialText);
  const baseTextRef = useRef(value || initialText);

  // Sync ref with pause state
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // 1. Elapsed Recording Timer
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 2. Real-Time Audio Reactivity Engine (Web Audio API)
  useEffect(() => {
    isRecordingRef.current = true;
    let isCancelled = false;

    const setupAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        mediaStreamRef.current = stream;

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;

          // Crucial for browser autoplay policies
          if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
          }

          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.45; // Responsive and fluid
          analyserRef.current = analyser;

          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          const freqData = new Uint8Array(analyser.frequencyBinCount);
          const timeData = new Uint8Array(analyser.frequencyBinCount);

          const renderWave = () => {
            if (isCancelled || !isRecordingRef.current) return;

            if (!isPausedRef.current && analyserRef.current) {
              analyserRef.current.getByteFrequencyData(freqData);
              analyserRef.current.getByteTimeDomainData(timeData);

              // 1. Calculate real RMS volume from time-domain waveform
              let sumSquares = 0;
              for (let i = 0; i < timeData.length; i++) {
                const sample = (timeData[i] - 128) / 128;
                sumSquares += sample * sample;
              }
              const rms = Math.sqrt(sumSquares / timeData.length);
              const speechVolume = Math.min(2.5, rms * 7.5);

              // 2. Map across 24 frequency bars for human speech spectrum (100Hz - 3500Hz)
              const levels: number[] = [];
              const barCount = 24;

              for (let i = 0; i < barCount; i++) {
                // Vocal frequency buckets
                const binIndex = Math.min(freqData.length - 1, Math.floor(1 + i * 2.2));
                const freqIntensity = (freqData[binIndex] || 0) / 255;

                let targetHeight = 3;
                if (speechVolume > 0.035) {
                  // User is actively speaking: height moves dynamically with voice!
                  const dynamicEnergy = freqIntensity * 0.65 + speechVolume * 0.45;
                  targetHeight = Math.min(28, Math.max(5, Math.round(dynamicEnergy * 28)));
                } else {
                  // Subtle gentle idle wave when waiting for speech
                  targetHeight = Math.max(3, 4 + Math.sin(Date.now() / 300 + i * 0.6) * 1.5);
                }

                // Smooth physics lerp
                const current = currentLevelsRef.current[i] || 3;
                const next = current + (targetHeight - current) * 0.38;
                currentLevelsRef.current[i] = next;
                levels.push(Math.round(next));
              }

              setVolumeLevels(levels);
            } else if (isPausedRef.current) {
              setVolumeLevels(new Array(24).fill(3));
            }

            animationFrameRef.current = requestAnimationFrame(renderWave);
          };

          renderWave();
        }
      } catch (err: any) {
        console.warn('Microphone permission / AudioContext error:', err);
        setMicStatus('denied');

        // Organic fallback animation if mic permission denied or running in restricted sandbox
        let step = 0;
        const fallbackInterval = window.setInterval(() => {
          if (isCancelled || !isRecordingRef.current) {
            clearInterval(fallbackInterval);
            return;
          }
          if (isPausedRef.current) {
            setVolumeLevels(new Array(24).fill(3));
            return;
          }
          step += 0.25;
          const levels = Array.from({ length: 24 }, (_, i) => {
            const h = Math.round(
              6 + Math.sin(step + i * 0.45) * 8 + Math.cos(step * 1.6 + i * 0.3) * 6
            );
            return Math.max(3, Math.min(24, Math.abs(h)));
          });
          setVolumeLevels(levels);
        }, 65);
      }
    };

    setupAudio();

    return () => {
      isCancelled = true;
      isRecordingRef.current = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch {}
      }
    };
  }, []);

  // 3. Web Speech Recognition API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicStatus('unsupported');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let newlyFinalized = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            newlyFinalized += result[0].transcript + ' ';
          } else {
            currentInterim += result[0].transcript;
          }
        }

        if (newlyFinalized) {
          finalTranscriptRef.current = (
            (finalTranscriptRef.current ? finalTranscriptRef.current + ' ' : '') +
            newlyFinalized.trim()
          ).trim();
        }

        const fullCombined = (
          (finalTranscriptRef.current ? finalTranscriptRef.current + ' ' : '') +
          currentInterim
        ).trim();

        setTranscript(finalTranscriptRef.current);
        setInterimText(currentInterim);
        onTextChange?.(fullCombined);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition warning:', e?.error);
        if (e?.error === 'not-allowed') {
          setMicStatus('denied');
        }
      };

      recognition.onend = () => {
        // Auto-restart if still recording and not paused (prevents Web Speech API from premature cutoffs)
        if (isRecordingRef.current && !isPausedRef.current) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Speech recognition initialization warning:', e);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
        recognitionRef.current = null;
      }
    };
  }, []);

  // Pause / Resume Toggle
  const handleTogglePause = () => {
    if (!isPaused) {
      setIsPaused(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    } else {
      setIsPaused(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {}
      }
    }
  };

  // Complete and keep in prompt box
  const handleDone = () => {
    const combined = (
      (transcript ? transcript + ' ' : '') + (interimText ? interimText : '')
    ).trim();
    onConfirm(combined || baseTextRef.current);
  };

  // Cancel and revert
  const handleCancel = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    onCancel();
  };

  // Submit prompt immediately
  const handleDirectSubmit = () => {
    const combined = (
      (transcript ? transcript + ' ' : '') + (interimText ? interimText : '')
    ).trim();
    const textToSend = combined || baseTextRef.current;
    if (onSubmitPrompt) {
      onSubmitPrompt(textToSend);
    } else {
      onConfirm(textToSend);
    }
  };

  const displayText = (
    (transcript ? transcript + ' ' : '') + (interimText ? interimText : '')
  ).trim();

  // VARIANT 1: Full ChatGPT Prompt Box UI
  if (variant === 'box') {
    return (
      <div
        id="prompt-box-voice-mode"
        className={`w-full bg-white rounded-3xl sm:rounded-[28px] border-2 border-emerald-500/80 shadow-[0_8px_32px_rgba(16,185,129,0.14),0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 p-4 sm:p-5 flex flex-col gap-3 min-h-[135px] animate-in fade-in zoom-in-98 duration-150 ${className}`}
      >
        {/* Top: Status & Live Transcription */}
        <div className="flex-1 flex flex-col min-h-[52px]">
          <div className="flex items-center justify-between mb-2 select-none">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isPaused ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'
                }`}
              />
              <span className="text-xs font-medium text-neutral-600">
                {isPaused
                  ? 'Recording paused'
                  : micStatus === 'denied'
                  ? 'Microphone blocked (enable mic in browser settings)'
                  : 'Listening... speak clearly into your microphone'}
              </span>
            </div>

            {/* Elapsed Timer */}
            <span className="text-xs font-mono font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
              {formatTime(seconds)}
            </span>
          </div>

          {/* Live Streaming Text in the prompt box */}
          <div className="text-neutral-900 text-base sm:text-[17px] font-normal leading-relaxed break-words">
            {displayText ? (
              <span>
                <span>{transcript}</span>
                {interimText && (
                  <span className="text-neutral-500 italic ml-1">{interimText}</span>
                )}
                <span className="inline-block w-1.5 h-4 ml-1.5 bg-emerald-500 animate-pulse align-middle" />
              </span>
            ) : (
              <span className="text-neutral-400 italic">
                {placeholder}
                <span className="inline-block w-1.5 h-4 ml-1.5 bg-emerald-400 animate-pulse align-middle" />
              </span>
            )}
          </div>
        </div>

        {/* Bottom Toolbar: Cancel, Waveform, Pause, Done, Send */}
        <div className="pt-2.5 border-t border-neutral-100 flex items-center justify-between gap-2 sm:gap-4 select-none">
          {/* Left: Cancel Button */}
          <button
            type="button"
            id="voice-cancel-btn"
            onClick={handleCancel}
            title="Cancel voice recording"
            aria-label="Cancel voice recording"
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>

          {/* Center: Real Voice Reactive Dynamic Equalizer Waveform */}
          <div
            id="voice-waveform-area"
            className="flex-1 flex items-center justify-center overflow-hidden px-1 sm:px-3"
          >
            <div className="flex items-center gap-[2.5px] sm:gap-[3px] h-7">
              {volumeLevels.map((h, i) => (
                <span
                  key={i}
                  className="w-[2.5px] sm:w-[3px] rounded-full bg-emerald-500 transition-all duration-75"
                  style={{
                    height: `${h}px`,
                    opacity: isPaused ? 0.35 : 0.9,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right Action Controls: Pause, Done, Send */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Pause / Resume */}
            <button
              type="button"
              id="voice-pause-btn"
              onClick={handleTogglePause}
              title={isPaused ? 'Resume recording' : 'Pause recording'}
              aria-label={isPaused ? 'Resume recording' : 'Pause recording'}
              className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              {isPaused ? (
                <Play className="w-3.5 h-3.5 fill-neutral-700 stroke-[2] ml-0.5" />
              ) : (
                <Pause className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
            </button>

            {/* Done Checkmark: puts text into prompt box & exits recording mode */}
            <button
              type="button"
              id="voice-done-btn"
              onClick={handleDone}
              title="Finish dictation"
              aria-label="Finish dictation"
              className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5] text-emerald-600" />
              <span>Done</span>
            </button>

            {/* Send Arrow: immediately submits prompt to AI */}
            <button
              type="button"
              id="voice-submit-btn"
              onClick={handleDirectSubmit}
              title="Send prompt now"
              aria-label="Send prompt now"
              className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-neutral-900 hover:bg-black active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // VARIANT 2: Compact Pill Layout (for Chat Bottom Input)
  return (
    <div className={`w-full flex flex-col items-center select-none ${className}`}>
      {/* Live transcription bubble preview */}
      <div className="mb-2 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-xs border border-neutral-200/80 shadow-2xs max-w-xl text-center flex items-center gap-2 animate-in fade-in duration-150">
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            isPaused ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'
          }`}
        />
        <p className="text-xs sm:text-[13px] text-neutral-700 font-normal truncate max-w-[440px]">
          {displayText || 'Listening... speak now'}
        </p>
      </div>

      {/* Capsule with animated soundwave */}
      <div
        id="voice-pill-container"
        className="w-full max-w-2xl bg-white border border-neutral-200/90 rounded-full px-3.5 sm:px-4 py-2 sm:py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] flex items-center justify-between gap-2 sm:gap-3.5 transition-all duration-200"
      >
        <button
          type="button"
          onClick={handleCancel}
          title="Cancel"
          className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4 stroke-[2]" />
        </button>

        <span className="text-xs font-mono font-medium text-neutral-600 shrink-0">
          {formatTime(seconds)}
        </span>

        {/* Center Waveform */}
        <div className="flex-1 flex items-center justify-end overflow-hidden px-2">
          <div className="flex items-center gap-[2.5px] sm:gap-[3px] h-6 shrink-0">
            {volumeLevels.map((h, idx) => (
              <span
                key={idx}
                className="w-[2.5px] sm:w-[3px] rounded-full bg-emerald-500 transition-all duration-75"
                style={{
                  height: `${h}px`,
                  opacity: isPaused ? 0.35 : 0.9,
                }}
              />
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleTogglePause}
            title={isPaused ? 'Resume' : 'Pause'}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-800 hover:bg-neutral-100 transition-colors shrink-0 cursor-pointer"
          >
            {isPaused ? (
              <Play className="w-3.5 h-3.5 fill-neutral-800 stroke-[2] ml-0.5" />
            ) : (
              <Pause className="w-3.5 h-3.5 stroke-[2.5]" />
            )}
          </button>

          <button
            type="button"
            onClick={handleDirectSubmit}
            title="Send transcription"
            className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
