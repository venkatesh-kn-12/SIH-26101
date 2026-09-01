import { UserLearningProfile, CompetencyLevel } from './competencyService';

export interface SkillGapItem {
  skill: string;
  currentLevel: CompetencyLevel;
  requiredLevel: CompetencyLevel;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

export interface SkillGapAnalysis {
  career_goal: string;
  current_skills: string[];
  current_level: string;
  required_skills: string[];
  skill_gaps: string[];
  structuredGaps: SkillGapItem[];
  semantic_query: string;
}

// Domain Skill Mapping for Career Goals
const CAREER_GOAL_SKILL_MAP: Record<string, string[]> = {
  'Data Scientist': ['Python', 'NumPy', 'Pandas', 'Matplotlib', 'Statistics', 'Data Visualization', 'Machine Learning', 'Scikit-learn'],
  'Software Architect': ['System Design', 'Microservices', 'Cloud Infrastructure', 'Database Management', 'API Design', 'DevOps', 'Security'],
  'Lead Developer': ['Data Structures', 'System Design', 'Code Optimization', 'CI/CD Pipelines', 'Object-Oriented Design', 'Code Review'],
  'Statistical Officer': ['Survey Design', 'Sampling Methods', 'Data Quality', 'Statistical Methods', 'Price Indices', 'Index Numbers', 'Report Writing'],
  'Data Analyst': ['Data Cleaning', 'SQL', 'Data Visualization', 'Exploratory Data Analysis', 'Excel', 'Statistical Literacy', 'Reporting'],
  'Project Manager': ['Project Management', 'Agile Principles', 'Risk Assessment', 'Budgetary System', 'Stakeholder Communication', 'Resource Allocation'],
  'Director / Department Head': ['Strategic Leadership', 'Public Policy', 'Data Governance', 'Budgetary System', 'Institutional Strategy', 'Design Thinking'],
};

export function analyzeSkillGapFromProfile(learningProfile: UserLearningProfile): SkillGapAnalysis {
  const goalClean = (learningProfile.targetRole || 'Data Scientist').trim();

  // Find required skills for target career goal
  let requiredSkills: string[] = [];
  const matchedKey = Object.keys(CAREER_GOAL_SKILL_MAP).find(
    k => k.toLowerCase() === goalClean.toLowerCase() || goalClean.toLowerCase().includes(k.toLowerCase())
  );

  if (matchedKey) {
    requiredSkills = CAREER_GOAL_SKILL_MAP[matchedKey];
  } else {
    requiredSkills = [
      `${goalClean} Fundamentals`,
      'Domain Methodology',
      'Applied Analysis',
      'Advanced Techniques',
      'Quality Standards'
    ];
  }

  const structuredGaps: SkillGapItem[] = [];
  const missingSkillNames: string[] = [];
  const currentSkillsList: string[] = [];

  requiredSkills.forEach(reqSkill => {
    const userSkillProfile = learningProfile.skills[reqSkill] || 
      Object.values(learningProfile.skills).find(s => s.skill.toLowerCase().includes(reqSkill.toLowerCase()));

    if (!userSkillProfile) {
      // Completely missing skill -> High priority Beginner gap
      missingSkillNames.push(reqSkill);
      structuredGaps.push({
        skill: reqSkill,
        currentLevel: 'Beginner',
        requiredLevel: 'Intermediate',
        priority: 'high',
        reason: `No evidence found for "${reqSkill}". Mandatory skill for ${goalClean}.`
      });
    } else {
      currentSkillsList.push(`${reqSkill} (${userSkillProfile.competencyLevel})`);
      if (userSkillProfile.competencyLevel === 'Beginner') {
        missingSkillNames.push(reqSkill);
        structuredGaps.push({
          skill: reqSkill,
          currentLevel: 'Beginner',
          requiredLevel: 'Intermediate',
          priority: 'medium',
          reason: `Demonstrated beginner knowledge in "${reqSkill}". Needs advancement to Intermediate.`
        });
      }
    }
  });

  const finalSkillGaps = missingSkillNames.length > 0 ? missingSkillNames : [`Advanced ${goalClean} Specialisation`];

  // Build semantic retrieval query with per-skill level evidence
  const semanticQuery = `Target role:
${goalClean}

Skill gaps:
${finalSkillGaps.join(', ')}

Current demonstrated skills & levels:
${currentSkillsList.length > 0 ? currentSkillsList.join(', ') : 'None specified'}

Recommended learning level:
Beginner / Intermediate

Find courses that help close the user's current skill gaps and progressively move the user toward the ${goalClean} role.`;

  return {
    career_goal: goalClean,
    current_skills: Object.keys(learningProfile.skills),
    current_level: 'Per-Skill Level Dynamic',
    required_skills: requiredSkills,
    skill_gaps: finalSkillGaps,
    structuredGaps,
    semantic_query: semanticQuery
  };
}

export function analyzeSkillGap(request: { career_goal: string; current_skills: string[]; current_level: string }): SkillGapAnalysis {
  const dummyProfile: UserLearningProfile = {
    userId: 'MOS/USER',
    targetRole: request.career_goal,
    skills: (request.current_skills || []).reduce((acc, s) => {
      acc[s] = { skill: s, competencyLevel: (request.current_level as any) || 'Beginner', score: 60, evidence: [] };
      return acc;
    }, {} as any),
    completedCourseIds: [],
    inProgressCourseIds: []
  };

  return analyzeSkillGapFromProfile(dummyProfile);
}
