'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getCurrentUser, UserProfile } from '@/lib/authStorage';
import catalogData from '../../../../public/content-list-data.json';
import { Sparkles, Target, BookOpen, Search, Filter, RefreshCw, CheckCircle2, ChevronRight, Layers, Award, Zap } from 'lucide-react';
import styles from './learn.module.css';

const LEVEL_ORDER: Record<string, number> = {
  'beginner': 1,
  'intermediate': 2,
  'advanced': 3,
  'expert': 4
};

export default function LearnPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [assessmentResults, setAssessmentResults] = useState<any>(null);
  const [recommendationData, setRecommendationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Tab State: 'recommended' | 'catalog'
  const [activeTab, setActiveTab] = useState<'recommended' | 'catalog'>('recommended');

  // Search & Filter State for Catalog
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    let obData: any = {};
    let assessData: any = {};

    if (typeof window !== 'undefined') {
      try {
        const storedOb = localStorage.getItem('statpath_onboarding_data');
        if (storedOb) obData = JSON.parse(storedOb);
        setOnboardingData(obData);

        const storedAssess = localStorage.getItem('statpath_assessment_results');
        if (storedAssess) assessData = JSON.parse(storedAssess);
        setAssessmentResults(assessData);
      } catch (e) {
        console.error(e);
      }
    }

    async function fetchPipelineRecommendations() {
      try {
        setLoading(true);
        const res = await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: currentUser,
            onboardingData: obData,
            assessmentResults: assessData,
            courseProgressData: {}
          })
        });

        if (res.ok) {
          const data = await res.json();
          setRecommendationData(data);
        }
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPipelineRecommendations();
  }, []);

  const targetRole = recommendationData?.targetRole || onboardingData?.careerGoal || 'Data Scientist';
  const skillGaps = recommendationData?.skillGaps || [];
  const rawRecommendations = recommendationData?.recommendations || [];

  // SORT RECOMMENDED COURSES IN PROGRESSIVE ORDER: Beginner -> Intermediate -> Advanced -> Expert
  const sortedRecommendations = useMemo(() => {
    const list = [...rawRecommendations];
    list.sort((a: any, b: any) => {
      const levelA = LEVEL_ORDER[(a.course?.level || 'Beginner').toLowerCase()] || 1;
      const levelB = LEVEL_ORDER[(b.course?.level || 'Beginner').toLowerCase()] || 1;
      if (levelA !== levelB) return levelA - levelB;
      return (a.priority || 1) - (b.priority || 1);
    });
    return list;
  }, [rawRecommendations]);

  // ALL DOMAIN COURSES FROM CATALOG
  const allCourses: any[] = useMemo(() => {
    return Array.isArray((catalogData as any).content) ? (catalogData as any).content : [];
  }, []);

  // Unique Domains for Filter Dropdown
  const uniqueDomains = useMemo(() => {
    const set = new Set<string>();
    allCourses.forEach(c => { if (c.domain) set.add(c.domain); });
    return Array.from(set);
  }, [allCourses]);

  // FILTERED CATALOG COURSES
  const filteredCatalogCourses = useMemo(() => {
    return allCourses.filter(course => {
      const matchesSearch = searchQuery === '' || 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.competency && course.competency.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (course.domain && course.domain.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesLevel = selectedLevel === 'all' || 
        (course.level && course.level.toLowerCase() === selectedLevel.toLowerCase());

      const matchesDomain = selectedDomain === 'all' || course.domain === selectedDomain;

      return matchesSearch && matchesLevel && matchesDomain;
    });
  }, [allCourses, searchQuery, selectedLevel, selectedDomain]);

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 className={styles.title} style={{ margin: 0 }}>Learning Resources Hub</h1>
            {recommendationData?.llmReranked && (
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
                <Sparkles size={12} color="#FF9933" /> Qdrant Vector & Groq LLM Personalised
              </span>
            )}
          </div>
          <p className={styles.subtitle}>
            Explore skill-gap aligned courses for <strong>"{targetRole}"</strong> or search our full 99-course domain catalog.
          </p>
        </div>

        <div className={styles.headerMeta}>
          <div className={styles.badgeLabel}>Retriever Engine</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#003087' }}>
            {recommendationData?.retrieverSource || 'Qdrant Vector Database'}
          </div>
        </div>
      </div>

      {/* TWO TAB WINDOW NAVIGATION */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 24,
        borderBottom: '2px solid #E2E8F0',
        paddingBottom: 2
      }}>
        <button
          onClick={() => setActiveTab('recommended')}
          style={{
            background: activeTab === 'recommended' ? '#003087' : '#F1F5F9',
            color: activeTab === 'recommended' ? '#FFFFFF' : '#475569',
            border: 'none',
            borderRadius: '10px 10px 0 0',
            padding: '12px 24px',
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s'
          }}
        >
          <Target size={18} color={activeTab === 'recommended' ? '#FF9933' : '#64748B'} />
          AI Recommended Resources ({sortedRecommendations.length})
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          style={{
            background: activeTab === 'catalog' ? '#003087' : '#F1F5F9',
            color: activeTab === 'catalog' ? '#FFFFFF' : '#475569',
            border: 'none',
            borderRadius: '10px 10px 0 0',
            padding: '12px 24px',
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s'
          }}
        >
          <BookOpen size={18} color={activeTab === 'catalog' ? '#FF9933' : '#64748B'} />
          Browse All Courses Catalog ({allCourses.length})
        </button>
      </div>

      {/* ================= TAB 1: AI RECOMMENDED RESOURCES ================= */}
      {activeTab === 'recommended' && (
        <div>
          {/* Identified Skill Gaps Diagnostic Banner */}
          {skillGaps.length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
              border: '1px solid #FCD34D',
              borderRadius: 14,
              padding: '18px 24px',
              marginBottom: 24,
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 800, color: '#92400E', marginBottom: 8 }}>
                <Target size={20} color="#D97706" />
                Target Role Skill Gaps for "{targetRole}":
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {skillGaps.map((gapItem: any, idx: number) => (
                  <span key={idx} style={{
                    background: '#FFFFFF',
                    color: '#78350F',
                    border: '1px solid #FDE68A',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '5px 14px',
                    borderRadius: 20,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    🎯 {gapItem.skill || gapItem} 
                    <span style={{ fontSize: 10, background: '#FEF3C7', color: '#92400E', padding: '1px 6px', borderRadius: 10, fontWeight: 800 }}>
                      {gapItem.currentLevel || 'Beginner'}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Loading Spinner */}
          {loading && (
            <div style={{ padding: '60px 20px', textAlign: 'center', background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', marginBottom: 24 }}>
              <RefreshCw size={36} color="#003087" className="animate-spin" style={{ margin: '0 auto 16px auto' }} />
              <div style={{ fontWeight: 800, color: '#0F172A', fontSize: 17 }}>Retrieving Candidates from Qdrant Vector Store...</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Sorting domain progression (Beginner ➔ Intermediate ➔ Advanced)...</div>
            </div>
          )}

          {/* PROGRESSIVELY SORTED RECOMMENDED COURSES LIST */}
          {!loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {sortedRecommendations.map((item: any, idx: number) => {
                const course = item.course || {};
                const levelName = course.level || 'Beginner';
                const isBeginner = levelName.toLowerCase() === 'beginner';
                const isIntermediate = levelName.toLowerCase() === 'intermediate';

                return (
                  <div key={item.courseId || idx} className="card" style={{
                    padding: 24,
                    borderRadius: 16,
                    border: '1px solid #E2E8F0',
                    borderLeft: `6px solid ${isBeginner ? '#22c55e' : isIntermediate ? '#3b82f6' : '#8b5cf6'}`,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                    transition: 'transform 0.2s',
                    background: '#FFFFFF'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* Progressive Level Badge */}
                        <span style={{
                          background: isBeginner ? '#DCFCE7' : isIntermediate ? '#DBEAFE' : '#F3E8FF',
                          color: isBeginner ? '#15803D' : isIntermediate ? '#1E40AF' : '#6B21A8',
                          fontSize: 12,
                          fontWeight: 800,
                          padding: '4px 12px',
                          borderRadius: 20
                        }}>
                          Level {idx + 1}: {levelName} Progression
                        </span>

                        <span className="badge badge-primary">{course.competency || course.domain || 'Skill Module'}</span>
                      </div>

                      <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B', background: '#F1F5F9', padding: '4px 10px', borderRadius: 8 }}>
                        Priority #{item.priority || (idx + 1)}
                      </span>
                    </div>

                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: '8px 0 6px 0' }}>
                      {course.title}
                    </h3>
                    <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, margin: '0 0 14px 0' }}>
                      {course.description}
                    </p>

                    {/* Recommendation Justification Reason */}
                    <div style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      padding: '12px 16px',
                      borderRadius: 10,
                      fontSize: 13,
                      color: '#1E293B',
                      marginBottom: 16,
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <Sparkles size={16} color="#FF9933" style={{ flexShrink: 0 }} />
                      <div><strong>Justification:</strong> {item.reason}</div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ fontSize: 12, color: '#64748B' }}>
                        Category Domain: <strong style={{ color: '#003087' }}>{course.domain || course.competency || onboardingData?.completedCourses?.split(',')[0] || targetRole || 'Skill Domain'}</strong>
                      </div>

                      <Link href={`/dashboard/learn/course?id=${course.id}`} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px' }}>
                        Start Course Module <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: BROWSE ALL COURSES CATALOG ================= */}
      {activeTab === 'catalog' && (
        <div>
          {/* SEARCH & FILTER CONTROLS BAR */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, alignItems: 'center' }}>
              
              {/* Search Bar Input */}
              <div style={{ position: 'relative' }}>
                <Search size={18} color="#64748B" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search 99 courses by title, skill, description, or keyword..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: 42, fontSize: 14, height: 44, borderRadius: 10 }}
                />
              </div>

              {/* Level Filter Dropdown */}
              <div>
                <select
                  className="form-select"
                  value={selectedLevel}
                  onChange={e => setSelectedLevel(e.target.value)}
                  style={{ height: 44, fontSize: 13, borderRadius: 10 }}
                >
                  <option value="all">All Difficulty Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Domain Category Filter Dropdown */}
              <div>
                <select
                  className="form-select"
                  value={selectedDomain}
                  onChange={e => setSelectedDomain(e.target.value)}
                  style={{ height: 44, fontSize: 13, borderRadius: 10 }}
                >
                  <option value="all">All Course Domains</option>
                  {uniqueDomains.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTop: '1px solid #F1F5F9', fontSize: 13, color: '#64748B' }}>
              <div>
                Showing <strong>{filteredCatalogCourses.length}</strong> of <strong>{allCourses.length}</strong> total domain courses
              </div>
              {(searchQuery || selectedLevel !== 'all' || selectedDomain !== 'all') && (
                <button
                  onClick={() => { setSearchQuery(''); setSelectedLevel('all'); setSelectedDomain('all'); }}
                  style={{ background: 'none', border: 'none', color: '#003087', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}
                >
                  Reset Search & Filters ✕
                </button>
              )}
            </div>
          </div>

          {/* ALL COURSES CATALOG GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {filteredCatalogCourses.map(course => (
              <div key={course.id || course.numericId} className="card" style={{
                padding: 20,
                borderRadius: 14,
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span className={`badge ${course.level?.toLowerCase() === 'beginner' ? 'badge-success' : course.level?.toLowerCase() === 'intermediate' ? 'badge-primary' : 'badge-error'}`}>
                      {course.level || 'Beginner'}
                    </span>
                    <span className="badge badge-gray">{course.domain || 'Domain'}</span>
                  </div>

                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 6, lineHeight: 1.4 }}>
                    {course.title}
                  </h3>

                  <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {course.description}
                  </p>
                </div>

                <div>
                  <div style={{ fontSize: 12, color: '#003087', fontWeight: 700, marginBottom: 12, background: '#EFF6FF', padding: '4px 8px', borderRadius: 6, display: 'inline-block' }}>
                    Skill: {course.competency || 'General Competency'}
                  </div>

                  <Link href={`/dashboard/learn/course?id=${course.id}`} className="btn btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
                    View Course Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredCatalogCourses.length === 0 && (
            <div style={{ padding: '60px 20px', textAlign: 'center', background: '#FFFFFF', borderRadius: 16, border: '1px dashed #CBD5E1' }}>
              <Search size={36} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>No courses matched your search query</div>
              <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Try clearing your search terms or selecting a different level filter.</p>
              <button className="btn btn-primary btn-sm" onClick={() => { setSearchQuery(''); setSelectedLevel('all'); setSelectedDomain('all'); }} style={{ marginTop: 12 }}>
                Clear Search & View All Courses
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
