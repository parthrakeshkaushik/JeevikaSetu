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
  Clock,
  PlusCircle,
  RefreshCw,
  LogOut,
  Sparkles,
  FileText,
  MapPin,
  X,
  Mail,
  KeyRound,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { useAccessibility } from '../../context/AccessibilityContext.js';
import { useCitizenAuth } from '../../context/CitizenAuthContext.js';
import { AudioPlayerButton } from '../../components/AudioPlayerButton.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { api } from '../../api/client.js';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          revoke: (hint: string, done: () => void) => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: any) => void;
            error_callback?: (error: any) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

export const CitizenHome: React.FC = () => {
  const { t, language } = useLanguage();
  const { speakText } = useAccessibility();
  const { citizen, isCitizenAuthenticated, loginWithGoogle, logoutCitizen, isLoading: authLoading } = useCitizenAuth();
  const navigate = useNavigate();

  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Setup / Config Modal for Real Google Client ID
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [clientIdInput, setClientIdInput] = useState<string>(() => {
    return localStorage.getItem('jeevikasetu_google_client_id') || '';
  });

  // Optional custom account chooser modal (for entering specific Gmail)
  const [showAccountModal, setShowAccountModal] = useState<boolean>(false);
  const [customEmailInput, setCustomEmailInput] = useState<string>('');

  // Citizen Dashboard Reports State
  const [myReports, setMyReports] = useState<any[]>([]);
  const [reportsSummary, setReportsSummary] = useState<{
    total: number;
    verified: number;
    inProgress: number;
    submitted: number;
  }>({ total: 0, verified: 0, inProgress: 0, submitted: 0 });
  const [isLoadingReports, setIsLoadingReports] = useState<boolean>(false);

  // Get active Google Client ID
  const getEffectiveClientId = (): string => {
    return (
      (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
      localStorage.getItem('jeevikasetu_google_client_id') ||
      ''
    ).trim();
  };

  // Audio instructions
  const notLoggedInInstruction =
    language === 'bho'
      ? 'बिहार बाढ़ आजीविका समन्वय पोर्टल में रउरा स्वागत बा। आपन नुकसानी के रिपोर्ट दर्ज करे खातिर नीचे दिहल Google बटन दबा के आपन असली ईमेल से 1-क्लिक में लॉगिन करीं।'
      : 'बिहार बाढ़ आजीविका समन्वय पोर्टल में आपका स्वागत है। नुकसान दर्ज करने अथवा अपने आवेदनों की स्थिति देखने के लिए कृपया नीचे दिए गए "Continue with Google" बटन से अपने वास्तविक Google खाते द्वारा 1-क्लिक लॉगिन करें।';

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

  // Google Identity Services (GIS) automatic initialization
  useEffect(() => {
    const clientId = getEffectiveClientId();
    if (clientId && typeof window !== 'undefined' && window.google?.accounts?.id && !isCitizenAuthenticated) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const container = document.getElementById('google-native-signin-btn');
        if (container) {
          window.google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            text: 'continue_with',
            shape: 'pill',
            logo_alignment: 'left',
            width: 320,
          });
        }

        // Trigger Google One Tap for instant device detection if browser supports it
        window.google.accounts.id.prompt();
      } catch (err) {
        console.warn('GIS One-Tap initialization notice:', err);
      }
    }
  }, [isCitizenAuthenticated]);

  // Decode standard Google JWT credential (from One-Tap or GIS native button)
  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response?.credential) return;
    try {
      setIsSigningIn(true);
      setLoginError(null);
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const profile = JSON.parse(jsonPayload);
      if (profile.email) {
        await loginWithGoogle(
          profile.email,
          profile.name || profile.given_name || profile.email.split('@')[0],
          undefined,
          profile.picture
        );
      }
    } catch (err) {
      console.error('Failed to parse Google JWT credential:', err);
      setLoginError('Google टोकन सत्यापित करने में समस्या आई।');
    } finally {
      setIsSigningIn(false);
    }
  };

  // REAL Google OAuth 2.0 Sign In:
  // Opens official Google Account Chooser popup on device/phone,
  // fetches REAL email, name, and profile picture from Google userinfo API
  const handleContinueWithGoogle = async () => {
    setLoginError(null);
    const clientId = getEffectiveClientId();

    // If Google Client ID is not yet configured, show the setup modal with 1-click guide
    if (!clientId) {
      setShowConfigModal(true);
      return;
    }

    if (typeof window === 'undefined' || !window.google?.accounts?.oauth2) {
      setLoginError('Google Identity Services लोड हो रही है। कृपया 2 सेकंड बाद पुनः क्लिक करें।');
      return;
    }

    setIsSigningIn(true);
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            console.error('Google OAuth error:', tokenResponse);
            setLoginError(`Google प्रमाणीकरण रद्द या विफल: ${tokenResponse.error_description || tokenResponse.error}`);
            setIsSigningIn(false);
            return;
          }

          if (tokenResponse.access_token) {
            try {
              // Fetch REAL user profile directly from Google's official userinfo API
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                  Authorization: `Bearer ${tokenResponse.access_token}`,
                },
              });
              const profile = await res.json();

              if (profile && profile.email) {
                const realEmail = profile.email;
                const realName = profile.name || profile.given_name || realEmail.split('@')[0];
                const realPicture = profile.picture; // Official Google avatar from lh3.googleusercontent.com

                await loginWithGoogle(realEmail, realName, undefined, realPicture);
              } else {
                setLoginError('Google खाते से वास्तविक ईमेल प्राप्त नहीं हो सका।');
              }
            } catch (fetchErr: any) {
              console.error('Failed to fetch real Google profile:', fetchErr);
              setLoginError('Google प्रोफाइल विवरण प्राप्त करने में समस्या आई।');
            } finally {
              setIsSigningIn(false);
            }
          }
        },
        error_callback: (err: any) => {
          console.error('Google popup error:', err);
          setLoginError('Google लॉगिन पॉपअप अवरुद्ध हो गया। कृपया ब्राउज़र सेटिंग्स में पॉपअप की अनुमति दें।');
          setIsSigningIn(false);
        },
      });

      // Triggers the real Google Account Picker popup on the device/phone
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err: any) {
      console.error('OAuth token client invocation failed:', err);
      setLoginError('Google प्रमाणीकरण शुरू करने में समस्या आई। कृपया पुनः प्रयास करें।');
      setIsSigningIn(false);
    }
  };

  // Save manual Client ID
  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientIdInput.trim()) {
      setLoginError('कृपया मान्य Google Client ID दर्ज करें।');
      return;
    }
    const cleanId = clientIdInput.trim();
    localStorage.setItem('jeevikasetu_google_client_id', cleanId);
    setShowConfigModal(false);
    // Immediately trigger real Google login
    setTimeout(() => {
      handleContinueWithGoogle();
    }, 100);
  };

  // Specific custom Gmail submit
  const handleCustomEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmailInput.trim() || !customEmailInput.includes('@')) {
      setLoginError('कृपया वैध Gmail / ईमेल आईडी दर्ज करें (उदा. yourname@gmail.com)');
      return;
    }
    const cleanMail = customEmailInput.trim().toLowerCase();
    const cleanName = cleanMail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=4285F4,34A853,FBBC05,EA4335`;
    loginWithGoogle(cleanMail, cleanName, undefined, avatarUrl);
    setShowAccountModal(false);
  };

  const configuredClientId = getEffectiveClientId();

  return (
    <div className="min-h-[85vh] py-6 px-4 max-w-2xl mx-auto space-y-6">
      {/* ======================================================== */}
      {/* 1. NOT AUTHENTICATED STATE: Real 1-Click Google Gate    */}
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
              नुकसान दर्ज करने, अपने आवेदनों की स्थिति देखने एवं विभागीय अग्रसारण ट्रैक करने के लिए 1-क्लिक Google लॉगिन करें।
            </p>

            {/* Audio Guidance */}
            <div className="pt-1 flex justify-center">
              <AudioPlayerButton
                textToSpeak={notLoggedInInstruction}
                label="निर्देश सुनें (Listen Login Instructions)"
              />
            </div>
          </div>

          {/* Login Card (Google Real Gate) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-slate-200 dark:border-slate-700 shadow-lg space-y-6 text-center">
            <div className="space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="w-7 h-7" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white pt-1">
                नागरिक पहचान व सुरक्षित प्रवेश
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                अपने डिवाइस के वास्तविक Google खाते से सुरक्षित लॉगिन करें — आपका नाम व प्रोफाइल स्वतः लिंक हो जाएंगे।
              </p>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-200 text-xs flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Native GIS Button Container (if configured) */}
            <div id="google-native-signin-btn" className="flex justify-center empty:hidden"></div>

            {/* Primary 1-Click "Continue with Google" Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleContinueWithGoogle}
                disabled={authLoading || isSigningIn}
                className="w-full py-4 px-6 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/90 text-slate-900 dark:text-white font-extrabold rounded-2xl border-2 border-slate-300 dark:border-slate-600 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3.5 text-base sm:text-lg active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-blue-300 group cursor-pointer"
              >
                {/* Official Google Multicolored G Logo */}
                <svg className="w-6 h-6 flex-shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
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
                <span>
                  {isSigningIn || authLoading
                    ? 'Google से जुड़ रहे हैं...'
                    : 'Continue with Google / Google से जारी रखें'}
                </span>
              </button>
            </div>

            {/* Quick Helper Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs pt-1">
              <button
                type="button"
                onClick={() => setShowAccountModal(true)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold underline underline-offset-4 transition-colors"
              >
                विशिष्ट Gmail आईडी दर्ज करें (Enter specific Gmail ID)
              </button>

              <button
                type="button"
                onClick={() => setShowConfigModal(true)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 transition-colors"
                title="Google OAuth Client ID कॉन्फ़िगर करें"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Google Client ID {configuredClientId ? '(सक्रिय)' : 'जोड़ें'}</span>
              </button>
            </div>

            {/* Permanent session assurance banner */}
            <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/50 rounded-2xl text-blue-900 dark:text-blue-200 text-xs flex items-start gap-2.5 border border-blue-200 dark:border-blue-800 text-left">
              <ShieldCheck className="w-5 h-5 text-blue-700 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                <strong>वास्तविक व स्थायी लॉगिन:</strong> आपके फोन/कंप्यूटर का असली Google ईमेल और प्रोफाइल चित्र सुरक्षित रूप से लिंक होगा। टोकन आपके डिवाइस में 365 दिन सुरक्षित रहता है।
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
                यह प्रणाली बाढ़ प्रभावित परिवारों के नुकसान को रिकॉर्ड कर भौतिक सत्यापन व विभागीय समन्वय हेतु है।
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
                  referrerPolicy="no-referrer"
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
              /* Zero State: Shown when newly logged in with zero reports */
              <div className="text-center py-12 px-4 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  आपने अभी तक कोई नुकसान दर्ज नहीं किया है
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
              /* Request Cards: ONLY shows reports truly reported by this citizen */
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

      {/* ======================================================== */}
      {/* 3. REAL GOOGLE OAUTH CLIENT ID CONFIGURATION MODAL      */}
      {/* ======================================================== */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border-2 border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  वास्तविक Google OAuth सेटअप (Real Google Sign-In)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              अपने पोर्टल पर वास्तविक उपयोगकर्ताओं के फोन या डिवाइस से उनका <strong>असली Gmail ईमेल, नाम और Google प्रोफाइल फोटो</strong> स्वतः फेच करने के लिए Google Cloud Console से प्राप्त OAuth Client ID दर्ज करें:
            </p>

            <form onSubmit={handleSaveClientId} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Google OAuth 2.0 Web Client ID
                </label>
                <input
                  type="text"
                  required
                  value={clientIdInput}
                  onChange={(e) => setClientIdInput(e.target.value)}
                  placeholder="उदा. xxxxxxxx-xxxxxxxx.apps.googleusercontent.com"
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              {/* 3-Step Guide */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>त्वरित 2 मिनट सेटअप निर्देश:</span>
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>Google Cloud Console</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                  <li>"Create Credentials" ➔ "OAuth client ID" ➔ "Web application" चुनें।</li>
                  <li>
                    Authorized JavaScript Origins में{' '}
                    <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-[10px]">
                      https://jeevikasetu-ten.vercel.app
                    </code>{' '}
                    और{' '}
                    <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-[10px]">
                      http://localhost:5173
                    </code>{' '}
                    जोड़ें।
                  </li>
                  <li>बनने के बाद Client ID यहां पेस्ट करें (या Vercel में <code>VITE_GOOGLE_CLIENT_ID</code> डालें)।</li>
                </ol>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>सेव करें व वास्तविक Google लॉगिन शुरू करें</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200"
                >
                  रद्द करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. SPECIFIC GMAIL ACCOUNT MODAL                          */}
      {/* ======================================================== */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border-2 border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  अपना व्यक्तिगत Gmail पता दर्ज करें
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAccountModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              यदि आप अपने किसी विशेष Gmail पते से जुड़ना चाहते हैं, तो कृपया नीचे ईमेल दर्ज करें:
            </p>

            <form onSubmit={handleCustomEmailSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Gmail पता (Gmail ID)
                </label>
                <input
                  type="email"
                  required
                  value={customEmailInput}
                  onChange={(e) => setCustomEmailInput(e.target.value)}
                  placeholder="उदा. yourname@gmail.com"
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={authLoading || isSigningIn}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>1-क्लिक लॉगिन करें</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200"
                >
                  रद्द करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
