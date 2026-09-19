import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ChevronDown, ChevronUp, Check } from 'lucide-react';
import {
  getStoredMemorySettings,
  saveStoredMemorySettings,
  MemorySettings,
} from '../../lib/storage';

interface MemorySettingsViewProps {
  onClose: () => void;
}

export const MemorySettingsView: React.FC<MemorySettingsViewProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<MemorySettings>(getStoredMemorySettings());
  const [isAddingFact, setIsAddingFact] = useState(false);
  const [newFactText, setNewFactText] = useState('');
  const [isAutoExpanded, setIsAutoExpanded] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setSettings(getStoredMemorySettings());
  }, []);

  const handleToggleEnable = () => {
    const updated = { ...settings, isEnabled: !settings.isEnabled };
    setSettings(updated);
    saveStoredMemorySettings({ isEnabled: updated.isEnabled });
  };

  const handleAddFact = () => {
    const trimmed = newFactText.trim();
    if (!trimmed || settings.keyFacts.length >= 20) return;
    const updatedFacts = [...settings.keyFacts, trimmed];
    const updated = { ...settings, keyFacts: updatedFacts };
    setSettings(updated);
    setNewFactText('');
    setIsAddingFact(false);
    saveStoredMemorySettings({ keyFacts: updatedFacts });
  };

  const handleRemoveFact = (index: number) => {
    const updatedFacts = settings.keyFacts.filter((_, i) => i !== index);
    const updated = { ...settings, keyFacts: updatedFacts };
    setSettings(updated);
    saveStoredMemorySettings({ keyFacts: updatedFacts });
  };

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.slice(0, 1000);
    setSettings((prev) => ({ ...prev, summary: value }));
  };

  const handleSave = () => {
    saveStoredMemorySettings({
      isEnabled: settings.isEnabled,
      keyFacts: settings.keyFacts,
      summary: settings.summary,
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 shrink-0">
        <div>
          <h3 className="text-base font-semibold text-neutral-900 leading-tight">
            Memory
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Let the assistant remember important details across chats when available
          </p>
        </div>

        <button
          type="button"
          id="memory-settings-close-btn"
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-800 p-1 rounded-lg transition-colors cursor-pointer -mt-1 -mr-1"
          aria-label="Close settings"
        >
          <X className="w-5 h-5 stroke-[1.8]" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-1 pb-4 space-y-5">
        {/* Enable Account Memory Card - Exact match to user screenshot */}
        <div
          id="enable-memory-toggle-card"
          className="rounded-2xl border border-neutral-200/90 bg-white p-4 flex items-center justify-between shadow-xs transition-colors"
        >
          <span className="text-[13px] font-medium text-neutral-900">
            Enable account memory
          </span>

          <button
            type="button"
            role="switch"
            aria-checked={settings.isEnabled}
            onClick={handleToggleEnable}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.isEnabled ? 'bg-[#34c759]' : 'bg-neutral-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out mt-0.5 ${
                settings.isEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* When Enabled: Show Key Facts, Summary, and Remembered Automatically (Image 2) */}
        {settings.isEnabled && (
          <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Key Facts Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-neutral-900">
                  Key facts
                </span>
                <span className="text-xs text-neutral-400 font-normal">
                  {settings.keyFacts.length} / 20
                </span>
              </div>

              {/* List of existing facts */}
              {settings.keyFacts.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  {settings.keyFacts.map((fact, idx) => (
                    <div
                      key={idx}
                      className="group flex items-center justify-between px-3 py-2 bg-neutral-50 border border-neutral-200/80 rounded-xl text-xs text-neutral-800"
                    >
                      <span className="flex-1 select-text">{fact}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFact(idx)}
                        className="text-neutral-400 hover:text-red-500 p-0.5 rounded transition-colors ml-2 cursor-pointer"
                        title="Delete fact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Fact Inline Form or Center Plus Button */}
              {isAddingFact ? (
                <div className="p-3 border border-neutral-200 rounded-2xl bg-neutral-50/50 space-y-2">
                  <input
                    type="text"
                    value={newFactText}
                    onChange={(e) => setNewFactText(e.target.value)}
                    placeholder="e.g. Speaks English and Spanish, prefers concise code..."
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-neutral-200 focus:outline-none focus:border-neutral-400 text-neutral-800 placeholder:text-neutral-400"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddFact();
                      if (e.key === 'Escape') setIsAddingFact(false);
                    }}
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingFact(false)}
                      className="px-3 py-1 text-xs text-neutral-500 hover:text-neutral-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddFact}
                      disabled={!newFactText.trim()}
                      className="px-3.5 py-1 text-xs bg-neutral-900 text-white rounded-lg hover:bg-black font-medium disabled:opacity-50 cursor-pointer"
                    >
                      Add Fact
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center py-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingFact(true)}
                    disabled={settings.keyFacts.length >= 20}
                    className="w-8 h-8 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 shadow-2xs flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer disabled:opacity-40"
                    title="Add key fact"
                  >
                    <Plus className="w-4 h-4 stroke-[2]" />
                  </button>
                </div>
              )}
            </div>

            {/* Summary Section */}
            <div className="space-y-1.5">
              <label
                htmlFor="memory-summary-textarea"
                className="text-[13px] font-medium text-neutral-900 block"
              >
                Summary
              </label>
              <textarea
                id="memory-summary-textarea"
                value={settings.summary}
                onChange={handleSummaryChange}
                placeholder="Enter a summary about yourself..."
                rows={5}
                className="w-full p-3.5 rounded-2xl border border-neutral-200 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 resize-none transition-colors select-text"
              />
              <div className="text-[11px] text-neutral-400 pl-0.5">
                {settings.summary.length} / 1000 characters
              </div>
            </div>

            {/* Remembered Automatically Section */}
            <div className="border-t border-neutral-100 pt-3">
              <button
                type="button"
                onClick={() => setIsAutoExpanded(!isAutoExpanded)}
                className="w-full flex items-center justify-between py-1 text-left group cursor-pointer"
              >
                <span className="text-[13px] font-medium text-neutral-900 group-hover:text-neutral-700">
                  Remembered automatically
                </span>
                {isAutoExpanded ? (
                  <ChevronUp className="w-4 h-4 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                )}
              </button>

              {isAutoExpanded && (
                <div className="mt-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 text-xs text-neutral-500 space-y-1 animate-in fade-in duration-150">
                  {settings.rememberedAutomatically.length > 0 ? (
                    <div className="space-y-1">
                      {settings.rememberedAutomatically.map((item, i) => (
                        <div key={i} className="text-neutral-700">
                          • {item}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="italic text-[11px]">
                      No automatic memories yet. As you chat, key details and preferences will appear here.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Update Memory Settings Button - Exact match to user screenshot */}
            <div className="pt-2">
              <button
                type="button"
                id="update-memory-settings-btn"
                onClick={handleSave}
                className="w-full py-3 bg-[#7fc4a9] hover:bg-[#71b69a] active:bg-[#64aa8e] text-white font-medium text-sm rounded-2xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Memory settings updated</span>
                  </>
                ) : (
                  <span>Update memory settings</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
