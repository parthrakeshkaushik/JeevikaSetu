import React, { useState, useEffect } from 'react';
import { History, Shield, Clock, User, Filter, RefreshCw } from 'lucide-react';
import { api } from '../../api/client.js';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAuditLogs();
      if (res.success) setLogs(res.logs || []);
    } catch (e) {
      console.error('Error loading audit logs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            सिस्टम ऑडिट एवं सुरक्षा लॉग्स (Audit Trail)
          </h1>
          <p className="text-xs text-slate-500">
            प्रशासनिक लॉगिन, कार्य आवंटन एवं स्थिति परिवर्तन की संपूर्ण ऑडिट हिस्ट्री
          </p>
        </div>

        <button
          type="button"
          onClick={loadLogs}
          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg text-xs font-medium border border-slate-200 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>रिफ्रेश</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-sm">ऑडिट लॉग्स लोड हो रहे हैं...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">कोई ऑडिट रिकॉर्ड नहीं मिला।</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">समय (Timestamp)</th>
                  <th className="py-3 px-4">कार्रवाई (Action)</th>
                  <th className="py-3 px-4">उपयोगकर्ता / पद</th>
                  <th className="py-3 px-4">विवरण (Details)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('hi-IN')}
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-700">
                      <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{log.userEmail || 'System'}</div>
                      <div className="text-[10px] text-slate-500">{log.userRole || 'ANONYMOUS'}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-sans leading-relaxed">
                      {log.details || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
