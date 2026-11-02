import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Edit3, CheckCircle2, ArrowRight, RefreshCw, Send, Radio, Volume2, PlayCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { useAccessibility } from '../context/AccessibilityContext.js';

interface VoiceRecorderProps {
  onTranscriptReady: (transcript: string, isVoice: boolean, audioUrl?: string) => void;
  initialTranscript?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptReady,
  initialTranscript = '',
}) => {
  const { t, language } = useLanguage();
  const { speakText } = useAccessibility();

  const [isRecording, setIsRecording] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [soundDetected, setSoundDetected] = useState(false);
  const [transcript, setTranscript] = useState(initialTranscript);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualTextMode, setManualTextMode] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [showDirectAudioBox, setShowDirectAudioBox] = useState(false);
  const [fallbackCustomText, setFallbackCustomText] = useState('');

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordedAudioRef = useRef<string | null>(null);

  const timerRef = useRef<any>(null);
  const pendingTimerRef = useRef<any>(null);
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
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
      mediaRecorderRef.current = null;
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {}
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsFinalizing(false);
  };

  const startActualRecording = (stream: MediaStream) => {
    streamRef.current = stream;
    audioChunksRef.current = [];

    // 1. Initialize MediaRecorder for direct audio storage & playback
    try {
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: recorder.mimeType || 'audio/webm',
          });
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Data = reader.result as string;
            setRecordedAudioUrl(base64Data);
            recordedAudioRef.current = base64Data;
          };
          reader.readAsDataURL(audioBlob);
        }
      };

      recorder.start(200);
      mediaRecorderRef.current = recorder;
    } catch (err) {
      console.warn('MediaRecorder initialisation warning:', err);
    }

    // 2. Concurrently run SpeechRecognition for real-time text if available
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.lang = language === 'en' ? 'en-IN' : 'hi-IN';

        recognition.onstart = () => {
          setIsRecording(true);
          setIsFinalizing(false);
        };

        recognition.onaudiostart = () => setSoundDetected(true);
        recognition.onsoundstart = () => setSoundDetected(true);
        recognition.onspeechstart = () => setSoundDetected(true);

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
          console.warn('Speech recognition event warning:', event.error);
          if (event.error === 'no-speech') {
            setInfoMessage('आवाज धीमी है। बोलते रहें, आपकी आवाज सीधे रिकॉर्ड हो रही है...');
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.warn('Speech recognition warning:', err);
      }
    }

    setIsRecording(true);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const startRecording = () => {
    cleanupAudio();
    setErrorMessage(null);
    setInfoMessage(null);
    setShowDirectAudioBox(false);
    setRecordedAudioUrl(null);
    recordedAudioRef.current = null;
    setTranscript('');
    transcriptRef.current = '';
    setRecordingSeconds(0);
    setSoundDetected(false);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          startActualRecording(stream);
        })
        .catch((err) => {
          console.warn('Microphone permission warning:', err);
          setErrorMessage('माइक्रोफोन अनुमति अस्वीकृत है। कृपया ब्राउज़र में माइक्रोफोन की अनुमति दें या नीचे टाइप करें।');
          setManualTextMode(true);
        });
    } else {
      setErrorMessage('आपके ब्राउज़र में ऑडियो रिकॉर्डिंग समर्थित नहीं है।');
      setManualTextMode(true);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop MediaRecorder and audio stream
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {}
    }

    setIsFinalizing(true);
    setIsRecording(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    // Wait 800ms for MediaRecorder to finish encoding Base64 audio chunk
    pendingTimerRef.current = setTimeout(() => {
      const finalWords = (transcriptRef.current || transcript).trim();
      const finalAudio = recordedAudioRef.current;
      setIsFinalizing(false);

      if (finalWords.length > 0) {
        // Words were captured and audio is recorded!
        onTranscriptReady(finalWords, true, finalAudio || undefined);
      } else {
        // Words were not transcribed, but we DO have the citizen's actual voice recording!
        setShowDirectAudioBox(true);
      }
    }, 800);
  };

  const handleSelectSample = (sampleText: string) => {
    cleanupAudio();
    setTranscript(sampleText);
    transcriptRef.current = sampleText;
    setIsRecording(false);
    setShowDirectAudioBox(false);
    onTranscriptReady(sampleText, true, recordedAudioRef.current || undefined);
  };

  const handleManualSubmit = () => {
    const textToSubmit = (fallbackCustomText || transcript).trim();
    if (textToSubmit.length >= 2) {
      cleanupAudio();
      setShowDirectAudioBox(false);
      onTranscriptReady(textToSubmit, false, recordedAudioRef.current || undefined);
    } else {
      setErrorMessage('कृपया नुकसान का विवरण लिखें');
    }
  };

  const handleProceedWithVoiceNoteOnly = () => {
    const finalAudio = recordedAudioRef.current || recordedAudioUrl;
    cleanupAudio();
    setShowDirectAudioBox(false);
    onTranscriptReady(
      'नागरिक का मूल वॉइस संदेश रिकॉर्ड किया गया (Original Voice Note Recorded)',
      true,
      finalAudio || undefined
    );
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center">
      {/* Speech Prompt */}
      <div className="mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
          {t('speakPrompt')}
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm mt-1">
          {t('micInstruction')} (आपकी आवाज सीधे रिकॉर्ड होकर प्रशासनिक अधिकारियों को सुनाई देगी)
        </p>
      </div>

      {/* Main Microphone Button */}
      {!manualTextMode ? (
        <div className="flex flex-col items-center justify-center my-3 w-full">
          <div className="relative">
            {isRecording && (
              <span className="absolute -inset-2 rounded-full border border-red-500/40 animate-pulse"></span>
            )}

            <button
              type="button"
              disabled={isFinalizing}
              onClick={isRecording ? stopRecording : startRecording}
              className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isRecording
                  ? 'bg-red-700 text-white focus:ring-red-600'
                  : isFinalizing
                  ? 'bg-amber-700 text-white cursor-wait focus:ring-amber-600'
                  : 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white border border-slate-700 dark:border-slate-600 focus:ring-slate-900 shadow-2xs'
              }`}
              aria-label={isRecording ? t('stopSpeaking') : t('micInstruction')}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-8 h-8 sm:w-9 sm:h-9" />
                  <span className="text-xs font-medium mt-1">रोकें (Stop)</span>
                </>
              ) : isFinalizing ? (
                <>
                  <RefreshCw className="w-8 h-8 sm:w-9 sm:h-9 animate-spin" />
                  <span className="text-xs font-medium mt-1">प्रतीक्षा करें</span>
                </>
              ) : (
                <>
                  <Mic className="w-8 h-8 sm:w-9 sm:h-9 text-blue-400" />
                  <span className="text-xs font-medium mt-1">बोलें (Speak)</span>
                </>
              )}
            </button>
          </div>

          {/* Recording Timer & Status */}
          {isRecording ? (
            <div className="mt-4 flex flex-col items-center gap-2.5 w-full max-w-sm">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-medium text-xs">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                <span>
                  {soundDetected ? 'आवाज रिकॉर्ड हो रही है...' : 'माइक सक्रिय है... बोलते रहें'} ({recordingSeconds}s)
                </span>
              </div>
              <button
                type="button"
                onClick={stopRecording}
                className="w-full py-2.5 px-4 bg-red-700 hover:bg-red-800 text-white text-xs font-medium rounded-lg shadow-2xs flex items-center justify-center gap-2 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>बोलना समाप्त (जांचें ➔)</span>
              </button>
            </div>
          ) : isFinalizing ? (
            <div className="mt-4 flex items-center justify-center gap-2 text-amber-800 dark:text-amber-200 font-medium text-xs bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
              <span>ऑडियो फाइल तैयार की जा रही है...</span>
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-normal">
              भाषा: {language === 'bho' ? 'भोजपुरी / मैथिली / हिन्दी' : language === 'en' ? 'English' : 'हिन्दी'} (सीधा वॉइस नोट)
            </p>
          )}

          {/* Real-time word feedback box */}
          {transcript && (
            <div className="mt-4 w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-left space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                <span>पहचाने गए शब्द:</span>
                {isRecording && <span className="text-red-600 font-medium text-[11px]">रिकॉर्डिंग जारी</span>}
              </div>
              <p className="text-sm sm:text-base text-slate-900 dark:text-slate-100 font-medium leading-relaxed font-sans">
                "{transcript}"
              </p>
              {!isRecording && (
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onTranscriptReady(transcript, true, recordedAudioRef.current || undefined)}
                    className="px-3.5 py-1.5 bg-blue-800 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-2xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>आगे बढ़ें</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Manual Text Entry Mode */
        <div className="w-full my-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
              <span>अपना नुकसान विस्तार से लिखें:</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setManualTextMode(false);
                setShowDirectAudioBox(false);
              }}
              className="text-xs text-blue-700 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>आवाज से बोलें (Use Voice)</span>
            </button>
          </div>

          <textarea
            rows={4}
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
              transcriptRef.current = e.target.value;
            }}
            placeholder="उदा. हमारी 2 बीघा धान की फसल बाढ़ में डूब गई और मवेशियों के लिए चारा नहीं मिल रहा है..."
            className="w-full p-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-800 focus:outline-none font-sans"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              {transcript.length > 0 ? `${transcript.length} अक्षर` : 'कम से कम 2 शब्द लिखें'}
            </span>
            <button
              type="button"
              disabled={transcript.trim().length < 2}
              onClick={handleManualSubmit}
              className="px-4 py-2 bg-blue-800 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <span>आगे बढ़ें</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Info Message */}
      {infoMessage && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-start gap-2 text-left">
          <Volume2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
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

      {/* Direct Voice Note Captured Box (Play & Proceed) */}
      {showDirectAudioBox && (
        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-left space-y-3.5 w-full shadow-2xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  आपकी आवाज रिकॉर्ड हो गई है
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  यह मूल वॉइस संदेश सीधे प्रशासनिक अधिकारियों को सुनाई देगा।
                </p>
              </div>
            </div>
            <span className="text-[11px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium px-2 py-0.5 rounded flex items-center gap-1">
              <PlayCircle className="w-3 h-3 text-slate-600 dark:text-slate-400" />
              वॉइस नोट
            </span>
          </div>

          {/* Audio Player for Citizen to Listen */}
          {recordedAudioUrl && (
            <div className="p-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-lg space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>रिकॉर्ड की गई आवाज सुनें:</span>
                <span className="text-[11px] text-slate-500">सत्यापित रिकॉर्डिंग</span>
              </div>
              <audio controls src={recordedAudioUrl} className="w-full mt-1 rounded" />
            </div>
          )}

          {/* Primary Action: Send this Voice Recording directly */}
          <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              onClick={handleProceedWithVoiceNoteOnly}
              className="w-full sm:flex-1 py-2.5 px-4 bg-blue-800 hover:bg-blue-900 text-white font-medium rounded-lg text-xs shadow-2xs transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>हाँ, यही आवाज संदेश भेजें (आगे बढ़ें ➔)</span>
            </button>
            <button
              type="button"
              onClick={startRecording}
              className="w-full sm:w-auto py-2.5 px-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>दोबारा बोलें</span>
            </button>
          </div>

          {/* Optional: Pick a quick category tag if citizen desires */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              (वैकल्पिक) यदि चाहें तो क्षति का प्रकार भी साथ में जोड़ सकते हैं:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectSample('बाढ़ के पानी से धान की फसल डूब गई और मवेशियों के लिए चारा नहीं बचा है।')}
                className="p-2.5 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-left font-medium text-slate-800 dark:text-slate-200 transition-colors"
              >
                🌾 फसल व मवेशी चारा
              </button>
              <button
                type="button"
                onClick={() => handleSelectSample('किराना दुकान में पानी घुसने से सारा अनाज और राशन भीग कर खराब हो गया।')}
                className="p-2.5 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-left font-medium text-slate-800 dark:text-slate-200 transition-colors"
              >
                🏪 दुकान / राशन क्षति
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Switch to typing toggle */}
      {!manualTextMode && !showDirectAudioBox && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setManualTextMode(true)}
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-400 underline flex items-center gap-1 font-medium"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {t('typeInstead')}
          </button>
        </div>
      )}

      {/* 1-Click Tap Scenarios on main screen */}
      <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 w-full text-left space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            त्वरित विकल्प (Tap any scenario to select):
          </span>
          <span className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">1-टैप चुनें</span>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleSelectSample('कोसी नदी के पानी से 2 बीघा धान की फसल डूब गई और गाय के लिए चारा नहीं है।')}
            className="w-full text-left p-3 text-xs bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors text-slate-800 dark:text-slate-200 flex items-center justify-between shadow-2xs"
          >
            <span>🌾 <strong>फसल व चारा:</strong> "कोसी नदी के पानी से 2 बीघा धान की फसल डूब गई और गाय के लिए चारा नहीं है।"</span>
            <span className="text-blue-700 dark:text-blue-400 font-medium text-xs ml-2 flex-shrink-0">चुनें →</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectSample('किराना दुकान में पानी घुसने से सारा अनाज, तेल और राशन भीग कर खराब हो गया।')}
            className="w-full text-left p-3 text-xs bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors text-slate-800 dark:text-slate-200 flex items-center justify-between shadow-2xs"
          >
            <span>🏪 <strong>दुकान / इन्वेंट्री:</strong> "किराना दुकान में पानी घुसने से सारा अनाज, तेल और राशन भीग कर खराब हो गया।"</span>
            <span className="text-blue-700 dark:text-blue-400 font-medium text-xs ml-2 flex-shrink-0">चुनें →</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectSample('बाढ़ के कारण पिछले 10 दिनों से निर्माण व खेतों पर दैनिक मजदूरी का काम बिल्कुल बंद है।')}
            className="w-full text-left p-3 text-xs bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors text-slate-800 dark:text-slate-200 flex items-center justify-between shadow-2xs"
          >
            <span>🔨 <strong>दैनिक मजदूरी:</strong> "बाढ़ के कारण पिछले 10 दिनों से निर्माण व खेतों पर दैनिक मजदूरी का काम बिल्कुल बंद है।"</span>
            <span className="text-blue-700 dark:text-blue-400 font-medium text-xs ml-2 flex-shrink-0">चुनें →</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectSample('सिंचाई के लिए खेत में रखा डीजल पंपसेट और पाइपलाइन बाढ़ के तेज बहाव में गाद में धंस गई है।')}
            className="w-full text-left p-3 text-xs bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors text-slate-800 dark:text-slate-200 flex items-center justify-between shadow-2xs"
          >
            <span>🚜 <strong>कृषि उपकरण:</strong> "सिंचाई के लिए खेत में रखा डीजल पंपसेट और पाइपलाइन बाढ़ के तेज बहाव में गाद में धंस गई है।"</span>
            <span className="text-blue-700 dark:text-blue-400 font-medium text-xs ml-2 flex-shrink-0">चुनें →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
