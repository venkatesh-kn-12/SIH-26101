'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ORG_STATS, HEATMAP_DATA, COMPETENCY_SCORES } from '@/lib/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend } from 'recharts';
import styles from './admin.module.css';

const NAV_ITEMS = [
  { icon: '🏠', label: 'Overview', id: 'overview' },
  { icon: '🗺️', label: 'Workforce Map', id: 'workforce' },
  { icon: '🔥', label: 'Skill Heatmap', id: 'heatmap' },
  { icon: '📈', label: 'Training Intelligence', id: 'training' },
  { icon: '👥', label: 'User Management', id: 'users' },
  { icon: '🔍', label: 'Audit Log', id: 'audit' },
];

const HEATMAP_LEVELS = { low: '#dcfce7', medium: '#fef3c7', high: '#ffedd5', critical: '#fee2e2' };
const HEATMAP_TEXT = { low: '#166534', medium: '#92400e', high: '#9a3412', critical: '#991b1b' };
const SKILLS = ['Python', 'AI/ML', 'SQL', 'GIS'];
const DEPTS = ['Price Statistics', 'Agricultural Stat', 'National Accounts', 'Social Statistics'];

const AUDIT_LOG = [
  { user: 'Admin_204', action: 'Modified competency requirement', object: 'Python', detail: 'Level 2 → Level 3', time: '10:42:11', result: 'SUCCESS' },
  { user: 'Admin_101', action: 'Created user account', object: 'EMP/2024/4821', detail: 'Statistical Officer — Price Div', time: '09:18:45', result: 'SUCCESS' },
  { user: 'Admin_204', action: 'Published assessment', object: 'Q3 Periodic Assessment', detail: 'Assigned to 1,240 employees', time: '08:55:20', result: 'SUCCESS' },
  { user: 'Admin_007', action: 'Exported report', object: 'Workforce Skill Report', detail: 'Agricultural Statistics Dept', time: '08:32:10', result: 'SUCCESS' },
];

const FUTURE_SKILLS = [
  { skill: 'AI / ML for Official Statistics', priority: 'CRITICAL', gap: 82, employees: 8900 },
  { skill: 'Data Engineering & Pipelines', priority: 'CRITICAL', gap: 76, employees: 7200 },
  { skill: 'Cloud Computing (NIC Cloud)', priority: 'HIGH', gap: 65, employees: 6100 },
  { skill: 'Geospatial Analytics (GIS)', priority: 'HIGH', gap: 58, employees: 4800 },
  { skill: 'Advanced Statistical Modelling', priority: 'HIGH', gap: 52, employees: 5400 },
  { skill: 'Cybersecurity Awareness', priority: 'MEDIUM', gap: 44, employees: 11200 },
];

