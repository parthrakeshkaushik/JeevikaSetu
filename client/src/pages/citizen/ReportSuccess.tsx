import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Copy, Check, ArrowRight, Home, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { StatusBadge } from '../../components/StatusBadge.js';

export const ReportSuccess: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const report = (location.state as any)?.report || {
    reportNumber: 'JS-2027-SUP-8411',
    citizenName: 'नागरिक',
    district: 'Supaul',
    block: 'Nirmali',
    village: 'महुवा',
    status: 'SUBMITTED',
    submittedAt: new Date().toISOString(),
    disclaimer: 'यह रिपोर्ट दर्ज हो गई है। यह स्वचालित स्वीकृति या मुआवजे का वादा नहीं है। प्रशासनिक जांच और सत्यापन के बाद अगली कार्रवाई होगी।',
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(report.reportNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-lg mx-auto py-8 px-4 text-center space-y-6">
      {/* Success Icon */}
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm animate-bounce">
        <CheckCircle className="w-12 h-12" />
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {t('reportSuccessTitle')}
        </h1>
        <p className="text-sm text-slate-600 font-medium">
          आपकी आजीविका क्षति रिपोर्ट सफलतापूर्वक दर्ज कर ली गई है।
        </p>
      </div>

      {/* Report ID Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-blue-200 dark:border-blue-900/60 shadow-md space-y-4 text-left">
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {t('reportNumberLabel')}:
        </div>

        <div className="flex items-center justify-between bg-blue-50/80 dark:bg-blue-950/60 p-3.5 rounded-xl border border-blue-200 dark:border-blue-800">
          <span className="text-xl sm:text-2xl font-mono font-extrabold text-blue-900 dark:text-blue-200 tracking-wider">
            {report.reportNumber}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'कॉपी हो गया' : 'कॉपी करें'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-slate-400">नाम:</span>
            <div className="font-semibold text-slate-800 dark:text-slate-100">{report.citizenName}</div>
          </div>
          <div>
            <span className="text-slate-400">स्थान:</span>
            <div className="font-semibold text-slate-800 dark:text-slate-100">{report.village}, {report.district}</div>
          </div>
          <div>
            <span className="text-slate-400">वर्तमान स्थिति:</span>
            <div className="mt-0.5"><StatusBadge status={report.status || 'SUBMITTED'} /></div>
          </div>
          <div>
            <span className="text-slate-400">दिनांक:</span>
            <div className="font-semibold text-slate-800 dark:text-slate-100">
              {new Date(report.submittedAt || Date.now()).toLocaleDateString('hi-IN')}
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
          * {t('keepSafeNote')}
        </p>
      </div>

      {/* Honest Public Declaration */}
      <div className="p-4 bg-slate-100 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs text-left flex items-start gap-2.5">
        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          {t('successHonestDisclaimer')}
        </span>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={() => navigate(`/track?reportNumber=${report.reportNumber}`)}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-base shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>{t('btnTrackNow')}</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <Link
          to="/"
          className="w-full py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>{t('btnBackHome')}</span>
        </Link>
      </div>
    </div>
  );
};
