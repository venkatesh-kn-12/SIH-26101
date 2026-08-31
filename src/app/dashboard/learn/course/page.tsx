'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getCurrentUser, UserProfile } from '@/lib/authStorage';
import styles from './course.module.css';

interface QuizQuestion { question: string; options: string[]; correctIndex: number; explanation: string; }
interface ChatMessage { role: 'user' | 'ai'; content: string; timestamp: Date; }

const COURSE = {
  title: 'Python for Statistical Officers — Module 1: Fundamentals',
  description: 'A comprehensive introduction to Python programming for official statistical systems — covering environment setup, core data types, control flow, functions, and statistical libraries.',
  videoId: 't2_Q2BRzeEE',
  playlistId: 'PLGjplNEQ1it8-0CmoljS5yeV-GlKSUEt0',
  duration: '1h 15m',
  provider: 'StatPath AI — MoSPI Training Division',
  competency: 'Python Programming',
  difficulty: 'Beginner',
  topics: ['Environment Setup', 'Variables & Data Types', 'Operators & Expressions', 'Control Flow', 'Functions', 'Lists & Dictionaries', 'File I/O', 'pandas Introduction', 'Statistical Libraries', 'Best Practices'],
};

const TRANSCRIPT = `Python is a high-level, interpreted programming language created by Guido van Rossum and first released in 1991. It emphasises code readability with its notable use of significant whitespace and a design philosophy that favours simplicity and clarity. For statistical officers working in the Ministry of Statistics and Programme Implementation (MoSPI), Python has become an essential tool for data processing, analysis, and automation of routine statistical workflows.

This module begins with setting up your Python development environment. You can download Python from python.org — ensure you select the latest stable release (Python 3.12 or later). During installation on Windows, always tick the checkbox "Add Python to PATH". After installation, verify by opening Command Prompt and typing: python --version. For a more productive experience, install Visual Studio Code (VS Code) as your code editor and add the Python extension.

Variables are fundamental building blocks in Python. A variable is a named reference to a value stored in memory. Unlike languages such as Java or C++, Python does not require explicit type declarations — the interpreter infers the type automatically. For example: population = 140000000 creates an integer, growth_rate = 1.2 creates a float, state_name = "Maharashtra" creates a string, and is_metro = True creates a boolean. Variable names must begin with a letter or underscore, are case-sensitive, and should follow the snake_case convention (e.g., total_population, avg_income).

Python supports several core data types. Integers (int) represent whole numbers without decimal points — useful for counts like household_count = 5420. Floats (float) represent decimal numbers — essential for rates and indices like cpi_index = 178.45. Strings (str) represent text data — used for labels, names, and categorical variables like district = "Pune". Booleans (bool) represent True or False — used in conditional logic like is_urban = True.

Collections in Python include Lists, Tuples, Dictionaries, and Sets. A List is an ordered, mutable sequence: states = ["Maharashtra", "Karnataka", "Tamil Nadu"]. You access elements by index (states[0] gives "Maharashtra") and can add items with states.append("Kerala"). A Tuple is similar but immutable: coordinates = (19.07, 72.87). A Dictionary stores key-value pairs: census = {"year": 2021, "population": 1400000000, "growth_rate": 1.2}. You access values by key: census["population"].

Operators in Python include arithmetic operators (+, -, *, /, // for integer division, % for modulus, ** for power), comparison operators (==, !=, <, >, <=, >=), logical operators (and, or, not), and assignment operators (=, +=, -=, *=). For statistical work, you frequently use arithmetic operators: per_capita = total_gdp / population, and comparison operators for data filtering: if income > threshold.

Control flow statements direct the execution of your programme. The if-elif-else statement handles conditional logic: if score >= 90: grade = "A" elif score >= 70: grade = "B" else: grade = "C". The for loop iterates over sequences: for state in states: print(state). The while loop repeats while a condition is true: while count < 100: count += 1. The range() function generates number sequences: for i in range(1, 11): print(i) prints numbers 1 through 10.

Functions are reusable blocks of code defined with the def keyword. A function can accept parameters and return values: def calculate_growth_rate(current, previous): return ((current - previous) / previous) * 100. Call it as: rate = calculate_growth_rate(1400, 1210). Functions promote code reuse, readability, and testing. Python also supports default parameters: def greet(name, title="Officer"): return f"Welcome, {title} {name}".

File Input/Output (I/O) is critical for statistical work. Reading a CSV file: with open("data.csv", "r") as f: content = f.read(). Writing results: with open("output.txt", "w") as f: f.write("Analysis complete"). The with statement ensures proper file closure. For structured data, pandas provides superior file handling: import pandas as pd; df = pd.read_csv("survey_data.csv").

The pandas library is the cornerstone of data analysis in Python. A DataFrame is a two-dimensional tabular data structure: df = pd.DataFrame({"State": ["MH", "KA"], "Population": [112, 61]}). Key operations include: df.head() to preview data, df.describe() for summary statistics, df.groupby("State").mean() for grouped aggregations, df[df["Population"] > 50] for filtering, and df.to_csv("output.csv") for export. For statistical officers, pandas replaces hours of manual spreadsheet work with a few lines of code.

Additional statistical libraries include NumPy for numerical computing (import numpy as np; np.mean(data), np.std(data)), SciPy for advanced statistics (from scipy import stats; stats.ttest_ind(group1, group2)), and Matplotlib for data visualisation (import matplotlib.pyplot as plt; plt.bar(states, populations); plt.show()). These libraries form the Python data science stack essential for modern statistical practice.

Best practices for Python in government statistical work include: always use virtual environments (python -m venv myenv) to isolate project dependencies, maintain a requirements.txt file listing all packages, write docstrings for every function, use meaningful variable names that reflect statistical terminology, version control your code with Git, and follow PEP 8 style guidelines for consistent, readable code across your division.`;

