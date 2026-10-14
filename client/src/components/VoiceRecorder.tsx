import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, RefreshCw, Edit3, Volume2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { useAccessibility } from '../context/AccessibilityContext.js';

interface VoiceRecorderProps {
  onTranscriptReady: (transcript: string, isVoice: boolean) => void;
  initialTranscript?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptReady,
  initialTranscript = '',
}) => {
  const { t, language } = useLanguage();
  const { speakText } = useAccessibility();

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState(initialTranscript);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualTextMode, setManualTextMode] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'en' ? 'en-IN' : 'hi-IN';

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentText.trim());
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('माइक्रोफोन अनुमति अस्वीकृत की गई है। कृपया ब्राउज़र में अनुमति दें या नीचे टाइप करें।');
        } else if (event.error === 'no-speech') {
          // No speech detected, keep waiting
        } else {
          setErrorMessage('आवाज पहचानने में समस्या आई। आप नीचे दिए गए उदाहरण चुन सकते हैं या टाइप कर सकते हैं।');
        }
        stopRecording();
      };

      recognition.onend = () => {
        setIsRecording(false);
        clearInterval(timerRef.current);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      setIsSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      clearInterval(timerRef.current);
    };
  }, [language]);

  const startRecording = () => {
    setErrorMessage(null);
    setTranscript('');
    setRecordingSeconds(0);

    if (!recognitionRef.current) {
      setErrorMessage('इस ब्राउज़र में स्पीच रिकॉग्निशन समर्थित नहीं है। कृपया नीचे दिए उदाहरण चुनें या सीधे लिखें।');
      setManualTextMode(true);
      return;
    }

    try {
      recognitionRef.current.lang = language === 'en' ? 'en-IN' : 'hi-IN';
      recognitionRef.current.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Could not start recognition:', err);
      // Already running or failed
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
    clearInterval(timerRef.current);

    if (transcript.trim().length > 0) {
      onTranscriptReady(transcript.trim(), true);
    }
  };

  const handleSelectSample = (sampleText: string) => {
    setTranscript(sampleText);
    onTranscriptReady(sampleText, true);
  };

  const handleManualSubmit = () => {
    if (transcript.trim().length >= 5) {
      onTranscriptReady(transcript.trim(), false);
    } else {
      setErrorMessage('कृपया कम से कम 5 अक्षरों में नुकसान का विवरण लिखें');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center">
      {/* Speech Prompt */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
          {t('speakPrompt')}
        </h2>
        <p className="text-slate-600 text-sm mt-1">
          {t('micInstruction')}
        </p>
      </div>

      {/* Main Microphone Button */}
      {!manualTextMode ? (
        <div className="flex flex-col items-center justify-center my-4">
          <div className="relative">
            {/* Animated pulsing rings while recording */}
            {isRecording && (
              <>
                <span className="absolute inset-0 rounded-full bg-red-400 opacity-40 animate-ping"></span>
                <span className="absolute -inset-4 rounded-full bg-red-300 opacity-30 animate-pulse"></span>
              </>
            )}

            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center shadow-lg transition-transform transform active:scale-95 focus:outline-none ${
                isRecording
                  ? 'bg-red-600 text-white shadow-red-200 animate-pulse'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
              }`}
              aria-label={isRecording ? t('stopSpeaking') : t('micInstruction')}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-10 h-10 sm:w-12 sm:h-12" />
                  <span className="text-xs font-semibold mt-1">रोकें (Stop)</span>
                </>
              ) : (
                <>
                  <Mic className="w-10 h-10 sm:w-12 sm:h-12" />
                  <span className="text-xs font-semibold mt-1">बोलें (Speak)</span>
                </>
              )}
            </button>
          </div>

          {/* Recording Timer & Status */}
          {isRecording ? (
            <div className="mt-4 flex items-center gap-2 text-red-600 font-medium text-sm animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <span>{t('listening')} ({recordingSeconds}s)</span>
            </div>
          ) : (
            <p className="mt-4 text-xs text-slate-500">
              भाषा: {language === 'bho' ? 'भोजपुरी / हिन्दी' : language === 'en' ? 'English' : 'हिन्दी'}
            </p>
          )}

          {/* Live Transcript Preview */}
          {transcript && (
            <div className="mt-6 w-full p-4 bg-blue-50 border border-blue-200 rounded-xl text-left shadow-sm">
              <div className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-1">
                पहचाने गए शब्द (Recognised Speech):
              </div>
              <p className="text-base text-slate-800 font-medium leading-relaxed">
                "{transcript}"
              </p>
              {!isRecording && (
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onTranscriptReady(transcript, true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow"
                  >
                    हाँ, यही है (आगे बढ़ें)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Manual Text Typing Mode */
        <div className="w-full text-left my-4">
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            नुकसान का विवरण विस्तार से लिखें:
          </label>
          <textarea
            rows={4}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="उदा. हमारी 2 बीघा धान की फसल बाढ़ में डूब गई और मवेशियों के लिए चारा नहीं मिल रहा है..."
            className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm"
          />
          <div className="mt-3 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setManualTextMode(false)}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              <Mic className="w-3.5 h-3.5" /> माइक द्वारा बोलें
            </button>
            <button
              type="button"
              onClick={handleManualSubmit}
              disabled={transcript.trim().length < 5}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 shadow"
            >
              आगे बढ़ें (Next)
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-start gap-2 text-left">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Switch to typing toggle */}
      {!manualTextMode && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setManualTextMode(true)}
            className="text-sm text-slate-600 hover:text-blue-600 underline flex items-center gap-1.5"
          >
            <Edit3 className="w-4 h-4" />
            {t('typeInstead')}
          </button>
        </div>
      )}

      {/* Authentic Demonstration Fallback Samples */}
      <div className="mt-8 pt-6 border-t border-slate-200 w-full text-left">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
          {t('speechFallbackNote')}
        </p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleSelectSample(t('sampleSpeech1'))}
            className="w-full text-left p-3 text-xs sm:text-sm bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-lg transition-colors text-slate-700 flex items-center justify-between"
          >
            <span>🌾 1. "{t('sampleSpeech1')}"</span>
            <span className="text-blue-600 font-medium text-xs ml-2 flex-shrink-0">चुनें</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectSample(t('sampleSpeech2'))}
            className="w-full text-left p-3 text-xs sm:text-sm bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-lg transition-colors text-slate-700 flex items-center justify-between"
          >
            <span>🏪 2. "{t('sampleSpeech2')}"</span>
            <span className="text-blue-600 font-medium text-xs ml-2 flex-shrink-0">चुनें</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectSample(t('sampleSpeech3'))}
            className="w-full text-left p-3 text-xs sm:text-sm bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-lg transition-colors text-slate-700 flex items-center justify-between"
          >
            <span>🔨 3. "{t('sampleSpeech3')}"</span>
            <span className="text-blue-600 font-medium text-xs ml-2 flex-shrink-0">चुनें</span>
          </button>
        </div>
      </div>
    </div>
  );
};
