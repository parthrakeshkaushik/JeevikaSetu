import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Edit3, Volume2, Sparkles, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';
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
  const [showNoSpeechModal, setShowNoSpeechModal] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
    }

    return () => {
      cleanupAudio();
    };
  }, []);

  const cleanupAudio = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = () => {
    cleanupAudio();
    setErrorMessage(null);
    setInfoMessage(null);
    setShowNoSpeechModal(false);
    setTranscript('');
    transcriptRef.current = '';
    setRecordingSeconds(0);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      setErrorMessage('आपके ब्राउज़र में स्पीच रिकॉग्निशन उपलब्ध नहीं है। कृपया नीचे टाइप करें या विकल्प चुनें।');
      setManualTextMode(true);
      return;
    }

    try {
      // Create a FRESH instance on every start to prevent stale driver state
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = language === 'en' ? 'en-IN' : 'hi-IN';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalText += res[0].transcript + ' ';
          } else {
            interimText += res[0].transcript;
          }
        }

        const fullText = (finalText + interimText).trim();
        if (fullText) {
          transcriptRef.current = fullText;
          setTranscript(fullText);
          setErrorMessage(null);
          setInfoMessage(null);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);

        if (event.error === 'no-speech') {
          setInfoMessage('आवाज नहीं सुनाई दी। कृपया माइक्रोफोन के समीप थोड़ा तेज बोलें...');
          return;
        }

        if (event.error === 'not-allowed') {
          setErrorMessage('माइक्रोफोन अनुमति अस्वीकृत है। कृपया ब्राउज़र में माइक्रोफोन की अनुमति दें या नीचे टाइप करें।');
          setIsRecording(false);
          cleanupAudio();
          return;
        }

        if (event.error === 'network') {
          setInfoMessage('ब्राउज़र स्पीच नेटवर्क धीमा या बाधित है। यदि आपकी आवाज नहीं लिखी जा रही है, तो नीचे विकल्प चुनें या टाइप करें।');
          return;
        }
      };

      recognition.onend = () => {
        // Only stop if timer is cleared
      };

      recognitionRef.current = recognition;
      recognition.start();

      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Failed to start speech recognition:', err);
      setErrorMessage('माइक्रोफोन चालू करने में समस्या आई। कृपया दोबारा प्रयास करें या नीचे टाइप करें।');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    cleanupAudio();
    setIsRecording(false);

    const captured = (transcriptRef.current || transcript).trim();
    if (captured.length > 0) {
      // User spoke and words were recognized!
      onTranscriptReady(captured, true);
    } else {
      // No words were recognized by the browser API.
      // NEVER invent a fake statement! Show options to the user directly!
      setShowNoSpeechModal(true);
    }
  };

  const handleSelectSample = (sampleText: string) => {
    cleanupAudio();
    setTranscript(sampleText);
    transcriptRef.current = sampleText;
    setIsRecording(false);
    setShowNoSpeechModal(false);
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
                <span>सुन रहे हैं... कृपया बोलें ({recordingSeconds}s)</span>
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

          {/* LIVE Transcript Box (User sees their words appearing as they talk!) */}
          {transcript && (
            <div className="mt-5 w-full p-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl text-left shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800 uppercase tracking-wide">
                <span>पहचाने गए शब्द (Recognised Speech):</span>
                {isRecording && <span className="text-red-600 animate-pulse">● रिकॉर्डिंग जारी</span>}
              </div>
              <p className="text-base sm:text-lg text-slate-900 font-bold leading-relaxed font-sans">
                "{transcript}"
              </p>
              {!isRecording && (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onTranscriptReady(transcript, true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-xs flex items-center gap-1.5"
                  >
                    <span>हाँ, यही नुकसान है (आगे बढ़ें)</span>
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
            onChange={(e) => {
              setTranscript(e.target.value);
              transcriptRef.current = e.target.value;
            }}
            placeholder="उदा. हमारी 2 बीघा धान की फसल बाढ़ में डूब गई और मवेशियों के लिए चारा नहीं मिल रहा है..."
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

      {/* Fallback Dialog if Browser Did Not Capture Speech */}
      {showNoSpeechModal && (
        <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-left space-y-3 w-full shadow-md">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                आवाज के शब्द स्पष्ट नहीं हुए (No speech recognized)
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                ब्राउज़र स्पीच क्लाउड द्वारा कोई शब्द नहीं पहचाना जा सका। कृपया नीचे से अपनी क्षति का प्रकार चुनें या टाइप करें:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleSelectSample('बाढ़ के पानी से धान की फसल डूब गई और मवेशियों के लिए चारा नहीं बचा है।')}
              className="p-2.5 bg-white hover:bg-amber-100 border border-amber-200 rounded-lg text-xs text-left font-semibold text-slate-800 transition-colors"
            >
              🌾 फसल एवं पशु चारा संकट
            </button>
            <button
              type="button"
              onClick={() => handleSelectSample('किराना दुकान में पानी घुसने से सारा अनाज और राशन भीग कर खराब हो गया।')}
              className="p-2.5 bg-white hover:bg-amber-100 border border-amber-200 rounded-lg text-xs text-left font-semibold text-slate-800 transition-colors"
            >
              🏪 दुकान एवं भंडारित माल क्षति
            </button>
            <button
              type="button"
              onClick={() => handleSelectSample('बाढ़ के कारण पिछले 10 दिनों से दैनिक मजदूरी का काम बिल्कुल बंद है।')}
              className="p-2.5 bg-white hover:bg-amber-100 border border-amber-200 rounded-lg text-xs text-left font-semibold text-slate-800 transition-colors"
            >
              🔨 दैनिक मजदूरी अवरोध
            </button>
            <button
              type="button"
              onClick={() => handleSelectSample('सिंचाई का डीजल पंपसेट और पाइपलाइन बाढ़ के तेज बहाव में गाद में धंस गई है।')}
              className="p-2.5 bg-white hover:bg-amber-100 border border-amber-200 rounded-lg text-xs text-left font-semibold text-slate-800 transition-colors"
            >
              🚜 कृषि उपकरण / पम्पसेट क्षति
            </button>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-amber-200 text-xs">
            <button
              type="button"
              onClick={startRecording}
              className="text-blue-700 font-bold hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>दोबारा बोलें (Try Speaking Again)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNoSpeechModal(false);
                setManualTextMode(true);
              }}
              className="text-slate-700 font-bold hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>लिखकर बताएं (Type Instead)</span>
            </button>
          </div>
        </div>
      )}

      {/* Switch to typing toggle */}
      {!manualTextMode && !showNoSpeechModal && (
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

      {/* 1-Click Tap Scenarios */}
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
