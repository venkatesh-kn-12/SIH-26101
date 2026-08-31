'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './onboarding.module.css';

const STEPS = ['Introduction', 'Cadre Information', 'Prior Training', 'Self-Evaluation', 'Career Goals'];
const SKILLS = ['Survey Design & Sampling','Sampling Theory & Master Frames','Data Quality & Imputation','Statistical Analysis','Python for Data Science','SQL & Data Warehousing','R Statistical Computing','GIS & Spatial Analytics','Data Visualization','Price Index Computation','Agricultural Survey Protocols','AI & ML in Public Sector','Cloud Computing & Open Data','Official Report Writing','Survey Project Management'];
const CAREER_ROLES = ['Senior Statistical Officer','Assistant Director (Statistics)','Deputy Director (DES)','Director (National Accounts)','Data Scientist (Public Governance)','Chief Statistician','Statistical Lead (Tech Division)'];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    currentRole: 'Statistical Officer',
    experience: '',
    education: '',
    responsibilities: '',
    completedCourses: '',
    certifications: '',
    skills: {} as Record<string, number>,
    careerGoal: '',
  });

  const next = () => step < STEPS.length - 1 ? setStep(step + 1) : router.push('/onboarding/assessment');
  const back = () => setStep(step - 1);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.logo}>📊 StatPath AI</div>
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
          {step === 0 && (
            <div className={styles.welcome}>
              <div className={styles.welcomeEmoji}>🏛️</div>
              <h1>Cadre Profile Intake Portal</h1>
              <p>Welcome to the StatPath AI Cadre Profile & Assessment Portal. Complete this initial intake to establish your official Baseline Competency Profile and generate your personalized iGOT learning pathway.</p>
              <div className={styles.welcomePoints}>
                {[
                  'Objective baseline competency assessment mapped to official role standards',
                  'Identification of skill gaps against FRAC competency frameworks',
                  'Sequenced learning pathways directly integrated with iGOT Karmayogi',
                  'Continuous digital twin tracking and periodic competency updates'
                ].map(p => (
                  <div key={p} className={styles.point}><span>✓</span><span>{p}</span></div>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className={styles.stepTitle}>Professional & Cadre Information</h2>
              <p className={styles.stepSubtitle}>Specify your current designation, department, and domain responsibilities.</p>
              <div className="form-group">
                <label className="form-label">Years of Experience in Official Statistics</label>
                <select className="form-select" value={data.experience} onChange={e => setData({...data, experience: e.target.value})}>
                  <option value="">Select experience range</option>
                  {['Less than 1 year','1-3 years','3-5 years','5-10 years','10-15 years','More than 15 years'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Highest Educational Qualification</label>
                <select className="form-select" value={data.education} onChange={e => setData({...data, education: e.target.value})}>
                  <option value="">Select qualification</option>
                  {['B.Sc. Statistics / Mathematics','M.Sc. Statistics / Mathematical Economics','B.Tech / B.E.','M.Tech / M.E.','MBA / PGDM','Ph.D. in Statistical Science','Other'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Primary Administrative & Technical Responsibilities</label>
                <textarea className="form-input" rows={3} placeholder="e.g. Price data collection, CPI index compilation, field survey supervision..." value={data.responsibilities} onChange={e => setData({...data, responsibilities: e.target.value})} style={{ resize: 'vertical' }} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className={styles.stepTitle}>Prior Learning & Certifications</h2>
              <p className={styles.stepSubtitle}>Detail any completed training programmes from iGOT, NSSTA, or State Training Institutes.</p>
              <div className={styles.infoBox}>
                ℹ️ <strong>Official Notice:</strong> Prior learning records will be validated through your upcoming baseline assessment.
              </div>
              <div className="form-group">
                <label className="form-label">iGOT Karmayogi / Online Courses Completed</label>
                <textarea className="form-input" rows={3} placeholder="e.g. Statistical Literacy, Data Cleaning with Python..." value={data.completedCourses} onChange={e => setData({...data, completedCourses: e.target.value})} style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label className="form-label">NSSTA / State DES Workshops Attended</label>
                <textarea className="form-input" rows={2} placeholder="e.g. National Accounts Workshop 2023, Agricultural Survey Training..." value={data.certifications} onChange={e => setData({...data, certifications: e.target.value})} style={{ resize: 'vertical' }} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className={styles.stepTitle}>Self-Evaluation Assessment</h2>
              <p className={styles.stepSubtitle}>Rate your proficiency level in each competency domain (1=Basic, 5=Expert). This will be validated by the adaptive assessment.</p>
              <div className={styles.skillGrid}>
                {SKILLS.map(skill => (
                  <div key={skill} className={styles.skillRow}>
                    <span className={styles.skillName}>{skill}</span>
                    <div className={styles.skillRating}>
                      {[1,2,3,4,5].map(n => (
                        <button key={n}
                          className={`${styles.ratingBtn} ${(data.skills[skill] || 0) >= n ? styles.ratingActive : ''}`}
                          onClick={() => setData({...data, skills: {...data.skills, [skill]: n}})}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className={styles.stepTitle}>Career Progression Targets</h2>
              <p className={styles.stepSubtitle}>Select your target career role to incorporate advanced competency benchmarks into your pathway.</p>
              <div className={styles.careerGrid}>
                {CAREER_ROLES.map(role => (
                  <button key={role}
                    className={`${styles.careerOption} ${data.careerGoal === role ? styles.careerSelected : ''}`}
                    onClick={() => setData({...data, careerGoal: role})}>
                    <span className={styles.careerIcon}>🎯</span>
                    <span>{role}</span>
                    {data.careerGoal === role && <span className={styles.careerCheck}>✓</span>}
                  </button>
                ))}
              </div>
              {data.careerGoal && (
                <div className={styles.careerConfirm}>
                  Your custom learning path will be configured to address both current role requirements and the advanced competencies required for <strong>{data.careerGoal}</strong>.
                </div>
              )}
            </div>
          )}

          <div className={styles.navButtons}>
            {step > 0 && <button className="btn btn-secondary" onClick={back}>← Previous</button>}
            <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={next}>
              {step === STEPS.length - 1 ? 'Initiate Baseline Assessment →' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
