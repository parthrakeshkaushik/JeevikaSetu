import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Key, Mail, AlertCircle, ArrowRight, Building2, UserCheck, ChevronDown, Sparkles } from 'lucide-react';
import { useAuth, AdminUser } from '../../context/AuthContext.js';

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
  const { login, quickLoginUser, demoUsers } = useAuth();
  const navigate = useNavigate();

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

    const success = await login(email, password);
    setIsLoading(false);

    if (success) {
      navigate('/admin/dashboard');
    } else {
      setError('अमान्य ईमेल या पासवर्ड। कृपया पुनः जांचें।');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-lg space-y-5">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-blue-900 text-white flex items-center justify-center mx-auto shadow-lg border border-slate-700">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            बाढ़ राहत प्रशासनिक लॉगिन
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            JeevikaSetu Administrative & Field Coordination Portal (Bihar Flood Response)
          </p>
        </div>

        {/* Instant Access Banner for Citizen Requests */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-4 rounded-2xl text-white shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-400 text-slate-950 rounded-lg text-xs font-black shadow-xs">
                ⚡ त्वरित समीक्षा
              </span>
              <span className="text-xs font-bold tracking-wide">वेबसाइट से प्राप्त सभी नए आवेदन</span>
            </div>
          </div>
          <p className="text-[11px] text-blue-100 leading-relaxed">
            नागरिकों द्वारा वेबसाइट पर दर्ज किए गए सभी मामलों को बिना किसी विभागीय रुकावट के सीधे देखने के लिए राज्य आपदा नियंत्रण कक्ष से प्रवेश करें।
          </p>
          <button
            type="button"
            onClick={handleInstantViewAllRequests}
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 bg-white hover:bg-blue-50 text-blue-900 font-extrabold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <span>सभी जिलों के प्राप्त आवेदन तुरंत खोलें (View All Incoming Citizen Requests)</span>
            <ArrowRight className="w-4 h-4 text-blue-700" />
          </button>
        </div>

        {/* Primary Selection Form (District -> Flood Relief Official -> Login) */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>कार्यक्षेत्र एवं पदनाम चयन (Select Official)</span>
            </div>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
              विभागीय बाधा रहित (Zero Silos)
            </span>
          </div>

          <form onSubmit={handleDirectLogin} className="space-y-4 text-left">
            {/* Step 1: District / Jurisdiction Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                १. कार्यक्षेत्र / जिला चुनें (1. Select District / Level):
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {DISTRICT_OPTIONS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Flood Relief Official & Post (Direct without department silos) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                २. बाढ़ राहत प्राधिकारी / पदनाम चुनें (2. Select Relief Officer & Post):
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={districtUsers.length === 0}
                className="w-full p-3 border-2 border-blue-400 bg-blue-50/50 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-semibold text-slate-700">चयनित अधिकारी:</span>
                  <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-800">
                    {activeOfficer.email}
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
                  <span>{activeOfficer.fullName}</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                    {activeOfficer.role}
                  </span>
                </div>
                <div className="text-[11px] text-blue-700 font-medium flex items-center justify-between">
                  <span>
                    अधिकार क्षेत्र: <strong>{activeOfficer.jurisdictionName || 'संपूर्ण बिहार'}</strong>
                  </span>
                  <span className="text-slate-500">
                    {activeOfficer.jurisdictionType || 'STATE'}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* One Big Clean Primary Login Button */}
            <button
              type="submit"
              disabled={isLoading || !activeOfficer}
              className="w-full py-3.5 px-5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold rounded-xl text-sm shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:bg-slate-300"
            >
              <span>
                {isLoading
                  ? 'सत्यापित किया जा रहा है...'
                  : activeOfficer
                  ? `🔒 ${activeOfficer.role} के रूप में पोर्टल में प्रवेश करें`
                  : 'प्रशासनिक लॉगिन करें'}
              </span>
              <ArrowRight className="w-4 h-4" />
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
