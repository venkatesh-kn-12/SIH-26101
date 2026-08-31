'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ empId: '', password: '', role: 'employee' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 1000));
    if (form.empId && form.password) {
      if (form.role === 'admin') router.push('/admin');
      else router.push('/dashboard');
    } else {
      setError('Please enter Employee ID and password.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authLeft}>
        <Link href="/" className={styles.backLink}>← Back to Home</Link>
        <div className={styles.authBrand}>
          <div className={styles.authLogo}>📈 StatPath AI</div>
          <div className={styles.authTagline}>AI-Powered Competency Development</div>
          <div className={styles.authGovBadge}>Government of India | MoSPI</div>
        </div>
        <div className={styles.authQuote}>
          "The platform that understands who you are, what you know, and where you want to go."
        </div>
      </div>
      <div className={styles.authRight}>
        <div className={styles.authCard}>
          <h1 className={styles.authTitle}>Official Login</h1>
          <p className={styles.authSubtitle}>Sign in with your government employee credentials</p>
          {error && <div className={styles.authError}>{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Login As</label>
              <select className="form-select" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="employee">Employee / Official</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Employee ID</label>
              <input id="empId" className="form-input" type="text" placeholder="e.g. MOS/2019/1842" value={form.empId} onChange={e => setForm({...form, empId: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password / LDAP PIN</label>
              <input id="password" className="form-input" type="password" placeholder="Enter your password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
              {loading ? <><span className="spinner" style={{width:16,height:16}} /> Signing in...</> : 'Sign In'}
            </button>
          </form>
          <div className={styles.demoBox}>
            <div className={styles.demoTitle}>Demo Accounts</div>
            <div className={styles.demoAccounts}>
              {[{label:'Employee', id:'MOS/2019/1842', role:'employee'}, {label:'Admin', id:'ADMIN/001', role:'admin'}].map(d => (
                <button key={d.role} className={styles.demoBtn} onClick={() => { setForm({empId:d.id, password:'demo123', role:d.role}); }}>
                  <strong>{d.label}</strong><span>{d.id}</span>
                </button>
              ))}
            </div>
          </div>
          <p className={styles.authFooter}>Don't have an account? <Link href="/auth/signup">Register here</Link></p>
          <p className={styles.authNote}>For SSO integration with NIC / SPARROW, contact your IT administrator</p>
        </div>
      </div>
    </div>
  );
}
