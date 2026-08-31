'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { COMPETENCY_SCORES, DEMO_USER } from '@/lib/mockData';
import { getCurrentUser, UserProfile } from '@/lib/authStorage';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import styles from './competency.module.css';

const GAP_COLOR = { none: '#22c55e', low: '#84cc16', medium: '#f97316', high: '#ef4444' };

export default function CompetencyPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [assessment, setAssessment] = useState<any>(null);

  useEffect(() => {
    setUser(getCurrentUser());
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('statpath_assessment_results');
        if (stored) setAssessment(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const isDemo = !user || user.empId === DEMO_USER.employeeId;

  const categories = [...new Set(COMPETENCY_SCORES.map(c => c.category))];

  const radarData = isDemo
    ? COMPETENCY_SCORES.slice(0, 7).map(c => ({
        subject: c.name.length > 12 ? c.name.substring(0, 11) + '…' : c.name,
        current: (c.current / 5) * 100,
        required: (c.required / 5) * 100,
      }))
    : (assessment?.topicDetails
        ? assessment.topicDetails.map((tItem: any) => ({
            subject: tItem.topic,
            current: tItem.isCorrect ? 100 : tItem.isAnswered ? 35 : 0,
            required: 80
          }))
        : []);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Competency Digital Twin</h1>
          <p className={styles.subtitle}>
            Your verified competency profile — derived from official assessment diagnostics and domain intake.
          </p>
        </div>
        <div className={styles.lastUpdated}>
          {assessment ? `Last Assessed: ${new Date(assessment.completedAt).toLocaleDateString('en-IN')}` : `Date: ${new Date().toLocaleDateString('en-IN')}`}
        </div>
      </div>

      {!isDemo && !assessment && (
        <div className="card" style={{ marginBottom: 24, padding: 24, textAlign: 'center', background: '#F8FAFC', border: '1px dashed #CBD5E1' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📊</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Baseline Assessment Pending</h2>
          <p style={{ fontSize: 13, color: '#64748B', maxWidth: 600, margin: '6px auto 18px auto' }}>
            As a newly registered officer, your digital twin competency scores will populate immediately upon completing your 15-minute baseline intake assessment.
          </p>
          <Link href="/onboarding/assessment" className="btn btn-primary">
            Initiate Baseline Assessment Now →
          </Link>
        </div>
      )}

      {/* Summary Bands */}
      <div className={styles.bands}>
        {[
          {
            label: 'Verified Strengths',
            icon: '💪',
            items: isDemo ? COMPETENCY_SCORES.filter(c => c.gap === 'none') : (assessment ? assessment.topicDetails.filter((t: any) => t.isCorrect) : []),
            color: '#22c55e'
          },
          {
            label: 'Priority Gaps',
            icon: '🎯',
            items: isDemo ? COMPETENCY_SCORES.filter(c => c.gap === 'high') : (assessment ? assessment.topicDetails.filter((t: any) => t.isAnswered && !t.isCorrect) : []),
            color: '#ef4444'
          },
          {
            label: 'Unanswered Sections',
            icon: '⚡',
            items: isDemo ? COMPETENCY_SCORES.filter(c => c.gap === 'medium') : (assessment ? assessment.topicDetails.filter((t: any) => !t.isAnswered) : []),
            color: '#f97316'
          },
        ].map(band => (
          <div key={band.label} className={`card ${styles.band}`} style={{ borderTop: `4px solid ${band.color}` }}>
            <div className={styles.bandHeader}>
              <span>{band.icon}</span>
              <span className={styles.bandLabel} style={{ color: band.color }}>{band.label}</span>
            </div>
            <div className={styles.bandCount} style={{ color: band.color }}>{band.items.length}</div>
            <div className={styles.bandItems}>
              {band.items.map((i: any) => (
                <span key={i.id || i.topic || i.name} className={styles.bandItem}>
                  {i.topic || i.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.twoCol}>
        {/* Radar */}
        <div className={`card ${styles.section}`}>
          <div className="section-title" style={{ marginBottom: 16 }}>Competency Radar</div>
          {radarData.length > 0 ? (
            <div style={{ height: 300 }}>
              <ResponsiveContainer>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Radar name="Required Target" dataKey="required" stroke="#e2e8f0" fill="#f1f5f9" fillOpacity={0.6} />
                  <Radar name="Current Accuracy" dataKey="current" stroke="#003087" fill="#003087" fillOpacity={0.35} />
                  <Legend formatter={(v) => <span style={{ fontSize: 12, color: '#64748b' }}>{v}</span>} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B', fontStyle: 'italic' }}>
              Take your baseline assessment to plot your competency radar.
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className={`card ${styles.section}`}>
          <div className="section-title" style={{ marginBottom: 4 }}>Skill Progression Timeline</div>
          <div className="section-subtitle" style={{ marginBottom: 16 }}>Track how your competencies evolve over time</div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={isDemo ? COMPETENCY_SCORES[4].timeline : [{ month: 'Day 1', score: assessment ? assessment.score / 20 : 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => [`${v}/5`, 'Competency Score']} />
                <Line type="monotone" dataKey="score" stroke="#003087" strokeWidth={2} dot={{ fill: '#003087', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.timelineNote}>
            Status: <strong style={{ color: '#003087' }}>{assessment ? `Baseline Score Verified: ${assessment.scoreFormatted}` : 'Intake Established'}</strong>
          </div>
        </div>
      </div>

      {/* Competency Map */}
      {isDemo ? (
        <div className={`card ${styles.section}`} style={{ marginTop: 20 }}>
          <div className="section-title" style={{ marginBottom: 16 }}>Complete Competency Map</div>
          {categories.map(cat => (
            <div key={cat} className={styles.catSection}>
              <div className={styles.catTitle}>{cat}</div>
              <div className={styles.compGrid}>
                {COMPETENCY_SCORES.filter(c => c.category === cat).map(c => (
                  <div key={c.id} className={styles.compCard}>
                    <div className={styles.compHeader}>
                      <span className={styles.compName}>{c.name}</span>
                      <span className={styles.compGap} style={{ color: GAP_COLOR[c.gap] }}>
                        {c.gap === 'none' ? '✓ Met' : `${c.gap.charAt(0).toUpperCase() + c.gap.slice(1)} Gap`}
                      </span>
                    </div>
                    <div className={styles.compScores}>
                      <span>Current: <strong style={{ color: '#003087' }}>{c.current}</strong></span>
                      <span>Required: <strong>{c.required}</strong></span>
                    </div>
                    <div className={styles.compBarWrap}>
                      <div className={styles.compBarBg}>
                        <div className={styles.compBarFill} style={{ width: `${(c.current / 5) * 100}%`, background: GAP_COLOR[c.gap] }} />
                        <div className={styles.compBarReq} style={{ left: `${(c.required / 5) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : assessment ? (
        <div className={`card ${styles.section}`} style={{ marginTop: 20 }}>
          <div className="section-title" style={{ marginBottom: 16 }}>Assessment Topic Diagnostics Map</div>
          <div className={styles.compGrid}>
            {assessment.topicDetails?.map((tItem: any) => (
              <div key={tItem.id} className={styles.compCard}>
                <div className={styles.compHeader}>
                  <span className={styles.compName}>{tItem.topic}</span>
                  <span className="badge" style={{ background: tItem.isCorrect ? '#DCFCE7' : '#FEE2E2', color: tItem.isCorrect ? '#15803D' : '#991B1B' }}>
                    {tItem.status}
                  </span>
                </div>
                <div className={styles.compScores}>
                  <span>Domain: <strong>{tItem.competency}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className={styles.actions}>
        <Link href="/dashboard/learn" className="btn btn-primary">View Learning Path for My Gaps →</Link>
        <Link href="/dashboard/career" className="btn btn-secondary">Simulate Career Change</Link>
      </div>
    </div>
  );
}
