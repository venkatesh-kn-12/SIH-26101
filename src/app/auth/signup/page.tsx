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
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const [form, setForm] = useState({ name:'', empId:'', email:'', dept:'', designation:'', organisation:'Ministry of Statistics & Programme Implementation', password:'' });

  const next = () => { if (step < 2) setStep(step + 1); };
  const submit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    
    registerUser({
      name: form.name || 'Official User',
      empId: form.empId || `MOS/2026/${Math.floor(1000 + Math.random() * 9000)}`,
      email: form.email || 'user@mospi.gov.in',
      dept: form.dept || 'Economics Statistics Division (ESD)',
      designation: form.designation || 'Statistical Officer',
      organisation: form.organisation || 'Ministry of Statistics & Programme Implementation',
      rank: 'Group A',
      role: 'employee',
      password: form.password || 'demo123'
    });

    router.push('/onboarding');
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authLeft}>
        <Link href="/" className={styles.backLink}>← Back to Home</Link>
        <div className={styles.authBrand}>
          <div className={styles.authLogo}>📈 StatPath AI</div>
          <div className={styles.authTagline}>Create Your Account</div>
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
          <p className={styles.authSubtitle}>Step {step} of 2</p>
          {step === 1 && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="As per service records" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Employee ID</label>
                <input className="form-input" placeholder="e.g. MOS/2019/1842" value={form.empId} onChange={e => setForm({...form, empId: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Official Email</label>
                <input className="form-input" type="email" placeholder="name@mospi.gov.in" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="Minimum 8 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              </div>
              <button className="btn btn-primary" style={{width:'100%'}} onClick={next}>Continue →</button>
            </>
          )}
          {step === 2 && (
            <>
              <div className="form-group">
                <label className="form-label">Organisation</label>
                <input className="form-input" value={form.organisation} onChange={e => setForm({...form, organisation: e.target.value})} />
              </div>

              {/* Scrollable Department / Division Dropdown */}
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">Department / Division</label>
                <div 
                  className="form-select" 
                  style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onClick={() => setDeptDropdownOpen(!deptDropdownOpen)}
                >
                  <span style={{ color: form.dept ? '#0F172A' : '#64748B' }}>
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

              <div className="form-group">
                <label className="form-label">Designation</label>
                <select className="form-select" value={form.designation} onChange={e => setForm({...form, designation: e.target.value})}>
                  <option value="">Select Designation</option>
                  {DESIGNATIONS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div style={{display:'flex',gap:12,marginTop:20}}>
                <button className="btn btn-secondary" style={{flex:1}} onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary" style={{flex:2}} onClick={submit} disabled={loading}>
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
