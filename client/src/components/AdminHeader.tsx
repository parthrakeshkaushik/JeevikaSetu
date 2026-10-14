import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Layers, ChevronDown } from 'lucide-react';
import { useAuth, AdminUser } from '../context/AuthContext.js';

// Predefined Bihar Administrative Jurisdictions for grouping in toolbar
const DISTRICT_GROUPS = [
  { id: 'STATE', label: '🌐 राज्य मुख्यालय (State HQ - संपूर्ण बिहार)' },
  { id: 'Supaul', label: '📍 सुपौल जिला (Supaul District)' },
  { id: 'Darbhanga', label: '📍 दरभंगा जिला (Darbhanga District)' },
  { id: 'Madhubani', label: '📍 मधुबनी जिला (Madhubani District)' },
  { id: 'Saharsa', label: '📍 सहरसा जिला (Saharsa District)' },
  { id: 'Muzaffarpur', label: '📍 मुजफ्फरपुर जिला (Muzaffarpur District)' },
];

export const AdminHeader: React.FC = () => {
  const { user, logout, quickLoginUser, demoUsers } = useAuth();
  const navigate = useNavigate();

  // Helper to map user to district group
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

  // Group all 20 demo officers across Bihar districts
  const groupedUsers = useMemo(() => {
    const groups: Record<string, AdminUser[]> = {
      STATE: [],
      Supaul: [],
      Darbhanga: [],
      Madhubani: [],
      Saharsa: [],
      Muzaffarpur: [],
    };

    demoUsers.forEach((u) => {
      const d = getUserDistrict(u);
      if (groups[d]) {
        groups[d].push(u);
      } else {
        groups.Supaul.push(u);
      }
    });

    return groups;
  }, [demoUsers]);

  const handleOfficialSwitch = async (userId: string) => {
    const target = demoUsers.find((u) => u.id === userId);
    if (target) {
      const success = await quickLoginUser(target);
      if (success) {
        // Refresh page so role, jurisdiction, dashboard, and case queue reload cleanly
        navigate(0);
      }
    }
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
              <span className="font-semibold text-emerald-300">[{user.role}] {user.fullName}</span>
              <span className="text-slate-400">• {user.jurisdictionName || 'संपूर्ण बिहार'} ({user.jurisdictionType || 'STATE'})</span>
            </div>
          )}
        </div>

        {/* Dynamic Multi-District Official Switcher Toolbar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded-lg">
            <Layers className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="text-[11px] font-medium text-slate-300 hidden md:inline">
              अधिकारी / जिला बदलें:
            </span>
            <select
              value={user?.id || ''}
              onChange={(e) => handleOfficialSwitch(e.target.value)}
              className="bg-transparent text-xs text-amber-300 font-semibold focus:outline-none cursor-pointer pr-1 max-w-[260px] sm:max-w-xs truncate"
              title="परीक्षण हेतु तत्काल पद या जिला बदलें"
            >
              {DISTRICT_GROUPS.map((grp) => {
                const officers = groupedUsers[grp.id] || [];
                if (officers.length === 0) return null;
                return (
                  <optgroup
                    key={grp.id}
                    label={grp.label}
                    className="bg-slate-900 text-slate-400 font-bold"
                  >
                    {officers.map((u) => (
                      <option
                        key={u.id}
                        value={u.id}
                        className="bg-slate-900 text-white font-normal"
                      >
                        [{u.role}] {u.fullName} {u.jurisdictionName ? `(${u.jurisdictionName})` : ''}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
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
                navigate('/admin/login');
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
