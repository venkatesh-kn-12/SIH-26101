'use client';
import { useState } from 'react';
import { ASSESSMENT_QUESTIONS } from '@/lib/mockData';
import styles from './assess.module.css';

export default function AssessPage() {
  const [active, setActive] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [current, setCurrent] = useState(0);

  const assessments = [
    { id: 'section1', title: 'Survey Methods — Section Assessment', type: 'Section', questions: 3, duration: '10 min', due: 'Due today', status: 'due' },
    { id: 'final1', title: 'Statistical Literacy — Final Assessment', type: 'Final', questions: 20, duration: '45 min', due: 'Due in 3 days', status: 'upcoming' },
    { id: 'periodic', title: '3-Month Periodic Competency Review', type: 'Periodic', questions: 15, duration: '30 min', due: 'Due in 7 days', status: 'upcoming' },
    { id: 'past1', title: 'Sampling Methods Assessment', type: 'Section', questions: 5, duration: '12 min', due: 'Completed 15 Jul 2024', status: 'completed', score: 80 },
    { id: 'past2', title: 'Baseline Assessment', type: 'Baseline', questions: 5, duration: '30 min', due: 'Completed 1 Jul 2024', status: 'completed', score: 64 },
  ];

  const q = ASSESSMENT_QUESTIONS[current];

  if (active) return (
    <div className={styles.assessmentView}>
      <div className={styles.aHeader}>
        <button className="btn btn-secondary btn-sm" onClick={() => { setActive(null); setAnswers({}); setCurrent(0); setSubmitted(false); }}>← Exit</button>
        <div className={styles.aTitle}>Section Assessment</div>
        <div className={styles.aProgress}>{current+1}/{ASSESSMENT_QUESTIONS.length}</div>
      </div>
      {!submitted ? (
        <div className={styles.qBox}>
          <div className={styles.qMeta}>
            <span className="badge badge-primary">{q.competency}</span>
            <span className={`badge ${q.difficulty === 'easy' ? 'badge-success' : q.difficulty === 'medium' ? 'badge-warning' : 'badge-error'}`}>{q.difficulty}</span>
          </div>
          <h2 className={styles.qText}>{q.text}</h2>
          <div className={styles.opts}>
            {q.options.map((opt, i) => (
              <button key={i} className={`${styles.opt} ${answers[current] === i ? styles.optSel : ''}`} onClick={() => setAnswers({...answers, [current]: i})}>
                <span className={styles.optL}>{String.fromCharCode(65+i)}</span><span>{opt}</span>
              </button>
            ))}
          </div>
          <div className={styles.qNav}>
            <button className="btn btn-secondary" onClick={() => setCurrent(c => c-1)} disabled={current === 0}>← Prev</button>
            {current < ASSESSMENT_QUESTIONS.length - 1
              ? <button className="btn btn-primary" onClick={() => setCurrent(c=>c+1)} disabled={answers[current] === undefined}>Next →</button>
              : <button className="btn btn-primary" onClick={() => setSubmitted(true)}>Submit</button>
            }
          </div>
        </div>
      ) : (
        <div className={styles.resultBox}>
          <div style={{ fontSize: 48 }}>🎉</div>
          <h2>Assessment Complete!</h2>
          <div className={styles.scoreCircle}>
            <span>{Math.round((Object.keys(answers).filter(i => ASSESSMENT_QUESTIONS[+i].correctIndex === answers[+i]).length / ASSESSMENT_QUESTIONS.length)*100)}%</span>
          </div>
          <p style={{ color: '#64748b', fontSize: 14 }}>Your competency scores have been updated.</p>
          <button className="btn btn-primary" style={{marginTop:16}} onClick={() => { setActive(null); setSubmitted(false); setAnswers({}); setCurrent(0); }}>Back to Assessments</button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>📝 Assessments</h1>
      <div className={styles.list}>
        {assessments.map(a => (
          <div key={a.id} className={`card ${styles.assessCard}`}>
            <div className={styles.acLeft}>
              <div className={styles.acType}><span className={`badge ${a.type === 'Final' ? 'badge-primary' : a.type === 'Periodic' ? 'badge-warning' : a.type === 'Baseline' ? 'badge-gray' : 'badge-primary'}`}>{a.type}</span></div>
              <div className={styles.acTitle}>{a.title}</div>
              <div className={styles.acMeta}>{a.questions} questions • {a.duration}</div>
            </div>
            <div className={styles.acRight}>
              {a.status === 'completed' ? (
                <div className={styles.scored}>
                  <div className={styles.scoreVal}>{a.score}%</div>
                  <div className={styles.scoreLbl}>Score</div>
                  <span className="badge badge-success">Completed</span>
                </div>
              ) : (
                <>
                  <div className={`badge ${a.status === 'due' ? 'badge-error' : 'badge-warning'}`}>{a.due}</div>
                  <button className="btn btn-primary btn-sm" onClick={() => setActive(a.id)}>Start Assessment →</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
