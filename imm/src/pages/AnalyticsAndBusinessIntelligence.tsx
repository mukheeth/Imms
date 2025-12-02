import React from 'react';

function AnalyticsAndBusinessIntelligence() {
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

  return (
    <main style={container}>
      <div style={inner}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h1 style={h1}>Analytics & Business Intelligence</h1>
            <p style={muted}>
              Gain insights into key performance indicators and trends within the Enterprise Medical Management system.
            </p>
          </div>
          <button style={btnPrimary}>
            📊 Export Report
          </button>
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          {/* Left Column - Main Content */}
          <div style={{ flex: 1, minWidth: 0 }}> 
           {/* Time Period Selector - Smaller Card */}
            <div style={card}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#26344A' }}>📅 Time Period</h3>
              <div style={{ display: 'flex', alignItems: 'center', borderRadius: 12, background: 'rgba(248, 250, 252, 0.9)', border: '1px solid rgba(144, 202, 249, 0.3)', padding: 4 }}>
                {['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Custom Range'].map((label, idx) => (
                  <label key={label} style={{ cursor: 'pointer', padding: '6px 12px', borderRadius: 8, color: idx === 1 ? '#FAFBFC' : '#7E8CA0', background: idx === 1 ? '#307AFE' : 'transparent', fontSize: 13, fontWeight: 600, flex: 1, textAlign: 'center' }}>
                    <span>{label}</span>
                    <input style={{ display: 'none' }} name="time-period" type="radio" defaultChecked={idx === 1} />
                  </label>
                ))}
              </div>
            </div>

            {/* KPI Overview - Smaller Cards */}
            <div style={card}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#26344A' }}>📊 KPI Overview</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {[
                  { title: 'Avg Claim Cost', value: 'R2,500', delta: '+5%', up: true, icon: '💰' },
                  { title: 'Case Resolution Time', value: '45 Days', delta: '-10%', up: false, icon: '⏱️' },
                  { title: 'Approval Rate', value: '92%', delta: '+2%', up: true, icon: '✅' },
                  { title: 'Fraud Detection Rate', value: '3%', delta: '-1%', up: false, icon: '🔍' },
                ].map((kpi) => (
                  <div key={kpi.title} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    borderRadius: 12,
                    padding: 16,
                    border: '1px solid rgba(144, 202, 249, 0.3)',
                    background: 'rgba(248, 250, 252, 0.9)'
                  }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: `${kpi.up ? '#16a34a' : '#dc2626'}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18
                    }}>
                      {kpi.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#7E8CA0', fontSize: 12, fontWeight: 600, margin: 0 }}>{kpi.title}</p>
                      <p style={{ color: '#26344A', fontSize: 20, fontWeight: 700, margin: 0 }}>{kpi.value}</p>
                      <p style={{ color: kpi.up ? '#16a34a' : '#dc2626', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
                        <span>{kpi.up ? '↗️' : '↘️'}</span>
                        <span>{kpi.delta}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>  
          {/* Key Metrics - Medium-sized Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
              <div style={card}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                  <p style={{ color: '#26344A', fontWeight: 600, fontSize: 16 }}>📈 Average Claim Cost Trend</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <p style={{ color: '#26344A', fontSize: 28, fontWeight: 700 }}>R2,500</p>
                    <p style={{ color: '#16a34a', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>↗️</span>
                      <span>+5%</span>
                    </p>
                  </div>
                  <p style={{ color: '#7E8CA0', fontSize: 14 }}>Last 30 Days</p>
                </div>
                <div style={{ height: 300, background: 'rgba(48, 122, 254, 0.05)', borderRadius: 12, padding: 16 }}>
                  <svg
                    fill="none"
                    height="100%"
                    preserveAspectRatio="none"
                    viewBox="0 0 472 150"
                    width="100%"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V150H0V109Z"
                      fill="url(#paint0_linear_chart)"
                    ></path>
                    <path
                      d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25"
                      stroke="#307AFE"
                      strokeLinecap="round"
                      strokeWidth="3"
                    ></path>
                    <defs>
                      <linearGradient
                        gradientUnits="userSpaceOnUse"
                        id="paint0_linear_chart"
                        x1="236"
                        x2="236"
                        y1="1"
                        y2="149"
                      >
                        <stop stopColor="#307AFE" stopOpacity="0.3"></stop>
                        <stop offset="1" stopColor="#307AFE" stopOpacity="0"></stop>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              
              <div style={card}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                  <p style={{ color: '#26344A', fontWeight: 600, fontSize: 16 }}>🔍 Fraud Risk Distribution</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <p style={{ color: '#26344A', fontSize: 28, fontWeight: 700 }}>3%</p>
                    <p style={{ color: '#dc2626', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>↘️</span>
                      <span>-1%</span>
                    </p>
                  </div>
                  <p style={{ color: '#7E8CA0', fontSize: 14 }}>Last 30 Days</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', height: 300, gap: 20, padding: '20px 32px', justifyContent: 'center', background: 'rgba(48, 122, 254, 0.05)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
                    <div style={{ width: '100%', background: 'rgba(48, 122, 254, 0.1)', borderTopLeftRadius: 8, borderTopRightRadius: 8, height: 80, position: 'relative' }}>
                      <div style={{ width: '100%', background: '#307AFE', borderTopLeftRadius: 8, borderTopRightRadius: 8, height: '25%', position: 'absolute', bottom: 0 }} />
                    </div>
                    <p style={{ color: '#7E8CA0', fontSize: 12, fontWeight: 600 }}>Low Risk</p>
                    <p style={{ color: '#26344A', fontSize: 14, fontWeight: 700 }}>25%</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
                    <div style={{ width: '100%', background: 'rgba(48, 122, 254, 0.1)', borderTopLeftRadius: 8, borderTopRightRadius: 8, height: 160, position: 'relative' }}>
                      <div style={{ width: '100%', background: '#307AFE', borderTopLeftRadius: 8, borderTopRightRadius: 8, height: '65%', position: 'absolute', bottom: 0 }} />
                    </div>
                    <p style={{ color: '#7E8CA0', fontSize: 12, fontWeight: 600 }}>Medium Risk</p>
                    <p style={{ color: '#26344A', fontSize: 14, fontWeight: 700 }}>65%</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
                    <div style={{ width: '100%', background: 'rgba(48, 122, 254, 0.1)', borderTopLeftRadius: 8, borderTopRightRadius: 8, height: 120, position: 'relative' }}>
                      <div style={{ width: '100%', background: '#dc2626', borderTopLeftRadius: 8, borderTopRightRadius: 8, height: '10%', position: 'absolute', bottom: 0 }} />
                    </div>
                    <p style={{ color: '#7E8CA0', fontSize: 12, fontWeight: 600 }}>High Risk</p>
                    <p style={{ color: '#26344A', fontSize: 14, fontWeight: 700 }}>10%</p>
                  </div>
                </div>
              </div>
            </div>  
          {/* Insights - Smaller Cards */}
            <div style={card}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#26344A' }}>💡 Insights</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {[{ icon: '💰', title: 'Cost Insights', desc: 'Analyze cost trends and identify areas for savings.' },
                { icon: '📊', title: 'Quality Insights', desc: 'Evaluate the quality of care and patient outcomes.' },
                { icon: '🔒', title: 'Risk Insights', desc: 'Assess and mitigate potential risks and fraud.' }].map(cardItem => (
                  <div key={cardItem.title} style={{ display: 'flex', flexDirection: 'column', gap: 12, borderRadius: 12, border: '1px solid rgba(144, 202, 249, 0.3)', background: 'rgba(248, 250, 252, 0.9)', padding: 16 }}>
                    <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'rgba(48, 122, 254, 0.1)', fontSize: 18 }}>
                      {cardItem.icon}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <h3 style={{ color: '#26344A', fontWeight: 600, fontSize: 14, margin: 0 }}>{cardItem.title}</h3>
                      <p style={{ color: '#7E8CA0', fontSize: 12, margin: 0 }}>{cardItem.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar Cards */}
          <div style={{ width: 320, minWidth: 320 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Performance Summary - Smaller Card */}
              <div style={card}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#26344A' }}>⚡ Performance Summary</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(144, 202, 249, 0.2)' }}>
                    <span style={{ color: '#7E8CA0', fontSize: 13 }}>System Uptime</span>
                    <span style={{ color: '#16a34a', fontWeight: 600, fontSize: 13 }}>99.9%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(144, 202, 249, 0.2)' }}>
                    <span style={{ color: '#7E8CA0', fontSize: 13 }}>Processing Speed</span>
                    <span style={{ color: '#16a34a', fontWeight: 600, fontSize: 13 }}>2.3s avg</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(144, 202, 249, 0.2)' }}>
                    <span style={{ color: '#7E8CA0', fontSize: 13 }}>Data Accuracy</span>
                    <span style={{ color: '#16a34a', fontWeight: 600, fontSize: 13 }}>98.7%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                    <span style={{ color: '#7E8CA0', fontSize: 13 }}>User Satisfaction</span>
                    <span style={{ color: '#16a34a', fontWeight: 600, fontSize: 13 }}>4.8/5</span>
                  </div>
                </div>
              </div>

              {/* Recent Alerts - Smaller Card */}
              <div style={card}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#26344A' }}>🚨 Recent Alerts</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: 'rgba(255, 193, 7, 0.1)' }}>
                    <span style={{ fontSize: 16 }}>⚠️</span>
                    <div>
                      <p style={{ color: '#26344A', fontSize: 12, fontWeight: 600, margin: 0 }}>High claim volume detected</p>
                      <p style={{ color: '#7E8CA0', fontSize: 11, margin: 0 }}>2 hours ago</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: 'rgba(34, 197, 94, 0.1)' }}>
                    <span style={{ fontSize: 16 }}>✅</span>
                    <div>
                      <p style={{ color: '#26344A', fontSize: 12, fontWeight: 600, margin: 0 }}>System backup completed</p>
                      <p style={{ color: '#7E8CA0', fontSize: 11, margin: 0 }}>4 hours ago</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)' }}>
                    <span style={{ fontSize: 16 }}>🔴</span>
                    <div>
                      <p style={{ color: '#26344A', fontSize: 12, fontWeight: 600, margin: 0 }}>Fraud pattern identified</p>
                      <p style={{ color: '#7E8CA0', fontSize: 11, margin: 0 }}>6 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions - Smaller Card */}
              <div style={card}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#26344A' }}>⚡ Quick Actions</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button style={{ ...btnGhost, width: '100%', justifyContent: 'flex-start', fontSize: 13 }}>
                    📊 Generate Custom Report
                  </button>
                  <button style={{ ...btnGhost, width: '100%', justifyContent: 'flex-start', fontSize: 13 }}>
                    📈 View Trend Analysis
                  </button>
                  <button style={{ ...btnGhost, width: '100%', justifyContent: 'flex-start', fontSize: 13 }}>
                    🔍 Run Fraud Scan
                  </button>
                  <button style={{ ...btnGhost, width: '100%', justifyContent: 'flex-start', fontSize: 13 }}>
                    📋 Export Data
                  </button>
                </div>
              </div>

              {/* Actions Card - At Bottom */}
              <div style={{ ...card, marginTop: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#26344A' }}>Actions</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button style={btnPrimary}>
                    📊 Export Full Report
                  </button>
                  <button style={btnGhost}>
                    📧 Schedule Report
                  </button>
                  <button style={btnGhost}>
                    ⚙️ Configure Alerts
                  </button>
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
  );
}

export default AnalyticsAndBusinessIntelligence;