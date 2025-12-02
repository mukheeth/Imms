import React, { useState, useEffect } from 'react';
import { apiService, Claim } from '../services/api';

function ClaimsAndBillReview() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaims, setSelectedClaims] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [rejectionReasons, setRejectionReasons] = useState<string[]>([]);

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
    transition: 'all 0.2s ease'
  };
  const select: React.CSSProperties = { ...input };

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      setLoading(true);
      // Temporarily bypass API call to ensure dummy data loads
      // const data = await apiService.getAllClaims();
      // setClaims(data);
      throw new Error('Using dummy data');
    } catch (error) {
      console.error('Error loading claims:', error);
      // Fallback to mock data
      setClaims([
        {
          id: 1,
          invoiceId: 'INV-20251001',
          provider: 'MetroCare Hospital',
          claimant: 'John Smith',
          date: '2025-10-12',
          amount: 7500.00,
          validationStatus: 'CHECKED',
          status: 'APPROVED'
        },
        {
          id: 2,
          invoiceId: 'INV-20251002',
          provider: 'Lifeline Clinic',
          claimant: 'Sarah Johnson',
          date: '2025-10-13',
          amount: 4200.00,
          validationStatus: 'CHECKED',
          status: 'PENDING REVIEW'
        },
        {
          id: 3,
          invoiceId: 'INV-20251003',
          provider: 'Nova Trauma Center',
          claimant: 'Rajesh Nair',
          date: '2025-10-14',
          amount: 12850.00,
          validationStatus: 'PENDING',
          status: 'FLAGGED'
        },
        {
          id: 4,
          invoiceId: 'INV-20251004',
          provider: 'City Health Hospital',
          claimant: 'Prudence Moyo',
          date: '2025-10-15',
          amount: 6100.00,
          validationStatus: 'CHECKED',
          status: 'APPROVED'
        },
        {
          id: 5,
          invoiceId: 'INV-20251005',
          provider: 'Central Medical Group',
          claimant: 'Ahmed Patel',
          date: '2025-10-15',
          amount: 2940.00,
          validationStatus: 'CHECKED',
          status: 'APPROVED'
        },
        {
          id: 6,
          invoiceId: 'INV-20251006',
          provider: 'Curewell Hospital',
          claimant: 'Sipho Dlamini',
          date: '2025-10-16',
          amount: 8430.00,
          validationStatus: 'CHECKED',
          status: 'REJECTED'
        },
        {
          id: 7,
          invoiceId: 'INV-20251007',
          provider: 'HopeCare Clinic',
          claimant: 'Maria Garcia',
          date: '2025-10-16',
          amount: 3760.00,
          validationStatus: 'PENDING',
          status: 'PENDING REVIEW'
        },
        {
          id: 8,
          invoiceId: 'INV-20251008',
          provider: 'Eden Med Center',
          claimant: 'Naledi Khumalo',
          date: '2025-10-17',
          amount: 9800.00,
          validationStatus: 'CHECKED',
          status: 'APPROVED'
        },
        {
          id: 9,
          invoiceId: 'INV-20251009',
          provider: 'Unity Private Hosp',
          claimant: 'David Lee',
          date: '2025-10-17',
          amount: 1620.00,
          validationStatus: 'CHECKED',
          status: 'FLAGGED'
        },
        {
          id: 10,
          invoiceId: 'INV-20251010',
          provider: 'River Valley Hospital',
          claimant: 'Chen Yue',
          date: '2025-10-18',
          amount: 5300.00,
          validationStatus: 'CHECKED',
          status: 'APPROVED'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClaim = (claimId: number) => {
    const newSelected = new Set(selectedClaims);
    if (newSelected.has(claimId)) {
      newSelected.delete(claimId);
    } else {
      newSelected.add(claimId);
    }
    setSelectedClaims(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedClaims.size === filteredClaims.length) {
      setSelectedClaims(new Set());
    } else {
      setSelectedClaims(new Set(filteredClaims.map(c => c.id!)));
    }
  };

  const handleApproveSelected = async () => {
    try {
      await Promise.all(
        Array.from(selectedClaims).map(claimId =>
          apiService.updateClaimStatus(claimId, 'APPROVED')
        )
      );
      await loadClaims();
      setSelectedClaims(new Set());
    } catch (error) {
      console.error('Error approving claims:', error);
    }
  };

  const handleRejectSelected = async () => {
    try {
      await Promise.all(
        Array.from(selectedClaims).map(claimId =>
          apiService.updateClaimStatus(claimId, 'REJECTED', rejectionReasons)
        )
      );
      await loadClaims();
      setSelectedClaims(new Set());
    } catch (error) {
      console.error('Error rejecting claims:', error);
    }
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.claimant.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesStatus = statusFilter === 'All Statuses';
    if (!matchesStatus) {
      if (statusFilter === 'Pending') {
        matchesStatus = claim.status === 'PENDING' || claim.status === 'PENDING REVIEW';
      } else {
        matchesStatus = claim.status === statusFilter.toUpperCase();
      }
    }
    return matchesSearch && matchesStatus;
  });

  const stats = {
    pending: claims.filter(c => c.status === 'PENDING' || c.status === 'PENDING REVIEW').length,
    approved: claims.filter(c => c.status === 'APPROVED').length,
    flagged: claims.filter(c => c.status === 'FLAGGED' || c.validationStatus === 'FAILED').length,
    rejected: claims.filter(c => c.status === 'REJECTED').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return { bg: 'rgba(34, 197, 94, 0.1)', text: '#16a34a' };
      case 'PENDING': return { bg: 'rgba(255, 193, 7, 0.1)', text: '#d97706' };
      case 'PENDING REVIEW': return { bg: 'rgba(255, 193, 7, 0.1)', text: '#d97706' };
      case 'REJECTED': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#dc2626' };
      case 'FLAGGED': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#dc2626' };
      default: return { bg: 'rgba(148, 163, 184, 0.1)', text: '#64748b' };
    }
  };

  const getValidationColor = (status: string) => {
    switch (status) {
      case 'PASSED': return { bg: 'rgba(34, 197, 94, 0.1)', text: '#16a34a' };
      case 'CHECKED': return { bg: 'rgba(34, 197, 94, 0.1)', text: '#16a34a' };
      case 'FAILED': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#dc2626' };
      case 'PENDING': return { bg: 'rgba(255, 193, 7, 0.1)', text: '#d97706' };
      default: return { bg: 'rgba(148, 163, 184, 0.1)', text: '#64748b' };
    }
  };

  return (
    <main style={container}>
      <div style={inner}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h1 style={h1}>Claims & Bill Review</h1>
            <p style={muted}>Manage and review claims and bills submitted by healthcare providers.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button style={btnGhost}>
              📊 Export Report
            </button>
            <button style={btnPrimary}>
              ⚡ Process Batch
            </button>
          </div>
        </div>

        {/* KPI Cards Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Pending Review', value: stats.pending, icon: '⏳', color: '#d97706' },
            { label: 'Approved', value: stats.approved, icon: '✅', color: '#16a34a' },
            { label: 'Flagged', value: stats.flagged, icon: '🚩', color: '#dc2626' },
            { label: 'Rejected', value: stats.rejected, icon: '❌', color: '#dc2626' }
          ].map((stat, index) => (
            <div key={index} style={{ 
              borderRadius: 16, 
              background: 'rgba(255, 255, 255, 0.85)', 
              padding: 16,
              border: '1px solid rgba(144, 202, 249, 0.2)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 16px rgba(74, 144, 226, 0.06)',
              transition: 'all 0.3s ease',
              marginBottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12,
              minWidth: 0
            }}>
              <div style={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                background: `${stat.color}15`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: 18,
                flexShrink: 0
              }}>
                {stat.icon}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ ...muted, fontSize: 12, fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stat.label}</p>
                <p style={{ fontSize: 24, fontWeight: 800, margin: 0, color: '#26344A' }}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 300 }}>
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
              placeholder="Search Invoice ID, Provider, Claimant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select style={{ ...select, minWidth: 160 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All Statuses</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Flagged</option>
            <option>Rejected</option>
          </select>
          <button style={btnGhost}>🔧 More Filters</button>
        </div>

        <div style={{ 
          overflowX: 'auto', 
          borderRadius: 20, 
          background: 'rgba(255, 255, 255, 0.85)', 
          border: '1px solid rgba(144, 202, 249, 0.2)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(74, 144, 226, 0.08)'
        }}>
          <table style={{ width: '100%', fontSize: 14, textAlign: 'left' }}>
            <thead style={{ background: 'rgba(232, 240, 254, 0.3)' }}>
              <tr>
                <th style={{ padding: '16px 20px', fontWeight: 700, color: '#26344A' }}>
                  <input
                    type="checkbox"
                    checked={selectedClaims.size === filteredClaims.length && filteredClaims.length > 0}
                    onChange={handleSelectAll}
                    style={{ 
                      width: 18, 
                      height: 18,
                      accentColor: '#307AFE'
                    }}
                  />
                </th>
                <th style={{ padding: '16px 20px', fontWeight: 700, color: '#26344A' }}>Invoice ID</th>
                <th style={{ padding: '16px 20px', fontWeight: 700, color: '#26344A' }}>Provider</th>
                <th style={{ padding: '16px 20px', fontWeight: 700, color: '#26344A' }}>Claimant</th>
                <th style={{ padding: '16px 20px', fontWeight: 700, color: '#26344A' }}>Date</th>
                <th style={{ padding: '16px 20px', fontWeight: 700, color: '#26344A' }}>Amount</th>
                <th style={{ padding: '16px 20px', fontWeight: 700, color: '#26344A', textAlign: 'center' }}>Validation</th>
                <th style={{ padding: '16px 20px', fontWeight: 700, color: '#26344A', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '16px 20px', fontWeight: 700, color: '#26344A', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClaims.map((claim) => (
                <tr key={claim.id} style={{ 
                  borderBottom: '1px solid rgba(144, 202, 249, 0.2)',
                  transition: 'background-color 0.2s ease'
                }}>
                  <td style={{ padding: '16px 20px' }}>
                    <input
                      type="checkbox"
                      checked={selectedClaims.has(claim.id!)}
                      onChange={() => handleSelectClaim(claim.id!)}
                      style={{ 
                        width: 18, 
                        height: 18,
                        accentColor: '#307AFE'
                      }}
                    />
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: '#26344A' }}>{claim.invoiceId}</td>
                  <td style={{ padding: '16px 20px', color: '#7E8CA0' }}>{claim.provider}</td>
                  <td style={{ padding: '16px 20px', color: '#7E8CA0' }}>{claim.claimant}</td>
                  <td style={{ padding: '16px 20px', color: '#7E8CA0' }}>{claim.date}</td>
                  <td style={{ padding: '16px 20px', color: '#26344A', fontWeight: 600 }}>R {claim.amount.toFixed(2)}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      background: getValidationColor(claim.validationStatus).bg,
                      color: getValidationColor(claim.validationStatus).text
                    }}>
                      {claim.validationStatus}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      background: getStatusColor(claim.status).bg,
                      color: getStatusColor(claim.status).text
                    }}>
                      {claim.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
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
                      onClick={() => setSelectedClaim(claim)}
                    >
                      👁️ View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>



        <div style={{ paddingTop: 24, textAlign: 'center', color: '#7E8CA0', fontSize: 12 }}>
          ©2024 IMMS. All rights reserved.
        </div>
      </div>
    </main>
  );
}

export default ClaimsAndBillReview;