export default function AdminPage() {
  const [tab, setTab] = useState('overview');

  const deptData = ORG_STATS.departments.map(d => ({ name: d.name.split(' ')[0], score: d.avgScore, completion: d.completionRate }));

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo}>📈 StatPath AI</Link>
          <div className={styles.adminBadge}>ADMIN</div>
        </div>
        <nav className={styles.nav}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} className={`${styles.navItem} ${tab === item.id ? styles.navActive : ''}`} onClick={() => setTab(item.id)}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <div className={styles.adminUser}>
            <div className={styles.adminAvatar}>SA</div>
            <div><div className={styles.adminName}>Super Admin</div><div className={styles.adminRole}>Organisation Admin</div></div>
          </div>
          <Link href="/" className={styles.logoutBtn}>🚪 Logout</Link>
        </div>
      </aside>

      {/* Main */}
      <div className={styles.main}>
        <div className={styles.topBar}>
          <h1 className={styles.pageTitle}>
            {NAV_ITEMS.find(n => n.id === tab)?.icon} {NAV_ITEMS.find(n => n.id === tab)?.label}
          </h1>
          <div className={styles.topBarRight}>
            <button className="btn btn-secondary btn-sm">📥 Export Report</button>
            <span className={styles.govBadge}>🇮🇳 MoSPI Admin Portal</span>
          </div>
        </div>

        <div className={styles.content}>
          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div>
              <div className={styles.kpiGrid}>
                {[
                  { label: 'Total Employees', value: ORG_STATS.totalEmployees.toLocaleString(), sub: 'Across all departments', icon: '👥', color: '#003087' },
                  { label: 'Active Users', value: ORG_STATS.activeUsers.toLocaleString(), sub: `${Math.round((ORG_STATS.activeUsers/ORG_STATS.totalEmployees)*100)}% engagement`, icon: '✅', color: '#16a34a' },
                  { label: 'Avg. Skill Score', value: `${ORG_STATS.avgSkillScore}/5.0`, sub: '+0.4 from last quarter', icon: '📊', color: '#7c3aed' },
                  { label: 'High Priority Gaps', value: ORG_STATS.highPriorityGaps.toLocaleString(), sub: 'Employees requiring urgent training', icon: '⚠️', color: '#dc2626' },
                  { label: 'Completion Rate', value: `${ORG_STATS.completionRate}%`, sub: 'Assigned → Completed', icon: '🎓', color: '#059669' },
                  { label: 'Learning Hours', value: ORG_STATS.learningHoursTotal.toLocaleString(), sub: 'Total across organisation', icon: '⏱', color: '#d97706' },
                ].map(k => (
                  <div key={k.label} className={`card ${styles.kpiCard}`}>
                    <div className={styles.kpiIcon} style={{ background: `${k.color}18`, color: k.color }}>{k.icon}</div>
                    <div>
                      <div className={styles.kpiVal} style={{ color: k.color }}>{k.value}</div>
                      <div className={styles.kpiLabel}>{k.label}</div>
                      <div className={styles.kpiSub}>{k.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.chartsRow}>
                <div className={`card ${styles.chartCard}`}>
                  <div className="section-title" style={{ marginBottom: 16 }}>Department Skill Scores</div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={deptData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0,5]} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#003087" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className={`card ${styles.chartCard}`}>
                  <div className="section-title" style={{ marginBottom: 16 }}>Completion Rate by Department</div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={deptData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0,100]} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: any) => [`${v}%`, 'Completion']} />
                      <Bar dataKey="completion" fill="#16a34a" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* HEATMAP */}
          {tab === 'heatmap' && (
            <div>
              <div className={styles.heatmapInfo}>
                <span>🔥 Red = Critical gap. Orange = High gap. Yellow = Medium. Green = Low gap.</span>
              </div>
              <div className={`card ${styles.heatmapCard}`}>
                <table className={styles.heatmap}>
                  <thead>
                    <tr>
                      <th className={styles.hmCorner}>Department \ Skill</th>
                      {SKILLS.map(s => <th key={s} className={styles.hmHeader}>{s}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {DEPTS.map(dept => (
                      <tr key={dept}>
                        <td className={styles.hmDept}>{dept}</td>
                        {SKILLS.map(skill => {
                          const cell = HEATMAP_DATA.find(h => h.department === dept && h.skill === skill);
                          return (
                            <td key={skill} className={styles.hmCell}
                              style={{ background: cell ? HEATMAP_LEVELS[cell.level] : '#f8fafc', color: cell ? HEATMAP_TEXT[cell.level] : '#94a3b8' }}>
                              {cell ? <><div className={styles.hmLevel}>{cell.level.toUpperCase()}</div><div className={styles.hmPct}>{cell.percentage}%</div></> : '—'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={`card ${styles.futureCard}`}>
                <div className="section-title" style={{ marginBottom: 16 }}>Future Workforce Intelligence — Next 2-3 Years</div>
                {FUTURE_SKILLS.map(f => (
                  <div key={f.skill} className={styles.futureRow}>
                    <div className={styles.futureInfo}>
                      <span className={styles.futureName}>{f.skill}</span>
                      <span className={`badge ${f.priority === 'CRITICAL' ? 'badge-error' : f.priority === 'HIGH' ? 'badge-warning' : 'badge-gray'}`}>{f.priority}</span>
                      <span className={styles.futureEmp}>{f.employees.toLocaleString()} employees affected</span>
                    </div>
                    <div className={styles.futureBar}>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${f.gap}%`, background: f.priority === 'CRITICAL' ? '#ef4444' : f.priority === 'HIGH' ? '#f97316' : '#eab308' }} /></div>
                      <span className={styles.futureGapPct}>{f.gap}% gap</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AUDIT */}
          {tab === 'audit' && (
            <div className={`card`} style={{ padding: 20 }}>
              <div className={styles.auditHeader}>
                <div className="section-title">Audit Log</div>
                <div className={styles.auditFilters}>
                  <select className="form-select" style={{ width: 160 }}><option>All Users</option><option>Admin_204</option></select>
                  <select className="form-select" style={{ width: 160 }}><option>All Actions</option><option>Modifications</option><option>Exports</option></select>
                </div>
              </div>
              <table className="table">
                <thead><tr><th>User</th><th>Action</th><th>Object</th><th>Detail</th><th>Time</th><th>Result</th></tr></thead>
                <tbody>
                  {AUDIT_LOG.map((log, i) => (
                    <tr key={i}>
                      <td><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{log.user}</code></td>
                      <td>{log.action}</td>
                      <td style={{ fontWeight: 600 }}>{log.object}</td>
                      <td style={{ color: '#64748b', fontSize: 12 }}>{log.detail}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{log.time}</td>
                      <td><span className={`badge ${log.result === 'SUCCESS' ? 'badge-success' : 'badge-error'}`}>{log.result}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className={styles.auditNote}>All audit logs are tamper-resistant and comply with government IT security standards.</div>
            </div>
          )}

          {/* OTHER TABS PLACEHOLDER */}
          {(tab === 'workforce' || tab === 'training' || tab === 'users') && (
            <div className={`card ${styles.placeholderCard}`}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>
                {tab === 'workforce' ? '🗺️' : tab === 'training' ? '📈' : '👥'}
              </div>
              <h3>{NAV_ITEMS.find(n => n.id === tab)?.label}</h3>
              <p>Full drill-down view available in the complete build. This module includes:</p>
              <ul className={styles.featureList}>
                {tab === 'workforce' && ['Organisation → Department → Role → Competency → Employee drill-down','Individual employee competency profiles','Role-based competency requirements management','Batch assignment and group analytics'].map(f => <li key={f}>{f}</li>)}
                {tab === 'training' && ['Recommended → Enrolled → Started → Completed → Assessed funnel','Pre vs Post assessment competency comparison','Course effectiveness scores (competency improvement per training hour)','Dropout and revision rate analytics'].map(f => <li key={f}>{f}</li>)}
                {tab === 'users' && ['Create / deactivate employee accounts','Assign roles and departments','Permission management (RBAC)','Reset access through approved identity mechanisms'].map(f => <li key={f}>{f}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
