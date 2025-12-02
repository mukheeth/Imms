import React from 'react';

const colors = {
  bgDark: '#0b1020',
  border: 'rgba(65, 90, 180, 0.25)',
  textLight: '#e7eaf2',
  textMuted: '#9aa3b2',
  primary: '#335dff',
};

type RouteKey = 'dashboard'|'Pre-Authorization' | 'cases' | 'claims' | 'communication' | 'medical-advisory' | 'pharmacy' | 'serious-injury'  | 'payments' | 'analytics' | 'settings' | 'signin';

type NavbarProps = {
  active?: RouteKey;
  onNavigate?: (route: RouteKey) => void;
};

function Navbar({ active = 'analytics', onNavigate }: NavbarProps) {
  const [showLogout, setShowLogout] = React.useState(false);
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 40px',
    borderBottom: `1px solid ${colors.border}`,
  };
  const brandStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 16 };
  const brandBoxStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
  };
  const brandTextStyle: React.CSSProperties = { color: colors.textLight, fontWeight: 700 };

  const navStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 32 };
  const linkStyle: React.CSSProperties = {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: 500,
    textDecoration: 'none',
  };
  const activeLinkStyle: React.CSSProperties = { ...linkStyle, color: colors.primary, fontWeight: 700 };

  const rightStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' };
  const avatarStyle: React.CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: '9999px',
    backgroundColor: 'rgba(148,163,184,0.15)',
    color: colors.textLight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
  };

  const menuBtnStyle: React.CSSProperties = { color: colors.textLight, padding: 8, borderRadius: 8, display: 'none' };

  return (
    <header style={headerStyle}>
      <div style={brandStyle}>
        {/* <div style={brandBoxStyle}>
          <span className="material-symbols-outlined" style={{ color: '#fff' }}>monitoring</span>
        </div> */}
        <h2 style={brandTextStyle}>IMMS</h2>
      </div>
      <nav style={navStyle}>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('dashboard'); }} style={active==='dashboard'?activeLinkStyle:linkStyle}>Dashboard</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('Pre-Authorization'); }} style={active==='Pre-Authorization'?activeLinkStyle:linkStyle}>Pre-Authorization</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('serious-injury'); }} style={active==='serious-injury'?activeLinkStyle:linkStyle}>Injury Assessment</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('cases'); }} style={active==='cases'?activeLinkStyle:linkStyle}>Cases</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('payments'); }} style={active==='payments'?activeLinkStyle:linkStyle}>Discharge Planning</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('pharmacy'); }} style={active==='pharmacy'?activeLinkStyle:linkStyle}>Pharmacy</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('medical-advisory'); }} style={active==='medical-advisory'?activeLinkStyle:linkStyle}>Medical Advisory</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('claims'); }} style={active==='claims'?activeLinkStyle:linkStyle}>Claims & Bills</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('analytics'); }} style={active==='analytics'?activeLinkStyle:linkStyle}>Analytics</a>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('communication'); }} style={active==='communication'?activeLinkStyle:linkStyle}>Communication</a>
        {/* <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('settings'); }} style={active==='settings'?activeLinkStyle:linkStyle}>Settings</a> */}
      </nav>
      <div style={rightStyle} onClick={() => setShowLogout(true)}>
        <div style={avatarStyle}>
          {(() => {
            try {
              const email = localStorage.getItem('userEmail') || '';
              const c = email.trim().charAt(0).toUpperCase();
              return c || '?';
            } catch { return '?'; }
          })()}
        </div>
        <button style={menuBtnStyle}>
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>
      {showLogout && (
        <div
          onClick={() => setShowLogout(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
        >
          <div onClick={(e)=>e.stopPropagation()} style={{ width: '90%', maxWidth: 380, background: colors.bgDark, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 20 }}>
            <h3 style={{ margin: 0, color: colors.textLight, fontSize: 18, fontWeight: 800 }}>Log out?</h3>
            <p style={{ margin: '8px 0 16px', color: colors.textMuted, fontSize: 14 }}>Are you sure you want to log out of your account?</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowLogout(false)} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${colors.border}`, background: 'transparent', color: colors.textLight }}>No</button>
              <button
                onClick={() => {
    try { localStorage.removeItem('userEmail'); } catch {}
    setShowLogout(false);
    onNavigate && onNavigate('signin');   // redirects to sign-in
  }}
                style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: colors.primary, color: '#fff', fontWeight: 700 }}
              >
                Yes, log out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;


