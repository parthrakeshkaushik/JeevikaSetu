import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  MapPin,
  ChevronRight,
  Filter,
  BarChart2,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '../../context/AuthContext.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { PriorityBadge } from '../../components/PriorityBadge.js';
import { api } from '../../api/client.js';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const [analytics, setAnalytics] = useState<any>(null);
  const [recentCases, setRecentCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters - Default to ALL so administrators immediately see statewide citizen requests
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedBlock, setSelectedBlock] = useState<string>('ALL');

  useEffect(() => {
    loadDashboardData();
  }, [user, selectedDistrict, selectedBlock]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const distQuery = selectedDistrict !== 'ALL' ? selectedDistrict : undefined;
      const blockQuery = selectedBlock !== 'ALL' ? selectedBlock : undefined;
      const reportParams: Record<string, string> = { 
        limit: '6',
        sortBy: 'newest',
        district: selectedDistrict,
        block: selectedBlock,
      };

      const [dashRes, casesRes] = await Promise.all([
        api.getDashboardAnalytics(distQuery, blockQuery),
        api.getReports(reportParams),
      ]);

      if (dashRes.success) setAnalytics(dashRes);
      if (casesRes.success) setRecentCases(casesRes.reports || []);
    } catch (e) {
      console.error('Error loading dashboard:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#2563eb', '#0d9488', '#ea580c', '#e11d48', '#8b5cf6', '#059669'];

  return (
    <div className="space-y-6">
      {/* Role Context Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              {user?.role}
            </span>
            <span className="text-xs text-slate-500">
              अधिकार क्षेत्र: <strong>{user?.jurisdictionName || 'बिहार राज्य'}</strong> ({user?.department || 'प्रशासन'})
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            {user?.role === 'VOLUNTEER' && 'ऑन-ग्राउंड सत्यापन कार्यक्षेत्र'}
            {user?.role === 'BDO' && 'प्रखंड बाढ़ आजीविका समन्वय डैशबोर्ड'}
            {user?.role === 'DDC' && 'जिला विकास एवं आजीविका योजना समन्वय'}
            {user?.role === 'DPO' && 'जीविका एवं विभागीय सहायता अनुश्रवण'}
            {user?.role === 'SDM' && 'अनुमंडल दंडाधिकारी नियंत्रण एवं अनुश्रवण'}
            {user?.role === 'ADM' && 'आपदा राहत एवं राजस्व समन्वयन डैशबोर्ड'}
            {user?.role === 'DM' && 'जिलाधिकारी निर्णय एवं आजीविका बहाली अवलोकन'}
            {user?.role === 'SYSTEM_ADMIN' && 'सिस्टम प्रशासन एवं ऑडिट अवलोकन'}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* District Switcher */}
          <div className="flex items-center gap-1.5 bg-blue-50/80 border border-blue-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-blue-700" />
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSelectedBlock('ALL');
              }}
              className="text-xs font-bold bg-transparent border-none text-blue-900 focus:outline-none cursor-pointer"
            >
              <option value="ALL">🌐 समस्त जिले (All Bihar)</option>
              <option value="Supaul">📍 सुपौल (Supaul)</option>
              <option value="Darbhanga">📍 दरभंगा (Darbhanga)</option>
              <option value="Madhubani">📍 मधुबनी (Madhubani)</option>
              <option value="Saharsa">📍 सहरसा (Saharsa)</option>
              <option value="Muzaffarpur">📍 मुजफ्फरपुर (Muzaffarpur)</option>
            </select>
          </div>

          <Link
            to="/admin/cases"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>सभी मामले देखें</span>
          </Link>
        </div>
      </div>

      {/* 4 Core KPIs */}
      {analytics?.kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Reports vs Households */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">कुल दर्ज रिपोर्ट (Reports)</span>
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {analytics.kpis.totalReports ?? 0}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>अद्वितीय परिवार: <strong>{analytics.kpis.uniqueHouseholdsCount ?? 0}</strong></span>
            </div>
          </div>

          {/* Pending Field Verification */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">सत्यापन हेतु लंबित</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">
              {analytics.kpis.pendingVerification ?? 0}
            </div>
            <div className="text-[11px] text-amber-800 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>48 घंटे से अधिक विलंबित: <strong>{analytics.kpis.overdueCases ?? 0}</strong></span>
            </div>
          </div>

          {/* Verified & Recovery Referred */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">सत्यापित मामले (Verified)</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {analytics.kpis.totalVerified ?? 0}
            </div>
            <div className="text-[11px] text-emerald-800 flex items-center gap-1">
              <span>पुनर्प्राप्ति अग्रसारित: <strong>{analytics.kpis.totalRecoveryReferred ?? 0}</strong></span>
            </div>
          </div>

          {/* Self-reported Estimated Losses */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">स्व-रिपोर्टेड अनुमानित नुकसान</span>
              <TrendingUp className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              ₹{(analytics.kpis.totalSelfReportedLoss || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 italic">
              * नागरिकों का स्व-आकलन; स्वीकृत मुआवजा नहीं।
            </div>
          </div>
        </div>
      )}

      {/* Visual Analytics Charts */}
      {analytics?.categoryChartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Livelihood Category Breakdown Bar Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  प्रभावित आजीविका श्रेणियां (Livelihood Loss Breakdown)
                </h3>
                <p className="text-xs text-slate-500">फसल, पशुधन, दुकान, मजदूरी अनुसार क्षति रिपोर्ट</p>
              </div>
              <BarChart2 className="w-4 h-4 text-blue-600" />
            </div>

            {analytics.categoryChartData && analytics.categoryChartData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.categoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-2 rounded text-xs shadow">
                              <div className="font-bold">{data.fullName}</div>
                              <div>दर्ज रिपोर्ट: <strong>{data.count}</strong></div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 w-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <BarChart2 className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-600">0 रिपोर्ट दर्ज (No category reports yet)</p>
                <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                  नागरिकों द्वारा रिपोर्ट दर्ज होते ही फसल, पशुधन, दुकान व मजदूरी का श्रेणी-वार ग्राफ स्वतः तैयार होगा।
                </p>
              </div>
            )}
          </div>

          {/* Block-wise Distribution Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  प्रखंड-वार क्षति एवं सत्यापन स्थिति (Block Distribution)
                </h3>
                <p className="text-xs text-slate-500">सत्यापित बनाम लंबित सत्यापन की तुलना</p>
              </div>
              <MapPin className="w-4 h-4 text-teal-600" />
            </div>

            {analytics.blockChartData && analytics.blockChartData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.blockChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="block" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="verified" name="सत्यापित" fill="#059669" stackId="a" />
                    <Bar dataKey="pending" name="लंबित" fill="#ea580c" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 w-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <MapPin className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-600">0 रिपोर्ट दर्ज (No block reports yet)</p>
                <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                  प्रखंड-वार मामलों का तुलनात्मक विश्लेषण वास्तविक रिपोर्ट आने पर स्वतः प्रदर्शित होगा।
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Urgent Pending Cases Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              अति-प्राथमिक / लंबित मामले (Priority Action Queue)
            </h3>
            <p className="text-xs text-slate-500">
              पारदर्शी प्राथमिकता स्कोर के आधार पर अविलंब सत्यापन हेतु अनुशंसित
            </p>
          </div>
          <Link
            to="/admin/cases"
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>सभी देखें</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">रिपोर्ट संख्या</th>
                <th className="py-3 px-4">नागरिक / स्थान</th>
                <th className="py-3 px-4">प्रभावित श्रेणियां</th>
                <th className="py-3 px-4">प्राथमिकता स्कोर</th>
                <th className="py-3 px-4">स्थिति</th>
                <th className="py-3 px-4 text-right">कार्रवाई</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentCases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-bold text-slate-700">वर्तमान में 0 मामले दर्ज हैं (No cases yet)</div>
                      <div className="text-[11px] text-slate-400 max-w-sm">
                        पोर्टल पूर्णतः तैयार है। नागरिक द्वारा वेबसाइट से रिपोर्ट दर्ज करते ही वास्तविक आंकड़े व डोजियर यहाँ प्रदर्शित होंगे।
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                recentCases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      <Link to={`/admin/cases/${c.id}`} className="hover:underline">
                        {c.reportNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <div className="font-semibold text-slate-900">{c.citizenName}</div>
                        {c.status === 'SUBMITTED' && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                            🆕 नया
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">{c.village}, {c.block} ({c.district})</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {c.livelihoodCategories?.map((cat: string) => (
                          <span key={cat} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge
                        score={c.priorityScore}
                        level={c.priorityLevel}
                        rationale={c.priorityRationale}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/admin/cases/${c.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-md font-medium text-xs transition-colors"
                      >
                        <span>डोजियर</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
