'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '../components/Header';
import { useLanguage } from '../lib/LanguageContext';
import styles from './page.module.css';

export default function Home() {
  const { t } = useLanguage();
  const [activeDomainTab, setActiveDomainTab] = useState<'statistical' | 'technical' | 'governance' | 'behavioral'>('statistical');
  const [mcqSubmitted, setMcqSubmitted] = useState<number | null>(null);

  const competencyDomains = {
    statistical: [
      { name: 'Survey Design', desc: 'Sampling frames, questionnaire design, field protocols', count: '14 Modules' },
      { name: 'Sampling Theory', desc: 'Stratified, cluster, multi-stage sampling methodology', count: '10 Modules' },
      { name: 'National Accounts', desc: 'GDP computation, input-output tables, GVA analysis', count: '18 Modules' },
      { name: 'Price Statistics', desc: 'CPI, WPI, IIP index computation & basket revision', count: '12 Modules' },
      { name: 'Agricultural Statistics', desc: 'Crop yield estimation, land use statistics', count: '11 Modules' },
      { name: 'Data Quality & Audit', desc: 'Outlier detection, imputation & validation', count: '9 Modules' },
    ],
    technical: [
      { name: 'Python for Official Statistics', desc: 'Data cleaning, Pandas, SciPy & automated pipelines', count: '16 Modules' },
      { name: 'SQL & Database Systems', desc: 'Query optimization, PostgreSQL, data warehousing', count: '12 Modules' },
      { name: 'GIS & Spatial Analytics', desc: 'QGIS, spatial sampling, geo-tagging survey data', count: '14 Modules' },
      { name: 'Data Visualization & Dashboards', desc: 'Plotly, PowerBI, statistical charts & maps', count: '10 Modules' },
      { name: 'AI & Machine Learning in Gov', desc: 'Automated code list coding, NLP for survey text', count: '15 Modules' },
      { name: 'Cloud Computing & Open Data', desc: 'NIC Cloud, API distribution, open dataset hosting', count: '8 Modules' },
    ],
    governance: [
      { name: 'Cybersecurity & Data Privacy', desc: 'DPDP Act compliance, data masking, secure storage', count: '10 Modules' },
      { name: 'Digital Infrastructure (KSDN)', desc: 'State Data Centre, e-governance interoperability', count: '8 Modules' },
      { name: 'Official Statistics Ethics', desc: 'Confidentiality of respondents, unbiased reporting', count: '6 Modules' },
      { name: 'Government Cloud Standards', desc: 'NIC infrastructure guidelines & security audits', count: '7 Modules' },
    ],
    behavioral: [
      { name: 'Public Leadership & Ethics', desc: 'Decision making in statistical administration', count: '9 Modules' },
      { name: 'Evidence-Based Policy Communication', desc: 'Presenting data insights to policy makers', count: '11 Modules' },
      { name: 'Project & Survey Management', desc: 'Managing field teams, timelines & budget allocation', count: '13 Modules' },
      { name: 'Change Management & Innovation', desc: 'Adopting digital tools in traditional statistical units', count: '7 Modules' },
    ]
  };

  return (
    <div className={styles.page}>
      <Header />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroGrid}>
            <div className={styles.heroContent}>
              <div className={styles.heroBadge}>
                <span className={styles.karnatakaDot}></span>
                <span>{t('heroBadge')}</span>
              </div>

              <h1 className={styles.heroTitle}>
                {t('heroTitle')}
              </h1>

              <p className={styles.heroSubhead}>
                {t('heroSubhead')}
              </p>

              <div className={styles.heroActions}>
                <Link href="/auth/signup" className="btn btn-primary btn-lg">
                  {t('heroCtaPrimary')} →
                </Link>
                <Link href="#how-it-works" className="btn btn-secondary btn-lg">
                  {t('heroCtaSecondary')}
                </Link>
              </div>

              <div className={styles.trustBadges}>
                <div className={styles.trustItem}>
                  <span className={styles.trustNumber}>12,840+</span>
                  <span className={styles.trustLabel}>Officials Enrolled</span>
                </div>
                <div className={styles.trustDivider}></div>
                <div className={styles.trustItem}>
                  <span className={styles.trustNumber}>4,200+</span>
                  <span className={styles.trustLabel}>iGOT Courses Mapped</span>
                </div>
                <div className={styles.trustDivider}></div>
                <div className={styles.trustItem}>
                  <span className={styles.trustNumber}>+1.1</span>
                  <span className={styles.trustLabel}>Avg Competency Growth</span>
                </div>
              </div>
            </div>

            {/* Sleek Hero Dashboard Preview Card */}
            <div className={styles.heroVisualCard}>
              <div className={styles.visualHeader}>
                <div className={styles.visualBadge}>
                  <span className={styles.livePulse}></span> StatPath AI — Skill Intelligence Twin
                </div>
                <span className={styles.visualRole}>MoSPI Official Platform</span>
              </div>

              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-md)' }}>
                <img 
                  src="/statpath_sih_hero.png" 
                  alt="StatPath AI Dashboard Preview — Smart India Hackathon"
                  style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '16px' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Role Profile</div>
                  <strong style={{ fontSize: '13px', color: '#0F172A' }}>Statistical Officer</strong>
                </div>
                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#1E40AF', fontWeight: 600 }}>Skill Readiness</div>
                  <strong style={{ fontSize: '13px', color: '#003087' }}>72% (Target: 90%)</strong>
                </div>
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>iGOT Pipeline</div>
                  <strong style={{ fontSize: '13px', color: '#15803D' }}>4 Courses Mapped</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY STATPATH AI? Comparison Section */}
      <section className={styles.whySection}>
        <div className="container">
          <div className={styles.sectionHeaderCenter}>
            <span className="badge badge-karnataka">Continuous Intelligence vs Traditional LMS</span>
            <h2 className={styles.sectionTitle}>Why StatPath AI?</h2>
            <p className={styles.sectionSubtitle}>
              Moving India's statistical workforce from generic course catalogs to personalized continuous competency development.
            </p>
          </div>

          <div className={styles.comparisonGrid}>
            {/* Traditional */}
            <div className={styles.comparisonCardTraditional}>
              <div className={styles.compHeaderTraditional}>
                <h3>Traditional Learning System</h3>
                <span className={styles.compTagBad}>Static & Generic</span>
              </div>
              <div className={styles.compFlow}>
                <div className={styles.compStep}>Course Overload</div>
                <div className={styles.compArrow}>↓</div>
                <div className={styles.compStep}>Generic Recommendations</div>
                <div className={styles.compArrow}>↓</div>
                <div className={styles.compStep}>Low Engagement</div>
                <div className={styles.compArrow}>↓</div>
                <div className={styles.compStep}>No Competency Validation</div>
                <div className={styles.compArrow}>↓</div>
                <div className={styles.compStep}>Limited Skill Retention</div>
              </div>
            </div>

            {/* StatPath AI */}
            <div className={styles.comparisonCardStatpath}>
              <div className={styles.compHeaderStatpath}>
                <h3>StatPath AI Intelligence</h3>
                <span className={styles.compTagGood}>Continuous & Personalized</span>
              </div>
              <div className={styles.compFlow}>
                <div className={styles.compStepGood}>Employee Competency Twin</div>
                <div className={styles.compArrowGood}>↓</div>
                <div className={styles.compStepGood}>Adaptive Baseline Assessment</div>
                <div className={styles.compArrowGood}>↓</div>
                <div className={styles.compStepGood}>Precise Skill Gap Analysis</div>
                <div className={styles.compArrowGood}>↓</div>
                <div className={styles.compStepGood}>Phased iGOT Learning Pathways</div>
                <div className={styles.compArrowGood}>↓</div>
                <div className={styles.compStepGood}>Continuous Validation & Growth</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS Section */}
      <section id="how-it-works" className={styles.howSection}>
        <div className="container">
          <div className={styles.sectionHeaderCenter}>
            <span className="badge badge-gold">Structured 6-Step Journey</span>
            <h2 className={styles.sectionTitle}>How StatPath AI Works</h2>
            <p className={styles.sectionSubtitle}>
              A continuous, data-driven cycle designed for officials in public administration.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {[
              { num: '01', title: 'Understand Me', desc: 'Captures your role, experience, department, and career aspirations.', icon: '👤' },
              { num: '02', title: 'Assess My Skills', desc: 'Context-aware baseline evaluation tests actual knowledge, not self-declarations.', icon: '✍️' },
              { num: '03', title: 'Identify My Gaps', desc: 'AI pinpoints exact gaps between current capability and role requirements.', icon: '📊' },
              { num: '04', title: 'Build My Learning Path', desc: 'Generates sequenced learning modules aligned with iGOT Karmayogi.', icon: '🗺️' },
              { num: '05', title: 'Learn & Practice', desc: 'Micro-learning, video lessons, audio summaries, and interactive quizzes.', icon: '📖' },
              { num: '06', title: 'Continuously Improve', desc: 'Spaced revisions & periodic reassessments update your Digital Twin.', icon: '🔁' },
            ].map(step => (
              <div key={step.num} className={styles.stepCard}>
                <div className={styles.stepHeader}>
                  <span className={styles.stepIcon}>{step.icon}</span>
                  <span className={styles.stepNum}>{step.num}</span>
                </div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPETENCY DOMAINS Section */}
      <section id="competencies" className={styles.domainsSection}>
        <div className="container">
          <div className={styles.sectionHeaderCenter}>
            <span className="badge badge-primary">Comprehensive Taxonomy</span>
            <h2 className={styles.sectionTitle}>Your Competency Landscape</h2>
            <p className={styles.sectionSubtitle}>
              Covering domain statistics, technical capabilities, digital governance, and leadership.
            </p>
          </div>

          {/* Domain Tabs */}
          <div className={styles.domainTabs}>
            <button 
              className={`${styles.tabBtn} ${activeDomainTab === 'statistical' ? styles.activeTab : ''}`}
              onClick={() => setActiveDomainTab('statistical')}
            >
              📊 Statistical Competencies
            </button>
            <button 
              className={`${styles.tabBtn} ${activeDomainTab === 'technical' ? styles.activeTab : ''}`}
              onClick={() => setActiveDomainTab('technical')}
            >
              💻 Technical Competencies
            </button>
            <button 
              className={`${styles.tabBtn} ${activeDomainTab === 'governance' ? styles.activeTab : ''}`}
              onClick={() => setActiveDomainTab('governance')}
            >
              🏛️ Digital Governance
            </button>
            <button 
              className={`${styles.tabBtn} ${activeDomainTab === 'behavioral' ? styles.activeTab : ''}`}
              onClick={() => setActiveDomainTab('behavioral')}
            >
              🤝 Behavioural & Managerial
            </button>
          </div>

          {/* Domain Cards Grid */}
          <div className={styles.domainCardsGrid}>
            {competencyDomains[activeDomainTab].map(item => (
              <div key={item.name} className={styles.domainCard}>
                <div className={styles.domainCardHeader}>
                  <h4>{item.name}</h4>
                  <span className={styles.domainCountBadge}>{item.count}</span>
                </div>
                <p>{item.desc}</p>
                <div className={styles.domainCardFooter}>
                  <Link href="/auth/signup" className={styles.domainLink}>
                    Assess Competency →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connected to Government Ecosystem */}
      <section className={styles.ecosystemSection}>
        <div className="container">
          <div className={styles.ecoCard}>
            <div className={styles.ecoContent}>
              <span className="badge badge-karnataka">Interoperable Architecture</span>
              <h2>Connected to the Government Learning Ecosystem</h2>
              <p>
                StatPath AI operates as the intelligence and analytics engine designed for interoperability with approved government learning platforms including iGOT Karmayogi, NSSTA, and state training centers.
              </p>
              
              <div className={styles.ecoPipeline}>
                <div className={styles.ecoNode}>StatPath AI</div>
                <div className={styles.ecoArrow}>→</div>
                <div className={styles.ecoNode}>Competency Intelligence</div>
                <div className={styles.ecoArrow}>→</div>
                <div className={styles.ecoNode}>iGOT Karmayogi / NSSTA</div>
                <div className={styles.ecoArrow}>→</div>
                <div className={styles.ecoNode}>Verified Skill Growth</div>
              </div>

              <div className={styles.ecoNotice}>
                ℹ️ <em>Designed for interoperability with approved government learning ecosystems and APIs.</em>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI LEARN YOUR WAY Section */}
      <section className={styles.learnModesSection}>
        <div className="container">
          <div className={styles.sectionHeaderCenter}>
            <span className="badge badge-gold">Multi-Modal Learning</span>
            <h2 className={styles.sectionTitle}>Learn Your Way</h2>
            <p className={styles.sectionSubtitle}>
              Tailored to your daily workflow and preferred learning style.
            </p>
          </div>

          <div className={styles.modesGrid}>
            <div className={styles.modeCard}>
              <div className={styles.modeIcon}>📖</div>
              <h3>Read</h3>
              <p>Smart executive summaries, structured notes, and official guidelines condensed for 5-minute reads.</p>
            </div>
            <div className={styles.modeCard}>
              <div className={styles.modeIcon}>🎬</div>
              <h3>Watch</h3>
              <p>Visual explanations, video lectures, and step-by-step statistical software walkthroughs.</p>
            </div>
            <div className={styles.modeCard}>
              <div className={styles.modeIcon}>🎧</div>
              <h3>Listen</h3>
              <p>Audio briefings and policy highlights for learning on the go during official commutes.</p>
            </div>
            <div className={styles.modeCard}>
              <div className={styles.modeIcon}>✍️</div>
              <h3>Practice</h3>
              <p>Interactive case study quizzes, scenario assessments, and instant explanation feedback.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTINUOUS COMPETENCY LOOP */}
      <section className={styles.loopSection}>
        <div className="container">
          <div className={styles.sectionHeaderCenter}>
            <span className="badge badge-karnataka">Continuous Career Development</span>
            <h2 className={styles.sectionTitle}>The Continuous Competency Loop</h2>
            <p className={styles.sectionSubtitle}>
              StatPath AI is a lifelong learning engine, not a one-time course portal.
            </p>
          </div>

          <div className={styles.loopDiagram}>
            {[
              { step: 'ASSESS', desc: 'Adaptive baseline evaluation' },
              { step: 'LEARN', desc: 'iGOT & AI-guided micro lessons' },
              { step: 'PRACTICE', desc: 'Quizzes & practical scenarios' },
              { step: 'VALIDATE', desc: 'Verified competency updates' },
              { step: 'UPDATE SKILL PROFILE', desc: 'Digital Twin score update' },
              { step: 'REASSESS', desc: 'Periodic 90-day review' },
            ].map((item, idx) => (
              <React.Fragment key={item.step}>
                <div className={styles.loopNodeCard}>
                  <div className={styles.loopNodeNum}>{idx + 1}</div>
                  <strong>{item.step}</strong>
                  <span>{item.desc}</span>
                </div>
                {idx < 5 && <div className={styles.loopArrowNode}>➔</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>📊 StatPath AI</div>
              <p>
                AI-Powered Skill Intelligence and Continuous Learning Platform for officials working in India's Official Statistical System.
              </p>
              <div className={styles.govTaglineBox}>
                Ministry of Statistics and Programme Implementation (MoSPI) • Smart India Hackathon (SIH 2026).
              </div>
            </div>

            <div className={styles.footerNavGroup}>
              <h4>Navigation</h4>
              <Link href="/">Home</Link>
              <Link href="/about">About Platform</Link>
              <Link href="/how-it-works">How It Works</Link>
              <Link href="/ecosystem">Learning Ecosystem</Link>
              <Link href="/competencies">Competency Framework</Link>
            </div>

            <div className={styles.footerNavGroup}>
              <h4>Governance & Security</h4>
              <Link href="/security">Security & Privacy</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/auth/login">Official Login</Link>
              <Link href="/admin">Admin Console</Link>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p>© 2026 StatPath AI — Built for Smart India Hackathon (SIH) & India Official Statistical System.</p>
            <div className={styles.footerLinks}>
              <Link href="/security">Privacy Policy</Link> • <Link href="/security">Terms of Service</Link> • <Link href="/security">Accessibility Statement</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
