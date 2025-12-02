import React, { useEffect, useMemo, useState } from 'react';

type DeviceRecommendation = {
  name: string;
  code: string | null;
  cost: string | null;
  approval_status: string;
};

type DischargePlan = {
  discharge_summary: {
    primary_diagnosis: string;
    secondary_diagnoses: string[];
    treatment_summary: string;
    discharge_date: string | null;
    discharge_disposition: string;
  };
  assistive_devices: {
    devices: DeviceRecommendation[];
    total_equipment_cost: string | null;
  };
  rehabilitation_plan: {
    therapy_types: string[];
    therapy_goals: string;
    provider: string | null;
    start_date: string | null;
  };
  caregiver_referral: {
    caregiver_requirement: string;
    duration_weeks: number | null;
    care_requirements: string[];
    special_instructions: string | null;
  };
  generated_at: string;
  patient_id: string;
};

const STORAGE_PLAN_KEY = 'imms.dischargePlan';
const STORAGE_META_KEY = 'imms.dischargePlanMeta';
const STORAGE_CONTEXT_KEY = 'imms.dischargePlanContext';

type DischargeMeta = {
  patientName: string;
  caseId: string;
  injuryType: string;
  assessmentDate: string;
  severity: string;
  icdCode: string;
};

type DischargeContext = {
  patientId: string;
  icdCode: string;
  secondaryDiagnoses: string;
  currentFunctionalStatus: string;
  socialSupport: string;
  insuranceType: string;
};

const mockPlan: DischargePlan = {
  discharge_summary: {
    primary_diagnosis: 'Traumatic Brain Injury',
    secondary_diagnoses: ['Multiple Contusions'],
    treatment_summary: 'Patient stable, cognitive function improving. Follow-up required.',
    discharge_date: '2024-04-30',
    discharge_disposition: 'Home with family',
  },
  assistive_devices: {
    devices: [
      { name: 'Wheelchair', code: 'E1130', cost: 'R 4,500', approval_status: 'Approved' },
      { name: 'Hospital Bed', code: 'E0293', cost: 'R 12,000', approval_status: 'Pending' },
      { name: 'Walker', code: 'E0143', cost: 'R 850', approval_status: 'Approved' },
      { name: 'Shower Chair', code: 'E0163', cost: 'R 600', approval_status: 'Rejected' },
    ],
    total_equipment_cost: 'R 17,950',
  },
  rehabilitation_plan: {
    therapy_types: ['Physiotherapy - 3x/week for 12 weeks', 'Occupational Therapy - 2x/week for 8 weeks'],
    therapy_goals: 'Improve mobility and regain fine motor skills. Weekly sessions for 3 months.',
    provider: 'Life Rehabilitation Centre',
    start_date: '2024-05-02',
  },
  caregiver_referral: {
    caregiver_requirement: 'part-time',
    duration_weeks: 12,
    care_requirements: ['24/7 Monitoring', 'Medication assistance', 'ADL support'],
    special_instructions: 'Administer medication twice daily. Assist with daily living activities.',
  },
  generated_at: new Date().toISOString(),
  patient_id: 'RAF-2025-0456',
};

const mockMeta: DischargeMeta = {
  patientName: 'Emma van Wyk',
  caseId: 'RAF-2025-0456',
  injuryType: 'Femoral Fracture',
  assessmentDate: '2024-04-15',
  severity: 'MEDIUM',
  icdCode: 'S72.001',
};

const mockContext: DischargeContext = {
  patientId: mockPlan.patient_id,
  icdCode: mockMeta.icdCode,
  secondaryDiagnoses: mockPlan.discharge_summary.secondary_diagnoses.join(', '),
  currentFunctionalStatus: mockPlan.discharge_summary.treatment_summary,
  socialSupport: 'Patient lives with spouse who can assist with daily activities.',
  insuranceType: 'RAF Medical Benefit Scheme',
};

