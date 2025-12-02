import React from 'react';

function InHospitalCaseManagement() {
  const [activeTab, setActiveTab] = React.useState<'notes' | 'procedures' | 'authorizations' | 'prosthetics'>('notes');
  const [summary, setSummary] = React.useState<any | null>(null);
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
  const inner: React.CSSProperties = { width: '100%', maxWidth: 1200, margin: '0 auto' };

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

  // Tab navigation styles
  const tabsWrap: React.CSSProperties = {
    borderBottom: '1px solid rgba(232, 240, 254, 0.5)',
    marginBottom: 24,
    background: 'rgba(232, 240, 254, 0.2)',
    borderRadius: '12px 12px 0 0',
    padding: '0 20px'
  };
  const tabs: React.CSSProperties = { display: 'flex', gap: 32, flexWrap: 'wrap' };
  const tab: React.CSSProperties = {
    padding: '16px 4px',
    color: '#7E8CA0',
    fontSize: 14,
    fontWeight: 600,
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none'
  };
  const tabActive: React.CSSProperties = {
    ...tab,
    color: '#307AFE',
    borderBottom: '2px solid #307AFE',
    fontWeight: 700
  };

  const timeline: React.CSSProperties = { position: 'relative', paddingLeft: 24, borderLeft: '1px solid rgba(148,163,184,0.2)', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 8 };
  const dot: React.CSSProperties = { position: 'absolute', left: -18, top: 0, width: 28, height: 28, borderRadius: 9999, background: 'rgba(51,93,255,0.12)', border: '1px solid rgba(51,93,255,0.6)', boxShadow: 'inset 0 0 0 4px rgba(51,93,255,0.08)' };

  // Default timeline data with hospital admission and key events
  const defaultTimeline = [
    {
      title: 'Admission to Hospital',
      description: 'Patient admitted for evaluation and stabilization following motor vehicle accident.',
      date: '2024-07-20'
    },
    {
      title: 'Initial Assessment',
      description: 'Comprehensive assessment and imaging completed. Primary injury includes fracture.',
      date: '2024-07-21'
    },
    {
      title: 'Surgery Completed',
      description: 'Open reduction and internal fixation procedure completed successfully.',
      date: '2024-07-21'
    },
    {
      title: 'Post-Op Recovery',
      description: 'Patient stable post-surgery, pain management initiated, physiotherapy scheduled.',
      date: '2024-07-22'
    }
  ];

  // Default clinical notes with patient recovery information
  const defaultNotes = [
    {
      title: 'Patient recovering well',
      body: 'Vitals stable, pain controlled. Patient showing good progress with mobility exercises. Continue monitoring and physiotherapy as planned.',
      date: '2024-07-23',
      author: 'A. Tshabalala'
    },
    {
      title: 'Initial Assessment',
      body: 'Admitted post-MVA. Primary injury includes compound fracture of right femur. Patient conscious and responsive. Vital signs stable. Imaging shows clean fracture requiring surgical intervention.',
      date: '2024-07-21',
      author: 'Dr. E. Carter'
    },
    {
      title: 'Pre-Operative Assessment',
      body: 'Patient cleared for surgery. No contraindications identified. Anesthesia consultation completed. Surgical plan reviewed with patient and family.',
      date: '2024-07-21',
      author: 'Dr. E. Carter'
    }
  ];

  React.useEffect(() => {
    const loadCaseSummary = () => {
      try {
        const raw = sessionStorage.getItem('imms.caseSummary');
        if (raw) {
          const data = JSON.parse(raw);
          console.log('Loaded case summary from sessionStorage:', data);
          console.log('Required procedures:', data.required_procedures);
          console.log('Timeline:', data.timeline);
          console.log('Notes:', data.notes);
          setSummary(data);
        }
      } catch (e) {
        console.error('Error loading case summary:', e);
      }
    };

    // Load initial data
    loadCaseSummary();

    // Listen for storage changes (when data is updated from other pages)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'imms.caseSummary') {
        loadCaseSummary();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events (for same-tab updates)
    const handleCustomStorageChange = () => {
      loadCaseSummary();
    };

    window.addEventListener('caseSummaryUpdated', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('caseSummaryUpdated', handleCustomStorageChange);
    };
  }, []);

  const patientName = summary?.patient_name || 'John Doe';
  const caseId = summary?.case_id || 'RAF-123456';
  const expectedLos = summary?.expected_length_of_stay || '5 Days';

  return (
    <main style={container}>
      <div style={inner}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h1 style={h1}>In-Hospital Case Management</h1>
            <p style={muted}>Case ID: <span style={{ color: '#26344A', fontWeight: 800 }}>{caseId}</span></p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>

          </div>
        </div>

        <div style={card}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 280, flex: 1 }}>
              <div style={{ width: 56, height: 56, borderRadius: 9999, background: 'rgba(48, 122, 254, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#307AFE', fontWeight: 800, border: '2px solid rgba(48, 122, 254, 0.2)' }}>🧑</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ color: '#26344A', fontSize: 18, fontWeight: 800 }}>{patientName}</h3>
                  <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 9999, background: 'rgba(34,197,94,0.2)', color: '#16a34a' }}>Active</span>
                </div>
                <p style={{ ...muted, marginTop: 4 }}>Primary Diagnosis: {summary?.primary_diagnosis || 'Not specified'}</p>
                
              </div>
            </div>

          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 16, marginBottom: 24 }}>
          {[
            ['Length of Stay', expectedLos],
            ['Care Level', summary?.care_level || 'Medical/Surgical Unit'],
            ['Risk Factors', summary?.risk_factors ? String(summary.risk_factors.length) + ' noted' : '0 noted'],
            ['Procedures', summary?.required_procedures ? String(summary.required_procedures.length) + ' suggested' : '5 suggested'],
          ].map(([label, value]) => (
            <div key={label as string} style={{ ...card, marginBottom: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 9999, background: 'rgba(48, 122, 254, 0.1)', border: '1px solid rgba(48, 122, 254, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#307AFE', fontWeight: 800 }}>ℹ️</div>
              <div>
                <p style={{ ...muted, fontSize: 13 }}>{label}</p>
                <p style={{ fontWeight: 800, color: '#26344A' }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: '2 1 560px', minWidth: 300 }}>


            <div style={{ ...card, marginBottom: 24 }}>
              <h3 style={{ color: '#26344A', fontWeight: 800, marginBottom: 12 }}>Case Timeline</h3>
              <ol style={timeline}>
                {(summary?.timeline || defaultTimeline).map((item: any, idx: number) => (
                  <li key={idx} style={{ marginLeft: 24, position: 'relative' }}>
                    <span style={dot} />
                    <div style={{ marginLeft: 16, background: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(144, 202, 249, 0.3)', borderRadius: 10, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div>
                        <p style={{ color: '#26344A', fontWeight: 800 }}>{item.title}</p>
                        <p style={{ color: '#7E8CA0', fontSize: 13 }}>{item.description}</p>
                      </div>
                      <time style={{ color: '#7E8CA0', fontSize: 12 }}>{item.date}</time>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div style={tabsWrap}>
              <nav style={tabs}>
                <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('notes'); }} style={activeTab === 'notes' ? tabActive : tab}>Notes</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('procedures'); }} style={activeTab === 'procedures' ? tabActive : tab}>Procedures</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('authorizations'); }} style={activeTab === 'authorizations' ? tabActive : tab}>Authorizations</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('prosthetics'); }} style={activeTab === 'prosthetics' ? tabActive : tab}>Prosthetics</a>
              </nav>
            </div>

            {activeTab === 'notes' && (
              <div style={{ ...card, marginBottom: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(summary?.notes || defaultNotes).map((n: any, i: number) => (
                    <div key={i} style={{ background: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(144, 202, 249, 0.3)', borderRadius: 10, padding: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <p style={{ color: '#26344A', fontWeight: 800 }}>{n.title}</p>
                        <span style={{ color: '#7E8CA0', fontSize: 12 }}>{n.date} by {n.author}</span>
                      </div>
                      <p style={{ color: '#26344A', fontSize: 14 }}>{n.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'procedures' && (
              <div style={{ ...card, marginBottom: 24 }}>
                <h3 style={{ color: '#26344A', fontWeight: 800, marginBottom: 12 }}>Procedures</h3>
                {/* Debug info */}
                {summary?.required_procedures && (
                  <div style={{ fontSize: 12, color: '#7E8CA0', marginBottom: 8 }}>
                    Found {summary.required_procedures.length} procedures from case summary
                  </div>
                )}
                <table style={{ width: '100%', fontSize: 14 }}>
                  <thead>
                    <tr>
                      {['Procedure', 'Duration', 'Urgency'].map(h => (<th key={h} style={{ textAlign: 'left', color: '#26344A', padding: '8px 8px' }}>{h}</th>))}
                    </tr>
                  </thead>
                  <tbody>
                    {(summary?.required_procedures && summary.required_procedures.length > 0 ?
                      summary.required_procedures.map((proc: any, i: number) => (
                        <tr key={i} style={{ borderTop: '1px solid rgba(144, 202, 249, 0.3)' }}>
                          <td style={{ padding: '8px 8px', color: '#26344A' }}>{proc.description || proc.code || 'Unknown Procedure'}</td>
                          <td style={{ padding: '8px 8px', color: '#7E8CA0' }}>{proc.estimated_duration || 'Not specified'}</td>
                          <td style={{ padding: '8px 8px', color: '#7E8CA0' }}>{proc.urgency || 'Medium'}</td>
                        </tr>
                      )) : [
                        ['Open Reduction & Internal Fixation', 'Jul 21, 2024', 'Completed'],
                        ['Post-Operative Imaging', 'Jul 22, 2024', 'Completed'],
                        ['Physiotherapy Assessment', 'Jul 22, 2024', 'Completed'],
                        ['Daily Physiotherapy', 'Jul 23, 2024', 'Ongoing'],
                        ['Wound Care Management', 'Jul 21, 2024', 'Ongoing'],
                      ].map((r: any, i: number) => (
                        <tr key={i} style={{ borderTop: '1px solid rgba(144, 202, 249, 0.3)' }}>
                          <td style={{ padding: '8px 8px', color: '#26344A' }}>{r[0]}</td>
                          <td style={{ padding: '8px 8px', color: '#7E8CA0' }}>{r[1]}</td>
                          <td style={{ padding: '8px 8px', color: '#7E8CA0' }}>{r[2]}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'authorizations' && (
              <div style={{ ...card, marginBottom: 24 }}>
                <h3 style={{ color: '#26344A', fontWeight: 800, marginBottom: 12 }}>Authorizations</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {summary?.authorizations && summary.authorizations.length > 0 ?
                    summary.authorizations.map((auth: any, index: number) => (
                      <div key={index} style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid rgba(144, 202, 249, 0.3)',
                        borderRadius: 8,
                        padding: 12
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, color: '#26344A' }}>{auth.auth_id}</span>
                          <span style={{
                            fontSize: 12,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: auth.status === 'Approved' ? 'rgba(34,197,94,0.2)' : 'rgba(255,193,7,0.2)',
                            color: auth.status === 'Approved' ? '#16a34a' : '#d97706'
                          }}>
                            {auth.status}
                          </span>
                        </div>
                        {auth.authorized_amount && (
                          <div style={{ fontSize: 12, color: '#7E8CA0', marginTop: 4 }}>
                            Amount: {auth.authorized_amount}
                          </div>
                        )}
                      </div>
                    )) :
                    <div style={{ color: '#26344A', fontSize: 14 }}>
                      {summary?.authorization_required ? 'Authorization Required' : 'No authorizations needed'}
                    </div>
                  }
                </div>
              </div>
            )}

            {activeTab === 'prosthetics' && (
              <div style={{ ...card, marginBottom: 24 }}>
                <h3 style={{ color: '#26344A', fontWeight: 800, marginBottom: 12 }}>Prosthetics</h3>
                <div style={{ color: '#26344A', fontSize: 14 }}>No prosthetics ordered.</div>
              </div>
            )}
          </div>

          <div style={{ flex: '1 1 320px', minWidth: 280 }}>
            <div style={{ ...card, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <h3 style={{ color: '#26344A', fontWeight: 800 }}>Length of Stay</h3>
                {summary?.alerts_count && summary.alerts_count > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#fca5a5', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: 9999 }}>
                    {summary.alerts_count} Alert{summary.alerts_count > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ ...muted }}><strong style={{ color: '#26344A' }}>Expected LOS:</strong> {summary?.expected_length_of_stay || 'Not specified'}</p>
                <p style={{ ...muted }}><strong style={{ color: '#26344A' }}>Cost Range:</strong> {summary?.estimated_cost_range || 'Not specified'}</p>
                {summary?.percentage_used && (
                  <p style={{ ...muted }}><strong style={{ color: '#26344A' }}>Budget Used:</strong> {summary.percentage_used}</p>
                )}
              </div>
              <button style={{ ...btnGhost, width: '100%', marginTop: 12, background: 'rgba(248, 250, 252, 0.9)', color: '#307AFE' }}>Request Extension</button>
            </div>

            <div style={{ ...card, marginBottom: 24 }}>
              <h3 style={{ color: '#26344A', fontWeight: 800, marginBottom: 12 }}>Care Team</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  ['Dr. Emily Carter', 'Orthopedic Surgeon', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhPr_pHPXqOy_jAzFggiCoQNygjWaArWHZy6tszeAV-TzLw3XjsRCllL5CTiJlNZSUJGl-sG01hxVjD4srVlivwLXzRG6WSRkr_Rmruc1Urw9NxY5TwSCztN7nd2W6Sayb4Eon6thZ-rdF6MZixiY6YZPEcWd_lJW2JURzfpiAjStR-cnpuHs_SGPjJu2fstK6y47xqJTCCW50k4oyV6RIivzNDpZkAdVlygh9n9PL4iC0JS613wbQPzjZzC1L5pBQmTKP5c2ofcb9'],
                  ['Ayanda Tshabalala', 'Case Manager', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzGXRgosZyQpkajKiB4xfuJyk16M_KtLaaTGPbTmIBG07-G02QvzS4G0DtsOUPyCfIRVxxM3NmlLH7D5axCdVFxuba8hHjxoGHCQo-RqYi44DDRUHzQG41zsewEe6YS9ZsYMwcstIOSaOShMkbesw7MgVrG0DD1afBtDKS5ArZ_DpgG-hqA6xMI8ssagahdcRw9GRdB3BRjOsd5TEfpUxkSVYvxbXRRpuPDFbqxwJFoN4FXXQh2ekl_bwcJ4ZCdh8mID5FuR-hqcMu'],
                ].map(([name, role, avatar]) => (
                  <div key={name as string} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(144, 202, 249, 0.3)', borderRadius: 10, padding: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9999, backgroundImage: `url(${avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <div>
                      <p style={{ color: '#26344A', fontWeight: 700 }}>{name}</p>
                      <p style={{ color: '#7E8CA0', fontSize: 14, lineHeight: 1.5, fontWeight: 400 }}>{role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Factors Section */}
            {summary?.risk_factors && summary.risk_factors.length > 0 && (
              <div style={{ ...card, marginBottom: 24 }}>
                <h3 style={{ color: '#26344A', fontWeight: 800, marginBottom: 12 }}>Risk Factors</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {summary.risk_factors.map((risk: string, index: number) => (
                    <div key={index} style={{
                      background: 'rgba(255, 193, 7, 0.1)',
                      border: '1px solid rgba(255, 193, 7, 0.3)',
                      borderRadius: 8,
                      padding: 8,
                      fontSize: 13,
                      color: '#26344A'
                    }}>
                      • {risk}
                    </div>
                  ))}
                </div>
              </div>
            )}


          </div>
        </div>



        <div style={{ paddingTop: 24, textAlign: 'center', color: '#7E8CA0', fontSize: 12 }}>
          ©2024 IMMS. All rights reserved.
        </div>
      </div>
    </main>
  );
}

export default InHospitalCaseManagement;


