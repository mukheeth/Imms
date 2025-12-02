const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8082';

export interface Authorization {
  id?: number;
  claimNumber: string;
  claimantName: string;
  dateOfBirth: string;
  injuryDate: string;
  injuryDescription: string;
  providerName: string;
  providerType: string;
  providerAddress: string;
  treatmentType: string;
  numberOfSessions: number;
  startDate: string;
  endDate: string;
  treatmentJustification: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  authorizationLevel: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Claim {
  id?: number;
  invoiceId: string;
  provider: string;
  claimant: string;
  date: string;
  amount: number;
  validationStatus: 'PASSED' | 'FAILED' | 'CHECKED' | 'PENDING';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED' | 'PENDING REVIEW';
  rejectionReasons?: string[];
}

export interface Communication {
  id?: number;
  type: 'EMAIL' | 'SMS' | 'CALL';
  recipient: string;
  subject: string;
  message: string;
  status: 'SENT' | 'PENDING' | 'FAILED';
  createdAt: string;
}

export interface MedicalAdvisory {
  id?: number;
  caseId: string;
  patientName: string;
  condition: string;
  advisoryType: string;
  recommendations: string;
  status: 'PENDING' | 'REVIEWED' | 'APPROVED';
  createdAt: string;
}

export interface PharmacyBenefit {
  id?: number;
  patientId: string;
  medicationName: string;
  dosage: string;
  quantity: number;
  cost: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface SeriousInjuryAssessment {
  id?: number;
  caseId: string;
  patientName: string;
  injuryType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assessmentDate: string;
  recommendations: string;
  status: 'PENDING' | 'ASSESSED' | 'APPROVED' | 'REJECTED';
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Authorization APIs
  async createAuthorization(auth: Authorization): Promise<Authorization> {
    return this.request<Authorization>('/authorizations/create', {
      method: 'POST',
      body: JSON.stringify(auth),
    });
  }

  async getAllAuthorizations(): Promise<Authorization[]> {
    return this.request<Authorization[]>('/authorizations');
  }

  async getAuthorizationById(id: number): Promise<Authorization> {
    return this.request<Authorization>(`/authorizations/${id}`);
  }

  async updateAuthorization(id: number, auth: Partial<Authorization>): Promise<Authorization> {
    return this.request<Authorization>(`/authorizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(auth),
    });
  }

  async deleteAuthorization(id: number): Promise<void> {
    await this.request(`/authorizations/${id}`, {
      method: 'DELETE',
    });
  }

  // Claims APIs
  async getAllClaims(): Promise<Claim[]> {
    return this.request<Claim[]>('/claims');
  }

  async getClaimById(id: number): Promise<Claim> {
    return this.request<Claim>(`/claims/${id}`);
  }

  async updateClaimStatus(id: number, status: string, reasons?: string[]): Promise<Claim> {
    return this.request<Claim>(`/claims/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejectionReasons: reasons }),
    });
  }

  // Communication APIs
  async getAllCommunications(): Promise<Communication[]> {
    return this.request<Communication[]>('/communications');
  }

  async sendCommunication(comm: Omit<Communication, 'id' | 'createdAt'>): Promise<Communication> {
    return this.request<Communication>('/communications/send', {
      method: 'POST',
      body: JSON.stringify(comm),
    });
  }

  // Medical Advisory APIs
  async getAllMedicalAdvisories(): Promise<MedicalAdvisory[]> {
    return this.request<MedicalAdvisory[]>('/medical-advisories');
  }

  async createMedicalAdvisory(advisory: Omit<MedicalAdvisory, 'id' | 'createdAt'>): Promise<MedicalAdvisory> {
    return this.request<MedicalAdvisory>('/medical-advisories', {
      method: 'POST',
      body: JSON.stringify(advisory),
    });
  }

  // Pharmacy Benefit APIs
  async getAllPharmacyBenefits(): Promise<PharmacyBenefit[]> {
    return this.request<PharmacyBenefit[]>('/pharmacy-benefits');
  }

  async updatePharmacyBenefitStatus(id: number, status: string): Promise<PharmacyBenefit> {
    return this.request<PharmacyBenefit>(`/pharmacy-benefits/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Serious Injury Assessment APIs
  async getAllSeriousInjuryAssessments(): Promise<SeriousInjuryAssessment[]> {
    return this.request<SeriousInjuryAssessment[]>('/serious-injury-assessments');
  }

  async createSeriousInjuryAssessment(assessment: Omit<SeriousInjuryAssessment, 'id'>): Promise<SeriousInjuryAssessment> {
    return this.request<SeriousInjuryAssessment>('/serious-injury-assessments', {
      method: 'POST',
      body: JSON.stringify(assessment),
    });
  }

  // Dashboard APIs
  async getDashboardStats(): Promise<{
    totalCases: number;
    pendingAuthorizations: number;
    approvedClaims: number;
    rejectedClaims: number;
    totalCost: number;
  }> {
    return this.request('/dashboard/stats');
  }
}

export const apiService = new ApiService();
