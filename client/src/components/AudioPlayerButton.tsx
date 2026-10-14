import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext.js';

interface AudioPlayerButtonProps {
  textToSpeak: string;
  label?: string;
  className?: string;
}

export const AudioPlayerButton: React.FC<AudioPlayerButtonProps> = ({
  textToSpeak,
  label = 'ऑडियो सुनें (Listen)',
  className = '',
}) => {
  const { speakText, isSpeaking, stopSpeaking } = useAccessibility();

  const handleToggle = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(textToSpeak, 'hi-IN');
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
        isSpeaking
          ? 'bg-amber-100 border-amber-300 text-amber-900 animate-pulse'
          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
      } ${className}`}
      title="ध्वनि सहायता से सुनें"
    >
      {isSpeaking ? (
        <>
          <VolumeX className="w-4 h-4 text-amber-700" />
          <span>आवाज बंद करें (Stop)</span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4 text-blue-600" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};
