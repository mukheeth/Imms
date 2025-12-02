import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

type RouteKey = 'dashboard' | 'Pre-Authorization' | 'cases' | 'payments' | 'analytics' | 'settings';
type DashboardProps = { onNavigate?: (route: RouteKey) => void };

function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState({
    totalCases: 125,
    pendingAuthorizations: 32,
    approvedClaims: 350,
    rejectedClaims: 15,
    totalCost: 150000
  });


  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const data = await apiService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  // Clinical Research Dashboard Styles - Hospital Industry Typography
  const container: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #F0F4F8 0%, #E8F0FE 50%, #E6F2F2 100%)',
    color: '#222E3E',
    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: 14,
    lineHeight: 1.6
  };

  const header: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '32px 40px',
    borderBottom: '1px solid rgba(144, 202, 249, 0.2)',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '0 0 24px 24px',
    margin: '0 24px 32px 24px',
    boxShadow: '0 8px 32px rgba(74, 144, 226, 0.1)'
  };

  // Primary heading - Hospital industry standard
  const h1: React.CSSProperties = {
    fontSize: 28,
    fontWeight: 700,
    color: '#26344A',
    lineHeight: 1.3,
    letterSpacing: '-0.02em',
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
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 20px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    border: '1px solid rgba(144, 202, 249, 0.4)',
    background: 'rgba(248, 250, 252, 0.9)',
    color: '#307AFE',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    fontFamily: 'inherit'
  };

  const btnPrimary: React.CSSProperties = {
    ...btn,
    background: 'linear-gradient(135deg, #307AFE 0%, #34A853 100%)',
    color: '#FAFBFC',
    border: 'none',
    fontWeight: 600
  };

  const grid: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: 12,
    marginBottom: 24,
    padding: '0 24px'
  };

  const card: React.CSSProperties = {
    padding: 12,
    borderRadius: 12,
    background: 'rgba(255, 255, 255, 0.85)',
    border: '1px solid rgba(144, 202, 249, 0.2)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 2px 12px rgba(74, 144, 226, 0.06)',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  // Section titles - Hospital industry hierarchy
  const sectionTitle: React.CSSProperties = {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 20,
    color: '#26344A',
    padding: '0 24px',
    lineHeight: 1.4,
    letterSpacing: '-0.01em'
  };

  const grid5: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: 20,
    marginBottom: 24,
    padding: '0 24px'
  };

  const handle = () => {
    if (onNavigate) onNavigate('Pre-Authorization');
  };

  return (
    <div style={container}>
      <div style={{ position: 'relative', display: 'flex', minHeight: '100vh', width: '100%', flexDirection: 'column' }}>
        <main style={{ flex: 1, paddingTop: 24 }}>
          <div style={header}>
            <div>
              <h1 style={h1}>Clinical Research Dashboard</h1>
              <p style={muted}>Welcome back, Dr. Johnson. Here's your research case summary for today.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              
               
            </div>
          </div>
          <div style={grid}>
            {[
              { t: 'Active Cases', v: stats.totalCases.toString(), c: '#4A90E2', delta: '+12.3%', bg: '#E8F0FE', icon: '👥' },
              { t: 'Serious Injury %', v: '18.4%', c: '#FF8A65', delta: '-2.1%', bg: '#FFF3E0', icon: '⚠️' },
              { t: 'Pending Auth', v: stats.pendingAuthorizations.toString(), c: '#7986CB', delta: '+5', bg: '#F3E5F5', icon: '📋' },
              { t: 'Discharges Today', v: '23', c: '#66BB6A', delta: '±0', bg: '#E8F5E8', icon: '📈' },
              { t: 'Cost vs Budget', v: `R ${(stats.totalCost / 1000).toFixed(1)}M`, c: '#26A69A', delta: '78% used', bg: '#E0F2F1', icon: '💰' },
              { t: 'Fraud Alerts', v: '7', c: '#EF5350', delta: 'Urgent', bg: '#FFEBEE', icon: '🛡️' },
            ].map((k, i) => (
              <div key={i} style={card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: k.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14
                  }}>
                    {k.icon}
                  </div>
                </div>
                <p style={{ 
                  color: '#7E8CA0', 
                  fontWeight: 500, 
                  fontSize: 12, 
                  marginBottom: 6,
                  lineHeight: 1.4,
                  letterSpacing: '0.01em'
                }}>{k.t}</p>
                <p style={{ 
                  fontSize: 20, 
                  fontWeight: 700, 
                  marginBottom: 8, 
                  color: '#26344A',
                  lineHeight: 1.2
                }}>{k.v}</p>
                <div style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  borderRadius: 6,
                  background: k.t === 'Fraud Alerts' ? '#FFEBEE' : '#E8F5E8',
                  color: k.t === 'Fraud Alerts' ? '#D32F2F' : '#34A853',
                  fontSize: 11,
                  fontWeight: 600,
                  lineHeight: 1.3
                }}>
                  {k.delta}
                </div>
              </div>
            ))}
          </div>
          <div style={grid5}>
            <div style={{ ...card, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ 
                    fontSize: 18, 
                    fontWeight: 700, 
                    color: '#26344A',
                    lineHeight: 1.4,
                    margin: 0,
                    letterSpacing: '-0.01em'
                  }}>Monthly Research Cost Trends</h3>
                  <p style={{ 
                    color: '#7E8CA0', 
                    fontSize: 13, 
                    lineHeight: 1.5,
                    margin: '4px 0 0 0',
                    fontWeight: 400
                  }}>Last 6 Months</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <p style={{ 
                    fontSize: 22, 
                    fontWeight: 700, 
                    color: '#26344A',
                    lineHeight: 1.2,
                    margin: 0
                  }}>R{(stats.totalCost / 1000).toFixed(1)}M</p>
                  <span style={{ 
                    color: '#34A853', 
                    fontWeight: 600, 
                    fontSize: 13,
                    lineHeight: 1.3
                  }}>(+10%)</span>
                </div>
              </div>
              <div style={{ height: 200 }}>
                <svg fill="none" height="100%" preserveAspectRatio="none" viewBox="0 0 472 150" width="100%">
                  <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H0V109Z" fill="url(#paint0_linear_chart)"></path>
                  <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25" stroke="#4A90E2" strokeLinecap="round" strokeWidth="3"></path>
                  <defs>
                    <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_chart" x1="236" x2="236" y1="1" y2="149">
                      <stop stopColor="rgba(74, 144, 226, 0.3)"></stop>
                      <stop offset="1" stopColor="rgba(74, 144, 226, 0)"></stop>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <div style={{ ...card, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ 
                    fontSize: 18, 
                    fontWeight: 700, 
                    color: '#26344A',
                    lineHeight: 1.4,
                    margin: 0,
                    letterSpacing: '-0.01em'
                  }}>Case Distribution</h3>
                  <p style={{ 
                    color: '#7E8CA0', 
                    fontSize: 13, 
                    lineHeight: 1.5,
                    margin: '4px 0 0 0',
                    fontWeight: 400
                  }}>Current active cases</p>
                </div>
                <p style={{ 
                  fontSize: 22, 
                  fontWeight: 700, 
                  color: '#26344A',
                  lineHeight: 1.2,
                  margin: 0
                }}>{stats.totalCases}</p>
              </div>
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg height="90%" viewBox="0 0 100 100" width="90%">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(144, 202, 249, 0.2)" strokeWidth="8"></circle>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#4A90E2" strokeDasharray="188.4 251.2" strokeWidth="8" transform="rotate(-90 50 50)"></circle>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#26A69A" strokeDasharray="50.24 251.2" strokeWidth="8" transform="rotate(-90 50 50)"></circle>
                  <text dominantBaseline="middle" fontSize="16" fontWeight="700" textAnchor="middle" x="50" y="52" fill="#222E3E">75%</text>
                </svg>
              </div>
            </div>
          </div>
          <div>
            <h2 style={sectionTitle}>Recent Research Cases</h2>
            <div style={{
              overflowX: 'auto',
              borderRadius: 20,
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid rgba(144, 202, 249, 0.2)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(74, 144, 226, 0.08)',
              margin: '0 24px'
            }}>
              <table style={{ 
                width: '100%', 
                fontSize: 14, 
                textAlign: 'left',
                fontFamily: 'inherit'
              }}>
                <thead style={{ background: 'rgba(232, 240, 254, 0.5)' }}>
                  <tr>
                    {['Case ID', 'Patient', 'Status', 'Priority', 'Amount', 'Date', 'Actions'].map(h => (
                      <th key={h} style={{
                        padding: '16px 20px',
                        fontWeight: 600,
                        color: '#7E8CA0',
                        fontSize: 12,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        lineHeight: 1.4
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['RAF-2025-0124', 'John Mokwena', 'In Review', 'High', 'R 245,000', '2025-10-13', 'View Details'],
                    ['RAF-2025-0123', 'Sarah van der Merwe', 'Approved', 'Medium', 'R 87,500', '2025-10-12', 'View Details'],
                    ['RAF-2025-0122', 'David Naidoo', 'Pending Auth', 'High', 'R 312,000', '2025-10-12', 'View Details'],
                    ['RAF-2025-0121', 'Maria Santos', 'In Progress', 'Low', 'R 52,000', '2025-10-11', 'View Details'],
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(232, 240, 254, 0.3)' }}>
                      <td style={{ 
                        padding: '16px 20px', 
                        color: '#307AFE', 
                        fontWeight: 600,
                        fontSize: 14,
                        lineHeight: 1.4
                      }}>{row[0]}</td>
                      <td style={{ 
                        padding: '16px 20px', 
                        color: '#26344A', 
                        fontWeight: 500,
                        fontSize: 14,
                        lineHeight: 1.4
                      }}>{row[1]}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: 6,
                          background: '#E8F0FE',
                          color: '#307AFE',
                          fontSize: 12,
                          fontWeight: 600,
                          lineHeight: 1.3
                        }}>{row[2]}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: 6,
                          background: row[3] === 'High' ? '#FFEBEE' : row[3] === 'Medium' ? '#FFF3E0' : '#E8F5E8',
                          color: row[3] === 'High' ? '#D32F2F' : row[3] === 'Medium' ? '#F57C00' : '#34A853',
                          fontSize: 12,
                          fontWeight: 600,
                          lineHeight: 1.3
                        }}>{row[3]}</span>
                      </td>
                      <td style={{ 
                        padding: '16px 20px', 
                        color: '#26344A', 
                        fontWeight: 600,
                        fontSize: 14,
                        lineHeight: 1.4
                      }}>{row[4]}</td>
                      <td style={{ 
                        padding: '16px 20px', 
                        color: '#7E8CA0',
                        fontSize: 14,
                        lineHeight: 1.4
                      }}>{row[5]}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <button style={{
                          color: '#4A90E2',
                          fontWeight: 500,
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer'
                        }}>{row[6]}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;