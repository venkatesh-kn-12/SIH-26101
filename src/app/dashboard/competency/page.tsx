'use client';
import Link from 'next/link';
import { COMPETENCY_SCORES } from '@/lib/mockData';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import styles from './competency.module.css';

const GAP_COLOR = { none: '#22c55e', low: '#84cc16', medium: '#f97316', high: '#ef4444' };

export default function CompetencyPage() {
  const categories = [...new Set(COMPETENCY_SCORES.map(c => c.category))];
  const radarData = COMPETENCY_SCORES.slice(0,7).map(c => ({
    subject: c.name.length > 12 ? c.name.substring(0,11)+'…' : c.name,
    current: (c.current / 5) * 100,
    required: (c.required / 5) * 100,
  }));

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Competency Digital Twin</h1>
          <p className={styles.subtitle}>Your continuously evolving competency profile — what you know, what you've demonstrated, and what you need to develop.</p>
        </div>
        <div className={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>
      </div>

      {/* Summary Bands */}
      <div className={styles.bands}>
        {[
          { label: 'Strengths', icon: '💪', items: COMPETENCY_SCORES.filter(c => c.gap === 'none'), color: '#22c55e' },
          { label: 'Priority Gaps', icon: '🎯', items: COMPETENCY_SCORES.filter(c => c.gap === 'high'), color: '#ef4444' },
          { label: 'Moderate Gaps', icon: '⚡', items: COMPETENCY_SCORES.filter(c => c.gap === 'medium'), color: '#f97316' },
          { label: 'Near Target', icon: '📈', items: COMPETENCY_SCORES.filter(c => c.gap === 'low'), color: '#eab308' },
        ].map(band => (
          <div key={band.label} className={`card ${styles.band}`} style={{ borderTop: `4px solid ${band.color}` }}>
            <div className={styles.bandHeader}>
              <span>{band.icon}</span>
              <span className={styles.bandLabel} style={{ color: band.color }}>{band.label}</span>
            </div>
            <div className={styles.bandCount} style={{ color: band.color }}>{band.items.length}</div>
            <div className={styles.bandItems}>{band.items.map(i => <span key={i.id} className={styles.bandItem}>{i.name}</span>)}</div>
          </div>
        ))}
      </div>

      <div className={styles.twoCol}>
        {/* Radar */}
        <div className={`card ${styles.section}`}>
          <div className="section-title" style={{ marginBottom: 16 }}>Competency Radar</div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
                <Radar name="Required" dataKey="required" stroke="#e2e8f0" fill="#f1f5f9" fillOpacity={0.6} />
                <Radar name="Current" dataKey="current" stroke="#003087" fill="#003087" fillOpacity={0.35} />
                <Legend formatter={(v) => <span style={{ fontSize: 12, color: '#64748b' }}>{v}</span>} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Timeline — Python growth */}
        <div className={`card ${styles.section}`}>
          <div className="section-title" style={{ marginBottom: 4 }}>Skill DNA Timeline</div>
          <div className="section-subtitle" style={{ marginBottom: 16 }}>Track how your competencies evolve over time</div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={COMPETENCY_SCORES[4].timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => [`${v}/5`, 'Competency Score']} />
                <Line type="monotone" dataKey="score" stroke="#003087" strokeWidth={2} dot={{ fill: '#003087', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.timelineNote}>
            Python Programming: <strong style={{ color: '#003087' }}>1.2 → 1.8</strong> in 6 months
          </div>
        </div>
      </div>

      {/* Full competency table */}
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

      <div className={styles.actions}>
        <Link href="/dashboard/learn" className="btn btn-primary">View Learning Path for My Gaps →</Link>
        <Link href="/dashboard/career" className="btn btn-secondary">Simulate Career Change</Link>
      </div>
    </div>
  );
}
