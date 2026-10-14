import React from 'react';
import { Link } from 'react-router-dom';
import { Mic, Search, AlertTriangle, ShieldCheck, HeartHandshake, PhoneCall, ArrowRight, Volume2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { useAccessibility } from '../../context/AccessibilityContext.js';
import { AudioPlayerButton } from '../../components/AudioPlayerButton.js';

export const CitizenHome: React.FC = () => {
  const { t, language } = useLanguage();
  const { speakText } = useAccessibility();

  const welcomeInstruction =
    language === 'bho'
      ? 'रउरा बाढ़ से भइल नुकसानी के जानकारी देवे खातिर नीचे दिहल बड़का बटन दबाईं।'
      : 'बाढ़ से हुई फसल, पशु, दुकान या मजदूरी की क्षति दर्ज करने के लिए नीचे दिए गए बटन को दबाएं।';

  return (
    <div className="min-h-[85vh] flex flex-col justify-between py-6 px-4 max-w-xl mx-auto">
      {/* Top Banner & Audio Assistant */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-950/70 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-blue-700 dark:text-blue-400" />
          <span>बिहार बाढ़ आजीविका समन्वय पोर्टल (HSC 2027)</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
          बाढ़ से हुए नुकसान की जानकारी सीधे प्रशासन तक पहुंचाएं
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
          अपनी भाषा में बोलकर बताएं। हम आपके नुकसान को सत्यापित कर उचित आजीविका योजना से जोड़ेंगे।
        </p>

        {/* Audio guidance button */}
        <div className="pt-1 flex justify-center">
          <AudioPlayerButton
            textToSpeak={welcomeInstruction}
            label="ध्वनि निर्देश सुनें (Listen Instructions)"
          />
        </div>
      </div>

      {/* Dominant Primary Action - Voice First Reporting */}
      <div className="my-8">
        <Link
          to="/report"
          className="w-full group bg-gradient-to-r from-blue-600 via-blue-700 to-teal-700 hover:from-blue-700 hover:to-teal-800 text-white rounded-2xl p-6 sm:p-8 shadow-xl shadow-blue-200/60 dark:shadow-none flex flex-col items-center justify-center text-center transition-all transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-blue-300"
          aria-label={t('citizenTellLoss')}
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white text-blue-700 flex items-center justify-center shadow-md mb-4 group-hover:scale-105 transition-transform">
            <Mic className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('citizenTellLoss')}
          </span>

          <span className="text-blue-100 text-xs sm:text-sm mt-2 max-w-xs font-medium">
            {t('citizenTellLossDesc')}
          </span>

          <div className="mt-4 px-4 py-1.5 rounded-full bg-blue-800/60 text-white text-xs font-semibold flex items-center gap-1.5">
            <span>आवाज द्वारा दर्ज करें</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* Secondary Clean Action - Track Status */}
      <div className="space-y-4">
        <Link
          to="/track"
          className="w-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/90 border-2 border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 text-slate-800 dark:text-white rounded-xl p-4 flex items-center justify-between shadow-xs transition-all focus:outline-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <div className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                {t('citizenCheckStatus')}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {t('citizenCheckStatusDesc')}
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
        </Link>

        {/* Emergency Helpline & Relief Directory */}
        <Link
          to="/directory"
          className="w-full bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100/70 dark:hover:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 rounded-xl p-3.5 flex items-center justify-between text-xs sm:text-sm font-bold transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <PhoneCall className="w-4 h-4 text-amber-700 dark:text-amber-400 flex-shrink-0" />
            <span>जिला आपदा नियंत्रण कक्ष एवं पशु चारा राहत केंद्र सूची</span>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        </Link>

        {/* Honest Citizen Disclaimer - Crystal clear in both Light & Dark Theme */}
        <div className="p-3.5 bg-slate-100 dark:bg-slate-900/90 rounded-2xl text-slate-700 dark:text-slate-200 text-xs leading-relaxed flex items-start gap-2.5 border border-slate-200 dark:border-slate-700 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-900 dark:text-amber-300 font-extrabold">महत्वपूर्ण सूचना: </strong>
            यह प्रणाली बाढ़ प्रभावित परिवारों के नुकसान को रिकॉर्ड कर भौतिक सत्यापन व पुनर्प्राप्ति समन्वय हेतु है। यह तत्काल नकद भुगतान अथवा सरकारी मुआवजे की स्वतः गारंटी नहीं देता।
          </span>
        </div>
      </div>
    </div>
  );
};
