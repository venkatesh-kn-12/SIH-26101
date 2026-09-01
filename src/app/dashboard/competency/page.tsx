'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getCurrentUser, UserProfile } from '@/lib/authStorage';
import { analyzeSkillGap } from '@/lib/skillGapService';
import { buildUserLearningProfile, UserLearningProfile } from '@/lib/competencyService';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ShieldCheck, Target, Award, Sparkles, BookOpen, CheckCircle, AlertTriangle, ArrowRight, Brain, Zap, History, Clock } from 'lucide-react';
import styles from './competency.module.css';

const GAP_COLOR = {
  mastered: '#22c55e',
  developing: '#f59e0b',
  gap: '#ef4444'
};

interface DetailedCompetencyItem {
  id: string;
  name: string;
  category: 'Technical Execution' | 'Applied Practice' | 'Strategic & Leadership' | 'Domain Fundamentals';
  currentScore: number; // 1.0 to 5.0
  targetScore: number;  // 4.0 to 5.0
  status: 'Mastered & Verified' | 'Developing' | 'Target Skill Gap';
  gapLevel: 'none' | 'low' | 'high';
  reason: string;
  recommendedCourseKeyword: string;
}

export default function CompetencyPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [onboarding, setOnboarding] = useState<{ experience?: string; education?: string; completedCourses?: string; careerGoal?: string }>({});
  const [assessment, setAssessment] = useState<any>(null);
  const [assessmentHistory, setAssessmentHistory] = useState<any[]>([]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    if (typeof window !== 'undefined') {
      try {
        const storedOnboarding = localStorage.getItem('statpath_onboarding_data');
        if (storedOnboarding) {
          setOnboarding(JSON.parse(storedOnboarding));
        }

        const storedAssessment = localStorage.getItem('statpath_assessment_results');
        if (storedAssessment) {
          setAssessment(JSON.parse(storedAssessment));
        }

        const storedHistory = localStorage.getItem('statpath_assessment_history');
        if (storedHistory) {
          setAssessmentHistory(JSON.parse(storedHistory));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Build Structured Learning Profile (Aggregating multi-source evidence)
  const userLearningProfile: UserLearningProfile = useMemo(() => {
    return buildUserLearningProfile(user, onboarding, assessment, {});
  }, [user, onboarding, assessment]);

  // Combined Knowledge Evidence Log (Historical Evidence Trail)
  const evidenceLogList = useMemo(() => {
    const log: Array<{
      id: string;
      title: string;
      evidenceType: 'diagnostic_exam' | 'assessment' | 'course_quiz' | 'self_reported';
      competency: string;
      score: number;
      completedAt: string;
      level: string;
    }> = [];

    // Add entries from stored history
    assessmentHistory.forEach((h, idx) => {
      log.push({
        id: h.id || `hist-${idx}`,
        title: h.title || 'Domain Assessment Test',
        evidenceType: h.evidenceType || 'assessment',
        competency: h.competency || 'Domain Skill',
        score: h.score || 80,
        completedAt: h.completedAt || new Date().toISOString(),
        level: h.score >= 88 ? 'Expert' : h.score >= 71 ? 'Advanced' : h.score >= 45 ? 'Intermediate' : 'Beginner'
      });
    });

    // Add baseline diagnostic intake evidence
    if (assessment) {
      log.push({
        id: 'baseline-diag',
        title: 'Adaptive Baseline Diagnostic Assessment',
        evidenceType: 'diagnostic_exam',
        competency: 'Baseline Competency Framework',
        score: assessment.score || 70,
        completedAt: assessment.completedAt || new Date().toISOString(),
        level: assessment.score >= 88 ? 'Expert' : assessment.score >= 71 ? 'Advanced' : assessment.score >= 45 ? 'Intermediate' : 'Beginner'
      });
    }

    // Add claimed courses intake evidence
    if (onboarding.completedCourses) {
      onboarding.completedCourses.split(',').forEach((c, idx) => {
        log.push({
          id: `claimed-${idx}`,
          title: `Prior Training & Experience (${c.trim()})`,
          evidenceType: 'self_reported',
          competency: c.trim(),
          score: 65,
          completedAt: new Date().toISOString(),
          level: 'Intermediate'
        });
      });
    }

    return log;
  }, [assessmentHistory, assessment, onboarding]);

  // DYNAMIC DEDICATED COMPETENCY MAP GENERATOR
  const competencyAnalysis = useMemo(() => {
    const targetGoal = onboarding.careerGoal || 'Data Scientist';
    const claimedCoursesRaw = onboarding.completedCourses || 'Professional Fundamentals';
    const claimedList = claimedCoursesRaw.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const expRange = onboarding.experience || '1-3 years';

    const skillGapResult = analyzeSkillGap({
      career_goal: targetGoal,
      current_skills: claimedList,
      current_level: expRange.includes('5') || expRange.includes('10') ? 'Intermediate' : 'Beginner'
    });

    const competencies: DetailedCompetencyItem[] = [];

    // Known / Verified Skills
    claimedList.forEach((skill, idx) => {
      const isVerifiedInAssessment = assessment?.topicDetails?.some(
        (t: any) => t.isCorrect && (t.topic.toLowerCase().includes(skill.toLowerCase()) || t.competency.toLowerCase().includes(skill.toLowerCase()))
      );

      competencies.push({
        id: `known-${idx}`,
        name: skill,
        category: 'Technical Execution',
        currentScore: isVerifiedInAssessment ? 4.8 : 4.2,
        targetScore: 5.0,
        status: 'Mastered & Verified',
        gapLevel: 'none',
        reason: isVerifiedInAssessment
          ? `Verified via assessment and self-reported intake (${skill}).`
          : `Claimed completed training & practical experience (${skill}).`,
        recommendedCourseKeyword: skill
      });
    });

    // Assessment Verified Topics
    if (assessment?.topicDetails) {
      assessment.topicDetails.forEach((tItem: any, idx: number) => {
        const existing = competencies.find(c => c.name.toLowerCase() === tItem.topic.toLowerCase() || c.name.toLowerCase() === tItem.competency.toLowerCase());
        if (!existing) {
          if (tItem.isCorrect) {
            competencies.push({
              id: `assess-${idx}`,
              name: tItem.competency || tItem.topic,
              category: 'Applied Practice',
              currentScore: 4.5,
              targetScore: 5.0,
              status: 'Mastered & Verified',
              gapLevel: 'none',
              reason: `Passed diagnostic baseline assessment question on "${tItem.topic}".`,
              recommendedCourseKeyword: tItem.recommendedCourseKeyword || tItem.topic
            });
          }
        }
      });
    }

    // Target Skill Gaps
    skillGapResult.skill_gaps.forEach((gapSkill, idx) => {
      const alreadyHas = competencies.some(c => c.name.toLowerCase() === gapSkill.toLowerCase());
      if (!alreadyHas) {
        competencies.push({
          id: `gap-${idx}`,
          name: gapSkill,
          category: gapSkill.toLowerCase().includes('leadership') || gapSkill.toLowerCase().includes('management') || gapSkill.toLowerCase().includes('governance')
            ? 'Strategic & Leadership'
            : 'Domain Fundamentals',
          currentScore: 1.5,
          targetScore: 4.5,
          status: 'Target Skill Gap',
          gapLevel: 'high',
          reason: `Required competency gap to qualify for target career goal "${targetGoal}".`,
          recommendedCourseKeyword: gapSkill
        });
      }
    });

    if (competencies.length < 6) {
      const defaultDomain = [
        { name: 'Data Governance & Ethics', cat: 'Strategic & Leadership', score: 3.2, gap: 'low' },
        { name: 'Quality Standards & SLAs', cat: 'Applied Practice', score: 3.5, gap: 'low' },
        { name: 'Digital Transformation', cat: 'Strategic & Leadership', score: 2.0, gap: 'high' }
      ];

      defaultDomain.forEach((d, idx) => {
        if (!competencies.some(c => c.name === d.name)) {
          competencies.push({
            id: `def-${idx}`,
            name: d.name,
            category: d.cat as any,
            currentScore: d.score,
            targetScore: 4.5,
            status: d.gap === 'low' ? 'Developing' : 'Target Skill Gap',
            gapLevel: d.gap as any,
            reason: `Standard competency required for ${onboarding.education || 'Professional Advancement'}.`,
            recommendedCourseKeyword: d.name.split(' ')[0]
          });
        }
      });
    }

    const radarData = competencies.slice(0, 8).map(c => ({
      subject: c.name.length > 14 ? `${c.name.slice(0, 13)}…` : c.name,
      current: Math.round((c.currentScore / 5) * 100),
      required: Math.round((c.targetScore / 5) * 100),
      fullName: c.name
    }));

    const masteredCount = competencies.filter(c => c.status === 'Mastered & Verified').length;
    const developingCount = competencies.filter(c => c.status === 'Developing').length;
    const gapCount = competencies.filter(c => c.status === 'Target Skill Gap').length;

    return {
      targetGoal,
      claimedCoursesRaw,
      competencies,
      radarData,
      masteredCount,
      developingCount,
      gapCount,
      totalCount: competencies.length
    };
  }, [onboarding, assessment]);

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 className={styles.title} style={{ margin: 0 }}>Dynamic Competency Map & Skill Twin</h1>
            <span style={{ background: '#EEF2FF', color: '#4F46E5', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Sparkles size={12} color="#FF9933" /> Role & Skill Personalized
            </span>
          </div>
          <p className={styles.subtitle}>
            Directly mapping <strong>what you already know</strong> ({competencyAnalysis.claimedCoursesRaw}) against <strong>what you need</strong> to become a <strong>{competencyAnalysis.targetGoal}</strong>.
          </p>
        </div>
        <div className={styles.lastUpdated}>
          Role Goal: <strong>{competencyAnalysis.targetGoal}</strong>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className={styles.bands}>
        <div className={`card ${styles.band}`} style={{ borderTop: `4px solid ${GAP_COLOR.mastered}` }}>
          <div className={styles.bandHeader}>
            <CheckCircle size={18} color={GAP_COLOR.mastered} />
            <span className={styles.bandLabel} style={{ color: GAP_COLOR.mastered }}>What You Know (Verified)</span>
          </div>
          <div className={styles.bandCount} style={{ color: GAP_COLOR.mastered }}>{competencyAnalysis.masteredCount}</div>
          <div style={{ fontSize: 12, color: '#64748B' }}>Mastered Competencies</div>
        </div>

        <div className={`card ${styles.band}`} style={{ borderTop: `4px solid ${GAP_COLOR.developing}` }}>
          <div className={styles.bandHeader}>
            <Zap size={18} color={GAP_COLOR.developing} />
            <span className={styles.bandLabel} style={{ color: GAP_COLOR.developing }}>Developing Skills</span>
          </div>
          <div className={styles.bandCount} style={{ color: GAP_COLOR.developing }}>{competencyAnalysis.developingCount}</div>
          <div style={{ fontSize: 12, color: '#64748B' }}>Intermediate Baseline</div>
        </div>

        <div className={`card ${styles.band}`} style={{ borderTop: `4px solid ${GAP_COLOR.gap}` }}>
          <div className={styles.bandHeader}>
            <Target size={18} color={GAP_COLOR.gap} />
            <span className={styles.bandLabel} style={{ color: GAP_COLOR.gap }}>What You Need (Role Gaps)</span>
          </div>
          <div className={styles.bandCount} style={{ color: GAP_COLOR.gap }}>{competencyAnalysis.gapCount}</div>
          <div style={{ fontSize: 12, color: '#64748B' }}>Gaps for {competencyAnalysis.targetGoal}</div>
        </div>
      </div>

      {/* Two Column Layout: Radar & Role Progression */}
      <div className={styles.twoCol} style={{ marginBottom: 24 }}>
        {/* Radar Chart */}
        <div className={`card ${styles.section}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="section-title" style={{ margin: 0 }}>Competency Radar (Known vs Needed)</div>
            <span style={{ fontSize: 11, background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: 8, fontWeight: 600 }}>
              {competencyAnalysis.radarData.length} Key Competency Axes
            </span>
          </div>

          <div style={{ height: 320 }}>
            <ResponsiveContainer>
              <RadarChart data={competencyAnalysis.radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} />
                <Radar name={`Required for ${competencyAnalysis.targetGoal}`} dataKey="required" stroke="#94A3B8" fill="#F1F5F9" fillOpacity={0.5} />
                <Radar name="What You Already Know & Mastered" dataKey="current" stroke="#003087" fill="#003087" fillOpacity={0.4} />
                <Legend formatter={(v) => <span style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>{v}</span>} />
                <Tooltip formatter={(value: any, name: any, props: any) => [`${value}% Proficiency`, props.payload.fullName]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Role Target Readiness Summary */}
        <div className={`card ${styles.section}`}>
          <div className="section-title" style={{ marginBottom: 4 }}>Target Role Readiness Diagnostic</div>
          <div className="section-subtitle" style={{ marginBottom: 16 }}>
            Personalized alignment for target career role <strong>"{competencyAnalysis.targetGoal}"</strong>
          </div>

          <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
              <span>Target Role Readiness Score</span>
              <span style={{ color: '#003087' }}>
                {Math.round((competencyAnalysis.masteredCount / (competencyAnalysis.totalCount || 1)) * 100)}% Match
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.round((competencyAnalysis.masteredCount / (competencyAnalysis.totalCount || 1)) * 100)}%` }} />
            </div>
            <p style={{ fontSize: 12, color: '#64748B', marginTop: 8, margin: 0 }}>
              Based on your declared background ({onboarding.education || 'Higher Education'}, {onboarding.experience || 'Experience'}) and claimed skills.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13 }}>
              <CheckCircle size={16} color="#22c55e" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <strong>Strengths Leveraged:</strong> You have strong foundational proficiency in <span>{competencyAnalysis.claimedCoursesRaw}</span>.
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13 }}>
              <Target size={16} color="#ef4444" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <strong>Key Focus Areas Needed:</strong> Close the {competencyAnalysis.gapCount} identified skill gaps to qualify for {competencyAnalysis.targetGoal}.
              </div>
            </div>
          </div>

          <Link href="/dashboard/learn" className="btn btn-primary" style={{ width: '100%', marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <BookOpen size={16} /> Open Recommended Learning Resources →
          </Link>
        </div>
      </div>

      {/* NEW: USER KNOWLEDGE & LEARNING EVIDENCE LOG */}
      <div className={`card ${styles.section}`} style={{ marginBottom: 24, borderTop: '4px solid #003087' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <History size={20} color="#003087" /> User Knowledge & Learning Evidence Log
            </div>
            <div className="section-subtitle" style={{ margin: '2px 0 0 0' }}>
              Structured audit trail of all assessment tests, diagnostic exams, and quizzes completed by the user
            </div>
          </div>
          <span style={{ fontSize: 12, background: '#EFF6FF', color: '#1E40AF', padding: '4px 12px', borderRadius: 12, fontWeight: 700 }}>
            {evidenceLogList.length} Verified Evidence Entries
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {evidenceLogList.map((logItem) => {
            const isDiagnostic = logItem.evidenceType === 'diagnostic_exam';
            const isAssessment = logItem.evidenceType === 'assessment';
            const isQuiz = logItem.evidenceType === 'course_quiz';

            return (
              <div key={logItem.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                background: '#F8FAFC',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                flexWrap: 'wrap',
                gap: 12
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: isDiagnostic ? '#FEF3C7' : isAssessment ? '#DBEAFE' : '#DCFCE7',
                    color: isDiagnostic ? '#B45309' : isAssessment ? '#1E40AF' : '#15803D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 16
                  }}>
                    {isDiagnostic ? '🩺' : isAssessment ? '📝' : '⚡'}
                  </div>

                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#0F172A' }}>{logItem.title}</div>
                    <div style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                      <span>Competency: <strong>{logItem.competency}</strong></span>
                      <span>•</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={11} /> {new Date(logItem.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="badge badge-primary" style={{ background: '#EFF6FF', color: '#1E40AF' }}>
                    Level: {logItem.level}
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: logItem.score >= 70 ? '#22c55e' : '#f59e0b' }}>
                      {logItem.score}% Score
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B', textTransform: 'capitalize' }}>
                      {logItem.evidenceType.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Competency Matrix Grid */}
      <div className={`card ${styles.section}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div className="section-title" style={{ margin: 0 }}>Personalized Competency Matrix</div>
            <div className="section-subtitle" style={{ margin: '2px 0 0 0' }}>
              Detailed breakdown of your mastered skills vs target role requirements
            </div>
          </div>
          <Link href="/dashboard/profile" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            Update Profile & Skills
          </Link>
        </div>

        <div className={styles.compGrid}>
          {competencyAnalysis.competencies.map(comp => (
            <div key={comp.id} className={styles.compCard} style={{ borderLeft: `4px solid ${comp.status === 'Mastered & Verified' ? '#22c55e' : comp.status === 'Developing' ? '#f59e0b' : '#ef4444'}` }}>
              <div className={styles.compHeader}>
                <span className={styles.compName}>{comp.name}</span>
                <span className="badge" style={{
                  background: comp.status === 'Mastered & Verified' ? '#DCFCE7' : comp.status === 'Developing' ? '#FEF3C7' : '#FEE2E2',
                  color: comp.status === 'Mastered & Verified' ? '#15803D' : comp.status === 'Developing' ? '#92400E' : '#991B1B',
                  fontWeight: 700
                }}>
                  {comp.status}
                </span>
              </div>

              <div style={{ fontSize: 12, color: '#64748B', marginBottom: 8 }}>
                Category: <strong>{comp.category}</strong>
              </div>

              <div className={styles.compScores}>
                <span>Current: <strong style={{ color: comp.status === 'Mastered & Verified' ? '#22c55e' : '#003087' }}>{comp.currentScore.toFixed(1)} / 5.0</strong></span>
                <span>Role Target: <strong>{comp.targetScore.toFixed(1)} / 5.0</strong></span>
              </div>

              <div className={styles.compBarWrap}>
                <div className={styles.compBarBg}>
                  <div className={styles.compBarFill} style={{
                    width: `${(comp.currentScore / 5) * 100}%`,
                    background: comp.status === 'Mastered & Verified' ? '#22c55e' : comp.status === 'Developing' ? '#f59e0b' : '#ef4444'
                  }} />
                  <div className={styles.compBarReq} style={{ left: `${(comp.targetScore / 5) * 100}%` }} />
                </div>
              </div>

              <div style={{ fontSize: 12, color: '#475569', marginTop: 10, fontStyle: 'italic', background: '#F8FAFC', padding: '6px 10px', borderRadius: 6 }}>
                💡 {comp.reason}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Bar */}
      <div className={styles.actions} style={{ marginTop: 24 }}>
        <Link href="/dashboard/learn" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <BookOpen size={16} /> View Recommended Learning Resources for My Gaps →
        </Link>
        <Link href="/dashboard/career" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Target size={16} /> Simulate Different Target Career Goal
        </Link>
      </div>
    </div>
  );
}
