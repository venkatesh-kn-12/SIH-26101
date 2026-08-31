'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getCurrentUser, UserProfile } from '@/lib/authStorage';
import styles from './course.module.css';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const COURSE_DATA = {
  id: 'python-basics-01',
  title: 'Python for Statistical Officers — Module 1: Introduction',
  description: 'Learn the fundamentals of Python programming tailored for statistical analysis in government departments. This module covers variables, data types, basic operations, and your first Python script.',
  videoId: 't2_Q2BRzeEE',
  playlistId: 'PLGjplNEQ1it8-0CmoljS5yeV-GlKSUEt0',
  duration: '45 min',
  provider: 'StatPath AI Curated',
  competency: 'Python Programming',
  difficulty: 'Beginner',
  topics: ['Variables & Data Types', 'Basic Operations', 'Print Statements', 'Python Setup', 'First Script'],
  transcript: `Welcome to this Python for Beginners tutorial. Python is a high-level, interpreted programming language known for its simplicity and readability. It is widely used in data science, statistics, machine learning, web development, and automation.

In this module, we will cover:
1. What is Python and why it matters for statistical work
2. Installing Python and setting up your development environment  
3. Variables and Data Types — integers, floats, strings, booleans
4. Basic arithmetic operations — addition, subtraction, multiplication, division
5. Print statements and basic input/output
6. Writing your first Python script

Python is particularly valuable for statistical officers because it can automate repetitive data processing tasks, perform complex statistical analyses, create data visualizations, and handle large datasets efficiently. Libraries like pandas, numpy, and matplotlib make Python an indispensable tool for modern statistical work.

Variables in Python are containers for storing data values. Unlike other programming languages, Python has no command for declaring a variable. A variable is created the moment you first assign a value to it. For example: x = 5, name = "Statistical Officer", pi = 3.14159.

Data types include: int (integer numbers), float (decimal numbers), str (text strings), bool (True/False), list (ordered collections), dict (key-value pairs), and tuple (immutable ordered collections).

Basic operations include arithmetic (+, -, *, /, //, %, **), comparison (==, !=, <, >, <=, >=), and logical operators (and, or, not).

The print() function outputs text to the console. For example: print("Hello, Statistical Officer!"). You can also use f-strings for formatted output: name = "Priya"; print(f"Welcome, {name}!").`
};

const SAMPLE_QUIZ: QuizQuestion[] = [
  {
    question: 'What type of programming language is Python?',
    options: ['Low-level compiled language', 'High-level interpreted language', 'Assembly language', 'Machine code language'],
    correctIndex: 1,
    explanation: 'Python is a high-level, interpreted programming language known for its simplicity and readability.'
  },
  {
    question: 'Which of the following is NOT a Python data type?',
    options: ['int', 'float', 'varchar', 'bool'],
    correctIndex: 2,
    explanation: 'varchar is a SQL data type, not Python. Python uses str for text strings.'
  },
  {
    question: 'How do you create a variable in Python?',
    options: ['var x = 5', 'int x = 5', 'x = 5', 'declare x = 5'],
    correctIndex: 2,
    explanation: 'In Python, variables are created by simply assigning a value. No declaration keyword is needed.'
  },
  {
    question: 'Which Python library is commonly used for statistical data analysis?',
    options: ['React', 'pandas', 'Bootstrap', 'jQuery'],
    correctIndex: 1,
    explanation: 'pandas is the primary Python library for data manipulation and statistical analysis.'
  },
  {
    question: 'What does the print() function do in Python?',
    options: ['Prints a physical document', 'Outputs text to the console', 'Creates a new variable', 'Imports a module'],
    correctIndex: 1,
    explanation: 'The print() function outputs text or variable values to the console/terminal.'
  }
];

