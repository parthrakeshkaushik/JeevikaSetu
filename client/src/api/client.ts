// Typed API Client for JeevikaSetu

const getHeaders = (token?: string | null): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const effectiveToken = token || localStorage.getItem('jeevikasetu_token');
  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
  }
  return headers;
};

export const api = {
  // Public citizen actions
  async submitReport(data: any) {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async trackReport(reportNumber: string, phone?: string) {
    const params = new URLSearchParams({ reportNumber });
    if (phone) params.append('phone', phone);
    const res = await fetch(`/api/reports/track?${params.toString()}`);
    return res.json();
  },

  async getGeography() {
    const res = await fetch('/api/jurisdictions/geography');
    return res.json();
  },

  async getServiceDirectory(district?: string) {
    const url = district ? `/api/jurisdictions/directory?district=${encodeURIComponent(district)}` : '/api/jurisdictions/directory';
    const res = await fetch(url);
    return res.json();
  },

  async extractFromTranscript(transcript: string) {
    const res = await fetch('/api/jurisdictions/ai-extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
    });
    return res.json();
  },

  // Administrative actions
  async getReports(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/reports?${query}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getReportById(id: string) {
    const res = await fetch(`/api/reports/${id}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async updateReportStatus(id: string, status: string, remarks: string) {
    const res = await fetch(`/api/reports/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, remarks }),
    });
    return res.json();
  },

  async assignReport(id: string, assignedUserId: string, remarks: string) {
    const res = await fetch(`/api/reports/${id}/assign`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ assignedUserId, remarks }),
    });
    return res.json();
  },

  async escalateReport(id: string, data: { escalatedToRole: string; reason: string; administrativeNote: string }) {
    const res = await fetch(`/api/reports/${id}/escalate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async recordFollowUp(id: string, data: { programmeType: string; assignedDepartment: string; actionDetails: string; targetDate?: string }) {
    const res = await fetch(`/api/reports/${id}/follow-up`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async submitVerification(data: {
    reportId: string;
    outcome: string;
    fieldNotes: string;
    reasonForDecision: string;
    verifiedCropLossBigha?: number;
    verifiedCattleLost?: number;
    verifiedEquipmentLoss?: string;
    recommendedAction?: string;
  }) {
    const res = await fetch('/api/verification', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getDashboardAnalytics(district?: string, block?: string) {
    const params = new URLSearchParams();
    if (district) params.append('district', district);
    if (block) params.append('block', block);
    const res = await fetch(`/api/analytics/dashboard?${params.toString()}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getVolunteers(block?: string) {
    const query = block ? `?block=${encodeURIComponent(block)}` : '';
    const res = await fetch(`/api/users/volunteers${query}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getAuditLogs() {
    const res = await fetch('/api/users/audit-logs', {
      headers: getHeaders(),
    });
    return res.json();
  },
};
