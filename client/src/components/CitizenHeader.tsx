import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Waves, Shield, Sun, Moon, Type, Globe, Volume2, LogOut, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { useAccessibility } from '../context/AccessibilityContext.js';
import { useCitizenAuth } from '../context/CitizenAuthContext.js';
import { useAuth } from '../context/AuthContext.js';
import { Language } from '../i18n/index.js';

export const CitizenHeader: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { highContrast, toggleHighContrast, textSize, setTextSize, isSpeaking, stopSpeaking } = useAccessibility();
  const { citizen, isCitizenAuthenticated, logoutCitizen } = useCitizenAuth();
  const { user: adminUser, isAuthenticated: isAdminAuthenticated, logout: adminLogout } = useAuth();
  const location = useLocation();

  const handleTextSizeCycle = () => {
    if (textSize === 'normal') setTextSize('large');
    else if (textSize === 'large') setTextSize('xlarge');
    else setTextSize('normal');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-2.5 group focus:outline-none">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-teal-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <Waves className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
                {t('appName')}
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                बिहार बाढ़ राहत
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block truncate max-w-xs">
              {t('tagline')}
            </p>
          </div>
        </Link>

        {/* Accessibility & Language Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Audio Speaking Indicator */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="px-2 py-1 bg-amber-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 animate-pulse"
              title="आवाज बंद करें"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">आवाज रोकें</span>
            </button>
          )}

          {/* Text Size Toggle */}
          <button
            type="button"
            onClick={handleTextSizeCycle}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-bold border border-slate-200 flex items-center gap-0.5"
            title="अक्षर का आकार बदलें (A- / A+)"
            aria-label="Change text size"
          >
            <Type className="w-3.5 h-3.5" />
            <span className="text-[11px]">
              {textSize === 'normal' ? 'अ' : textSize === 'large' ? 'अ+' : 'अ++'}
            </span>
          </button>

          {/* Theme Mode Toggle */}
          <button
            type="button"
            onClick={toggleHighContrast}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs active:scale-95 ${
              highContrast
                ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-300'
            }`}
            title={highContrast ? 'लाइट मोड में बदलें (Switch to Light Theme)' : 'डार्क / नाइट थीम में बदलें (Switch to Dark Theme)'}
            aria-label="Toggle theme mode"
          >
            {highContrast ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="text-[11px]">लाइट</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                <span className="text-[11px]">डार्क</span>
              </>
            )}
          </button>

          {/* Language Selector */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold rounded-lg px-2 sm:px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              aria-label="Select preferred language"
            >
              <option value="hi">हिन्दी</option>
              <option value="bho">भोजपुरी</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Mode 1: Logged in Citizen (Resident) Profile & Sign Out - NO Admin Login */}
          {isCitizenAuthenticated && citizen ? (
            <div className="flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-slate-700">
              <div
                className="flex items-center gap-1.5 bg-blue-50/80 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg px-2 py-1 max-w-[130px] sm:max-w-[170px]"
                title={`लॉगिन: ${citizen.fullName} (${citizen.email})`}
              >
                {citizen.avatarUrl ? (
                  <img
                    src={citizen.avatarUrl}
                    alt={citizen.fullName}
                    className="w-4 h-4 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center flex-shrink-0">
                    {(citizen.fullName || 'N')[0]}
                  </div>
                )}
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate">
                  {citizen.fullName.split(' ')[0]}
                </span>
              </div>

              <button
                type="button"
                onClick={logoutCitizen}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                title="लॉगआउट करें (Sign Out)"
                aria-label="Citizen Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : isAdminAuthenticated && adminUser ? (
            /* Mode 2: Logged in Administrator Profile & Dashboard shortcut - NO Resident Login */
            <div className="flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-slate-700">
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1.5 bg-slate-800 text-amber-300 rounded-lg px-2.5 py-1 text-xs font-bold hover:bg-slate-700 transition-colors shadow-2xs"
                title={`प्रशासनिक लॉगिन: [${adminUser.role}] ${adminUser.fullName}`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate max-w-[120px] sm:max-w-[160px]">डैशबोर्ड ({adminUser.role})</span>
              </Link>
              <button
                type="button"
                onClick={adminLogout}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                title="प्रशासनिक लॉगआउट"
                aria-label="Admin Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Unauthenticated State: Show discreet Administrative Login button */
            <Link
              to="/admin/login"
              className="ml-1 p-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg text-xs border border-transparent hover:border-blue-200 transition-colors flex items-center gap-1"
              title="प्रशासनिक अधिकारी लॉगिन (Admin Login)"
            >
              <Shield className="w-4 h-4 text-slate-600" />
              <span className="hidden md:inline font-medium">प्रशासन</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
