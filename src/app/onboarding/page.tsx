'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './onboarding.module.css';

const STEPS = ['Welcome', 'Professional Info', 'Prior Learning', 'Self-Assessment', 'Career Goals'];
const SKILLS = ['Survey Design','Sampling Methods','Data Quality','Statistical Analysis','Python','SQL','R Programming','GIS','Data Visualisation','Price Indices','Agricultural Stats','AI/ML','Cloud Computing','Report Writing','Project Management'];
const CAREER_ROLES = ['Senior Statistical Officer','Assistant Director','Deputy Director','Director','Data Scientist (Govt.)','Chief Statistician','Statistical Analyst (Tech Focus)'];

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
          <div className={styles.logo}>📈 StatPath AI</div>
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
              <div className={styles.welcomeEmoji}>👋</div>
              <h1>Welcome to StatPath AI</h1>
              <p>Let's take a few minutes to understand your professional journey. This helps us create a completely personalised learning experience — not just a list of courses, but a path designed for <em>you</em>.</p>
              <div className={styles.welcomePoints}>
                {['We will assess your actual competency — not just course completions', 'We will identify your specific skill gaps vs. your role requirements', 'We will create a phased learning path with iGOT Karmayogi courses', 'We will track and update your competency continuously'].map(p => (
                  <div key={p} className={styles.point}><span>✓</span><span>{p}</span></div>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className={styles.stepTitle}>Professional Information</h2>
              <p className={styles.stepSubtitle}>Tell us about your current role and responsibilities</p>
              <div className="form-group">
                <label className="form-label">Years of Experience in Statistics</label>
                <select className="form-select" value={data.experience} onChange={e => setData({...data, experience: e.target.value})}>
                  <option value="">Select range</option>
                  {['Less than 1 year','1-3 years','3-5 years','5-10 years','10-15 years','More than 15 years'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Highest Educational Qualification</label>
                <select className="form-select" value={data.education} onChange={e => setData({...data, education: e.target.value})}>
                  <option value="">Select qualification</option>
                  {['B.Sc. Statistics','M.Sc. Statistics','B.Tech / B.E.','M.Tech / M.E.','MBA / PGDM','Ph.D.','Other'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Primary Areas of Responsibility</label>
                <textarea className="form-input" rows={3} placeholder="e.g. Price data collection, CPI compilation, survey supervision..." value={data.responsibilities} onChange={e => setData({...data, responsibilities: e.target.value})} style={{ resize: 'vertical' }} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className={styles.stepTitle}>Prior Learning & Training</h2>
              <p className={styles.stepSubtitle}>List any courses, programmes, or certifications completed</p>
              <div className={styles.infoBox}>
                💡 <strong>Note:</strong> We will validate your prior learning through a short targeted assessment. Course completion ≠ competency — our system distinguishes between the two.
              </div>
              <div className="form-group">
                <label className="form-label">iGOT / Training Courses Completed</label>
                <textarea className="form-input" rows={3} placeholder="e.g. Statistical Literacy (IIM Bangalore), Introduction to R..." value={data.completedCourses} onChange={e => setData({...data, completedCourses: e.target.value})} style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label className="form-label">NSSTA / TPAC Programmes Attended</label>
                <textarea className="form-input" rows={2} placeholder="e.g. Foundation Training 2019, Advanced Data Analysis Workshop..." value={data.certifications} onChange={e => setData({...data, certifications: e.target.value})} style={{ resize: 'vertical' }} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className={styles.stepTitle}>Self-Assessment</h2>
              <p className={styles.stepSubtitle}>Rate your comfort level in each area (1=Beginner, 5=Expert). This is optional and will be validated by our assessment.</p>
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
              <h2 className={styles.stepTitle}>Career Aspirations</h2>
              <p className={styles.stepSubtitle}>Where would you like your career to progress? This helps us include future competency requirements in your learning path.</p>
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
                  Your learning path will be optimised for both your <strong>current role requirements</strong> and the competencies needed for <strong>{data.careerGoal}</strong>.
                </div>
              )}
            </div>
          )}

          <div className={styles.navButtons}>
            {step > 0 && <button className="btn btn-secondary" onClick={back}>← Back</button>}
            <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={next}>
              {step === STEPS.length - 1 ? 'Start Adaptive Assessment →' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
