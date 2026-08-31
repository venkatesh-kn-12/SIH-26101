'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './onboarding.module.css';
import { Landmark, Target, BarChart3 } from 'lucide-react';

const STEPS = ['Introduction', 'Cadre Information', 'Prior Training', 'Career Goals'];

const QUALIFICATIONS = [
  'B.Sc. Statistics / Mathematics',
  'M.Sc. Statistics / Mathematical Economics',
  'B.Tech / B.E.',
  'M.Tech / M.E.',
  'MBA / PGDM',
  'Ph.D. in Statistical Science',
  'Other'
];

const EXPERIENCE_RANGES = [
  'Less than 1 year',
  '1-3 years',
  '3-5 years',
  '5-10 years',
  '10-15 years',
  'More than 15 years'
];

const CAREER_ROLES = [
  'Senior Statistical Officer',
  'Assistant Director (Statistics)',
  'Deputy Director (DES)',
  'Director (National Accounts)',
  'Data Scientist (Public Governance)',
  'Chief Statistician',
  'Statistical Lead (Tech Division)'
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [data, setData] = useState({
    experience: '',
    education: '',
    completedCourses: '',
    careerGoal: '',
  });

  const next = () => {
    setError('');

    // Step 1 Validation (Cadre Information)
    if (step === 1) {
      if (!data.experience) {
        setError('Please select your Years of Experience.');
        return;
      }
      if (!data.education) {
        setError('Please select your Highest Educational Qualification.');
        return;
      }
    }

    // Step 2 Validation (Prior Training)
    if (step === 2) {
      if (!data.completedCourses.trim()) {
        setError('Please specify your completed  Online Courses (or type "None").');
        return;
      }
    }

    // Step 3 Validation (Career Goals)
    if (step === 3) {
      if (!data.careerGoal) {
        setError('Please select your Target Career Role to establish competency targets.');
        return;
      }

      // Save onboarding data to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('statpath_onboarding_data', JSON.stringify(data));
      }
      router.push('/onboarding/assessment');
      return;
    }

    if (step < STEPS.length - 1) {
      setStep(step + 1);
    }
  };

  const back = () => {
    setError('');
    setStep(step - 1);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.logo} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={22} color="#FF9933" />
            <span>StatPath AI</span>
          </div>
          <div className={styles.stepIndicator}>
            {STEPS.map((s, i) => (
              <div key={s} className={`${styles.step} ${i === step ? styles.active : ''} ${i < step ? styles.done : ''}`}>
                <div className={styles.stepCircle}>{i < step ? '✓' : i + 1}</div>
                <span className={styles.stepLabel}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          {error && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '20px'
            }}>
              ⚠️ {error}
            </div>
          )}

          {step === 0 && (
            <div className={styles.welcome}>
              <div className={styles.welcomeEmoji} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Landmark size={36} color="#003087" />
              </div>
              <h1>Official Cadre Intake Portal</h1>
              <p>Welcome to the StatPath AI Baseline Intake. Completing this structured profile establishes your baseline competency framework mapped to official MoSPI role standards.</p>
              <div className={styles.welcomePoints}>
                {[
                  'Official baseline competency framework mapped to Ministry role standards',
                  'Identification of domain skill gaps aligned with Mission Karmayogi',
                  'Personalized learning pathways directly integrated with iGOT modules'
                ].map(p => (
                  <div key={p} className={styles.point}><span>✓</span><span>{p}</span></div>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className={styles.stepTitle}>Professional & Cadre Information</h2>
              <p className={styles.stepSubtitle}>Specify your years of experience and educational background (All fields mandatory).</p>
              
              <div className="form-group">
                <label className="form-label">Years of Experience in Official Statistics <span style={{ color: '#C8102E' }}>*</span></label>
                <select className="form-select" value={data.experience} onChange={e => setData({...data, experience: e.target.value})} required>
                  <option value="">Select Experience Range</option>
                  {EXPERIENCE_RANGES.map(v => <option key={v}>{v}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Highest Educational Qualification <span style={{ color: '#C8102E' }}>*</span></label>
                <select className="form-select" value={data.education} onChange={e => setData({...data, education: e.target.value})} required>
                  <option value="">Select Qualification</option>
                  {QUALIFICATIONS.map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className={styles.stepTitle}>Prior Training & Online Courses</h2>
              <p className={styles.stepSubtitle}>Detail your completed training programmes from iGOT Karmayogi or online learning portals.</p>
              
              <div className="form-group">
                <label className="form-label">iGOT Karmayogi / Online Courses Completed <span style={{ color: '#C8102E' }}>*</span></label>
                <textarea 
                  className="form-input" 
                  rows={4} 
                  placeholder="e.g. Statistical Literacy, Data Cleaning with Python, Survey Sampling Methodology..." 
                  value={data.completedCourses} 
                  onChange={e => setData({...data, completedCourses: e.target.value})} 
                  style={{ resize: 'vertical' }} 
                  required
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className={styles.stepTitle}>Career Progression Targets</h2>
              <p className={styles.stepSubtitle}>Select your target career role to benchmark advanced competency requirements (Mandatory).</p>
              <div className={styles.careerGrid}>
                {CAREER_ROLES.map(role => (
                  <button 
                    key={role}
                    type="button"
                    className={`${styles.careerOption} ${data.careerGoal === role ? styles.careerSelected : ''}`}
                    onClick={() => setData({...data, careerGoal: role})}
                  >
                    <span className={styles.careerIcon} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Target size={18} color="#003087" />
                    </span>
                    <span>{role}</span>
                    {data.careerGoal === role && <span className={styles.careerCheck}>✓</span>}
                  </button>
                ))}
              </div>
              {data.careerGoal && (
                <div className={styles.careerConfirm}>
                  Your custom learning path will be configured for <strong>{data.careerGoal}</strong>.
                </div>
              )}
            </div>
          )}

          <div className={styles.navButtons}>
            {step > 0 && (
              <button type="button" className="btn btn-secondary" onClick={back}>
                ← Previous
              </button>
            )}
            <button 
              type="button" 
              className="btn btn-primary" 
              style={{ marginLeft: 'auto' }} 
              onClick={next}
            >
              {step === STEPS.length - 1 ? 'Initiate Baseline Assessment →' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
