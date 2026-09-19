import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ChevronDown,
  Lock,
  Check,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import {
  AIModelPreference,
  getStoredAIPreferences,
  saveStoredAIPreferences,
  resetStoredAIPreferences,
} from '../../lib/storage';
import { AILogoIcon } from './AILogos';

interface AIModelPreferencesViewProps {
  onOpenUpgrade?: () => void;
  onClose?: () => void;
}

export const AIModelPreferencesView: React.FC<AIModelPreferencesViewProps> = ({
  onOpenUpgrade,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState<'text' | 'image'>('text');
  const [searchQuery, setSearchQuery] = useState('');
  const [preferences, setPreferences] = useState<AIModelPreference[]>(() =>
    getStoredAIPreferences()
  );
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter models based on category and search query
  const categoryModels = preferences.filter((m) => m.type === activeCategory);
  const displayedModels = categoryModels.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      m.provider.toLowerCase().includes(q) ||
      m.selectedModel.toLowerCase().includes(q) ||
      m.availableModels.some((item) => item.toLowerCase().includes(q))
    );
  });

  // Toggle model on/off
  const handleToggle = (id: string) => {
    setPreferences((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          isEnabled: !item.isEnabled,
        };
      })
    );
  };

  // Select a sub-model from the dropdown pill
  const handleSelectSubModel = (modelId: string, subModelName: string) => {
    setPreferences((prev) =>
      prev.map((item) => {
        if (item.id !== modelId) return item;
        return {
          ...item,
          selectedModel: subModelName,
        };
      })
    );
    setOpenDropdownId(null);
  };

  // Drag and drop reordering
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Set transparent drag ghost or minimal styling
    try {
      e.dataTransfer.setData('text/plain', index.toString());
    } catch {}
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder within the current category
    const currentCategoryList = [...categoryModels];
    const [movedItem] = currentCategoryList.splice(draggedIndex, 1);
    currentCategoryList.splice(targetIndex, 0, movedItem);

    // Merge reordered category back into global preferences
    const otherCategoryList = preferences.filter((m) => m.type !== activeCategory);
    const updated =
      activeCategory === 'text'
        ? [...currentCategoryList, ...otherCategoryList]
        : [...otherCategoryList, ...currentCategoryList];

    setPreferences(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Save changes to localStorage
  const handleUpdatePreferences = () => {
    saveStoredAIPreferences(preferences);
    setSaveStatus('Preferences updated');
    setTimeout(() => {
      setSaveStatus(null);
    }, 2500);
  };

  return (
    <div id="ai-model-preferences-container" className="flex flex-col h-full">
      {/* Header section */}
      <div className="flex items-start justify-between pb-1 select-none">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 tracking-tight leading-tight">
            AI model preferences
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Make AI Ashokra look the way you like.
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            id="settings-close-btn"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-800 p-1 rounded-lg transition-colors cursor-pointer -mt-1 -mr-1"
            aria-label="Close settings"
          >
            <X className="w-5 h-5 stroke-[1.8]" />
          </button>
        )}
      </div>

      {/* Search and Category Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 my-3">
        {/* Search Input Box */}
        <div className="relative flex-1 min-w-[200px] max-w-[280px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search models..."
            className="w-full bg-[#f8f8f8] hover:bg-[#f2f2f2] focus:bg-white text-xs text-neutral-900 placeholder-neutral-400 pl-9 pr-3 py-2 rounded-xl border border-neutral-200/70 focus:outline-hidden focus:ring-1 focus:ring-neutral-400 transition-all"
          />
        </div>

        {/* Category Pills (Text models 65 / Image models 14) */}
        <div className="flex items-center gap-1.5 text-xs font-medium select-none">
          {/* Text models 65 */}
          <button
            type="button"
            onClick={() => setActiveCategory('text')}
            className={`px-3 py-1.5 rounded-full flex items-center gap-2 transition-all cursor-pointer ${
              activeCategory === 'text'
                ? 'bg-[#18181b] text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <span>Text models</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                activeCategory === 'text'
                  ? 'bg-[#064e3b] text-[#34d399]'
                  : 'bg-neutral-200 text-neutral-700'
              }`}
            >
              65
            </span>
          </button>

          {/* Image models 14 */}
          <button
            type="button"
            onClick={() => setActiveCategory('image')}
            className={`px-3 py-1.5 rounded-full flex items-center gap-2 transition-all cursor-pointer ${
              activeCategory === 'image'
                ? 'bg-[#18181b] text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <span>Image models</span>
            <span className="text-[11px] text-neutral-500 font-normal">
              14
            </span>
          </button>
        </div>
      </div>

      {/* Model Cards List */}
      <div
        ref={dropdownRef}
        className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-2.5 my-2"
      >
        {displayedModels.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-neutral-200 rounded-2xl">
            <p className="text-xs text-neutral-500">
              No models found matching "{searchQuery}"
            </p>
          </div>
        ) : (
          displayedModels.map((item, index) => {
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;
            const isDropdownOpen = openDropdownId === item.id;

            return (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`group bg-white border rounded-2xl p-3 sm:py-3 sm:px-4 flex items-center justify-between gap-3 transition-all ${
                  isDragging
                    ? 'opacity-40 scale-[0.98] border-neutral-400 shadow-md'
                    : isDragOver
                    ? 'border-neutral-900 bg-neutral-50/80 shadow-xs'
                    : 'border-neutral-200/90 hover:border-neutral-300 shadow-2xs'
                }`}
              >
                {/* Left section: 6-dots drag handle + Provider Logo + Name */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* 6-dots drag handle icon */}
                  <button
                    type="button"
                    title="Drag to reorder"
                    className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-700 p-1 -ml-1 rounded-md hover:bg-neutral-100 transition-colors shrink-0"
                  >
                    {/* Authentic 6-dot matrix (2 columns x 3 dots) */}
                    <svg
                      width="14"
                      height="18"
                      viewBox="0 0 14 18"
                      fill="currentColor"
                      className="w-3.5 h-4.5"
                    >
                      <circle cx="4" cy="3" r="1.5" />
                      <circle cx="10" cy="3" r="1.5" />
                      <circle cx="4" cy="9" r="1.5" />
                      <circle cx="10" cy="9" r="1.5" />
                      <circle cx="4" cy="15" r="1.5" />
                      <circle cx="10" cy="15" r="1.5" />
                    </svg>
                  </button>

                  {/* Provider Logo */}
                  <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    <AILogoIcon type={item.iconType} size={20} />
                  </div>

                  {/* Provider Name + Gold Diamond if Pro */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm font-medium text-neutral-900 truncate">
                      {item.provider}
                    </span>
                    {item.isPro && (
                      <span
                        title="Pro Model"
                        className="inline-block w-2.5 h-2.5 bg-amber-400 rotate-45 rounded-[1px] shrink-0 shadow-2xs"
                      />
                    )}
                  </div>
                </div>

                {/* Right section: Model selection pill + Lock icon + Switch toggle */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* Model Selector Pill with Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenDropdownId(isDropdownOpen ? null : item.id)
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
                        item.isLocked && !item.isEnabled
                          ? 'bg-neutral-100/70 text-neutral-500 border-neutral-200/60'
                          : 'bg-neutral-100/90 hover:bg-neutral-200/70 text-neutral-800 border-neutral-200/80'
                      }`}
                    >
                      <span className="truncate max-w-[130px]">
                        {item.selectedModel}
                      </span>
                      <ChevronDown className="w-3 h-3 text-neutral-500 shrink-0" />
                    </button>

                    {/* Sub-model dropdown menu */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                        <div className="px-3 py-1 text-[10px] uppercase font-semibold tracking-wider text-neutral-400 border-b border-neutral-100 mb-1">
                          Available {item.provider} models
                        </div>
                        {item.availableModels.map((subModel) => {
                          const isCurrent = item.selectedModel === subModel;
                          return (
                            <button
                              key={subModel}
                              type="button"
                              onClick={() =>
                                handleSelectSubModel(item.id, subModel)
                              }
                              className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer ${
                                isCurrent
                                  ? 'font-medium text-neutral-900 bg-neutral-50'
                                  : 'text-neutral-700'
                              }`}
                            >
                              <span>{subModel}</span>
                              {isCurrent && (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Lock icon for Pro/Locked models */}
                  {item.isLocked && (
                    <div
                      title="Pro model"
                      className="text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      <Lock className="w-4 h-4 stroke-[1.8]" />
                    </div>
                  )}

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={item.isEnabled}
                    onClick={() => handleToggle(item.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 focus:outline-hidden ${
                      item.isEnabled
                        ? 'bg-[#10a37f]' // ChatGPT/OpenAI emerald green
                        : 'bg-[#e4e4e7]' // Soft gray
                    }`}
                  >
                    <span
                      className={`inline-block h-4.5 w-4.5 rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out ${
                        item.isEnabled
                          ? 'translate-x-5.5'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Footer Actions */}
      <div className="pt-3 border-t border-neutral-100 flex items-center justify-between select-none">
        {/* Left reset link */}
        <button
          type="button"
          onClick={() => {
            const defaults = resetStoredAIPreferences();
            setPreferences(defaults);
            setSaveStatus('Reset to default');
            setTimeout(() => setSaveStatus(null), 2000);
          }}
          className="text-xs text-neutral-500 hover:text-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset defaults</span>
        </button>

        {/* Right side: Save feedback + Update preferences button */}
        <div className="flex items-center gap-3">
          {saveStatus && (
            <span className="text-xs font-medium text-emerald-700 flex items-center gap-1 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>{saveStatus}</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleUpdatePreferences}
            className="bg-[#18181b] hover:bg-black text-white px-5 py-2.5 rounded-full text-xs font-medium transition-all shadow-xs active:scale-98 cursor-pointer"
          >
            Update preferences
          </button>
        </div>
      </div>
    </div>
  );
};