const AI_RESPONSES: Record<string, string> = {
  'default': 'Based on the video content, I can help you understand Python fundamentals. Could you be more specific about which concept you\'d like me to explain? I can help with variables, data types, operations, or any other topic covered in this module.',
  'variable': 'A **variable** in Python is a container that stores data values. Unlike many other languages, Python doesn\'t require you to declare a variable before using it. You simply assign a value:\n\n```python\nx = 5          # integer\nname = "Officer"  # string\npi = 3.14      # float\nis_active = True  # boolean\n```\n\nVariable names must start with a letter or underscore, and can contain letters, numbers, and underscores.',
  'data type': 'Python has several built-in **data types**:\n\n- **int**: Whole numbers (e.g., `42`, `-7`)\n- **float**: Decimal numbers (e.g., `3.14`, `-0.5`)\n- **str**: Text strings (e.g., `"Hello"`)\n- **bool**: Boolean values (`True` or `False`)\n- **list**: Ordered, mutable collections (e.g., `[1, 2, 3]`)\n- **dict**: Key-value pairs (e.g., `{"name": "Priya"}`)\n- **tuple**: Ordered, immutable collections (e.g., `(1, 2, 3)`)\n\nYou can check a variable\'s type using `type(variable_name)`.',
  'print': 'The **print()** function displays output to the console:\n\n```python\nprint("Hello, World!")\nprint(42)\nprint(f"Score: {score}%")  # f-string formatting\nprint("Name:", name, "Age:", age)  # multiple values\n```\n\nf-strings (formatted string literals) are the modern way to embed variables in strings.',
  'pandas': '**pandas** is Python\'s most popular data analysis library. For statistical officers, it\'s essential for:\n\n```python\nimport pandas as pd\n\n# Read data\ndf = pd.read_csv("census_data.csv")\n\n# Basic statistics\ndf.describe()  # summary statistics\ndf.mean()      # column means\ndf.groupby("state").sum()  # grouped aggregation\n```\n\nIt handles tabular data similar to Excel but with much more power and automation capabilities.',
  'statistical': 'Python is valuable for **statistical officers** because it can:\n\n1. **Automate** repetitive data processing tasks\n2. **Analyze** large datasets that Excel cannot handle\n3. **Visualize** data using matplotlib, seaborn\n4. **Clean** messy survey data efficiently\n5. **Report** generate automated statistical reports\n\nKey libraries: `pandas` (data), `numpy` (computation), `scipy` (statistics), `matplotlib` (visualization).',
  'install': 'To **install Python**:\n\n1. Visit [python.org](https://python.org) and download the latest version\n2. During installation, check "Add Python to PATH"\n3. Verify: Open terminal and type `python --version`\n4. Install packages: `pip install pandas numpy matplotlib`\n\nFor a better experience, install **VS Code** or **Jupyter Notebook** as your code editor.'
};

function getAIResponse(question: string): string {
  const lower = question.toLowerCase();
  for (const [key, response] of Object.entries(AI_RESPONSES)) {
    if (key !== 'default' && lower.includes(key)) return response;
  }
  if (lower.includes('what') || lower.includes('how') || lower.includes('why') || lower.includes('explain')) {
    return `Great question! Based on the video content about Python fundamentals:\n\n${AI_RESPONSES['default']}\n\nThe video covers variables, data types, basic operations, print statements, and setting up Python — all essential for your role as a statistical officer.`;
  }
  return AI_RESPONSES['default'];
}

