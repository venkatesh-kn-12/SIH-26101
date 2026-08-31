'use client';
import React from 'react';
import Link from 'next/link';
import { Header } from '../../components/Header';
import styles from '../about/about.module.css';

export default function EcosystemPage() {
  return (
    <div className={styles.page}>
      <Header />
      
      <div className={styles.heroBanner}>
        <div className="container">
          <span className="badge badge-primary">Government Integration</span>
          <h1 className={styles.pageTitle}>Government Learning Ecosystem</h1>
          <p className={styles.pageSubhead}>
            Connecting StatPath AI intelligence with iGOT Karmayogi, NSSTA, and TPAC training resources.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '60px 24px' }}>
        <div className={styles.contentGrid}>
          <div className={styles.mainContent}>
            <h2>Ecosystem Interoperability</h2>
            <p>
              StatPath AI does not replace government content repositories; it complements them by acting as the personalized competency layer.
            </p>

            <div className={styles.pillarGrid}>
              <div className={styles.pillarCard}>
                <h3>iGOT Karmayogi</h3>
                <p>Seamless mapping to iGOT course IDs (e.g., Statistical Literacy, AI for Gov) with direct enrollment links.</p>
              </div>
              <div className={styles.pillarCard}>
                <h3>NSSTA</h3>
                <p>Integration with National Statistical Systems Training Academy modules and physical training calendars.</p>
              </div>
              <div className={styles.pillarCard}>
                <h3>State DES (Karnataka)</h3>
                <p>Custom state-specific training initiatives, agricultural survey protocols, and local language resources.</p>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '24px', borderRadius: '12px', marginTop: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px' }}>Official Interoperability Note</h3>
              <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: '1.5', margin: 0 }}>
                <em>Designed for interoperability with approved government learning ecosystems and APIs in compliance with NIC and Ministry guidelines.</em>
              </p>
            </div>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.infoCard}>
              <h3>Supported Platforms</h3>
              <ul>
                <li>✓ iGOT Karmayogi Portal</li>
                <li>✓ NSSTA Greater Noida</li>
                <li>✓ DES Govt of Karnataka</li>
                <li>✓ MoSPI e-Learning Portal</li>
              </ul>
              <Link href="/auth/signup" className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: '16px' }}>
                Explore Mapped Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