const QUIZ: QuizQuestion[] = [
  { question: 'What type of programming language is Python?', options: ['Low-level compiled language', 'High-level interpreted language', 'Assembly language', 'Markup language'], correctIndex: 1, explanation: 'Python is a high-level, interpreted language created by Guido van Rossum, known for its readability and simplicity.' },
  { question: 'Which command verifies Python is installed correctly?', options: ['python --check', 'pip verify', 'python --version', 'py --status'], correctIndex: 2, explanation: 'Running "python --version" in the terminal displays the installed Python version.' },
  { question: 'What is the correct way to create a float variable in Python?', options: ['float growth_rate = 1.2', 'var growth_rate: 1.2', 'growth_rate = 1.2', 'let growth_rate = 1.2'], correctIndex: 2, explanation: 'Python uses dynamic typing — simply assign a decimal value and it becomes a float automatically.' },
  { question: 'Which Python data structure stores key-value pairs?', options: ['List', 'Tuple', 'Dictionary', 'Set'], correctIndex: 2, explanation: 'Dictionaries use curly braces with key-value pairs, e.g., {"year": 2021, "population": 1400000000}.' },
  { question: 'What does the // operator do in Python?', options: ['Regular division', 'Exponentiation', 'Integer (floor) division', 'Modulus'], correctIndex: 2, explanation: 'The // operator performs integer division, discarding the decimal part (e.g., 7 // 2 = 3).' },
  { question: 'Which keyword is used to define a function in Python?', options: ['function', 'func', 'def', 'define'], correctIndex: 2, explanation: 'Functions are defined using the "def" keyword followed by the function name and parameters.' },
  { question: 'What does df.describe() do in pandas?', options: ['Describes the file format', 'Generates summary statistics for numerical columns', 'Prints all rows', 'Exports to CSV'], correctIndex: 1, explanation: 'df.describe() returns count, mean, std, min, quartiles, and max for each numerical column.' },
  { question: 'Which library is used for numerical computing in Python?', options: ['pandas', 'NumPy', 'Flask', 'Django'], correctIndex: 1, explanation: 'NumPy (Numerical Python) provides support for arrays, matrices, and mathematical functions.' },
  { question: 'What is the recommended naming convention for Python variables?', options: ['camelCase', 'PascalCase', 'snake_case', 'UPPER_CASE'], correctIndex: 2, explanation: 'PEP 8 recommends snake_case for variable and function names (e.g., total_population, avg_income).' },
  { question: 'Why should government statistical officers use virtual environments?', options: ['To run Python faster', 'To isolate project dependencies and avoid conflicts', 'To encrypt data', 'To connect to databases'], correctIndex: 1, explanation: 'Virtual environments isolate project dependencies, ensuring reproducibility and avoiding version conflicts across projects.' },
];

