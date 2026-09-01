'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { COMPETENCY_SCORES, CAREER_PATH, DEMO_USER } from '@/lib/mockData';
import { getCurrentUser, updateCurrentUserProfile, UserProfile } from '@/lib/authStorage';
import { analyzeSkillGap } from '@/lib/skillGapService';
import { Pencil, Lock, Save, X, CheckCircle, Shield, Award, Sparkles, BookOpen, RefreshCw } from 'lucide-react';
import styles from './profile.module.css';

const EXPERIENCE_RANGES = [
  'Less than 1 year',
  '1-3 years',
  '3-5 years',
  '5-10 years',
  '10-15 years',
  'More than 15 years'
];

export default function ProfilePage() {
  const { t } = useLanguage();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [onboarding, setOnboarding] = useState<{ experience?: string; education?: string; completedCourses?: string; careerGoal?: string }>({});
  const [assessment, setAssessment] = useState<any>(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [activeEditField, setActiveEditField] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Editable Form State
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    organisation: '',
    dept: '',
    email: '',
    experience: '',
    education: '',
    careerGoal: '',
    completedCourses: ''
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    let obData: any = {};
    if (typeof window !== 'undefined') {
      try {
        const storedOnboarding = localStorage.getItem('statpath_onboarding_data');
        if (storedOnboarding) {
          obData = JSON.parse(storedOnboarding);
          setOnboarding(obData);
        }

        const storedAssessment = localStorage.getItem('statpath_assessment_results');
        if (storedAssessment) setAssessment(JSON.parse(storedAssessment));
      } catch (e) {
        console.error(e);
      }
    }

    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        designation: currentUser.designation || '',
        organisation: currentUser.organisation || '',
        dept: currentUser.dept || '',
        email: currentUser.email || '',
        experience: obData.experience || '',
        education: obData.education || '',
        careerGoal: obData.careerGoal || '',
        completedCourses: obData.completedCourses || ''
      });
    }
  }, []);

  const isDemo = !user || user.empId === DEMO_USER.employeeId;

  // DYNAMIC COMPETENCY ENGINE: Recalculates Strengths & Priority Development Areas based on updated user profile data!
  const computedCompetencies = useMemo(() => {
    const activeGoal = (formData.careerGoal || onboarding.careerGoal || 'Data Scientist').trim();
    const activeCoursesStr = (formData.completedCourses || onboarding.completedCourses || '').trim();
    
    const activeCoursesList = activeCoursesStr.length > 0
      ? activeCoursesStr.split(',').map(s => s.trim()).filter(s => s.length > 0)
      : [];

    const userExp = formData.experience || onboarding.experience || '1-3 years';
    const userLevel = (userExp.includes('5') || userExp.includes('10') || userExp.includes('15')) ? 'Intermediate' : 'Beginner';

    // 1. Analyze skill gaps dynamically for target goal vs active claimed courses
    const gapAnalysis = analyzeSkillGap({
      career_goal: activeGoal,
      current_skills: activeCoursesList,
      current_level: userLevel
    });

    // 2. Derive Strengths (Assessment verified topics + claimed skill competencies)
    const assessmentStrengths: string[] = assessment?.strongTopics || [];
    const claimedStrengths: string[] = activeCoursesList.map(c => c.length > 20 ? `${c.slice(0, 20)}...` : c);
    
    let strengthsList = Array.from(new Set([...assessmentStrengths, ...claimedStrengths]));
    if (strengthsList.length === 0) {
      strengthsList = ['Core Professional Execution', 'Domain Fundamentals'];
    }

    // 3. Derive Priority Development Areas / Skill Gaps (Assessment weak topics + computed missing goal gaps)
    const assessmentGaps: string[] = assessment?.weakTopics || [];
    const goalSkillGaps: string[] = gapAnalysis.skill_gaps;

    // Filter out gaps that the user has now claimed as completed skills!
    const filteredGaps = Array.from(new Set([...assessmentGaps, ...goalSkillGaps]))
      .filter(gap => !activeCoursesList.some(claimed => claimed.toLowerCase() === gap.toLowerCase()));

    let finalGaps = filteredGaps.length > 0 ? filteredGaps : [`Advanced ${activeGoal} Specialisation`];

    // 4. Diagnostic Summary Metrics
    const totalCompetencies = strengthsList.length + finalGaps.length;
    const scoreRatio = totalCompetencies > 0 ? Math.round((strengthsList.length / totalCompetencies) * 100) : 70;
    const computedScoreFormatted = assessment?.scoreFormatted || `${(scoreRatio / 20).toFixed(1)} / 5.0`;

    return {
      activeGoal,
      strengthsList,
      gapsList: finalGaps,
      strengthsCount: strengthsList.length,
      gapsCount: finalGaps.length,
      unansweredCount: assessment ? assessment.unansweredCount : 0,
      scoreFormatted: computedScoreFormatted
    };
  }, [formData, onboarding, assessment]);

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const handleSave = () => {
    // 1. Update User Profile in Storage (empId is locked)
    const updatedUser = updateCurrentUserProfile({
      name: formData.name,
      designation: formData.designation,
      organisation: formData.organisation,
      dept: formData.dept,
      email: formData.email
    });

    if (updatedUser) {
      setUser(updatedUser);
    }

    // 2. Update Onboarding Data in Storage (Updates skill gaps & learning recommendations across dashboard)
    const updatedOnboarding = {
      ...onboarding,
      experience: formData.experience,
      education: formData.education,
      careerGoal: formData.careerGoal,
      completedCourses: formData.completedCourses
    };
    setOnboarding(updatedOnboarding);

    if (typeof window !== 'undefined') {
      localStorage.setItem('statpath_onboarding_data', JSON.stringify(updatedOnboarding));
    }

    setIsEditing(false);
    setActiveEditField(null);
    setSuccessMsg('✅ Profile & Competency Diagnostics updated in real-time!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const startEditField = (fieldKey: string) => {
    setActiveEditField(fieldKey);
    setIsEditing(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            👤 {t('screenReader') ? 'Official Profile' : 'My Profile'}
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
            Strengths & Priority Development Areas update dynamically based on your background and target career goal.
          </p>
        </div>
        
        {!isEditing ? (
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setIsEditing(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Pencil size={14} /> Edit Profile
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <X size={14} /> Cancel
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Save size={14} /> Save Profile & Update Skills
            </button>
          </div>
        )}
      </div>

      {successMsg && (
        <div style={{
          background: '#DEF7EC',
          border: '1px solid #84E1BC',
          color: '#03543F',
          padding: '10px 16px',
          borderRadius: 8,
          marginBottom: 20,
          fontSize: 13,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <CheckCircle size={18} color="#0E9F6E" /> {successMsg}
        </div>
      )}

      <div className={styles.layout}>
        {/* Left Profile Card */}
        <div className={styles.profileCard}>
          <div className={styles.avatar}>{userInitials}</div>
          
          {/* Editable Name */}
          {!isEditing ? (
            <div className={styles.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {user?.name || 'Registered Officer'}
              <button onClick={() => startEditField('name')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 2 }} title="Edit Name">
                <Pencil size={13} />
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 2 }}>Full Name</label>
              <input className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
          )}

          {/* Editable Designation */}
          {!isEditing ? (
            <div className={styles.designation} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {user?.designation || 'Statistical Official'}
              <button onClick={() => startEditField('designation')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 2 }} title="Edit Designation">
                <Pencil size={12} />
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 2 }}>Designation / Role</label>
              <input className="form-input" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} />
            </div>
          )}

          {/* LOCKED OFFICIAL ID */}
          <div className={styles.empId} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#F1F5F9', padding: '3px 10px', borderRadius: 12, border: '1px solid #E2E8F0', marginTop: 6 }}>
            <Lock size={12} color="#64748B" />
            <span style={{ fontWeight: 700, color: '#475569' }}>Official ID: {user?.empId || 'MOS/OFFICIAL'}</span>
            <span style={{ fontSize: 10, color: '#94A3B8', fontStyle: 'italic' }}>(Locked)</span>
          </div>

          {/* Editable Organisation */}
          {!isEditing ? (
            <div className={styles.orgBadge} style={{ cursor: 'pointer' }} onClick={() => startEditField('organisation')}>
              {user?.organisation || 'Ministry / Organisation'} <Pencil size={10} style={{ marginLeft: 4 }} />
            </div>
          ) : (
            <div style={{ margin: '12px 0' }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 2 }}>Organisation</label>
              <input className="form-input" value={formData.organisation} onChange={e => setFormData({ ...formData, organisation: e.target.value })} />
            </div>
          )}
          
          <div className={styles.infoGrid}>
            {/* Department */}
            <div className={styles.infoItem}>
              <div className={styles.infoLabel} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Department / Division
                <button onClick={() => startEditField('dept')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }} title="Edit Department">
                  <Pencil size={12} />
                </button>
              </div>
              {!isEditing ? (
                <div className={styles.infoValue}>{user?.dept || 'Not Specified'}</div>
              ) : (
                <input className="form-input" value={formData.dept} onChange={e => setFormData({ ...formData, dept: e.target.value })} style={{ marginTop: 2 }} />
              )}
            </div>

            {/* Official Email */}
            <div className={styles.infoItem}>
              <div className={styles.infoLabel} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Official Email
                <button onClick={() => startEditField('email')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }} title="Edit Email">
                  <Pencil size={12} />
                </button>
              </div>
              {!isEditing ? (
                <div className={styles.infoValue}>{user?.email || 'Not Provided'}</div>
              ) : (
                <input className="form-input" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ marginTop: 2 }} />
              )}
            </div>

            {/* Years of Experience */}
            <div className={styles.infoItem}>
              <div className={styles.infoLabel} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Experience Range
                <button onClick={() => startEditField('experience')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }} title="Edit Experience">
                  <Pencil size={12} />
                </button>
              </div>
              {!isEditing ? (
                <div className={styles.infoValue}>{formData.experience || onboarding.experience || (isDemo ? '5–10 years' : 'Pending Intake')}</div>
              ) : (
                <select className="form-select" value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })} style={{ marginTop: 2 }}>
                  <option value="">Select Experience</option>
                  {EXPERIENCE_RANGES.map(exp => <option key={exp} value={exp}>{exp}</option>)}
                </select>
              )}
            </div>

            {/* Highest Qualification */}
            <div className={styles.infoItem}>
              <div className={styles.infoLabel} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Highest Education
                <button onClick={() => startEditField('education')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }} title="Edit Education">
                  <Pencil size={12} />
                </button>
              </div>
              {!isEditing ? (
                <div className={styles.infoValue}>{formData.education || onboarding.education || (isDemo ? 'M.Sc. Statistics' : 'Pending Intake')}</div>
              ) : (
                <input className="form-input" value={formData.education} onChange={e => setFormData({ ...formData, education: e.target.value })} style={{ marginTop: 2 }} />
              )}
            </div>

            {/* Target Career Goal */}
            <div className={styles.infoItem}>
              <div className={styles.infoLabel} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Target Career Goal
                <button onClick={() => startEditField('careerGoal')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }} title="Edit Career Goal">
                  <Pencil size={12} />
                </button>
              </div>
              {!isEditing ? (
                <div className={styles.infoValue} style={{ color: '#003087', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Sparkles size={14} color="#FF9933" /> {formData.careerGoal || onboarding.careerGoal || (isDemo ? CAREER_PATH.target : 'Pending Selection')}
                </div>
              ) : (
                <input className="form-input" value={formData.careerGoal} onChange={e => setFormData({ ...formData, careerGoal: e.target.value })} style={{ marginTop: 2 }} placeholder="e.g. Data Scientist, Software Architect..." />
              )}
            </div>
          </div>

          {isEditing && (
            <button className="btn btn-primary" onClick={handleSave} style={{ width: '100%', marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Save size={16} /> Save All Profile Changes
            </button>
          )}
        </div>

        {/* Right Section: Dynamically Re-calculated Competencies */}
        <div className={styles.rightCol}>
          {/* Competency Diagnostic Summary */}
          <div className={`card ${styles.section}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="section-title" style={{ margin: 0 }}>Competency Diagnostic Summary</div>
              <span style={{ fontSize: 11, background: '#EFF6FF', color: '#1E40AF', padding: '2px 8px', borderRadius: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <RefreshCw size={11} className="animate-spin" /> Dynamic Real-time Calculation
              </span>
            </div>

            <div className={styles.compSummary}>
              <div className={styles.sumItem}>
                <span style={{ color: '#22c55e', fontSize: 28, fontWeight: 900 }}>
                  {computedCompetencies.strengthsCount}
                </span>
                <span>Verified Strengths</span>
              </div>
              <div className={styles.sumItem}>
                <span style={{ color: '#f97316', fontSize: 28, fontWeight: 900 }}>
                  {computedCompetencies.unansweredCount}
                </span>
                <span>Unanswered</span>
              </div>
              <div className={styles.sumItem}>
                <span style={{ color: '#ef4444', fontSize: 28, fontWeight: 900 }}>
                  {computedCompetencies.gapsCount}
                </span>
                <span>Priority Gaps</span>
              </div>
              <div className={styles.sumItem}>
                <span style={{ color: '#003087', fontSize: 24, fontWeight: 900 }}>
                  {computedCompetencies.scoreFormatted}
                </span>
                <span>Competency Score</span>
              </div>
            </div>
          </div>

          {/* Dynamically Re-calculated Strengths */}
          <div className={`card ${styles.section}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div className="section-title" style={{ margin: 0 }}>Verified Strengths</div>
              <span style={{ fontSize: 11, color: '#166534', background: '#DCFCE7', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                {computedCompetencies.strengthsCount} Competencies
              </span>
            </div>
            
            {computedCompetencies.strengthsList.length > 0 ? (
              <div className={styles.tagCloud}>
                {computedCompetencies.strengthsList.map((s: string) => (
                  <span key={s} className={styles.strengthTag}>✓ {s}</span>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: '#64748B', fontStyle: 'italic', margin: 0 }}>
                Complete your Baseline Assessment or add completed skills to reveal verified competency strengths.
              </p>
            )}
          </div>

          {/* Dynamically Re-calculated Priority Development Areas */}
          <div className={`card ${styles.section}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div className="section-title" style={{ margin: 0 }}>
                Priority Development Areas ({computedCompetencies.activeGoal})
              </div>
              <span style={{ fontSize: 11, color: '#991B1B', background: '#FEE2E2', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                {computedCompetencies.gapsCount} Gaps Identified
              </span>
            </div>

            <p style={{ fontSize: 12, color: '#64748B', margin: '-4px 0 12px 0' }}>
              Required skill gaps needed to achieve your target role <strong>"{computedCompetencies.activeGoal}"</strong>:
            </p>

            {computedCompetencies.gapsList.length > 0 ? (
              <div className={styles.tagCloud}>
                {computedCompetencies.gapsList.map((gap: string) => (
                  <span key={gap} className={styles.gapTag}>🎯 {gap}</span>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: '#166534', fontStyle: 'italic', margin: 0 }}>
                🎉 Outstanding! You have met all key skill requirements for your target career goal!
              </p>
            )}

            <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px dashed #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#64748B' }}>Target Role Learning Resources:</span>
              <Link href="/dashboard/learn" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                <BookOpen size={14} /> View Remediating Courses →
              </Link>
            </div>
          </div>

          {/* Prior Training & Online Courses */}
          <div className={`card ${styles.section}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div className="section-title" style={{ margin: 0 }}>Prior Training & Online Courses</div>
              <button 
                onClick={() => startEditField('completedCourses')} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700 }}
              >
                <Pencil size={13} /> Edit Skills / Courses
              </button>
            </div>

            {!isEditing || activeEditField !== 'completedCourses' ? (
              (formData.completedCourses || onboarding.completedCourses) ? (
                <div className={styles.historyRow}>
                  <div className={styles.historyInfo}>
                    <div className={styles.historyName}>{formData.completedCourses || onboarding.completedCourses}</div>
                    <div className={styles.historyMeta}>Self-Reported Training & Skills</div>
                  </div>
                  <span className="badge badge-success">Completed</span>
                </div>
              ) : isDemo ? (
                [{name:'Statistical Literacy',source:'IIM Bangalore',status:'Completed',date:'Mar 2024'},{name:'Design Thinking for Public Service',source:'Brhat',status:'In Progress',date:'Jul 2024'}].map(c => (
                  <div key={c.name} className={styles.historyRow}>
                    <div className={styles.historyInfo}>
                      <div className={styles.historyName}>{c.name}</div>
                      <div className={styles.historyMeta}>{c.source} • {c.date}</div>
                    </div>
                    <span className={`badge ${c.status === 'Completed' ? 'badge-success' : 'badge-primary'}`}>{c.status}</span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: 13, color: '#64748B', fontStyle: 'italic' }}>
                  No prior training reported. Click the pencil icon above to add your completed courses & skills or explore your <Link href="/dashboard/learn" style={{ color: '#003087', fontWeight: 600 }}>Learning Resources</Link> to enroll.
                </div>
              )
            ) : (
              <div style={{ marginTop: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 4 }}>Completed Courses & Technical/Functional Skills</label>
                <textarea 
                  className="form-input" 
                  rows={3} 
                  value={formData.completedCourses} 
                  onChange={e => setFormData({ ...formData, completedCourses: e.target.value })} 
                  placeholder="e.g. Data Analytics with Python, Project Management, Machine Learning..."
                />
                <button className="btn btn-primary btn-sm" onClick={handleSave} style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Save size={14} /> Update Training & Re-calculate Skills
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
