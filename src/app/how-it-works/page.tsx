'use client';
import React from 'react';
import Link from 'next/link';
import { Header } from '../../components/Header';
import styles from '../about/about.module.css';

export default function HowItWorksPage() {
  const steps = [
    { num: '01', title: '1. Understand Me', desc: 'The official creates a profile detailing their current designation (e.g. Statistical Officer, DES Karnataka), prior work experience, state projects, and career targets.' },
    { num: '02', title: '2. Assess My Skills', desc: 'An adaptive baseline assessment tests practical statistical knowledge, software command (Python, SQL, GIS), and digital governance understanding.' },
    { num: '03', title: '3. Identify My Gaps', desc: 'AI compares the official\'s baseline scores against the required competency levels for their target role, generating a transparent Skill Gap Radar.' },
    { num: '04', title: '4. Build My Learning Path', desc: 'StatPath AI generates a phased learning journey that maps relevant iGOT Karmayogi courses and internal training modules.' },
    { num: '05', title: '5. Learn & Practice', desc: 'Officials complete micro-learning modules (5-10 mins daily), watch visual tutorials, listen to audio summaries, and solve interactive MCQs.' },
    { num: '06', title: '6. Continuously Improve', desc: 'Spaced repetition reviews and 90-day reassessments keep the Digital Twin up-to-date and track competency growth over time.' },
  ];

  return (
    <div className={styles.page}>
      <Header />
      
      <div className={styles.heroBanner}>
        <div className="container">
          <span className="badge badge-gold">6-Step Methodology</span>
          <h1 className={styles.pageTitle}>How StatPath AI Works</h1>
          <p className={styles.pageSubhead}>
            A continuous loop connecting baseline assessment, AI gap analysis, iGOT learning paths, and verified competency updates.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '60px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
          {steps.map(s => (
            <div key={s.num} className="card" style={{ padding: '24px', borderLeft: '4px solid var(--karnataka-red)' }}>
              <span className="badge badge-karnataka" style={{ marginBottom: '8px' }}>Step {s.num}</span>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '8px' }}>{s.title}</h3>
              <p style={{ fontSize: '14.5px', color: 'var(--gray-600)', lineHeight: '1.6' }}>{s.desc}</p>
            </div>
          ))}

          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <Link href="/auth/signup" className="btn btn-karnataka btn-lg">
              Begin Baseline Assessment Now →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
