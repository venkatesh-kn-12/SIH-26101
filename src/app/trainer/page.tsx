'use client';
import { useState } from 'react';
import Link from 'next/link';
import styles from './trainer.module.css';

const SAMPLE_MCQS = [
  { q: 'What does the term "sampling frame" refer to in survey methodology?', opts: ['The questionnaire format', 'The complete list of population units from which samples are drawn', 'The method used to collect data', 'The time period of the survey'], correct: 1, exp: 'A sampling frame is the source list from which the sample is drawn — e.g., voter rolls, household registers.' },
  { q: 'Which index formula keeps base-period quantities fixed as weights?', opts: ['Paasche Index', 'Fisher Ideal Index', 'Laspeyres Index', 'Edgeworth Index'], correct: 2, exp: 'The Laspeyres index uses base-period quantities as fixed weights, making it easier to compute historically.' },
];

export default function TrainerPage() {
  const [tab, setTab] = useState<'studio'|'assessments'|'courses'>('studio');
  const [uploading, setUploading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [approved, setApproved] = useState<Set<number>>(new Set());

  const generate = async () => {
    setUploading(true);
    await new Promise(r => setTimeout(r, 2000));
    setUploading(false);
    setGenerated(true);
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo}>📈 StatPath AI</Link>
          <div className={styles.trainerBadge}>TRAINER</div>
        </div>
        <nav className={styles.nav}>
          {[['studio','🤖','AI Question Studio'],['assessments','📝','Manage Assessments'],['courses','📚','My Courses']].map(([id,icon,label]) => (
            <button key={id} className={`${styles.navItem} ${tab === id ? styles.navActive : ''}`} onClick={() => setTab(id as 'studio'|'assessments'|'courses')}>
              <span>{icon}</span><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <div className={styles.trainerUser}><div className={styles.ta}>RP</div><div><div className={styles.tn}>Dr. Rahul Patil</div><div className={styles.tr}>Senior Faculty, NSSTA</div></div></div>
          <Link href="/" className={styles.logoutBtn}>🚪 Logout</Link>
        </div>
      </aside>

      <div className={styles.main}>
        <div className={styles.topBar}>
          <h1 className={styles.pageTitle}>{tab === 'studio' ? '🤖 AI Question Studio' : tab === 'assessments' ? '📝 Manage Assessments' : '📚 My Courses'}</h1>
          <span className={styles.trainerBadge2}>Trainer Portal</span>
        </div>
        <div className={styles.content}>
          {tab === 'studio' && (
            <div className={styles.studioLayout}>
              <div className={`card ${styles.uploadSection}`}>
                <h3 className={styles.sectionTitle}>Upload Training Material</h3>
                <div className={styles.uploadZone}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
                  <div style={{ fontSize: 14, color: '#64748b' }}>Drop PDF, DOCX, or PPT here</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Or paste your content below</div>
                </div>
                <textarea className={styles.textArea} placeholder="Paste training material here — lecture notes, policy documents, circulars..." rows={8} />
                <div className={styles.genOptions}>
                  <div><label className="form-label">Questions</label><input type="number" className="form-input" defaultValue={10} min={5} max={50} style={{width:90}} /></div>
                  <div><label className="form-label">Difficulty</label><select className="form-select" style={{width:130}}><option>Mixed</option><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
                  <div><label className="form-label">Topic</label><input className="form-input" placeholder="e.g. Sampling" style={{width:150}} /></div>
                </div>
                <button className="btn btn-primary" style={{width:'100%', marginTop:12}} onClick={generate} disabled={uploading}>
                  {uploading ? '⏳ Generating with AI...' : '✨ Generate MCQs with AI'}
                </button>
              </div>

              {generated && (
                <div className={styles.outputSection}>
                  <div className={styles.outputHeader}>
                    <h3 className={styles.sectionTitle}>Generated MCQs — Trainer Review Required</h3>
                    <div className={styles.outputMeta}>{approved.size}/{SAMPLE_MCQS.length} Approved</div>
                  </div>
                  <div className={styles.infoBox}>⚠️ Review each question before approving. AI assists but does NOT auto-publish. You are the final authority.</div>
                  {SAMPLE_MCQS.map((mcq, i) => (
                    <div key={i} className={`card ${styles.mcqCard} ${approved.has(i) ? styles.mcqApproved : ''}`}>
                      <div className={styles.mcqHeader}>
                        <span className={styles.mcqNum}>Q{i+1}</span>
                        {approved.has(i) && <span className="badge badge-success">✓ Approved</span>}
                      </div>
                      <p className={styles.mcqQ}>{mcq.q}</p>
                      <div className={styles.mcqOpts}>
                        {mcq.opts.map((o, j) => <div key={j} className={`${styles.mcqOpt} ${j === mcq.correct ? styles.correct : ''}`}><span>{String.fromCharCode(65+j)}.</span><span>{o}</span></div>)}
                      </div>
                      <div className={styles.mcqExp}>💡 {mcq.exp}</div>
                      <div className={styles.mcqActions}>
                        <button className="btn btn-secondary btn-sm">✏️ Edit</button>
                        <button className="btn btn-secondary btn-sm">🔄 Regenerate</button>
                        <button
                          className={`btn btn-sm ${approved.has(i) ? 'btn-secondary' : 'btn-primary'}`}
                          onClick={() => { const s = new Set(approved); approved.has(i) ? s.delete(i) : s.add(i); setApproved(s); }}>
                          {approved.has(i) ? '✓ Approved' : '✓ Approve'}
                        </button>
                      </div>
                    </div>
                  ))}
                  {approved.size === SAMPLE_MCQS.length && (
                    <button className="btn btn-primary btn-lg" style={{width:'100%'}}>🚀 Publish Assessment to Employees</button>
                  )}
                </div>
              )}
            </div>
          )}

          {(tab === 'assessments' || tab === 'courses') && (
            <div className={`card ${styles.placeholder}`}>
              <div style={{ fontSize: 48 }}>{tab === 'assessments' ? '📝' : '📚'}</div>
              <h3>{tab === 'assessments' ? 'Assessment Management' : 'Course Management'}</h3>
              <p>This module includes: {tab === 'assessments' ? 'create, edit, and publish assessments; view employee results; export reports.' : 'manage uploaded training content, link to iGOT courses, track engagement.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
