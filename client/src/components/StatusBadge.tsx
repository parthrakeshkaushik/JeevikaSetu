import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const statusConfig: Record<string, { labelHi: string; labelEn: string; bg: string; text: string; border: string }> = {
    SUBMITTED: {
      labelHi: 'दर्ज (प्राथमिक)',
      labelEn: 'Submitted',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
    AWAITING_REVIEW: {
      labelHi: 'समीक्षा लंबित',
      labelEn: 'Awaiting Review',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
    },
    ASSIGNED_FOR_VERIFICATION: {
      labelHi: 'सत्यापन आवंटित',
      labelEn: 'Assigned for Verification',
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      border: 'border-purple-200',
    },
    VERIFICATION_IN_PROGRESS: {
      labelHi: 'सत्यापन प्रगति पर',
      labelEn: 'Verification in Progress',
      bg: 'bg-indigo-50',
      text: 'text-indigo-800',
      border: 'border-indigo-200',
    },
    VERIFIED: {
      labelHi: 'सत्यापित (पुष्टि)',
      labelEn: 'Verified',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-300',
    },
    PARTIALLY_VERIFIED: {
      labelHi: 'आंशिक सत्यापित',
      labelEn: 'Partially Verified',
      bg: 'bg-teal-50',
      text: 'text-teal-800',
      border: 'border-teal-200',
    },
    UNABLE_TO_VERIFY: {
      labelHi: 'सत्यापन असमर्थ',
      labelEn: 'Unable to Verify',
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-300',
    },
    ADDITIONAL_INFO_REQUIRED: {
      labelHi: 'अतिरिक्त सूचना वांछित',
      labelEn: 'Info Required',
      bg: 'bg-orange-50',
      text: 'text-orange-800',
      border: 'border-orange-200',
    },
    REFERRED_FOR_RECOVERY: {
      labelHi: 'पुनर्प्राप्ति अग्रसारित',
      labelEn: 'Referred for Recovery',
      bg: 'bg-sky-50',
      text: 'text-sky-800',
      border: 'border-sky-300',
    },
    FOLLOWUP_IN_PROGRESS: {
      labelHi: 'अनुवर्ती कार्रवाई जारी',
      labelEn: 'Follow-up Active',
      bg: 'bg-cyan-50',
      text: 'text-cyan-800',
      border: 'border-cyan-300',
    },
    ACTION_RECORDED: {
      labelHi: 'कार्रवाई दर्ज',
      labelEn: 'Action Recorded',
      bg: 'bg-green-50',
      text: 'text-green-800',
      border: 'border-green-300',
    },
    CLOSED: {
      labelHi: 'निस्तारित / बंद',
      labelEn: 'Closed',
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-300',
    },
    REOPENED: {
      labelHi: 'पुनः खोला गया',
      labelEn: 'Reopened',
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-300',
    },
  };

  const conf = statusConfig[status] || {
    labelHi: status,
    labelEn: status,
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${conf.bg} ${conf.text} ${conf.border} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75"></span>
      {conf.labelHi}
    </span>
  );
};
