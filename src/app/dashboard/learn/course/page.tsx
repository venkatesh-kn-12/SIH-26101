'use client';
import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getCurrentUser, UserProfile } from '@/lib/authStorage';
import catalogData from '../../../../../public/content-list-data.json';
import { PlayCircle, FileText, CheckSquare, MessageSquare, Bot, Check, X, ArrowLeft, Send, Sparkles, RefreshCw, Clock, Search, HelpCircle, Target } from 'lucide-react';
import styles from './course.module.css';

interface TranscriptSegment {
  text: string;
  startTime: number;
  duration: number;
  endTime: number;
  formattedTimestamp: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  sources?: Array<{ startTime: number; endTime: number; formattedTimestamp: string; text: string }>;
}

function CoursePageContent() {
  const searchParams = useSearchParams();
  const rawId = searchParams.get('id') || 'c-py-101';

  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'video' | 'transcript' | 'quiz' | 'doubts'>('video');

  // Video State
  const [currentSeekTime, setCurrentSeekTime] = useState<number>(0);

  // Transcript State
  const [transcriptRecord, setTranscriptRecord] = useState<any>(null);
  const [loadingTranscript, setLoadingTranscript] = useState<boolean>(true);
  const [transcriptSearch, setTranscriptSearch] = useState<string>('');

  // AI Chat Q&A State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);

  // Dynamic Quiz State
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState<boolean>(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Match course from catalog dataset or fallback
  const courseData = useMemo(() => {
    const allCourses: any[] = (catalogData as any).content || [];
    const match = allCourses.find(c => c.id === rawId || `c-${c.numericId}` === rawId || c.numericId === Number(rawId));

    return {
      id: match?.id || rawId,
      numericId: match?.numericId || 101,
      title: match?.title || 'Python Domain Mastery — Module 1: Fundamentals',
      description: match?.description || 'A comprehensive introduction to Python programming — covering environment setup, core data types, control flow, functions, and computational libraries.',
      videoId: match?.videoId || 't2_Q2BRzeEE',
      playlistId: match?.playlistId || 'PLGjplNEQ1it8-0CmoljS5yeV-GlKSUEt0',
      duration: match?.duration || '1h 15m',
      provider: 'SkillPath AI — Capacity Building Portal',
      competency: match?.competency || 'Python Programming',
      difficulty: match?.level || 'Beginner',
      domain: match?.domain || 'Data Science & AI Intelligence'
    };
  }, [rawId]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    // Fetch or ingest YouTube video transcript for this course
    async function loadTranscript() {
      try {
        setLoadingTranscript(true);
        const res = await fetch(`/api/courses/transcript?videoId=${courseData.videoId}&courseId=${courseData.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.transcriptRecord) {
            setTranscriptRecord(data.transcriptRecord);
          }
        }
      } catch (err) {
        console.error('Failed to load transcript:', err);
      } finally {
        setLoadingTranscript(false);
      }
    }

    loadTranscript();
  }, [courseData]);

  // Handle Seeking YouTube Iframe Video Player
  const seekToSeconds = (seconds: number) => {
    setCurrentSeekTime(seconds);
    setActiveTab('video');
  };

  // Filtered Complete Transcript
  const segments: TranscriptSegment[] = transcriptRecord?.transcript || [];
  const filteredSegments = useMemo(() => {
    if (!transcriptSearch.trim()) return segments;
    const query = transcriptSearch.toLowerCase();
    return segments.filter(s => s.text.toLowerCase().includes(query) || s.formattedTimestamp.includes(query));
  }, [segments, transcriptSearch]);

  // AI Conversational Q&A Handler ("Ask about this course")
  const sendAskQuestion = async () => {
    if (!chatInput.trim() || isAiTyping) return;

    const userQuestionText = chatInput.trim();
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: userQuestionText,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAiTyping(true);

    try {
      const res = await fetch('/api/courses/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: courseData.videoId,
          courseId: courseData.id,
          question: userQuestionText,
          conversationHistory: chatMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'ai',
          content: data.answer || 'No response returned.',
          timestamp: new Date(),
          sources: data.sources || []
        };
        setChatMessages(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error('Q&A failed:', err);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Load Dynamic Video Quiz
  const loadDynamicQuiz = async () => {
    if (quizQuestions.length > 0) return;
    try {
      setLoadingQuiz(true);
      const res = await fetch('/api/courses/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: courseData.videoId,
          courseId: courseData.id,
          competency: courseData.competency
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.questions) setQuizQuestions(data.questions);
      }
    } catch (err) {
      console.error('Quiz loading failed:', err);
    } finally {
      setLoadingQuiz(false);
    }
  };

  // Submit & Evaluate Quiz (Sync to Competency Evidence Log & Profile)
  const submitQuiz = () => {
    setQuizSubmitted(true);
    let correctCount = 0;
    quizQuestions.forEach((q, i) => {
      if (quizAnswers[i] === q.correctIndex) correctCount += 1;
    });

    const scorePct = Math.round((correctCount / (quizQuestions.length || 1)) * 100);

    if (typeof window !== 'undefined') {
      // 1. Mark Course as Completed in user profile
      try {
        const storedProfile = localStorage.getItem('statpath_user_profile');
        if (storedProfile) {
          const profile = JSON.parse(storedProfile);
          const completedIds: string[] = profile.completedCourseIds || [];
          if (!completedIds.includes(courseData.id)) {
            completedIds.push(courseData.id);
            profile.completedCourseIds = completedIds;
            localStorage.setItem('statpath_user_profile', JSON.stringify(profile));
          }
        }
      } catch (e) {
        console.error(e);
      }

      // 2. Add to Assessment History Evidence Log
      try {
        const storedHistory = localStorage.getItem('statpath_assessment_history');
        const historyList = storedHistory ? JSON.parse(storedHistory) : [];
        historyList.unshift({
          id: `course-quiz-${Date.now()}`,
          title: `Video Mastery Quiz: ${courseData.title}`,
          category: 'Course Completion Quiz',
          competency: courseData.competency,
          score: scorePct,
          correctCount,
          totalQuestions: quizQuestions.length,
          completedAt: new Date().toISOString(),
          evidenceType: 'course_quiz'
        });
        localStorage.setItem('statpath_assessment_history', JSON.stringify(historyList));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const TABS = [
    { id: 'video', label: 'Video Lecture', icon: PlayCircle },
    { id: 'transcript', label: 'Complete Transcript', icon: FileText },
    { id: 'doubts', label: 'Ask About This Course (AI)', icon: Bot },
    { id: 'quiz', label: 'Dynamic Quiz & Competency Evaluation', icon: CheckSquare },
  ] as const;

  return (
    <div>
      {/* Course Header Banner */}
      <div className={styles.courseHeader} style={{ background: '#FFFFFF', padding: 24, borderRadius: 16, border: '1px solid #E2E8F0', marginBottom: 20 }}>
        <Link href="/dashboard/learn" className={styles.backLink} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#003087', fontWeight: 700, marginBottom: 10 }}>
          <ArrowLeft size={16} /> Back to Learning Resources Hub
        </Link>
        
        <h1 className={styles.courseTitle} style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: '4px 0 6px 0' }}>
          {courseData.title}
        </h1>
        <p className={styles.courseDesc} style={{ fontSize: 14, color: '#475569', lineHeight: 1.5, margin: '0 0 14px 0' }}>
          {courseData.description}
        </p>

        <div className={styles.courseTags} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="badge badge-primary">{courseData.competency}</span>
          <span className="badge badge-success">{courseData.difficulty}</span>
          <span style={{ fontSize: 12, background: '#F1F5F9', color: '#475569', padding: '3px 10px', borderRadius: 8, fontWeight: 600 }}>
            ⏱ {courseData.duration}
          </span>
          <span style={{ fontSize: 12, background: '#EFF6FF', color: '#1E40AF', padding: '3px 10px', borderRadius: 8, fontWeight: 700 }}>
            Domain: {courseData.domain}
          </span>
        </div>
      </div>

      {/* Tab Navigation Window */}
      <div className={styles.tabNav} style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '2px solid #E2E8F0', paddingBottom: 2 }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`${styles.tab} ${activeTab === id ? styles.tabActive : ''}`}
            onClick={() => {
              setActiveTab(id as any);
              if (id === 'quiz') loadDynamicQuiz();
            }}
            style={{
              background: activeTab === id ? '#003087' : '#F1F5F9',
              color: activeTab === id ? '#FFFFFF' : '#475569',
              border: 'none',
              borderRadius: '10px 10px 0 0',
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s'
            }}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT AREAS */}
      <div className={styles.tabContent}>
        
        {/* ================= TAB 1: VIDEO LECTURE & PLAYER ================= */}
        {activeTab === 'video' && (
          <div className={styles.videoSection}>
            <div className={styles.videoWrapper} style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 16, border: '1px solid #E2E8F0', background: '#000000' }}>
              <iframe
                src={`https://www.youtube.com/embed/${courseData.videoId}?list=${courseData.playlistId}&autoplay=1${currentSeekTime > 0 ? `&start=${Math.floor(currentSeekTime)}` : ''}`}
                title={courseData.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className={styles.videoIframe}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </div>

            {currentSeekTime > 0 && (
              <div style={{ marginTop: 12, background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '10px 16px', borderRadius: 10, fontSize: 13, color: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Seeking video player to timestamp: <strong>{Math.floor(currentSeekTime / 60)}m {Math.floor(currentSeekTime % 60)}s</strong></span>
                <button className="btn btn-secondary btn-sm" onClick={() => setCurrentSeekTime(0)}>Reset Seek</button>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: COMPLETE TRANSCRIPT SECTION ================= */}
        {activeTab === 'transcript' && (
          <div className="card" style={{ padding: 28, borderRadius: 20, border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  📜 Complete Video Transcript ({segments.length} Segments)
                </h2>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                  Click any timestamp to jump directly to that exact moment in the video.
                </div>
              </div>

              {/* Transcript Search Bar */}
              <div style={{ position: 'relative', width: 280 }}>
                <Search size={16} color="#64748B" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search transcript text or timestamp..."
                  value={transcriptSearch}
                  onChange={e => setTranscriptSearch(e.target.value)}
                  style={{ paddingLeft: 36, height: 38, fontSize: 13, borderRadius: 8 }}
                />
              </div>
            </div>

            {loadingTranscript ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <RefreshCw size={32} color="#003087" className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
                <div style={{ fontWeight: 700, color: '#0F172A' }}>Extracting & Indexing Video Transcript...</div>
              </div>
            ) : filteredSegments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 520, overflowY: 'auto', paddingRight: 8 }}>
                {filteredSegments.map((seg, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 14,
                      padding: '10px 14px',
                      background: '#F8FAFC',
                      borderRadius: 10,
                      border: '1px solid #E2E8F0',
                      transition: 'background 0.2s'
                    }}
                  >
                    <button
                      onClick={() => seekToSeconds(seg.startTime)}
                      style={{
                        background: '#003087',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 6,
                        padding: '4px 10px',
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: 'pointer',
                        flexShrink: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                      title="Click to play video from this timestamp"
                    >
                      <Clock size={12} /> {seg.formattedTimestamp}
                    </button>

                    <p style={{ fontSize: 14, color: '#1E293B', margin: 0, lineHeight: 1.5, flex: 1 }}>
                      {seg.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', background: '#F8FAFC', borderRadius: 12, border: '1px dashed #CBD5E1' }}>
                <HelpCircle size={32} color="#94A3B8" style={{ margin: '0 auto 8px auto' }} />
                <div style={{ fontWeight: 700, color: '#0F172A' }}>Transcript Unavailable or No Matching Text</div>
                <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>No transcript text matched your search filter "{transcriptSearch}".</p>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: ASK ABOUT THIS COURSE (AI Q&A SECTION) ================= */}
        {activeTab === 'doubts' && (
          <div className="card" style={{ padding: 28, borderRadius: 20, border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Bot size={22} color="#003087" />
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Ask About This Course with AI
                </h2>
                <div style={{ fontSize: 12, color: '#64748B' }}>
                  Ask any question about this video. Answers are grounded in the video transcript via Qdrant vector retrieval.
                </div>
              </div>
            </div>

            {/* Chat Messages History */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 14,
              padding: 20,
              minHeight: 280,
              maxHeight: 420,
              overflowY: 'auto',
              marginBottom: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 14
            }}>
              {chatMessages.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
                  <Sparkles size={36} color="#FF9933" style={{ margin: '0 auto 10px auto' }} />
                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: 15 }}>Ask anything about this video lecture!</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>Example: "What does the instructor explain about variables?" or "Summarize the key concepts."</div>
                </div>
              )}

              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: msg.role === 'user' ? '#003087' : '#FFFFFF',
                    color: msg.role === 'user' ? '#FFFFFF' : '#1E293B',
                    padding: '14px 18px',
                    borderRadius: msg.role === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                    border: msg.role === 'user' ? 'none' : '1px solid #E2E8F0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4, fontWeight: 700 }}>
                    {msg.role === 'user' ? 'You' : '🤖 SkillPath AI Learning Assistant'}
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {msg.content}
                  </div>

                  {/* Clickable Video Timestamp Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #E2E8F0', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>📍 Video Sources:</span>
                      {msg.sources.map((src, i) => (
                        <button
                          key={i}
                          onClick={() => seekToSeconds(src.startTime)}
                          style={{
                            background: '#EFF6FF',
                            color: '#1E40AF',
                            border: '1px solid #BFDBFE',
                            fontSize: 11,
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                          title={`Click to seek video to ${src.formattedTimestamp}`}
                        >
                          <Clock size={11} /> {src.formattedTimestamp}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isAiTyping && (
                <div style={{ alignSelf: 'flex-start', background: '#FFFFFF', padding: '12px 16px', borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 13, color: '#64748B', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <RefreshCw size={16} className="animate-spin" color="#003087" />
                  <span>Searching Qdrant vector transcript & generating answer...</span>
                </div>
              )}
            </div>

            {/* Input Box */}
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Ask any question about this video..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendAskQuestion()}
                style={{ flex: 1, height: 44, fontSize: 14, borderRadius: 10 }}
              />
              <button
                className="btn btn-primary"
                onClick={sendAskQuestion}
                disabled={!chatInput.trim() || isAiTyping}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 22px', borderRadius: 10, fontWeight: 800 }}
              >
                Ask AI <Send size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 4: DYNAMIC QUIZ & COMPETENCY EVALUATION ================= */}
        {activeTab === 'quiz' && (
          <div className="card" style={{ padding: 32, borderRadius: 20, border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  ✍️ Dynamic Video Quiz & Competency Evaluation
                </h2>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                  Questions generated dynamically from this video's transcript. Passing score updates your competency map evidence log!
                </div>
              </div>
            </div>

            {loadingQuiz ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <RefreshCw size={36} color="#003087" className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
                <div style={{ fontWeight: 800, color: '#0F172A', fontSize: 16 }}>Generating Dynamic Quiz Grounded in Video Transcript...</div>
              </div>
            ) : !quizSubmitted ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {quizQuestions.map((q, idx) => (
                  <div key={idx} style={{ background: '#F8FAFC', padding: 20, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A', marginBottom: 12 }}>
                      Q{idx + 1}. {q.question}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {q.options.map((opt: string, optIdx: number) => {
                        const isSelected = quizAnswers[idx] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => setQuizAnswers({ ...quizAnswers, [idx]: optIdx })}
                            style={{
                              background: isSelected ? '#EFF6FF' : '#FFFFFF',
                              border: `2px solid ${isSelected ? '#003087' : '#CBD5E1'}`,
                              borderRadius: 10,
                              padding: '12px 16px',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: 14,
                              color: isSelected ? '#003087' : '#1E293B',
                              fontWeight: isSelected ? 700 : 500,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12
                            }}
                          >
                            <span style={{ width: 26, height: 26, borderRadius: 6, background: isSelected ? '#003087' : '#F1F5F9', color: isSelected ? '#FFFFFF' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <button
                  className="btn btn-primary btn-lg"
                  onClick={submitQuiz}
                  disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                  style={{ width: '100%', borderRadius: 12, fontWeight: 800 }}
                >
                  Submit Video Mastery Quiz & Sync Competency Log ✓
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 32, background: '#FFFFFF' }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Course Quiz Completed!</h3>
                <div style={{ fontSize: 16, color: '#003087', fontWeight: 800, marginBottom: 16 }}>
                  Score: {quizQuestions.filter((q, i) => quizAnswers[i] === q.correctIndex).length} / {quizQuestions.length} Correct
                </div>

                <div style={{ background: '#DCFCE7', color: '#14532D', padding: '14px 20px', borderRadius: 12, border: '1px solid #86EFAC', fontSize: 14, fontWeight: 700, marginBottom: 20 }}>
                  ✓ Course marked as completed in your profile! Stored in your Knowledge Evidence Log.
                </div>

                <button className="btn btn-primary" onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }}>
                  Retake Quiz
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CoursePage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <RefreshCw size={36} color="#003087" className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
        <div style={{ fontWeight: 800, color: '#0F172A', fontSize: 16 }}>Loading Course & Transcript Player...</div>
      </div>
    }>
      <CoursePageContent />
    </Suspense>
  );
}
