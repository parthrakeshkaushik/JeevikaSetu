import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Key, Mail, AlertCircle, ArrowRight, Building2, UserCheck, ChevronDown, Sparkles, LogOut } from 'lucide-react';
import { useAuth, AdminUser } from '../../context/AuthContext.js';
import { useCitizenAuth } from '../../context/CitizenAuthContext.js';

// Predefined Bihar Administrative Jurisdictions for Flood Coordination
const DISTRICT_OPTIONS = [
  { id: 'STATE', label: '🌐 बिहार राज्य मुख्यालय (State HQ - संपूर्ण बिहार)', jurisdictionType: 'STATE' },
  { id: 'Supaul', label: '📍 सुपौल जिला (Supaul District - कोसी बेसिन)', jurisdictionType: 'DISTRICT' },
  { id: 'Darbhanga', label: '📍 दरभंगा जिला (Darbhanga District - कमला/बागमती)', jurisdictionType: 'DISTRICT' },
  { id: 'Madhubani', label: '📍 मधुबनी जिला (Madhubani District - मिथिलांचल)', jurisdictionType: 'DISTRICT' },
  { id: 'Saharsa', label: '📍 सहरसा जिला (Saharsa District - कोसी तटबंध)', jurisdictionType: 'DISTRICT' },
  { id: 'Muzaffarpur', label: '📍 मुजफ्फरपुर जिला (Muzaffarpur District - बूढ़ी गंडक)', jurisdictionType: 'DISTRICT' },
];

