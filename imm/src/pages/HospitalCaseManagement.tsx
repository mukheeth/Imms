import React from 'react';

function HospitalCaseManagement() {
  const page: React.CSSProperties = { minHeight: '100vh', background: '#0f1023', color: '#e7eaf2', fontFamily: 'Inter, ui-sans-serif' };
  const container: React.CSSProperties = { maxWidth: 1280, margin: '0 auto', padding: '24px 32px' };
  const card: React.CSSProperties = { borderRadius: 12, background: 'rgba(8,12,32,0.9)', border: '1px solid rgba(65,90,180,0.25)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' };
  const header: React.CSSProperties = { position: 'sticky', top: 0, zIndex: 20, borderBottom: '1px solid rgba(65,90,180,0.25)', background: 'rgba(8,12,32,0.85)', backdropFilter: 'blur(6px)' };
  const headerInner: React.CSSProperties = { maxWidth: 1280, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' };
  const nav: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 24 };
  const navLink: React.CSSProperties = { fontSize: 14, fontWeight: 600, color: '#c5ccda', textDecoration: 'none', cursor: 'pointer' };
  const navActive: React.CSSProperties = { ...navLink, color: '#3b82f6' };
  const h1: React.CSSProperties = { fontSize: 28, fontWeight: 800, color: '#fff', margin: 0 };
  const muted: React.CSSProperties = { color: '#9aa3b2' };
  const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, padding: '8px 14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(148,163,184,0.3)', background: '#11183a', color: '#d1d6e0' };
  const btnPrimary: React.CSSProperties = { ...btn, background: '#040dae', color: '#fff', border: 'none' };

  return (
    <div style={page}>
    

      <main style={{ paddingTop: 24 }}>
        <div style={container}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
            <div>
              <h1 style={h1}>In-Hospital Case Management</h1>
              <p style={{ ...muted, marginTop: 4 }}>Case ID: <span style={{ fontWeight: 700, color: '#cbd5e1' }}>RAF-123456</span></p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={btn}>Request Auth</button>
              <button style={btnPrimary}>Add Note</button>
            </div>
          </div>

          <div style={{ ...card, padding: 24, marginBottom: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'stretch' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(148,163,184,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#94a3b8' }}>person</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#fff' }}>John Doe</h3>
                    <span style={{ padding: '3px 8px', borderRadius: 8, background: 'rgba(34,197,94,0.15)', color: '#4ade80', fontSize: 12, fontWeight: 700 }}>Active</span>
                  </div>
                  <p style={{ ...muted, margin: '4px 0 0 0', fontSize: 14 }}>Claimant ID: 987654321 | DOB: 12/05/1978 | M</p>
                  <p style={{ ...muted, margin: '2px 0 0 0', fontSize: 14 }}>Admission: Dr. Yusuf Dadoo Hospital on 2024-07-20</p>
                </div>
                <div style={{ display: 'flex', gap: 24, background: 'rgba(148,163,184,0.06)', padding: 12, borderRadius: 8 }}>
                  {[['Total Costs','R 125,430.00'],['Authorized','R 95,000.00'],['Pending','R 30,430.00']].map((s, i)=> (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <p style={{ ...muted, fontSize: 12 }}> {s[0]} </p>
                      <p style={{ fontWeight: 800, color: i===2? '#eab308':'#fff' }}> {s[1]} </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 16, marginBottom: 16 }}>
            {[
              { icon: 'hotel', title: 'Length of Stay', value: '5 Days' },
              { icon: 'check_circle', title: 'Authorizations', value: '3 Approved' },
              { icon: 'pending_actions', title: 'Pending Actions', value: '2 Items' },
              { icon: 'warning', title: 'Alerts', value: '1 High' },
            ].map((k)=> (
              <div key={k.title} style={{ ...card, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ color: '#60a5fa' }}>{k.icon}</span>
                  </div>
                  <div>
                    <p style={{ ...muted, margin: 0, fontSize: 13 }}>{k.title}</p>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 800 }}>{k.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            <div className="left" style={{ display: 'grid', gap: 16 }}>
              <div style={{ ...card }}>
                <div style={{ borderBottom: '1px solid rgba(65,90,180,0.25)', padding: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Case Timeline</h3>
                </div>
                <div style={{ padding: 16 }}>
                  <ol style={{ position: 'relative', borderLeft: '1px solid rgba(65,90,180,0.25)', paddingLeft: 16 }}>
                    {[
                      { icon: 'login', title: 'Admission to Hospital', date: 'Jul 20, 2024', text: 'Patient admitted for motor vehicle accident injuries.' },
                      { icon: 'medical_services', title: 'Surgical Procedure: Open Reduction', date: 'Jul 21, 2024', text: 'Authorization #AUTH-001 approved.' },
                      { icon: 'note_alt', title: 'Case Manager Note Added', date: 'Jul 22, 2024', text: 'Patient recovering well, pain managed.' },
                      { icon: 'event_available', title: 'Discharge Planning Initiated', date: 'Jul 23, 2024', text: 'Target discharge date: Jul 25, 2024.' },
                    ].map((it, idx)=> (
                      <li key={idx} style={{ marginBottom: 16, marginLeft: 12 }}>
                        <span style={{ position: 'absolute', left: -12, transform: `translate(-50%, 4px)`, width: 32, height: 32, borderRadius: '50%', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid rgba(8,12,32,1)' }}>
                          <span className="material-symbols-outlined" style={{ color: '#60a5fa', fontSize: 18 }}>{it.icon}</span>
                        </span>
                        <div style={{ ...card, padding: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h4 style={{ margin: 0, fontWeight: 700 }}>{it.title}</h4>
                            <time style={{ fontSize: 12, color: '#94a3b8' }}>{it.date}</time>
                          </div>
                          <p style={{ margin: '6px 0 0 0', color: '#c5ccda', fontSize: 14 }}>{it.text}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div style={{ ...card }}>
                <div style={{ borderBottom: '1px solid rgba(65,90,180,0.25)' }}>
                  <nav style={{ display: 'flex', gap: 16, padding: '0 16px' }}>
                    {['Notes','Procedures','Authorizations','Prosthetics'].map((t, i)=> (
                      <a key={i} style={{ padding: '12px 4px', borderBottom: i===0? '2px solid #040dae':'2px solid transparent', color: i===0? '#3b82f6':'#c5ccda', fontWeight: 700, fontSize: 14 }}>{t}</a>
                    ))}
                  </nav>
                </div>
                <div style={{ padding: 16, display: 'grid', gap: 12 }}>
                  {[{ title: 'Patient recovering well', by: 'Jul 22, 2024 by A. Tshabalala', text: 'Post-operative recovery is on track. Pain is well-managed with current medication regimen. Vitals are stable. Continue monitoring.' },
                    { title: 'Initial Assessment', by: 'Jul 20, 2024 by A. Tshabalala', text: 'Patient admitted following MVA. Primary injuries include a fractured left femur. Patient is conscious and alert. Initiated standard admission protocols.' }
                  ].map((n, i)=> (
                    <div key={i} style={{ background: 'rgba(148,163,184,0.06)', borderRadius: 8, padding: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ margin: 0, fontWeight: 700 }}>{n.title}</p>
                        <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>{n.by}</p>
                      </div>
                      <p style={{ margin: '8px 0 0 0', color: '#c5ccda', fontSize: 14 }}>{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="right" style={{ display: 'grid', gap: 16 }}>
              <div style={{ ...card, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0, fontWeight: 700 }}>LOS Alert</h3>
                  <span style={{ padding: '3px 8px', borderRadius: 8, background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontSize: 12, fontWeight: 700 }}>Exceeded</span>
                </div>
                <p style={{ ...muted, marginTop: 8 }}>Approved LOS: <span style={{ color: '#cbd5e1' }}>4 Days</span></p>
                <p style={{ ...muted, marginTop: 4 }}>Current LOS: <span style={{ color: '#cbd5e1' }}>5 Days</span></p>
                <button style={{ ...btn, width: '100%', marginTop: 8 }}>Request Extension</button>
              </div>

              <div style={{ ...card, padding: 16 }}>
                <h3 style={{ margin: 0, fontWeight: 700 }}>Care Team</h3>
                <ul style={{ margin: 12, padding: 0, listStyle: 'none', display: 'grid', gap: 12 }}>
                  {[
                    { name: 'Dr. Emily Carter', title: 'Orthopedic Surgeon' },
                    { name: 'Ayanda Tshabalala', title: 'Case Manager' },
                  ].map((m)=> (
                    <li key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(148,163,184,0.25)' }} />
                      <div>
                        <p style={{ margin: 0, fontWeight: 700 }}>{m.name}</p>
                        <p style={{ margin: 0, fontSize: 14, color: '#9aa3b2' }}>{m.title}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ ...card, padding: 16 }}>
                <h3 style={{ margin: 0, fontWeight: 700 }}>Quick Actions</h3>
                <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                  {[
                    { icon: 'file_upload', label: 'Upload Document' },
                    { icon: 'add_comment', label: 'Send Message' },
                    { icon: 'event', label: 'Schedule Appointment' },
                  ].map((q)=> (
                    <button key={q.label} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: 12, borderRadius: 8, background: 'rgba(148,163,184,0.12)', color: '#c5ccda', border: '1px solid rgba(65,90,180,0.25)', cursor: 'pointer' }}>
                      <span className="material-symbols-outlined">{q.icon}</span>
                      <span style={{ fontWeight: 600 }}>{q.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', color: '#9aa3b2', fontSize: 12, padding: '24px 0' }}>© 2024 Road Accident Fund. All rights reserved.</div>
        </div>
      </main>
    </div>
  );
}

export default HospitalCaseManagement;
