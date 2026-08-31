'use client';
import { useState } from 'react';
import Link from 'next/link';
import styles from './guided.module.css';

const SECTIONS = [
  { id: 1, title: 'Introduction to Statistical Literacy', duration: '4 min', type: 'concept', done: true },
  { id: 2, title: 'Types of Data & Measurement Scales', duration: '5 min', type: 'concept', done: false },
  { id: 3, title: 'Section 1 Mini Quiz', duration: '3 min', type: 'quiz', done: false },
  { id: 4, title: 'Descriptive Statistics', duration: '6 min', type: 'concept', done: false },
  { id: 5, title: 'Section 2 Mini Quiz', duration: '4 min', type: 'quiz', done: false },
];

export default function AIGuidedPage() {
  const [activeSection, setActiveSection] = useState(2);
  const [view, setView] = useState<'content' | 'flashcard' | 'quiz'>('content');

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.courseSidebar}>
        <div className={styles.courseHeader}>
          <Link href="/dashboard/learn" className={styles.back}>← Back to Path</Link>
          <div className={styles.courseTitle}>Statistical Literacy</div>
          <div className={styles.courseSource}>IIM Bangalore via iGOT</div>
          <div className="progress-bar" style={{ marginTop: 12 }}>
            <div className="progress-fill" style={{ width: '20%' }} />
          </div>
          <div className={styles.courseProgress}>1 of 5 sections complete</div>
        </div>
        <div className={styles.sectionList}>
          {SECTIONS.map(s => (
            <button key={s.id}
              className={`${styles.sectionBtn} ${activeSection === s.id ? styles.sectionActive : ''} ${s.done ? styles.sectionDone : ''}`}
              onClick={() => setActiveSection(s.id)}>
              <span className={styles.sectionIcon}>{s.done ? '✓' : s.type === 'quiz' ? '❓' : '📄'}</span>
              <div>
                <div className={styles.sectionName}>{s.title}</div>
                <div className={styles.sectionDuration}>{s.duration}</div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <div className={styles.mainArea}>
        <div className={styles.viewToggle}>
          {[['content','📖 Read'],['flashcard','🃏 Flashcards'],['quiz','❓ Quick Quiz']].map(([v,l]) => (
            <button key={v} className={`${styles.viewBtn} ${view === v ? styles.viewActive : ''}`} onClick={() => setView(v as 'content'|'flashcard'|'quiz')}>{l}</button>
          ))}
        </div>

        {view === 'content' && (
          <div className={`card ${styles.contentCard}`}>
            <h2 className={styles.lessonTitle}>Types of Data & Measurement Scales</h2>
            <div className={styles.lessonBody}>
              <p>Data in statistics can be classified into two main types: <strong>qualitative (categorical)</strong> and <strong>quantitative (numerical)</strong>.</p>
              <div className={styles.conceptBox}>
                <div className={styles.conceptTitle}>📊 Four Measurement Scales</div>
                <div className={styles.scalesGrid}>
                  {[{name:'Nominal',eg:'Gender, Religion, State',prop:'Categories only — no order'},
                    {name:'Ordinal',eg:'Rank, Rating (1-5 stars)',prop:'Order matters, gaps not equal'},
                    {name:'Interval',eg:'Temperature (°C), Year',prop:'Equal gaps, no true zero'},
                    {name:'Ratio',eg:'Income, Weight, Height',prop:'Equal gaps + true zero'},
                  ].map(s => (
                    <div key={s.name} className={styles.scaleCard}>
                      <div className={styles.scaleName}>{s.name}</div>
                      <div className={styles.scaleProp}>{s.prop}</div>
                      <div className={styles.scaleEg}>e.g. {s.eg}</div>
                    </div>
                  ))}
                </div>
              </div>
              <p>In official statistics, understanding measurement scales is critical because the scale determines which statistical methods are appropriate.</p>
            </div>
            <button className="btn btn-primary" style={{width:'100%'}}>Mark Complete & Continue →</button>
          </div>
        )}

        {view === 'flashcard' && (
          <div className={styles.flashcardArea}>
            {[{front:'What is a Nominal Scale?', back:'A scale that classifies data into categories with no inherent order. Example: States of India, Gender, Religion.'},
              {front:'What distinguishes Ratio from Interval scale?', back:'Ratio scale has a true zero point (absence of the property), while Interval scale does not. Weight is ratio; Temperature (°C) is interval.'},
            ].map((card, i) => (
              <FlashCard key={i} front={card.front} back={card.back} />
            ))}
          </div>
        )}

        {view === 'quiz' && (
          <div className={`card ${styles.contentCard}`}>
            <div className={styles.quizHeader}>Mini Quiz — 3 Questions</div>
            <h3 className={styles.quizQ}>A researcher classifies respondents by their highest educational qualification (Primary / Secondary / Graduate / Post-Graduate). What type of scale is this?</h3>
            <div className={styles.quizOpts}>
              {['Nominal Scale','Ordinal Scale','Interval Scale','Ratio Scale'].map((o,i) => (
                <button key={i} className={styles.quizOpt}><span className={styles.qOptL}>{String.fromCharCode(65+i)}</span>{o}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FlashCard({ front, back }: { front: string; back: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className={styles.flashcard} onClick={() => setFlipped(!flipped)}>
      <div className={`${styles.flashInner} ${flipped ? styles.flipped : ''}`}>
        <div className={styles.flashFront}><div className={styles.flashLabel}>CONCEPT</div><div className={styles.flashText}>{front}</div><div className={styles.flashHint}>Click to reveal</div></div>
        <div className={styles.flashBack}><div className={styles.flashLabel}>ANSWER</div><div className={styles.flashText}>{back}</div></div>
      </div>
    </div>
  );
}