function safeParse<T>(value: string | null): T | null {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function normalizeDate(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString().split('T')[0];
}

function normalizeDateTime(value: unknown): string {
  if (typeof value === 'string' && value.trim()) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  return new Date().toISOString();
}

function normalizePlan(raw: unknown): DischargePlan {
  const candidate = (raw as Record<string, unknown>) ?? {};
  const dischargeSummaryRaw = (candidate.discharge_summary as Record<string, unknown>) ?? {};
  const assistiveDevicesRaw = (candidate.assistive_devices as Record<string, unknown>) ?? {};
  const rehabilitationRaw = (candidate.rehabilitation_plan as Record<string, unknown>) ?? {};
  const caregiverRaw = (candidate.caregiver_referral as Record<string, unknown>) ?? {};

  const devices: DeviceRecommendation[] = Array.isArray(assistiveDevicesRaw.devices)
    ? (assistiveDevicesRaw.devices as unknown[]).map((device) => {
        const entry = (device as Record<string, unknown>) ?? {};
        return {
          name: String(entry.name ?? 'Assistive device'),
          code: entry.code != null ? String(entry.code ?? '').trim() || null : null,
          cost: entry.cost != null ? String(entry.cost ?? '').trim() || null : null,
          approval_status: String(entry.approval_status ?? 'Pending'),
        };
      })
    : [];

  return {
    discharge_summary: {
      primary_diagnosis: String(dischargeSummaryRaw.primary_diagnosis ?? '').trim(),
      secondary_diagnoses: Array.isArray(dischargeSummaryRaw.secondary_diagnoses)
        ? (dischargeSummaryRaw.secondary_diagnoses as unknown[])
            .map((value) => String(value ?? '').trim())
            .filter(Boolean)
        : [],
      treatment_summary: String(dischargeSummaryRaw.treatment_summary ?? '').trim(),
      discharge_date: normalizeDate(dischargeSummaryRaw.discharge_date),
      discharge_disposition: String(dischargeSummaryRaw.discharge_disposition ?? 'Home').trim() || 'Home',
    },
    assistive_devices: {
      devices,
      total_equipment_cost:
        typeof assistiveDevicesRaw.total_equipment_cost === 'string'
          ? assistiveDevicesRaw.total_equipment_cost.trim() || null
          : null,
    },
    rehabilitation_plan: {
      therapy_types: Array.isArray(rehabilitationRaw.therapy_types)
        ? (rehabilitationRaw.therapy_types as unknown[])
            .map((value) => String(value ?? '').trim())
            .filter(Boolean)
        : [],
      therapy_goals: String(rehabilitationRaw.therapy_goals ?? '').trim(),
      provider: rehabilitationRaw.provider != null ? String(rehabilitationRaw.provider ?? '').trim() || null : null,
      start_date: normalizeDate(rehabilitationRaw.start_date),
    },
    caregiver_referral: {
      caregiver_requirement: String(caregiverRaw.caregiver_requirement ?? 'none').trim() || 'none',
      duration_weeks: (() => {
        const rawValue = caregiverRaw.duration_weeks;
        if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
          return Math.max(0, Math.trunc(rawValue));
        }
        if (typeof rawValue === 'string' && rawValue.trim()) {
          const parsed = Number.parseInt(rawValue, 10);
          return Number.isNaN(parsed) ? null : Math.max(0, parsed);
        }
        return null;
      })(),
      care_requirements: Array.isArray(caregiverRaw.care_requirements)
        ? (caregiverRaw.care_requirements as unknown[])
            .map((value) => String(value ?? '').trim())
            .filter(Boolean)
        : [],
      special_instructions:
        caregiverRaw.special_instructions != null
          ? String(caregiverRaw.special_instructions ?? '').trim() || null
          : null,
    },
    generated_at: normalizeDateTime(candidate.generated_at),
    patient_id: candidate.patient_id != null ? String(candidate.patient_id ?? '').trim() : '',
  };
}

function parseCurrency(value?: string | null): number | null {
  if (!value) {
    return null;
  }
  const numeric = Number.parseFloat(value.replace(/[^0-9.,-]/g, '').replace(/,/g, ''));
  return Number.isFinite(numeric) ? numeric : null;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function computeEquipmentTotal(devices: DeviceRecommendation[], reportedTotal: string | null): number | null {
  const parsedReported = parseCurrency(reportedTotal ?? undefined);
  if (parsedReported !== null) {
    return parsedReported;
  }
  let total = 0;
  let counted = false;
  devices.forEach((device) => {
    const cost = parseCurrency(device.cost ?? undefined);
    if (cost !== null) {
      total += cost;
      counted = true;
    }
  });
  return counted ? total : null;
}

function estimateRehabCost(therapyTypes: string[]): number | null {
  if (!therapyTypes.length) {
    return null;
  }
  let total = 0;
  let counted = false;
  therapyTypes.forEach((therapy) => {
    const sessionsMatch = therapy.match(/(\d+)\s*(?:x|times)\s*(?:\/|per)?\s*week/i);
    const weeksMatch = therapy.match(/(\d+)\s*weeks?/i);
    const sessionsPerWeek = sessionsMatch ? Number.parseInt(sessionsMatch[1], 10) : 2;
    const weeks = weeksMatch ? Number.parseInt(weeksMatch[1], 10) : 8;
    if (Number.isFinite(sessionsPerWeek) && Number.isFinite(weeks)) {
      const baseRate = therapy.toLowerCase().includes('occupational') ? 620 : 650;
      total += sessionsPerWeek * weeks * baseRate;
      counted = true;
    }
  });
  return counted ? total : null;
}

function estimateCaregiverCost(requirement: string, durationWeeks: number | null): number | null {
  if (!requirement || !durationWeeks) {
    return null;
  }
  const normalized = requirement.toLowerCase();
  let weeklyRate = 2800;
  if (normalized.includes('full')) weeklyRate = 5200;
  else if (normalized.includes('part')) weeklyRate = 3400;
  else if (normalized.includes('visit')) weeklyRate = 2200;
  return weeklyRate * durationWeeks;
}

function formatDisplayDate(value: string | null): string {
  if (!value) return 'TBD';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
}

function formatDisplayDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
}

