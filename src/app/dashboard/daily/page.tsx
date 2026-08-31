'use client';
import { useState } from 'react';
import { DAILY_BYTE } from '@/lib/mockData';
import styles from './daily.module.css';

const RETENTION_ITEMS = [
  { concept: 'Stratified Sampling', learnedDays: 21, status: 'due' },
  { concept: 'Laspeyres Price Index', learnedDays: 14, status: 'due' },
  { concept: 'Coefficient of Variation', learnedDays: 7, status: 'ok' },
  { concept: 'Systematic Sampling', learnedDays: 3, status: 'ok' },
];

export default function DailyPage() {
  const [phase, setPhase] = useState<'intro' | 'learn' | 'quiz' | 'done'>('intro');
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);

  const options = ['Simple Random Sampling', 'Stratified Random Sampling', 'Cluster Sampling', 'Systematic Sampling'];

  const submit = () => {
    if (selected === null) return;
    setCorrect(selected === 1);
    setTimeout(() => setPhase('done'), 1500);
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>⚡ Daily Learning</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>5–10 minute daily learning units designed for busy officials</p>
      </div>

      <div className={styles.layout}>
        <div className={styles.mainCol}>
          {/* Daily Byte Card */}
          {phase === 'intro' && (
            <div className={`card ${styles.byteCard}`}>
              <div className={styles.byteTop}>
                <div className={styles.byteLabel}>Today's Skill Byte</div>
                <div className={styles.byteTime}>⏱ 7 minutes</div>
              </div>
              <h2 className={styles.byteConcept}>{DAILY_BYTE.concept}</h2>
              <div className={styles.byteCompetency}>📊 Competency: {DAILY_BYTE.competency}</div>
              <p className={styles.byteDesc}>{DAILY_BYTE.shortExplanation}</p>
              <div className={styles.byteSteps}>
                {['Read Concept', 'See Example', 'Visual', 'Quick Quiz', 'Done ✓'].map((s, i) => (
                  <div key={s} className={styles.byteStep}><span className={styles.stepNum}>{i+1}</span><span>{s}</span></div>
                ))}
              </div>
              <button className="btn btn-primary btn-lg" style={{ marginTop: 20, width: '100%' }} onClick={() => setPhase('learn')}>
                Start Today's Learning →
              </button>
            </div>
          )}

          {phase === 'learn' && (
            <div className={`card ${styles.learnCard}`}>
              <div className={styles.lessonHeader}>
                <div className={styles.lessonStep}>Step 1 of 4 — Concept</div>
                <div className={styles.lessonProgress}><div className="progress-bar" style={{width:200}}><div className="progress-fill" style={{width:'25%'}}/></div></div>
              </div>
              <h2 className={styles.lessonTitle}>{DAILY_BYTE.concept}</h2>
              <div className={styles.lessonContent}>
                <p>{DAILY_BYTE.shortExplanation}</p>
                <div className={styles.exampleBox}>
                  <div className={styles.exampleTitle}>📋 Real-World Example</div>
                  <p>In India's <strong>Consumer Price Index (CPI)</strong> survey, the population is divided into rural and urban strata. Samples are drawn independently from each stratum to ensure both groups are proportionally represented in the final index.</p>
                </div>
                <div className={styles.visualBox}>
                  <div className={styles.visualTitle}>🗺️ Visual Representation</div>
                  <div className={styles.strataDiagram}>
                    {['Rural (40% of pop) → 400 samples', 'Semi-Urban (25%) → 250 samples', 'Urban (35%) → 350 samples'].map(s => (
                      <div key={s} className={styles.strata}><div className={styles.strataBar} style={{width: s.includes('Rural') ? '70%' : s.includes('Semi') ? '45%' : '60%'}} /><span>{s}</span></div>
                    ))}
                  </div>
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setPhase('quiz')}>Continue to Quiz →</button>
            </div>
          )}

          {phase === 'quiz' && (
            <div className={`card ${styles.quizCard}`}>
              <div className={styles.lessonStep}>Step 4 of 4 — Quick Quiz</div>
              <h3 className={styles.quizQ}>{DAILY_BYTE.scenario}</h3>
              <div className={styles.quizOptions}>
                {options.map((opt, i) => (
                  <button key={i}
                    className={`${styles.quizOpt} ${selected === i ? styles.quizSel : ''} ${correct !== null && i === 1 ? styles.quizCorrect : ''} ${correct === false && selected === i && i !== 1 ? styles.quizWrong : ''}`}
                    onClick={() => setSelected(i)} disabled={correct !== null}>
                    <span>{String.fromCharCode(65+i)}</span><span>{opt}</span>
                  </button>
                ))}
              </div>
              <button className="btn btn-primary" style={{width:'100%',marginTop:12}} onClick={submit} disabled={selected === null || correct !== null}>
                Submit Answer
              </button>
            </div>
          )}

          {phase === 'done' && (
            <div className={`card ${styles.doneCard}`}>
              <div style={{ fontSize: 52 }}>{correct ? '🎉' : '📖'}</div>
              <h2>{correct ? 'Correct! Well done.' : 'Not quite — but you learned!'}</h2>
              <p style={{ color: '#64748b', marginTop: 8, fontSize: 14 }}>{DAILY_BYTE.answer}</p>
              <div className={styles.doneStats}>
                <div className={styles.doneStat}><span className={styles.doneVal}>+0.02</span><span>Sampling Theory</span></div>
                <div className={styles.doneStat}><span className={styles.doneVal}>7 min</span><span>Time spent</span></div>
                <div className={styles.doneStat}><span className={styles.doneVal}>12 🔥</span><span>Day streak</span></div>
              </div>
              <button className="btn btn-primary" style={{width:'100%',marginTop:16}} onClick={() => setPhase('intro')}>Back to Daily Learning</button>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className={styles.sideCol}>
          {/* Retention Engine */}
          <div className={`card ${styles.sideCard}`}>
            <div className={styles.sideTitle}>🔁 Knowledge Retention</div>
            <p className={styles.sideDesc}>Concepts due for spaced revision to maintain retention</p>
            {RETENTION_ITEMS.map(item => (
              <div key={item.concept} className={styles.retentionRow}>
                <div className={styles.retInfo}>
                  <span className={styles.retConcept}>{item.concept}</span>
                  <span className={styles.retDays}>Learned {item.learnedDays}d ago</span>
                </div>
                <span className={`badge ${item.status === 'due' ? 'badge-warning' : 'badge-success'}`}>
                  {item.status === 'due' ? '🔁 Due' : '✓ OK'}
                </span>
              </div>
            ))}
          </div>

          {/* Weekly Progress */}
          <div className={`card ${styles.sideCard}`}>
            <div className={styles.sideTitle}>📅 This Week</div>
            <div className={styles.weekGrid}>
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => (
                <div key={day} className={`${styles.weekDay} ${i < 4 ? styles.weekDone : i === 4 ? styles.weekToday : styles.weekFuture}`}>
                  <div className={styles.weekDot}>{i < 4 ? '✓' : i === 4 ? '▶' : ''}</div>
                  <div>{day}</div>
                </div>
              ))}
            </div>
            <div className={styles.streakInfo}>🔥 12-day streak • Keep it going!</div>
          </div>
        </div>
      </div>
    </div>
  );
}
