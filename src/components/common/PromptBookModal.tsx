import React, { useState, useEffect } from 'react';
import { X, Terminal, Copy, Check, Trash2, ArrowUpRight, Sparkles } from 'lucide-react';
import {
  getStoredPrompts,
  deleteStoredPrompt,
  clearStoredPrompts,
  SavedPromptItem,
} from '../../lib/storage';

interface PromptBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt?: (text: string) => void;
}

export const PromptBookModal: React.FC<PromptBookModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
}) => {
  const [prompts, setPrompts] = useState<SavedPromptItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPrompts(getStoredPrompts(50));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    deleteStoredPrompt(id);
    setPrompts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all saved prompts from local storage?')) {
      clearStoredPrompts();
      setPrompts([]);
    }
  };

  const handleUsePrompt = (text: string) => {
    onSelectPrompt?.(text);
    onClose();
  };

  return (
    <div
      id="promptbook-modal-backdrop"
      className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="promptbook-modal-card"
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-neutral-200/90 p-6 sm:p-7 overflow-hidden relative animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-neutral-100 border border-neutral-200/80 flex items-center justify-center text-neutral-800">
            <Terminal className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 tracking-tight flex items-center gap-2">
              <span>PromptBook</span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                Local Storage Mode
              </span>
            </h2>
            <p className="text-xs text-neutral-500">
              Your prompt history saved locally in your browser
            </p>
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex items-center justify-between py-2 border-b border-neutral-100 mb-3 text-xs text-neutral-500">
          <span>{prompts.length} saved prompts</span>
          {prompts.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-red-500 hover:text-red-600 font-medium transition-colors cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Prompts list */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 -mr-1">
          {prompts.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-center text-neutral-400 mx-auto mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-800 mb-1">No saved prompts yet</h3>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
                Prompts you submit will be saved right here in your browser's local storage for easy reuse.
              </p>
            </div>
          ) : (
            prompts.map((p) => (
              <div
                key={p.id}
                className="group p-3.5 bg-neutral-50/80 hover:bg-neutral-100/80 border border-neutral-200/70 rounded-2xl transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-neutral-600">
                    {p.mode}
                  </span>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleCopy(p.id, p.text)}
                      title="Copy prompt"
                      className="p-1.5 hover:bg-white rounded-lg text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                    >
                      {copiedId === p.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {onSelectPrompt && (
                      <button
                        type="button"
                        onClick={() => handleUsePrompt(p.text)}
                        title="Use this prompt"
                        className="p-1.5 hover:bg-white rounded-lg text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      title="Delete"
                      className="p-1.5 hover:bg-white rounded-lg text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-neutral-800 leading-relaxed font-normal select-text break-words">
                  {p.text}
                </p>
                <div className="mt-2 text-[10px] text-neutral-400">
                  {new Date(p.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