const AI_KB: Record<string, string> = {
  'variable': '**Variables** in Python are named references to values in memory. No type declaration is needed:\n\n```python\npopulation = 140000000   # int\ngrowth_rate = 1.2        # float\nstate = "Maharashtra"    # str\nis_urban = True          # bool\n```\n\nFollow snake_case naming convention (PEP 8). Variable names are case-sensitive.',
  'data type': 'Python core **data types**:\n• **int** — whole numbers: `household_count = 5420`\n• **float** — decimals: `cpi_index = 178.45`\n• **str** — text: `district = "Pune"`\n• **bool** — True/False: `is_metro = True`\n• **list** — ordered, mutable: `[1, 2, 3]`\n• **dict** — key-value: `{"year": 2021}`\n• **tuple** — ordered, immutable: `(19.07, 72.87)`\n\nCheck type with `type(variable_name)`.',
  'list': '**Lists** are ordered, mutable sequences:\n\n```python\nstates = ["Maharashtra", "Karnataka", "Tamil Nadu"]\nstates[0]           # "Maharashtra"\nstates.append("Kerala")\nlen(states)          # 4\n```\n\nUseful methods: `.append()`, `.remove()`, `.sort()`, `.reverse()`, list comprehensions: `[x*2 for x in range(5)]`.',
  'dict': '**Dictionaries** store key-value pairs:\n\n```python\ncensus = {\n  "year": 2021,\n  "population": 1400000000,\n  "growth_rate": 1.2\n}\ncensus["population"]    # 1400000000\ncensus.keys()           # dict_keys\ncensus.get("year", "N/A")\n```',
  'function': '**Functions** are reusable code blocks:\n\n```python\ndef calculate_growth(current, previous):\n    """Calculate percentage growth rate."""\n    return ((current - previous) / previous) * 100\n\nrate = calculate_growth(1400, 1210)  # ~15.7%\n```\n\nUse docstrings, type hints, and default parameters for production code.',
  'pandas': '**pandas** — the data analysis library:\n\n```python\nimport pandas as pd\ndf = pd.read_csv("survey.csv")\ndf.head()                    # first 5 rows\ndf.describe()                # summary stats\ndf.groupby("State").mean()   # grouped means\ndf[df["Pop"] > 50000000]     # filtering\ndf.to_csv("output.csv")      # export\n```',
  'loop': '**Loops** in Python:\n\n```python\n# for loop\nfor state in states:\n    print(state)\n\n# range-based\nfor i in range(1, 11):\n    print(i)\n\n# while loop\ncount = 0\nwhile count < 100:\n    count += 1\n```\n\nUse `break` to exit early, `continue` to skip iterations.',
  'if': '**Conditional statements**:\n\n```python\nif score >= 90:\n    grade = "A"\nelif score >= 70:\n    grade = "B"\nelse:\n    grade = "C"\n```\n\nCombine with logical operators: `if age > 18 and is_citizen:`',
  'install': 'To **set up Python**:\n1. Download from python.org (v3.12+)\n2. Check "Add Python to PATH" during install\n3. Verify: `python --version`\n4. Install VS Code + Python extension\n5. Create virtual env: `python -m venv myenv`\n6. Install packages: `pip install pandas numpy matplotlib`',
  'numpy': '**NumPy** — numerical computing:\n\n```python\nimport numpy as np\ndata = [23, 45, 67, 89, 12]\nnp.mean(data)   # 47.2\nnp.std(data)    # 28.17\nnp.median(data) # 45.0\narr = np.array(data)\n```',
  'matplotlib': '**Matplotlib** — data visualisation:\n\n```python\nimport matplotlib.pyplot as plt\nstates = ["MH", "KA", "TN"]\npop = [112, 61, 72]\nplt.bar(states, pop)\nplt.xlabel("State")\nplt.ylabel("Population (M)")\nplt.title("State Population")\nplt.show()\n```',
  'file': '**File I/O** in Python:\n\n```python\n# Reading\nwith open("data.csv", "r") as f:\n    content = f.read()\n\n# Writing\nwith open("report.txt", "w") as f:\n    f.write("Analysis complete")\n\n# pandas CSV\ndf = pd.read_csv("survey.csv")\ndf.to_csv("output.csv", index=False)\n```',
  'default': 'I can help you understand any concept from this Python module. Try asking about:\n• Variables & data types\n• Lists, dictionaries, tuples\n• Functions & control flow\n• pandas & data analysis\n• NumPy, Matplotlib\n• File handling\n• Installation & setup',
};

