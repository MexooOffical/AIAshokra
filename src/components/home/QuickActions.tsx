import React from 'react';
import {
  Clapperboard,
  Image as ImageIcon,
  Atom,
  Presentation,
  Columns2,
} from 'lucide-react';
import { QuickAction } from '../../types';

interface QuickActionsProps {
  onActionSelect: (action: QuickAction) => void;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'videos',
    label: 'Videos',
    iconName: 'Clapperboard',
  },
  {
    id: 'slides',
    label: 'Slides',
    iconName: 'Slides',
  },
  {
    id: 'images',
    label: 'Images',
    iconName: 'ImageIcon',
  },
  {
    id: 'compare',
    label: 'Compare',
    iconName: 'Compare',
  },
  {
    id: 'deep-research',
    label: 'Deep Research',
    iconName: 'Atom',
  },
];

export const QuickActions: React.FC<QuickActionsProps> = ({ onActionSelect }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Clapperboard':
        return <Clapperboard className="w-[18px] h-[18px] text-neutral-700 stroke-[1.9]" />;
      case 'Slides':
        return <Presentation className="w-[18px] h-[18px] text-neutral-700 stroke-[1.9]" />;
      case 'ImageIcon':
        return <ImageIcon className="w-[18px] h-[18px] text-neutral-700 stroke-[1.9]" />;
      case 'Compare':
        return <Columns2 className="w-[18px] h-[18px] text-neutral-700 stroke-[1.9]" />;
      case 'Atom':
        return <Atom className="w-[18px] h-[18px] text-neutral-700 stroke-[1.9]" />;
      default:
        return null;
    }
  };

  return (
    <div
      id="quick-actions"
      className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 mt-6 sm:mt-8 max-w-3xl mx-auto px-3"
    >
      {QUICK_ACTIONS.map((action) => (
        <button
          key={action.id}
          id={`quick-action-${action.id}`}
          type="button"
          onClick={() => onActionSelect(action)}
          className="inline-flex items-center gap-2.5 px-4.5 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white border border-neutral-200/95 text-sm sm:text-[15px] font-medium text-neutral-800 hover:text-neutral-950 hover:bg-neutral-50/90 hover:border-neutral-300 transition-all duration-150 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] cursor-pointer select-none active:scale-[0.98]"
        >
          <span className="shrink-0">{getIcon(action.iconName)}</span>
          <span className="leading-none">{action.label}</span>
        </button>
      ))}
    </div>
  );
};
