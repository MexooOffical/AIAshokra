import React from 'react';
import { X } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="logout-confirm-backdrop"
      className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="logout-confirm-card"
        className="bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 max-w-[440px] w-full shadow-2xl relative text-center border border-neutral-100/90 animate-in zoom-in-95 duration-200"
      >
        {/* Close 'X' Button */}
        <button
          type="button"
          id="logout-modal-close-btn"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[2]" />
        </button>

        {/* Center AI Ashokra Logo */}
        <div className="flex justify-center mb-4 sm:mb-5">
          <img
            src="/assets/ai-ashokra-logo.png"
            alt="AI Ashokra"
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent && !parent.querySelector('.fallback-logo')) {
                const fallback = document.createElement('div');
                fallback.className =
                  'fallback-logo w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-cyan-400 flex items-center justify-center text-white font-bold text-2xl shadow-md';
                fallback.innerText = 'A';
                parent.appendChild(fallback);
              }
            }}
          />
        </div>

        {/* Title */}
        <h3 className="text-2xl sm:text-[26px] font-bold text-neutral-900 tracking-tight mb-2">
          Leaving AI Ashokra?
        </h3>

        {/* Subtitle */}
        <p className="text-sm sm:text-[14.5px] text-neutral-500 leading-relaxed max-w-[320px] mx-auto mb-8 font-normal">
          Your conversations are safely saved and will be waiting when you return.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            id="confirm-logout-btn"
            onClick={onConfirmLogout}
            className="flex-1 py-3.5 px-5 rounded-full border border-neutral-200/90 bg-white hover:bg-neutral-50 text-neutral-900 font-semibold text-sm sm:text-[15px] transition-all shadow-xs cursor-pointer active:scale-[0.99]"
          >
            Log out
          </button>
          <button
            type="button"
            id="stay-signed-in-btn"
            onClick={onClose}
            className="flex-1 py-3.5 px-5 rounded-full bg-[#1c1f26] hover:bg-[#111317] text-white font-semibold text-sm sm:text-[15px] transition-all shadow-xs cursor-pointer active:scale-[0.99]"
          >
            Stay Signed In
          </button>
        </div>
      </div>
    </div>
  );
};