function getAIResponse(q: string): string {
  const lower = q.toLowerCase();
  for (const [key, resp] of Object.entries(AI_KB)) {
    if (key !== 'default' && lower.includes(key)) return resp;
  }
  if (lower.includes('operator') || lower.includes('arithmetic')) return 'Python **operators**:\n• Arithmetic: `+`, `-`, `*`, `/`, `//` (floor div), `%` (mod), `**` (power)\n• Comparison: `==`, `!=`, `<`, `>`, `<=`, `>=`\n• Logical: `and`, `or`, `not`\n• Assignment: `=`, `+=`, `-=`, `*=`\n\nExample: `per_capita = total_gdp / population`';
  if (lower.includes('best practice') || lower.includes('pep')) return 'Python **best practices** for government work:\n1. Use virtual environments: `python -m venv myenv`\n2. Maintain `requirements.txt`\n3. Write docstrings for every function\n4. Use meaningful, statistical variable names\n5. Version control with Git\n6. Follow PEP 8 style guide\n7. Add type hints for clarity';
  return AI_KB['default'];
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

  useEffect(() => { setUser(getCurrentUser()); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const quizScore = quizSubmitted ? QUIZ.filter((q, i) => quizAnswers[i] === q.correctIndex).length : 0;

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: chatInput.trim(), timestamp: new Date() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAiTyping(true);
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'ai', content: getAIResponse(userMsg.content), timestamp: new Date() }]);
      setIsAiTyping(false);
    }, 600 + Math.random() * 600);
  };

  return (
    <div>
      <div className={styles.courseHeader}>
        <Link href="/dashboard/learn" className={styles.backLink}>← Back to Learning Path</Link>
        <h1 className={styles.courseTitle}>{COURSE.title}</h1>
        <p className={styles.courseDesc}>{COURSE.description}</p>
        <div className={styles.courseTags}>
          <span className={`${styles.tag} ${styles.tagPrimary}`}>{COURSE.competency}</span>
          <span className={`${styles.tag} ${styles.tagSuccess}`}>{COURSE.difficulty}</span>
          <span className={`${styles.tag} ${styles.tagMeta}`}>{COURSE.duration}</span>
          <span className={`${styles.tag} ${styles.tagMeta}`}>{COURSE.provider}</span>
        </div>
      </div>

      <div className={styles.tabNav}>
        {([['video','▶ Video Lecture'],['transcript','📄 Transcript'],['quiz','📝 Quiz'],['doubts','💬 Ask Doubts']] as const).map(([id, label]) => (
          <button key={id} className={`${styles.tab} ${activeTab === id ? styles.tabActive : ''}`} onClick={() => setActiveTab(id as any)}>{label}</button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'video' && (
          <div className={styles.videoSection}>
            <div className={styles.videoWrapper}>
              <iframe src={`https://www.youtube.com/embed/${COURSE.videoId}?list=${COURSE.playlistId}&rel=0`} title={COURSE.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className={styles.videoIframe} />
            </div>
            <div className={styles.videoMeta}>
              <div className={styles.topicsList}>
                <h3>Topics Covered in This Module</h3>
                <div className={styles.topicChips}>{COURSE.topics.map(t => <span key={t} className={styles.topicChip}>{t}</span>)}</div>
              </div>
              <div className={styles.courseProgress}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Module Progress</div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: '0%' }} /></div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 6 }}>Begin the video to start tracking. Use the Transcript and Quiz tabs to reinforce learning.</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transcript' && (
          <div className={styles.transcriptSection}>
            <div className={styles.transcriptHeader}>
              <h3>Module Transcript — Python Fundamentals</h3>
              <span className="badge badge-primary" style={{ fontSize: 10 }}>AI-Transcribed</span>
            </div>
            <div className={styles.transcriptBody}>
              {TRANSCRIPT.split('\n\n').map((p, i) => <p key={i} className={styles.transcriptPara}>{p}</p>)}
            </div>
            <div className={styles.transcriptActions}>
              <p style={{ fontSize: 11, color: '#94A3B8' }}>This transcript is generated from module content. Reference it for quiz preparation and doubt resolution.</p>
            </div>
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className={styles.quizSection}>
            {!quizStarted ? (
              <div className={styles.quizStart}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
                <h3>Generate Knowledge Assessment</h3>
                <p>StatPath AI will generate a {QUIZ.length}-question assessment from the module transcript to evaluate your Python comprehension.</p>
                <button className="btn btn-primary" onClick={() => setQuizStarted(true)}>Generate {QUIZ.length}-Question Quiz</button>
              </div>
            ) : !quizSubmitted ? (
              <div>
                <div className={styles.quizHeader}>
                  <h3>Python Fundamentals — Knowledge Check</h3>
                  <span className="badge badge-gray">{Object.keys(quizAnswers).length} / {QUIZ.length} answered</span>
                </div>
                {QUIZ.map((q, qi) => (
                  <div key={qi} className={styles.quizQuestion}>
                    <div className={styles.qqNum}>{qi + 1}</div>
                    <div className={styles.qqText}>{q.question}</div>
                    <div className={styles.qqOptions}>
                      {q.options.map((opt, oi) => (
                        <button key={oi} className={`${styles.qqOption} ${quizAnswers[qi] === oi ? styles.qqSelected : ''}`} onClick={() => setQuizAnswers({ ...quizAnswers, [qi]: oi })}>
                          <span className={styles.qqLetter}>{String.fromCharCode(65 + oi)}</span><span>{opt}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} disabled={Object.keys(quizAnswers).length < QUIZ.length} onClick={() => setQuizSubmitted(true)}>
                  Submit Assessment ({Object.keys(quizAnswers).length}/{QUIZ.length})
                </button>
              </div>
            ) : (
              <div>
                <div className={styles.quizResult}>
                  <h3>Assessment Complete — {quizScore}/{QUIZ.length} ({Math.round((quizScore / QUIZ.length) * 100)}%)</h3>
                  <p>{quizScore >= 8 ? 'Excellent comprehension of Python fundamentals.' : quizScore >= 6 ? 'Good foundation. Review missed topics in the transcript.' : 'Review the transcript and re-watch the video before retaking.'}</p>
                </div>
                {QUIZ.map((q, qi) => {
                  const ok = quizAnswers[qi] === q.correctIndex;
                  return (
                    <div key={qi} className={`${styles.quizQuestion} ${ok ? styles.qqCorrectBg : styles.qqWrongBg}`}>
                      <div className={styles.qqNum} style={{ background: ok ? '#16a34a' : '#dc2626' }}>{ok ? '✓' : '✕'}</div>
                      <div className={styles.qqText}>{q.question}</div>
                      <div style={{ fontSize: 13, marginTop: 8 }}>
                        {!ok && <div style={{ color: '#991B1B', fontWeight: 600 }}>Your answer: {q.options[quizAnswers[qi]]}</div>}
                        <div style={{ color: '#003087', fontWeight: 600, marginTop: 2 }}>Correct: {q.options[q.correctIndex]}</div>
                        <div style={{ color: '#64748B', marginTop: 4, fontStyle: 'italic', fontSize: 12 }}>{q.explanation}</div>
                      </div>
                    </div>
                  );
                })}
                <button className="btn btn-secondary" style={{ width: '100%', marginTop: 16 }} onClick={() => { setQuizStarted(false); setQuizSubmitted(false); setQuizAnswers({}); }}>Retake Assessment</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'doubts' && (
          <div className={styles.doubtsSection}>
            <div className={styles.chatHeader}>
              <h3>AI Tutor — Module Doubt Resolution</h3>
              <p>Ask questions about the video content. The AI tutor responds using the module transcript.</p>
            </div>
            <div className={styles.chatBody}>
              {chatMessages.length === 0 && (
                <div className={styles.chatEmpty}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🤖</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#334155' }}>AI Tutor — Ready</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Ask about variables, data types, pandas, functions, loops, or any Python concept.</div>
                  <div className={styles.suggestedQuestions}>
                    {['What are Python data types?', 'Explain pandas DataFrame', 'How do functions work?', 'What is NumPy used for?', 'How to install Python?'].map(q => (
                      <button key={q} className={styles.suggestedQ} onClick={() => setChatInput(q)}>{q}</button>
                    ))}
                  </div>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`${styles.chatMsg} ${msg.role === 'user' ? styles.chatUser : styles.chatAi}`}>
                  <div className={styles.chatAvatar}>{msg.role === 'user' ? (user?.name?.[0] || 'U') : '🤖'}</div>
                  <div className={styles.chatBubble}>
                    <div className={styles.chatRole}>{msg.role === 'user' ? (user?.name || 'You') : 'StatPath AI Tutor'}</div>
                    <div className={styles.chatText}>{msg.content.split('\n').map((l, li) => <span key={li}>{l}<br /></span>)}</div>
                  </div>
                </div>
              ))}
              {isAiTyping && (
                <div className={`${styles.chatMsg} ${styles.chatAi}`}>
                  <div className={styles.chatAvatar}>🤖</div>
                  <div className={styles.chatBubble}><div className={styles.chatRole}>StatPath AI Tutor</div><div className={styles.typingIndicator}><span /><span /><span /></div></div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className={styles.chatInput}>
              <input type="text" placeholder="Type your question..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}} className="form-input" style={{ flex: 1 }} />
              <button className="btn btn-primary" onClick={sendMessage} disabled={!chatInput.trim() || isAiTyping}>Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
