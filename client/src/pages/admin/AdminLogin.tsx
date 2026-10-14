import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Key, Mail, AlertCircle, ArrowRight, Building2, UserCheck, Layers, ChevronDown } from 'lucide-react';
import { useAuth, AdminUser } from '../../context/AuthContext.js';

// Predefined Bihar Administrative Hierarchy Definitions
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

  // Hierarchical Filter States: District -> Department -> Post
  const [selectedDistrict, setSelectedDistrict] = useState<string>('STATE');
  const [selectedDept, setSelectedDept] = useState<string>('');
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

  // 1. Users available in currently selected district
  const districtUsers = useMemo(() => {
    return demoUsers.filter((u) => getUserDistrict(u) === selectedDistrict);
  }, [demoUsers, selectedDistrict]);

  // 2. Departments available in this district
  const availableDepartments = useMemo(() => {
    const depts = Array.from(new Set(districtUsers.map((u) => u.department || 'सामान्य प्रशासन')));
    return depts;
  }, [districtUsers]);

  // Sync selected department when district changes
  useEffect(() => {
    if (availableDepartments.length > 0) {
      if (!availableDepartments.includes(selectedDept)) {
        setSelectedDept(availableDepartments[0]);
      }
    } else {
      setSelectedDept('');
    }
  }, [availableDepartments]);

  // 3. Officers / Posts available in selected department
  const availableOfficers = useMemo(() => {
    return districtUsers.filter((u) => (u.department || 'सामान्य प्रशासन') === selectedDept);
  }, [districtUsers, selectedDept]);

  // Sync selected user when department changes
  useEffect(() => {
    if (availableOfficers.length > 0) {
      if (!availableOfficers.some((u) => u.id === selectedUserId)) {
        setSelectedUserId(availableOfficers[0].id);
      }
    } else {
      setSelectedUserId('');
    }
  }, [availableOfficers]);

  // The active officer object
  const activeOfficer = useMemo(() => {
    return demoUsers.find((u) => u.id === selectedUserId) || availableOfficers[0] || null;
  }, [demoUsers, selectedUserId, availableOfficers]);

  // Handle Hierarchical Cascading Login
  const handleHierarchicalLogin = async (e: React.FormEvent) => {
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
      navigate('/admin/dashboard');
    } else {
      setError('प्रशासनिक लॉगिन में त्रुटि आई। कृपया पुनः प्रयास करें।');
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
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-blue-900 text-white flex items-center justify-center mx-auto shadow-lg border border-slate-700">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            प्रशासनिक पदानुक्रम लॉगिन
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            JeevikaSetu Administrative & Multi-District Coordination Portal
          </p>
        </div>

        {/* Primary Hierarchical Selector Form (District -> Dept -> Post -> Login) */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>पदानुक्रम आधारित पद चयन (Hierarchy-Based Role Access)</span>
          </div>

          <form onSubmit={handleHierarchicalLogin} className="space-y-4 text-left">
            {/* Step 1: District / Jurisdiction Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                १. कार्यक्षेत्र / जिला चुनें (1. Select Level / District):
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

            {/* Step 2: Department Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                २. प्रशासनिक विभाग चुनें (2. Select Department):
              </label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                disabled={availableDepartments.length === 0}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {availableDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 3: Designation / Officer Post */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ३. पदनाम / नामित अधिकारी चुनें (3. Select Designation & Post):
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={availableOfficers.length === 0}
                className="w-full p-3 border-2 border-blue-400 bg-blue-50/50 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {availableOfficers.map((u) => (
                  <option key={u.id} value={u.id}>
                    [{u.role}] {u.fullName} {u.jurisdictionName ? `(${u.jurisdictionName})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Role Preview Pill */}
            {activeOfficer && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span>सक्रिय भूमिका विवरण:</span>
                  <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-800">
                    {activeOfficer.email}
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  {activeOfficer.fullName}
                </div>
                <div className="text-[11px] text-blue-700 font-medium">
                  क्षेत्राधिकार: <strong>{activeOfficer.jurisdictionName || 'संपूर्ण बिहार'}</strong> ({activeOfficer.jurisdictionType || 'STATE'})
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
