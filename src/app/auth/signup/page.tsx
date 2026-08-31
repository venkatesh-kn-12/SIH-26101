'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../auth.module.css';
import { registerUser } from '@/lib/authStorage';

const DEPARTMENTS = [
  'Economics Statistics Division (ESD)',
  'National Accounts Division (NAD)',
  'Administrative Statistics & Policy Division (ASPD)',
  'Household Survey Division (HSD)',
  'Coordination and Quality Control Division (CQCD)',
  'Capacity Development Division (CDD)',
  'Price Statistics Division (PSD)',
  'Data Informatics & Innovation Division (DIID)',
  'Enterprise Survey Division (EnSD)',
  'Coordination & International Cooperation Division/Unit',
  'NSO (FOD)',
  'Other'
];

const DESIGNATIONS = [
  'Junior Statistical Officer',
  'Statistical Officer',
  'Senior Statistical Officer',
  'Assistant Director',
  'Deputy Director',
  'Joint Director',
  'Director',
  'Deputy Director General',
  'Additional Director General',
  'Other'
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const [desgDropdownOpen, setDesgDropdownOpen] = useState(false);
  
  const [form, setForm] = useState({ 
    name: '', 
    empId: '', 
    email: '', 
    dept: '', 
    designation: '', 
    organisation: 'Ministry of Statistics & Programme Implementation', 
    password: '' 
  });

  const next = () => {
    setError('');
    // Mandatory Validation for Step 1
    if (!form.name.trim()) {
      setError('Please enter your Full Name.');
      return;
    }
    if (!form.empId.trim()) {
      setError('Please enter your Official Employee ID.');
      return;
    }
    if (!form.email.trim()) {
      setError('Please enter your Official Email address.');
      return;
    }
    if (!form.password.trim() || form.password.length < 6) {
      setError('Please enter a Password (minimum 6 characters).');
      return;
    }

    if (step < 2) setStep(step + 1);
  };

  const submit = async () => {
    setError('');
    // Mandatory Validation for Step 2
    if (!form.organisation.trim()) {
      setError('Please enter your Organisation.');
      return;
    }
    if (!form.dept.trim()) {
      setError('Please select your Department / Division.');
      return;
    }
    if (!form.designation.trim()) {
      setError('Please select your Designation.');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    
    registerUser({
      name: form.name.trim(),
      empId: form.empId.trim(),
      email: form.email.trim(),
      dept: form.dept.trim(),
      designation: form.designation.trim(),
      organisation: form.organisation.trim(),
      rank: 'Group A',
      role: 'employee',
      password: form.password
    });

    router.push('/onboarding');
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authLeft}>
        <Link href="/" className={styles.backLink}>← Back to Home</Link>
        <div className={styles.authBrand}>
          <div className={styles.authLogo}>📈 StatPath AI</div>
          <div className={styles.authTagline}>Create Official Account</div>
          <div className={styles.authGovBadge}>Government of India | MoSPI</div>
        </div>
        <div className={styles.stepIndicator}>
          {['Basic Information','Role Details'].map((s, i) => (
            <div key={s} className={`${styles.stepDot} ${step > i ? styles.stepDone : ''} ${step === i+1 ? styles.stepActive : ''}`}>
              <div className={styles.dotCircle}>{step > i+1 ? '✓' : i+1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.authRight}>
        <div className={styles.authCard}>
          <h1 className={styles.authTitle}>{step === 1 ? 'Basic Information' : 'Role & Department'}</h1>
          <p className={styles.authSubtitle}>Step {step} of 2 (All fields are mandatory)</p>

          {error && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '16px'
            }}>
              ⚠️ {error}
            </div>
          )}

          {step === 1 && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name <span style={{ color: '#C8102E' }}>*</span></label>
                <input className="form-input" placeholder="As per official service records" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Employee ID <span style={{ color: '#C8102E' }}>*</span></label>
                <input className="form-input" placeholder="e.g. MOS/2019/1842" value={form.empId} onChange={e => setForm({...form, empId: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Official Email <span style={{ color: '#C8102E' }}>*</span></label>
                <input className="form-input" type="email" placeholder="name@mospi.gov.in" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password <span style={{ color: '#C8102E' }}>*</span></label>
                <input className="form-input" type="password" placeholder="Minimum 6 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={next}>
                Continue →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-group">
                <label className="form-label">Organisation <span style={{ color: '#C8102E' }}>*</span></label>
                <input className="form-input" value={form.organisation} onChange={e => setForm({...form, organisation: e.target.value})} required />
              </div>

              {/* Scrollable Department / Division Dropdown */}
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">Department / Division <span style={{ color: '#C8102E' }}>*</span></label>
                <div 
                  className="form-select" 
                  style={{ 
                    cursor: 'pointer', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    backgroundImage: 'none'
                  }}
                  onClick={() => {
                    setDeptDropdownOpen(!deptDropdownOpen);
                    setDesgDropdownOpen(false);
                  }}
                >
                  <span style={{ color: form.dept ? '#0F172A' : '#64748B', fontWeight: form.dept ? 600 : 400 }}>
                    {form.dept || 'Select Division'}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>{deptDropdownOpen ? '▲' : '▼'}</span>
                </div>
                {deptDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    background: '#FFFFFF',
                    border: '1px solid var(--gray-300)',
                    borderRadius: 'var(--border-radius)',
                    maxHeight: '175px',
                    overflowY: 'auto',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                    marginTop: '4px'
                  }}>
                    {DEPARTMENTS.map(d => (
                      <div
                        key={d}
                        style={{
                          padding: '9px 12px',
                          fontSize: '13px',
                          cursor: 'pointer',
                          background: form.dept === d ? '#F1F5F9' : '#FFFFFF',
                          color: form.dept === d ? '#003087' : '#1E293B',
                          fontWeight: form.dept === d ? 700 : 500,
                          borderBottom: '1px solid #F1F5F9',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = form.dept === d ? '#F1F5F9' : '#FFFFFF'; }}
                        onClick={() => {
                          setForm({ ...form, dept: d });
                          setDeptDropdownOpen(false);
                        }}
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Scrollable Designation Dropdown */}
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">Designation <span style={{ color: '#C8102E' }}>*</span></label>
                <div 
                  className="form-select" 
                  style={{ 
                    cursor: 'pointer', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    backgroundImage: 'none'
                  }}
                  onClick={() => {
                    setDesgDropdownOpen(!desgDropdownOpen);
                    setDeptDropdownOpen(false);
                  }}
                >
                  <span style={{ color: form.designation ? '#0F172A' : '#64748B', fontWeight: form.designation ? 600 : 400 }}>
                    {form.designation || 'Select Designation'}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>{desgDropdownOpen ? '▲' : '▼'}</span>
                </div>
                {desgDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    background: '#FFFFFF',
                    border: '1px solid var(--gray-300)',
                    borderRadius: 'var(--border-radius)',
                    maxHeight: '175px',
                    overflowY: 'auto',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                    marginTop: '4px'
                  }}>
                    {DESIGNATIONS.map(d => (
                      <div
                        key={d}
                        style={{
                          padding: '9px 12px',
                          fontSize: '13px',
                          cursor: 'pointer',
                          background: form.designation === d ? '#F1F5F9' : '#FFFFFF',
                          color: form.designation === d ? '#003087' : '#1E293B',
                          fontWeight: form.designation === d ? 700 : 500,
                          borderBottom: '1px solid #F1F5F9',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = form.designation === d ? '#F1F5F9' : '#FFFFFF'; }}
                        onClick={() => {
                          setForm({ ...form, designation: d });
                          setDesgDropdownOpen(false);
                        }}
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={submit} disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account & Start Onboarding'}
                </button>
              </div>
            </>
          )}

          <p className={styles.authFooter}>Already registered? <Link href="/auth/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
