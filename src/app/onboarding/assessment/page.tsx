'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ASSESSMENT_QUESTIONS } from '@/lib/mockData';
import styles from './assessment.module.css';

export default function AssessmentPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft] = useState(30);
  const total = ASSESSMENT_QUESTIONS.length;
  const q = ASSESSMENT_QUESTIONS[current];

  const select = (idx: number) => { if (!submitted) setAnswers({ ...answers, [current]: idx }); };
  const next = () => current < total - 1 ? setCurrent(current + 1) : setSubmitted(true);
  const prev = () => current > 0 && setCurrent(current - 1);

  const score = submitted ? Math.round((Object.entries(answers).filter(([qi, ai]) => ASSESSMENT_QUESTIONS[+qi].correctIndex === ai).length / total) * 100) : 0;

  if (submitted) return (
    <div className={styles.page}>
      <div className={styles.resultCard}>
        <div className={styles.resultIcon}>{score >= 70 ? '🎉' : score >= 50 ? '📊' : '📖'}</div>
        <h2 className={styles.resultTitle}>Baseline Assessment Complete</h2>
        <div className={styles.scoreCircle}>
          <span className={styles.scoreNum}>{score}%</span>
          <span className={styles.scoreLabel}>Score</span>
        </div>
        <p className={styles.resultDesc}>Your competency profile has been calculated. We've identified your strengths and priority gaps across {total} competency domains.</p>
        <div className={styles.resultStats}>
          {[{label:'Correct', val: Object.entries(answers).filter(([qi,ai]) => ASSESSMENT_QUESTIONS[+qi].correctIndex === ai).length, color:'#22c55e'},
            {label:'Incorrect', val: total - Object.entries(answers).filter(([qi,ai]) => ASSESSMENT_QUESTIONS[+qi].correctIndex === ai).length, color:'#ef4444'},
            {label:'Total', val: total, color:'#003087'},
          ].map(s => (
            <div key={s.label} className={styles.resStat}><span style={{ color: s.color, fontSize: 24, fontWeight: 800 }}>{s.val}</span><span>{s.label}</span></div>
          ))}
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => router.push('/dashboard')} style={{ width: '100%', marginTop: 8 }}>
          View My Competency Profile & Learning Path →
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Adaptive Baseline Assessment</h1>
            <p className={styles.subtitle}>Role: Statistical Officer • Price Statistics Division</p>
          </div>
          <div className={styles.timer}>⏱ {timeLeft} min remaining</div>
        </div>

        <div className={styles.progressRow}>
          <div className={styles.progressText}>Question {current + 1} of {total}</div>
          <div className="progress-bar" style={{ flex: 1 }}>
            <div className="progress-fill" style={{ width: `${((current + 1) / total) * 100}%` }} />
          </div>
          <div className={styles.progressPct}>{Math.round(((current + 1) / total) * 100)}%</div>
        </div>

        <div className={styles.qCard}>
          <div className={styles.qMeta}>
            <span className="badge badge-primary">{q.competency}</span>
            <span className={`badge ${q.difficulty === 'easy' ? 'badge-success' : q.difficulty === 'medium' ? 'badge-warning' : 'badge-error'}`}>{q.difficulty}</span>
            <span className="badge badge-gray">{q.topic}</span>
          </div>
          <h2 className={styles.qText}>{q.text}</h2>
          <div className={styles.options}>
            {q.options.map((opt, i) => (
              <button key={i}
                className={`${styles.option} ${answers[current] === i ? styles.optSelected : ''}`}
                onClick={() => select(i)}>
                <span className={styles.optLetter}>{String.fromCharCode(65 + i)}</span>
                <span>{opt}</span>
                {answers[current] === i && <span className={styles.optCheck}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.navRow}>
          <button className="btn btn-secondary" onClick={prev} disabled={current === 0}>← Previous</button>
          <div className={styles.qDots}>
            {ASSESSMENT_QUESTIONS.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`${styles.dot} ${i === current ? styles.dotActive : ''} ${answers[i] !== undefined ? styles.dotAnswered : ''}`} />
            ))}
          </div>
          <button className="btn btn-primary" onClick={next}>
            {current === total - 1 ? 'Submit Assessment' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
