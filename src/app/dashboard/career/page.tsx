'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser, UserProfile } from '@/lib/authStorage';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Target, Sparkles, Award, ArrowRight, BookOpen, Clock, ShieldCheck, CheckCircle2, RefreshCw, Check, Layers, Lock, Unlock } from 'lucide-react';
import styles from './career.module.css';

interface RoleSimulation {
  roleName: string;
  category: string;
}

export default function CareerPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [onboarding, setOnboarding] = useState<any>({});
  const [selectedRoleName, setSelectedRoleName] = useState<string>('');
  
  // Dynamic LLM Generated Simulation State
  const [simulationData, setSimulationData] = useState<any>(null);
  const [loadingSimulation, setLoadingSimulation] = useState<boolean>(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    if (typeof window !== 'undefined') {
      try {
        const storedOnboarding = localStorage.getItem('statpath_onboarding_data');
        if (storedOnboarding) {
          const parsed = JSON.parse(storedOnboarding);
          setOnboarding(parsed);
          const initialRole = parsed.careerGoal || currentUser?.designation || 'CyberSecurity Analyst';
          setSelectedRoleName(initialRole);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const primaryGoal = onboarding.careerGoal || user?.designation || 'CyberSecurity Analyst';
  const claimedSkillsRaw = onboarding.completedCourses || 'CyberSecurity, Network Security';
  const claimedList = useMemo(() => claimedSkillsRaw.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0), [claimedSkillsRaw]);

  // GENERATE USER-SPECIFIC DOMAIN PROGRESSION LADDER ROLES
  const simulatedRoles: RoleSimulation[] = useMemo(() => {
    const gLower = primaryGoal.toLowerCase();
    const sLower = claimedSkillsRaw.toLowerCase();

    if (gLower.includes('cyber') || gLower.includes('security') || sLower.includes('cyber') || sLower.includes('security')) {
      return [
        { roleName: primaryGoal, category: 'Target Role Goal' },
        { roleName: 'Senior CyberSecurity Engineer', category: 'Next Step Progression' },
        { roleName: 'Lead Cloud Security Architect', category: 'Advanced Technical Track' },
        { roleName: 'Chief Information Security Officer (CISO)', category: 'Executive Leadership Track' }
      ];
    }

    if (gLower.includes('data') || gLower.includes('statistic') || gLower.includes('analyst') || sLower.includes('python')) {
      return [
        { roleName: primaryGoal, category: 'Target Role Goal' },
        { roleName: `Senior ${primaryGoal} / ML Engineer`, category: 'Next Step Progression' },
        { roleName: 'Lead AI & Systems Architect', category: 'Advanced Technical Track' },
        { roleName: 'Chief Data & Intelligence Officer', category: 'Executive Leadership Track' }
      ];
    }

    if (gLower.includes('software') || gLower.includes('architect') || gLower.includes('developer') || sLower.includes('system')) {
      return [
        { roleName: primaryGoal, category: 'Target Role Goal' },
        { roleName: 'Principal System Architect', category: 'Next Step Progression' },
        { roleName: 'Head of Engineering / VP Technology', category: 'Executive Track' }
      ];
    }

    return [
      { roleName: primaryGoal, category: 'Target Role Goal' },
      { roleName: 'Senior Operations & Strategy Manager', category: 'Next Step Progression' },
      { roleName: 'Director of Capacity & Transformation', category: 'Executive Track' }
    ];
  }, [primaryGoal, claimedSkillsRaw]);

  // FETCH 5 LLM SKILL PARAMETERS WHENEVER SELECTED ROLE CHANGES
  useEffect(() => {
    const roleToFetch = selectedRoleName || primaryGoal;
    if (!roleToFetch) return;

    async function fetchLLMParameters() {
      try {
        setLoadingSimulation(true);
        const res = await fetch('/api/generate-career-simulation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentRole: user?.designation || 'Specialist',
            currentSkills: claimedSkillsRaw,
            experience: onboarding.experience || '1-3 years',
            targetRole: roleToFetch
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.simulation) {
            setSimulationData(data.simulation);
          }
        }
      } catch (err) {
        console.error('Failed to fetch career parameters:', err);
      } finally {
        setLoadingSimulation(false);
      }
    }

    fetchLLMParameters();
  }, [selectedRoleName, primaryGoal, user, claimedSkillsRaw, onboarding.experience]);

  // Skill parameters from LLM response
  const skillParameters: any[] = simulationData?.skillParameters || [
    { name: 'Core Domain Execution', category: 'Technical', currentScore: 3.5, requiredScore: 4.5, description: 'Domain execution' },
    { name: 'SLA & Quality Control', category: 'Operations', currentScore: 3.0, requiredScore: 4.5, description: 'SLA control' },
    { name: 'Risk Management', category: 'Governance', currentScore: 2.5, requiredScore: 4.5, description: 'Risk control' },
    { name: 'Process Automation', category: 'Operations', currentScore: 2.8, requiredScore: 4.5, description: 'Automation' },
    { name: 'Strategic Leadership', category: 'Leadership', currentScore: 2.0, requiredScore: 4.5, description: 'Leadership' }
  ];

  // Radar Data constructed from LLM 5 Skill Parameters
  const radarData = useMemo(() => {
    return skillParameters.map(sp => ({
      subject: sp.name.length > 14 ? `${sp.name.slice(0, 13)}…` : sp.name,
      currentScore: Math.round((sp.currentScore / 5) * 100),
      requiredScore: Math.round((sp.requiredScore / 5) * 100),
      fullName: sp.name
    }));
  }, [skillParameters]);

  // Apply target goal & redirect to learn
  const applySimulatedGoal = (roleName: string) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('statpath_onboarding_data');
      const obData = stored ? JSON.parse(stored) : {};
      obData.careerGoal = roleName;
      localStorage.setItem('statpath_onboarding_data', JSON.stringify(obData));
    }
    router.push('/dashboard/learn');
  };

  return (
    <div>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 60%, #003087 100%)',
        borderRadius: 20,
        padding: '24px 28px',
        marginBottom: 24,
        color: '#FFFFFF',
        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#60A5FA',
            fontSize: 11,
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: 20,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}>
            <Sparkles size={13} color="#FF9933" /> LLM DYNAMIC PARAMETER GENERATOR
          </span>
          <span style={{ fontSize: 12, color: '#93C5FD', fontWeight: 600 }}>
            Active Simulation: {selectedRoleName || primaryGoal}
          </span>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px 0', color: '#FFFFFF' }}>
          Dynamic Career Progression Simulator
        </h1>
        <p style={{ fontSize: 13, color: '#CBD5E1', margin: 0, lineHeight: 1.5 }}>
          5 Skill Parameters fetched dynamically via Groq LLM based on current skills (<strong>{claimedSkillsRaw}</strong>) and target role (<strong>"{selectedRoleName || primaryGoal}"</strong>).
        </p>
      </div>

      {/* USER DOMAIN CONTEXT BAR */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 16,
        padding: '18px 22px',
        marginBottom: 24,
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#003087', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Current Profile Context
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>
            {user?.name || 'Officer'} • {user?.designation || 'Specialist'} ({user?.dept || 'Security Division'})
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#64748B', fontWeight: 700 }}>Claimed Domain Skills:</span>
          {claimedList.map((skill: string) => (
            <span key={skill} style={{
              background: '#EFF6FF',
              color: '#1E40AF',
              border: '1px solid #BFDBFE',
              fontSize: 12,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}>
              <Check size={12} color="#2563EB" /> {skill}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.layout}>
        {/* Left Column: Role Progression Selector */}
        <div>
          <div className="card" style={{ padding: 20, borderRadius: 16, border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A', marginBottom: 4 }}>
              Select Role Goal to Simulate:
            </div>
            <p style={{ fontSize: 12, color: '#64748B', marginBottom: 14 }}>
              Dynamic ladder tailored to <strong>"{primaryGoal}"</strong> trajectory
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {simulatedRoles.map((role) => {
                const isSelected = selectedRoleName === role.roleName;

                return (
                  <button
                    key={role.roleName}
                    onClick={() => setSelectedRoleName(role.roleName)}
                    style={{
                      background: isSelected ? '#EFF6FF' : '#FFFFFF',
                      border: `2px solid ${isSelected ? '#003087' : '#E2E8F0'}`,
                      borderRadius: 12,
                      padding: 14,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span className="badge badge-primary" style={{ fontSize: 10, padding: '2px 8px' }}>
                        {role.category}
                      </span>
                    </div>

                    <div style={{ fontSize: 14, fontWeight: 800, color: isSelected ? '#003087' : '#0F172A' }}>
                      {role.roleName}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Simulation Analysis & 5 LLM Skill Parameters */}
        <div className={styles.analysis}>
          {loadingSimulation ? (
            <div style={{ padding: '72px 24px', textAlign: 'center', background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0' }}>
              <RefreshCw size={36} color="#003087" className="animate-spin" style={{ margin: '0 auto 16px auto' }} />
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                Fetching 5 Skill Parameters from Groq LLM for "{selectedRoleName}"...
              </div>
              <p style={{ fontSize: 13, color: '#64748B' }}>StatPath AI is evaluating real-world requirements for this role...</p>
            </div>
          ) : (
            <>
              {/* Readiness Summary Card */}
              <div className="card" style={{ padding: 24, borderRadius: 16, border: '1px solid #E2E8F0', background: '#FFFFFF', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#003087', textTransform: 'uppercase' }}>
                      Simulated Role Readiness Match
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '2px 0 0 0' }}>
                      {simulationData?.targetRole || selectedRoleName}
                    </h2>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: (simulationData?.readinessPct || 65) >= 60 ? '#15803D' : '#B45309' }}>
                    {simulationData?.readinessPct || 65}%
                  </div>
                </div>

                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 16 }}>
                  {simulationData?.description || `Specialized role executing advanced responsibilities for ${selectedRoleName}.`}
                </p>

                <div className="progress-bar" style={{ height: 12, marginBottom: 12 }}>
                  <div className="progress-fill" style={{
                    width: `${simulationData?.readinessPct || 65}%`,
                    background: (simulationData?.readinessPct || 65) >= 60 ? '#22c55e' : '#f59e0b'
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={13} /> Est. {simulationData?.estimatedMonths || 8} months learning pace
                  </span>
                  <span>5 LLM Verified Skill Parameters</span>
                </div>
              </div>

              {/* 5 LLM Skill Parameters Radar Chart */}
              <div className="card" style={{ padding: 24, borderRadius: 16, border: '1px solid #E2E8F0', background: '#FFFFFF', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>
                    Radar Analysis: 5 LLM Skill Parameters
                  </div>
                  <span style={{ fontSize: 11, background: '#EEF2FF', color: '#4F46E5', fontWeight: 700, padding: '2px 8px', borderRadius: 8 }}>
                    <Sparkles size={10} color="#FF9933" /> LLM Evaluated
                  </span>
                </div>

                <div style={{ fontSize: 12, color: '#64748B', marginBottom: 16 }}>
                  Evaluated specifically for <strong>"{selectedRoleName}"</strong> based on your profile
                </div>

                <div style={{ height: 280 }}>
                  <ResponsiveContainer>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} />
                      <Radar name="Target Role Required" dataKey="requiredScore" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.15} />
                      <Radar name="Your Current Score" dataKey="currentScore" stroke="#003087" fill="#003087" fillOpacity={0.35} />
                      <Legend formatter={(v) => <span style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>{v}</span>} />
                      <Tooltip formatter={(value: any, name: any, props: any) => [`${value}% Score`, props.payload.fullName]} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 5 REQUIRED SKILL PARAMETERS DETAILED LIST */}
              <div className="card" style={{ padding: 24, borderRadius: 16, border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A', marginBottom: 4 }}>
                  5 Required Skill Parameters for {selectedRoleName}
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginBottom: 16 }}>
                  Real-world competencies generated dynamically by LLM for this role
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                  {skillParameters.map((sp: any, i: number) => {
                    const isMet = sp.currentScore >= sp.requiredScore - 0.5;

                    return (
                      <div key={i} style={{
                        background: isMet ? '#F0FDF4' : '#F8FAFC',
                        border: `1px solid ${isMet ? '#BBF7D0' : '#E2E8F0'}`,
                        borderRadius: 12,
                        padding: 16
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{
                              background: isMet ? '#166534' : '#003087',
                              color: '#FFFFFF',
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 12,
                              fontWeight: 800
                            }}>
                              {i + 1}
                            </span>
                            <span style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>{sp.name}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 11, background: '#EFF6FF', color: '#1E40AF', padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>
                              {sp.category}
                            </span>
                            <span className={`badge ${isMet ? 'badge-success' : 'badge-error'}`} style={{ fontSize: 11 }}>
                              {isMet ? '✓ Foundation Met' : 'Target Gap'}
                            </span>
                          </div>
                        </div>

                        <p style={{ fontSize: 13, color: '#475569', margin: '4px 0 8px 0', lineHeight: 1.5 }}>
                          {sp.description}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                          <span>Current Proficiency: <strong style={{ color: isMet ? '#166534' : '#003087' }}>{sp.currentScore.toFixed(1)} / 5.0</strong></span>
                          <span>Role Required Benchmark: <strong style={{ color: '#B45309' }}>{sp.requiredScore.toFixed(1)} / 5.0</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', borderRadius: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onClick={() => applySimulatedGoal(selectedRoleName)}
                >
                  Set "{selectedRoleName}" as Active Goal & View Learning Resources →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
