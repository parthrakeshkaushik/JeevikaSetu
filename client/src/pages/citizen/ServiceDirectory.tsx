import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Building, ShieldCheck, Search, ExternalLink } from 'lucide-react';
import { api } from '../../api/client.js';

export const ServiceDirectory: React.FC = () => {
  const [directory, setDirectory] = useState<any[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Supaul');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    api.getServiceDirectory(selectedDistrict)
      .then((res) => {
        if (res.success) setDirectory(res.directory);
      })
      .finally(() => setIsLoading(false));
  }, [selectedDistrict]);

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">
          बाढ़ राहत एवं आजीविका सहायता केंद्र निर्देशिका
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          आपातकालीन चारा, आकस्मिक बीज, पशु चिकित्सा एवं राहत सहायता केंद्र
        </p>
      </div>

      {/* District Selector */}
      <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <span className="text-xs font-semibold text-slate-700">जिला चुनें:</span>
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="p-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-slate-50"
        >
          {['Supaul', 'Darbhanga', 'Madhubani', 'Muzaffarpur', 'Saharsa', 'Khagaria'].map((d) => (
            <option key={d} value={d}>
              {d} (बिहार)
            </option>
          ))}
        </select>
      </div>

      {/* Directory Cards */}
      {isLoading ? (
        <div className="text-center py-10 text-slate-400 text-sm">लोड हो रहा है...</div>
      ) : (
        <div className="space-y-4">
          {directory.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-colors space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {item.department}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {item.schemeName}
                  </h3>
                </div>

                <a
                  href={`tel:${item.contactPhone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>कॉल करें ({item.contactPhone})</span>
                </a>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                {item.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>नोडल: <strong>{item.contactPerson}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{item.officeAddress}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
