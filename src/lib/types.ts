// Re-export all types — required because mockData imports from this file
export type UserRole = 'employee' | 'admin';
export interface User { id: string; name: string; employeeId: string; email: string; designation: string; department: string; organisation: string; rank: string; role: UserRole; onboardingComplete: boolean; profileComplete: boolean; }
export interface CompetencyScore { id: string; name: string; category: string; current: number; required: number; gap: 'low' | 'medium' | 'high' | 'none'; timeline: { month: string; score: number }[]; }
export interface SkillProfile { userId: string; strengths: CompetencyScore[]; gaps: CompetencyScore[]; futureSkills: CompetencyScore[]; overallScore: number; lastUpdated: string; careerReadiness: number; }
export interface Course { identifier: string; name: string; description: string; duration: string; appIcon: string; posterImage: string; primaryCategory: string; source: string; objectType: string; competencies?: string[]; difficulty?: 'beginner' | 'intermediate' | 'advanced'; prerequisites?: string[]; tags?: string[]; }
export interface LearningPathPhase { phase: number; title: string; description: string; courses: Course[]; estimatedWeeks: number; status: 'locked' | 'active' | 'completed'; }
export interface LearningPath { id: string; userId: string; title: string; phases: LearningPathPhase[]; targetRole: string; estimatedMonths: number; currentPhase: number; }
export interface Assessment { id: string; type: 'baseline' | 'section' | 'final' | 'periodic'; questions: Question[]; duration: number; score?: number; completed: boolean; completedAt?: string; }
export interface Question { id: string; text: string; options: string[]; correctIndex: number; explanation: string; competency: string; difficulty: 'easy' | 'medium' | 'hard'; topic: string; }
export interface LearningProgress { courseId: string; userId: string; mode: 'ai_guided' | 'igot_direct'; percentComplete: number; sectionsCompleted: number; totalSections: number; timeSpentMinutes: number; lastAccessed: string; score?: number; status: 'not_started' | 'in_progress' | 'completed'; }
export interface DailyByte { id: string; concept: string; shortExplanation: string; scenario: string; answer: string; competency: string; date: string; }
export interface Notification { id: string; type: 'new_course' | 'revision' | 'career' | 'achievement' | 'assessment'; title: string; message: string; timestamp: string; read: boolean; actionUrl?: string; }
export interface OrganisationStats { totalEmployees: number; activeUsers: number; avgSkillScore: number; highPriorityGaps: number; completionRate: number; learningHoursTotal: number; departments: DepartmentStat[]; }
export interface DepartmentStat { name: string; employees: number; avgScore: number; completionRate: number; criticalGaps: string[]; }
export interface HeatmapCell { department: string; skill: string; level: 'low' | 'medium' | 'high' | 'critical'; percentage: number; }
export interface MCQGenerationRequest { documentTitle: string; content: string; count: number; difficulty: 'easy' | 'medium' | 'hard' | 'mixed'; topic?: string; }
export interface GeneratedMCQ { id: string; question: string; options: string[]; correctIndex: number; explanation: string; difficulty: string; topic: string; sourceReference?: string; }
export interface CareerPath { current: string; target: string; readiness: number; missingSkills: CompetencyScore[]; estimatedMonths: number; }
