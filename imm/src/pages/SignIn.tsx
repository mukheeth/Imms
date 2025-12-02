import React from 'react';

type Props = {
  onNavigate?: (route: any) => void;
};

function SignIn({ onNavigate }: Props) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [formData, setFormData] = React.useState({ email: '', password: '' });
  const [error, setError] = React.useState('');
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => password.length >= 6;

  const handleSignin = async () => {
    if (!validateEmail(formData.email)) { setError('Invalid email format.'); return; }
    if (!validatePassword(formData.password)) { setError('Password must be at least 6 characters long.'); return; }
    try {
      const url = new URL('http://localhost:8082/user/signinrole');
      url.searchParams.set('email', formData.email);
      url.searchParams.set('password', formData.password);
      const res = await fetch(url.toString(), { method: 'POST' });
      if (!res.ok) throw new Error('Invalid email or password');
      const data = await res.json();
      const role = data?.role_name;
      try { localStorage.setItem('userEmail', formData.email); } catch {}
      // Optionally fetch username (same as speedauth behavior)
      try {
        const u = new URL('http://localhost:8082/user/username');
        u.searchParams.set('email', formData.email);
        await fetch(u.toString());
      } catch {}
      // Navigate into app (dashboard as entry)
      if (onNavigate) onNavigate('dashboard');
    } catch (e) {
      setError('Invalid email or password.');
    }
  };

  const page: React.CSSProperties = { minHeight: '100vh', display: 'flex', justifyContent:'center', background: '#0b1020' };
  // const left: React.CSSProperties = { display: 'none' };
  const rightWrap: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: '100vh', boxSizing: 'border-box' };
  const panel: React.CSSProperties = { width: '100%', maxWidth: 420, background: 'rgba(8,12,32,0.8)', border: '1px solid rgba(65,90,180,0.25)', borderRadius: 12, padding: 24, boxSizing: 'border-box', overflow: 'hidden' };
  const label: React.CSSProperties = { color: '#c5ccda', fontSize: 14, fontWeight: 700, marginBottom: 6 };
  const input: React.CSSProperties = { width: '100%', borderRadius: 8, padding: '10px 12px', background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(71,85,105,0.6)', color:'#e7eaf2', boxSizing: 'border-box' };
  const btn: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700 };
  const btnPrimary: React.CSSProperties = { ...btn, background: '#335dff', color: '#fff' };
  const muted: React.CSSProperties = { color: '#9aa3b2' };

  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    const update = () => { (document.getElementById('auth-left') as HTMLDivElement | null)?.style.setProperty('display', mq.matches ? 'flex' : 'none'); };
    update(); mq.addEventListener('change', update); return () => mq.removeEventListener('change', update);
  }, []);

  return (
    <main style={page}>
      {/* <div id="auth-left" style={{  alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', height: '100%', backgroundImage: 'url(/assets/static/images/signinimg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      </div> */}
      <div style={rightWrap}>
        <div style={panel}>
          <p style={{ ...muted, marginBottom: 16 }}>Please enter your details to log in</p>
          <div style={{ marginBottom: 12 }}>
            <label style={label}>User ID</label>
            <input name="email" type="email" placeholder="Enter your user id" value={formData.email} onChange={handleInputChange} style={input} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={label}>Password</label>
            <div style={{ position: 'relative' }}>
              <input name="password" placeholder="Enter your password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleInputChange} style={{ ...input, paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPassword(s => !s)} style={{ position:'absolute', right:8, top:8, background:'transparent', color:'#c5ccda', border:'none', cursor:'pointer' }}>{showPassword ? 'Hide' : 'Show'}</button>
            </div>
          </div>
          {error ? <p style={{ color:'#ef4444', marginBottom: 12 }}>{error}</p> : null}
          <button style={btnPrimary} onClick={handleSignin}>Log In</button>
          <p style={{ ...muted, marginTop: 12, textAlign:'center' }}>Don't have an account? <a href="#" onClick={(e)=>{e.preventDefault(); onNavigate && onNavigate('signup');}} style={{ color:'#93c5fd' }}>Register here</a></p>
        </div>
      </div>
    </main>
  );
}

export default SignIn;
