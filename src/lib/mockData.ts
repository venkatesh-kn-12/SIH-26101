import type { CompetencyScore, Course, LearningPathPhase, OrganisationStats, DailyByte, Notification, CareerPath } from './types';

export const DEMO_USER = {
  id: 'u001',
  name: 'Priya Sharma',
  employeeId: 'MOS/2019/1842',
  email: 'priya.sharma@mospi.gov.in',
  designation: 'Statistical Officer',
  department: 'Price Statistics Division',
  organisation: 'Ministry of Statistics & Programme Implementation',
  rank: 'Group A',
  role: 'employee' as const,
  onboardingComplete: true,
  profileComplete: true,
};

export const COMPETENCY_SCORES: CompetencyScore[] = [
  { id: 'c1', name: 'Survey Design', category: 'Core Statistics', current: 4.1, required: 4.5, gap: 'low', timeline: [{month:'Jan',score:3.2},{month:'Mar',score:3.6},{month:'May',score:3.9},{month:'Jul',score:4.1}] },
  { id: 'c2', name: 'Statistical Methods', category: 'Core Statistics', current: 3.9, required: 4.0, gap: 'low', timeline: [{month:'Jan',score:3.1},{month:'Mar',score:3.4},{month:'May',score:3.7},{month:'Jul',score:3.9}] },
  { id: 'c3', name: 'Data Quality', category: 'Core Statistics', current: 3.7, required: 4.0, gap: 'low', timeline: [{month:'Jan',score:2.9},{month:'Mar',score:3.2},{month:'May',score:3.5},{month:'Jul',score:3.7}] },
  { id: 'c4', name: 'Price Indices', category: 'Specialisation', current: 4.3, required: 4.0, gap: 'none', timeline: [{month:'Jan',score:3.8},{month:'Mar',score:4.0},{month:'May',score:4.2},{month:'Jul',score:4.3}] },
  { id: 'c5', name: 'Python Programming', category: 'Technology', current: 1.8, required: 3.5, gap: 'high', timeline: [{month:'Jan',score:1.2},{month:'Mar',score:1.4},{month:'May',score:1.6},{month:'Jul',score:1.8}] },
  { id: 'c6', name: 'SQL & Databases', category: 'Technology', current: 2.4, required: 3.5, gap: 'medium', timeline: [{month:'Jan',score:1.8},{month:'Mar',score:2.0},{month:'May',score:2.2},{month:'Jul',score:2.4}] },
  { id: 'c7', name: 'AI / ML Fundamentals', category: 'Emerging', current: 1.2, required: 3.0, gap: 'high', timeline: [{month:'Jan',score:0.8},{month:'Mar',score:0.9},{month:'May',score:1.1},{month:'Jul',score:1.2}] },
  { id: 'c8', name: 'Data Visualisation', category: 'Technology', current: 2.8, required: 3.5, gap: 'medium', timeline: [{month:'Jan',score:2.0},{month:'Mar',score:2.3},{month:'May',score:2.6},{month:'Jul',score:2.8}] },
  { id: 'c9', name: 'Sampling Theory', category: 'Core Statistics', current: 3.5, required: 4.0, gap: 'medium', timeline: [{month:'Jan',score:2.8},{month:'Mar',score:3.0},{month:'May',score:3.3},{month:'Jul',score:3.5}] },
  { id: 'c10', name: 'Report Writing', category: 'Communication', current: 4.0, required: 3.5, gap: 'none', timeline: [{month:'Jan',score:3.5},{month:'Mar',score:3.7},{month:'May',score:3.9},{month:'Jul',score:4.0}] },
];

