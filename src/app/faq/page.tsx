'use client';
import React, { useState } from 'react';
import { Header } from '../../components/Header';
import styles from '../about/about.module.css';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { q: 'Who can access StatPath AI?', a: 'StatPath AI is built for officials, investigators, statistical officers, analysts, trainers, and administrators in India\'s Official Statistical System, including MoSPI, NSSO, CSO, and state Directorates of Economics and Statistics (such as DES Karnataka).' },
    { q: 'How does StatPath AI complement iGOT Karmayogi?', a: 'iGOT Karmayogi provides the learning course repository. StatPath AI provides the skill intelligence layer—it maps your designation, runs baseline assessments, analyzes skill gaps, recommends phased iGOT courses, and continuously tracks your competency twin growth.' },
    { q: 'Is my assessment score visible publicly or to my peers?', a: 'No. Individual assessment details and skill gap analysis are strictly private to you and authorized personnel according to role-based security settings.' },
    { q: 'Can trainers use AI to generate assessments from official PDFs?', a: 'Yes! The AI Knowledge Studio allows trainers and officials to upload official documents (such as sampling manuals or survey reports) and generate customized MCQs with source citations.' },
    { q: 'Does StatPath AI support Kannada language?', a: 'Yes. StatPath AI includes full bilingual support (English and Kannada / ಕನ್ನಡ) along with accessibility font-size scaling and high-contrast view options.' },
    { q: 'How often are competency profiles updated?', a: 'Profiles update continuously after completing micro-learning units, passing assessment quizzes, and logging verified course completions.' },
  ];

  return (
    <div className={styles.page}>
      <Header />
      
      <div className={styles.heroBanner}>
        <div className="container">
          <span className="badge badge-gold">Help Center</span>
          <h1 className={styles.pageTitle}>Frequently Asked Questions</h1>
          <p className={styles.pageSubhead}>
            Answers to common questions regarding StatPath AI, iGOT integration, security, and usage.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '60px 24px', maxWidth: '840px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqs.map((f, i) => (
            <div key={i} className="card" style={{ padding: '20px' }}>
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', fontWeight: 700, fontSize: '16px', color: 'var(--gray-900)' }}
              >
                <span>{f.q}</span>
                <span style={{ fontSize: '20px', color: 'var(--karnataka-red)' }}>{openIndex === i ? '−' : '+'}</span>
              </button>
              {openIndex === i && (
                <p style={{ marginTop: '14px', fontSize: '14px', color: 'var(--gray-600)', lineHeight: '1.6', borderTop: '1px solid var(--gray-100)', paddingTop: '12px' }}>
                  {f.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
