'use client';
import React from 'react';
import { Header } from '../../components/Header';
import styles from '../about/about.module.css';

export default function SecurityPage() {
  const securityFeatures = [
    { title: 'Secure Authentication', desc: 'Single Sign-On (SSO) with official email verification, multi-factor authentication (MFA), and NIC Parichay integration capability.' },
    { title: 'Role-Based Access Control (RBAC)', desc: 'Strict data partitioning ensuring officials only access relevant competency profiles while administrators view aggregated anonymized reports.' },
    { title: 'Data Encryption', desc: 'TLS 1.3 encryption in transit and AES-256 encryption at rest for all official data and learning records.' },
    { title: 'Audit Logging & Transparency', desc: 'Immutable security audit logs recording administrative changes, privileges, assessment modifications, and document access.' },
    { title: 'Secure API Communication', desc: 'API endpoints protected with JWT tokens, rate limiting, and encrypted headers for safe government platform interoperability.' },
    { title: 'Data Minimization & AI Safety', desc: 'AI models operate on sanitized, non-personally identifiable learning inputs with strict guardrails preventing hallucinated answers.' },
    { title: 'Secure Document Processing', desc: 'Uploaded documents in Knowledge Studio are processed isolated in temporary sandboxes and automatically deleted post-analysis.' },
    { title: 'Privacy Controls & Consent', desc: 'Officials maintain full transparency over their continuous competency digital twin, skill gap reports, and learning history.' },
  ];

  return (
    <div className={styles.page}>
      <Header />
      
      <div className={styles.heroBanner}>
        <div className="container">
          <span className="badge badge-karnataka">Institutional Trust</span>
          <h1 className={styles.pageTitle}>Security & Privacy</h1>
          <p className={styles.pageSubhead}>
            Designed to support applicable government security, data protection, and privacy requirements.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '60px 24px' }}>
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '20px', borderRadius: '12px', marginBottom: '40px' }}>
          <p style={{ fontSize: '13.5px', color: '#475569', margin: 0 }}>
            🔒 <strong>Notice:</strong> StatPath AI is architected following NIC (National Informatics Centre) cybersecurity guidelines, the Digital Personal Data Protection (DPDP) Act framework, and Indian public-sector cloud standards.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {securityFeatures.map(sf => (
            <div key={sf.title} className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--gov-primary)', marginBottom: '10px' }}>{sf.title}</h3>
              <p style={{ fontSize: '13.5px', color: 'var(--gray-600)', lineHeight: '1.6' }}>{sf.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
