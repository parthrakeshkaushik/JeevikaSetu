import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  PhoneCall,
  History,
  ExternalLink,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const AdminSidebar: React.FC = () => {
  const { user } = useAuth();

  const links = [
    { to: '/admin/dashboard', label: 'डैशबोर्ड (Dashboard)', icon: LayoutDashboard },
    { to: '/admin/cases', label: 'मामले सूची (Cases)', icon: FileText },
    { to: '/admin/analytics', label: 'एनालिटिक्स (Analytics)', icon: BarChart3 },
    { to: '/admin/directory', label: 'राहत निर्देशिका (Directory)', icon: PhoneCall },
    { to: '/admin/audit-logs', label: 'ऑडिट लॉग्स (Audit Trail)', icon: History },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 md:min-h-[calc(100vh-53px)]">
      {/* Mobile Horizontal Scrollable Nav / Desktop Vertical Nav */}
      <nav className="flex md:flex-col overflow-x-auto md:overflow-x-visible py-2 md:py-4 px-2 space-x-1 md:space-x-0 md:space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}

        <div className="pt-2 md:pt-4 mt-2 md:mt-4 border-t border-slate-800 hidden md:block">
          <NavLink
            to="/"
            target="_blank"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>नागरिक पोर्टल खोलें (Citizen Portal)</span>
          </NavLink>
        </div>
      </nav>
    </aside>
  );
};
