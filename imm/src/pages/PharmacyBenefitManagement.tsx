import React, { useState, useEffect } from 'react';
import { apiService, PharmacyBenefit } from '../services/api';

function PharmacyBenefitManagement() {
  const [benefits, setBenefits] = useState<PharmacyBenefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState({
    name: 'Sarah Johnson',
    dob: '1985-08-15',
    caseNumber: 'RAF2023-12345',
    prescriber: 'Dr. Emily Carter',
    serviceDate: '2023-10-26'
  });
  const [newMedication, setNewMedication] = useState({
    medicationName: '',
    dosage: '',
    frequency: '',
    duration: '',
    quantity: '',
    refills: ''
  });
  const [prescriptionData, setPrescriptionData] = useState<any>(null);
  const [hasApiData, setHasApiData] = useState(false);

  // Function to manually set test data
  const setTestData = () => {
    const testData = {
      patient_name: "Test Patient",
      date_of_birth: "1990-01-01",
      case_number: "TEST-123",
      prescriber: "Dr. Test Doctor",
      date_of_service: "2024-10-16",
      medications: [
        {
          drug_name: "Medroxyprogesterone Acetate 10mg Tablets",
          nappi_code: "7003456",
          dosage: "10 mg once daily",
          quantity: 10,
          duration_days: 10,
          formulary_status: "Formulary",
          price: "R185.00",
          generic_substitute: null
        }
      ],
      pricing_summary: {
        total_cost: "R185.00",
        items: [
          {
            name: "Medroxyprogesterone Acetate 10mg Tablets",
            cost: "R185.00"
          }
        ]
      },
      nappi_validation: "All NAPPI codes validated successfully"
    };

    localStorage.setItem('prescriptionData', JSON.stringify(testData));
    window.location.reload(); // Reload to process the data
  };

  // Function to test API connection
  const testApiConnection = async () => {
    try {
      const response = await fetch('http://localhost:8080/generate_prescription_safe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          icd_code: "I10",
          patient_name: "Test Patient",
          case_id: "TEST-001"
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('API Test Success:', result);
        alert('API connection successful!');
      } else {
        console.error('API Test Failed:', response.status);
        alert('API connection failed: ' + response.status);
      }
    } catch (error) {
      console.error('API Test Error:', error);
      alert('API connection error: ' + error);
    }
  };

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
    transition: 'all 0.2s ease',
    width: '100%',
    boxSizing: 'border-box'
  };
  const select: React.CSSProperties = { ...input };

  useEffect(() => {
    // Check for prescription data from localStorage FIRST (from injury assessment page)
    const storedPrescriptionData = localStorage.getItem('prescriptionData');
    console.log('Checking localStorage for prescriptionData:', storedPrescriptionData);

    if (storedPrescriptionData) {
      try {
        const parsedData = JSON.parse(storedPrescriptionData);
        console.log('Processing API prescription data:', parsedData);
        setPrescriptionData(parsedData);

        // Update patient info from API response
        setSelectedPatient({
          name: parsedData.patient_name || 'Sarah Johnson',
          dob: parsedData.date_of_birth || '1985-08-15',
          caseNumber: parsedData.case_number || 'RAF2023-12345',
          prescriber: parsedData.prescriber || 'Dr. Emily Carter',
          serviceDate: parsedData.date_of_service || '2023-10-26'
        });

        // Convert API medications to benefits format
        if (parsedData.medications && parsedData.medications.length > 0) {
          const apiBenefits = parsedData.medications.map((med: any, index: number) => ({
            id: index + 100, // Use high IDs to avoid conflicts
            patientId: parsedData.case_number || 'RAF2023-12345',
            medicationName: med.drug_name || 'Unknown Medication',
            dosage: med.dosage || 'Unknown',
            quantity: med.quantity || 0,
            cost: parseFloat(med.price?.replace('R', '').replace(',', '') || '0'),
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            formulary_status: med.formulary_status || 'Formulary',
            nappiCode: med.nappi_code || '',
            duration_days: med.duration_days || 0
          }));

          console.log('Setting API benefits:', apiBenefits);
          console.log('API medications raw:', parsedData.medications);

          // Set API medications as benefits
          setBenefits(apiBenefits);
          setHasApiData(true);
          setLoading(false);

          // Don't clear localStorage immediately - wait a bit
          setTimeout(() => {
            localStorage.removeItem('prescriptionData');
          }, 1000);

          return; // Don't call loadBenefits if we have API data
        }

        // Clear the stored data after using it
        localStorage.removeItem('prescriptionData');
      } catch (error) {
        console.error('Error parsing prescription data:', error);
      }
    }

    // Only load normal benefits if no API data was processed
    loadBenefits();
  }, []);

  // Monitor benefits changes
  useEffect(() => {
    console.log('Benefits state changed:', benefits);
  }, [benefits]);

  const loadBenefits = async () => {
    // Don't load benefits if we already have API data
    if (hasApiData) {
      console.log('Skipping loadBenefits - already have API data');
      return;
    }

    // Check if localStorage still has prescription data
    const storedData = localStorage.getItem('prescriptionData');
    if (storedData) {
      console.log('Skipping loadBenefits - localStorage has prescription data');
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting to load benefits from API service');
      const data = await apiService.getAllPharmacyBenefits();
      setBenefits(data);
    } catch (error) {
      console.error('Error loading benefits:', error);

      // Only use mock data if no API data is available
      if (!hasApiData) {
        console.log('Loading mock benefits data');
        setBenefits([
          {
            id: 1,
            patientId: 'RAF2023-12345',
            medicationName: 'Ibuprofen',
            dosage: '200mg',
            quantity: 14,
            cost: 15.00,
            status: 'APPROVED',
            createdAt: '2024-01-15T10:30:00Z'
          },
          {
            id: 2,
            patientId: 'RAF2023-12345',
            medicationName: 'Amoxicillin',
            dosage: '500mg',
            quantity: 30,
            cost: 25.00,
            status: 'APPROVED',
            createdAt: '2024-01-16T14:20:00Z'
          },
          {
            id: 3,
            patientId: 'RAF2023-12345',
            medicationName: 'Paracetamol',
            dosage: '500mg',
            quantity: 28,
            cost: 15.00,
            status: 'PENDING',
            createdAt: '2024-01-17T09:15:00Z'
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedication = async () => {
    if (!newMedication.medicationName || !newMedication.dosage) return;

    try {
      const benefit: Omit<PharmacyBenefit, 'id' | 'createdAt'> = {
        patientId: selectedPatient.caseNumber,
        medicationName: newMedication.medicationName,
        dosage: newMedication.dosage,
        quantity: parseInt(newMedication.quantity) || 0,
        cost: 0, // Will be calculated by backend
        status: 'PENDING'
      };

      await apiService.updatePharmacyBenefitStatus(0, 'PENDING'); // Mock call
      setNewMedication({
        medicationName: '',
        dosage: '',
        frequency: '',
        duration: '',
        quantity: '',
        refills: ''
      });
      await loadBenefits();
    } catch (error) {
      console.error('Error adding medication:', error);
    }
  };

  const handleSavePrescription = async () => {
    try {
      // Save all pending medications
      for (const benefit of benefits.filter(b => b.status === 'PENDING')) {
        await apiService.updatePharmacyBenefitStatus(benefit.id!, 'APPROVED');
      }
      await loadBenefits();
    } catch (error) {
      console.error('Error saving prescription:', error);
    }
  };

  const isNonFormulary = (benefit: any) => {
    // If we have API data with formulary_status, use that
    if (benefit.formulary_status) {
      return benefit.formulary_status.toLowerCase() !== 'formulary';
    }
    // Fallback to simple mock rule: Ibuprofen is non-formulary, others are formulary
    return /ibuprofen/i.test(benefit.medicationName || benefit);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return { bg: 'rgba(34, 197, 94, 0.1)', text: '#16a34a' };
      case 'PENDING': return { bg: 'rgba(255, 193, 7, 0.1)', text: '#d97706' };
      case 'REJECTED': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#dc2626' };
      default: return { bg: 'rgba(148, 163, 184, 0.1)', text: '#64748b' };
    }
  };

  // Function to handle medication selection and auto-fill fields
  const handleMedicationSelect = (medicationName: string) => {
    // Find the selected medication from benefits (prescription details)
    const selectedMed = benefits.find(benefit => benefit.medicationName === medicationName);

    if (selectedMed) {
      // Auto-fill all fields based on selected medication
      setNewMedication({
        medicationName: selectedMed.medicationName,
        dosage: selectedMed.dosage || '',
        frequency: 'Once daily', // Default or could be derived from dosage
        duration: (selectedMed as any).duration_days ? `${(selectedMed as any).duration_days}` : '',
        quantity: selectedMed.quantity.toString(),
        refills: '0', // Default
        nappiCode: (selectedMed as any).nappiCode || ''
      } as any);
    } else {
      // Just set the medication name if not found in benefits
      setNewMedication({
        ...newMedication,
        medicationName: medicationName
      });
    }
  };

  const totalCost = benefits.reduce((sum, benefit) => sum + benefit.cost, 0);
  const patientShare = 0; // Mock data
  const needsReview = benefits.some(b => isNonFormulary(b));

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
              <h1 style={h1}>Pharmacy Benefit Management</h1>
              <p style={muted}>Manage and track pharmacy benefits for patients.</p>
            </div>
            <button style={btnPrimary}>
              💊 New Prescription
            </button>
          </div>

          {/* Two Column Layout */}
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            {/* Left Column - Main Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Patient Information - Smaller Card */}
              <div style={{
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.9)',
                padding: 20,
                border: '1px solid rgba(144, 202, 249, 0.2)',
                marginBottom: 20,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 16px rgba(74, 144, 226, 0.08)'
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#26344A' }}>👤 Patient Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, fontSize: 13 }}>
                  <div>
                    <p style={{ ...muted, marginBottom: 4, fontSize: 12 }}>Patient Name</p>
                    <p style={{ fontWeight: 600, color: '#26344A' }}>{selectedPatient.name}</p>
                  </div>
                  <div>
                    <p style={{ ...muted, marginBottom: 4, fontSize: 12 }}>Date of Birth</p>
                    <p style={{ fontWeight: 600, color: '#26344A' }}>{selectedPatient.dob}</p>
                  </div>
                  <div>
                    <p style={{ ...muted, marginBottom: 4, fontSize: 12 }}>Case Number</p>
                    <p style={{ fontWeight: 600, color: '#26344A' }}>{selectedPatient.caseNumber}</p>
                  </div>
                  <div>
                    <p style={{ ...muted, marginBottom: 4, fontSize: 12 }}>Prescriber</p>
                    <p style={{ fontWeight: 600, color: '#26344A' }}>{selectedPatient.prescriber}</p>
                  </div>
                  <div>
                    <p style={{ ...muted, marginBottom: 4, fontSize: 12 }}>Date of Service</p>
                    <p style={{ fontWeight: 600, color: '#26344A' }}>{selectedPatient.serviceDate}</p>
                  </div>
                </div>
              </div>

              {/* Add Medication - Smaller Card */}
              <div style={{
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.9)',
                padding: 20,
                border: '1px solid rgba(144, 202, 249, 0.2)',
                marginBottom: 20,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 16px rgba(74, 144, 226, 0.08)'
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#26344A' }}>💊 Add Medication</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#26344A', marginBottom: 6 }}>Medication</label>
                    <select
                      style={{ ...select, padding: '8px 12px', fontSize: 13 }}
                      value={newMedication.medicationName}
                      onChange={(e) => handleMedicationSelect(e.target.value)}
                    >
                      <option value="">Select Medication</option>
                      {benefits.map((benefit, index) => (
                        <option key={`med-${benefit.id}-${index}`} value={benefit.medicationName}>
                          {benefit.medicationName}
                        </option>
                      ))}
                      {benefits.length === 0 && (
                        <>
                          <option>Ibuprofen</option>
                          <option>Amoxicillin</option>
                          <option>Paracetamol</option>
                          <option>Metformin</option>
                          <option>Lisinopril</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#26344A', marginBottom: 6 }}>NAPPI Code</label>
                    <input
                      style={{
                        ...input,
                        padding: '8px 12px',
                        fontSize: 13,
                        background: (!!newMedication.medicationName && benefits.some(b => b.medicationName === newMedication.medicationName)) ? 'rgba(34, 197, 94, 0.1)' : input.background
                      }}
                      placeholder="e.g., 7003456"
                      value={(newMedication as any).nappiCode || ''}
                      onChange={(e) => setNewMedication({ ...newMedication, ...({ nappiCode: e.target.value } as any) })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#26344A', marginBottom: 6 }}>Dosage</label>
                    <input
                      style={{
                        ...input,
                        padding: '8px 12px',
                        fontSize: 13,
                        background: (!!newMedication.medicationName && benefits.some(b => b.medicationName === newMedication.medicationName)) ? 'rgba(34, 197, 94, 0.1)' : input.background
                      }}
                      placeholder="e.g., 10 mg once daily"
                      value={newMedication.dosage}
                      onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#26344A', marginBottom: 6 }}>Frequency</label>
                    <input
                      style={{ ...input, padding: '8px 12px', fontSize: 13 }}
                      placeholder="e.g., Twice daily"
                      value={newMedication.frequency}
                      onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#26344A', marginBottom: 6 }}>Duration (days)</label>
                    <input
                      style={{
                        ...input,
                        padding: '8px 12px',
                        fontSize: 13,
                        background: (!!newMedication.medicationName && benefits.some(b => b.medicationName === newMedication.medicationName)) ? 'rgba(34, 197, 94, 0.1)' : input.background
                      }}
                      placeholder="e.g., 10"
                      value={newMedication.duration}
                      onChange={(e) => setNewMedication({ ...newMedication, duration: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#26344A', marginBottom: 6 }}>Quantity</label>
                    <input
                      style={{
                        ...input,
                        padding: '8px 12px',
                        fontSize: 13,
                        background: (!!newMedication.medicationName && benefits.some(b => b.medicationName === newMedication.medicationName)) ? 'rgba(34, 197, 94, 0.1)' : input.background
                      }}
                      placeholder="e.g., 10"
                      value={newMedication.quantity}
                      onChange={(e) => setNewMedication({ ...newMedication, quantity: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#26344A', marginBottom: 6 }}>Refills</label>
                    <input
                      style={{ ...input, padding: '8px 12px', fontSize: 13 }}
                      placeholder="e.g., 0"
                      value={newMedication.refills}
                      onChange={(e) => setNewMedication({ ...newMedication, refills: e.target.value })}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 4', display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                    <button
                      style={{
                        ...btnPrimary,
                        padding: '8px 16px',
                        fontSize: 13,
                        opacity: (!newMedication.medicationName || !newMedication.dosage || !newMedication.quantity) ? 0.5 : 1
                      }}
                      onClick={handleAddMedication}
                      disabled={!newMedication.medicationName || !newMedication.dosage || !newMedication.quantity}
                    >
                      ➕ Add Medication
                    </button>
                  </div>
                </div>
              </div>

              {/* Prescription Details - Smaller Card */}
              <div style={{
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.9)',
                padding: 20,
                border: '1px solid rgba(144, 202, 249, 0.2)',
                marginBottom: 20,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 16px rgba(74, 144, 226, 0.08)'
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(144, 202, 249, 0.2)', color: '#26344A' }}>📋 Prescription Details</h3>
                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '30px', color: '#7E8CA0' }}>
                    <span style={{ fontSize: 20, marginRight: 8, animation: 'spin 1s linear infinite' }}>⏳</span>
                    Loading prescription data...
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {benefits.map((benefit, index) => (
                      <div key={benefit.id}
                        style={{
                          background: 'rgba(248, 250, 252, 0.9)',
                          border: '1px solid rgba(144, 202, 249, 0.3)',
                          borderRadius: 12,
                          padding: 16,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ fontWeight: 700, color: '#26344A', fontSize: 14 }}>{benefit.medicationName}</div>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: 16,
                              fontSize: 11,
                              fontWeight: 600,
                              background: isNonFormulary(benefit) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                              color: isNonFormulary(benefit) ? '#dc2626' : '#16a34a',
                              border: `1px solid ${isNonFormulary(benefit) ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`
                            }}>
                              {isNonFormulary(benefit) ? '❌ Non-Formulary' : '✅ Formulary'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button style={{ ...btnGhost, padding: 6, minWidth: 'auto', width: 28, height: 28, fontSize: 12 }}>✏️</button>
                            <button style={{ ...btnGhost, padding: 6, minWidth: 'auto', width: 28, height: 28, fontSize: 12 }}>🗑️</button>
                          </div>
                        </div>

                        <div style={{ fontSize: 12, color: '#7E8CA0', lineHeight: 1.4 }}>
                          <div style={{ marginBottom: 6 }}>
                            <strong style={{ color: '#26344A' }}>NAPPI:</strong> {(benefit as any).nappiCode || (benefit.medicationName.toLowerCase().includes('paracetamol') ? '702795001' : '78021001')}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
                            <div><strong style={{ color: '#26344A' }}>Dosage:</strong> {benefit.dosage || '1 tablet'}</div>
                            <div><strong style={{ color: '#26344A' }}>Quantity:</strong> {benefit.quantity}</div>
                            <div><strong style={{ color: '#26344A' }}>Duration:</strong> {(benefit as any).duration_days ? `${(benefit as any).duration_days} days` : (index === 0 ? '6 days' : index === 1 ? '5 days' : '14 days')}</div>
                            <div><strong style={{ color: '#26344A' }}>Cost:</strong> R{benefit.cost.toFixed(2)}</div>
                          </div>
                        </div>

                        {!isNonFormulary(benefit) && benefit.medicationName.toLowerCase().includes('paracetamol') && (
                          <div style={{
                            marginTop: 12,
                            background: 'rgba(34, 197, 94, 0.1)',
                            border: '1px dashed rgba(34, 197, 94, 0.3)',
                            color: '#16a34a',
                            padding: '8px 12px',
                            borderRadius: 8,
                            fontSize: 12,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <span>💡 Generic substitute available: Panado Paracetamol 500mg</span>
                            <button style={{ ...btnGhost, padding: '4px 8px', fontSize: 11 }}>🔄 Switch</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Sidebar Cards */}
            <div style={{ width: 280, minWidth: 280 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>


                {/* Pricing Summary - Smaller Card */}
                <div style={{
                  borderRadius: 16,
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: 16,
                  border: '1px solid rgba(144, 202, 249, 0.2)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 16px rgba(74, 144, 226, 0.08)'
                }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#26344A' }}>💰 Pricing Summary</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {prescriptionData && prescriptionData.pricing_summary ? (
                      <>
                        {prescriptionData.pricing_summary.items.map((item: any, index: number) => (
                          <div key={`api-price-${index}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#7E8CA0' }}>
                            <span>{item.name}</span>
                            <span style={{ color: '#26344A', fontWeight: 600 }}>{item.cost}</span>
                          </div>
                        ))}
                        <div style={{ height: 1, background: 'rgba(144, 202, 249, 0.2)', margin: '6px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 13, color: '#7E8CA0' }}>Total Cost</span>
                          <span style={{ fontWeight: 700, color: '#26344A', fontSize: 14 }}>{prescriptionData.pricing_summary.total_cost}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        {benefits.map((b) => (
                          <div key={`price-${b.id}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#7E8CA0' }}>
                            <span>{b.medicationName} ({b.quantity})</span>
                            <span style={{ color: '#26344A', fontWeight: 600 }}>{b.cost.toLocaleString(undefined, { style: 'currency', currency: 'ZAR' })}</span>
                          </div>
                        ))}
                        <div style={{ height: 1, background: 'rgba(144, 202, 249, 0.2)', margin: '6px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 13, color: '#7E8CA0' }}>Total Estimated Cost</span>
                          <span style={{ fontWeight: 700, color: '#26344A', fontSize: 14 }}>{totalCost.toLocaleString(undefined, { style: 'currency', currency: 'ZAR' })}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* NAPPI Validation - Smaller Card */}
                <div style={{
                  borderRadius: 16,
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: 16,
                  border: '1px solid rgba(144, 202, 249, 0.2)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 16px rgba(74, 144, 226, 0.08)'
                }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#26344A' }}>🔍 NAPPI Validation</h3>
                  <p style={{ fontSize: 13, color: prescriptionData ? '#16a34a' : (needsReview ? '#d97706' : '#7E8CA0') }}>
                    {prescriptionData ? prescriptionData.nappi_validation || 'All NAPPI codes validated successfully' : (needsReview ? '1 item requires validation' : 'All medications have valid NAPPI codes.')}
                  </p>
                </div>

                {/* Quick Reference - Smaller Card */}
                <div style={{
                  borderRadius: 16,
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: 16,
                  border: '1px solid rgba(144, 202, 249, 0.2)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 16px rgba(74, 144, 226, 0.08)'
                }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#26344A' }}>📚 Quick Reference</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button style={{ ...btnGhost, padding: '8px 12px', fontSize: 12, justifyContent: 'flex-start' }}>📋 SAP Treatment Formulary</button>
                    <button style={{ ...btnGhost, padding: '8px 12px', fontSize: 12, justifyContent: 'flex-start' }}>⚠️ Drug Interactions</button>
                    <button style={{ ...btnGhost, padding: '8px 12px', fontSize: 12, justifyContent: 'flex-start' }}>🚫 Common Allergens</button>
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

export default PharmacyBenefitManagement;