export const IGOT_COURSES: Course[] = [
  { identifier: 'do_113882141418250240173', name: 'Statistical Literacy', description: 'An introductory course on statistics covering fundamental concepts, data interpretation, and statistical reasoning.', duration: '23193', appIcon: 'https://static.karmayogiprod.nic.in/igotprod/collection/do_113882141418250240173/artifact/do_113892064993263616133_1695808715910_statisticalliteracy1695808715395.thumb.jpg', posterImage: 'https://portal.igotkarmayogi.gov.in/content-store/content/do_113892064993263616133/artifact/do_113892064993263616133_1695808715910_statisticalliteracy1695808715395.jpg', primaryCategory: 'Course', source: 'Indian Institute Of Management Bangalore', objectType: 'Course', competencies: ['Statistical Methods', 'Data Quality'], difficulty: 'beginner', tags: ['statistics', 'data', 'fundamentals'] },
  { identifier: 'do_113972582072418304168', name: 'AI led Digital Transformation in Healthcare', description: 'Empowering government officers with AI knowledge and understanding for digital transformation.', duration: '4500', appIcon: 'https://storage.googleapis.com/igotprod/collection/do_113972582072418304168/artifact/do_113974713344876544159_1705897627121.thumb.jpg', posterImage: 'https://portal.prod.karmayogibharat.net/content-store/content/do_113974713344876544159/artifact/do_113974713344876544159_1705897625814_health1705897627121.jpg', primaryCategory: 'Course', source: 'Wadhwani Institute of Technology and Policy', objectType: 'Course', competencies: ['AI / ML Fundamentals'], difficulty: 'intermediate', tags: ['AI', 'digital transformation', 'technology'] },
  { identifier: 'do_113966321785135104177', name: 'AI for Digital Transformation: Computer Vision', description: 'Exclusive course on AI for Digital Transformation focusing on Computer Vision for Government officers.', duration: '4500', appIcon: 'https://storage.googleapis.com/igotprod/collection/do_113966321785135104177/artifact/do_113966394449133568172_1704882135616_cvcourse1704882135704.thumb.jpg', posterImage: 'https://portal.prod.karmayogibharat.net/content-store/content/do_113966394449133568172/artifact/do_113966394449133568172_1704882135616_cvcourse1704882135704.jpg', primaryCategory: 'Course', source: 'Wadhwani Institute of Technology and Policy', objectType: 'Course', competencies: ['AI / ML Fundamentals', 'Python Programming'], difficulty: 'advanced', tags: ['AI', 'computer vision', 'machine learning'] },
  { identifier: 'do_113963034661167104150', name: 'Public Private Partnerships Beginners eCourse', description: 'Comprehensive e-course for understanding PPPs in infrastructure development.', duration: '26140', appIcon: 'https://storage.googleapis.com/igotprod/collection/do_113963034661167104150/artifact/do_113979904940408832124_1706531365376_ecoursemin1706531365410.thumb.png', posterImage: 'https://portal.prod.karmayogibharat.net/content-store/content/do_113979904940408832124/artifact/do_113979904940408832124_1706531365376_ecoursemin1706531365410.png', primaryCategory: 'Course', source: 'Department of Economic Affairs', objectType: 'Course', competencies: ['Report Writing'], difficulty: 'beginner', tags: ['PPP', 'policy', 'governance'] },
  { identifier: 'do_1140044070999326721244', name: 'Understanding Development Programs', description: 'How Karmayogis can play a crucial role in driving Development forward. Relevant for SO to JS level civil servants.', duration: '17100', appIcon: 'https://storage.googleapis.com/igotprod/collection/do_1140044070999326721244/artifact/do_113966446839046144187_1704888530826_m0m1thumbnail31704888530709.thumb.jpg', posterImage: 'https://portal.prod.karmayogibharat.net/content-store/content/do_113966446839046144187/artifact/do_113966446839046144187_1704888530826_m0m1thumbnail31704888530709.jpg', primaryCategory: 'Course', source: 'Indian School of Development Management', objectType: 'Course', competencies: ['Report Writing', 'Survey Design'], difficulty: 'intermediate', tags: ['development', 'governance', 'policy'] },
  { identifier: 'do_113981544641339392163', name: 'Design Thinking For Excellence In Public Services', description: 'Apply design principles to enhance moral agency and purpose in public leadership.', duration: '9600', appIcon: 'https://storage.googleapis.com/igotprod/collection/do_113981544641339392163/artifact/do_113981607659659264150_1706739216936_coverpage19201080px81706739216718.thumb.png', posterImage: 'https://portal.prod.karmayogibharat.net/content-store/content/do_113981607659659264150/artifact/do_113981607659659264150_1706739216936_coverpage19201080px81706739216718.png', primaryCategory: 'Course', source: 'Brhat', objectType: 'Course', competencies: ['Survey Design'], difficulty: 'intermediate', tags: ['design thinking', 'innovation', 'public service'] },
];

