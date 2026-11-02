import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  HelpCircle,
  UserCheck,
  Building,
  Volume2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { useAccessibility } from '../../context/AccessibilityContext.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { AudioPlayerButton } from '../../components/AudioPlayerButton.js';
import { api } from '../../api/client.js';

export const TrackReport: React.FC = () => {
  const { t, language } = useLanguage();
  const { speakText } = useAccessibility();
  const [searchParams] = useSearchParams();

  const [reportNumber, setReportNumber] = useState<string>(
    searchParams.get('reportNumber') || ''
  );
  const [phone, setPhone] = useState<string>('');
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialId = searchParams.get('reportNumber');
    if (initialId) {
      handleSearch(initialId);
    }
  }, [searchParams]);

  const handleSearch = async (targetId?: string) => {
    const queryId = (targetId || reportNumber).trim().toUpperCase();
    if (!queryId) {
      setError('कृपया रिपोर्ट संख्या दर्ज करें (Report ID required)');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await api.trackReport(queryId, phone.trim() || undefined);
      if (res.success && res.report) {
        setReport(res.report);
      } else {
        setError(res.message || 'इस संख्या से कोई रिपोर्ट नहीं मिली। कृपया पुनः जांचें।');
      }
    } catch (e: any) {
      setError('सर्वर से संपर्क नहीं हो सका। कृपया इंटरनेट जांचें।');
    } finally {
      setIsLoading(false);
    }
  };

  // Timeline steps
  const getTimelineSteps = (status: string) => {
    const steps = [
      {
        titleHi: 'रिपोर्ट प्राप्त हुई',
        descHi: 'नागरिक द्वारा प्रस्तुत विवरण प्रशासनिक सर्वर में दर्ज हुआ।',
        done: true,
      },
      {
        titleHi: 'प्रशासनिक समीक्षा एवं आवंटन',
        descHi: 'प्रखंड कार्यालय द्वारा रिपोर्ट की जांच कर क्षेत्र सत्यापन हेतु आवंटित किया गया।',
        done: [
          'ASSIGNED_FOR_VERIFICATION',
          'VERIFICATION_IN_PROGRESS',
          'VERIFIED',
          'PARTIALLY_VERIFIED',
          'REFERRED_FOR_RECOVERY',
          'FOLLOWUP_IN_PROGRESS',
          'ACTION_RECORDED',
          'CLOSED',
        ].includes(status),
      },
      {
        titleHi: 'भौतिक क्षेत्र सत्यापन (Field Verification)',
        descHi: 'ऑन-ग्राउंड स्वयंसेवक द्वारा स्थल निरीक्षण एवं क्षति की पुष्टि।',
        done: [
          'VERIFIED',
          'PARTIALLY_VERIFIED',
          'REFERRED_FOR_RECOVERY',
          'FOLLOWUP_IN_PROGRESS',
          'ACTION_RECORDED',
          'CLOSED',
        ].includes(status),
      },
      {
        titleHi: 'आजीविका पुनर्प्राप्ति योजना अग्रेषण',
        descHi: 'जीविका, पशुपालन, कृषि अथवा मनरेगा पुनर्स्थापना हेतु अनुशंसित।',
        done: [
          'REFERRED_FOR_RECOVERY',
          'FOLLOWUP_IN_PROGRESS',
          'ACTION_RECORDED',
          'CLOSED',
        ].includes(status),
      },
      {
        titleHi: 'कार्रवाई दर्ज / निस्तारण',
        descHi: 'पुनर्प्राप्ति सहायता या प्रशासनिक कार्रवाई आधिकारिक रूप से दर्ज।',
        done: ['ACTION_RECORDED', 'CLOSED'].includes(status),
      },
    ];

    return steps;
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">{t('trackTitle')}</h1>
        <p className="text-xs sm:text-sm text-slate-600">{t('trackSubtitle')}</p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              रिपोर्ट संख्या (Report ID) *
            </label>
            <input
              type="text"
              value={reportNumber}
              onChange={(e) => setReportNumber(e.target.value)}
              placeholder="उदा. JS-2027-SUP-8411"
              className="w-full p-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100 rounded-lg text-xs sm:text-sm font-mono uppercase focus:ring-2 focus:ring-blue-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              मोबाइल नंबर (वैकल्पिक)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10 अंक"
              className="w-full p-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100 rounded-lg text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-800 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleSearch()}
          disabled={isLoading}
          className="w-full py-2.5 bg-blue-800 hover:bg-blue-900 text-white font-medium rounded-lg text-xs sm:text-sm shadow-2xs transition-colors flex items-center justify-center gap-2"
        >
          <Search className="w-3.5 h-3.5" />
          <span>{isLoading ? 'खोज रहे हैं...' : t('btnCheck')}</span>
        </button>

        {/* Quick Demo ID pills for rapid testing by judges */}
        <div className="pt-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-normal">नमूना रिपोर्ट आईडी: </span>
          <div className="inline-flex flex-wrap gap-1.5 mt-1">
            {['JS-2027-SUP-8411', 'JS-2027-SUP-8412', 'JS-2027-DAR-7102'].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setReportNumber(id);
                  handleSearch(id);
                }}
                className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono text-[11px] rounded border border-slate-200 dark:border-slate-700"
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Report Result Timeline */}
      {report && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs p-5 space-y-5">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-mono font-semibold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                {report.reportNumber}
              </span>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mt-1.5">{report.citizenName}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                {report.village}, {report.panchayat}, {report.block}, {report.district}
              </p>
            </div>
            <StatusBadge status={report.status} />
          </div>

          {/* Current Status Message in simple language */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
              वर्तमान स्थिति:
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
              {report.statusMessage[language] || report.statusMessage.hi}
            </p>
            <div className="mt-2.5">
              <AudioPlayerButton
                textToSpeak={report.statusMessage[language] || report.statusMessage.hi}
                label="स्थिति सुनें"
              />
            </div>
          </div>

          {/* Recorded Voice Note Playback */}
          {report.audioSimulationUrl && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  आपकी दर्ज की गई आवाज:
                </span>
                <span className="text-[11px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium px-2 py-0.5 rounded">
                  ऑडियो रिकॉर्डिंग
                </span>
              </div>
              <audio controls src={report.audioSimulationUrl} className="w-full mt-1 rounded" />
            </div>
          )}

          {/* Transparent Progress Timeline */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              प्रक्रिया एवं प्रगति (Progress Timeline)
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {getTimelineSteps(report.status).map((step, idx) => (
                <div key={idx} className="relative">
                  {/* Step Dot */}
                  <div
                    className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                      step.done
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {step.done && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>

                  <div className="text-left">
                    <div
                      className={`text-xs sm:text-sm font-bold ${
                        step.done ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {step.titleHi}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {step.descHi}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Outcome Box if verified */}
          {report.verificationOutcome && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>भौतिक क्षेत्र सत्यापन निष्कर्ष: {report.verificationOutcome}</span>
              </div>
              <p className="text-emerald-700 mt-1">
                स्थानीय स्वयंसेवक द्वारा स्थल निरीक्षण के उपरांत रिपोर्ट सत्यापित की गई है।
              </p>
            </div>
          )}

          {/* Privacy Note */}
          <p className="text-[10px] text-slate-400 border-t border-slate-100 pt-3">
            * सुरक्षा एवं गोपनीयता कारणों से आंतरिक प्रशासनिक टिप्पणियां व दस्तावेज नागरिक इंटरफेस पर प्रदर्शित नहीं किए जाते।
          </p>
        </div>
      )}
    </div>
  );
};
