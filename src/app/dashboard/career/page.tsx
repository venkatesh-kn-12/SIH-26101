'use client';
import { useState, useEffect } from 'react';
import { CAREER_PATH, COMPETENCY_SCORES } from '@/lib/mockData';
import { getCurrentUser, UserProfile } from '@/lib/authStorage';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend } from 'recharts';
import styles from './career.module.css';

const ROLES = ['Senior Statistical Officer', 'Assistant Director', 'Deputy Director', 'Data Scientist (Govt.)', 'Director of Statistics'];
const READINESS = { 'Senior Statistical Officer': 62, 'Assistant Director': 44, 'Deputy Director': 31, 'Data Scientist (Govt.)': 38, 'Director of Statistics': 22 };
const MONTHS = { 'Senior Statistical Officer': 14, 'Assistant Director': 24, 'Deputy Director': 36, 'Data Scientist (Govt.)': 20, 'Director of Statistics': 48 };

export default function CareerPage() {
  const [selected, setSelected] = useState('Senior Statistical Officer');
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const readiness = READINESS[selected as keyof typeof READINESS];
  const months = MONTHS[selected as keyof typeof MONTHS];

  const radarData = COMPETENCY_SCORES.slice(0, 7).map(c => ({
    subject: c.name.split(' ')[0],
    current: (c.current / 5) * 100,
    required: (c.required / 5) * 100,
    future: Math.min(5, c.required + 0.5) / 5 * 100,
  }));

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>🎯 Career Simulator</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Simulate career progression and see exactly what competencies you need to develop</p>
      </div>

      <div className={styles.layout}>
        {/* Left — Role Selector */}
        <div>
          <div className={`card ${styles.currentRole}`}>
            <div className={styles.roleLabel}>Current Role</div>
            <div className={styles.roleName}>{user?.designation || 'Statistical Officer'}</div>
            <div className={styles.roleDept}>{user?.dept || 'Economics Statistics Division (ESD)'} • MoSPI</div>
          </div>
          <div className={`card ${styles.roleSelector}`}>
            <div className={styles.selectorTitle}>What if I want to become...</div>
            {ROLES.map(role => (
              <button key={role}
                className={`${styles.roleOption} ${selected === role ? styles.roleSelected : ''}`}
                onClick={() => setSelected(role)}>
                <span>🎯</span>
                <span className={styles.roleOptName}>{role}</span>
                <span className={styles.roleReadiness} style={{ color: READINESS[role as keyof typeof READINESS] >= 50 ? '#16a34a' : READINESS[role as keyof typeof READINESS] >= 35 ? '#f97316' : '#ef4444' }}>
                  {READINESS[role as keyof typeof READINESS]}%
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right — Analysis */}
        <div className={styles.analysis}>
          <div className={`card ${styles.readinessCard}`}>
            <div className={styles.readinessHeader}>
              <div>
                <div className={styles.readinessTitle}>Current Readiness</div>
                <div className={styles.readinessRole}>for {selected}</div>
              </div>
              <div className={styles.readinessPct}>{readiness}%</div>
            </div>
            <div className="progress-bar" style={{ height: 12 }}>
              <div className="progress-fill" style={{ width: `${readiness}%`, background: readiness >= 60 ? '#22c55e' : readiness >= 40 ? '#f97316' : '#ef4444', height: '100%' }} />
            </div>
            <div className={styles.readinessMeta}>
              <span>Est. {months} months with current learning pace</span>
              <span>{CAREER_PATH.missingSkills.length} competencies to develop</span>
            </div>
          </div>

          <div className={`card ${styles.radarCard}`}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: '#0f172a' }}>Competency Gap Analysis</div>
            <div style={{ height: 260 }}>
              <ResponsiveContainer>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Radar name="Target Role Required" dataKey="future" stroke="#FF6B00" fill="#FF6B00" fillOpacity={0.15} />
                  <Radar name="Current" dataKey="current" stroke="#003087" fill="#003087" fillOpacity={0.35} />
                  <Legend formatter={(v) => <span style={{ fontSize: 11, color: '#64748b' }}>{v}</span>} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`card ${styles.gapList}`}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: '#0f172a' }}>Competencies to Develop</div>
            {CAREER_PATH.missingSkills.map((skill, i) => (
              <div key={skill.id} className={styles.skillGapRow}>
                <div className={styles.sgNum}>{i + 1}</div>
                <div className={styles.sgInfo}>
                  <div className={styles.sgName}>{skill.name}</div>
                  <div className={styles.sgBar}>
                    <div className={styles.sgTrack}>
                      <div className={styles.sgFill} style={{ width: `${(skill.current / 5) * 100}%` }} />
                      <div className={styles.sgTarget} style={{ left: `${(skill.required / 5) * 100}%` }} />
                    </div>
                    <span className={styles.sgVals}>{skill.current} → {skill.required}</span>
                  </div>
                </div>
                <span className={`badge ${skill.gap === 'high' ? 'badge-error' : 'badge-warning'}`}>{skill.gap}</span>
              </div>
            ))}
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }}>
              Generate Learning Path for {selected} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
