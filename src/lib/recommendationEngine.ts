import igotCatalogData from '../../public/content-list-data.json';

export interface IgotRawCourse {
  identifier: string;
  name: string;
  description: string;
  duration: string;
  appIcon: string;
  posterImage: string;
  primaryCategory: string;
  source: string;
  objectType?: string;
}

export interface OrderedLearningStep {
  phase: number;
  phaseName: string;
  recommendationReason: string;
  estimatedHours: string;
  targetCompetency: string;
  course: IgotRawCourse;
}

/**
 * Role-Based Competency Sequence Catalog
 * Defines the strict, ordered competency journey for different statistical roles.
 */
const ROLE_SEQUENTIAL_FRAMEWORK: Record<string, Array<{
  phase: number;
  phaseName: string;
  keywords: string[];
  targetCompetency: string;
  reason: string;
}>> = {
  'Statistical Officer': [
    {
      phase: 1,
      phaseName: 'Phase 1: Statistical Foundations & Literacy',
      keywords: ['Statistical Literacy', 'Karmayogi', 'Development'],
      targetCompetency: 'Statistical Methods & Survey Standards',
      reason: 'Essential baseline competency required for statistical sample design and data collection accuracy.'
    },
    {
      phase: 2,
      phaseName: 'Phase 2: Digital Analytics & Data Reporting',
      keywords: ['Report Writing Skills', 'AI for Digital Transformation', 'Computer Vision', 'Data'],
      targetCompetency: 'Data Quality & AI Analytics',
      reason: 'Identified gap in modern data visualization and automated report generation tools.'
    },
    {
      phase: 3,
      phaseName: 'Phase 3: Public Finance & Economic Accounts',
      keywords: ['Budgetary System', 'Public Private Partnerships', 'Finance'],
      targetCompetency: 'Economic Accounts & Governance',
      reason: 'Necessary for evaluating district-level economic indicators and scheme budgetary allocations.'
    },
    {
      phase: 4,
      phaseName: 'Phase 4: Policy Integration & Leadership',
      keywords: ['SAMARTH', 'Detailed Project Report', 'Design Thinking'],
      targetCompetency: 'Policy Impact & Institutional Leadership',
      reason: 'Advanced capability needed for leading multi-district survey operations and policy briefings.'
    }
  ],
  'Data Analyst / Investigator': [
    {
      phase: 1,
      phaseName: 'Phase 1: Fundamental Data & Soft Skills',
      keywords: ['Statistical Literacy', 'Soft Skills'],
      targetCompetency: 'Data Entry & Inspection Standards',
      reason: 'Core requirement for field data validation and primary investigator hygiene.'
    },
    {
      phase: 2,
      phaseName: 'Phase 2: Applied AI & Technology',
      keywords: ['AI led Digital Transformation', 'Computer Vision', 'Technology'],
      targetCompetency: 'AI-assisted Quality Verification',
      reason: 'Required for automated field image auditing and survey data cleansing.'
    },
    {
      phase: 3,
      phaseName: 'Phase 3: Official Documentation & Reporting',
      keywords: ['Report Writing', 'Budgetary System'],
      targetCompetency: 'Analytical Report Generation',
      reason: 'Enables official to draft structured survey reports for senior management.'
    }
  ]
};

/**
 * Extracts and orders courses strictly from the real iGOT content-list-data.json
 * based on the official's role and assessed skill gaps.
 */
export function getOrderedRoleRecommendations(role: string = 'Statistical Officer'): OrderedLearningStep[] {
  const rawList: IgotRawCourse[] = Array.isArray((igotCatalogData as any).content) 
    ? (igotCatalogData as any).content 
    : [];

  const framework = ROLE_SEQUENTIAL_FRAMEWORK[role] || ROLE_SEQUENTIAL_FRAMEWORK['Statistical Officer'];
  const orderedPath: OrderedLearningStep[] = [];
  const usedIdentifiers = new Set<string>();

  framework.forEach(stepSpec => {
    // Find matching course strictly from the real iGOT catalog
    const matchedCourse = rawList.find(c => {
      if (!c.identifier || usedIdentifiers.has(c.identifier)) return false;
      const titleAndDesc = `${c.name} ${c.description}`.toLowerCase();
      return stepSpec.keywords.some(kw => titleAndDesc.includes(kw.toLowerCase()));
    });

    if (matchedCourse) {
      usedIdentifiers.add(matchedCourse.identifier);
      const hoursNum = Math.max(1, Math.round(parseInt(matchedCourse.duration || '3600', 10) / 3600));
      
      orderedPath.push({
        phase: stepSpec.phase,
        phaseName: stepSpec.phaseName,
        targetCompetency: stepSpec.targetCompetency,
        recommendationReason: stepSpec.reason,
        estimatedHours: `${hoursNum} Hours`,
        course: matchedCourse
      });
    }
  });

  return orderedPath;
}