export const LEARNING_PHASES: LearningPathPhase[] = [
  { phase: 1, title: 'Foundation — Python & Data', description: 'Build foundational programming skills essential for statistical analysis.', estimatedWeeks: 4, status: 'active', courses: [IGOT_COURSES[0], IGOT_COURSES[3]] },
  { phase: 2, title: 'Applied Statistics & Tools', description: 'Apply statistical methods using modern tools and software.', estimatedWeeks: 6, status: 'locked', courses: [IGOT_COURSES[1], IGOT_COURSES[4]] },
  { phase: 3, title: 'AI & Machine Learning', description: 'Develop AI/ML competencies relevant to official statistics.', estimatedWeeks: 8, status: 'locked', courses: [IGOT_COURSES[2], IGOT_COURSES[5]] },
  { phase: 4, title: 'Advanced Specialisation', description: 'Achieve advanced competency in data science for official statistics.', estimatedWeeks: 8, status: 'locked', courses: [] },
];

export const ORG_STATS: OrganisationStats = {
  totalEmployees: 12842,
  activeUsers: 9614,
  avgSkillScore: 3.2,
  highPriorityGaps: 2431,
  completionRate: 74,
  learningHoursTotal: 284600,
  departments: [
    { name: 'Price Statistics Division', employees: 1240, avgScore: 3.4, completionRate: 78, criticalGaps: ['AI/ML', 'Python'] },
    { name: 'Agricultural Statistics', employees: 1890, avgScore: 3.1, completionRate: 71, criticalGaps: ['AI/ML', 'GIS', 'Remote Sensing'] },
    { name: 'National Accounts', employees: 890, avgScore: 3.6, completionRate: 82, criticalGaps: ['Python', 'Data Engineering'] },
    { name: 'Social Statistics', employees: 1430, avgScore: 3.0, completionRate: 69, criticalGaps: ['SQL', 'AI/ML', 'Cloud'] },
    { name: 'Industrial Statistics', employees: 1100, avgScore: 3.3, completionRate: 76, criticalGaps: ['GIS', 'Python', 'Cloud'] },
    { name: 'Foreign Trade Statistics', employees: 760, avgScore: 3.5, completionRate: 80, criticalGaps: ['AI/ML', 'Data Viz'] },
  ]
};

export const DAILY_BYTE: DailyByte = {
  id: 'db_today',
  concept: 'Stratified Random Sampling',
  shortExplanation: 'A method where the population is divided into distinct subgroups (strata) and a random sample is drawn from each stratum proportionally.',
  scenario: 'You are conducting a price survey across India. You divide states into 4 zones. Instead of sampling randomly from all states, you draw samples from each zone separately. This is an example of:',
  answer: 'Stratified Random Sampling — because you divided the population into zones (strata) before sampling.',
  competency: 'Sampling Theory',
  date: new Date().toISOString(),
};

export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'new_course', title: 'New Course Available', message: 'iGOT has a newly available course on "Python for Statistical Analysis" matching your identified skill gap.', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false, actionUrl: '/dashboard/learn' },
  { id: 'n2', type: 'revision', title: 'Quick Revision Due', message: 'You learned Stratified Sampling 21 days ago. Take a 3-minute refresher to maintain retention.', timestamp: new Date(Date.now() - 86400000).toISOString(), read: false, actionUrl: '/dashboard/learn' },
  { id: 'n3', type: 'career', title: 'Career Milestone', message: 'You are 62% aligned with the competency requirements for Senior Statistical Officer.', timestamp: new Date(Date.now() - 172800000).toISOString(), read: true, actionUrl: '/dashboard/career' },
  { id: 'n4', type: 'assessment', title: 'Assessment Due', message: 'Your 3-month periodic competency reassessment is scheduled for this week.', timestamp: new Date(Date.now() - 259200000).toISOString(), read: true, actionUrl: '/dashboard/assess' },
];

