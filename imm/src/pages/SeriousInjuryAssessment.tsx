import React, { useState, useEffect } from 'react';
import { apiService, SeriousInjuryAssessment } from '../services/api';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8082';
const HOSPITAL_CASE_API = process.env.REACT_APP_HOSPITAL_CASE_API || 'http://localhost:5052';
const DISCHARGE_API = process.env.REACT_APP_DISCHARGE_API || 'http://localhost:5053';

const DISCHARGE_PLAN_KEY = 'imms.dischargePlan';
const DISCHARGE_CONTEXT_KEY = 'imms.dischargePlanContext';
const DISCHARGE_META_KEY = 'imms.dischargePlanMeta';

const ICD10_PATTERN = /^[A-Z][0-9]{2}(\.[A-Z0-9]{1,4})?$/;

const normalizeIcdCode = (icdCode: string) => {
  if (!icdCode) return '';
  const trimmed = icdCode.replace(/\s+/g, '').toUpperCase();
  if (ICD10_PATTERN.test(trimmed)) {
    return trimmed;
  }
  const alphanumeric = trimmed.replace(/[^A-Z0-9]/gi, '');
  if (ICD10_PATTERN.test(alphanumeric)) {
    return alphanumeric;
  }
  if (/^[A-Z][0-9]{3,6}$/.test(alphanumeric)) {
    const prefix = alphanumeric.slice(0, 3);
    const suffix = alphanumeric.slice(3);
    const candidate = suffix ? `${prefix}.${suffix}` : prefix;
    if (ICD10_PATTERN.test(candidate)) {
      return candidate;
    }
  }
  return '';
};

const INJURY_TO_ICD_MAP: Record<string, string> = {
  fracture: 'S72.001',
  brain: 'S06.9',
  spinal: 'S14.109',
  amputation: 'S88.919',
  burns: 'T30.0',
  stroke: 'I63.9',
  amenorrhea: 'N91.0',
  trauma: 'T14.90',
};

const deriveSecondaryDiagnoses = (injuryType: string | undefined, primaryIcd: string) => {
  const codes = new Set<string>();
  const normalized = (injuryType || '').toLowerCase();
  Object.entries(INJURY_TO_ICD_MAP).forEach(([key, code]) => {
    if (normalized.includes(key) && code !== primaryIcd) {
      codes.add(code);
    }
  });
  codes.add('Z74.09');
  codes.add('Z78.9');
  return Array.from(codes);
};

const buildClinicalNarrative = (assessment: SeriousInjuryAssessment | null) => {
  if (!assessment) {
    return 'Patient requires discharge planning support following hospitalization. Functional status and social supports require evaluation.';
  }
  const name = assessment.patientName || 'The patient';
  const injury = assessment.injuryType || 'injury';
  const severity = assessment.severity || 'moderate';
  const recommendation = assessment.recommendations || 'Further multidisciplinary review recommended.';
  return `${name} is being evaluated for discharge following ${injury}. Severity is classified as ${severity}. Key clinical considerations include: ${recommendation}`;
};

const defaultPlanContext = (assessment: SeriousInjuryAssessment | null, icdCode: string) => {
  const clinicalSummary = buildClinicalNarrative(assessment);
  const secondaryDiagnoses = deriveSecondaryDiagnoses(assessment?.injuryType, icdCode);
  return {
    patientId: assessment?.caseId || '',
    icdCode: icdCode || '',
    secondaryDiagnoses: secondaryDiagnoses.join(', '),
    currentFunctionalStatus: clinicalSummary,
    socialSupport: `${assessment?.patientName || 'Patient'} lives with immediate family who can provide moderate support during recovery.`,
    insuranceType: 'RAF Medical Benefit Scheme',
  };
};

const buildDischargePlanPayload = (
  assessment: SeriousInjuryAssessment | null,
  normalizedIcdCode: string,
  contextOverrides?: Partial<ReturnType<typeof defaultPlanContext>>
) => {
  if (!assessment) return null;

  const patientId = assessment.caseId ? String(assessment.caseId) : '';

  if (!patientId || !normalizedIcdCode) {
    return null;
  }

  const derivedContext = {
    ...defaultPlanContext(assessment, normalizedIcdCode),
    ...contextOverrides,
  };

  const secondaryDiagnoses = derivedContext.secondaryDiagnoses
    .split(',')
    .map((code) => code.trim())
    .filter((code) => ICD10_PATTERN.test(code) && code !== normalizedIcdCode);

  return {
    patient_id: patientId,
    icd_code: normalizedIcdCode,
    secondary_diagnoses: secondaryDiagnoses,
    current_functional_status: derivedContext.currentFunctionalStatus,
    social_support: derivedContext.socialSupport,
    insurance_type: derivedContext.insuranceType,
  };
};

