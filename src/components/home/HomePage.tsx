import React, { useState, useEffect } from 'react';
import { Sparkles, Terminal } from 'lucide-react';
import { WelcomeSection } from './WelcomeSection';
import { PromptBox } from './PromptBox';
import { QuickActions } from './QuickActions';
import { PromptMode, QuickAction } from '../../types';
import { saveStoredPrompt, getStoredPrompts } from '../../lib/storage';

interface HomePageProps {
  userName?: string;
  onNavigateTo?: (section: string) => void;
  onPromptSaved?: (count: number) => void;
  onOpenFirebaseModal?: () => void;
  onOpenPromptBook?: () => void;
  onOpenUpgradeModal?: () => void;
  onStartChat?: (prompt: string, mode: PromptMode, selectedModels?: string[]) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  userName = 'Spectar',
  onPromptSaved,
  onOpenFirebaseModal,
  onOpenPromptBook,
  onOpenUpgradeModal,
  onStartChat,
}) => {
  // Empty default prompt so placeholder appears clean
  const [promptText, setPromptText] = useState('');
  const [isChooseModelOpen, setIsChooseModelOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [activeNotification, setActiveNotification] = useState<{
    msg: string;
    hasPromptBook?: boolean;
  } | null>(null);
  const [savedCount, setSavedCount] = useState(0);

  // Initial fetch of saved prompts from Local Storage
  useEffect(() => {
    const prompts = getStoredPrompts(10);
    setSavedCount(prompts.length);
    onPromptSaved?.(prompts.length);
  }, [onPromptSaved]);

  const showNotification = (msg: string, hasPromptBook = false) => {
    setActiveNotification({ msg, hasPromptBook });
    setTimeout(() => {
      setActiveNotification((current) => (current?.msg === msg ? null : current));
    }, 4000);
  };

  const handlePromptSubmit = async (
    prompt: string,
    mode: PromptMode,
    selectedModels?: string[]
  ) => {
    // Save to Local Storage
    try {
      saveStoredPrompt(prompt, mode);
      const updated = getStoredPrompts(10);
      setSavedCount(updated.length);
      onPromptSaved?.(updated.length);
    } catch {}

    // Delegate immediately to chat conversation stream
    if (onStartChat) {
      onStartChat(prompt, mode, selectedModels);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    if (action.id === 'compare') {
      // Directly open model selector with zero prompt population or notification
      setIsChooseModelOpen(true);
      return;
    }
    // For videos, slides, images, deep research: toggle active category tag without inserting prompt text
    setActiveFeature((prev) => (prev === action.label ? null : action.label));
  };

  return (
    <main
      id="home-page-container"
      className="relative flex-1 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-12 overflow-hidden bg-[#fafaf9]"
    >
      {/* Soft ethereal mint/emerald ambient glow with radiant presence */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[940px] max-w-[95vw] h-[560px] pointer-events-none select-none -z-0"
        style={{
          background:
            'radial-gradient(55% 55% at 50% 50%, rgba(167, 243, 208, 0.5) 0%, rgba(209, 250, 229, 0.3) 45%, rgba(240, 253, 244, 0.15) 70%, rgba(250, 250, 249, 0) 100%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Centered Main Interactive Canvas */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        {/* Welcome Greeting */}
        <WelcomeSection userName={userName} />

        {/* Central Search & Prompt Input */}
        <PromptBox
          value={promptText}
          onChange={setPromptText}
          onSubmit={handlePromptSubmit}
          placeholder="What would you like to create?"
          onOpenUpgrade={onOpenUpgradeModal}
          isChooseModelOpen={isChooseModelOpen}
          setIsChooseModelOpen={setIsChooseModelOpen}
          activeFeature={activeFeature}
          setActiveFeature={setActiveFeature}
        />

        {/* Quick Action Category Pills */}
        <QuickActions onActionSelect={handleQuickAction} />
      </div>

      {/* Floating notification for prompt actions */}
      {activeNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white text-xs font-medium py-2.5 px-4 rounded-xl shadow-lg border border-neutral-800 animate-in fade-in slide-in-from-bottom-3 duration-200 flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span>{activeNotification.msg}</span>

          {activeNotification.hasPromptBook && (
            <button
              type="button"
              onClick={() => {
                if (onOpenPromptBook) {
                  onOpenPromptBook();
                } else {
                  onOpenFirebaseModal?.();
                }
              }}
              className="ml-1 text-emerald-300 hover:text-emerald-200 underline font-normal flex items-center gap-1 cursor-pointer"
            >
              <span>PromptBook</span>
            </button>
          )}
        </div>
      )}
    </main>
  );
};
