'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, UserProfile } from '@/lib/authStorage';
import { Sparkles, Brain, CheckCircle2, AlertTriangle, ShieldCheck, BookOpen, Target, ArrowRight, Info } from 'lucide-react';
import styles from './assessment.module.css';

export interface QuestionItem {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  competency: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  validationTarget?: string;
  recommendedCourseKeyword?: string;
  gapImpact?: 'high' | 'medium' | 'low';
}

export default function AssessmentPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [quizSource, setQuizSource] = useState<string>('');
  const [llmCalled, setLlmCalled] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [assessmentSummary, setAssessmentSummary] = useState<any>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    let obData: any = {};
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('statpath_onboarding_data');
        if (stored) obData = JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    setOnboardingData(obData);

    // Fetch dynamic Groq LLM verification questions with course recommendation metadata
    async function loadQuiz() {
      try {
        setLoadingQuestions(true);
        const res = await fetch('/api/generate-adaptive-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: user?.name,
            dept: user?.dept,
            designation: user?.designation,
            education: obData?.education,
            experience: obData?.experience,
            completedCourses: obData?.completedCourses,
            careerGoal: obData?.careerGoal
          })
        });

        const data = await res.json();
        setLlmCalled(Boolean(data.llmCalled));
        setStatusMessage(data.statusMessage || '');

        if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
          setQuestions(data.questions);
          if (data.source === 'groq-qwen') {
            setQuizSource(`Groq LLM (${data.model || 'Qwen 2.5 32B'}) — Live Skill Verification`);
          } else if (data.source === 'groq-fallback') {
            setQuizSource(`Profile Verification Engine (LLM Fallback)`);
          } else {
            setQuizSource(`Profile Verification Engine (Fallback Mode)`);
          }
        }
      } catch (err) {
        console.error('Failed to load dynamic quiz:', err);
      } finally {
        setLoadingQuestions(false);
      }
    }

    loadQuiz();
  }, []);

  // Real-time countdown timer
  useEffect(() => {
    if (submitted || timeLeft <= 0 || loadingQuestions) return;

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
  }, [submitted, timeLeft, loadingQuestions]);

  const total = questions.length;
  const q = questions[current];

  const finishAssessment = () => {
    const topicDetails = questions.map((qItem, idx) => {
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
        status: !isAnswered ? 'Unanswered' : isCorrect ? 'Correct' : 'Incorrect',
        recommendedCourseKeyword: qItem.recommendedCourseKeyword || qItem.topic,
        gapImpact: qItem.gapImpact || 'medium'
      };
    });

    const correctCount = topicDetails.filter(t => t.isCorrect).length;
    const incorrectCount = topicDetails.filter(t => t.isAnswered && !t.isCorrect).length;
    const unansweredCount = topicDetails.filter(t => !t.isAnswered).length;
    const overallPercentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    const failedItems = topicDetails.filter(t => !t.isCorrect);
    const weakTopics = Array.from(new Set(failedItems.map(t => t.topic)));
    const strongTopics = Array.from(new Set(topicDetails.filter(t => t.isCorrect).map(t => t.topic)));

    const failedCompetencies = Array.from(new Set(failedItems.map(t => t.competency)));
    const recommendedCourseKeywords = Array.from(new Set(failedItems.map(t => t.recommendedCourseKeyword)));

    const recommendedSkillGaps = failedItems.map(item => ({
      competency: item.competency,
      topic: item.topic,
      recommendedCourseKeyword: item.recommendedCourseKeyword,
      gapImpact: item.gapImpact,
      reason: `Failed assessment question on "${item.topic}". Recommended course topic: ${item.recommendedCourseKeyword}.`
    }));

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
      strongTopics,
      failedCompetencies,
      recommendedCourseKeywords,
      recommendedSkillGaps,
      verifiedProfile: {
        education: onboardingData?.education,
        experience: onboardingData?.experience,
        claimedCourses: onboardingData?.completedCourses,
        targetRole: onboardingData?.careerGoal
      }
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

  // Loading state while AI generates custom assessment & course recommendation tags
  if (loadingQuestions) {
    return (
      <div className={styles.page}>
        <div style={{
          maxWidth: 640,
          margin: '60px auto',
          padding: '36px 28px',
          background: '#FFFFFF',
          borderRadius: 16,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
          textAlign: 'center',
          border: '1px solid #E2E8F0'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #003087 0%, #1E40AF 100%)',
            color: '#FFFFFF',
            marginBottom: 20,
            boxShadow: '0 8px 16px rgba(0, 48, 135, 0.25)'
          }}>
            <Brain size={36} className="animate-pulse" />
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
            Building Diagnostic Quiz for Course Recommendation Engine
          </h2>
          <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6, marginBottom: 24 }}>
            StatPath AI is processing your declared profile data to generate questions mapped to specific skill competencies...
          </p>

          <div style={{
            background: '#F8FAFC',
            borderRadius: 12,
            padding: '16px 20px',
            textAlign: 'left',
            marginBottom: 24,
            border: '1px solid #E2E8F0',
            fontSize: 13
          }}>
            <div style={{ fontWeight: 700, color: '#003087', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={16} /> Course Recommendation Mapping Targets:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', color: '#334155' }}>
              <div><strong>Qualification:</strong> {onboardingData?.education || 'Standard'}</div>
              <div><strong>Past Experience:</strong> {onboardingData?.experience || 'Standard'}</div>
              <div><strong>Claimed Skills:</strong> {onboardingData?.completedCourses || 'None specified'}</div>
              <div><strong>Target Career Role:</strong> {onboardingData?.careerGoal || 'Professional Role'}</div>
            </div>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: '#003087',
            fontWeight: 600,
            background: '#EFF6FF',
            padding: '8px 16px',
            borderRadius: 20
          }}>
            <Sparkles size={16} color="#FF9933" /> Mapping quiz responses directly to course recommendations...
          </div>
        </div>
      </div>
    );
  }

  // Diagnostic Results Screen after Quiz Completion
  if (submitted && assessmentSummary) return (
    <div className={styles.page}>
      <div className={styles.resultCard} style={{ maxWidth: 780 }}>
        <div className={styles.resultIcon}>{assessmentSummary.score >= 70 ? '🎉' : assessmentSummary.score >= 50 ? '📊' : '📖'}</div>
        <h2 className={styles.resultTitle}>Adaptive Baseline Assessment & Skill Diagnostics Complete</h2>
        <div className={styles.scoreCircle}>
          <span className={styles.scoreNum}>{assessmentSummary.score}%</span>
          <span className={styles.scoreLabel}>Baseline Score ({assessmentSummary.scoreFormatted})</span>
        </div>
        <p className={styles.resultDesc}>
          Your assessment performance has been calculated and analyzed by StatPath AI. Your answers have identified your exact skill gaps to feed your personalized course recommendation path.
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

        {/* Identified Skill Gaps for Course Recommendation Model */}
        {assessmentSummary.recommendedSkillGaps && assessmentSummary.recommendedSkillGaps.length > 0 && (
          <div style={{
            marginTop: 28,
            padding: '20px',
            background: '#F8FAFC',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>
              <Target size={20} color="#C8102E" /> Identified Skill Gaps for Course Recommendation:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {assessmentSummary.recommendedSkillGaps.map((gap: any, idx: number) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#FFFFFF',
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: '1px solid #E2E8F0'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1E293B' }}>{gap.competency}</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{gap.reason}</div>
                  </div>
                  <span className={`badge ${gap.gapImpact === 'high' ? 'badge-error' : 'badge-warning'}`}>
                    Recommended Topic: {gap.recommendedCourseKeyword}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="btn btn-primary btn-lg" onClick={() => router.push('/dashboard/learn')} style={{ width: '100%', marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <BookOpen size={20} /> View Recommended Courses for Identified Gaps →
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        
        {/* Explicit Status Notice Banner */}
        <div style={{
          background: llmCalled ? '#EEF2FF' : '#FFFBEB',
          border: llmCalled ? '1px solid #C7D2FE' : '1px solid #FCD34D',
          borderRadius: 10,
          padding: '12px 16px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 13,
          color: llmCalled ? '#3730A3' : '#92400E'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {llmCalled ? <Sparkles size={18} color="#4F46E5" /> : <AlertTriangle size={18} color="#D97706" />}
            <div>
              <strong>{llmCalled ? 'Live Groq LLM Mode Active' : 'Fallback Quiz Generator Active'}:</strong> {statusMessage}
            </div>
          </div>
          {!llmCalled && (
            <span style={{ fontSize: 11, background: '#FEF3C7', padding: '3px 8px', borderRadius: 4, fontWeight: 700, whiteSpace: 'nowrap' }}>
              Add GROQ_API_KEY in .env to call live LLM
            </span>
          )}
        </div>

        <div className={styles.header}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 className={styles.title} style={{ margin: 0 }}>Adaptive Baseline Assessment</h1>
              {quizSource && (
                <span style={{
                  background: '#EEF2FF',
                  color: '#4F46E5',
                  border: '1px solid #C7D2FE',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <Sparkles size={12} color="#FF9933" /> {quizSource}
                </span>
              )}
            </div>
            <p className={styles.subtitle}>
              Candidate: {currentUser?.name || 'Officer'} • Role: {currentUser?.designation || 'Professional Specialist'} • Goal: {onboardingData?.careerGoal || 'Career Advancement'}
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

        {q && (
          <div className={styles.qCard}>
            {q.validationTarget && (
              <div style={{
                background: '#FEF3C7',
                border: '1px solid #FCD34D',
                color: '#92400E',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 16,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}>
                🎯 {q.validationTarget}
              </div>
            )}
            <div className={styles.qMeta}>
              <span className="badge badge-primary">{q.competency}</span>
              <span className={`badge ${q.difficulty === 'easy' ? 'badge-success' : q.difficulty === 'medium' ? 'badge-warning' : 'badge-error'}`}>{q.difficulty}</span>
              <span className="badge badge-gray">{q.topic}</span>
              {q.recommendedCourseKeyword && (
                <span className="badge badge-info" style={{ marginLeft: 'auto', background: '#F1F5F9', color: '#475569' }}>
                  📚 Course Match Tag: {q.recommendedCourseKeyword}
                </span>
              )}
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
        )}

        <div className={styles.navRow}>
          <button className="btn btn-secondary" onClick={prev} disabled={current === 0}>← Previous</button>
          <div className={styles.qDots}>
            {questions.map((_, i) => (
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
