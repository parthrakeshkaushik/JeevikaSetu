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
    <div className="max-w-lg mx-auto py-8 px-4 text-center space-y-5">
      {/* Success Icon */}
      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-slate-200 dark:border-slate-700">
        <CheckCircle className="w-9 h-9" />
      </div>

      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
          {t('reportSuccessTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-normal">
          आपकी आजीविका क्षति रिपोर्ट प्रशासनिक रिकॉर्ड में दर्ज कर ली गई है।
        </p>
      </div>

      {/* Report ID Dossier Receipt */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3.5 text-left">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {t('reportNumberLabel')}:
        </div>

        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-850 p-3 rounded-lg border border-slate-200 dark:border-slate-750">
          <span className="text-lg sm:text-xl font-mono font-semibold text-blue-800 dark:text-blue-300 tracking-wide">
            {report.reportNumber}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'कॉपी हो गया' : 'कॉपी करें'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-slate-400">नाम:</span>
            <div className="font-medium text-slate-800 dark:text-slate-200">{report.citizenName}</div>
          </div>
          <div>
            <span className="text-slate-400">स्थान:</span>
            <div className="font-medium text-slate-800 dark:text-slate-200">{report.village}, {report.district}</div>
          </div>
          <div>
            <span className="text-slate-400">वर्तमान स्थिति:</span>
            <div className="mt-0.5"><StatusBadge status={report.status || 'SUBMITTED'} /></div>
          </div>
          <div>
            <span className="text-slate-400">दिनांक:</span>
            <div className="font-medium text-slate-800 dark:text-slate-200">
              {new Date(report.submittedAt || Date.now()).toLocaleDateString('hi-IN')}
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          * {t('keepSafeNote')}
        </p>
      </div>

      {/* Honest Public Declaration */}
      <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs text-left flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-blue-700 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          {t('successHonestDisclaimer')}
        </span>
      </div>

      {/* Actions */}
      <div className="space-y-2.5 pt-1">
        <button
          type="button"
          onClick={() => navigate(`/track?reportNumber=${report.reportNumber}`)}
          className="w-full py-2.5 bg-blue-800 hover:bg-blue-900 text-white font-medium rounded-lg text-xs sm:text-sm shadow-2xs transition-colors flex items-center justify-center gap-2"
        >
          <span>{t('btnTrackNow')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <Link
          to="/"
          className="w-full py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>{t('btnBackHome')}</span>
        </Link>
      </div>
    </div>
  );
};