export default function CoursePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'video' | 'transcript' | 'quiz' | 'doubts'>('video');
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const quizScore = quizSubmitted
    ? SAMPLE_QUIZ.filter((q, i) => quizAnswers[i] === q.correctIndex).length
    : 0;

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: chatInput.trim(), timestamp: new Date() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAiTyping(true);

    setTimeout(() => {
      const aiResponse = getAIResponse(userMsg.content);
      const aiMsg: ChatMessage = { role: 'ai', content: aiResponse, timestamp: new Date() };
      setChatMessages(prev => [...prev, aiMsg]);
      setIsAiTyping(false);
    }, 800 + Math.random() * 700);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div>
      {/* Course Header */}
      <div className={styles.courseHeader}>
        <Link href="/dashboard/learn" className={styles.backLink}>← Back to Learning Path</Link>
        <div className={styles.courseHeaderContent}>
          <div>
            <h1 className={styles.courseTitle}>{COURSE_DATA.title}</h1>
            <p className={styles.courseDesc}>{COURSE_DATA.description}</p>
            <div className={styles.courseTags}>
              <span className="badge badge-primary">{COURSE_DATA.competency}</span>
              <span className="badge badge-success">{COURSE_DATA.difficulty}</span>
              <span className="badge badge-gray">{COURSE_DATA.duration}</span>
              <span className="badge badge-gray">{COURSE_DATA.provider}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNav}>
        {[
          { id: 'video', label: 'Video Lecture', icon: '▶' },
          { id: 'transcript', label: 'AI Transcript', icon: '📄' },
          { id: 'quiz', label: 'Generate Quiz', icon: '📝' },
          { id: 'doubts', label: 'Ask Doubts', icon: '💬' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>

        {/* VIDEO TAB */}
        {activeTab === 'video' && (
          <div className={styles.videoSection}>
            <div className={styles.videoWrapper}>
              <iframe
                src={`https://www.youtube.com/embed/${COURSE_DATA.videoId}?list=${COURSE_DATA.playlistId}&rel=0`}
                title={COURSE_DATA.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className={styles.videoIframe}
              />
            </div>
            <div className={styles.videoMeta}>
              <div className={styles.topicsList}>
                <h3>Topics Covered</h3>
                <div className={styles.topicChips}>
                  {COURSE_DATA.topics.map(t => (
                    <span key={t} className={styles.topicChip}>{t}</span>
                  ))}
                </div>
              </div>
              <div className={styles.courseProgress}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Course Progress</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '0%' }} />
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>0% — Start watching to track progress</div>
              </div>
            </div>
          </div>
        )}

        {/* TRANSCRIPT TAB */}
        {activeTab === 'transcript' && (
          <div className={styles.transcriptSection}>
            <div className={styles.transcriptHeader}>
              <h3>AI-Generated Transcript</h3>
              <span className="badge badge-primary" style={{ fontSize: 11 }}>Auto-Transcribed</span>
            </div>
            <div className={styles.transcriptBody}>
              {COURSE_DATA.transcript.split('\n\n').map((para, i) => (
                <p key={i} className={styles.transcriptPara}>{para}</p>
              ))}
            </div>
            <div className={styles.transcriptActions}>
              <p style={{ fontSize: 12, color: '#64748B', fontStyle: 'italic' }}>
                This transcript is auto-generated from the video content using AI. Use it for quick reference, quiz generation, and doubt resolution.
              </p>
            </div>
          </div>
        )}

        {/* QUIZ TAB */}
        {activeTab === 'quiz' && (
          <div className={styles.quizSection}>
            {!quizStarted ? (
              <div className={styles.quizStart}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
                <h3>Generate Quiz from Video Content</h3>
                <p>StatPath AI will generate a {SAMPLE_QUIZ.length}-question quiz based on the video transcript to test your understanding of Python fundamentals.</p>
                <button className="btn btn-primary" onClick={() => setQuizStarted(true)}>
                  Generate Quiz
                </button>
              </div>
            ) : !quizSubmitted ? (
              <div>
                <div className={styles.quizHeader}>
                  <h3>Python Fundamentals Quiz</h3>
                  <span className="badge badge-gray">{Object.keys(quizAnswers).length} / {SAMPLE_QUIZ.length} answered</span>
                </div>
                {SAMPLE_QUIZ.map((q, qi) => (
                  <div key={qi} className={styles.quizQuestion}>
                    <div className={styles.qqNum}>Q{qi + 1}</div>
                    <div className={styles.qqText}>{q.question}</div>
                    <div className={styles.qqOptions}>
                      {q.options.map((opt, oi) => (
                        <button
                          key={oi}
                          className={`${styles.qqOption} ${quizAnswers[qi] === oi ? styles.qqSelected : ''}`}
                          onClick={() => setQuizAnswers({ ...quizAnswers, [qi]: oi })}
                        >
                          <span className={styles.qqLetter}>{String.fromCharCode(65 + oi)}</span>
                          <span>{opt}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: 16 }}
                  disabled={Object.keys(quizAnswers).length < SAMPLE_QUIZ.length}
                  onClick={() => setQuizSubmitted(true)}
                >
                  Submit Quiz ({Object.keys(quizAnswers).length}/{SAMPLE_QUIZ.length})
                </button>
              </div>
            ) : (
              <div>
                <div className={styles.quizResult}>
                  <div style={{ fontSize: 48 }}>{quizScore >= 4 ? '🎉' : quizScore >= 3 ? '📊' : '📖'}</div>
                  <h3>Quiz Complete — {quizScore}/{SAMPLE_QUIZ.length} Correct ({Math.round((quizScore / SAMPLE_QUIZ.length) * 100)}%)</h3>
                  <p>{quizScore >= 4 ? 'Excellent understanding of Python fundamentals!' : quizScore >= 3 ? 'Good foundation. Review the topics you missed.' : 'Consider re-watching the video and reviewing the transcript.'}</p>
                </div>
                {SAMPLE_QUIZ.map((q, qi) => {
                  const isCorrect = quizAnswers[qi] === q.correctIndex;
                  return (
                    <div key={qi} className={`${styles.quizQuestion} ${isCorrect ? styles.qqCorrectBg : styles.qqWrongBg}`}>
                      <div className={styles.qqNum} style={{ background: isCorrect ? '#22c55e' : '#ef4444' }}>
                        {isCorrect ? '✓' : '✕'}
                      </div>
                      <div className={styles.qqText}>{q.question}</div>
                      <div style={{ fontSize: 13, marginTop: 8 }}>
                        <div style={{ color: isCorrect ? '#15803D' : '#991B1B', fontWeight: 600 }}>
                          {isCorrect ? 'Correct!' : `Incorrect. Your answer: ${q.options[quizAnswers[qi]]}`}
                        </div>
                        <div style={{ color: '#003087', fontWeight: 600, marginTop: 2 }}>
                          Answer: {q.options[q.correctIndex]}
                        </div>
                        <div style={{ color: '#64748B', marginTop: 4, fontStyle: 'italic' }}>
                          {q.explanation}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <button className="btn btn-secondary" style={{ width: '100%', marginTop: 16 }}
                  onClick={() => { setQuizStarted(false); setQuizSubmitted(false); setQuizAnswers({}); }}>
                  Retake Quiz
                </button>
              </div>
            )}
          </div>
        )}

        {/* DOUBTS TAB */}
        {activeTab === 'doubts' && (
          <div className={styles.doubtsSection}>
            <div className={styles.chatHeader}>
              <div>
                <h3>Ask Doubts — AI Tutor</h3>
                <p>Ask any question about the video content. The AI tutor will answer based on the transcript and Python knowledge.</p>
              </div>
            </div>
            <div className={styles.chatBody}>
              {chatMessages.length === 0 && (
                <div className={styles.chatEmpty}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#334155' }}>AI Tutor Ready</div>
                  <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4, lineHeight: 1.6 }}>
                    Ask me anything about the Python video lecture — variables, data types, operations, setup, or any concept you need clarified.
                  </div>
                  <div className={styles.suggestedQuestions}>
                    {['What are Python data types?', 'How do I install Python?', 'Why is Python useful for statistical officers?', 'Explain variables in Python'].map(q => (
                      <button key={q} className={styles.suggestedQ} onClick={() => { setChatInput(q); }}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`${styles.chatMsg} ${msg.role === 'user' ? styles.chatUser : styles.chatAi}`}>
                  <div className={styles.chatAvatar}>
                    {msg.role === 'user' ? (user?.name?.[0] || 'U') : '🤖'}
                  </div>
                  <div className={styles.chatBubble}>
                    <div className={styles.chatRole}>{msg.role === 'user' ? (user?.name || 'You') : 'AI Tutor'}</div>
                    <div className={styles.chatText}>{msg.content.split('\n').map((line, li) => (
                      <span key={li}>{line}<br /></span>
                    ))}</div>
                  </div>
                </div>
              ))}
              {isAiTyping && (
                <div className={`${styles.chatMsg} ${styles.chatAi}`}>
                  <div className={styles.chatAvatar}>🤖</div>
                  <div className={styles.chatBubble}>
                    <div className={styles.chatRole}>AI Tutor</div>
                    <div className={styles.typingIndicator}>
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className={styles.chatInput}>
              <input
                type="text"
                placeholder="Type your question about the video content..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="form-input"
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={sendMessage} disabled={!chatInput.trim() || isAiTyping}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
