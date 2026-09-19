import React, { useState, useRef } from 'react';
import { Plus, ChevronDown, Square, ArrowUp, Mic, Loader2 } from 'lucide-react';
import { AIModel } from '../../types';
import { AVAILABLE_MODELS } from '../../data/models';
import { ChooseModelModal } from '../common/ChooseModelModal';
import { useVoiceDictation } from '../../hooks/useVoiceDictation';

interface ChatBottomInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  onStop?: () => void;
  selectedModelIds: string[];
  isAutoMode: boolean;
  onModelChange: (isAuto: boolean, modelIds: string[]) => void;
  onOpenUpgrade?: () => void;
}

export const ChatBottomInput: React.FC<ChatBottomInputProps> = ({
  onSend,
  isLoading,
  onStop,
  selectedModelIds,
  isAutoMode,
  onModelChange,
  onOpenUpgrade,
}) => {
  const [text, setText] = useState('');
  const [isChooseModelOpen, setIsChooseModelOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isListening, isTranscribing, volumeLevel, toggleListening, stopListening } = useVoiceDictation({
    onTranscript: (newText) => {
      setText(newText);
    },
    getCurrentText: () => text,
  });

  const selectedModels = AVAILABLE_MODELS.filter((m) =>
    selectedModelIds.includes(m.id)
  );

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || isLoading) return;
    if (isListening) stopListening();
    onSend(text);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-5 pt-2">
      <div
        className={`relative flex items-center bg-white rounded-full px-3.5 py-2.5 transition-all ${
          isListening
            ? 'border-2 border-emerald-500 shadow-[0_4px_20px_rgba(16,185,129,0.15)] ring-2 ring-emerald-500/20'
            : 'border border-neutral-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] focus-within:border-neutral-400'
        }`}
      >
        {/* Plus Button */}
        <button
          type="button"
          aria-label="Add attachment"
          className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? 'Listening... speak your message' : 'Ask another question...'}
          className="flex-1 bg-transparent border-0 outline-none px-3 text-[14px] sm:text-[15px] text-neutral-800 placeholder:text-neutral-400 font-normal"
        />

        {/* Right side controls: Stop / Send / Mic / Model selector */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {isLoading ? (
            <button
              id="chat-stop-button"
              type="button"
              onClick={onStop}
              title="Stop generating"
              aria-label="Stop generating"
              className="w-7 h-7 rounded-full bg-neutral-900 hover:bg-neutral-800 active:scale-90 text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs group"
            >
              <Square className="w-2.5 h-2.5 fill-white text-white group-hover:scale-110 transition-transform" />
            </button>
          ) : (
            <>
              {/* Mic / Active Dictation button */}
              <button
                type="button"
                id="chat-mic-btn"
                onClick={toggleListening}
                title={
                  isTranscribing
                    ? 'Transcribing speech...'
                    : isListening
                    ? 'Stop listening'
                    : 'Voice input'
                }
                aria-label={
                  isTranscribing
                    ? 'Transcribing speech'
                    : isListening
                    ? 'Stop listening'
                    : 'Voice input'
                }
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isListening
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                    : isTranscribing
                    ? 'bg-neutral-100 text-emerald-600'
                    : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {isListening ? (
                  <div className="flex items-center gap-[2px] h-3">
                    <span
                      className="w-[2px] rounded-full bg-white transition-all duration-75"
                      style={{ height: `${Math.max(3, Math.round(volumeLevel * 10 + 4))}px` }}
                    />
                    <span
                      className="w-[2px] rounded-full bg-white transition-all duration-75"
                      style={{ height: `${Math.max(5, Math.round(volumeLevel * 12 + 6))}px` }}
                    />
                    <span
                      className="w-[2px] rounded-full bg-white transition-all duration-75"
                      style={{ height: `${Math.max(3, Math.round(volumeLevel * 10 + 4))}px` }}
                    />
                  </div>
                ) : isTranscribing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                ) : (
                  <Mic className="w-4 h-4 stroke-[1.9]" />
                )}
              </button>

              {/* Send Button */}
              {text.trim() && (
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="w-7 h-7 rounded-full bg-neutral-900 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ArrowUp className="w-4 h-4 stroke-[2.2]" />
                </button>
              )}
            </>
          )}

          {/* Model selector pill */}
          <button
            type="button"
            onClick={() => setIsChooseModelOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            {isAutoMode ? (
              <span className="w-2.5 h-2.5 rounded-2xs bg-[#f43f5e]" />
            ) : (
              <div className="flex -space-x-1 overflow-hidden">
                {selectedModels.map((m) => (
                  <img
                    key={m.id}
                    src={m.logo}
                    alt={m.name}
                    referrerPolicy="no-referrer"
                    className="w-3.5 h-3.5 object-contain"
                  />
                ))}
              </div>
            )}

            <span className="text-neutral-800 font-normal">
              {isAutoMode
                ? 'Auto'
                : selectedModels.length === 1
                ? selectedModels[0].name
                : `${selectedModels.length} models`}
            </span>

            <ChevronDown className="w-3 h-3 text-neutral-400 stroke-[2]" />
          </button>
        </div>
      </div>

      <ChooseModelModal
        isOpen={isChooseModelOpen}
        onClose={() => setIsChooseModelOpen(false)}
        isAutoMode={isAutoMode}
        selectedModelIds={selectedModelIds}
        onApply={(auto, ids) => {
          onModelChange(auto, ids);
          setIsChooseModelOpen(false);
        }}
        onUpgradeRequired={onOpenUpgrade}
      />
    </div>
  );
};
