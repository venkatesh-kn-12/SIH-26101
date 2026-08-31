'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOrderedRoleRecommendations, OrderedLearningStep } from '@/lib/recommendationEngine';
import { getCurrentUser, UserProfile } from '@/lib/authStorage';
import { DEMO_USER } from '@/lib/mockData';
import { BookOpen, User, Target, Award, Clock, ArrowRight, Sparkles } from 'lucide-react';
import styles from './learn.module.css';

function formatDuration(seconds: string) {
  const s = parseInt(seconds, 10);
  if (!s) return 'Self-paced';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const SAMPLE_COURSES = [
  {
    id: 'python-basics-01',
    title: 'Python for Statistical Officers — Module 1: Introduction',
    description: 'Learn the fundamentals of Python programming tailored for statistical analysis. Covers variables, data types, basic operations, and your first Python script.',
    competency: 'Python Programming',
    difficulty: 'Beginner',
    duration: '45 min',
    provider: 'StatPath AI Curated',
    topics: ['Variables & Data Types', 'Basic Operations', 'Print Statements', 'Python Setup'],
    hasContent: true,
  }
];

export default function LearnPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('Statistical Officer');
  const [assessmentResults, setAssessmentResults] = useState<any>(null);

  useEffect(() => {
    setUser(getCurrentUser());
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('statpath_assessment_results');
        if (stored) setAssessmentResults(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const isDemo = !user || user.empId === DEMO_USER.employeeId;

  // Demo user: show iGOT ordered path
  const orderedPath: OrderedLearningStep[] = getOrderedRoleRecommendations(selectedRole);

  // DEMO USER VIEW
  if (isDemo) {
    return (
      <div>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Your Sequential iGOT Learning Path</h1>
            <p className={styles.subtitle}>Curated directly from the official iGOT Karmayogi catalog for your designation.</p>
          </div>
          <div className={styles.pathMeta}>
            <div className={styles.metaItem}>Target Role: <strong>{selectedRole}</strong></div>
            <div className={styles.metaItem}>{orderedPath.length} Sequential iGOT Courses</div>
          </div>
        </div>

        <div className={`card ${styles.whyCard}`} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div className={styles.whyTitle}>Select Officer Role Profile:</div>
              <p style={{ fontSize: 13, color: 'var(--gray-600)' }}>StatPath AI dynamically matches and orders courses strictly from official iGOT content data based on competency requirements.</p>
            </div>
            <select 
              value={selectedRole} 
              onChange={e => setSelectedRole(e.target.value)}
              className="form-select"
              style={{ width: 260, fontWeight: 700 }}
            >
              <option value="Statistical Officer">Statistical Officer</option>
              <option value="Data Analyst / Investigator">Data Analyst / Investigator</option>
            </select>
          </div>
        </div>

        <div className={styles.courseList}>
          {orderedPath.map((step, idx) => {
            const c = step.course;
            return (
              <div key={c.identifier} className={`card ${styles.phaseDetail}`} style={{ marginBottom: 20, borderLeft: '4px solid var(--ux4g-gov-navy)' }}>
                <div className={styles.pdHeader}>
                  <div>
                    <div className="badge badge-karnataka" style={{ marginBottom: 6 }}>
                      {step.phaseName}
                    </div>
                    <h2 className={styles.pdTitle}>{c.name}</h2>
                    <p className={styles.pdDesc}>{c.description || step.recommendationReason}</p>
                  </div>
                  <div className="badge badge-primary">
                    {step.targetCompetency}
                  </div>
                </div>

                <div className={styles.courseRow} style={{ background: '#F8FAFC', padding: 16, borderRadius: 8, marginTop: 12 }}>
                  <div className={styles.courseNum}>#{idx + 1}</div>
                  <img src={c.appIcon} alt={c.name} className={styles.courseThumb} onError={e => (e.currentTarget.style.display = 'none')} />
                  <div className={styles.courseInfo}>
                    <div className={styles.courseName}>{c.name}</div>
                    <div className={styles.courseMeta}>
                      <span>Provider: <strong>{c.source}</strong></span>
                      <span>Duration: <strong>{formatDuration(c.duration)}</strong></span>
                      <span>iGOT ID: <code>{c.identifier}</code></span>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12, color: 'var(--gray-700)', background: '#EFF6FF', padding: '6px 10px', borderRadius: 4 }}>
                      <strong>Why Required in Order:</strong> {step.recommendationReason}
                    </div>
                  </div>
                  <div className={styles.courseActions}>
                    <Link href="/dashboard/learn/course" className="btn btn-primary btn-sm">
                      Start Learning <ArrowRight size={14} style={{ marginLeft: 4 }} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // REGISTERED USER VIEW
  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Your Personalized Learning Path</h1>
          <p className={styles.subtitle}>
            Courses curated by StatPath AI based on your baseline assessment and competency profile.
          </p>
        </div>
        <div className={styles.pathMeta}>
          <div className={styles.metaItem}>{user?.designation || 'Officer'}</div>
          <div className={styles.metaItem}>{SAMPLE_COURSES.length} Available Course</div>
        </div>
      </div>

      {assessmentResults?.weakTopics?.length > 0 && (
        <div style={{ background: '#EFF6FF', border: '1px solid #93C5FD', padding: '14px 18px', borderRadius: 8, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: '#1E40AF', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={16} /> StatPath AI Recommendation Engine:
          </div>
          <p style={{ fontSize: 13, color: '#1E3A8A', marginTop: 4, marginBottom: 0 }}>
            Based on your baseline assessment score of <strong>{assessmentResults.score}% ({assessmentResults.scoreFormatted})</strong>, courses are prioritized to bridge your identified gaps: <strong>{assessmentResults.weakTopics.join(', ')}</strong>.
          </p>
        </div>
      )}

      {/* Sample Courses for Registered Users */}
      <div className={styles.courseList}>
        {SAMPLE_COURSES.map((course, idx) => (
          <div key={course.id} className={`card ${styles.phaseDetail}`} style={{ marginBottom: 20, borderLeft: '4px solid var(--ux4g-gov-navy)' }}>
            <div className={styles.pdHeader}>
              <div>
                <div className="badge badge-primary" style={{ marginBottom: 6 }}>
                  {course.competency}
                </div>
                <h2 className={styles.pdTitle}>{course.title}</h2>
                <p className={styles.pdDesc}>{course.description}</p>
              </div>
              <div className="badge badge-success">{course.difficulty}</div>
            </div>

            <div className={styles.courseRow} style={{ background: '#F8FAFC', padding: 16, borderRadius: 8, marginTop: 12 }}>
              <div className={styles.courseNum}>#{idx + 1}</div>
              <div className={styles.courseInfo}>
                <div className={styles.courseName}>{course.title}</div>
                <div className={styles.courseMeta}>
                  <span>Provider: <strong>{course.provider}</strong></span>
                  <span>Duration: <strong>{course.duration}</strong></span>
                  <span>Difficulty: <strong>{course.difficulty}</strong></span>
                </div>
                <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {course.topics.map(t => (
                    <span key={t} style={{ padding: '4px 10px', borderRadius: 4, background: '#EFF6FF', color: '#1E40AF', fontSize: 11, fontWeight: 600, border: '1px solid #BFDBFE' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className={styles.courseActions}>
                <Link href="/dashboard/learn/course" className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
                  Start Learning <ArrowRight size={14} style={{ marginLeft: 4 }} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder Notice */}
      <div className="card" style={{ textAlign: 'center', padding: 32, background: '#F8FAFC', border: '1px dashed #CBD5E1' }}>
        <div style={{ display: 'inline-flex', padding: 12, borderRadius: '50%', background: '#F1F5F9', color: '#003087', marginBottom: 8 }}>
          <BookOpen size={24} />
        </div>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>More Courses Coming Soon</div>
        <p style={{ fontSize: 13, color: '#64748B', marginTop: 4, maxWidth: 500, margin: '4px auto 0 auto' }}>
          StatPath AI will continuously fetch and recommend official iGOT Karmayogi courses based on your evolving competency profile and assessment performance.
        </p>
      </div>
    </div>
  );
}
