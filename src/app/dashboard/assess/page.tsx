'use client';
import { useState, useEffect } from 'react';
import { getCurrentUser, UserProfile } from '@/lib/authStorage';
import { Sparkles, FileText, CheckCircle2, ShieldCheck, Clock, Award, Target, ArrowRight, Brain, AlertTriangle, RefreshCw, HelpCircle, Check, BookOpen, Layers } from 'lucide-react';
import styles from './assess.module.css';

export default function AssessPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [activeAssessment, setActiveAssessment] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [assessmentHistory, setAssessmentHistory] = useState<any[]>([]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    let obData: any = {};
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('statpath_onboarding_data');
        if (stored) obData = JSON.parse(stored);
        setOnboardingData(obData);

        const storedHistory = localStorage.getItem('statpath_assessment_history');
        if (storedHistory) setAssessmentHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const targetRole = onboardingData?.careerGoal || user?.designation || 'Data Scientist';
  const claimedSkills = onboardingData?.completedCourses || 'Domain Fundamentals';
  const primarySkill = claimedSkills.split(',')[0]?.trim() || 'Technical Domain';

  // DYNAMICALLY GENERATED ASSESSMENTS BASED ON 4 PERSONALIZATION CRITERIA
  const availableAssessments = [
    {
      id: 'domain-role-final',
      title: `${targetRole} — Role Competency Benchmark Assessment`,
      type: 'Final Role Benchmark',
      priority: 'High Priority',
      basis: `Target Role Gap Analysis for "${targetRole}"`,
      basisIcon: '🎯',
      questionsCount: 5,
      duration: '20 min',
      difficulty: 'Intermediate',
      due: 'Recommended',
      status: 'due',
      topic: targetRole
    },
    {
      id: 'domain-sec-1',
      title: `${primarySkill} Execution — Skill Verification Test`,
      type: 'Claimed Skill Verification',
      priority: 'Verification Test',
      basis: `Technical Verification for Claimed Skill "${primarySkill}"`,
      basisIcon: '🎓',
      questionsCount: 5,
      duration: '15 min',
      difficulty: 'Intermediate',
      due: 'Available Now',
      status: 'due',
      topic: primarySkill
    },
    {
      id: 'domain-periodic',
      title: 'Quarterly Domain Competency Review & Spaced Evaluation',
      type: 'Periodic Evaluation',
      priority: 'Spaced Review',
      basis: `Spaced Retention Schedule for ${onboardingData?.experience || 'Professional Background'}`,
      basisIcon: '🔁',
      questionsCount: 5,
      duration: '15 min',
      difficulty: 'Advanced',
      due: 'Due in 5 days',
      status: 'upcoming',
      topic: 'Strategic Governance & Best Practices'
    }
  ];

  const startAssessment = async (assessItem: any) => {
    setActiveAssessment(assessItem);
    setAnswers({});
    setCurrent(0);
    setSubmitted(false);
    setLoadingQuestions(true);

    try {
      // Fetch domain-specific adaptive questions via Groq LLM
      const res = await fetch('/api/generate-adaptive-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user?.name,
          dept: user?.dept,
          designation: user?.designation,
          education: onboardingData?.education,
          experience: onboardingData?.experience,
          completedCourses: assessItem.topic || claimedSkills,
          careerGoal: targetRole
        })
      });

      const data = await res.json();
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error('Failed to load assessment questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const finishAssessment = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) correctCount += 1;
    });

    const total = questions.length || 1;
    const scorePct = Math.round((correctCount / total) * 100);

    const completedRecord = {
      id: `${activeAssessment?.id}-${Date.now()}`,
      title: activeAssessment?.title || 'Domain Assessment',
      category: activeAssessment?.type || 'Section',
      competency: activeAssessment?.topic || 'Domain Skill',
      score: scorePct,
      correctCount,
      totalQuestions: total,
      completedAt: new Date().toISOString(),
      evidenceType: 'assessment'
    };

    // Store in localStorage for Competency Evidence Log & Profile update
    if (typeof window !== 'undefined') {
      const updatedHistory = [completedRecord, ...assessmentHistory];
      setAssessmentHistory(updatedHistory);
      localStorage.setItem('statpath_assessment_history', JSON.stringify(updatedHistory));

      // Update primary assessment results summary
      const summary = {
        score: scorePct,
        scoreFormatted: `${(scorePct / 20).toFixed(1)} / 5.0`,
        totalQuestions: total,
        correctCount,
        incorrectCount: total - correctCount,
        completedAt: new Date().toISOString(),
        strongTopics: questions.filter((q, idx) => answers[idx] === q.correctIndex).map(q => q.topic || q.competency),
        weakTopics: questions.filter((q, idx) => answers[idx] !== q.correctIndex).map(q => q.topic || q.competency)
      };
      localStorage.setItem('statpath_assessment_results', JSON.stringify(summary));
    }

    setSubmitted(true);
  };

  const q = questions[current];

  // ACTIVE ASSESSMENT INTERACTION VIEW
  if (activeAssessment) return (
    <div className={styles.assessmentView}>
      <div style={{
        background: '#FFFFFF',
        padding: '18px 24px',
        borderRadius: 16,
        border: '1px solid #E2E8F0',
        marginBottom: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
      }}>
        <button className="btn btn-secondary btn-sm" onClick={() => { setActiveAssessment(null); setAnswers({}); setCurrent(0); setSubmitted(false); }}>
          ← Exit Assessment
        </button>
        <div style={{ fontWeight: 800, fontSize: 16, color: '#0F172A' }}>{activeAssessment.title}</div>
        <div style={{ fontWeight: 700, color: '#003087', fontSize: 14 }}>Question {current + 1} of {questions.length}</div>
      </div>

      {loadingQuestions ? (
        <div style={{ padding: '72px 24px', textAlign: 'center', background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0' }}>
          <RefreshCw size={36} color="#003087" className="animate-spin" style={{ margin: '0 auto 16px auto' }} />
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
            Generating Domain Questions for "{activeAssessment.topic}"...
          </div>
          <p style={{ fontSize: 13, color: '#64748B' }}>StatPath AI is invoking Groq LLM for adaptive question generation...</p>
        </div>
      ) : !submitted && q ? (
        <div className="card" style={{ padding: 32, borderRadius: 20, border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <span className="badge badge-primary">{q.competency || activeAssessment.topic}</span>
            <span className={`badge ${q.difficulty === 'easy' ? 'badge-success' : q.difficulty === 'medium' ? 'badge-warning' : 'badge-error'}`}>
              {q.difficulty || activeAssessment.difficulty}
            </span>
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 20, lineHeight: 1.5 }}>
            {q.text}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {q.options.map((opt: string, i: number) => {
              const isSelected = answers[current] === i;
              return (
                <button
                  key={i}
                  onClick={() => setAnswers({ ...answers, [current]: i })}
                  style={{
                    background: isSelected ? '#EFF6FF' : '#FFFFFF',
                    border: `2px solid ${isSelected ? '#003087' : '#E2E8F0'}`,
                    borderRadius: 12,
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    cursor: 'pointer',
                    color: isSelected ? '#003087' : '#1E293B',
                    fontWeight: isSelected ? 700 : 500,
                    textAlign: 'left',
                    fontSize: 14
                  }}
                >
                  <span style={{
                    width: 30,
                    height: 30,
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
                  <span style={{ flex: 1 }}>{opt}</span>
                  {isSelected && <Check size={18} color="#003087" />}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn btn-secondary" onClick={() => setCurrent(c => c - 1)} disabled={current === 0}>← Previous</button>
            {current < questions.length - 1 ? (
              <button className="btn btn-primary" onClick={() => setCurrent(c => c + 1)} disabled={answers[current] === undefined}>
                Next Question →
              </button>
            ) : (
              <button className="btn btn-primary" style={{ background: '#166534', borderColor: '#166534' }} onClick={finishAssessment} disabled={answers[current] === undefined}>
                Submit Assessment Test ✓
              </button>
            )}
          </div>
        </div>
      ) : submitted ? (
        <div className="card" style={{ padding: 40, borderRadius: 24, border: '1px solid #E2E8F0', background: '#FFFFFF', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Domain Assessment Complete!</h2>
          <p style={{ color: '#64748B', fontSize: 14, marginBottom: 24 }}>
            Your test results have been recorded in your <strong>Knowledge Evidence Log</strong> and updated your competency score.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => { setActiveAssessment(null); setSubmitted(false); setAnswers({}); setCurrent(0); }}>
            Back to Assessments Catalog →
          </button>
        </div>
      ) : null}
    </div>
  );

  return (
    <div>
      {/* HEADER BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 60%, #003087 100%)',
        borderRadius: 20,
        padding: '24px 28px',
        marginBottom: 24,
        color: '#FFFFFF',
        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{
            background: 'rgba(255, 255, 255, 0.15)',
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
            <Sparkles size={13} color="#FF9933" /> PERSONALIZED ASSESSMENT ENGINE
          </span>
          <span style={{ fontSize: 12, color: '#93C5FD', fontWeight: 600 }}>
            Target Goal: {targetRole}
          </span>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px 0', color: '#FFFFFF' }}>
          Domain Competency Assessments
        </h1>
        <p style={{ fontSize: 13, color: '#CBD5E1', margin: 0, lineHeight: 1.5 }}>
          Targeted competency assessments generated dynamically based on your background, claimed skills, and target career goal.
        </p>
      </div>

      {/* HOW ASSESSMENTS ARE RECOMMENDED (TRANSPARENT CRITERIA BREAKDOWN) */}
      <div style={{
        background: '#FFFBEB',
        border: '1px solid #FCD34D',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        boxShadow: '0 4px 12px rgba(217, 119, 6, 0.05)'
      }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: '#92400E', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <HelpCircle size={18} color="#D97706" /> How Your Assessments Are Personalized & Recommended:
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <div style={{ background: '#FFFFFF', padding: 12, borderRadius: 10, border: '1px solid #FDE68A' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#78350F', marginBottom: 2 }}>
              🎯 1. Target Role Skill Gaps
            </div>
            <div style={{ fontSize: 11, color: '#92400E' }}>
              Identifies unverified competencies needed to qualify for <strong>"{targetRole}"</strong>.
            </div>
          </div>

          <div style={{ background: '#FFFFFF', padding: 12, borderRadius: 10, border: '1px solid #FDE68A' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#78350F', marginBottom: 2 }}>
              🎓 2. Claimed Skill Verification
            </div>
            <div style={{ fontSize: 11, color: '#92400E' }}>
              Technical section tests validating your claimed skills (<strong>"{claimedSkills}"</strong>).
            </div>
          </div>

          <div style={{ background: '#FFFFFF', padding: 12, borderRadius: 10, border: '1px solid #FDE68A' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#78350F', marginBottom: 2 }}>
              🩺 3. Diagnostic Intake Weak Topics
            </div>
            <div style={{ fontSize: 11, color: '#92400E' }}>
              Focuses on weak topics identified during initial baseline intake diagnostic.
            </div>
          </div>

          <div style={{ background: '#FFFFFF', padding: 12, borderRadius: 10, border: '1px solid #FDE68A' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#78350F', marginBottom: 2 }}>
              🔁 4. Spaced Retention Evaluation
            </div>
            <div style={{ fontSize: 11, color: '#92400E' }}>
              Periodic review tests scheduled over time to guarantee long-term retention.
            </div>
          </div>
        </div>
      </div>

      {/* AVAILABLE RECOMMENDED ASSESSMENTS LIST */}
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 14 }}>
        Recommended Assessments For You ({availableAssessments.length})
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
        {availableAssessments.map(a => (
          <div key={a.id} className="card" style={{
            padding: 24,
            borderRadius: 16,
            border: '1px solid #E2E8F0',
            background: '#FFFFFF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <span className="badge badge-primary" style={{ fontSize: 11 }}>{a.type}</span>
                <span className="badge badge-warning" style={{ fontSize: 11 }}>{a.difficulty}</span>
                <span style={{ fontSize: 11, color: '#003087', fontWeight: 700, background: '#EFF6FF', padding: '2px 8px', borderRadius: 8 }}>
                  Topic: {a.topic}
                </span>
              </div>

              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                {a.title}
              </h3>

              <div style={{ fontSize: 12, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{a.basisIcon} <strong>Basis:</strong> {a.basis}</span>
                <span>•</span>
                <span>{a.questionsCount} Questions ({a.duration})</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className={`badge ${a.status === 'due' ? 'badge-error' : 'badge-warning'}`}>{a.due}</span>
              <button
                className="btn btn-primary"
                onClick={() => startAssessment(a)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, fontWeight: 700 }}
              >
                Start Domain Test <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* RECENTLY COMPLETED ASSESSMENT HISTORY */}
      {assessmentHistory.length > 0 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={20} color="#15803D" /> Completed Assessment History ({assessmentHistory.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {assessmentHistory.map((item, idx) => (
              <div key={item.id || idx} style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 14,
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12
              }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                    Competency: <strong>{item.competency}</strong> • Completed {new Date(item.completedAt).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 17, fontWeight: 900, color: item.score >= 70 ? '#15803D' : '#B45309' }}>
                      {item.score}% Score
                    </div>
                    <div style={{ fontSize: 11, color: '#166534', fontWeight: 600 }}>
                      ✓ Recorded in Evidence Log
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
