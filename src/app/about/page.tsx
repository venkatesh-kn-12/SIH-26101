'use client';
import React from 'react';
import Link from 'next/link';
import { Header } from '../../components/Header';
import styles from './about.module.css';

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <Header />
      
      <div className={styles.heroBanner}>
        <div className="container">
          <span className="badge badge-karnataka">Institutional Vision</span>
          <h1 className={styles.pageTitle}>About StatPath AI</h1>
          <p className={styles.pageSubhead}>
            Empowering officials in India's Official Statistical System with continuous, data-driven competency development.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '60px 24px' }}>
        <div className={styles.contentGrid}>
          <div className={styles.mainContent}>
            <h2>Strategic Objective</h2>
            <p>
              The Official Statistical System (OSS) of India—spanning the Ministry of Statistics & Programme Implementation (MoSPI), the National Sample Survey Office (NSSO), and state Directorates of Economics and Statistics (DES)—requires continuous capability building to address emerging data demands, modern software tools, and spatial analytics.
            </p>
            <p>
              StatPath AI serves as the intelligent skill management layer. Rather than treating training as sporadic events, StatPath AI establishes a continuous learning twin for every statistical official.
            </p>

            <h2>Alignment with Mission Karmayogi</h2>
            <p>
              Aligned with National Programme for Civil Services Capacity Building (Mission Karmayogi), StatPath AI integrates competency frameworks (FRAC) to transition from rule-based to role-based capacity building.
            </p>

            <div className={styles.pillarGrid}>
              <div className={styles.pillarCard}>
                <div className={styles.pillarIcon}>🎯</div>
                <h3>Role-Based Competency</h3>
                <p>Mapping every designation to specific statistical, technical, and managerial competency requirements.</p>
              </div>
              <div className={styles.pillarCard}>
                <div className={styles.pillarIcon}>⚡</div>
                <h3>Adaptive Intelligence</h3>
                <p>AI-driven gap analysis that adapts as officers complete assessments and iGOT courses.</p>
              </div>
              <div className={styles.pillarCard}>
                <div className={styles.pillarIcon}>🛡️</div>
                <h3>Public Sector Trust</h3>
                <p>Designed for complete data privacy, role-based access, and NIC infrastructure compliance.</p>
              </div>
            </div>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.infoCard}>
              <h3>Key Platform Pillars</h3>
              <ul>
                <li><strong>State Partner:</strong> Govt of Karnataka (DES)</li>
                <li><strong>National Alignment:</strong> MoSPI & iGOT Karmayogi</li>
                <li><strong>Target User Base:</strong> 12,000+ Statistical Officials</li>
                <li><strong>Framework:</strong> FRAC Competency Twin</li>
              </ul>
              <Link href="/auth/signup" className="btn btn-karnataka btn-sm" style={{ width: '100%', marginTop: '16px' }}>
                Register Official Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
