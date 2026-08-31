'use client';
import { useState } from 'react';
import styles from './studio.module.css';

interface MCQ { question: string; options: string[]; correctIndex: number; explanation: string; difficulty: string; topic: string; }

const SAMPLE_MCQS: MCQ[] = [
  { question: 'What is the primary purpose of stratified random sampling in survey design?', options: ['To reduce total sample size', 'To ensure representation of all subgroups in the population', 'To eliminate sampling error completely', 'To speed up data collection'], correctIndex: 1, explanation: 'Stratified sampling ensures that distinct subgroups (strata) are proportionally represented, improving precision.', difficulty: 'Medium', topic: 'Sampling Methods' },
  { question: 'Which of the following is NOT a type of non-sampling error?', options: ['Coverage error', 'Response error', 'Sampling variance', 'Processing error'], correctIndex: 2, explanation: 'Sampling variance is a sampling error. Coverage, response, and processing errors are non-sampling errors.', difficulty: 'Hard', topic: 'Survey Errors' },
  { question: 'In index number construction, the Paasche index uses weights from which period?', options: ['Base period', 'Current period', 'Average of base and current periods', 'Fixed reference period'], correctIndex: 1, explanation: 'The Paasche index uses current-period quantities as weights, unlike Laspeyres which uses base-period weights.', difficulty: 'Medium', topic: 'Index Numbers' },
];

export default function StudioPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState('mixed');
  const [generating, setGenerating] = useState(false);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [mode, setMode] = useState<'upload' | 'text'>('text');
  const [activeTab, setActiveTab] = useState<'mcq' | 'summary' | 'flashcard'>('mcq');
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const generate = async () => {
    if (!text && !file) return;
    setGenerating(true);
    await new Promise(r => setTimeout(r, 2000));
    setMcqs(SAMPLE_MCQS.slice(0, Math.min(count, SAMPLE_MCQS.length)));
    setGenerating(false);
  };

  const toggleReveal = (i: number) => {
    const next = new Set(revealed);
    next.has(i) ? next.delete(i) : next.add(i);
    setRevealed(next);
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>🤖 AI Knowledge Studio</h1>
          <p className={styles.subtitle}>Upload learning material and transform it into MCQs, summaries, flashcards, and more using AI.</p>
        </div>
        <div className={styles.betaBadge}>Powered by Gemini AI</div>
      </div>

      <div className={styles.layout}>
        {/* Input Panel */}
        <div className={`card ${styles.inputPanel}`}>
          <div className={styles.modeToggle}>
            <button className={`${styles.modeBtn} ${mode === 'text' ? styles.modeActive : ''}`} onClick={() => setMode('text')}>📝 Paste Text</button>
            <button className={`${styles.modeBtn} ${mode === 'upload' ? styles.modeActive : ''}`} onClick={() => setMode('upload')}>📁 Upload File</button>
          </div>

          {mode === 'text' ? (
            <textarea className={styles.textArea} placeholder="Paste your learning material here — syllabus content, policy documents, training notes, circulars..." value={text} onChange={e => setText(e.target.value)} rows={10} />
          ) : (
            <div className={styles.uploadZone} onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files[0]); }} onDragOver={e => e.preventDefault()}>
              {file ? (
                <div className={styles.fileInfo}>
                  <span>📄</span>
                  <span>{file.name}</span>
                  <button onClick={() => setFile(null)}>✕</button>
                </div>
              ) : (
                <>
                  <div className={styles.uploadIcon}>📁</div>
                  <div className={styles.uploadText}>Drop PDF, DOCX, or PPT here</div>
                  <input type="file" accept=".pdf,.docx,.ppt,.pptx,.txt" onChange={e => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} id="fileInput" />
                  <label htmlFor="fileInput" className="btn btn-secondary btn-sm">Browse Files</label>
                </>
              )}
            </div>
          )}

          <div className={styles.options}>
            <div>
              <label className="form-label">Output Type</label>
              <div className={styles.tabBtns}>
                {[['mcq','MCQ Generator'],['summary','Summarise'],['flashcard','Flashcards']].map(([val, label]) => (
                  <button key={val} className={`${styles.tabBtn} ${activeTab === val ? styles.tabActive : ''}`} onClick={() => setActiveTab(val as 'mcq'|'summary'|'flashcard')}>{label}</button>
                ))}
              </div>
            </div>
            {activeTab === 'mcq' && (
              <div className={styles.optRow}>
                <div>
                  <label className="form-label">Number of Questions</label>
                  <input type="number" className="form-input" min={5} max={50} value={count} onChange={e => setCount(+e.target.value)} style={{ width: 100 }} />
                </div>
                <div>
                  <label className="form-label">Difficulty</label>
                  <select className="form-select" value={difficulty} onChange={e => setDifficulty(e.target.value)} style={{ width: 140 }}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={generate} disabled={generating || (!text && !file)}>
            {generating ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Generating with AI...</> : `Generate ${activeTab === 'mcq' ? `${count} MCQs` : activeTab === 'summary' ? 'Summary' : 'Flashcards'} ✨`}
          </button>
        </div>

        {/* Output Panel */}
        <div className={styles.outputPanel}>
          {mcqs.length === 0 ? (
            <div className={`card ${styles.emptyState}`}>
              <div style={{ fontSize: 48 }}>🤖</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#334155', marginTop: 12 }}>Ready to Generate</div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 8, lineHeight: 1.6 }}>
                Paste learning material or upload a document, then click Generate. AI will produce {activeTab === 'mcq' ? 'MCQs with explanations' : activeTab === 'summary' ? 'a concise summary' : 'concept flashcards'}.
              </div>
            </div>
          ) : (
            <div>
              <div className={styles.outputHeader}>
                <span className={styles.outputTitle}>{mcqs.length} MCQs Generated</span>
                <div className={styles.outputActions}>
                  <button className="btn btn-secondary btn-sm">📋 Copy All</button>
                  <button className="btn btn-secondary btn-sm">📥 Export</button>
                  <button className="btn btn-primary btn-sm">✓ Approve & Publish</button>
                </div>
              </div>
              <div className={styles.mcqList}>
                {mcqs.map((mcq, i) => (
                  <div key={i} className={`card ${styles.mcqCard}`}>
                    <div className={styles.mcqHeader}>
                      <span className={styles.mcqNum}>Q{i + 1}</span>
                      <span className={`badge ${mcq.difficulty === 'Easy' ? 'badge-success' : mcq.difficulty === 'Medium' ? 'badge-warning' : 'badge-error'}`}>{mcq.difficulty}</span>
                      <span className={styles.mcqTopic}>{mcq.topic}</span>
                    </div>
                    <p className={styles.mcqQ}>{mcq.question}</p>
                    <div className={styles.mcqOptions}>
                      {mcq.options.map((opt, oi) => (
                        <div key={oi} className={`${styles.mcqOpt} ${revealed.has(i) && oi === mcq.correctIndex ? styles.mcqCorrect : ''}`}>
                          <span className={styles.optLetter}>{String.fromCharCode(65+oi)}</span>
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                    <div className={styles.mcqFooter}>
                      <button className="btn btn-secondary btn-sm" onClick={() => toggleReveal(i)}>
                        {revealed.has(i) ? '🙈 Hide Answer' : '👁 Reveal Answer'}
                      </button>
                      {revealed.has(i) && <div className={styles.mcqExp}>💡 {mcq.explanation}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
