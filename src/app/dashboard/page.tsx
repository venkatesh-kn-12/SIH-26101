'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { COMPETENCY_SCORES, NOTIFICATIONS, DAILY_BYTE, CAREER_PATH, DEMO_USER } from '@/lib/mockData';
import { getCurrentUser, UserProfile } from '@/lib/authStorage';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import styles from './overview.module.css';

export default function DashboardPage() {
  const { t } = useLanguage();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [onboardingData, setOnboardingData] = useState<any>(null);

  useEffect(() => {
    setUser(getCurrentUser());
    if (typeof window !== 'undefined') {
      try {
        const storedAssessment = localStorage.getItem('statpath_assessment_results');
        if (storedAssessment) setAssessmentData(JSON.parse(storedAssessment));

        const storedOnboarding = localStorage.getItem('statpath_onboarding_data');
        if (storedOnboarding) setOnboardingData(JSON.parse(storedOnboarding));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const isDemo = !user || user.empId === DEMO_USER.employeeId;

  // Radar Data calculation based on assessment or demo
  const radarData = isDemo
    ? COMPETENCY_SCORES.slice(0, 6).map(c => ({ subject: c.name.split(' ')[0], current: (c.current / 5) * 100, required: (c.required / 5) * 100 }))
    : assessmentData?.topicDetails
      ? assessmentData.topicDetails.map((tItem: any) => ({
          subject: tItem.topic.split(' ')[0],
          current: tItem.isCorrect ? 100 : tItem.isAnswered ? 30 : 0,
          required: 80
        }))
      : [];

  const overallScoreFormatted = isDemo
    ? '3.4 / 5.0'
    : assessmentData
      ? assessmentData.scoreFormatted
      : 'Pending';

  return (
    <div className={styles.page}>
      {/* Welcome */}
      <div className={styles.welcome}>
        <div>
          <h1 className={styles.welcomeTitle}>WELCOME, {(user?.name || 'OFFICIAL').toUpperCase()} 👋</h1>
          <p className={styles.welcomeSub}>{user?.designation || 'Officer'} • {user?.dept || 'MoSPI Division'} • {user?.empId || 'MOS/OFFICIAL'}</p>
        </div>
        <div className={styles.welcomeMeta}>
          <span className="badge badge-success">● Active Officer</span>
          <span className={styles.lastLogin}>
            {assessmentData ? `Last Assessment: ${new Date(assessmentData.completedAt).toLocaleDateString('en-IN')}` : isDemo ? 'Last assessment: 3 days ago' : 'Assessment Pending'}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {[
          {
            label: t('competencyScore') || 'Overall Competency',
            value: overallScoreFormatted,
            sub: assessmentData ? `Score: ${assessmentData.score}%` : isDemo ? '+0.6 this quarter' : 'Requires Assessment',
            color: '#003087',
            icon: '📊'
          },
          {
            label: t('skillReadiness') || 'Career Target',
            value: onboardingData?.careerGoal || (isDemo ? `${CAREER_PATH.readiness}%` : 'Not Selected'),
            sub: onboardingData?.careerGoal ? 'Target Goal Set' : isDemo ? 'for Sr. Stat. Officer' : 'Configure in Intake',
            color: '#16a34a',
            icon: '🎯'
          },
          {
            label: t('learningProgress') || 'Courses In Progress',
            value: isDemo ? '2' : (onboardingData?.completedCourses ? '1' : '0'),
            sub: isDemo ? '1 AI Guided, 1 iGOT' : 'From iGOT Path',
            color: '#7c3aed',
            icon: '📚'
          },
          {
            label: t('learningTime') || 'Learning Streak',
            value: isDemo ? '12 days' : (assessmentData ? '1 day' : '0 days'),
            sub: isDemo ? '47 min avg daily' : 'Active Session',
            color: '#FF6B00',
            icon: '🔥'
          },
        ].map(k => (
          <div key={k.label} className={`card ${styles.kpiCard}`}>
            <div className={styles.kpiIcon} style={{ background: `${k.color}18`, color: k.color }}>{k.icon}</div>
            <div>
              <div className={styles.kpiVal} style={{ color: k.color, fontSize: typeof k.value === 'string' && k.value.length > 15 ? 15 : undefined }}>{k.value}</div>
              <div className={styles.kpiLabel}>{k.label}</div>
              <div className={styles.kpiSub}>{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Assessment Diagnostics & AI Skill Recommendation Section */}
      {assessmentData && (
        <div className="card" style={{ marginBottom: 24, borderLeft: '4px solid var(--ux4g-gov-navy)', background: '#F8FAFC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                📋 Assessment Diagnostics & Section Accuracy
              </h3>
              <p style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                Evaluated from your baseline assessment ({assessmentData.correctCount} / {assessmentData.totalQuestions} correct)
              </p>
            </div>
            <span className="badge badge-primary" style={{ fontSize: 12 }}>
              Score: {assessmentData.score}% ({assessmentData.scoreFormatted})
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            {assessmentData.topicDetails?.map((tItem: any) => (
              <div key={tItem.id} style={{
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: tItem.isCorrect ? '#DCFCE7' : tItem.isAnswered ? '#FEE2E2' : '#FEF3C7',
                color: tItem.isCorrect ? '#15803D' : tItem.isAnswered ? '#991B1B' : '#92400E',
                border: `1px solid ${tItem.isCorrect ? '#86EFAC' : tItem.isAnswered ? '#FCA5A5' : '#FDE68A'}`
              }}>
                <span>{tItem.isCorrect ? '✓' : tItem.isAnswered ? '✕' : '⚠️'}</span>
                <span>{tItem.topic}: <strong>{tItem.status}</strong></span>
              </div>
            ))}
          </div>

          {assessmentData.weakTopics?.length > 0 && (
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '10px 14px', borderRadius: 6, fontSize: 13, color: '#1E40AF' }}>
              🤖 <strong>AI Learning Path Recommendation:</strong> Based on your response section data, immediate focus is recommended on <strong>{assessmentData.weakTopics.join(', ')}</strong> modules on iGOT Karmayogi.
            </div>
          )}
        </div>
      )}

      {/* Main Content Grid */}
      <div className={styles.mainGrid}>
        {/* Left Column */}
        <div className={styles.leftCol}>
          {/* Competency Radar */}
          <div className={`card ${styles.section}`}>
            <div className="section-header">
              <div>
                <div className="section-title">Competency Overview</div>
                <div className="section-subtitle">
                  {assessmentData ? 'Verified from baseline assessment' : isDemo ? 'Current vs. Required for your role' : 'Pending Baseline Assessment'}
                </div>
              </div>
              <Link href="/dashboard/competency" className="btn btn-secondary btn-sm">Full Map →</Link>
            </div>
            
            {radarData.length > 0 ? (
              <>
                <div style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Radar name="Required" dataKey="required" stroke="#e2e8f0" fill="#f1f5f9" fillOpacity={0.8} />
                      <Radar name="Current" dataKey="current" stroke="#003087" fill="#003087" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className={styles.radarLegend}>
                  <span className={styles.legendDot} style={{ background: '#003087' }} />Current Accuracy
                  <span className={styles.legendDot} style={{ background: '#e2e8f0', marginLeft: 16 }} />Required Target
                </div>
              </>
            ) : (
              <div style={{ padding: '30px 20px', textAlign: 'center', background: '#F8FAFC', borderRadius: 8, border: '1px dashed #CBD5E1' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📝</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>Baseline Assessment Pending</div>
                <p style={{ fontSize: 13, color: '#64748B', marginTop: 4, marginBottom: 16 }}>
                  Take your 15-minute adaptive baseline assessment to calculate your baseline competency map.
                </p>
                <Link href="/onboarding/assessment" className="btn btn-primary btn-sm">
                  Start Adaptive Assessment →
                </Link>
              </div>
            )}
          </div>

          {/* Recommended Learning Path Callout */}
          <div className={`card ${styles.section}`}>
            <div className="section-header">
              <div>
                <div className="section-title">Sequential iGOT Learning Pathway</div>
                <div className="section-subtitle">Mapped to official designation and assessed gaps</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#475569', marginBottom: 14 }}>
              StatPath AI sequences official iGOT Karmayogi courses to systematically elevate your competency scores.
            </p>
            <Link href="/dashboard/learn" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
              Access iGOT Learning Path →
            </Link>
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.rightCol}>
          {/* Daily Byte */}
          <div className={`card ${styles.section} ${styles.dailyByte}`}>
            <div className={styles.byteHeader}>
              <span>⚡ Today's Skill Byte</span>
              <span className={styles.byteDate}>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            </div>
            <div className={styles.byteConcept}>{DAILY_BYTE.concept}</div>
            <p className={styles.byteExp}>{DAILY_BYTE.shortExplanation}</p>
            <Link href="/dashboard/daily" className="btn btn-accent btn-sm" style={{ marginTop: 12 }}>
              Start Today's Micro-Learning →
            </Link>
          </div>

          {/* Active Courses / Training Intake */}
          <div className={`card ${styles.section}`}>
            <div className="section-header">
              <div className="section-title">Training Intake & Activity</div>
              <Link href="/dashboard/learn" className="btn btn-secondary btn-sm">All Courses</Link>
            </div>
            {onboardingData?.completedCourses ? (
              <div className={styles.progressCourse}>
                <div className={styles.pcHeader}>
                  <span className={styles.pcName}>{onboardingData.completedCourses}</span>
                  <span className="badge badge-success">Completed</span>
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Self-Reported Online Course</div>
              </div>
            ) : isDemo ? (
              [
                { name: 'Statistical Literacy', progress: 68, mode: 'AI Guided' },
                { name: 'Design Thinking', progress: 32, mode: 'iGOT Direct' },
              ].map(p => (
                <div key={p.name} className={styles.progressCourse}>
                  <div className={styles.pcHeader}>
                    <span className={styles.pcName}>{p.name}</span>
                    <span className={`badge ${p.mode === 'AI Guided' ? 'badge-primary' : 'badge-gray'}`}>{p.mode}</span>
                  </div>
                  <div className="progress-bar" style={{ marginTop: 8 }}>
                    <div className="progress-fill" style={{ width: `${p.progress}%` }} />
                  </div>
                  <div className={styles.pcPct}>{p.progress}% complete</div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: 13, color: '#64748B', fontStyle: 'italic', padding: '10px 0' }}>
                No active courses in progress. Explore your personalized <Link href="/dashboard/learn" style={{ color: '#003087', fontWeight: 600 }}>Learning Path</Link>.
              </div>
            )}
          </div>

          {/* Career Path Target */}
          <div className={`card ${styles.section} ${styles.careerCard}`}>
            <div className={styles.careerHeader}>
              <span className={styles.careerTitle}>Career Target Role</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#003087', margin: '8px 0' }}>
              {onboardingData?.careerGoal || (isDemo ? CAREER_PATH.target : 'Not Configured')}
            </div>
            <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 12px 0' }}>
              Simulate career readiness and competency requirements for target roles.
            </p>
            <Link href="/dashboard/career" className="btn btn-secondary btn-sm" style={{ width: '100%', textAlign: 'center' }}>
              Explore Career Simulator →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
