import React, { useState, useEffect } from 'react';
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
  Legend,
} from 'recharts';
import { Download, Filter, BarChart3, PieChart as PieIcon, ShieldAlert } from 'lucide-react';
import { api } from '../../api/client.js';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [district, setDistrict] = useState<string>('Supaul');
  const [block, setBlock] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAnalytics();
  }, [district, block]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await api.getDashboardAnalytics(
        district,
        block !== 'ALL' ? block : undefined
      );
      if (res.success) setAnalytics(res);
    } catch (e) {
      console.error('Error loading analytics:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!analytics) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value\n' +
      `Total Reports,${analytics?.kpis?.totalReports || 0}\n` +
      `Unique Households,${analytics?.kpis?.uniqueHouseholdsCount || 0}\n` +
      `Pending Verification,${analytics?.kpis?.pendingVerification || 0}\n` +
      `Verified Cases,${analytics?.kpis?.totalVerified || 0}\n` +
      `Recovery Referred,${analytics?.kpis?.totalRecoveryReferred || 0}\n` +
      `Overdue Cases (>48h),${analytics?.kpis?.overdueCases || 0}\n` +
      `Self-Reported Estimated Losses,${analytics?.kpis?.totalSelfReportedLoss || 0}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jeevikasetu_analytics_${district}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const COLORS = ['#2563eb', '#0d9488', '#ea580c', '#e11d48', '#8b5cf6', '#059669'];

  const priorityPieData = analytics?.priorityCounts
    ? [
        { name: 'अति-प्राथमिक (URGENT)', value: analytics.priorityCounts.URGENT || 0, color: '#e11d48' },
        { name: 'उच्च (HIGH)', value: analytics.priorityCounts.HIGH || 0, color: '#ea580c' },
        { name: 'मध्यम (MEDIUM)', value: analytics.priorityCounts.MEDIUM || 0, color: '#2563eb' },
        { name: 'सामान्य (LOW)', value: analytics.priorityCounts.LOW || 0, color: '#64748b' },
      ].filter((d) => d.value > 0)
    : [];

  const modalityData = analytics?.modality
    ? [
        { name: 'आवाज द्वारा दर्ज (Voice)', value: analytics.modality.voiceReports || 0, color: '#0284c7' },
        { name: 'लिखित रूप में दर्ज (Text)', value: analytics.modality.textReports || 0, color: '#94a3b8' },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            विभागीय निर्णय सहयोग एवं एनालिटिक्स
          </h1>
          <p className="text-xs text-slate-500">
            बाढ़ क्षति समेकन, ब्लॉक तुलना, आयु विश्लेषण एवं नीतिगत योजना
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg text-xs font-semibold bg-slate-50"
          >
            {['Supaul', 'Darbhanga', 'Madhubani', 'Muzaffarpur', 'Saharsa'].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV निर्यात करें</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400">एनालिटिक्स लोड हो रहे हैं...</div>
      ) : (
        analytics && (
          <div className="space-y-6">
            {/* Visual Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Livelihood Breakdown */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span>आजीविका श्रेणी-वार क्षति वितरण (Category Distribution)</span>
                </h3>
                {analytics.categoryChartData && analytics.categoryChartData.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.categoryChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 w-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <BarChart3 className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-600">0 रिपोर्ट दर्ज (No category data)</p>
                    <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                      नागरिकों द्वारा रिपोर्ट दर्ज करते ही फसल, पशुधन, दुकान व मजदूरी का श्रेणी-वार वितरण ग्राफ तैयार होगा।
                    </p>
                  </div>
                )}
              </div>

              {/* Priority Distribution Pie */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <PieIcon className="w-4 h-4 text-amber-600" />
                  <span>प्राथमिकता स्तर वितरण (Priority Level Breakdown)</span>
                </h3>
                {priorityPieData && priorityPieData.length > 0 ? (
                  <div className="h-64 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={priorityPieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {priorityPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 w-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <PieIcon className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-600">0 प्राथमिकता मामले (No priority cases)</p>
                    <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                      अति-प्राथमिक, उच्च, मध्यम एवं सामान्य मामलों का पाई चार्ट नए मामले दर्ज होने पर स्वतः बनेगा।
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Aging & Overdue Queue Analysis */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                सत्यापन विलंब एवं कार्यभार आयु विश्लेषण (Aging & Overdue Bottlenecks)
              </h3>
              <p className="text-xs text-slate-500">
                लंबित मामलों की समय-सीमा: 48 घंटे से अधिक लंबित मामलों का त्वरित निस्तारण आवश्यक
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="text-xs text-emerald-800 font-semibold">&lt; 24 घंटे (समय पर)</div>
                  <div className="text-2xl font-extrabold text-emerald-700 mt-1 font-mono">
                    {analytics.agingBreakdown.under24h}
                  </div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">सक्रिय कार्यक्षेत्र में</div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="text-xs text-amber-800 font-semibold">24 - 48 घंटे (ध्यान दें)</div>
                  <div className="text-2xl font-extrabold text-amber-700 mt-1 font-mono">
                    {analytics.agingBreakdown.between24and48h}
                  </div>
                  <div className="text-[10px] text-amber-600 mt-0.5">शीघ्र सत्यापन अपेक्षित</div>
                </div>

                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="text-xs text-red-800 font-semibold">&gt; 48 घंटे (अति-विलंबित)</div>
                  <div className="text-2xl font-extrabold text-red-700 mt-1 font-mono">
                    {analytics.agingBreakdown.over48hOverdue}
                  </div>
                  <div className="text-[10px] text-red-600 mt-0.5">एस्केलेशन एवं समीक्षा योग्य</div>
                </div>
              </div>
            </div>

            {/* Honest Disclaimers Card */}
            <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-slate-600 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div><strong>डेटा विश्वसनीयता घोषणा:</strong> {analytics.disclaimers.lossAmountNote}</div>
                <div>{analytics.disclaimers.deduplicationNote}</div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};
