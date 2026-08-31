'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '../../components/Header';
import styles from '../about/about.module.css';

export default function CompetenciesPage() {
  const [search, setSearch] = useState('');

  const competencies = [
    { category: 'Statistical Competencies', name: 'Survey Design & Sampling Frames', level: 'Core', desc: 'Designing representative samples, managing master frames, and non-sampling error control.' },
    { category: 'Statistical Competencies', name: 'National Accounts Statistics', level: 'Advanced', desc: 'Compilation of Gross Domestic Product, Gross Value Added, and regional economic accounts.' },
    { category: 'Statistical Competencies', name: 'Price Statistics & Index Numbers', level: 'Core', desc: 'CPI, WPI, IIP index calculation, item basket weighting, and price collection protocols.' },
    { category: 'Technical Competencies', name: 'Python Data Analytics', level: 'Intermediate', desc: 'Automating statistical cleaning, Pandas, NumPy, and statistical hypothesis testing in Python.' },
    { category: 'Technical Competencies', name: 'GIS & Spatial Sampling', level: 'Intermediate', desc: 'Using QGIS for geo-tagging enumeration blocks and spatial crop yield analysis.' },
    { category: 'Technical Competencies', name: 'AI/ML in Official Statistics', level: 'Advanced', desc: 'Machine learning for automated survey coding, anomaly detection, and NLP text extraction.' },
    { category: 'Digital Governance', name: 'Cybersecurity & Data Privacy (DPDP)', level: 'Core', desc: 'Ensuring statistical microdata privacy, cryptographic protection, and statutory compliance.' },
    { category: 'Behavioural & Managerial', name: 'Evidence-Based Leadership', level: 'Executive', desc: 'Communicating complex statistical findings to cabinet ministers and policy decision-makers.' },
  ];

  const filtered = competencies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={styles.page}>
      <Header />
      
      <div className={styles.heroBanner}>
        <div className="container">
          <span className="badge badge-karnataka">FRAC Taxonomy</span>
          <h1 className={styles.pageTitle}>Competency Landscape</h1>
          <p className={styles.pageSubhead}>
            Explore the official competency framework mapped across statistical, technical, governance, and leadership domains.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '60px 24px' }}>
        <div style={{ marginBottom: '30px', maxWidth: '500px' }}>
          <input 
            type="text" 
            placeholder="Search competencies (e.g. Python, Sampling, CPI)..." 
            className="form-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filtered.map(c => (
            <div key={c.name} className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span className="badge badge-primary" style={{ fontSize: '11px' }}>{c.category}</span>
                <span className="badge badge-gold" style={{ fontSize: '11px' }}>{c.level}</span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '8px' }}>{c.name}</h3>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', lineHeight: '1.5' }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