export const AdminLogin: React.FC = () => {
  const { login, quickLoginUser, demoUsers, isAuthenticated: isAdminAuthenticated } = useAuth();
  const { citizen, isCitizenAuthenticated, logoutCitizen } = useCitizenAuth();
  const navigate = useNavigate();

  // If already logged in as administrator, navigate directly to dashboard
  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAdminAuthenticated, navigate]);

  // Clean 2-Tier Selection: District -> Designated Official (No Department Clutter)
  const [selectedDistrict, setSelectedDistrict] = useState<string>('STATE');
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Custom standard email/password toggle
  const [showManualLogin, setShowManualLogin] = useState<boolean>(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map users to their district
  const getUserDistrict = (u: AdminUser): string => {
    if (u.jurisdictionType === 'STATE' || u.jurisdictionName === 'Bihar') return 'STATE';
    const name = u.jurisdictionName || '';
    if (['Supaul', 'Nirmali', 'Pipra', 'Kishanpur', 'Mahuwa'].includes(name)) return 'Supaul';
    if (['Darbhanga', 'Kusheshwar Asthan', 'Satiyara', 'Jhakhra'].includes(name)) return 'Darbhanga';
    if (['Madhubani', 'Jhanjharpur', 'Kothia'].includes(name)) return 'Madhubani';
    if (['Saharsa', 'Simri Bakhtiarpur', 'Khamhaunti'].includes(name)) return 'Saharsa';
    if (['Muzaffarpur', 'Aurai', 'Bhadurpur'].includes(name)) return 'Muzaffarpur';
    return name || 'Supaul';
  };

  // 1. Officers available in currently selected district / jurisdiction
  const districtUsers = useMemo(() => {
    return demoUsers.filter((u) => getUserDistrict(u) === selectedDistrict);
  }, [demoUsers, selectedDistrict]);

  // Sync selected user when district changes
  useEffect(() => {
    if (districtUsers.length > 0) {
      if (!districtUsers.some((u) => u.id === selectedUserId)) {
        setSelectedUserId(districtUsers[0].id);
      }
    } else {
      setSelectedUserId('');
    }
  }, [districtUsers]);

  // The active officer object
  const activeOfficer = useMemo(() => {
    return demoUsers.find((u) => u.id === selectedUserId) || districtUsers[0] || null;
  }, [demoUsers, selectedUserId, districtUsers]);

  const getRoleDesignationHindi = (role: string): string => {
    switch (role) {
      case 'DM':
        return 'जिला पदाधिकारी (DM)';
      case 'ADM':
        return 'अपर समाहर्ता - आपदा व राहत (ADM)';
      case 'SDM':
        return 'अनुमंडल दंडाधिकारी (SDM)';
      case 'BDO':
        return 'प्रखंड विकास पदाधिकारी (BDO)';
      case 'DDC':
        return 'उप विकास आयुक्त (DDC)';
      case 'DPO':
        return 'जिला परियोजना समन्वयक (DPO जीविका)';
      case 'VOLUNTEER':
        return 'फील्ड सत्यापन दल (Ground Volunteer)';
      case 'SYSTEM_ADMIN':
        return 'राज्य सिस्टम प्रशासक (Admin)';
      default:
        return role;
    }
  };

  // Handle Quick Direct Login into Selected Official
  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOfficer) {
      setError('कृपया पदनाम चुनें');
      return;
    }

    setIsLoading(true);
    setError(null);
    const success = await quickLoginUser(activeOfficer);
    setIsLoading(false);

    if (success) {
      navigate('/admin/cases?district=ALL&sortBy=newest');
    } else {
      setError('प्रशासनिक लॉगिन में त्रुटि आई। कृपया पुनः प्रयास करें।');
    }
  };

  // Fast Track: Instant statewide access to view all incoming citizen submissions
  const handleInstantViewAllRequests = async () => {
    setIsLoading(true);
    setError(null);
    const stateDirector = demoUsers.find((u) => u.email === 'dm.state@jeevikasetu.gov.in') || demoUsers[0];
    if (stateDirector) {
      const ok = await quickLoginUser(stateDirector);
      setIsLoading(false);
      if (ok) {
        navigate('/admin/cases?district=ALL&sortBy=newest');
      }
    }
  };

  // Handle Manual Email/Password Login
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      navigate('/admin/dashboard');
    } else {
      setError(res.message || 'अमान्य ईमेल या पासवर्ड। कृपया पुनः जांचें।');
    }
  };

  // If already logged in as a resident (citizen), block second mode login
  if (isCitizenAuthenticated && citizen) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 text-center">
          <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 text-amber-600 flex items-center justify-center mx-auto border border-slate-200 dark:border-slate-700">
            <Shield className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
              सक्रिय नागरिक सत्र
            </span>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white pt-2">
              आप नागरिक के रूप में लॉगिन हैं
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {citizen.fullName} ({citizen.email})
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 pt-1 leading-relaxed">
              एक समय में केवल एक मोड में लॉगिन रह सकते हैं। प्रशासनिक लॉगिन करने के लिए पहले नागरिक सत्र से लॉगआउट करें।
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link
              to="/"
              className="w-full py-2.5 px-4 bg-blue-800 hover:bg-blue-900 text-white font-medium rounded-lg shadow-2xs transition-colors text-xs flex items-center justify-center gap-1.5"
            >
              <span>नागरिक पोर्टल पर जाएं</span>
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logoutCitizen();
              }}
              className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-700 dark:text-slate-300 hover:text-red-700 dark:hover:text-red-300 font-medium rounded-lg border border-slate-200 dark:border-slate-700 transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>नागरिक सत्र से लॉगआउट करें</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-lg space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-11 h-11 rounded-lg bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center mx-auto border border-slate-700">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
            बाढ़ राहत प्रशासनिक लॉगिन
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
            JeevikaSetu Administrative & Field Coordination Portal (Bihar Flood Response)
          </p>
        </div>

        {/* Instant Access Banner for Citizen Requests */}
        <div className="bg-slate-900 dark:bg-slate-850 p-4 rounded-xl text-white border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-900 text-blue-200 rounded text-xs font-medium border border-blue-700">
                त्वरित समीक्षा
              </span>
              <span className="text-xs font-medium tracking-wide">वेबसाइट से प्राप्त सभी नए आवेदन</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            नागरिकों द्वारा वेबसाइट पर दर्ज किए गए सभी मामलों को बिना किसी विभागीय रुकावट के सीधे देखने के लिए राज्य आपदा नियंत्रण कक्ष से प्रवेश करें।
          </p>
          <button
            type="button"
            onClick={handleInstantViewAllRequests}
            disabled={isLoading}
            className="w-full mt-1 py-2 px-3 bg-blue-800 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-2xs"
          >
            <span>सभी जिलों के प्राप्त आवेदन तुरंत खोलें</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Primary Selection Form (District -> Flood Relief Official -> Login) */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <span>कार्यक्षेत्र एवं पदनाम चयन</span>
            </div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded font-medium border border-emerald-200 dark:border-emerald-800">
              विभागीय बाधा रहित
            </span>
          </div>

          <form onSubmit={handleDirectLogin} className="space-y-3.5 text-left">
            {/* Step 1: District / Jurisdiction Level */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                १. कार्यक्षेत्र / जिला चुनें:
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs sm:text-sm font-medium bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-800 focus:outline-none"
              >
                {DISTRICT_OPTIONS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Flood Relief Official & Post */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                २. बाढ़ राहत प्राधिकारी / पदनाम चुनें:
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={districtUsers.length === 0}
                className="w-full p-2.5 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-800 focus:outline-none"
              >
                {districtUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    [{u.role}] {u.fullName} — {getRoleDesignationHindi(u.role)} {u.jurisdictionName ? `(${u.jurisdictionName})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Officer Preview Pill */}
            {activeOfficer && (
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-750 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-700 dark:text-slate-300">चयनित अधिकारी:</span>
                  <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    {activeOfficer.email}
                  </span>
                </div>
                <div className="font-medium text-slate-900 dark:text-slate-100 text-sm flex items-center justify-between">
                  <span>{activeOfficer.fullName}</span>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded font-mono">
                    {activeOfficer.role}
                  </span>
                </div>
                <div className="text-[11px] text-blue-700 dark:text-blue-400 font-normal flex items-center justify-between">
                  <span>
                    अधिकार क्षेत्र: {activeOfficer.jurisdictionName || 'संपूर्ण बिहार'}
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    {activeOfficer.jurisdictionType || 'STATE'}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* One Big Clean Primary Login Button */}
            <button
              type="submit"
              disabled={isLoading || !activeOfficer}
              className="w-full py-2.5 px-4 bg-blue-800 hover:bg-blue-900 text-white font-medium rounded-lg text-xs sm:text-sm shadow-2xs transition-colors flex items-center justify-center gap-2 disabled:bg-slate-300 dark:disabled:bg-slate-800"
            >
              <span>
                {isLoading
                  ? 'सत्यापित किया जा रहा है...'
                  : activeOfficer
                  ? `${activeOfficer.role} के रूप में पोर्टल में प्रवेश करें`
                  : 'प्रशासनिक लॉगिन करें'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Toggle for Custom Credentials / Email-Password */}
          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowManualLogin(!showManualLogin)}
              className="w-full text-xs text-slate-500 hover:text-blue-700 font-medium flex items-center justify-center gap-1"
            >
              <span>{showManualLogin ? 'पदानुक्रम चयन पर लौटें' : 'या व्यक्तिगत ईमेल / पासवर्ड से लॉगिन करें'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showManualLogin ? 'rotate-180' : ''}`} />
            </button>

            {showManualLogin && (
              <form onSubmit={handleManualSubmit} className="mt-4 pt-3 border-t border-slate-100 space-y-3 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    आधिकारिक ईमेल (Email)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="उदा. dm.supaul@jeevikasetu.gov.in"
                      className="w-full pl-9 p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    पासवर्ड (Password)
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Quick Credentials Auto-Fill Chips */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1.5">
                  <span className="font-semibold text-slate-600 block">
                    त्वरित परीक्षण क्रेडेंशियल्स (डिफ़ॉल्ट पासवर्ड: <code>password123</code>):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'DM सुपौल', email: 'dm.supaul@jeevikasetu.gov.in' },
                      { label: 'BDO निर्मली', email: 'bdo.nirmali@jeevikasetu.gov.in' },
                      { label: 'DM दरभंगा', email: 'dm.darbhanga@jeevikasetu.gov.in' },
                      { label: 'राज्य DM', email: 'dm.state@jeevikasetu.gov.in' },
                    ].map((cred) => (
                      <button
                        key={cred.email}
                        type="button"
                        onClick={() => {
                          setEmail(cred.email);
                          setPassword('password123');
                          setError(null);
                        }}
                        className="px-2 py-0.5 bg-white hover:bg-blue-100 text-blue-700 rounded border border-slate-300 font-mono text-[10px] transition-colors"
                      >
                        {cred.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs shadow transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>पासवर्ड से लॉगिन करें</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

          <div className="pt-2 text-center">
            <Link to="/" className="text-xs text-slate-500 hover:text-blue-600 font-medium">
              ← नागरिक पोर्टल पर वापस लौटें
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
