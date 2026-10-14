import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Mic,
  FileText,
  MapPin,
  Clock,
  ArrowUpRight,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { PriorityBadge } from '../../components/PriorityBadge.js';
import { api } from '../../api/client.js';

export const CasesList: React.FC = () => {
  const { user } = useAuth();

  const [reports, setReports] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('ALL');
  const [district, setDistrict] = useState<string>('ALL');
  const [block, setBlock] = useState<string>('ALL');
  const [category, setCategory] = useState<string>('ALL');
  const [priorityLevel, setPriorityLevel] = useState<string>('ALL');
  const [assignedToMe, setAssignedToMe] = useState<boolean>(user?.role === 'VOLUNTEER');

  useEffect(() => {
    loadCases();
  }, [status, district, block, category, priorityLevel, assignedToMe]);

  const loadCases = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search.trim()) params.search = search.trim();
      if (status !== 'ALL') params.status = status;
      if (district !== 'ALL') params.district = district;
      if (block !== 'ALL') params.block = block;
      if (category !== 'ALL') params.category = category;
      if (priorityLevel !== 'ALL') params.priorityLevel = priorityLevel;
      if (assignedToMe) params.assignedToMe = 'true';

      const res = await api.getReports(params);
      if (res.success) {
        setReports(res.reports || []);
        setTotalCount(res.pagination?.total || 0);
      }
    } catch (e) {
      console.error('Error loading cases:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCases();
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            आजीविका क्षति मामले (Cases Queue)
          </h1>
          <p className="text-xs text-slate-500">
            कुल <strong>{totalCount}</strong> मामले अधिकार क्षेत्र में पाए गए
          </p>
        </div>

        <button
          type="button"
          onClick={loadCases}
          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg text-xs font-medium border border-slate-200 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>रिफ्रेश</span>
        </button>
      </div>

      {/* Search & Multi-Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="रिपोर्ट आईडी, नागरिक नाम, फोन अथवा गांव से खोजें..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            खोजें
          </button>
        </form>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {/* District Filter */}
          <select
            value={district}
            onChange={(e) => {
              setDistrict(e.target.value);
              setBlock('ALL');
            }}
            className="p-2 border-2 border-blue-300 rounded-lg text-xs bg-blue-50/50 font-bold text-blue-900"
          >
            <option value="ALL">समस्त जिले (All Districts)</option>
            <option value="Supaul">सुपौल (Supaul)</option>
            <option value="Darbhanga">दरभंगा (Darbhanga)</option>
            <option value="Madhubani">मधुबनी (Madhubani)</option>
            <option value="Saharsa">सहरसा (Saharsa)</option>
            <option value="Muzaffarpur">मुजफ्फरपुर (Muzaffarpur)</option>
          </select>

          {/* Block Selector */}
          <select
            value={block}
            onChange={(e) => setBlock(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg text-xs bg-slate-50 font-medium"
          >
            <option value="ALL">समस्त प्रखंड (All Blocks)</option>
            {(district === 'ALL' || district === 'Supaul') && (
              <>
                <option value="Nirmali">Nirmali (निर्मली)</option>
                <option value="Pipra">Pipra (पिपरा)</option>
                <option value="Kishanpur">Kishanpur (किशनपुर)</option>
              </>
            )}
            {(district === 'ALL' || district === 'Darbhanga') && (
              <>
                <option value="Kusheshwar Asthan">Kusheshwar Asthan (कुशेश्वर स्थान)</option>
                <option value="Biraul">Biraul (बिरौल)</option>
              </>
            )}
            {(district === 'ALL' || district === 'Madhubani') && (
              <>
                <option value="Jhanjharpur">Jhanjharpur (झंझारपुर)</option>
                <option value="Madhepur">Madhepur (मधेपुर)</option>
              </>
            )}
            {(district === 'ALL' || district === 'Saharsa') && (
              <>
                <option value="Simri Bakhtiarpur">Simri Bakhtiarpur (सिमरी बख्तियारपुर)</option>
                <option value="Mahishi">Mahishi (महिषी)</option>
              </>
            )}
            {(district === 'ALL' || district === 'Muzaffarpur') && (
              <>
                <option value="Aurai">Aurai (औराई)</option>
                <option value="Katra">Katra (कटरा)</option>
              </>
            )}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg text-xs bg-slate-50 font-medium"
          >
            <option value="ALL">समस्त स्थितियां (Status: All)</option>
            <option value="SUBMITTED">SUBMITTED (दर्ज)</option>
            <option value="ASSIGNED_FOR_VERIFICATION">ASSIGNED (आवंटित)</option>
            <option value="VERIFIED">VERIFIED (सत्यापित)</option>
            <option value="PARTIALLY_VERIFIED">PARTIALLY_VERIFIED</option>
            <option value="REFERRED_FOR_RECOVERY">REFERRED_FOR_RECOVERY</option>
            <option value="ACTION_RECORDED">ACTION_RECORDED</option>
            <option value="CLOSED">CLOSED</option>
          </select>

          {/* Priority Level */}
          <select
            value={priorityLevel}
            onChange={(e) => setPriorityLevel(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg text-xs bg-slate-50 font-medium"
          >
            <option value="ALL">समस्त प्राथमिकताएं (Priority)</option>
            <option value="URGENT">URGENT (अति-प्राथमिक)</option>
            <option value="HIGH">HIGH (उच्च)</option>
            <option value="MEDIUM">MEDIUM (मध्यम)</option>
            <option value="LOW">LOW (सामान्य)</option>
          </select>

          {/* Livelihood Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg text-xs bg-slate-50 font-medium"
          >
            <option value="ALL">समस्त श्रेणियां (Category)</option>
            <option value="CROP">फसल क्षति (Crop)</option>
            <option value="LIVESTOCK">पशुधन क्षति (Livestock)</option>
            <option value="SHOP_BUSINESS">दुकान / गुमटी (Shop)</option>
            <option value="EQUIPMENT">उपकरण / पम्पसेट (Equipment)</option>
            <option value="WAGE_LABOR">दैनिक मजदूरी (Labor)</option>
            <option value="FISHERIES">मत्स्य पालन (Fisheries)</option>
          </select>

          {/* Assigned to me toggle for volunteers */}
          {user?.role === 'VOLUNTEER' && (
            <label className="flex items-center gap-2 p-2 border border-blue-200 bg-blue-50/70 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={assignedToMe}
                onChange={(e) => setAssignedToMe(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="font-semibold text-blue-900 text-xs">मेरे आवंटित कार्य</span>
            </label>
          )}
        </div>
      </div>

      {/* Cases Table (Desktop) / Cards (Mobile) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-sm">मामले लोड हो रहे हैं...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            कोई मामला नहीं मिला। कृपया फिल्टर बदलकर पुनः प्रयास करें।
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">प्ररूप</th>
                    <th className="py-3 px-4">रिपोर्ट संख्या</th>
                    <th className="py-3 px-4">नागरिक / स्थान</th>
                    <th className="py-3 px-4">प्रभावित श्रेणियां</th>
                    <th className="py-3 px-4">प्राथमिकता स्कोर</th>
                    <th className="py-3 px-4">स्थिति</th>
                    <th className="py-3 px-4 text-right">डोजियर</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        {c.isVoiceReport ? (
                          <span
                            className="p-1 rounded bg-blue-100 text-blue-700 inline-block"
                            title="आवाज द्वारा दर्ज रिपोर्ट (Voice-first)"
                          >
                            <Mic className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span
                            className="p-1 rounded bg-slate-100 text-slate-600 inline-block"
                            title="लिखित रिपोर्ट (Text)"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">
                        <Link to={`/admin/cases/${c.id}`} className="hover:underline">
                          {c.reportNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{c.citizenName}</div>
                        <div className="text-[11px] text-slate-500">
                          {c.village}, {c.block} ({c.district})
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {c.livelihoodCategories?.map((cat: string) => (
                            <span
                              key={cat}
                              className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]"
                            >
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
                          className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white rounded-md font-semibold text-xs transition-colors"
                        >
                          <span>विवरण</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (Section 20 Responsive Requirements) */}
            <div className="md:hidden divide-y divide-slate-100">
              {reports.map((c) => (
                <div key={c.id} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-700 text-xs">
                      {c.reportNumber}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{c.citizenName}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {c.village}, {c.block} ({c.district})
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <PriorityBadge
                      score={c.priorityScore}
                      level={c.priorityLevel}
                      rationale={c.priorityRationale}
                    />

                    <Link
                      to={`/admin/cases/${c.id}`}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1"
                    >
                      <span>डोजियर देखें</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
