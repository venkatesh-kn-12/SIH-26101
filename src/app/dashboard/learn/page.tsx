'use client';
import { useState } from 'react';
import Link from 'next/link';
import { getOrderedRoleRecommendations, OrderedLearningStep } from '@/lib/recommendationEngine';
import styles from './learn.module.css';

function formatDuration(seconds: string) {
  const s = parseInt(seconds, 10);
  if (!s) return 'Self-paced';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function LearnPage() {
  const [selectedRole, setSelectedRole] = useState<string>('Statistical Officer');
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  // Strictly fetched & ordered recommendation sequence consuming public/content-list-data.json
  const orderedPath: OrderedLearningStep[] = getOrderedRoleRecommendations(selectedRole);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Your Sequential iGOT Learning Path</h1>
          <p className={styles.subtitle}>Curated directly from the official iGOT Karmayogi catalog (content-list-data.json) for your designation.</p>
        </div>
        <div className={styles.pathMeta}>
          <div className={styles.metaItem}>🎯 Target Role: <strong>{selectedRole}</strong></div>
          <div className={styles.metaItem}>📚 {orderedPath.length} Sequential iGOT Courses</div>
        </div>
      </div>

      {/* Role Selection Selector */}
      <div className={`card ${styles.whyCard}`} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className={styles.whyTitle}>📌 Select Officer Role Profile:</div>
            <p style={{ fontSize: 13, color: 'var(--gray-600)' }}>StatPath AI dynamically matches and orders courses strictly from iGOT content-list-data.json based on official role competency requirements.</p>
          </div>
          <select 
            value={selectedRole} 
            onChange={e => setSelectedRole(e.target.value)}
            className="form-select"
            style={{ width: 260, fontWeight: 700 }}
          >
            <option value="Statistical Officer">Statistical Officer</option>
            <option value="Data Analyst / Investigator">Data Analyst / Investigator</option>
          </select>
        </div>
      </div>

      {/* Sequential Journey Timeline */}
      <div className={styles.courseList}>
        {orderedPath.map((step, idx) => {
          const c = step.course;
          return (
            <div key={c.identifier} className={`card ${styles.phaseDetail}`} style={{ marginBottom: 20, borderLeft: '4px solid var(--ux4g-gov-navy)' }}>
              <div className={styles.pdHeader}>
                <div>
                  <div className="badge badge-karnataka" style={{ marginBottom: 6 }}>
                    {step.phaseName}
                  </div>
                  <h2 className={styles.pdTitle}>{c.name}</h2>
                  <p className={styles.pdDesc}>{c.description || step.recommendationReason}</p>
                </div>
                <div className="badge badge-primary">
                  {step.targetCompetency}
                </div>
              </div>

              <div className={styles.courseRow} style={{ background: '#F8FAFC', padding: 16, borderRadius: 8, marginTop: 12 }}>
                <div className={styles.courseNum}>#{idx + 1}</div>
                <img src={c.appIcon} alt={c.name} className={styles.courseThumb} onError={e => (e.currentTarget.style.display = 'none')} />
                <div className={styles.courseInfo}>
                  <div className={styles.courseName}>{c.name}</div>
                  <div className={styles.courseMeta}>
                    <span>🏛️ Provider: <strong>{c.source}</strong></span>
                    <span>⏱️ Duration: <strong>{formatDuration(c.duration)}</strong></span>
                    <span>🆔 iGOT ID: <code>{c.identifier}</code></span>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--gray-700)', background: '#EFF6FF', padding: '6px 10px', borderRadius: 4 }}>
                    🧠 <strong>Why Required in Order:</strong> {step.recommendationReason}
                  </div>
                </div>
                <div className={styles.courseActions}>
                  <button className="btn btn-primary btn-sm" onClick={() => setSelectedCourse(c.identifier)}>
                    Learn with AI ✨
                  </button>
                  <a 
                    href={`https://igotkarmayogi.gov.in/app/toc/${c.identifier}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-secondary btn-sm"
                  >
                    Open on iGOT →
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Learning Mode Modal */}
      {selectedCourse && (
        <div className={styles.modalOverlay} onClick={() => setSelectedCourse(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Choose Learning Mode</h3>
              <button onClick={() => setSelectedCourse(null)}>✕</button>
            </div>
            <div className={styles.modeCards}>
              <Link href="/dashboard/learn/ai-guided" className={styles.modeCard}>
                <div className={styles.modeIcon}>🤖</div>
                <div className={styles.modeTitle}>AI-Guided Learning</div>
                <div className={styles.modeDesc}>Content broken into micro-units with flashcards, summaries, examples, and interactive questions. Best for deep understanding.</div>
                <div className="btn btn-primary" style={{ marginTop: 12, width: '100%', textAlign: 'center', padding: '10px' }}>Start AI Learning ✨</div>
              </Link>
              <a href="https://igotkarmayogi.gov.in" target="_blank" rel="noopener noreferrer" className={styles.modeCard}>
                <div className={styles.modeIcon}>📚</div>
                <div className={styles.modeTitle}>Learn on iGOT Directly</div>
                <div className={styles.modeDesc}>Navigate directly to the official iGOT Karmayogi course. Progress will be tracked and reflected here.</div>
                <div className="btn btn-secondary" style={{ marginTop: 12, width: '100%', textAlign: 'center', padding: '10px' }}>Open in iGOT →</div>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
