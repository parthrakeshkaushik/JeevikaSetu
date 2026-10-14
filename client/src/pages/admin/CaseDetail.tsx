import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  UserCheck,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Send,
  ArrowLeft,
  Clock,
  Sparkles,
  PhoneCall,
  Shield,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { PriorityBadge } from '../../components/PriorityBadge.js';
import { AudioPlayerButton } from '../../components/AudioPlayerButton.js';
import { api } from '../../api/client.js';

export const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [report, setReport] = useState<any>(null);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [showEscalateModal, setShowEscalateModal] = useState<boolean>(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState<boolean>(false);

  // Form states for modals
  const [verifyOutcome, setVerifyOutcome] = useState<string>('VERIFIED');
  const [verifyNotes, setVerifyNotes] = useState<string>('');
  const [verifyReason, setVerifyReason] = useState<string>('');
  const [verifyCropBigha, setVerifyCropBigha] = useState<string>('');
  const [verifyCattleLost, setVerifyCattleLost] = useState<string>('');
  const [verifyRecommendation, setVerifyRecommendation] = useState<string>('');

  const [assigneeId, setAssigneeId] = useState<string>('');
  const [assignRemarks, setAssignRemarks] = useState<string>('');

  const [escalateToRole, setEscalateToRole] = useState<'SDM' | 'ADM' | 'DM'>('ADM');
  const [escalateReason, setEscalateReason] = useState<string>('OVERDUE_VERIFICATION');
  const [escalateNote, setEscalateNote] = useState<string>('');

  const [programmeType, setProgrammeType] = useState<string>('JEEVIKA_SHG');
  const [assignedDept, setAssignedDept] = useState<string>('JEEViKA SRLM');
  const [actionDetails, setActionDetails] = useState<string>('');

  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadReport();
    }
  }, [id, user]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const res = await api.getReportById(id!);
      if (res.success && res.report) {
        setReport(res.report);

        // Preload available volunteers for assignment if supervisor
        if (['BDO', 'DDC', 'SDM', 'ADM', 'DM', 'SYSTEM_ADMIN'].includes(user?.role || '')) {
          const vRes = await api.getVolunteers(res.report.block);
          if (vRes.success && vRes.volunteers) {
            setVolunteers(vRes.volunteers);
            if (vRes.volunteers.length > 0) setAssigneeId(vRes.volunteers[0].id);
          }
        }
      } else {
        setError(res.message || 'रिपोर्ट लोड नहीं हो सकी');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Field Verification (Volunteer action)
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.submitVerification({
        reportId: report.id,
        outcome: verifyOutcome,
        fieldNotes: verifyNotes,
        reasonForDecision: verifyReason,
        verifiedCropLossBigha: verifyCropBigha ? parseFloat(verifyCropBigha) : undefined,
        verifiedCattleLost: verifyCattleLost ? parseInt(verifyCattleLost) : undefined,
        recommendedAction: verifyRecommendation,
      });

      if (res.success) {
        setActionSuccessMessage('भौतिक क्षेत्र सत्यापन सफलतापूर्वक दर्ज कर लिया गया!');
        setShowVerifyModal(false);
        loadReport();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Assign Volunteer (BDO / Supervisor action)
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.assignReport(report.id, assigneeId, assignRemarks);
      if (res.success) {
        setActionSuccessMessage('मामला नामित अधिकारी/स्वयंसेवक को आवंटित किया गया!');
        setShowAssignModal(false);
        loadReport();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Escalate (Supervisor action)
  const handleEscalateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.escalateReport(report.id, {
        escalatedToRole: escalateToRole,
        reason: escalateReason as any,
        administrativeNote: escalateNote,
      });
      if (res.success) {
        setActionSuccessMessage(`मामला ${escalateToRole} को सफलतापूर्वक एस्केलेट किया गया!`);
        setShowEscalateModal(false);
        loadReport();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Record Recovery Follow-up Action
  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.recordFollowUp(report.id, {
        programmeType: programmeType as any,
        assignedDepartment: assignedDept,
        actionDetails,
      });
      if (res.success) {
        setActionSuccessMessage('पुनर्प्राप्ति अनुवर्ती सहायता दर्ज की गई!');
        setShowFollowUpModal(false);
        loadReport();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-slate-400">मामला डोजियर लोड हो रहा है...</div>;
  }

  if (error || !report) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
        {error || 'मामला नहीं मिला'}
      </div>
    );
  }

  const isVolunteer = user?.role === 'VOLUNTEER';
  const isSupervisor = ['BDO', 'DDC', 'SDM', 'ADM', 'DM', 'SYSTEM_ADMIN'].includes(user?.role || '');

  return (
    <div className="space-y-6">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/admin/cases"
          className="text-xs text-slate-600 hover:text-blue-600 flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>मामले सूची पर वापस जाएं</span>
        </Link>

        {actionSuccessMessage && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 animate-pulse">
            ✓ {actionSuccessMessage}
          </span>
        )}
      </div>

      {/* Main Dossier Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-mono font-extrabold text-blue-900">
                {report.reportNumber}
              </span>
              <StatusBadge status={report.status} />
              <PriorityBadge
                score={report.priorityScore}
                level={report.priorityLevel}
                rationale={report.priorityRationale}
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {report.citizenName}
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{report.village}, {report.panchayat}, प्रखंड: <strong>{report.block}</strong>, जिला: <strong>{report.district}</strong></span>
              <span className="text-slate-300">|</span>
              <span className="font-mono">{report.citizenPhone}</span>
            </p>
          </div>

          {/* Action Buttons based on Role */}
          <div className="flex flex-wrap gap-2">
            {/* Volunteer Field Verification Button */}
            {isVolunteer && (
              <button
                type="button"
                onClick={() => setShowVerifyModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>भौतिक सत्यापन दर्ज करें (Verify)</span>
              </button>
            )}

            {/* BDO / Supervisor Assign Volunteer Button */}
            {isSupervisor && (
              <button
                type="button"
                onClick={() => setShowAssignModal(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" />
                <span>स्वयंसेवक को सौंपें (Assign)</span>
              </button>
            )}

            {/* Escalate Button */}
            {isSupervisor && (
              <button
                type="button"
                onClick={() => setShowEscalateModal(true)}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>एस्केलेट करें (Escalate)</span>
              </button>
            )}

            {/* Follow-up Recovery Action */}
            {isSupervisor && (
              <button
                type="button"
                onClick={() => setShowFollowUpModal(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>पुनर्प्राप्ति योजना (Recovery)</span>
              </button>
            )}
          </div>
        </div>

        {/* Direct Citizen Voice Recording Player */}
        {report.audioSimulationUrl && (
          <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                नागरिक का मूल वॉइस संदेश (Original Citizen Voice Recording):
              </span>
              <span className="text-[11px] bg-emerald-200 text-emerald-950 font-bold px-2 py-0.5 rounded">
                🔴 लाइव ऑडियो उपलब्ध
              </span>
            </div>
            <audio controls src={report.audioSimulationUrl} className="w-full mt-1 rounded-lg" />
            <p className="text-[11px] text-emerald-800 italic">
              * अधिकारी नागरिक द्वारा फील्ड से रिकॉर्ड की गई वास्तविक आवाज यहाँ सुन सकते हैं।
            </p>
          </div>
        )}

        {/* Citizen Statement & Original Voice Transcript */}
        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              नागरिक द्वारा प्रस्तुत मूल बयान (Confirmed Loss Statement):
            </span>
            <AudioPlayerButton
              textToSpeak={report.confirmedTranscript}
              label="बयान सुनें"
            />
          </div>
          <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed font-sans">
            "{report.confirmedTranscript}"
          </p>
          {report.rawTranscript && report.rawTranscript !== report.confirmedTranscript && (
            <p className="text-[11px] text-slate-500 italic pt-1 border-t border-blue-200/60">
              * मूल कच्चा ऑडियो ट्रांसक्रिप्ट: "{report.rawTranscript}"
            </p>
          )}
        </div>

        {/* AI Categorization & Explainable Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>प्रभावित आजीविका श्रेणियां:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {report.livelihoodCategories?.map((cat: string) => (
                <span
                  key={cat}
                  className="px-2.5 py-1 bg-blue-100 text-blue-800 font-semibold rounded-md text-xs"
                >
                  ✓ {cat}
                </span>
              ))}
            </div>
            {report.estimatedLossAmount && (
              <div className="text-[11px] text-slate-600 pt-1">
                स्व-रिपोर्टेड अनुमान: <strong>₹{report.estimatedLossAmount.toLocaleString('en-IN')}</strong> (ऐच्छिक)
              </div>
            )}
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-700">पारदर्शी प्राथमिकता विश्लेषण:</div>
            <div className="text-slate-700 leading-relaxed font-sans">
              {report.priorityRationale || 'सामान्य प्राथमिकता'}
            </div>
            <div className="text-[10px] text-slate-400 italic">
              * यह प्राथमिकता स्कोर मानवीय निर्णय सहयोग हेतु है।
            </div>
          </div>
        </div>
      </div>

      {/* Field Verification Details Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>भौतिक क्षेत्र सत्यापन आख्या (Field Inspection Records)</span>
        </h2>

        {report.verificationRecords?.length > 0 ? (
          <div className="space-y-3">
            {report.verificationRecords.map((v: any) => (
              <div
                key={v.id}
                className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-emerald-900">
                  <span>सत्यापन निष्कर्ष: {v.outcome}</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    सत्यापनकर्ता: {v.verifiedByUser?.fullName} ({v.verifiedRole}) • {new Date(v.createdAt).toLocaleDateString('hi-IN')}
                  </span>
                </div>

                <div className="text-slate-800 leading-relaxed">
                  <strong>फील्ड अवलोकन:</strong> {v.fieldObservations}
                </div>

                <div className="text-slate-700">
                  <strong>निर्णय का कारण:</strong> {v.reasonForDecision}
                </div>

                {v.recommendedAction && (
                  <div className="text-blue-900 font-semibold pt-1 border-t border-emerald-200/60">
                    अनुशंसित आजीविका सहायता: {v.recommendedAction}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-xs text-slate-500 text-center">
            इस मामले का भौतिक क्षेत्र सत्यापन अभी लंबित है।
          </div>
        )}
      </div>

      {/* Recovery Follow-up Actions Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Send className="w-4 h-4 text-indigo-600" />
          <span>आजीविका पुनर्प्राप्ति एवं अनुवर्ती कार्रवाई (Recovery Actions)</span>
        </h2>

        {report.followUpActions?.length > 0 ? (
          <div className="space-y-2.5">
            {report.followUpActions.map((f: any) => (
              <div
                key={f.id}
                className="p-3.5 bg-indigo-50/60 border border-indigo-200 rounded-xl text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-bold text-indigo-900">
                  <span>{f.assignedDepartment} ({f.programmeType})</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-200 text-indigo-900 text-[10px]">
                    {f.status}
                  </span>
                </div>
                <p className="text-slate-800">{f.actionDetails}</p>
                <div className="text-[10px] text-slate-500">
                  अधिकारी: {f.recordedByUser?.fullName} • {new Date(f.createdAt).toLocaleDateString('hi-IN')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-xs text-slate-500 text-center">
            पुनर्प्राप्ति योजना अभी अग्रेषित नहीं हुई है।
          </div>
        )}
      </div>

      {/* Audit Trail & History */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>मामला ऑडिट ट्रेल एवं समय-सीमा (Audit Timeline)</span>
        </h2>

        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {report.workflowEvents?.map((ev: any) => (
            <div key={ev.id} className="relative text-xs">
              <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 border border-white"></span>
              <div className="font-bold text-slate-800">
                {ev.action} • {ev.actorName} ({ev.actorRole})
              </div>
              <p className="text-slate-600 mt-0.5 font-sans">{ev.remarks}</p>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {new Date(ev.createdAt).toLocaleString('hi-IN')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: Volunteer Field Verification Form */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900">
              भौतिक क्षेत्र सत्यापन प्रतिवेदन (Field Verification)
            </h3>

            <form onSubmit={handleVerifySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">सत्यापन निष्कर्ष *</label>
                <select
                  value={verifyOutcome}
                  onChange={(e) => setVerifyOutcome(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-semibold bg-slate-50"
                >
                  <option value="VERIFIED">सत्यापित (VERIFIED) - दावा पूर्णतः सही</option>
                  <option value="PARTIALLY_VERIFIED">आंशिक सत्यापित (PARTIALLY_VERIFIED)</option>
                  <option value="UNABLE_TO_VERIFY">सत्यापन असमर्थ (UNABLE_TO_VERIFY)</option>
                  <option value="ADDITIONAL_INFO_REQUIRED">अतिरिक्त जानकारी चाहिए</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  स्थल निरीक्षण टिप्पणी (Field Notes) *
                </label>
                <textarea
                  rows={3}
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="मौके पर पहुंचकर देखा गया..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  निर्णय का कारण (Decision Rationale) *
                </label>
                <input
                  type="text"
                  value={verifyReason}
                  onChange={(e) => setVerifyReason(e.target.value)}
                  placeholder="स्थानीय मुखिया व पड़ोसियों से पुष्टि उपरांत..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    सत्यापित फसल क्षति (बीघा)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={verifyCropBigha}
                    onChange={(e) => setVerifyCropBigha(e.target.value)}
                    placeholder="उदा. 2.0"
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    मृत/लापता मवेशी संख्या
                  </label>
                  <input
                    type="number"
                    value={verifyCattleLost}
                    onChange={(e) => setVerifyCattleLost(e.target.value)}
                    placeholder="उदा. 0"
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  अनुशंसित पुनर्प्राप्ति सहायता
                </label>
                <input
                  type="text"
                  value={verifyRecommendation}
                  onChange={(e) => setVerifyRecommendation(e.target.value)}
                  placeholder="पशुचारा शिविर से भूसा एवं कृषि आकस्मिक बीज मिनीकिट..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg font-semibold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold shadow-xs"
                >
                  सत्यापन जमा करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Assignment to Volunteer */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              ऑन-ग्राउंड स्वयंसेवक को मामला आवंटित करें
            </h3>

            <form onSubmit={handleAssignSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  नामित स्वयंसेवक / अधिकारी चुनें *
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-semibold bg-slate-50"
                  required
                >
                  {volunteers.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.fullName} ({v.phone || 'Volunteer'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  आवंटन निर्देश / टिप्पणी *
                </label>
                <textarea
                  rows={2}
                  value={assignRemarks}
                  onChange={(e) => setAssignRemarks(e.target.value)}
                  placeholder="कृपया 24 घंटे के अंदर मौके पर जाकर फसल व पशु क्षति की पुष्टि करें..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg font-semibold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-xs"
                >
                  आवंटन सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Escalation */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              उच्चाधिकारी को मामला एस्केलेट करें
            </h3>

            <form onSubmit={handleEscalateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">किस अधिकारी को भेजें *</label>
                <select
                  value={escalateToRole}
                  onChange={(e) => setEscalateToRole(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-semibold bg-slate-50"
                >
                  <option value="SDM">SDM (अनुमंडल दंडाधिकारी)</option>
                  <option value="ADM">ADM (अपर समाहर्ता - आपदा राहत)</option>
                  <option value="DM">DM (जिलाधिकारी)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">एस्केलेशन का कारण *</label>
                <select
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-semibold bg-slate-50"
                >
                  <option value="OVERDUE_VERIFICATION">सत्यापन समय-सीमा समाप्त (Overdue)</option>
                  <option value="SEVERE_VULNERABILITY">गंभीर मानवीय संकट / एकल महिला</option>
                  <option value="UNRESOLVED_BOTTLENECK">विभागीय समन्वय में गतिरोध</option>
                  <option value="PUBLIC_REPRESENTATION">जनप्रतिनिधि / जन-शिकायत संज्ञान</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">प्रशासनिक निर्देश टिप्पणी *</label>
                <textarea
                  rows={3}
                  value={escalateNote}
                  onChange={(e) => setEscalateNote(e.target.value)}
                  placeholder="एस्केलेशन का विवरण लिखें..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEscalateModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg font-semibold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg font-bold shadow-xs"
                >
                  एस्केलेट करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Recovery Scheme Follow-up */}
      {showFollowUpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              आजीविका पुनर्प्राप्ति योजना अग्रेषित करें
            </h3>

            <form onSubmit={handleFollowUpSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">पुनर्प्राप्ति योजना चुनें *</label>
                <select
                  value={programmeType}
                  onChange={(e) => {
                    setProgrammeType(e.target.value);
                    if (e.target.value === 'JEEVIKA_SHG') setAssignedDept('JEEViKA SRLM');
                    else if (e.target.value === 'ANIMAL_HUSBANDRY_CAMP') setAssignedDept('Animal Husbandry Dept');
                    else if (e.target.value === 'SEED_INPUT_SUBSIDY') setAssignedDept('Agriculture Dept');
                    else if (e.target.value === 'MGNREGA_JOB_DEMAND') setAssignedDept('Rural Development');
                  }}
                  className="w-full p-2 border border-slate-300 rounded-lg font-semibold bg-slate-50"
                >
                  <option value="JEEVIKA_SHG">जीविका स्वयं सहायता समूह आपात ऋण (JEEViKA)</option>
                  <option value="ANIMAL_HUSBANDRY_CAMP">पशुचारा शिविर एवं पशु स्वास्थ्य सहायता</option>
                  <option value="SEED_INPUT_SUBSIDY">कृषि आकस्मिक फसल बीज मिनीकिट अनुदान</option>
                  <option value="MGNREGA_JOB_DEMAND">मनरेगा अकुशल रोजगार मस्टर रोल मांग</option>
                  <option value="MICRO_CREDIT_RECOVERY">लघु व्यवसाय / गुमटी पुनर्स्थापना ऋण</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">संबंधित विभाग</label>
                <input
                  type="text"
                  value={assignedDept}
                  onChange={(e) => setAssignedDept(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">कार्रवाई विवरण *</label>
                <textarea
                  rows={3}
                  value={actionDetails}
                  onChange={(e) => setActionDetails(e.target.value)}
                  placeholder="सहायता योजना के तहत स्वीकृत कार्रवाई का विवरण..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFollowUpModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg font-semibold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-xs"
                >
                  कार्रवाई सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
