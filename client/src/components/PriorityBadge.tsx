import React, { useState } from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';

interface PriorityBadgeProps {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | string;
  rationale?: string | null;
  showScore?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  score,
  level,
  rationale,
  showScore = true,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const levelStyles: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    URGENT: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-700',
      dot: 'bg-red-600 animate-pulse',
      label: 'अति-प्राथमिक (Urgent)',
    },
    HIGH: {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-800',
      dot: 'bg-amber-500',
      label: 'उच्च (High)',
    },
    MEDIUM: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
      label: 'मध्यम (Medium)',
    },
    LOW: {
      bg: 'bg-slate-50 border-slate-200',
      text: 'text-slate-700',
      dot: 'bg-slate-400',
      label: 'सामान्य (Low)',
    },
  };

  const style = levelStyles[level] || levelStyles.LOW;

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} hover:shadow-sm transition-all focus:outline-none`}
        title="प्राथमिकता विवरण देखें (Click for explainable rationale)"
      >
        <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
        <span>{style.label}</span>
        {showScore && <span className="opacity-75 font-mono">({score})</span>}
        <HelpCircle className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {showTooltip && rationale && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-72 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl pointer-events-none border border-slate-700">
          <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            पारदर्शी प्राथमिकता गणना ({score}/100):
          </div>
          <div className="text-slate-300 leading-relaxed font-sans">{rationale}</div>
          <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-800 pt-1">
            * यह स्कोर मानवीय निर्णय सहायता हेतु है, कानूनी पात्रता निर्धारण नहीं।
          </div>
        </div>
      )}
    </div>
  );
};
