import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mic,
  Search,
  AlertTriangle,
  ShieldCheck,
  PhoneCall,
  ArrowRight,
  Volume2,
  Building2,
  UserCheck,
  Clock,
  CheckCircle2,
  PlusCircle,
  RefreshCw,
  LogOut,
  Sparkles,
  FileText,
  MapPin,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { useAccessibility } from '../../context/AccessibilityContext.js';
import { useCitizenAuth } from '../../context/CitizenAuthContext.js';
import { AudioPlayerButton } from '../../components/AudioPlayerButton.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { api } from '../../api/client.js';

// Pre-configured authentic local Bihar flood-affected demo residents for rapid 1-click evaluation
const DEMO_CITIZENS = [
  {
    email: 'bholayadav.bihar@gmail.com',
    fullName: 'भोला यादव (Bhola Yadav)',
    phone: '9876543210',
    village: 'महुवा दक्षिण टोला',
    block: 'निर्मली (Nirmali)',
    district: 'सुपौल (Supaul)',
    badge: '2 सक्रिय अनुरोध (2 Requests Active)',
    avatarSeed: 'Bhola',
  },
  {
    email: 'ramesh.mandal@gmail.com',
    fullName: 'रमेश मंडल (Ramesh Mandal)',
    phone: '9876543215',
    village: 'सतीयारा टोला',
    block: 'कुशेश्वरस्थान (Kusheshwar Asthan)',
    district: 'दरभंगा (Darbhanga)',
    badge: '1 अनुरोध (1 Request)',
    avatarSeed: 'Ramesh',
  },
  {
    email: 'manjuji.jeevika@gmail.com',
    fullName: 'मंजू देवी (Manju Devi - जीविका दीदी)',
    phone: '9876543211',
    village: 'कोठिया',
    block: 'झंझारपुर (Jhanjharpur)',
    district: 'मधुबनी (Madhubani)',
    badge: 'नया नागरिक (New Resident)',
    avatarSeed: 'Manju',
  },
];

