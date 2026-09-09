const rawApiUrl = (import.meta.env.VITE_API_URL as string) || '';
const sanitizedApiUrl = rawApiUrl.includes(':5000') 
  ? rawApiUrl.replace(':5000', ':5001') 
  : rawApiUrl;

const API_BASE = sanitizedApiUrl?.replace(/\/+$/, '') || 
  (typeof window !== 'undefined' ? '/api' : 'http://localhost:5001/api');

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  errors?: any[];
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('nitipath_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('nitipath_token', token);
    } else {
      localStorage.removeItem('nitipath_token');
    }
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('nitipath_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const currentToken = this.getToken();
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      return data;
    } catch (error: any) {
      console.warn(`[NitiPath API Warning] ${endpoint} -> ${error.message}`);
      throw error;
    }
  }

  // Auth
  async login(email: string, password = 'demo123') {
    const res = await this.request<ApiResponse<any>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res.data;
  }

  async sendOtp(email: string, type: 'business' | 'officer') {
    return this.request<ApiResponse<any>>('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ email, type }),
    });
  }

  async verifyOtp(params: {
    email: string;
    otp: string;
    type: 'business' | 'officer';
    companyName?: string;
    mobile?: string;
    department?: string;
  }) {
    const res = await this.request<ApiResponse<any>>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res.data;
  }

  async verifySession(accessToken: string, type: 'business' | 'officer', companyName?: string, mobile?: string) {
    const res = await this.request<ApiResponse<any>>('/auth/otp/verify-session', {
      method: 'POST',
      body: JSON.stringify({ accessToken, type, companyName, mobile }),
    });
    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res.data;
  }

  async getMe() {
    return this.request<ApiResponse<any>>('/auth/me');
  }

  // Business Profile
  async getProfile() {
    return this.request<ApiResponse<any>>('/business/profile');
  }

  async updateProfile(profileData: any) {
    return this.request<ApiResponse<any>>('/business/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Business & Application
  async getMyBusinesses() {
    return this.request<ApiResponse<any>>('/businesses/my');
  }

  async getApplications() {
    return this.request<ApiResponse<any>>('/applications');
  }

  async createApplication(data: any) {
    return this.request<ApiResponse<any>>('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getApplicationById(appId: string) {
    return this.request<ApiResponse<any>>(`/applications/${appId}`);
  }

  async getApplicationDashboard(appId: string) {
    return this.request<ApiResponse<any>>(`/applications/${appId}/dashboard`);
  }

  async getDependencyGraph(appId: string) {
    return this.request<ApiResponse<any>>(`/applications/${appId}/graph`);
  }

  async getNextAction(appId: string) {
    return this.request<ApiResponse<any>>(`/applications/${appId}/next-action`);
  }

  async getBottleneck(appId: string) {
    return this.request<ApiResponse<any>>(`/applications/${appId}/bottleneck`);
  }

  async recalculateRisk(appId: string) {
    return this.request<ApiResponse<any>>(`/applications/${appId}/recalculate-risk`, {
      method: 'POST',
    });
  }

  async getCompliance(appId: string) {
    return this.request<ApiResponse<any>>(`/applications/${appId}/compliance`);
  }

  // Documents & Consistency Audit
  async runConsistencyAudit(appId: string) {
    return this.request<ApiResponse<any>>(`/documents/application/${appId}/consistency-audit`);
  }

  async getDocumentsByApplication(appId: string) {
    return this.request<ApiResponse<any>>(`/documents/application/${appId}`);
  }

  async resolveDocumentMismatch(docId: string, resolutionNotes?: string) {
    return this.request<ApiResponse<any>>(`/documents/${docId}/resolve-mismatch`, {
      method: 'POST',
      body: JSON.stringify({ resolutionNotes }),
    });
  }

  // Copilot
  async queryCopilot(applicationId: string, question: string) {
    return this.request<ApiResponse<{ reply: string; sources: string[]; recommendedActions: string[] }>>('/copilot/query', {
      method: 'POST',
      body: JSON.stringify({ applicationId, question }),
    });
  }

  // Admin
  async getAdminDashboard() {
    return this.request<ApiResponse<any>>('/admin/dashboard');
  }

  async getAllApplications(params: { status?: string; riskLevel?: string; search?: string } = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<ApiResponse<any>>(`/admin/applications?${query}`);
  }

  async getAdminApplicationById(appId: string) {
    return this.request<ApiResponse<any>>(`/admin/applications/${appId}`);
  }

  async getAdminRisks() {
    return this.request<ApiResponse<any>>('/admin/risks');
  }

  async getAdminDocuments() {
    return this.request<ApiResponse<any>>('/admin/documents');
  }

  async reviewApproval(approvalId: string, status: string, queryComment?: string, officerNotes?: string) {
    return this.request<ApiResponse<any>>(`/admin/approvals/${approvalId}/review`, {
      method: 'PUT',
      body: JSON.stringify({ status, queryComment, officerNotes }),
    });
  }

  async resolveRisk(riskId: string, resolutionNotes?: string) {
    return this.request<ApiResponse<any>>(`/admin/risks/${riskId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolutionNotes }),
    });
  }

  // Support Schemes
  async getMatchingSchemes(sector = 'Food Processing', investmentCr = 5.0) {
    return this.request<ApiResponse<any>>(`/support/matches?sector=${encodeURIComponent(sector)}&investmentCr=${investmentCr}`);
  }
}

export const api = new ApiClient();
export default api;
