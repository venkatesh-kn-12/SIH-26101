'use client';
import React from 'react';
import Link from 'next/link';
import { Header } from '../../components/Header';
import styles from '../about/about.module.css';

export default function HowItWorksPage() {
  const steps = [
    { 
      num: '01', 
      title: '1. Cadre & Role Mapping', 
      desc: 'The official establishes an institutional profile specifying designation (e.g. Statistical Officer, DES Karnataka), division, past survey experience, and target career cadre under the FRAC framework.' 
    },
    { 
      num: '02', 
      title: '2. Adaptive Competency Assessment', 
      desc: 'Context-aware baseline evaluations test verified statistical methodology, quantitative software command (Python, R, SQL, GIS), and digital governance knowledge.' 
    },
    { 
      num: '03', 
      title: '3. Skill Deficiency Analysis & Twin Mapping', 
      desc: 'StatPath AI algorithms evaluate assessment outcomes against benchmark requirements for the target role, mapping an individual Competency Twin and Skill Gap Matrix.' 
    },
    { 
      num: '04', 
      title: '4. Sequenced iGOT Learning Pathway', 
      desc: 'Generates a phased, highly structured learning roadmap that directly links iGOT Karmayogi courses, NSSTA training modules, and internal MoSPI resources.' 
    },
    { 
      num: '05', 
      title: '5. Targeted Micro-Learning & Scenario Practice', 
      desc: 'Officials complete daily 5-to-10 minute learning modules featuring executive summaries, video walkthroughs, policy briefings, and practical case study MCQs.' 
    },
    { 
      num: '06', 
      title: '6. Continuous Validation & Growth', 
      desc: 'Spaced repetition reviews, periodic 90-day reassessments, and real-time score updates ensure the officer\'s Competency Twin remains current and verified.' 
    },
  ];

  return (
    <div className={styles.page}>
      <Header />
      
      <div className={styles.heroBanner}>
        <div className="container">
          <span className="badge badge-gold">Structured 6-Stage Framework</span>
          <h1 className={styles.pageTitle}>How StatPath AI Works</h1>
          <p className={styles.pageSubhead}>
            An institutional lifecycle connecting baseline evaluation, AI gap analysis, iGOT learning pathways, and verified competency tracking.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '60px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '850px', margin: '0 auto' }}>
          {steps.map(s => (
            <div key={s.num} className="card" style={{ padding: '24px', borderLeft: '4px solid var(--ux4g-gov-navy)' }}>
              <span className="badge badge-primary" style={{ marginBottom: '8px' }}>Stage {s.num}</span>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '8px' }}>{s.title}</h3>
              <p style={{ fontSize: '14.5px', color: 'var(--gray-600)', lineHeight: '1.6' }}>{s.desc}</p>
            </div>
          ))}

          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <Link href="/auth/signup" className="btn btn-karnataka btn-lg">
              Initiate Baseline Assessment →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