export const CitizenHome: React.FC = () => {
  const { t, language } = useLanguage();
  const { speakText } = useAccessibility();
  const { citizen, isCitizenAuthenticated, loginWithGoogle, logoutCitizen, isLoading: authLoading } = useCitizenAuth();
  const navigate = useNavigate();

  // Custom Gmail input state
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Citizen Dashboard Reports State
  const [myReports, setMyReports] = useState<any[]>([]);
  const [reportsSummary, setReportsSummary] = useState<{
    total: number;
    verified: number;
    inProgress: number;
    submitted: number;
  }>({ total: 0, verified: 0, inProgress: 0, submitted: 0 });
  const [isLoadingReports, setIsLoadingReports] = useState<boolean>(false);

  // Audio instructions
  const notLoggedInInstruction =
    language === 'bho'
      ? 'बिहार बाढ़ आजीविका समन्वय पोर्टल में रउरा स्वागत बा। आपन नुकसानी के रिपोर्ट दर्ज करे भा स्थिति देखे खातिर नीचे दिहल Google बटन दबा के लॉगिन करीं।'
      : 'बिहार बाढ़ आजीविका समन्वय पोर्टल में आपका स्वागत है। नुकसान दर्ज करने अथवा अपने आवेदनों की स्थिति देखने के लिए कृपया नीचे दिए गए Google बटन से लॉगिन करें।';

  const loggedInInstruction =
    language === 'bho'
      ? `नमस्ते ${citizen?.fullName?.split(' ')[0] || ''}। रउरा पिछला अनुरोध के स्थिति नीचे दिहल बा। नया नुकसानी दर्ज करे खातिर हरियर बटन दबाईं।`
      : `नमस्ते ${citizen?.fullName?.split(' ')[0] || ''}। आपके द्वारा दर्ज अनुरोधों की स्थिति नीचे दी गई है। नया नुकसान दर्ज करने के लिए ऊपर दिए गए बटन को दबाएं।`;

  // Fetch logged in citizen's reports
  useEffect(() => {
    if (isCitizenAuthenticated && citizen?.email) {
      loadCitizenReports();
    }
  }, [isCitizenAuthenticated, citizen?.email]);

  const loadCitizenReports = async () => {
    if (!citizen?.email) return;
    setIsLoadingReports(true);
    try {
      const data = await api.getMyReports(citizen.email, citizen.phone);
      if (data.success && data.reports) {
        setMyReports(data.reports);
        if (data.summary) {
          setReportsSummary(data.summary);
        }
      }
    } catch (err) {
      console.warn('Could not load citizen reports:', err);
    } finally {
      setIsLoadingReports(false);
    }
  };

  // Quick 1-Click login helper for demo citizens
  const handleQuickCitizenLogin = async (demo: typeof DEMO_CITIZENS[0]) => {
    setLoginError(null);
    const success = await loginWithGoogle(demo.email, demo.fullName, demo.phone);
    if (!success) {
      setLoginError('लॉगिन करने में समस्या आई। कृपया पुनः प्रयास करें।');
    }
  };

  // Custom Gmail login submission
  const handleCustomGmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setLoginError('कृपया वैध Gmail आईडी दर्ज करें (उदा. yourname@gmail.com)');
      return;
    }
    const name = customName.trim() || customEmail.split('@')[0];
    const success = await loginWithGoogle(customEmail.trim(), name, customPhone.trim());
    if (!success) {
      setLoginError('लॉगिन करने में समस्या आई। कृपया पुनः प्रयास करें।');
    }
  };

  return (
    <div className="min-h-[85vh] py-6 px-4 max-w-2xl mx-auto space-y-6">
      {/* ======================================================== */}
      {/* 1. NOT AUTHENTICATED STATE: Clean, Accessible Login Gate */}
      {/* ======================================================== */}
      {!isCitizenAuthenticated ? (
        <div className="space-y-6">
          {/* Top Banner & Audio Assistant */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-950/70 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <span>बिहार बाढ़ आजीविका समन्वय पोर्टल (HSC 2027)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
              बाढ़ राहत एवं आजीविका क्षति समन्वय
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-sans max-w-lg mx-auto">
              नुकसान दर्ज करने, अपने आवेदनों की स्थिति देखने एवं विभागीय अग्रसारण ट्रैक करने के लिए कृपया 1-क्लिक Google लॉगिन करें।
            </p>

            {/* Audio Guidance */}
            <div className="pt-1 flex justify-center">
              <AudioPlayerButton
                textToSpeak={notLoggedInInstruction}
                label="निर्देश सुनें (Listen Login Instructions)"
              />
            </div>
          </div>

          {/* Login Card (Google / Gmail Filter) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-slate-200 dark:border-slate-700 shadow-lg space-y-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white pt-2">
                नागरिक पहचान व सुरक्षित प्रवेश
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                एक बार लॉगिन करें—आपका सत्र इस फोन/ब्राउज़र पर सुरक्षित व स्थायी रहेगा।
              </p>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Fast 1-Click Selection for Local Bihar Residents */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  त्वरित 1-क्लिक Google लॉगिन चुनें (Quick Sign In):
                </span>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-bold px-2 py-0.5 rounded-full">
                  सुविधाजनक
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {DEMO_CITIZENS.map((c) => (
                  <button
                    key={c.email}
                    type="button"
                    onClick={() => handleQuickCitizenLogin(c)}
                    disabled={authLoading}
                    className="w-full text-left p-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50/70 dark:bg-slate-800/80 hover:bg-blue-50/40 dark:hover:bg-slate-800 transition-all flex items-center justify-between group active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="flex items-center gap-3">
                      {/* Google G styled avatar */}
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-base text-blue-600 shadow-xs flex-shrink-0">
                        {c.avatarSeed[0]}
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{c.fullName}</span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded border border-emerald-300 dark:border-emerald-700">
                            {c.badge}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          {c.email}
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{c.village}, {c.block}, {c.district}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white dark:bg-slate-900 text-slate-500 font-medium">
                  अथवा अपनी निजी Gmail आईडी से लॉगिन करें
                </span>
              </div>
            </div>

            {/* Custom Gmail Form Toggle / Form */}
            {!showCustomForm ? (
              <button
                type="button"
                onClick={() => setShowCustomForm(true)}
                className="w-full py-3.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border-2 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                {/* Official Google G Logo */}
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>अन्य Gmail खाता दर्ज करें (Enter custom Gmail ID)</span>
              </button>
            ) : (
              <form onSubmit={handleCustomGmailLogin} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Gmail / ईमेल पता *
                  </label>
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="उदा. bholayadav@gmail.com"
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      आपका पूरा नाम (Name)
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="उदा. भोला यादव"
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      मोबाइल नंबर (Phone)
                    </label>
                    <input
                      type="tel"
                      value={customPhone}
                      onChange={(e) => setCustomPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="10 अंक"
                      maxLength={10}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Google से लॉगिन करें</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCustomForm(false)}
                    className="px-3 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
                  >
                    रद्द करें
                  </button>
                </div>
              </form>
            )}

            {/* Permanent storage assurance */}
            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/50 rounded-xl text-blue-900 dark:text-blue-200 text-xs flex items-start gap-2 border border-blue-200 dark:border-blue-800">
              <ShieldCheck className="w-4 h-4 text-blue-700 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                <strong>स्थायी लॉगिन सुविधा:</strong> एक बार लॉगिन करने के उपरांत टोकन आपके डिवाइस में सुरक्षित रहता है। आपको पुनः नुकसान दर्ज करने या स्थिति जांचने के लिए बार-बार लॉगिन नहीं करना पड़ेगा।
              </span>
            </div>
          </div>

          {/* Quick Secondary Links for Residents */}
          <div className="space-y-3">
            {/* Direct Status Tracking by ID (Without Login) */}
            <Link
              to="/track"
              className="w-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/90 border-2 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl p-4 flex items-center justify-between shadow-xs transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    केवल रिपोर्ट आईडी से स्थिति जांचें (Track by Report ID)
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    यदि आपके पास पहले से JS-2027 रसीद संख्या है
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </Link>

            {/* Emergency Helplines */}
            <Link
              to="/directory"
              className="w-full bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100/70 dark:hover:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 rounded-2xl p-3.5 flex items-center justify-between text-xs sm:text-sm font-bold transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-amber-700 dark:text-amber-400 flex-shrink-0" />
                <span>24x7 जिला आपदा नियंत्रण कक्ष एवं चारा राहत केंद्र सूची</span>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            </Link>

            {/* Disclaimer */}
            <div className="p-3.5 bg-slate-100 dark:bg-slate-900/90 rounded-2xl text-slate-700 dark:text-slate-200 text-xs leading-relaxed flex items-start gap-2.5 border border-slate-200 dark:border-slate-700 shadow-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-900 dark:text-amber-300 font-extrabold">महत्वपूर्ण सूचना: </strong>
                यह प्रणाली बाढ़ प्रभावित परिवारों के नुकसान को रिकॉर्ड कर भौतिक सत्यापन व विभागीय समन्वय हेतु है। यह तत्काल नकद भुगतान की स्वतः गारंटी नहीं देता।
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* 2. AUTHENTICATED CITIZEN DASHBOARD: Requests & Status    */
        /* ======================================================== */
        <div className="space-y-6">
          {/* Welcome Profile Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border-2 border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {citizen?.avatarUrl ? (
                <img
                  src={citizen.avatarUrl}
                  alt={citizen.fullName}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-500 shadow-xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-600 text-white font-extrabold text-lg flex items-center justify-center shadow-xs">
                  {(citizen?.fullName || 'N')[0]}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                    नमस्ते, {citizen?.fullName}
                  </h1>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                    सत्यापित नागरिक
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  {citizen?.email} {citizen?.phone ? `• फोन: ${citizen.phone}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <AudioPlayerButton textToSpeak={loggedInInstruction} label="निर्देश सुनें" />
              <button
                type="button"
                onClick={logoutCitizen}
                className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/40 text-slate-700 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="खाता बदलें / लॉगआउट"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>लॉगआउट</span>
              </button>
            </div>
          </div>

          {/* Metric Bar: Requests Statistics */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xs text-center">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                कुल अनुरोध
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {reportsSummary.total}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">दर्ज राहत आवेदन</div>
            </div>

            <div className="p-3.5 sm:p-4 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 shadow-xs text-center">
              <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                सत्यापित / स्वीकृत
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                {reportsSummary.verified}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">निरीक्षण पूर्ण</div>
            </div>

            <div className="p-3.5 sm:p-4 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-xs text-center">
              <div className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wide">
                प्रक्रियाधीन
              </div>
              <div className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-400 mt-1">
                {reportsSummary.inProgress + reportsSummary.submitted}
              </div>
              <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">जांच व समीक्षा जारी</div>
            </div>
          </div>

          {/* Primary Action Button: Create New Livelihood Loss Request */}
          <div>
            <Link
              to="/report"
              className="w-full group bg-gradient-to-r from-blue-600 via-blue-700 to-teal-700 hover:from-blue-700 hover:to-teal-800 text-white rounded-3xl p-5 sm:p-6 shadow-lg shadow-blue-200/50 dark:shadow-none flex items-center justify-between transition-all transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-white text-blue-700 flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Mic className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-extrabold tracking-tight">
                    नया नुकसान / राहत अनुरोध दर्ज करें
                  </div>
                  <div className="text-blue-100 text-xs sm:text-sm mt-0.5 font-medium">
                    बोलकर बताएं—अपनी फसल, पशुधन, दुकान या मजदूरी क्षति
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 flex-shrink-0">
                <span>+ नया आवेदन</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>

          {/* Citizen Requests List & Where Forwarded */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  आपके द्वारा प्रस्तुत अनुरोध एवं अग्रसारण स्थिति
                </h2>
              </div>
              <button
                type="button"
                onClick={loadCitizenReports}
                className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="अद्यतन करें (Refresh)"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {isLoadingReports ? (
              <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 text-slate-500 text-sm">
                अनुरोध सूची लोड हो रही है...
              </div>
            ) : myReports.length === 0 ? (
              /* Zero State */
              <div className="text-center py-12 px-4 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  अभी तक कोई राहत अनुरोध दर्ज नहीं है
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  यदि बाढ़ के कारण आपकी फसल, पशुधन, दुकान या आजीविका प्रभावित हुई है, तो कृपया ऊपर दिए गए बटन को दबाकर पहली रिपोर्ट दर्ज करें।
                </p>
                <Link
                  to="/report"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>अभी नया अनुरोध दर्ज करें</span>
                </Link>
              </div>
            ) : (
              /* Request Cards */
              <div className="space-y-4">
                {myReports.map((report) => (
                  <div
                    key={report.id || report.reportNumber}
                    className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-sm space-y-4 transition-all hover:border-blue-400 dark:hover:border-blue-500"
                  >
                    {/* Header Row: ID, Date & Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-xs px-2.5 py-1 rounded-lg">
                            {report.reportNumber}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(report.submittedAt || Date.now()).toLocaleDateString('hi-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{report.village}, {report.block}, {report.district}</span>
                        </div>
                      </div>

                      <StatusBadge status={report.status} />
                    </div>

                    {/* Forwarding Route Info (कहाँ अग्रसारित हुआ है) */}
                    <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/50 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-2">
                      <div className="text-[11px] font-black text-blue-950 dark:text-blue-200 uppercase tracking-wide flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                        <span>प्रशासनिक अग्रसारण विवरण (Forwarded Administrative Unit):</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">अग्रसारित कार्यालय: </span>
                          <strong className="text-slate-900 dark:text-slate-100 font-bold block mt-0.5">
                            {report.forwardedTo?.officeName || 'प्रखंड विकास पदाधिकारी (BDO) कार्यालय'}
                          </strong>
                        </div>

                        <div>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">संबद्ध विभाग: </span>
                          <strong className="text-slate-900 dark:text-slate-100 font-bold block mt-0.5">
                            {report.forwardedTo?.department || 'आपदा राहत एवं आजीविका कोषांग'}
                          </strong>
                        </div>

                        <div>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">संबद्ध राहत योजना: </span>
                          <strong className="text-slate-900 dark:text-slate-100 font-bold block mt-0.5">
                            {report.forwardedTo?.scheme || 'बाढ़ आजीविका सुरक्षा सहायता'}
                          </strong>
                        </div>

                        <div>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">प्राधिकृत अधिकारी / दल: </span>
                          <strong className="text-slate-900 dark:text-slate-100 font-bold block mt-0.5">
                            {report.forwardedTo?.assignedOfficer || 'ग्राउंड सत्यापन टास्क फोर्स'}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Latest Status Update in Simple Language */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          ताज़ा अद्यतन (Current Status Update):
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                          {report.statusMessage?.[language] || report.statusMessage?.hi || 'सत्यापन प्रक्रिया जारी है।'}
                        </p>
                        {report.verificationNotes && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                            * क्षेत्र टिप्पणी: {report.verificationNotes}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <AudioPlayerButton
                          textToSpeak={report.statusMessage?.[language] || report.statusMessage?.hi}
                          label="स्थिति सुनें"
                        />
                      </div>
                    </div>

                    {/* Loss Description & Badges */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap gap-1.5">
                        {(report.livelihoodCategories || []).map((cat: string) => (
                          <span
                            key={cat}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            {cat === 'CROP'
                              ? '🌾 फसल क्षति'
                              : cat === 'LIVESTOCK'
                              ? '🐄 पशुधन / चारा संकट'
                              : cat === 'SHOP_BUSINESS'
                              ? '🏪 दुकान नुकसानी'
                              : cat === 'FISHERIES'
                              ? '🐟 मत्स्य पालन'
                              : cat === 'WAGE_LABOR'
                              ? '🔨 दैनिक मजदूरी'
                              : cat}
                          </span>
                        ))}
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                        "{report.lossDescription}"
                      </p>
                    </div>

                    {/* Recorded Audio Player if present */}
                    {report.audioSimulationUrl && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl space-y-1 text-left">
                        <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                          आपकी दर्ज की गई मूल आवाज रिकॉर्डिंग:
                        </span>
                        <audio controls src={report.audioSimulationUrl} className="w-full mt-1 rounded-lg" />
                      </div>
                    )}

                    {/* Detail Track Link */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <Link
                        to={`/track?reportNumber=${report.reportNumber}`}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 hover:underline flex items-center gap-1"
                      >
                        <span>विस्तृत प्रगति टाइमलाइन एवं इतिहास देखें</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <span className="text-[11px] text-slate-400">
                        अग्रसारण चरण: {report.forwardedTo?.currentStage || 'जांच सक्रिय'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Directory & Disclaimer */}
          <div className="space-y-3 pt-2">
            <Link
              to="/directory"
              className="w-full bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100/70 dark:hover:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 rounded-2xl p-3.5 flex items-center justify-between text-xs sm:text-sm font-bold transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-amber-700 dark:text-amber-400 flex-shrink-0" />
                <span>24x7 जिला आपदा नियंत्रण कक्ष एवं चारा राहत केंद्र सूची</span>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            </Link>

            <div className="p-3.5 bg-slate-100 dark:bg-slate-900/90 rounded-2xl text-slate-700 dark:text-slate-200 text-xs leading-relaxed flex items-start gap-2.5 border border-slate-200 dark:border-slate-700 shadow-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-900 dark:text-amber-300 font-extrabold">महत्वपूर्ण सूचना: </strong>
                यह पोर्टल बाढ़ प्रभावित परिवारों के आजीविका नुकसान को सरकारी रिकॉर्ड में दर्ज कर भौतिक सत्यापन व पुनर्प्राप्ति समन्वय हेतु है।
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