const badgeColors: Record<string, { background: string; text: string; border: string }> = {
  approved: { background: 'rgba(22,163,74,0.15)', text: '#86efac', border: 'rgba(22,163,74,0.35)' },
  pending: { background: 'rgba(234,179,8,0.15)', text: '#fde68a', border: 'rgba(234,179,8,0.35)' },
  rejected: { background: 'rgba(239,68,68,0.15)', text: '#fca5a5', border: 'rgba(239,68,68,0.4)' },
  required: { background: 'rgba(37,99,235,0.15)', text: '#93c5fd', border: 'rgba(37,99,235,0.35)' },
  default: { background: 'rgba(148,163,184,0.12)', text: '#cbd5f5', border: 'rgba(148,163,184,0.25)' },
};

function statusStyle(status: string) {
  const key = status.toLowerCase() as keyof typeof badgeColors;
  return badgeColors[key] || badgeColors.default;
}

function DischargePlanning() {
  const [plan, setPlan] = useState<DischargePlan>(mockPlan);
  const [meta, setMeta] = useState<DischargeMeta>(mockMeta);
  const [context, setContext] = useState<DischargeContext>(mockContext);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const storedValue = safeParse<unknown>(window.sessionStorage.getItem(STORAGE_PLAN_KEY));
    if (storedValue) {
      setPlan(normalizePlan(storedValue));
    } else {
      setPlan(mockPlan);
    }
    const storedMeta = safeParse<Partial<DischargeMeta>>(window.sessionStorage.getItem(STORAGE_META_KEY));
    if (storedMeta) {
      setMeta({ ...mockMeta, ...storedMeta });
    } else {
      setMeta(mockMeta);
    }
    const storedContext = safeParse<Partial<DischargeContext>>(window.sessionStorage.getItem(STORAGE_CONTEXT_KEY));
    if (storedContext) {
      setContext({ ...mockContext, ...storedContext });
    } else {
      setContext(mockContext);
    }
  }, []);

  const equipmentTotal = useMemo(
    () => computeEquipmentTotal(plan.assistive_devices.devices, plan.assistive_devices.total_equipment_cost),
    [plan.assistive_devices]
  );

  const rehabCost = useMemo(() => estimateRehabCost(plan.rehabilitation_plan.therapy_types), [plan.rehabilitation_plan]);
  const caregiverCost = useMemo(
    () => estimateCaregiverCost(plan.caregiver_referral.caregiver_requirement, plan.caregiver_referral.duration_weeks),
    [plan.caregiver_referral]
  );

  const totalCost = useMemo(() => {
    const costs = [equipmentTotal, rehabCost, caregiverCost].filter((value): value is number => value !== null);
    if (!costs.length) {
      return null;
    }
    return costs.reduce((acc, value) => acc + value, 0);
  }, [equipmentTotal, rehabCost, caregiverCost]);

  const equipmentDisplay = equipmentTotal !== null ? formatCurrency(equipmentTotal) : plan.assistive_devices.total_equipment_cost || 'R 0';
  const rehabDisplay = rehabCost !== null ? formatCurrency(rehabCost) : 'N/A';
  const caregiverDisplay = caregiverCost !== null ? formatCurrency(caregiverCost) : 'N/A';
  const totalDisplay = totalCost !== null ? formatCurrency(totalCost) : 'N/A';

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
    color: '#26344A'
  };
  const inner: React.CSSProperties = { width: '100%', maxWidth: 1400, margin: '0 auto' };
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
    borderRadius: 16,
    background: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    border: '1px solid rgba(144, 202, 249, 0.2)',
    marginBottom: 20,
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 16px rgba(74, 144, 226, 0.08)',
    transition: 'all 0.3s ease'
  };
  const badgeStyle: React.CSSProperties = { 
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: 6, 
    background: 'rgba(255, 193, 7, 0.1)', 
    color: '#d97706', 
    fontSize: 12, 
    fontWeight: 600, 
    padding: '6px 12px', 
    borderRadius: 16,
    border: '1px solid rgba(255, 193, 7, 0.2)'
  };

  const secondaryDisplay = plan.discharge_summary.secondary_diagnoses.length
    ? plan.discharge_summary.secondary_diagnoses.join(', ')
    : 'None provided';
  const dischargeDateDisplay = plan.discharge_summary.discharge_date ?? '';
  const rehabStartDisplay = plan.rehabilitation_plan.start_date ?? '';
  const generatedAtDisplay = formatDisplayDateTime(plan.generated_at);

  return (
    <main style={container}>
      <div style={inner}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h1 style={h1}>Discharge Planning</h1>
            <p style={muted}>Comprehensive discharge coordination and home care setup</p>
            <p style={{ fontSize: 12, color: '#7E8CA0', marginTop: 2 }}>Last generated: {generatedAtDisplay}</p>
          </div>

        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          {/* Left Column - Main Content */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Patient Information - Smaller Card */}
            <div style={card}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 200 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'rgba(48, 122, 254, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      color: '#307AFE',
                      fontSize: 18
                    }}
                  >
                    {meta.patientName ? meta.patientName.charAt(0).toUpperCase() : plan.patient_id.slice(0, 1) || 'P'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#26344A', margin: 0 }}>{meta.patientName || 'Patient'}</h3>
                    <span
                      style={{
                        display: 'inline-block',
                        background: 'rgba(48, 122, 254, 0.1)',
                        color: '#307AFE',
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 12,
                        marginTop: 2
                      }}
                    >
                      Case: {meta.caseId || plan.patient_id || 'N/A'}
                    </span>
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <span style={badgeStyle}>📋 In Planning</span>
                </div>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: 16,
                  paddingTop: 16,
                  borderTop: '1px solid rgba(144, 202, 249, 0.2)',
                  fontSize: 13
                }}
              >
                {[{
                  label: 'Primary Diagnosis',
                  value:
                    plan.discharge_summary.primary_diagnosis && plan.discharge_summary.primary_diagnosis !== meta.icdCode
                      ? plan.discharge_summary.primary_diagnosis
                      : `${meta.icdCode} • ${meta.injuryType || 'Primary condition'}`,
                },
                {
                  label: 'Secondary Diagnoses',
                  value: secondaryDisplay || context.secondaryDiagnoses || 'None provided',
                },
                {
                  label: 'ICD-10 Code',
                  value: meta.icdCode || context.icdCode || 'N/A',
                },
                {
                  label: 'Injury Type',
                  value: meta.injuryType || 'N/A',
                },
                {
                  label: 'Severity',
                  value: meta.severity || 'N/A',
                },
                {
                  label: 'Assessment Date',
                  value: meta.assessmentDate || 'N/A',
                },
                {
                  label: 'Discharge Disposition',
                  value: plan.discharge_summary.discharge_disposition || 'Home',
                },
                {
                  label: 'Expected Discharge',
                  value: formatDisplayDate(plan.discharge_summary.discharge_date),
                }].map(({ label, value }) => (
                  <div key={label}>
                    <p style={{ ...muted, fontSize: 12, marginBottom: 4 }}>{label}</p>
                    <p style={{ fontWeight: 600, color: '#26344A' }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Steps - Smaller Card */}
            <div style={card}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#26344A' }}>📊 Planning Progress</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                {['Summary', 'Assistive Devices', 'Rehabilitation', 'Caregiver Referral'].map((title, index) => (
                  <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: index === 0 ? '#307AFE' : 'rgba(126, 140, 160, 0.1)',
                        color: index === 0 ? '#fff' : '#7E8CA0',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {index === 0 ? '✓' : index + 1}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: index === 0 ? '#26344A' : '#7E8CA0', fontSize: 13, margin: 0 }}>{title}</p>
                      <p style={{ fontSize: 11, color: index === 0 ? '#307AFE' : '#7E8CA0', margin: 0 }}>
                        {index === 0 ? 'Current Step' : 'Pending'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Discharge Summary - Smaller Card */}
            <div style={card}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#26344A' }}>📄 Discharge Summary</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#26344A' }}>Primary Diagnosis</label>
                  <input
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(144, 202, 249, 0.3)',
                      color: '#26344A',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                    value={plan.discharge_summary.primary_diagnosis || ''}
                    readOnly
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#26344A' }}>Secondary Diagnoses</label>
                  <input
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(144, 202, 249, 0.3)',
                      color: '#26344A',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                    value={secondaryDisplay}
                    readOnly
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#26344A' }}>Treatment Summary</label>
                  <textarea
                    rows={3}
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(144, 202, 249, 0.3)',
                      color: '#26344A',
                      resize: 'vertical',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                    value={plan.discharge_summary.treatment_summary || context.currentFunctionalStatus || '—'}
                    readOnly
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#26344A' }}>Discharge Date</label>
                  <input
                    type="date"
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(144, 202, 249, 0.3)',
                      color: '#26344A',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                    value={dischargeDateDisplay}
                    readOnly
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#26344A' }}>Discharge Disposition</label>
                  <input
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(144, 202, 249, 0.3)',
                      color: '#26344A',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                    value={plan.discharge_summary.discharge_disposition || 'Home'}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Assistive Devices - Smaller Card */}
            <div style={card}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#26344A' }}>🦽 Assistive Devices</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.assistive_devices.devices.length === 0 && (
                  <div
                    style={{
                      border: '1px dashed rgba(144, 202, 249, 0.3)',
                      borderRadius: 12,
                      padding: 16,
                      color: '#7E8CA0',
                      textAlign: 'center',
                      fontSize: 13
                    }}
                  >
                    No assistive devices recommended.
                  </div>
                )}
                {plan.assistive_devices.devices.map((device, index) => {
                  const { background, text, border } = statusStyle(device.approval_status);
                  return (
                    <div
                      key={`${device.name}-${index}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'rgba(248, 250, 252, 0.9)',
                        borderRadius: 12,
                        padding: 12,
                        border: '1px solid rgba(144, 202, 249, 0.3)',
                      }}
                    >
                    <div>
                        <p style={{ fontWeight: 600, color: '#26344A', fontSize: 14, margin: 0 }}>{device.name}</p>
                        <p style={{ ...muted, fontSize: 12, margin: 0 }}>
                          {device.code ? `Code: ${device.code}` : 'No code provided'}
                          {device.cost ? ` • Cost: ${device.cost}` : ''}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '4px 8px',
                          borderRadius: 16,
                          background,
                          color: text,
                          border: `1px solid ${border}`,
                          textTransform: 'capitalize',
                        }}
                      >
                        {device.approval_status}
                      </span>
                    </div>
                  );
                })}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontWeight: 600, paddingTop: 8, borderTop: '1px solid rgba(144, 202, 249, 0.2)' }}>
                  <span style={{ color: '#7E8CA0', fontSize: 13 }}>Total Equipment Cost</span>
                  <span style={{ color: '#26344A', fontSize: 14 }}>{equipmentDisplay}</span>
                </div>
              </div>
            </div>

            {/* Rehabilitation Plan - Smaller Card */}
            <div style={card}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#26344A' }}>🏥 Rehabilitation Plan</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#26344A' }}>Therapy Types</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {plan.rehabilitation_plan.therapy_types.length === 0 && (
                      <span style={{ color: '#7E8CA0', fontSize: 13 }}>No therapies recommended.</span>
                    )}
                    {plan.rehabilitation_plan.therapy_types.map((therapy, idx) => (
                      <span key={`${therapy}-${idx}`} style={{ background: 'rgba(48, 122, 254, 0.1)', borderRadius: 8, padding: '6px 10px', fontSize: 13, color: '#26344A' }}>
                        {therapy}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#26344A' }}>Provider</label>
                  <input
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(144, 202, 249, 0.3)',
                      color: '#26344A',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                    value={plan.rehabilitation_plan.provider ?? ''}
                    readOnly
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#26344A' }}>Start Date</label>
                  <input
                    type="date"
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(144, 202, 249, 0.3)',
                      color: '#26344A',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                    value={rehabStartDisplay}
                    readOnly
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#26344A' }}>Therapy Goals</label>
                  <textarea
                    rows={3}
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(144, 202, 249, 0.3)',
                      color: '#26344A',
                      resize: 'vertical',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                    value={plan.rehabilitation_plan.therapy_goals || '—'}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Caregiver Referral - Smaller Card */}
            <div style={card}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#26344A' }}>👩‍⚕️ Caregiver Referral</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#26344A' }}>Caregiver Setting</label>
                  <input
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(144, 202, 249, 0.3)',
                      color: '#26344A',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                    value={plan.caregiver_referral.caregiver_requirement || 'Full-time caregiver support recommended.'}
                    readOnly
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#26344A' }}>Duration (weeks)</label>
                  <input
                    type="number"
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(144, 202, 249, 0.3)',
                      color: '#26344A',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                    value={plan.caregiver_referral.duration_weeks ?? 6}
                    readOnly
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#26344A' }}>Care Requirements</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(plan.caregiver_referral.care_requirements.length
                      ? plan.caregiver_referral.care_requirements
                      : ['Assistance with ADLs', 'Medication management', 'Mobility and fall prevention'])
                      .map((requirement, idx) => (
                        <span key={`${requirement}-${idx}`} style={{ background: 'rgba(126, 140, 160, 0.1)', borderRadius: 8, padding: '6px 10px', fontSize: 13, color: '#26344A' }}>
                          {requirement}
                        </span>
                      ))}
                  </div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#26344A' }}>Special Instructions</label>
                  <textarea
                    rows={3}
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(144, 202, 249, 0.3)',
                      color: '#26344A',
                      resize: 'vertical',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                    value={plan.caregiver_referral.special_instructions ?? 'Coordinate weekly follow-up calls, monitor for red-flag symptoms, and reinforce patient education on medication adherence.'}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar Cards */}
          <div style={{ width: 320, minWidth: 320 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Approval Status - Smaller Card */}
              <div style={card}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#26344A' }}>✅ Approval Status</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Medical team approved', 'Equipment authorized', 'RAF approval pending', 'Caregiver pending'].map((label, idx) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: idx < 2 ? '#16a34a' : 'transparent',
                          border: idx < 2 ? 'none' : '2px solid rgba(126, 140, 160, 0.4)',
                          fontSize: 10,
                          color: idx < 2 ? '#fff' : '#7E8CA0',
                        }}
                      >
                        {idx < 2 ? '✓' : '•'}
                      </div>
                      <span style={{ color: idx < 2 ? '#26344A' : '#7E8CA0', fontWeight: idx < 2 ? 600 : 400, fontSize: 13 }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost Summary - Smaller Card */}
              <div style={card}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#26344A' }}>💰 Cost Summary</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(144, 202, 249, 0.2)' }}>
                    <p style={{ ...muted }}>Assistive Devices</p>
                    <p style={{ fontWeight: 600, color: '#26344A' }}>{equipmentDisplay}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(144, 202, 249, 0.2)' }}>
                    <p style={{ ...muted }}>Rehabilitation</p>
                    <p style={{ fontWeight: 600, color: '#26344A' }}>{rehabDisplay}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(144, 202, 249, 0.2)' }}>
                    <p style={{ ...muted }}>Caregiver Support</p>
                    <p style={{ fontWeight: 600, color: '#26344A' }}>{caregiverDisplay}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
                    <p style={{ fontWeight: 700, color: '#26344A' }}>Total Estimated Cost</p>
                    <p style={{ fontWeight: 700, color: '#307AFE', fontSize: 14 }}>{totalDisplay}</p>
                  </div>
                </div>
              </div>

              {/* Care Team Contacts - Smaller Card */}
              <div style={card}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#26344A' }}>👥 Care Team Contacts</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <p style={{ ...muted, fontSize: 12 }}>Case Manager</p>
                    <p style={{ fontWeight: 600, color: '#26344A', fontSize: 13 }}>Mary Patel, RN</p>
                    <p style={{ color: '#307AFE', fontSize: 12 }}>+27 12 345 6789</p>
                  </div>
                  <div>
                    <p style={{ ...muted, fontSize: 12 }}>Primary Physician</p>
                    <p style={{ fontWeight: 600, color: '#26344A', fontSize: 13 }}>Dr. Emily Carter</p>
                    <p style={{ color: '#307AFE', fontSize: 12 }}>dr.carter@hospital.za</p>
                  </div>
                </div>
              </div>




            </div>
          </div>
          
          <div style={{ paddingTop: 24, textAlign: 'center', color: '#7E8CA0', fontSize: 12 }}>
            ©2024 IMMS. All rights reserved.
          </div>
        </div>
      </div>
    </main>
  );
}

export default DischargePlanning;


