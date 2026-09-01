'use client';
import { useState, useEffect } from 'react';
import { getCurrentUser, UserProfile } from '@/lib/authStorage';
import { Zap, Sparkles, BookOpen, CheckCircle2, AlertTriangle, RefreshCw, Flame, Clock, Award, Target, ChevronRight, ArrowRight, ShieldCheck, Check, HelpCircle } from 'lucide-react';
import styles from './daily.module.css';

export default function DailyPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [dailyByte, setDailyByte] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [phase, setPhase] = useState<'intro' | 'learn' | 'quiz' | 'done'>('intro');
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    let obData: any = {};
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('statpath_onboarding_data');
        if (stored) obData = JSON.parse(stored);
        setOnboardingData(obData);
      } catch (e) {
        console.error(e);
      }
    }

    async function loadDomainDailyByte() {
      try {
        setLoading(true);
        const res = await fetch('/api/generate-daily-byte', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: currentUser?.name || 'Officer',
            careerGoal: obData.careerGoal || currentUser?.designation || 'Data Scientist',
            completedCourses: obData.completedCourses || 'Domain Fundamentals',
            education: obData.education,
            experience: obData.experience,
            dept: currentUser?.dept
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.byte) setDailyByte(data.byte);
        }
      } catch (err) {
        console.error('Failed to load daily byte:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDomainDailyByte();
  }, []);

  const targetRole = onboardingData?.careerGoal || user?.designation || 'Professional Role';
  
  const quizQuestions: any[] = dailyByte?.quizQuestions || [
    {
      id: 'q1',
      questionText: dailyByte?.scenario || 'In practical domain execution, which methodology ensures quality control and minimizes risk?',
      options: dailyByte?.options || ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: dailyByte?.correctIndex ?? 1,
      explanation: dailyByte?.explanation || 'Structured standards and baseline validation are essential for domain quality.'
    }
  ];

  const totalQuestions = quizQuestions.length;
  const currentQ = quizQuestions[quizIndex];

  const selectOption = (optIdx: number) => {
    if (submitted) return;
    setQuizAnswers(prev => ({ ...prev, [quizIndex]: optIdx }));
  };

  const nextQuizQuestion = () => {
    if (quizIndex < totalQuestions - 1) {
      setQuizIndex(prev => prev + 1);
    }
  };

  const prevQuizQuestion = () => {
    if (quizIndex > 0) {
      setQuizIndex(prev => prev - 1);
    }
  };

  const submitDailyQuiz = () => {
    setSubmitted(true);

    // Calculate score
    let correctCount = 0;
    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const scorePct = Math.round((correctCount / totalQuestions) * 100);

    // Record evidence in localStorage for Competency Evidence Log
    if (typeof window !== 'undefined') {
      const todayKey = `statpath_daily_${new Date().toISOString().slice(0, 10)}`;
      localStorage.setItem(todayKey, JSON.stringify({ completed: true, score: scorePct, correctCount, totalQuestions }));

      // Add to assessment evidence history
      try {
        const storedHistory = localStorage.getItem('statpath_assessment_history');
        const historyList = storedHistory ? JSON.parse(storedHistory) : [];
        historyList.unshift({
          id: `daily-${Date.now()}`,
          title: `Daily Learning Quiz: ${dailyByte?.concept || 'Domain Byte'}`,
          category: 'Daily Micro-Learning',
          competency: dailyByte?.competency || 'Applied Practice',
          score: scorePct,
          correctCount,
          totalQuestions,
          completedAt: new Date().toISOString(),
          evidenceType: 'course_quiz'
        });
        localStorage.setItem('statpath_assessment_history', JSON.stringify(historyList));
      } catch (e) {
        console.error(e);
      }
    }

    setPhase('done');
  };

  if (loading) {
    return (
      <div style={{
        padding: '72px 24px',
        textAlign: 'center',
        background: '#FFFFFF',
        borderRadius: 24,
        border: '1px solid #E2E8F0',
        maxWidth: 680,
        margin: '40px auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.06)'
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          boxShadow: '0 8px 20px rgba(30, 58, 138, 0.3)'
        }}>
          <RefreshCw size={36} className="animate-spin" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
          Generating Domain Daily Micro-Byte...
        </h2>
        <p style={{ fontSize: 14, color: '#64748B' }}>
          SkillPath AI is crafting a 7-minute learning unit for <strong>"{targetRole}"</strong>...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 60%, #003087 100%)',
        borderRadius: 20,
        padding: '24px 28px',
        marginBottom: 24,
        color: '#FFFFFF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#60A5FA',
              fontSize: 11,
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: 20,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}>
              <Zap size={13} color="#FF9933" /> TODAY'S DAILY BYTE
            </span>
            <span style={{ fontSize: 12, color: '#93C5FD', fontWeight: 600 }}>
              Domain: {dailyByte?.competency || targetRole}
            </span>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
            {dailyByte?.concept}
          </h1>
          <p style={{ fontSize: 13, color: '#CBD5E1', margin: 0 }}>
            5–10 minute high-impact unit tailored to your role target <strong>({targetRole})</strong>.
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 6
        }}>
          <div style={{
            background: 'rgba(254, 243, 199, 0.95)',
            border: '1px solid #FDE68A',
            color: '#92400E',
            padding: '8px 16px',
            borderRadius: 24,
            fontSize: 13,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.2)'
          }}>
            <Flame size={18} color="#D97706" /> 12-Day Streak
          </div>
          <div style={{ fontSize: 12, color: '#93C5FD', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={13} /> 7 Mins Completion
          </div>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.mainCol}>
          
          {/* PHASE 1: INTRO CARD */}
          {phase === 'intro' && (
            <div className="card" style={{
              padding: 32,
              borderRadius: 20,
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span className="badge badge-primary" style={{ fontSize: 12, padding: '4px 12px' }}>
                  🎯 Competency: {dailyByte?.competency}
                </span>
                <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>3 Scenario Questions Included</span>
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 12, lineHeight: 1.3 }}>
                {dailyByte?.concept}
              </h2>

              <p style={{ fontSize: 15, color: '#334155', lineHeight: 1.7, marginBottom: 24 }}>
                {dailyByte?.shortExplanation}
              </p>

              {/* 5 Step Progress Icons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 8,
                background: '#F8FAFC',
                padding: 16,
                borderRadius: 14,
                border: '1px solid #E2E8F0',
                marginBottom: 28,
                textAlign: 'center'
              }}>
                {[
                  { step: '1', name: 'Read Concept', icon: '📖' },
                  { step: '2', name: 'Real Case', icon: '📋' },
                  { step: '3', name: 'Visual Flow', icon: '🗺️' },
                  { step: '4', name: '3-Q Quiz', icon: '✍️' },
                  { step: '5', name: 'Mastery', icon: '🎉' }
                ].map(s => (
                  <div key={s.step} style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                    <div>{s.name}</div>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-primary btn-lg"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  fontSize: 16,
                  fontWeight: 800,
                  padding: '14px 24px',
                  borderRadius: 12
                }}
                onClick={() => setPhase('learn')}
              >
                Start Today's Micro-Learning <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* PHASE 2: LEARN CONTENT & SCENARIO */}
          {phase === 'learn' && (
            <div className="card" style={{
              padding: 32,
              borderRadius: 20,
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#003087', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Step 2 of 5 — Real-World Application
                </span>
                <div style={{ width: 140 }}>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '40%' }} />
                  </div>
                </div>
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>
                {dailyByte?.concept}
              </h2>

              <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.7, marginBottom: 20 }}>
                {dailyByte?.shortExplanation}
              </p>

              {/* Real-World Case Box */}
              <div style={{
                background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
                borderLeft: '5px solid #003087',
                borderRadius: 12,
                padding: '20px 24px',
                marginBottom: 20,
                border: '1px solid #E2E8F0',
                borderLeftWidth: 5
              }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#003087', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  📋 {dailyByte?.exampleTitle || 'Real-World Case Scenario'}
                </div>
                <p style={{ fontSize: 14, color: '#1E293B', margin: 0, lineHeight: 1.6 }}>
                  {dailyByte?.exampleText}
                </p>
              </div>

              {/* Visual Execution Diagram */}
              {dailyByte?.diagramSteps && Array.isArray(dailyByte.diagramSteps) && (
                <div style={{
                  background: '#F1F5F9',
                  padding: 20,
                  borderRadius: 14,
                  marginBottom: 24,
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#0F172A', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    🗺️ Visual Execution Diagram
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {dailyByte.diagramSteps.map((stepText: string, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#1E293B', background: '#FFFFFF', padding: '10px 14px', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                        <span style={{ background: '#003087', color: '#FFFFFF', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                          {i + 1}
                        </span>
                        <span style={{ fontWeight: 600 }}>{stepText}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12 }}
                onClick={() => setPhase('quiz')}
              >
                Continue to 3-Question Scenario Quiz <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* PHASE 3: MULTI-QUESTION SCENARIO QUIZ (NO ANSWERS REVEALED BEFORE SUBMISSION) */}
          {phase === 'quiz' && currentQ && (
            <div className="card" style={{
              padding: 32,
              borderRadius: 20,
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#003087', textTransform: 'uppercase' }}>
                  Question {quizIndex + 1} of {totalQuestions}
                </span>
                <div style={{ width: 140 }}>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${((quizIndex + 1) / totalQuestions) * 100}%` }} />
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', marginBottom: 20, lineHeight: 1.5 }}>
                {currentQ.questionText}
              </h3>

              {/* Quiz Choices (NO ANSWER EXPLANATION / HINTS SHOWN BEFORE SUBMISSION!) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {currentQ.options.map((opt: string, i: number) => {
                  const isSelected = quizAnswers[quizIndex] === i;

                  return (
                    <button
                      key={i}
                      onClick={() => selectOption(i)}
                      style={{
                        background: isSelected ? '#EFF6FF' : '#FFFFFF',
                        border: `2px solid ${isSelected ? '#003087' : '#E2E8F0'}`,
                        borderRadius: 12,
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        color: isSelected ? '#003087' : '#1E293B',
                        fontSize: 14,
                        fontWeight: isSelected ? 700 : 500,
                        textAlign: 'left'
                      }}
                    >
                      <span style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: isSelected ? '#003087' : '#F1F5F9',
                        color: isSelected ? '#FFFFFF' : '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 13,
                        flexShrink: 0
                      }}>
                        {String.fromCharCode(65 + i)}
                      </span>

                      <span style={{ flex: 1, lineHeight: 1.4 }}>{opt}</span>

                      {isSelected && <Check size={18} color="#003087" />}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  className="btn btn-secondary"
                  onClick={prevQuizQuestion}
                  disabled={quizIndex === 0}
                >
                  ← Previous
                </button>

                {quizIndex < totalQuestions - 1 ? (
                  <button
                    className="btn btn-primary"
                    onClick={nextQuizQuestion}
                    disabled={quizAnswers[quizIndex] === undefined}
                  >
                    Next Question →
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    style={{ background: '#166534', borderColor: '#166534' }}
                    onClick={submitDailyQuiz}
                    disabled={quizAnswers[quizIndex] === undefined}
                  >
                    Submit Daily Quiz ✓
                  </button>
                )}
              </div>
            </div>
          )}

          {/* PHASE 4: MASTERY SUMMARY & FULL REVIEW BREAKDOWN */}
          {phase === 'done' && (
            <div className="card" style={{
              padding: 32,
              borderRadius: 24,
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              boxShadow: '0 12px 32px rgba(0,0,0,0.06)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 56, marginBottom: 8 }}>
                  {Object.keys(quizAnswers).filter(i => quizQuestions[+i]?.correctIndex === quizAnswers[+i]).length === totalQuestions ? '🎉' : '📖'}
                </div>
                
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                  Daily Quiz Completed!
                </h2>

                <div style={{ fontSize: 15, color: '#64748B' }}>
                  Score: <strong style={{ color: '#003087', fontSize: 18 }}>
                    {Object.keys(quizAnswers).filter(i => quizQuestions[+i]?.correctIndex === quizAnswers[+i]).length} / {totalQuestions} Correct
                  </strong>
                </div>
              </div>

              {/* Question Review Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                {quizQuestions.map((q, idx) => {
                  const userAns = quizAnswers[idx];
                  const isRight = userAns === q.correctIndex;

                  return (
                    <div key={q.id || idx} style={{
                      background: '#F8FAFC',
                      border: `1px solid ${isRight ? '#86EFAC' : '#FCA5A5'}`,
                      borderRadius: 12,
                      padding: 18
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
                          Question {idx + 1}
                        </span>
                        <span className={`badge ${isRight ? 'badge-success' : 'badge-error'}`}>
                          {isRight ? '✓ Correct' : '❌ Incorrect'}
                        </span>
                      </div>

                      <p style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 8 }}>
                        {q.questionText}
                      </p>

                      <div style={{ fontSize: 13, color: '#475569', marginBottom: 6 }}>
                        Your Answer: <strong>{q.options[userAns] || 'Not Answered'}</strong>
                      </div>
                      {!isRight && (
                        <div style={{ fontSize: 13, color: '#166534', fontWeight: 600, marginBottom: 6 }}>
                          Correct Answer: {q.options[q.correctIndex]}
                        </div>
                      )}

                      <div style={{ fontSize: 12, color: '#64748B', fontStyle: 'italic', background: '#FFFFFF', padding: '8px 12px', borderRadius: 6, border: '1px solid #E2E8F0', marginTop: 8 }}>
                        💡 <strong>Explanation:</strong> {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', borderRadius: 12, fontWeight: 800 }}
                onClick={() => { setPhase('intro'); setQuizIndex(0); setQuizAnswers({}); setSubmitted(false); }}
              >
                Return to Daily Byte Home
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar: Knowledge Retention Spaced Repetition */}
        <div className={styles.sideCol}>
          <div className="card" style={{ padding: 20, borderRadius: 16, border: '1px solid #E2E8F0', background: '#FFFFFF', marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              🔁 Spaced Revision Engine
            </div>
            <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 14px 0' }}>
              Concepts due for domain revision
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {dailyByte?.retentionItems && Array.isArray(dailyByte.retentionItems) && dailyByte.retentionItems.map((item: any, idx: number) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: '#F8FAFC',
                  borderRadius: 10,
                  border: '1px solid #E2E8F0'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1E293B' }}>{item.concept}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>Learned {item.learnedDays}d ago</div>
                  </div>
                  <span className={`badge ${item.status === 'due' ? 'badge-warning' : 'badge-success'}`}>
                    {item.status === 'due' ? '🔁 Due' : '✓ Met'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 20, borderRadius: 16, border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>
              📅 Weekly Streak Tracker
            </div>
            <div className={styles.weekGrid}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={day} className={`${styles.weekDay} ${i < 5 ? styles.weekDone : i === 5 ? styles.weekToday : styles.weekFuture}`}>
                  <div className={styles.weekDot}>{i < 5 ? '✓' : i === 5 ? '▶' : ''}</div>
                  <div>{day}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 12, fontWeight: 700, color: '#D97706', textAlign: 'center' }}>
              🔥 12-day streak • Keep up your domain mastery!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