type SeriousInjuryAssessmentPageProps = { onNavigate?: (route: any) => void };

function SeriousInjuryAssessmentPage({ onNavigate }: SeriousInjuryAssessmentPageProps) {
  const [assessments, setAssessments] = useState<SeriousInjuryAssessment[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState<SeriousInjuryAssessment | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [recommendations] = useState('');
  const [activeTab, setActiveTab] = useState<'Clinical Info' | 'WPI Calculation' | 'Documents' | 'History'>('Clinical Info');
  const [showAll, setShowAll] = useState(false);
  const [pharmacyLoading, setPharmacyLoading] = useState(false);

  // Clinical Research Hospital Styling - Hospital Industry Typography
  const container: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #F0F4F8 0%, #E8F0FE 50%, #E6F2F2 100%)',
    padding: '32px 40px',
    display: 'flex',
    justifyContent: 'center',
    boxSizing: 'border-box',
    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: 14,
    lineHeight: 1.6,
    color: '#26344A',
    overflow: 'hidden'
  };
  const inner: React.CSSProperties = { width: '100%', maxWidth: 1400, margin: '0 auto', height: '100vh', display: 'flex', flexDirection: 'column' };

  // Primary heading - Hospital industry standard
  const h1: React.CSSProperties = {
    color: '#26344A',
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: '-0.02em',
    margin: 0
  };

  // Secondary text - WCAG AA compliant
  const muted: React.CSSProperties = {
    color: '#7E8CA0',
    fontSize: 14,
    lineHeight: 1.5,
    fontWeight: 400
  };

  // Button styles - Hospital industry standard
  const btn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: '12px 20px',
    fontSize: 14,
    fontWeight: 600,
    gap: 8,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    fontFamily: 'inherit'
  };
  const btnGhost: React.CSSProperties = {
    ...btn,
    background: 'rgba(248, 250, 252, 0.9)',
    color: '#307AFE',
    border: '1px solid rgba(144, 202, 249, 0.4)',
    boxShadow: '0 2px 8px rgba(74, 144, 226, 0.1)'
  };
  const btnPrimary: React.CSSProperties = {
    ...btn,
    background: 'linear-gradient(135deg, #307AFE 0%, #34A853 100%)',
    color: '#FAFBFC',
    boxShadow: '0 4px 16px rgba(74, 144, 226, 0.3)'
  };

  // Card styles - Clinical research theme
  const card: React.CSSProperties = {
    borderRadius: 20,
    background: 'rgba(255, 255, 255, 0.85)',
    padding: 28,
    border: '1px solid rgba(144, 202, 249, 0.2)',
    marginBottom: 32,
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(74, 144, 226, 0.08)',
    transition: 'all 0.3s ease'
  };

  // Input styles
  const input: React.CSSProperties = {
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid rgba(144, 202, 249, 0.3)',
    background: 'rgba(255, 255, 255, 0.9)',
    color: '#26344A',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all 0.2s ease'
  };

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      setLoading(true);

      // First, check if there's a current assessment from the pre-auth form
      const currentAssessmentData = sessionStorage.getItem('imms.currentAssessment');
      let currentAssessment: any = null;

      if (currentAssessmentData) {
        try {
          currentAssessment = JSON.parse(currentAssessmentData);
          console.log('Loaded current assessment from sessionStorage:', currentAssessment);
        } catch (error) {
          console.error('Failed to parse current assessment data:', error);
        }
      }

      // Fetch from authorizations endpoint
      let authorizationRows: SeriousInjuryAssessment[] = [];
      try {
        const res = await fetch(`${API_BASE_URL}/authorizations`);
        if (res.ok) {
          const data = await res.json();
          authorizationRows = (data || []).map((auth: any) => {
            // Extract ICD code from multiple possible sources
            const icdCode = auth.order?.orderIcdCode || auth.icdCodeAuth || auth.icdCodeList || '';

            // Extract injury type from order or authorization
            const injuryType = auth.order?.orderType ||
              auth.order?.orderDescription ||
              auth.orderType ||
              auth.description ||
              'Medical Treatment';

            return {
              id: auth.authorizationId,
              caseId: String(auth.authorizationId ?? ''),
              patientName: auth.patient?.fullName ?? 'Unknown Patient',
              injuryType: injuryType,
              severity: 'MEDIUM',
              assessmentDate: auth.authorizationStartDate ?? new Date().toISOString().split('T')[0],
              recommendations: auth.description ?? '',
              status: String((auth.approvalStatus ?? 'PENDING')).toUpperCase(),
              icdCode: icdCode // Add icdCode directly to the object
            };
          }) as any[];
        }
      } catch (error) {
        console.error('Error loading authorizations:', error);
      }

      // Only show authorization-based assessments from the database
      // Filter out any with missing critical data
      const validAuthRows = authorizationRows.filter((auth: any) =>
        auth.caseId && auth.patientName && auth.patientName !== 'Unknown Patient'
      );

      setAssessments(validAuthRows);

      // Auto-select the first assessment if available, or use current assessment for detail view only
      if (validAuthRows.length > 0) {
        setSelectedAssessment(validAuthRows[0]);
      } else if (currentAssessment) {
        // If no DB records but we have a current assessment, use it for the detail panel only
        const currentAssessmentFormatted: SeriousInjuryAssessment = {
          id: Date.now(),
          caseId: currentAssessment.caseId,
          patientName: currentAssessment.patientName,
          injuryType: currentAssessment.injuryType,
          severity: currentAssessment.severity,
          assessmentDate: currentAssessment.assessmentDate,
          recommendations: currentAssessment.recommendations,
          status: currentAssessment.status,
        };
        (currentAssessmentFormatted as any).icdCode = currentAssessment.icdCode;
        setSelectedAssessment(currentAssessmentFormatted);
      }

    } catch (error) {
      console.error('Error loading assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (assessmentId: number) => {
    try {
      await apiService.createSeriousInjuryAssessment({
        caseId: selectedAssessment?.caseId || '',
        patientName: selectedAssessment?.patientName || '',
        injuryType: selectedAssessment?.injuryType || '',
        severity: selectedAssessment?.severity || 'MEDIUM',
        assessmentDate: new Date().toISOString().split('T')[0],
        recommendations: recommendations || selectedAssessment?.recommendations || '',
        status: 'APPROVED'
      });
      await loadAssessments();
    } catch (error) {
      console.error('Error approving assessment:', error);
    }
  };

  const handleReject = async (assessmentId: number) => {
    try {
      await apiService.createSeriousInjuryAssessment({
        caseId: selectedAssessment?.caseId || '',
        patientName: selectedAssessment?.patientName || '',
        injuryType: selectedAssessment?.injuryType || '',
        severity: selectedAssessment?.severity || 'MEDIUM',
        assessmentDate: new Date().toISOString().split('T')[0],
        recommendations: recommendations || selectedAssessment?.recommendations || '',
        status: 'REJECTED'
      });
      await loadAssessments();
    } catch (error) {
      console.error('Error rejecting assessment:', error);
    }
  };

  const handleGenerateDischargePlan = async () => {
    try {
      if (!selectedAssessment) {
        console.log('❌ No assessment selected');
        return;
      }

      const icdCode = ((selectedAssessment as unknown as { icdCode?: string }).icdCode || '').trim();
      console.log('🔍 Raw ICD Code:', icdCode);
      const normalizedIcd = normalizeIcdCode(icdCode);
      console.log('🔍 Normalized ICD Code:', normalizedIcd);

      if (!normalizedIcd) {
        console.log('❌ ICD code normalization failed');
        setPlanError(
          'Unable to generate plan: the selected assessment is missing a valid ICD-10 code. Please ensure the code follows the ICD-10 pattern (e.g., S72.001) and try again.'
        );
        return;
      }

      const baseContext = defaultPlanContext(selectedAssessment, normalizedIcd);
      const payload = buildDischargePlanPayload(selectedAssessment, normalizedIcd, baseContext);
      console.log('🔍 Payload:', payload);

      if (!payload) {
        console.log('❌ Payload generation failed');
        setPlanError('Missing patient ID or ICD-10 code for the selected assessment.');
        return;
      }

      setPlanError(null);
      setPlanLoading(true);
      console.log('✅ Calling API: http://localhost:5053/generate-discharge-plan-groq');

      const response = await fetch('http://localhost:5053/generate-discharge-plan-groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      console.log('✅ API Response Status:', response.status);

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Failed to generate plan (status ${response.status})`);
      }

      const planData = await response.json();
      try {
        sessionStorage.setItem(DISCHARGE_PLAN_KEY, JSON.stringify(planData));
        sessionStorage.setItem(
          DISCHARGE_CONTEXT_KEY,
          JSON.stringify({
            ...baseContext,
            secondaryDiagnoses: payload.secondary_diagnoses.join(', '),
            currentFunctionalStatus: payload.current_functional_status,
            socialSupport: payload.social_support,
            insuranceType: payload.insurance_type,
          })
        );
        sessionStorage.setItem(
          DISCHARGE_META_KEY,
          JSON.stringify({
            patientName: selectedAssessment.patientName,
            caseId: selectedAssessment.caseId,
            injuryType: selectedAssessment.injuryType,
            assessmentDate: selectedAssessment.assessmentDate,
            severity: selectedAssessment.severity,
            icdCode: normalizedIcd,
          })
        );
      } catch (storageError) {
        console.warn('Unable to persist discharge plan to sessionStorage', storageError);
      }

      if (onNavigate) {
        onNavigate('payments');
      } else {
        alert('Discharge plan generated successfully.');
      }
    } catch (error) {
      console.error('Failed to generate discharge plan', error);
      const message = error instanceof Error ? error.message : 'Failed to generate discharge plan.';
      setPlanError(message || 'Failed to generate discharge plan.');
    } finally {
      setPlanLoading(false);
    }
  };

  const handleInitiateTreatmentReview = async () => {
    try {
      if (!selectedAssessment) return;
      console.log('Initiate Treatment Review for', selectedAssessment.caseId);
      // Call LLM service to generate case summary for this patient
      const payload = {
        icd_code: (selectedAssessment as any).icdCode || 'C50.9',
        patient_name: selectedAssessment.patientName,
        case_id: selectedAssessment.caseId,
      };
      const resp = await fetch(`${HOSPITAL_CASE_API}/generate-case-summary-groq`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const summary = await resp.json();
      // Persist to sessionStorage for the Cases page to read
      sessionStorage.setItem('imms.caseSummary', JSON.stringify(summary));

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('caseSummaryUpdated', { detail: summary }));

      if (onNavigate) {
        onNavigate('cases');
      } else {
        alert('Initiating treatment review...');
      }
    } catch (e) {
      console.error(e);
    }
  };


  //  added by mukit
  // const handleInitiateTreatmentReview = async () => {
  //   try {
  //     if (!selectedAssessment) return;
  //     // const payload = {
  //     //   icd_code: (selectedAssessment as any).icdCode || 'C50.9',
  //     //   patient_name: selectedAssessment.patientName,
  //     //   case_id: selectedAssessment.caseId,
  //     // };
  //     console.log('Initiate Treatment Review for', selectedAssessment.caseId);

  //     // Make API call to generate case summary
  //     console.log('Making request to:', 'http://localhost:5050/generate-case-summary');
  //     // Get and format ICD code properly
  //     let icdCode = (selectedAssessment as any).icdCode || "C50.9";

  //     // Format ICD code to match expected pattern (e.g., "N912" -> "N91.2")
  //     if (icdCode && icdCode.length >= 4 && !icdCode.includes('.')) {
  //       // Insert dot after first 3 characters for proper ICD-10 format
  //       icdCode = icdCode.substring(0, 3) + '.' + icdCode.substring(3);
  //     }

  //     // Ensure it's uppercase
  //     icdCode = icdCode.toUpperCase();

  //     const requestPayload = {
  //       patient_name: selectedAssessment.patientName,
  //       case_id: selectedAssessment.caseId,
  //       icd_code: icdCode
  //     };

  //     console.log('Request payload:', requestPayload);

  //     const response = await fetch('http://localhost:5050/generate-case-summary', {
  //       method: 'POST',
  //       mode: 'cors',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(requestPayload),
  //     });
  //     const summary = await response.json();
  //     // Persist to sessionStorage for the Cases page to read
  //     sessionStorage.setItem('imms.caseSummary', JSON.stringify(summary));


  //     console.log('Response status:', response.status);
  //     console.log('Response headers:', response.headers);

  //     if (response.ok) {
  //       const data = await response.json();
  //       console.log('Treatment review generated:', data);
  //       alert('Treatment review initiated successfully!');
  //     } else {
  //       const errorText = await response.text();
  //       console.error('Response error:', errorText);
  //       throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  //     }

  //     if (onNavigate) {
  //       onNavigate('cases');
  //     }
  //   } catch (e) {
  //     console.error('Error initiating treatment review:', e);
  //     const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
  //     alert(`Failed to initiate treatment review: ${errorMessage}`);
  //   }
  // };



  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const visibleAssessments = showAll ? filteredAssessments : filteredAssessments.slice(0, 10);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return { bg: 'rgba(34, 197, 94, 0.1)', text: '#16a34a' };
      case 'PENDING': return { bg: 'rgba(255, 193, 7, 0.1)', text: '#d97706' };
      case 'ASSESSED': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#dc2626' };
      default: return { bg: 'rgba(148, 163, 184, 0.1)', text: '#64748b' };
    }
  };

  const getWPI = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '75%';
      case 'HIGH': return '60%';
      case 'MEDIUM': return '45%';
      case 'LOW': return '25%';
      default: return '0%';
    }
  };

  const getReviewer = (index: number) => {
    const reviewers = [
      'Dr. Emily Carter',
      'Dr. David Lee',
      'Dr. Olivia Green',
      'Dr. Ethan Clark',
      'Dr. Sophia White'
    ];
    return reviewers[index % reviewers.length];
  };

  const medicalAdvisoryPanel = [
    {
      name: 'Dr. Emily Carter',
      title: 'Neurologist',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAA1ZcHRukEAtiITxy2NeEKe7pK5pJv0uIHbBp_BVxiVjlogyuGYe8mv-j8xZg95rFwZ5_A2ZsgdcVgNf3KD8Pqzu5QlI2-OkMoV1POVJSuccsWJK_ZRTfR3omz8P_wPMLT4-YVtZE6uW_Xx1IAXgxhx4WLJp5YHSqe-RNLgsoEDZTQmO1dgNm_E7dCGiNchEbR9XRoG4M3jsJyUpGSS_9XreRPSedhUSAYEEFEP_F5U7CNnvNr6uHtsPv2RMknlSkgxk4OoBau0Sfn'
    },
    {
      name: 'Dr. David Lee',
      title: 'Orthopedic Surgeon',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1cCaWkttPlfxSTJ_ZLAYqRRDDPXHDmrqoxFxKgQv73C_bIWFQH7HjMcn4tEGbNhSBhXl9LQ8t7Bg1qmtSVqsnsDhbg-oK-KWAWbqSy5BqXpB1XeaPRujRgyrlM-Aa67rz7_TMnn_p3AqO8PZ7Bpfr9b_B342yWi6C8NzaXzsiqVKOvMzsgUIToYzvVg1oviJA2TK7xzZ3IT5u1usLSpSRDtfQN2Silrn7hoBIQBtQpr8t7fNvHob4sJOZHUzLhua36OmbZ4tCJYwr'
    },
    {
      name: 'Dr. Olivia Green',
      title: 'Rehabilitation Specialist',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwqi3nSHOjUDkCTev789qQYps8rg0PmE_2qoUE8_aURtArRci-2tgJX1BXmtrumBS4yjM92Fv6cX0X-Is6kfgKom1zzswtqHCTqwl7OT5qZdu_PO-yqvWZy6wGwgOhNs-J-ZLExGQq3JX4i0WqdS93ZUeCS5cLZM_iq1DsMjLSMSLyRZx1ZEV4Achq4ZY9OyYL14fBLKTvEFesOasstXe7uJfJeicnw0qgnGdUGw8pnXl7RDH_4ID-11qqGVwmCGPCeJ0nOurIrsby'
    }
  ];

  return (
    <>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      <main style={container}>
        <div style={inner}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <h1 style={h1}>Serious Injury Assessment</h1>
              <p style={muted}>Manage and review serious injury assessments for claimants.</p>
            </div>
            <button style={btnPrimary}>
              ➕ New Assessment
            </button>
          </div>

          <div style={{ position: 'relative', display: 'flex', height: 'calc(100vh - 200px)', width: '100%', overflow: 'hidden' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, paddingRight: 32 }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#7E8CA0',
                    fontSize: 18
                  }}>🔍</span>
                  <input
                    style={{ ...input, paddingLeft: 48, width: '100%', boxSizing: 'border-box' }}
                    placeholder="Search by Assessment ID, Claimant Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button style={btnGhost}>
                  🔧 Filters
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minHeight: 0 }}>
                <div style={{
                  flex: 1,
                  minHeight: 0,
                  overflowX: 'auto',
                  overflowY: 'auto',
                  borderRadius: 20,
                  background: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid rgba(144, 202, 249, 0.2)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(74, 144, 226, 0.08)'
                }}>
                  <table style={{ width: '100%', fontSize: 14, textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(232, 240, 254, 0.3)' }}>
                      <tr>
                        <th style={{ padding: '16px 20px', fontWeight: 700, color: '#26344A' }}>Assessment ID</th>
                        <th style={{ padding: '16px 20px', fontWeight: 700, color: '#26344A' }}>Claimant</th>
                        <th style={{ padding: '16px 20px', fontWeight: 700, color: '#26344A' }}>Injury Type</th>
                        <th style={{ padding: '16px 20px', fontWeight: 700, color: '#26344A' }}>ICD Code</th>
                        <th style={{ padding: '16px 20px', fontWeight: 700, color: '#26344A' }}>Reviewer</th>
                        <th style={{ padding: '16px 20px', fontWeight: 700, color: '#26344A' }}>Pre-auth Status</th>
                        <th style={{ padding: '16px 20px', fontWeight: 700, color: '#26344A' }}>Date</th>
                        <th style={{ padding: '16px 20px', fontWeight: 700, color: '#26344A' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleAssessments.map((assessment, index) => (
                        <tr
                          key={assessment.id}
                          style={{
                            borderBottom: '1px solid rgba(144, 202, 249, 0.2)',
                            cursor: 'pointer',
                            background: index === 1 ? 'rgba(48, 122, 254, 0.05)' : 'transparent',
                            transition: 'background-color 0.2s ease'
                          }}
                          onClick={() => {
                            setSelectedAssessment(assessment);
                            setActiveTab('Clinical Info');
                          }}
                        >
                          <td style={{ padding: '16px 20px', fontWeight: 600, color: '#26344A' }}>{assessment.caseId}</td>
                          <td style={{ padding: '16px 20px', color: '#7E8CA0' }}>{assessment.patientName}</td>
                          <td style={{ padding: '16px 20px', color: '#7E8CA0' }}>{assessment.injuryType}</td>
                          <td style={{ padding: '16px 20px', color: '#7E8CA0' }}>{(assessment as any).icdCode || '-'}</td>
                          <td style={{ padding: '16px 20px', color: '#7E8CA0' }}>{getReviewer(index)}</td>
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{
                              padding: '6px 12px',
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 600,
                              background: getStatusColor(assessment.status).bg,
                              color: getStatusColor(assessment.status).text
                            }}>
                              {assessment.status}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px', color: '#7E8CA0' }}>{assessment.assessmentDate}</td>
                          <td style={{ padding: '16px 20px' }}>
                            <button
                              style={{
                                color: '#307AFE',
                                fontWeight: 600,
                                cursor: 'pointer',
                                background: 'none',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: 6,
                                transition: 'background-color 0.2s ease'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAssessment(assessment);
                                setActiveTab('Clinical Info');
                              }}
                            >
                              👁️ View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredAssessments.length > 10 && (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                      style={btnGhost}
                      onClick={() => setShowAll(!showAll)}
                    >
                      {showAll ? 'Show Less' : 'Show More'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ width: 400, minWidth: 400 }}>
              <div style={{ ...card, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', marginBottom: 0, padding: 0 }}>
                <div style={{ borderBottom: '1px solid rgba(144, 202, 249, 0.2)', padding: 20, paddingBottom: 16, marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    {(['Clinical Info', 'WPI Calculation', 'Documents', 'History'] as const).map(tab => (
                      <button
                        key={tab}
                        style={{
                          padding: '12px 4px',
                          borderBottom: activeTab === tab ? '2px solid #307AFE' : '2px solid transparent',
                          color: activeTab === tab ? '#307AFE' : '#7E8CA0',
                          fontWeight: activeTab === tab ? 700 : 500,
                          fontSize: 14,
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, padding: 20, paddingBottom: 180, overflowY: 'auto' }}>
                  <div>
                    {selectedAssessment ? (
                      activeTab === 'Clinical Info' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                          <div><div style={{ color: '#7E8CA0', fontSize: 12, marginBottom: 4 }}>Case ID</div><div style={{ fontWeight: 600, color: '#26344A' }}>{selectedAssessment.caseId}</div></div>
                          <div><div style={{ color: '#7E8CA0', fontSize: 12, marginBottom: 4 }}>Patient</div><div style={{ fontWeight: 600, color: '#26344A' }}>{selectedAssessment.patientName}</div></div>
                          <div><div style={{ color: '#7E8CA0', fontSize: 12, marginBottom: 4 }}>Injury</div><div style={{ fontWeight: 600, color: '#26344A' }}>{selectedAssessment.injuryType}</div></div>
                          <div><div style={{ color: '#7E8CA0', fontSize: 12, marginBottom: 4 }}>Severity</div><div style={{ fontWeight: 600, color: '#26344A' }}>{selectedAssessment.severity}</div></div>
                          <div><div style={{ color: '#7E8CA0', fontSize: 12, marginBottom: 4 }}>Date</div><div style={{ fontWeight: 600, color: '#26344A' }}>{selectedAssessment.assessmentDate}</div></div>
                          <div style={{ gridColumn: '1 / -1' }}><div style={{ color: '#7E8CA0', fontSize: 12, marginBottom: 8 }}>Current Recommendations</div><div style={{ fontWeight: 500, color: '#26344A', lineHeight: 1.5 }}>{selectedAssessment.recommendations}</div></div>
                        </div>
                      ) : activeTab === 'WPI Calculation' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'center' }}>
                          <div style={{ fontSize: 48, fontWeight: 800, color: '#16a34a' }}>{getWPI(selectedAssessment.severity)}</div>
                          <div style={{ color: '#7E8CA0', fontSize: 14 }}>Serious Injury Determination – 30% WPI or Equivalent Functional Criteria.</div>
                        </div>
                      ) : activeTab === 'Documents' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div style={{ color: '#26344A', fontWeight: 600, fontSize: 16 }}>Attached Documents</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {['Initial Report.pdf', 'Imaging Results.zip', 'Consent Form.pdf'].map((doc, index) => (
                              <div key={index} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 12,
                                background: 'rgba(248, 250, 252, 0.5)',
                                borderRadius: 8,
                                border: '1px solid rgba(144, 202, 249, 0.2)'
                              }}>
                                <span style={{ color: '#26344A' }}>📄 {doc}</span>
                                <button style={{ ...btnGhost, padding: '6px 12px', fontSize: 12 }}>View</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div style={{ color: '#26344A', fontWeight: 600, fontSize: 16 }}>Recent Activity</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ padding: 12, background: 'rgba(248, 250, 252, 0.5)', borderRadius: 8, border: '1px solid rgba(144, 202, 249, 0.2)' }}>
                              <strong style={{ color: '#26344A' }}>Status:</strong> <span style={{ color: '#7E8CA0' }}>{selectedAssessment.status}</span>
                            </div>
                            <div style={{ padding: 12, background: 'rgba(248, 250, 252, 0.5)', borderRadius: 8, border: '1px solid rgba(144, 202, 249, 0.2)' }}>
                              <strong style={{ color: '#26344A' }}>Last Updated:</strong> <span style={{ color: '#7E8CA0' }}>{selectedAssessment.assessmentDate}</span>
                            </div>
                            <div style={{ padding: 12, background: 'rgba(248, 250, 252, 0.5)', borderRadius: 8, border: '1px solid rgba(144, 202, 249, 0.2)' }}>
                              <strong style={{ color: '#26344A' }}>Reviewer:</strong> <span style={{ color: '#7E8CA0' }}>{getReviewer((selectedAssessment.id || 1) - 1)}</span>
                            </div>
                          </div>
                        </div>
                      )
                    ) : (
                      <div style={{ textAlign: 'center', padding: 40 }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                        <div style={{ color: '#7E8CA0', fontSize: 16 }}>Select an assessment to view details.</div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#26344A' }}>Medical Advisory Panel</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {medicalAdvisoryPanel.map((doctor, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: 12,
                          background: 'rgba(248, 250, 252, 0.5)',
                          borderRadius: 12,
                          border: '1px solid rgba(144, 202, 249, 0.2)'
                        }}>
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: '50%',
                              border: '2px solid rgba(48, 122, 254, 0.2)',
                              background: `url(${doctor.avatar}) center/cover`
                            }}
                          />
                          <div>
                            <p style={{ fontWeight: 600, color: '#26344A', margin: 0 }}>{doctor.name}</p>
                            <p style={{ fontSize: 12, color: '#7E8CA0', margin: 0, marginTop: 2 }}>{doctor.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* <h3 style={{ fontSize: 18, fontWeight: 600 }}>Recommendations</h3>
                <textarea
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid rgba(65,90,180,0.25)',
                    background: '#11183a',
                    color: '#e7eaf2',
                    fontSize: 14,
                    resize: 'none'
                  }}
                  placeholder="Add recommendations..."
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                /> */}

                    {planError && (
                      <div style={{
                        border: '1px solid rgba(239,68,68,0.4)',
                        background: 'rgba(239,68,68,0.1)',
                        color: '#fecaca',
                        padding: 12,
                        borderRadius: 8,
                        fontSize: 13
                      }}>
                        {planError}
                      </div>
                    )}

                    <div style={{
                      position: 'sticky',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'rgba(255, 255, 255, 0.95)',
                      paddingTop: 16,
                      paddingBottom: 16,
                      zIndex: 2,
                      borderTop: '1px solid rgba(144, 202, 249, 0.2)',
                      boxShadow: '0 -4px 12px rgba(74, 144, 226, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <button
                          style={{
                            ...btnPrimary,
                            background: 'linear-gradient(135deg, #16a34a 0%, #34d399 100%)'
                          }}
                          onClick={() => selectedAssessment && handleApprove(selectedAssessment.id!)}
                        >
                          ✅ Approve
                        </button>
                        <button
                          style={{
                            ...btnGhost,
                            color: '#dc2626',
                            borderColor: 'rgba(220, 38, 38, 0.3)',
                            background: 'rgba(220, 38, 38, 0.1)'
                          }}
                          onClick={() => selectedAssessment && handleReject(selectedAssessment.id!)}
                        >
                          ❌ Reject
                        </button>
                      </div>
                      {selectedAssessment && (
                        <>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                            <button
                              style={{
                                ...btnGhost,
                                background: planLoading ? 'rgba(148,163,184,0.3)' : 'rgba(248, 250, 252, 0.9)',
                                cursor: planLoading ? 'not-allowed' : 'pointer',
                                opacity: planLoading ? 0.6 : 1
                              }}
                              onClick={handleGenerateDischargePlan}
                              disabled={planLoading}
                            >
                              {planLoading ? '⏳ Generating…' : '📋 Generate Discharge Plan'}
                            </button>
                            <button
                              style={btnPrimary}
                              onClick={handleInitiateTreatmentReview}
                            >
                              🏥 Initiate Treatment Review
                            </button>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginTop: 12 }}>
                            <button
                              style={{
                                ...btnPrimary,
                                background: pharmacyLoading ? 'rgba(148,163,184,0.3)' : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                                cursor: pharmacyLoading ? 'not-allowed' : 'pointer',
                                opacity: pharmacyLoading ? 0.6 : 1
                              }}
                              onClick={async () => {
                                try {
                                  if (!selectedAssessment) return;

                                  setPharmacyLoading(true);

                                  // Get and format ICD code properly
                                  let icdCode = (selectedAssessment as any).icdCode || "I10";

                                  // Format ICD code to match expected pattern (e.g., "N912" -> "N91.2")
                                  if (icdCode && icdCode.length >= 4 && !icdCode.includes('.')) {
                                    // Insert dot after first 3 characters for proper ICD-10 format
                                    icdCode = icdCode.substring(0, 3) + '.' + icdCode.substring(3);
                                  }

                                  // Ensure it's uppercase
                                  icdCode = icdCode.toUpperCase();

                                  const requestPayload = {
                                    icd_code: icdCode,
                                    patient_name: selectedAssessment.patientName,
                                    case_id: selectedAssessment.caseId
                                  };

                                  console.log('Calling pharmacy API with:', requestPayload);

                                  const pharmacyApiUrl = process.env.REACT_APP_PHARMACY_API || 'http://localhost:8081';
                                  const response = await fetch(`${pharmacyApiUrl}/generate_prescription_safe_groq`, {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(requestPayload),
                                  });

                                  if (response.ok) {
                                    const result = await response.json();
                                    console.log('Pharmacy API response:', result);

                                    // Store the prescription data in localStorage to pass to pharmacy page
                                    localStorage.setItem('prescriptionData', JSON.stringify(result.data));

                                    // Navigate to pharmacy page
                                    if (onNavigate) {
                                      onNavigate('pharmacy');
                                    }
                                  } else {
                                    const errorText = await response.text();
                                    console.error('Pharmacy API error:', errorText);
                                    alert('Failed to generate prescription. Please try again.');
                                  }
                                } catch (error) {
                                  console.error('Error calling pharmacy API:', error);
                                  alert('Failed to generate prescription. Please try again.');
                                } finally {
                                  setPharmacyLoading(false);
                                }
                              }}
                            >
                              {pharmacyLoading ? (
                                <>
                                  ⏳ Loading...
                                </>
                              ) : (
                                '💊 Manage Pharmacy Benefits'
                              )}
                            </button>
                          </div>
                        </>


                      )}

                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: 24, textAlign: 'center', color: '#7E8CA0', fontSize: 12 }}>
            ©2024 IMMS. All rights reserved.
          </div>
        </div>
      </main>
    </>
  );
}

export default SeriousInjuryAssessmentPage;
