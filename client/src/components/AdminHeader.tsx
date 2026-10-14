import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, LogOut, UserCheck, Layers, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const AdminHeader: React.FC = () => {
  const { user, logout, quickLoginAsRole } = useAuth();
  const navigate = useNavigate();

  const handleRoleSwitch = async (role: string) => {
    await quickLoginAsRole(role);
    navigate('/admin/dashboard');
  };

  const roleLabels: Record<string, string> = {
    VOLUNTEER: '1. On-Ground Volunteer (स्वयंसेवक)',
    BDO: '2. BDO (प्रखंड विकास पदाधिकारी)',
    DDC: '3. DDC (उप विकास आयुक्त)',
    DPO: '4. DPO (जिला कार्यक्रम पदाधिकारी - जीविका)',
    SDM: '5. SDM (अनुमंडल दंडाधिकारी)',
    ADM: '6. ADM (अपर समाहर्ता - आपदा राहत)',
    DM: '7. DM (जिला पदाधिकारी एवं समाहर्ता)',
    SYSTEM_ADMIN: '8. System Admin (सिस्टम प्रशासक)',
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Context */}
        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow">
              JS
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-2">
                जीविका सेतु <span className="text-xs text-blue-300 font-normal">| प्रशासन</span>
              </span>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                बिहार बाढ़ आजीविका बहाली समन्वय प्रणाली
              </p>
            </div>
          </Link>

          {/* Current Role Badge */}
          {user && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-lg border border-slate-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-semibold text-emerald-300">{user.role}</span>
              <span className="text-slate-400">• {user.jurisdictionName || 'बिहार राज्य'} ({user.jurisdictionType || 'समस्त'})</span>
            </div>
          )}
        </div>

        {/* Demo Role Switcher Toolbar for HSC Evaluators */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded-lg">
            <Layers className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="text-[11px] font-medium text-slate-300 hidden md:inline">
              मूल्यांकन रोल स्विच करें:
            </span>
            <select
              value={user?.role || 'DM'}
              onChange={(e) => handleRoleSwitch(e.target.value)}
              className="bg-transparent text-xs text-amber-300 font-semibold focus:outline-none cursor-pointer pr-1"
              title="परीक्षण हेतु तत्काल प्रशासनिक पद बदलें"
            >
              <option value="VOLUNTEER" className="bg-slate-900 text-white">
                Volunteer (रमेश मंडल)
              </option>
              <option value="BDO" className="bg-slate-900 text-white">
                BDO (अंजलि कुमारी, निर्मली)
              </option>
              <option value="DDC" className="bg-slate-900 text-white">
                DDC (राजेश्वर प्रसाद, सुपौल)
              </option>
              <option value="DPO" className="bg-slate-900 text-white">
                DPO (डॉ. सुनीता वर्मा, जीविका)
              </option>
              <option value="SDM" className="bg-slate-900 text-white">
                SDM (अमित राय, निर्मली)
              </option>
              <option value="ADM" className="bg-slate-900 text-white">
                ADM (संजय सिंह, आपदा राहत)
              </option>
              <option value="DM" className="bg-slate-900 text-white">
                DM (कौशल किशोर, IAS)
              </option>
              <option value="SYSTEM_ADMIN" className="bg-slate-900 text-white">
                System Admin (प्रिया शर्मा)
              </option>
            </select>
          </div>

          {/* User Name & Logout */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 hidden xl:inline">
              {user?.fullName}
            </span>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
              title="लॉगआउट"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">लॉगआउट</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
