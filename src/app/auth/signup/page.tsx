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
  'NSO (FOD)'
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
              <div className="form-group">
                <label className="form-label">Department / Division</label>
                <select className="form-select" value={form.dept} onChange={e => setForm({...form, dept: e.target.value})}>
                  <option value="">Select Division</option>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
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
