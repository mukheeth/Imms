import React, { useEffect, useState } from 'react';

type PreAuthProps = {
  onNavigate?: (route: 'serious-injury') => void;
};

function PreAuthorizationRequest({ onNavigate }: PreAuthProps) {
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const handleSaveDraft = async () => {
    setIsSavingDraft(true); // set the state to true to indicate that the draft is being saved
    try {
      console.log('Starting draft save...');

      // 1) Create/Update Order first (contains treatment details)
      // Get current date for orderDate (required field)
      const currentDate = new Date().toISOString();

      // Use provided dates or default to current date for required fields
      const effectiveStartDate = startDate || new Date().toISOString().split('T')[0];
      const effectiveEndDate = endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days from now

      const orderPayload: any = {
        orderDate: currentDate,                             // REQUIRED: Current timestamp
        fromDateOfService: effectiveStartDate,               // REQUIRED: Start date
        toDateOfService: effectiveEndDate,                           // REQUIRED: End date
        orderType: treatmentType || drugDescription || 'Medical Treatment', // REQUIRED: Order type
        orderDescription: drugDescription || injuryDescription || '',
        orderIcdCode: icdCode || '',
        orderStatus: 'DRAFT',                                        // Set as DRAFT status
        orderPriority: 'MEDIUM',                                     // Default priority
        icddrugname: drugDescription || '',
        icddrugType: drugType || '',
        icdnumberofchempresent: noOfChemo || '',
        icddrugamtdispensed: quantity || '',
        icddrugamtdispensedType: quantityUnit || '',
        providerNpiNumber: providerNPI || '',
        insuranceId: insuranceId || '',
        providerName: providerName || '',
        uniquepatientI: patientId || '',                            // ADD: Patient ID for lookup
        units: parseInt(quantity || '0') || 0,
        deletedStatus: false
      };

      console.log('Saving order:', orderPayload);
      const orderRes = await fetch('http://localhost:8082/orders/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (orderRes.ok) {
        const orderData = await orderRes.json();
        const savedOrderId = orderData?.orderId;
        if (savedOrderId) {
          setOrderIdAuth(savedOrderId);
          console.log('Order saved successfully:', savedOrderId);
        }
      }

      // 2) Create/Update Patient
      if (patientName || dateOfBirth || injuryDate) {
        const patientPayload: any = {
          fullName: patientName || '',
          dateOfBirth: dateOfBirth || null,                    // LocalDate format
          subscriberId: patientId || '',
          insuranceId: insuranceId || '',
          facilityName: providerName || '',
          fromDateOfService: effectiveStartDate || null,       // LocalDate format
          toDateOfService: effectiveEndDate || null,           // LocalDate format
          icdCode: icdCode || '',
          procedureCode: treatmentType || '',
          dateOfService: injuryDate || '',
          description: injuryDescription || '',
          contactNumber: providerContact || '',
          gender: ''                                            // Optional field
        };

        console.log('Saving patient:', patientPayload);
        const patientRes = await fetch('http://localhost:8082/patient/write', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patientPayload),
        });

        if (patientRes.ok) {
          const patientData = await patientRes.json();
          console.log('Patient saved successfully:', patientData?.patientId);
        }
      }

      // 3) Create/Update Provider
      if (providerName || providerNPI) {
        const providerPayload: any = {
          npiNumber: providerNPI || '',
          providerName: providerName || '',
          providerType: providerType || '',
          providerContact: providerContact || '',
          taxId: taxId || '',
        };

        console.log('Saving provider:', providerPayload);
        const providerRes = await fetch('http://localhost:8082/provider/write', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(providerPayload),
        });

        if (providerRes.ok) {
          const providerData = await providerRes.json();
          const savedProviderId = providerData?.providerId;
          if (savedProviderId) {
            setProviderIdAuth(savedProviderId);
            console.log('Provider saved successfully:', savedProviderId);
          }
        }
      }

      // 4) Create/Update Insurance
      if (payerName || payerId) {
        const insurancePayload: any = {
          payerName: payerName || '',
          payerId: payerId || '',
          payerContact: payerContact || '',
          address: payerAddress || '',
        };

        console.log('Saving insurance:', insurancePayload);
        const insuranceRes = await fetch('http://localhost:8082/insurance/write', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(insurancePayload),
        });

        if (insuranceRes.ok) {
          const insuranceData = await insuranceRes.json();
          const savedInsuranceId = insuranceData?.insuranceId;
          if (savedInsuranceId) {
            setInsuranceIdAuth(savedInsuranceId);
            console.log('Insurance saved successfully:', savedInsuranceId);
          }
        }
      }

      // Show success message
      alert('✅ Draft saved successfully! All data has been saved to the database.');
      console.log('Draft save completed successfully');

    } catch (error) {
      console.error('Error saving draft:', error);
      alert('❌ Error saving draft. Please try again.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmitRequest = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // 1) Create or update patient - try update first, then create if needed
      let patientIdAuth = null;

      // Try to update existing patient first
      if (patientId) {
        const updatePatientPayload: any = {
          fullName: patientName,
          dateOfBirth: dateOfBirth,
          subscriberId: patientId,
          insuranceId: insuranceId,
          facilityName: providerName,
          fromDateOfService: startDate,
          toDateOfService: endDate,
          icdCode: icdCode,
          precertificationType: '',
          procedureCode: treatmentType,
          dateOfService: injuryDate,
          description: injuryDescription,
          contactNumber: providerContact,
        };

        try {
          const updateRes = await fetch(`http://localhost:8082/patient/editpatient?customPatientId=${encodeURIComponent(patientId)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatePatientPayload),
          });

          if (updateRes.ok) {
            const updateJson = await updateRes.json();
            patientIdAuth = updateJson?.patientId ?? null;
            console.log('Patient updated successfully:', patientIdAuth);
          }
        } catch (error) {
          console.log('Patient update failed, will try to create new patient');
        }
      }

      // If update failed or no patientId, try to create new patient
      if (!patientIdAuth && patientName) {
        const createPatientPayload: any = {
          fullName: patientName,
          dateOfBirth: dateOfBirth,
          subscriberId: patientId || '',
          insuranceId: insuranceId,
          facilityName: providerName || '',
          fromDateOfService: startDate,
          toDateOfService: endDate,
          icdCode: icdCode,
          precertificationType: '',
          procedureCode: treatmentType,
          dateOfService: injuryDate,
          description: injuryDescription,
          contactNumber: providerContact || '',
        };

        try {
          console.log('Creating patient with payload:', createPatientPayload);
          const patientRes = await fetch('http://localhost:8082/patient/write', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createPatientPayload),
          });

          if (patientRes.ok) {
            const patientJson = await patientRes.json();
            patientIdAuth = patientJson?.patientId ?? null;
            console.log('Patient created successfully:', patientIdAuth);
          } else {
            console.error('Patient creation failed:', patientRes.status);
            const errorText = await patientRes.text();
            console.error('Error details:', errorText);
          }
        } catch (error) {
          console.error('Patient creation error:', error);
        }
      }

      // 2) Create or update provider - try update first, then create if needed
      let providerId = providerIdAuth;

      // Try to update existing provider first
      if (providerNPI && providerIdAuth) {
        const updateProviderPayload: any = {
          npiNumber: providerNPI,
          providerName: providerName,
          providerType: providerType,
          providerContact: providerContact,
          taxId: taxId,
        };

        try {
          const updateRes = await fetch(`http://localhost:8082/provider/edit/${providerNPI}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateProviderPayload),
          });

          if (updateRes.ok) {
            const updateJson = await updateRes.json();
            providerId = updateJson?.providerId ?? providerId;
            console.log('Provider updated successfully:', providerId);
          }
        } catch (error) {
          console.log('Provider update failed, will try to create new provider');
        }
      }

      // If update failed or no existing provider, try to create new provider
      if (!providerId && providerName && providerNPI) {
        const createProviderPayload: any = {
          npiNumber: providerNPI,
          providerName: providerName,
          providerType: providerType,
          providerContact: providerContact,
          taxId: taxId,
        };

        try {
          console.log('Creating provider with payload:', createProviderPayload);
          const providerRes = await fetch('http://localhost:8082/provider/write', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createProviderPayload),
          });

          if (providerRes.ok) {
            const providerJson = await providerRes.json();
            providerId = providerJson?.providerId ?? providerId;
            console.log('Provider created successfully:', providerId);
          } else {
            console.error('Provider creation failed:', providerRes.status);
          }
        } catch (error) {
          console.error('Provider creation error:', error);
        }
      }

      if (providerId) setProviderIdAuth(providerId);

      // 3) Create or update insurance (prefer update by customInsuranceId if present)
      const insurancePayload: any = {
        payerName: payerName,
        payerId: payerId,
        payerContact: payerContact,
        address: payerAddress,
      };
      let insuranceIdFinal = insuranceIdAuth;
      if (insuranceId) {
        const insUp = await fetch(`http://localhost:8082/insurance/update?customInsuranceId=${encodeURIComponent(insuranceId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(insurancePayload),
        });
        const insJson = insUp.ok ? await insUp.json() : null;
        insuranceIdFinal = insJson?.insuranceId ?? insuranceIdFinal;
      } else if (payerName?.trim()) {
        const insWrite = await fetch('http://localhost:8082/insurance/write', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(insurancePayload),
        });
        const insJson = insWrite.ok ? await insWrite.json() : null;
        insuranceIdFinal = insJson?.insuranceId ?? insuranceIdFinal;
      }
      if (insuranceIdFinal) setInsuranceIdAuth(insuranceIdFinal);

      // 4) Create authorization if we have the minimum required ids
      let authSuccess = false;
      console.log('Checking authorization requirements:', { providerId, insuranceIdFinal, orderIdAuth });

      if (providerId && insuranceIdFinal) {
        const authorizationData = {
          provider: { providerId },
          insurance: { insuranceId: insuranceIdFinal },
          practice: { practiceId: 1 },
          ...(orderIdAuth && { order: { orderId: orderIdAuth } }),
          ...(patientIdAuth && { patient: { patientId: patientIdAuth } }),
        };

        console.log('Creating authorization with data:', authorizationData);

        try {
          // Try create-full endpoint first (handles all relationships)
          const authRes = await fetch('http://localhost:8082/authorizations/create-full', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(authorizationData),
          });

          if (authRes.ok) {
            const authData = await authRes.json();
            console.log('Authorization created successfully:', authData);
            authSuccess = true;
          } else {
            console.warn('Authorization creation failed with status:', authRes.status);
            const errorText = await authRes.text();
            console.warn('Authorization error details:', errorText);
            // Continue with navigation even if authorization creation fails
            authSuccess = true;
          }
        } catch (error) {
          console.warn('Authorization creation error:', error);
          // Continue with navigation even if authorization creation fails
          authSuccess = true;
        }
      } else {
        console.warn('Missing required IDs for authorization creation');
        console.log('Available IDs:', { providerId, insuranceIdFinal, orderIdAuth, patientIdAuth });
        // For now, proceed with navigation even without authorization
        authSuccess = true;
      }

      // 5) Store data in sessionStorage for the serious injury page to access
      const assessmentData = {
        caseId: patientId || `CASE-${Date.now()}`,
        patientName: patientName,
        injuryType: drugDescription || treatmentType || 'Medical Treatment',
        severity: 'MEDIUM',
        assessmentDate: new Date().toISOString().split('T')[0],
        recommendations: injuryDescription || drugDescription || '',
        status: 'PENDING',
        icdCode: icdCode,
        providerId: providerId,
        insuranceId: insuranceIdFinal,
        orderId: orderIdAuth,
        patientIdAuth: patientIdAuth
      };

      // Store the assessment data for the serious injury page
      try {
        sessionStorage.setItem('imms.currentAssessment', JSON.stringify(assessmentData));
        console.log('Assessment data stored:', assessmentData);
      } catch (error) {
        console.error('Failed to store assessment data:', error);
      }

      // 6) Navigate to Injury Assessment page
      console.log('Navigating to serious injury assessment page');
      onNavigate && onNavigate('serious-injury');
    } catch (e) {
      console.error('Submit failed', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [patientId, setPatientId] = useState<string>('');
  const [patientName, setPatientName] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [injuryDate, setInjuryDate] = useState<string>('');
  const [injuryDescription, setInjuryDescription] = useState<string>('');

  const [providerName, setProviderName] = useState<string>('');
  const [providerType, setProviderType] = useState<string>('');

  const [treatmentType, setTreatmentType] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [providerNPI, setProviderNPI] = useState<string>('');
  const [insuranceId, setInsuranceId] = useState<string>('');
  const [providerContact, setProviderContact] = useState<string>('');
  const [taxId, setTaxId] = useState<string>('');
  const [providerIdAuth, setProviderIdAuth] = useState<number | null>(null);
  const [insuranceIdAuth, setInsuranceIdAuth] = useState<number | null>(null);
  const [orderIdAuth, setOrderIdAuth] = useState<number | null>(null);
  const [patientOptions, setPatientOptions] = useState<any[]>([]);
  const [patientLoading, setPatientLoading] = useState<boolean>(false);
  const [showPatientSuggestions, setShowPatientSuggestions] = useState<boolean>(false);

  // Treatment fields aligned with Chemo's authorization request
  const [icdCode, setIcdCode] = useState<string>('');
  const [drugType, setDrugType] = useState<string>('');
  const [noOfChemo, setNoOfChemo] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [quantityUnit, setQuantityUnit] = useState<string>('');
  const [drugDescription, setDrugDescription] = useState<string>('');

  // Insurance fields similar to Chemo
  const [payerName, setPayerName] = useState<string>('');
  const [payerId, setPayerID] = useState<string>('');
  const [payerAddress, setPayerAddress] = useState<string>('');
  const [payerContact, setPayerContact] = useState<string>('');

  const getPat = async () => {
    try {
      if (!patientId) return;
      const ordersRes = await fetch(`http://localhost:8082/orders/exists?patId=${patientId}`);
      const orders = ordersRes.ok ? await ordersRes.json() : [];
      if (orders.length > 0) {
        const firstOrder = orders[0];
        const nextNpi: string = firstOrder.providerNpiNumber || '';
        const nextInsuranceId: string = firstOrder.insuranceId || '';
        setProviderNPI(nextNpi);
        setInsuranceId(nextInsuranceId);
        if (firstOrder.orderId) setOrderIdAuth(firstOrder.orderId);
        setStartDate(firstOrder.fromDateOfService || '');
        setEndDate(firstOrder.toDateOfService || '');
        // Treatment justification handled in drug description
        if (firstOrder.icddrugname) {
          setDrugDescription(firstOrder.icddrugname);
        } else if (firstOrder.orderDescription) {
          setDrugDescription(firstOrder.orderDescription);
        }
        if (firstOrder.orderIcdCode) setIcdCode(firstOrder.orderIcdCode);
        if (firstOrder.icddrugType) setDrugType(firstOrder.icddrugType);
        if (firstOrder.icdnumberofchempresent) setNoOfChemo(firstOrder.icdnumberofchempresent);
        if (firstOrder.icddrugamtdispensed) setQuantity(firstOrder.icddrugamtdispensed);
        if (firstOrder.icddrugamtdispensedType) setQuantityUnit(firstOrder.icddrugamtdispensedType);

        // Fetch provider with local NPI to avoid async state timing
        if (nextNpi) {
          const providerRes = await fetch(`http://localhost:8082/provider?npiNumber=${nextNpi}`);
          if (providerRes.ok) {
            const pr = await providerRes.json();
            setProviderName(pr.providerName || '');
            setProviderType(pr.providerType || '');
            if (pr.providerContact) setProviderContact(pr.providerContact);
            if (pr.taxId) setTaxId(pr.taxId);
            if (pr.providerId) setProviderIdAuth(pr.providerId);
          }
        }

        // Fetch insurance with local id as needed
        if (nextInsuranceId) {
          try {
            const insRes = await fetch(`http://localhost:8082/insurance/fetch?customInsuranceId=${nextInsuranceId}`);
            if (insRes.ok) {
              const insuranceData = await insRes.json();
              setInsuranceIdAuth(insuranceData.insuranceId ?? null);
              setPayerName(insuranceData.payerName || insuranceData.name || '');
              if (insuranceData.payerId) setPayerID(insuranceData.payerId);
              if (insuranceData.address) setPayerAddress(insuranceData.address);
              if (insuranceData.payerContact) setPayerContact(insuranceData.payerContact);
            }
          } catch {
            // ignore non-critical insurance fetch errors
          }
        }
      }

      const patientRes = await fetch(`http://localhost:8082/patient/${patientId}`);
      if (patientRes.ok) {
        const p = await patientRes.json();
        setPatientName(p.fullName || '');
        setDateOfBirth(p.dateOfBirth || '');
        setInjuryDate(p.dateOfService || '');
        if (p.description) setInjuryDescription(p.description);
        if (p.procedureCode) setTreatmentType(p.procedureCode);
        if (p.icdCode) setIcdCode(p.icdCode);
        if (p.fromDateOfService) setStartDate(p.fromDateOfService);
        if (p.toDateOfService) setEndDate(p.toDateOfService);
      }

      // Note: provider and insurance lookups are handled above when orders exist
    } catch (e) {
      // Non-blocking: keep UI intact if lookups fail
      // console.error('PreAuth autofill failed', e);
    }
  };

  useEffect(() => {
    if (patientId) {
      getPat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, providerNPI, insuranceId]);

  // Debounced patient search by name (like Chemo)
  useEffect(() => {
    const controller = new AbortController();
    const doSearch = async () => {
      const q = patientName.trim();
      if (q.length < 2) {
        setPatientOptions([]);
        setShowPatientSuggestions(false);
        return;
      }
      setPatientLoading(true);
      try {
        const res = await fetch(`http://localhost:8082/patient/search?query=${encodeURIComponent(q)}`, { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          setPatientOptions(Array.isArray(data) ? data : []);
          setShowPatientSuggestions(true);
        } else {
          setPatientOptions([]);
          setShowPatientSuggestions(false);
        }
      } catch {
        setPatientOptions([]);
        setShowPatientSuggestions(false);
      } finally {
        setPatientLoading(false);
      }
    };
    const t = setTimeout(doSearch, 400);
    return () => { clearTimeout(t); controller.abort(); };
  }, [patientName]);
  // Clinical Research Hospital Styling - Hospital Industry Typography
  const page: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #F0F4F8 0%, #E8F0FE 50%, #E6F2F2 100%)',
    padding: '32px 40px',
    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif",
    color: '#26344A',
    animation: 'fadeIn 0.6s ease-out',
    fontSize: 14,
    lineHeight: 1.6
  };
  const container: React.CSSProperties = { maxWidth: 1200, margin: '0 auto' };

  // Primary heading - Hospital industry standard
  const h1: React.CSSProperties = {
    fontSize: 28,
    fontWeight: 700,
    color: '#26344A',
    letterSpacing: '-0.02em',
    lineHeight: 1.3,
    margin: 0
  };

  // Secondary text - WCAG AA compliant
  const muted: React.CSSProperties = {
    color: '#7E8CA0',
    fontSize: 15,
    lineHeight: 1.5,
    marginTop: 6,
    fontWeight: 400,
    maxWidth: '65ch' // Optimal line length
  };
  // Button styles - Hospital industry standard
  const btn: React.CSSProperties = {
    height: 44,
    borderRadius: 8,
    padding: '0 20px',
    fontSize: 14,
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 8px rgba(74, 144, 226, 0.1)',
    textDecoration: 'none',
    fontFamily: 'inherit'
  };
  const btnGhost: React.CSSProperties = {
    ...btn,
    background: 'rgba(248, 250, 252, 0.9)',
    color: '#307AFE',
    border: '1px solid rgba(144, 202, 249, 0.4)'
  };
  const btnPrimary: React.CSSProperties = {
    ...btn,
    background: 'linear-gradient(135deg, #307AFE 0%, #34A853 100%)',
    color: '#FAFBFC',
    boxShadow: '0 4px 16px rgba(74, 144, 226, 0.3)',
    fontWeight: 600
  };
  const card: React.CSSProperties = {
    borderRadius: 20,
    border: '1px solid rgba(144, 202, 249, 0.2)',
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(74, 144, 226, 0.08)',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    animation: 'slideUp 0.8s ease-out forwards'
  };
  // Section headers - Hospital industry hierarchy
  const sectionHeader: React.CSSProperties = {
    padding: '20px 28px',
    borderBottom: '1px solid rgba(232, 240, 254, 0.5)',
    fontSize: 18,
    fontWeight: 700,
    color: '#26344A',
    background: 'rgba(232, 240, 254, 0.3)',
    lineHeight: 1.4,
    letterSpacing: '-0.01em'
  };
  const sectionBody: React.CSSProperties = { padding: 28 };

  // Form inputs - Hospital industry standard
  const input: React.CSSProperties = {
    width: '100%',
    borderRadius: 8,
    padding: '12px 16px',
    background: 'rgba(248, 250, 252, 0.8)',
    border: '1px solid rgba(144, 202, 249, 0.3)',
    color: '#26344A',
    fontSize: 14,
    fontWeight: 400,
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    lineHeight: 1.5
  };
  const inputGroup: React.CSSProperties = { display: 'flex', gap: 12, alignItems: 'center' };

  // Form labels - WCAG AA compliant
  const label: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#7E8CA0',
    marginBottom: 8,
    letterSpacing: '0.02em',
    lineHeight: 1.4
  };

  // Animation styles
  const fadeInStyle = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  return (
    <>
      <style>{fadeInStyle}</style>
      <main style={page}>
        <div style={container}>
          {/* Header Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '32px 40px',
            borderBottom: '1px solid rgba(144, 202, 249, 0.2)',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '0 0 24px 24px',
            margin: '0 0 32px 0',
            boxShadow: '0 8px 32px rgba(74, 144, 226, 0.1)',
            animation: 'fadeIn 0.6s ease-out'
          }}>
            <div>
              <h2 style={h1}>Pre-Authorization Request</h2>
              <p style={muted}>Complete the form to submit a pre-authorization request for medical treatment.</p>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <button
                style={{
                  ...btnGhost,
                  opacity: isSavingDraft ? 0.6 : 1,
                  cursor: isSavingDraft ? 'not-allowed' : 'pointer'
                }}
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
                onMouseEnter={(e) => {
                  if (!isSavingDraft) {
                    e.currentTarget.style.background = 'rgba(232, 240, 254, 0.9)';
                    e.currentTarget.style.borderColor = 'rgba(144, 202, 249, 0.6)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(74, 144, 226, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSavingDraft) {
                    e.currentTarget.style.background = 'rgba(248, 250, 252, 0.9)';
                    e.currentTarget.style.borderColor = 'rgba(144, 202, 249, 0.4)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(74, 144, 226, 0.1)';
                  }
                }}
              >
                {isSavingDraft ? '💾 Saving...' : '💾 Save Draft'}
              </button>
              <button
                style={btnPrimary}
                onClick={handleSubmitRequest}
                disabled={isSubmitting}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(74, 144, 226, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(74, 144, 226, 0.3)';
                  }
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32, marginTop: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <section style={card}>
                <div style={sectionHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: '#E8F0FE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      👤
                    </div>
                    Claimant Information
                  </div>
                </div>
                <div style={{ ...sectionBody, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                  <div>
                    <label style={label}>Claim Number</label>
                    <input
                      style={input}
                      placeholder="RAF123456789"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#4A90E2';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(144, 202, 249, 0.3)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <label style={label}>Claimant Name</label>
                    <input
                      style={input}
                      placeholder="John Doe"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      onFocus={(e) => {
                        patientOptions.length > 0 && setShowPatientSuggestions(true);
                        e.currentTarget.style.borderColor = '#4A90E2';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                      }}
                      onBlur={(e) => {
                        setTimeout(() => setShowPatientSuggestions(false), 150);
                        e.currentTarget.style.borderColor = 'rgba(144, 202, 249, 0.3)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                    {showPatientSuggestions && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid rgba(144, 202, 249, 0.3)',
                        borderRadius: 12,
                        zIndex: 10,
                        maxHeight: 220,
                        overflowY: 'auto',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 8px 32px rgba(74, 144, 226, 0.15)',
                        marginTop: 4
                      }}>
                        {patientLoading && (
                          <div style={{ padding: 16, color: '#5A6C7D' }}>Loading...</div>
                        )}
                        {!patientLoading && patientOptions.length === 0 && (
                          <div style={{ padding: 16, color: '#5A6C7D' }}>No results</div>
                        )}
                        {!patientLoading && patientOptions.map((opt: any, idx: number) => {
                          const name = opt.fullName || opt.name || `${opt.firstName ?? ''} ${opt.lastName ?? ''}`.trim();
                          const pid = opt.patientId || opt.id || '';
                          return (
                            <div
                              key={pid ? `${pid}` : `${name}-${idx}`}
                              style={{
                                padding: 12,
                                cursor: 'pointer',
                                borderBottom: '1px solid rgba(232, 240, 254, 0.5)',
                                transition: 'background-color 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(232, 240, 254, 0.5)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setPatientName(name);
                                if (pid) setPatientId(String(pid));
                                setShowPatientSuggestions(false);
                              }}
                            >
                              <div style={{ fontWeight: 600, color: '#222E3E' }}>{name || 'Unknown'}</div>
                              {pid && <div style={{ fontSize: 12, color: '#5A6C7D' }}>{pid}</div>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={label}>Date of Birth</label>
                    <input
                      style={input}
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#4A90E2';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(144, 202, 249, 0.3)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <label style={label}>Injury Date</label>
                    <input
                      style={input}
                      type="date"
                      value={injuryDate}
                      onChange={(e) => setInjuryDate(e.target.value)}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#4A90E2';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(144, 202, 249, 0.3)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={label}>Injury Description</label>
                    <textarea
                      style={{
                        ...input,
                        minHeight: 96,
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                      placeholder="Describe the injury in detail..."
                      value={injuryDescription}
                      onChange={(e) => setInjuryDescription(e.target.value)}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#4A90E2';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(144, 202, 249, 0.3)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              </section>

              <section style={card}>
                <div style={sectionHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: '#E0F2F1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      🏥
                    </div>
                    Medical Provider
                  </div>
                </div>
                <div style={{ ...sectionBody, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                  <div>
                    <label style={label}>Provider Name</label>
                    <input
                      style={input}
                      placeholder="Dr. Smith Medical Practice"
                      value={providerName}
                      onChange={(e) => setProviderName(e.target.value)}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#4A90E2';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(144, 202, 249, 0.3)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <label style={label}>Provider Type</label>
                    <input
                      style={input}
                      placeholder="Specialist, General Practitioner, etc."
                      value={providerType}
                      onChange={(e) => setProviderType(e.target.value)}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#4A90E2';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(144, 202, 249, 0.3)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <label style={label}>Provider Contact</label>
                    <input
                      style={input}
                      placeholder="Phone number or email"
                      value={providerContact}
                      onChange={(e) => setProviderContact(e.target.value)}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#4A90E2';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(144, 202, 249, 0.3)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <label style={label}>Provider NPI Number</label>
                    <input
                      style={input}
                      placeholder="10-digit NPI number"
                      value={providerNPI}
                      onChange={(e) => setProviderNPI(e.target.value)}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#4A90E2';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(144, 202, 249, 0.3)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <label style={label}>Tax ID</label>
                    <input
                      style={input}
                      placeholder="Provider Tax ID"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#4A90E2';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(144, 202, 249, 0.3)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              </section>

              <section style={card}>
                <div style={sectionHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: '#F3E5F5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      💊
                    </div>
                    Treatment Details
                  </div>
                </div>
                <div style={{ ...sectionBody, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                  <div>
                    <label style={label}>Drug Description</label>
                    <input
                      style={input}
                      placeholder="Medication or treatment description"
                      value={drugDescription}
                      onChange={(e) => setDrugDescription(e.target.value)}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#4A90E2';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(144, 202, 249, 0.3)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <label style={label}>ICD Code</label>
                    <input
                      style={input}
                      placeholder="ICD-10 Code (e.g., M79.3)"
                      value={icdCode}
                      onChange={(e) => setIcdCode(e.target.value)}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#4A90E2';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(144, 202, 249, 0.3)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <label style={label}>Drug Type</label>
                    <input
                      style={input}
                      placeholder="Medication category"
                      value={drugType}
                      onChange={(e) => setDrugType(e.target.value)}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#4A90E2';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(144, 202, 249, 0.3)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <label style={label}>Number of Treatments</label>
                    <input
                      style={input}
                      placeholder="Number of sessions"
                      value={noOfChemo}
                      onChange={(e) => setNoOfChemo(e.target.value)}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#4A90E2';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(144, 202, 249, 0.3)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <label style={label}>Quantity</label>
                    <div style={inputGroup}>
                      <input
                        style={{ ...input, flex: 2 }}
                        placeholder="Amount"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#4A90E2';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(144, 202, 249, 0.3)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                      <select
                        style={{ ...input, flex: 1 }}
                        value={quantityUnit}
                        onChange={(e) => setQuantityUnit(e.target.value)}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#4A90E2';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(144, 202, 249, 0.3)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <option value="">Unit</option>
                        <option value="ml">ml</option>
                        <option value="mg">mg</option>
                        <option value="mcg">mcg</option>
                        <option value="days">days</option>
                        <option value="IV">IV</option>
                        <option value="UI">UI</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={label}>Start Date</label>
                    <input
                      style={input}
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#4A90E2';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(144, 202, 249, 0.3)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <label style={label}>End Date</label>
                    <input
                      style={input}
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#4A90E2';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(144, 202, 249, 0.3)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              </section>

              <section style={card}>
                <div style={sectionHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: '#FFF3E0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      🏛️
                    </div>
                    RAF Details
                  </div>
                </div>
                <div style={{ ...sectionBody, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                  <div>
                    <label style={label}>Region / Province</label>
                    <input
                      style={input}
                      placeholder="Insurance company name"
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#4A90E2';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(144, 202, 249, 0.3)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <label style={label}>Office Name</label>
                    <input
                      style={input}
                      placeholder="Office Name"
                      value={payerId}
                      onChange={(e) => setPayerID(e.target.value)}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#4A90E2';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(144, 202, 249, 0.3)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <label style={label}>Typical Coverage Area</label>
                    <input
                      style={input}
                      placeholder="Typical Coverage Area"
                      value={payerAddress}
                      onChange={(e) => setPayerAddress(e.target.value)}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#4A90E2';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(144, 202, 249, 0.3)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <label style={label}> Routing Code</label>
                    <input
                      style={input}
                      placeholder=" Routing Code"
                      value={payerContact}
                      onChange={(e) => setPayerContact(e.target.value)}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#4A90E2';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(144, 202, 249, 0.3)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              </section>

              <section style={card}>
                <div style={sectionHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: '#E8F5E8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      📎
                    </div>
                    File Attachments
                  </div>
                </div>
                <div style={sectionBody}>
                  <div style={{
                    border: '2px dashed rgba(144, 202, 249, 0.4)',
                    borderRadius: 16,
                    padding: 32,
                    textAlign: 'center',
                    background: 'rgba(232, 240, 254, 0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(74, 144, 226, 0.6)';
                      e.currentTarget.style.background = 'rgba(232, 240, 254, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(144, 202, 249, 0.4)';
                      e.currentTarget.style.background = 'rgba(232, 240, 254, 0.2)';
                    }}
                  >
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
                    <p style={{ fontWeight: 600, color: '#222E3E', fontSize: 16, marginBottom: 8 }}>
                      Drag and drop files here, or click to browse
                    </p>
                    <p style={{ ...muted, fontSize: 13 }}>
                      PDF, JPG, PNG up to 10MB • Medical records, test results, referral letters
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <aside style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <section style={card}>
                <div style={sectionHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: '#E8F5E8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      ✅
                    </div>
                    Authorization Levels
                  </div>
                </div>
                <ul style={{ ...sectionBody as React.CSSProperties, paddingTop: 0, margin: 0, listStyle: 'none' }}>
                  {[
                    ['Approved', 'Level 1 Authorization', '#A8D5BA'],
                    ['Pending', 'Level 2 Authorization', '#FFE082'],
                    ['Not Started', 'Level 3 Authorization', '#E0E0E0'],
                  ].map(([title, subtitle, color], index) => (
                    <li key={title as string} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '16px 0',
                      borderTop: index > 0 ? '1px solid rgba(232, 240, 254, 0.5)' : 'none',
                      animation: `slideUp 0.8s ease-out ${index * 100}ms both`
                    }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: color,
                        fontSize: 20
                      }}>
                        {index === 0 ? '✓' : index === 1 ? '⏳' : '○'}
                      </div>
                      <div>
                        <p style={{
                          fontWeight: 600,
                          color: '#26344A',
                          marginBottom: 4,
                          fontSize: 14,
                          lineHeight: 1.4
                        }}>{title}</p>
                        <p style={{
                          color: '#7E8CA0',
                          fontSize: 12,
                          lineHeight: 1.4,
                          fontWeight: 400
                        }}>{subtitle}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section style={card}>
                <div style={sectionHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: '#E8F0FE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      🔍
                    </div>
                    Validation Status
                  </div>
                </div>
                <div style={{ ...sectionBody, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {['Claim Number Validated', 'Provider Information Verified', 'Treatment Plan Justified'].map((label, i) => (
                    <label key={label} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      cursor: 'pointer',
                      padding: '8px 12px',
                      borderRadius: 8,
                      transition: 'background-color 0.2s ease'
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(232, 240, 254, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <input
                        type="checkbox"
                        defaultChecked={i < 2}
                        style={{
                          width: 18,
                          height: 18,
                          accentColor: '#4A90E2'
                        }}
                      />
                      <span style={{
                        color: '#26344A',
                        fontSize: 14,
                        fontWeight: 500,
                        lineHeight: 1.4
                      }}>{label}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section style={card}>
                <div style={sectionHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: '#FFF3E0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      📞
                    </div>
                    Quick Reference
                  </div>
                </div>
                <div style={sectionBody}>
                  <div style={{
                    padding: 20,
                    borderRadius: 12,
                    background: 'rgba(232, 240, 254, 0.3)',
                    border: '1px solid rgba(144, 202, 249, 0.2)'
                  }}>
                    <p style={{
                      color: '#7E8CA0',
                      fontSize: 14,
                      lineHeight: 1.6,
                      fontWeight: 400,
                      margin: 0
                    }}>
                      For assistance, contact the Pre-Authorization Support Team at{' '}
                      <span style={{
                        color: '#307AFE',
                        fontWeight: 600,
                        textDecoration: 'underline'
                      }}>
                        (555) 123-4567
                      </span>
                      {' '}or email{' '}
                      <span style={{
                        color: '#307AFE',
                        fontWeight: 600,
                        textDecoration: 'underline'
                      }}>
                        support@imms.com
                      </span>.
                    </p>
                    <div style={{
                      marginTop: 16,
                      padding: 12,
                      background: 'rgba(168, 213, 186, 0.2)',
                      borderRadius: 8,
                      borderLeft: '4px solid #34A853'
                    }}>
                      <p style={{
                        fontSize: 12,
                        color: '#7E8CA0',
                        margin: 0,
                        lineHeight: 1.5,
                        fontWeight: 400
                      }}>
                        💡 Tip: Have your claim number and provider NPI ready when calling for faster assistance.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

export default PreAuthorizationRequest;