'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ASSESSMENT_QUESTIONS } from '@/lib/mockData';
import { getCurrentUser, UserProfile } from '@/lib/authStorage';
import styles from './assessment.module.css';

export default function AssessmentPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [assessmentSummary, setAssessmentSummary] = useState<any>(null);

  const total = ASSESSMENT_QUESTIONS.length;
  const q = ASSESSMENT_QUESTIONS[current];

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  // Real-time countdown timer
  useEffect(() => {
    if (submitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted, timeLeft]);

  const finishAssessment = () => {
    const topicDetails = ASSESSMENT_QUESTIONS.map((qItem, idx) => {
      const selectedAnswer = answers[idx];
      const isAnswered = selectedAnswer !== undefined;
      const isCorrect = isAnswered && selectedAnswer === qItem.correctIndex;
      return {
        id: qItem.id,
        topic: qItem.topic,
        competency: qItem.competency,
        text: qItem.text,
        userAnswerIndex: selectedAnswer,
        userAnswerText: isAnswered ? qItem.options[selectedAnswer] : 'Not Answered',
        correctAnswerText: qItem.options[qItem.correctIndex],
        isCorrect,
        isAnswered,
        status: !isAnswered ? 'Unanswered' : isCorrect ? 'Correct' : 'Incorrect'
      };
    });

    const correctCount = topicDetails.filter(t => t.isCorrect).length;
    const incorrectCount = topicDetails.filter(t => t.isAnswered && !t.isCorrect).length;
    const unansweredCount = topicDetails.filter(t => !t.isAnswered).length;
    const overallPercentage = Math.round((correctCount / total) * 100);

    const weakTopics = Array.from(new Set(topicDetails.filter(t => !t.isCorrect).map(t => t.topic)));
    const strongTopics = Array.from(new Set(topicDetails.filter(t => t.isCorrect).map(t => t.topic)));

    const summary = {
      score: overallPercentage,
      scoreFormatted: `${(overallPercentage / 20).toFixed(1)} / 5.0`,
      totalQuestions: total,
      correctCount,
      incorrectCount,
      unansweredCount,
      completedAt: new Date().toISOString(),
      topicDetails,
      weakTopics,
      strongTopics
    };

    setAssessmentSummary(summary);

    if (typeof window !== 'undefined') {
      localStorage.setItem('statpath_assessment_results', JSON.stringify(summary));
    }

    setSubmitted(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const select = (idx: number) => { if (!submitted) setAnswers({ ...answers, [current]: idx }); };
  const next = () => current < total - 1 ? setCurrent(current + 1) : finishAssessment();
  const prev = () => current > 0 && setCurrent(current - 1);

  if (submitted && assessmentSummary) return (
    <div className={styles.page}>
      <div className={styles.resultCard} style={{ maxWidth: 760 }}>
        <div className={styles.resultIcon}>{assessmentSummary.score >= 70 ? '🎉' : assessmentSummary.score >= 50 ? '📊' : '📖'}</div>
        <h2 className={styles.resultTitle}>Baseline Assessment Diagnostics Complete</h2>
        <div className={styles.scoreCircle}>
          <span className={styles.scoreNum}>{assessmentSummary.score}%</span>
          <span className={styles.scoreLabel}>Score ({assessmentSummary.scoreFormatted})</span>
        </div>
        <p className={styles.resultDesc}>
          Your competency profile has been calculated and stored. StatPath AI has evaluated your response accuracy across key official statistical domains to generate your custom learning path.
        </p>

        <div className={styles.resultStats} style={{ marginTop: 24 }}>
          {[{label:'Correct', val: assessmentSummary.correctCount, color:'#22c55e'},
            {label:'Incorrect', val: assessmentSummary.incorrectCount, color:'#ef4444'},
            {label:'Unanswered', val: assessmentSummary.unansweredCount, color:'#f59e0b'},
            {label:'Total Questions', val: assessmentSummary.totalQuestions, color:'#003087'},
          ].map(s => (
            <div key={s.label} className={styles.resStat}><span style={{ color: s.color, fontSize: 24, fontWeight: 800 }}>{s.val}</span><span>{s.label}</span></div>
          ))}
        </div>

        <button className="btn btn-primary btn-lg" onClick={() => router.push('/dashboard')} style={{ width: '100%', marginTop: 24 }}>
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
            <p className={styles.subtitle}>
              Role: {currentUser?.designation || 'Statistical Officer'} • {currentUser?.dept || 'Price Statistics Division'}
            </p>
          </div>
          <div className={styles.timer} style={{ color: timeLeft < 120 ? '#C8102E' : 'inherit', fontWeight: 700 }}>
            ⏱ {formatTime(timeLeft)} remaining
          </div>
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