export const CAREER_PATH: CareerPath = {
  current: 'Statistical Officer',
  target: 'Senior Statistical Officer',
  readiness: 62,
  estimatedMonths: 14,
  missingSkills: [
    { id: 'g1', name: 'Python Programming', category: 'Technology', current: 1.8, required: 3.5, gap: 'high', timeline: [] },
    { id: 'g2', name: 'AI / ML Fundamentals', category: 'Emerging', current: 1.2, required: 3.0, gap: 'high', timeline: [] },
    { id: 'g3', name: 'SQL & Databases', category: 'Technology', current: 2.4, required: 3.5, gap: 'medium', timeline: [] },
    { id: 'g4', name: 'Data Visualisation', category: 'Technology', current: 2.8, required: 3.5, gap: 'medium', timeline: [] },
    { id: 'g5', name: 'Sampling Theory', category: 'Core Statistics', current: 3.5, required: 4.0, gap: 'medium', timeline: [] },
  ],
};

export const ASSESSMENT_QUESTIONS = [
  { id: 'q1', text: 'Which sampling method divides the population into subgroups before sampling?', options: ['Simple Random', 'Stratified Random', 'Cluster', 'Systematic'], correctIndex: 1, explanation: 'Stratified sampling divides the population into homogeneous subgroups called strata.', competency: 'Sampling Theory', difficulty: 'easy' as const, topic: 'Sampling Methods' },
  { id: 'q2', text: 'In a price index, what does the Laspeyres formula use as weights?', options: ['Current period quantities', 'Base period quantities', 'Average quantities', 'Geometric mean'], correctIndex: 1, explanation: 'The Laspeyres index uses base-period quantities as weights, keeping them fixed.', competency: 'Price Indices', difficulty: 'medium' as const, topic: 'Index Numbers' },
  { id: 'q3', text: 'Which Python library is most commonly used for statistical analysis?', options: ['NumPy', 'Pandas', 'SciPy', 'Matplotlib'], correctIndex: 2, explanation: 'SciPy provides statistical functions and tests, while Pandas handles data manipulation.', competency: 'Python Programming', difficulty: 'easy' as const, topic: 'Python Tools' },
  { id: 'q4', text: 'What is the purpose of a control chart in statistical quality control?', options: ['To summarise data', 'To monitor process variation over time', 'To test hypotheses', 'To compute correlations'], correctIndex: 1, explanation: 'Control charts track process variation and signal when a process may be out of control.', competency: 'Data Quality', difficulty: 'medium' as const, topic: 'Quality Control' },
  { id: 'q5', text: 'In regression analysis, what does R-squared measure?', options: ['Slope of the line', 'Correlation direction', 'Proportion of variance explained', 'Number of observations'], correctIndex: 2, explanation: 'R-squared (coefficient of determination) measures how much variance in the dependent variable is explained by the model.', competency: 'Statistical Methods', difficulty: 'hard' as const, topic: 'Regression' },
];

export const HEATMAP_DATA = [
  { department: 'Price Statistics', skill: 'Python', level: 'high' as const, percentage: 68 },
  { department: 'Price Statistics', skill: 'AI/ML', level: 'critical' as const, percentage: 82 },
  { department: 'Price Statistics', skill: 'SQL', level: 'medium' as const, percentage: 45 },
  { department: 'Price Statistics', skill: 'GIS', level: 'low' as const, percentage: 22 },
  { department: 'Agricultural Stat', skill: 'Python', level: 'high' as const, percentage: 71 },
  { department: 'Agricultural Stat', skill: 'AI/ML', level: 'critical' as const, percentage: 85 },
  { department: 'Agricultural Stat', skill: 'SQL', level: 'medium' as const, percentage: 48 },
  { department: 'Agricultural Stat', skill: 'GIS', level: 'high' as const, percentage: 65 },
  { department: 'National Accounts', skill: 'Python', level: 'medium' as const, percentage: 42 },
  { department: 'National Accounts', skill: 'AI/ML', level: 'high' as const, percentage: 70 },
  { department: 'National Accounts', skill: 'SQL', level: 'low' as const, percentage: 28 },
  { department: 'National Accounts', skill: 'GIS', level: 'low' as const, percentage: 18 },
  { department: 'Social Statistics', skill: 'Python', level: 'critical' as const, percentage: 78 },
  { department: 'Social Statistics', skill: 'AI/ML', level: 'critical' as const, percentage: 88 },
  { department: 'Social Statistics', skill: 'SQL', level: 'high' as const, percentage: 62 },
  { department: 'Social Statistics', skill: 'GIS', level: 'medium' as const, percentage: 40 },
];
