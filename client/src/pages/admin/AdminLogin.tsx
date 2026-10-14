import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Key, Mail, AlertCircle, ArrowRight, UserCheck, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export const AdminLogin: React.FC = () => {
  const { login, quickLoginAsRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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

  const handleQuickRole = async (role: string) => {
    setIsLoading(true);
    setError(null);
    const success = await quickLoginAsRole(role);
    setIsLoading(false);
    if (success) {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-md">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">प्रशासनिक अधिकारी लॉगिन</h1>
          <p className="text-xs text-slate-500">
            JeevikaSetu Administrative & Verification Portal
          </p>
        </div>

        {/* Quick Demo Role Switcher for Hack for Social Cause Judges */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Layers className="w-4 h-4" />
            <span>HSC 2027 जजों हेतु 1-क्लिक परीक्षण लॉगिन:</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { role: 'VOLUNTEER', label: '1. स्वयंसेवक (Volunteer)' },
              { role: 'BDO', label: '2. BDO (निर्मली प्रखंड)' },
              { role: 'DDC', label: '3. DDC (सुपौल जिला)' },
              { role: 'DPO', label: '4. DPO (जीविका प्रकोष्ठ)' },
              { role: 'SDM', label: '5. SDM (अनुमंडल)' },
              { role: 'ADM', label: '6. ADM (आपदा राहत)' },
              { role: 'DM', label: '7. DM (जिलाधिकारी)' },
              { role: 'SYSTEM_ADMIN', label: '8. System Admin' },
            ].map((btn) => (
              <button
                key={btn.role}
                type="button"
                onClick={() => handleQuickRole(btn.role)}
                className="p-2 bg-slate-800 hover:bg-blue-600 rounded-lg text-left text-slate-200 hover:text-white transition-colors truncate font-medium text-[11px] border border-slate-700"
              >
                {btn.label}
              </button>
            ))}
          </div>

          <p className="text-[10px] text-slate-400 italic">
            * त्वरित मूल्यांकन के लिए किसी भी पद पर क्लिक करें (पासवर्ड स्वतः प्रविष्ट है)।
          </p>
        </div>

        {/* Standard Login Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="उदा. bdo.nirmali@jeevikasetu.gov.in"
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

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow transition-colors flex items-center justify-center gap-1.5"
            >
              <span>{isLoading ? 'सत्यापित किया जा रहा है...' : 'सुरक्षित लॉगिन करें'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center border-t border-slate-100">
            <Link to="/" className="text-xs text-slate-500 hover:text-blue-600">
              ← नागरिक पोर्टल पर वापस लौटें
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
