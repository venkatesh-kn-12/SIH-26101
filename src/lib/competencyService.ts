export type CompetencyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface CompetencyEvidence {
  type: 'diagnostic_exam' | 'assessment' | 'course_quiz' | 'completed_course' | 'self_reported';
  score?: number;
  courseId?: string;
  timestamp?: string;
  details?: string;
}

export interface SkillCompetencyProfile {
  skill: string;
  competencyLevel: CompetencyLevel;
  score: number; // 0 - 100
  evidence: CompetencyEvidence[];
}

export interface UserLearningProfile {
  userId: string;
  targetRole: string;
  skills: Record<string, SkillCompetencyProfile>;
  completedCourseIds: string[];
  inProgressCourseIds: string[];
}

/**
 * Calculates a dynamic competency level from a numerical score (0-100)
 */
export function calculateLevelFromScore(score: number): CompetencyLevel {
  if (score >= 88) return 'Expert';
  if (score >= 71) return 'Advanced';
  if (score >= 45) return 'Intermediate';
  return 'Beginner';
}

/**
 * Builds a structured learning and competency profile for a user
 * combining diagnostic assessment, profile intake, self-reported skills, and course quiz evidence.
 */
export function buildUserLearningProfile(
  user: any,
  onboardingData: any,
  assessmentResults: any,
  courseProgressData: any = {}
): UserLearningProfile {
  const userId = user?.empId || 'MOS/DEMO';
  const targetRole = onboardingData?.careerGoal || user?.designation || 'Data Scientist';

  const skillsMap: Record<string, SkillCompetencyProfile> = {};

  // 1. Process Claimed Completed Courses & Intake Skills
  const claimedSkillsStr = onboardingData?.completedCourses || '';
  const claimedList = claimedSkillsStr
    ? claimedSkillsStr.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
    : ['Professional Fundamentals'];

  claimedList.forEach((skill: string) => {
    skillsMap[skill] = {
      skill,
      competencyLevel: 'Intermediate',
      score: 65,
      evidence: [
        {
          type: 'self_reported',
          score: 65,
          timestamp: new Date().toISOString(),
          details: `Claimed skill / completed module: ${skill}`
        }
      ]
    };
  });

  // 2. Process Assessment / Diagnostic Exam Results
  if (assessmentResults?.topicDetails && Array.isArray(assessmentResults.topicDetails)) {
    assessmentResults.topicDetails.forEach((topicItem: any) => {
      const skillName = topicItem.competency || topicItem.topic || 'Domain Practice';
      const isCorrect = Boolean(topicItem.isCorrect);
      const scoreValue = isCorrect ? 85 : topicItem.isAnswered ? 40 : 20;

      const evidenceItem: CompetencyEvidence = {
        type: 'diagnostic_exam',
        score: scoreValue,
        timestamp: assessmentResults.completedAt || new Date().toISOString(),
        details: `Diagnostic question on "${topicItem.topic}": ${topicItem.status}`
      };

      if (!skillsMap[skillName]) {
        skillsMap[skillName] = {
          skill: skillName,
          competencyLevel: calculateLevelFromScore(scoreValue),
          score: scoreValue,
          evidence: [evidenceItem]
        };
      } else {
        skillsMap[skillName].evidence.push(evidenceItem);
        // Recalculate average score
        const totalScore = skillsMap[skillName].evidence.reduce((sum, e) => sum + (e.score || 50), 0);
        const avgScore = Math.round(totalScore / skillsMap[skillName].evidence.length);
        skillsMap[skillName].score = avgScore;
        skillsMap[skillName].competencyLevel = calculateLevelFromScore(avgScore);
      }
    });
  }

  // 3. Process Course Quizzes and Completed Courses Progress
  const completedCourseIds: string[] = [];
  const inProgressCourseIds: string[] = [];

  if (courseProgressData && typeof courseProgressData === 'object') {
    Object.keys(courseProgressData).forEach((courseId: string) => {
      const progress = courseProgressData[courseId];
      if (progress.completed || progress.progressPercentage >= 100) {
        completedCourseIds.push(courseId);
      } else if (progress.progressPercentage > 0) {
        inProgressCourseIds.push(courseId);
      }

      if (progress.quizScore !== undefined) {
        const skillName = progress.skillName || 'Applied Practice';
        const quizEvidence: CompetencyEvidence = {
          type: 'course_quiz',
          courseId,
          score: progress.quizScore,
          timestamp: progress.completedAt || new Date().toISOString(),
          details: `Internal course quiz score: ${progress.quizScore}%`
        };

        if (!skillsMap[skillName]) {
          skillsMap[skillName] = {
            skill: skillName,
            competencyLevel: calculateLevelFromScore(progress.quizScore),
            score: progress.quizScore,
            evidence: [quizEvidence]
          };
        } else {
          skillsMap[skillName].evidence.push(quizEvidence);
          const totalScore = skillsMap[skillName].evidence.reduce((sum, e) => sum + (e.score || 50), 0);
          const avgScore = Math.round(totalScore / skillsMap[skillName].evidence.length);
          skillsMap[skillName].score = avgScore;
          skillsMap[skillName].competencyLevel = calculateLevelFromScore(avgScore);
        }
      }
    });
  }

  return {
    userId,
    targetRole,
    skills: skillsMap,
    completedCourseIds,
    inProgressCourseIds
  };
}
