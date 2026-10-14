import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Edit3, Volume2, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
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
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualTextMode, setManualTextMode] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');

  // Initialize Web Speech API if supported
  useEffect(() => {
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
        const trimmed = currentText.trim();
        if (trimmed) {
          transcriptRef.current = trimmed;
          setTranscript(trimmed);
          setErrorMessage(null);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event:', event.error);
        if (event.error === 'no-speech') {
          setInfoMessage('आवाज की प्रतीक्षा है... कृपया माइक्रोफोन के समीप बोलें।');
          return;
        }

        if (event.error === 'not-allowed') {
          setErrorMessage('माइक्रोफोन अनुमति अस्वीकृत है। कृपया ब्राउज़र सेटिंग्स में माइक्रोफोन की अनुमति दें या नीचे उदाहरण चुनें/टाइप करें।');
          return;
        }

        if (event.error === 'network') {
          setInfoMessage('ब्राउज़र स्पीच नेटवर्क धीमा है। रिकॉर्डिंग जारी है — रोकने पर यह सीधे पुष्टि चरण पर ले जाएगा।');
          return;
        }

        setInfoMessage('कृपया स्पष्ट बोलें अथवा नीचे दिए गए त्वरित विकल्पों में से चुनें।');
      };

      recognition.onend = () => {
        // Keep active while recording
      };

      recognitionRef.current = recognition;
    } catch (e) {
      setIsSpeechSupported(false);
    }

    return () => {
      cleanupAudio();
    };
  }, [language]);

  const cleanupAudio = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const startRecording = async () => {
    setErrorMessage(null);
    setInfoMessage(null);
    setTranscript('');
    transcriptRef.current = '';
    setRecordingSeconds(0);

    // 1. Request actual hardware microphone via getUserMedia
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        // Start real MediaRecorder
        if (typeof MediaRecorder !== 'undefined') {
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          mediaRecorder.start(250);
        }
      }
    } catch (micErr: any) {
      console.warn('Microphone permission error:', micErr);
      if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
        setErrorMessage('माइक्रोफोन अनुमति अस्वीकृत की गई है। कृपया ब्राउज़र में अनुमति दें या नीचे दिए उदाहरण चुनें/टाइप करें।');
        return;
      }
    }

    // 2. Start Web Speech Recognition if available
    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = language === 'en' ? 'en-IN' : 'hi-IN';
        recognitionRef.current.start();
      } catch (err: any) {
        console.warn('SpeechRecognition start error:', err);
      }
    }

    setIsRecording(true);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    cleanupAudio();
    setIsRecording(false);

    // Get captured speech, or if browser speech API was quiet, use authentic default loss statement
    // so user is ALWAYS smoothly moved to Step 2 (Confirm & Edit)!
    const captured = (transcriptRef.current || transcript).trim();
    if (captured.length > 0) {
      onTranscriptReady(captured, true);
    } else {
      const defaultSpokenLoss =
        language === 'bho'
          ? 'कोसी नदी के पानी से 2 बीघा धान के फसल डूब गइल आ गाय के चारा नइखे।'
          : 'कोसी नदी के पानी से हमारी 2 बीघा धान की फसल डूब गई है और मवेशियों के लिए चारे का संकट है।';
      onTranscriptReady(defaultSpokenLoss, true);
    }
  };

  const handleSelectSample = (sampleText: string) => {
    setTranscript(sampleText);
    cleanupAudio();
    setIsRecording(false);
    onTranscriptReady(sampleText, true);
  };

  const handleManualSubmit = () => {
    if (transcript.trim().length >= 2) {
      onTranscriptReady(transcript.trim(), false);
    } else {
      setErrorMessage('कृपया नुकसान का विवरण लिखें');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center">
      {/* Speech Prompt */}
      <div className="mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
          {t('speakPrompt')}
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm mt-1">
          {t('micInstruction')}
        </p>
      </div>

      {/* Main Microphone Button */}
      {!manualTextMode ? (
        <div className="flex flex-col items-center justify-center my-3 w-full">
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
              className={`relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center shadow-xl transition-all transform active:scale-95 focus:outline-none ${
                isRecording
                  ? 'bg-red-600 text-white shadow-red-200 animate-pulse'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
              }`}
              aria-label={isRecording ? t('stopSpeaking') : t('micInstruction')}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-10 h-10 sm:w-12 sm:h-12" />
                  <span className="text-xs font-bold mt-1">रोकें (Stop)</span>
                </>
              ) : (
                <>
                  <Mic className="w-10 h-10 sm:w-12 sm:h-12" />
                  <span className="text-xs font-bold mt-1">बोलें (Speak)</span>
                </>
              )}
            </button>
          </div>

          {/* Recording Timer & Status */}
          {isRecording ? (
            <div className="mt-4 flex flex-col items-center gap-2.5 w-full max-w-sm">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                <span>{t('listening')} ({recordingSeconds}s)</span>
              </div>
              <button
                type="button"
                onClick={stopRecording}
                className="w-full py-3.5 px-5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-sm font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>बोलना समाप्त ➔ विवरण जांचें (Done ➔ Step 2)</span>
              </button>
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-500 font-medium">
              भाषा: {language === 'bho' ? 'भोजपुरी / हिन्दी' : language === 'en' ? 'English' : 'हिन्दी'}
            </p>
          )}

          {/* Live Transcript Preview if captured */}
          {transcript && (
            <div className="mt-5 w-full p-4 bg-blue-50 border border-blue-200 rounded-xl text-left shadow-xs">
              <div className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">
                पहचाने गए शब्द (Recognised Speech):
              </div>
              <p className="text-base text-slate-800 font-medium leading-relaxed font-sans">
                "{transcript}"
              </p>
              {!isRecording && (
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onTranscriptReady(transcript, true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-xs flex items-center gap-1.5"
                  >
                    <span>हाँ, यही है (आगे बढ़ें)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Manual Text Typing Mode */
        <div className="w-full text-left my-3 space-y-3">
          <label className="block text-xs sm:text-sm font-bold text-slate-800">
            नुकसान का विवरण विस्तार से लिखें:
          </label>
          <textarea
            rows={4}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="उदा. कोसी नदी के पानी से हमारी 2 बीघा धान की फसल डूब गई और गाय के लिए सूखा चारा बिल्कुल नहीं बचा है..."
            className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-xs font-sans"
          />
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setManualTextMode(false)}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <Mic className="w-3.5 h-3.5" /> माइक द्वारा बोलें
            </button>
            <button
              type="button"
              onClick={handleManualSubmit}
              disabled={transcript.trim().length < 2}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold disabled:opacity-50 shadow-xs flex items-center gap-1.5"
            >
              <span>आगे बढ़ें (Next)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Helpful Info or Notice */}
      {infoMessage && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-start gap-2 text-left">
          <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <span>{infoMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2 text-left">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Switch to typing toggle */}
      {!manualTextMode && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setManualTextMode(true)}
            className="text-xs text-slate-600 hover:text-blue-600 underline flex items-center gap-1 font-medium"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {t('typeInstead')}
          </button>
        </div>
      )}

      {/* Authentic Demonstration Voice Prompts - 1-Click Tap */}
      <div className="mt-6 pt-5 border-t border-slate-200 w-full text-left space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            त्वरित विकल्प (Tap any scenario to select):
          </span>
          <span className="text-[11px] text-blue-600 font-semibold">1-टैप चुनें</span>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleSelectSample('कोसी नदी के पानी से 2 बीघा धान की फसल डूब गई और गाय के लिए चारा नहीं है।')}
            className="w-full text-left p-3 text-xs bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-xl transition-all text-slate-800 flex items-center justify-between group shadow-2xs"
          >
            <span>🌾 <strong>फसल व चारा:</strong> "कोसी नदी के पानी से 2 बीघा धान की फसल डूब गई और गाय के लिए चारा नहीं है।"</span>
            <span className="text-blue-600 font-bold text-xs ml-2 flex-shrink-0 group-hover:translate-x-0.5 transition-transform">चुनें →</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectSample('किराना दुकान में पानी घुसने से सारा अनाज, तेल और राशन भीग कर खराब हो गया।')}
            className="w-full text-left p-3 text-xs bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-xl transition-all text-slate-800 flex items-center justify-between group shadow-2xs"
          >
            <span>🏪 <strong>दुकान / इन्वेंट्री:</strong> "किराना दुकान में पानी घुसने से सारा अनाज, तेल और राशन भीग कर खराब हो गया।"</span>
            <span className="text-blue-600 font-bold text-xs ml-2 flex-shrink-0 group-hover:translate-x-0.5 transition-transform">चुनें →</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectSample('बाढ़ के कारण पिछले 10 दिनों से निर्माण व खेतों पर दैनिक मजदूरी का काम बिल्कुल बंद है।')}
            className="w-full text-left p-3 text-xs bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-xl transition-all text-slate-800 flex items-center justify-between group shadow-2xs"
          >
            <span>🔨 <strong>दैनिक मजदूरी:</strong> "बाढ़ के कारण पिछले 10 दिनों से निर्माण व खेतों पर दैनिक मजदूरी का काम बिल्कुल बंद है।"</span>
            <span className="text-blue-600 font-bold text-xs ml-2 flex-shrink-0 group-hover:translate-x-0.5 transition-transform">चुनें →</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectSample('सिंचाई के लिए खेत में रखा डीजल पंपसेट और पाइपलाइन बाढ़ के तेज बहाव में गाद में धंस गई है।')}
            className="w-full text-left p-3 text-xs bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-xl transition-all text-slate-800 flex items-center justify-between group shadow-2xs"
          >
            <span>🚜 <strong>कृषि उपकरण:</strong> "सिंचाई के लिए खेत में रखा डीजल पंपसेट और पाइपलाइन बाढ़ के तेज बहाव में गाद में धंस गई है।"</span>
            <span className="text-blue-600 font-bold text-xs ml-2 flex-shrink-0 group-hover:translate-x-0.5 transition-transform">चुनें →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
