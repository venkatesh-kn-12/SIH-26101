import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name = 'Candidate',
      dept = 'General Administration / Operations',
      designation = 'Professional Officer',
      education = 'Bachelor Degree',
      experience = '1-3 years',
      completedCourses = 'Data Analytics, Project Management',
      careerGoal = 'Senior Lead / Department Head'
    } = body;

    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'qwen-2.5-32b';
    const baseUrl = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';

    // Check if valid Groq API key is configured
    const isApiKeyValid = Boolean(apiKey && apiKey !== 'your_groq_api_key_here' && apiKey.trim().length > 0);

    if (isApiKeyValid) {
      console.log(`\n==================================================`);
      console.log(`🤖 [LLM Quiz Generator] Calling Groq LLM API (${model})...`);
      console.log(`   Candidate: ${name} | Target Role: ${careerGoal}`);
      console.log(`   Claimed Courses: ${completedCourses}`);
      console.log(`   Qualification: ${education} | Experience: ${experience}`);
      console.log(`==================================================\n`);

      try {
        const prompt = `You are a Universal AI Competency Assessment & Recommendation Director for StatPath AI.
Your platform evaluates professionals across ALL domains (Software Engineering, Data Science, Healthcare, Finance, Management, HR, Public Policy, Administration, Marketing, Law, etc.).

Your primary mission is to generate a 5-question Adaptive Skill Assessment quiz. Each question MUST directly test a distinct skill/competency required for the candidate's target career goal (${careerGoal}), so that their quiz performance directly feeds into our Course Recommendation Engine to recommend specific remedial learning courses for any failed questions.

Candidate Profile:
- Name: ${name}
- Department / Division: ${dept}
- Current Role / Designation: ${designation}
- Educational Qualification: ${education}
- Past Experience Range: ${experience}
- Claimed Completed Courses & Skills: ${completedCourses}
- Target Career Progression Goal: ${careerGoal}

QUESTION GENERATION CRITERIA FOR COURSE RECOMMENDATION ENGINE:
1. Detect candidate's domain from their completed courses, education, and career goal.
2. Select 5 distinct competency areas relevant to their domain & target role (${careerGoal}).
3. Question 1: Test practical technical execution of their claimed completed course ("${completedCourses}").
4. Question 2: Test real-world problem solving for their past experience level ("${experience}").
5. Question 3: Test domain theoretical principles from their qualification ("${education}").
6. Question 4: Test advanced decision-making required for their target role ("${careerGoal}").
7. Question 5: Test governance, operational quality, or modern tooling in their field.

Output ONLY a valid JSON array of 5 objects (no markdown, no code blocks, no text before or after). Each object must have:
- "id": string (e.g. "q1", "q2")
- "text": string (the question text)
- "options": array of 4 distinct string choices
- "correctIndex": number (0, 1, 2, or 3)
- "explanation": string (explaining why the correct option is right)
- "competency": string (e.g. "Python Programming", "System Architecture", "Financial Analytics", "Data Quality", "Leadership")
- "difficulty": "easy" | "medium" | "hard"
- "topic": string (short topic name)
- "validationTarget": string (e.g. "Validating Claimed Skill: ${completedCourses.split(',')[0] || 'Domain Skill'}")
- "recommendedCourseKeyword": string (single keyword used by course recommendation model to recommend learning modules if candidate fails this question, e.g. "Python", "Data", "AI", "System", "Cloud", "Finance", "Leadership", "Report Writing")
- "gapImpact": "high" | "medium" | "low"
`;

        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'system',
                content: 'You are an AI question generator that outputs raw JSON arrays of multiple choice questions formatted for course recommendation engines, without any markdown wrapping.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.3,
            max_tokens: 2000
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content?.trim();

          if (content) {
            const jsonStr = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
            const questions = JSON.parse(jsonStr);

            if (Array.isArray(questions) && questions.length > 0) {
              console.log(`✅ [LLM Quiz Generator] Successfully generated 5 dynamic questions via Groq LLM (${model}).`);
              return NextResponse.json({
                source: 'groq-qwen',
                llmCalled: true,
                model,
                statusMessage: `✅ Successfully generated custom questions using Groq LLM (${model}) based on candidate profile.`,
                questions
              });
            }
          }
        } else {
          const errText = await response.text();
          console.warn(`⚠️ [LLM Quiz Generator] Groq API returned error status ${response.status}: ${errText}`);
        }
      } catch (groqError: any) {
        console.error(`⚠️ [LLM Quiz Generator] Exception calling Groq LLM API: ${groqError.message}`);
        console.warn(`⚠️ Executing profile-customized fallback question generator...`);
      }
    } else {
      console.log(`\n==================================================`);
      console.log(`⚠️ [LLM Quiz Generator] GROQ_API_KEY is missing or set to placeholder in .env.`);
      console.log(`   Executing profile-customized Fallback Generator for candidate: ${name}...`);
      console.log(`   (To enable live Groq LLM calls, set a valid GROQ_API_KEY in .env)`);
      console.log(`==================================================\n`);
    }

    // Fallback: Generate profile-customized questions matching registration input
    const fallbackQuestions = generateUniversalProfileQuestions({
      education,
      experience,
      completedCourses,
      careerGoal,
      designation,
      dept
    });

    return NextResponse.json({
      source: isApiKeyValid ? 'groq-fallback' : 'profile-simulated',
      llmCalled: false,
      statusMessage: isApiKeyValid
        ? '⚠️ Groq API call encountered an error. Executing profile-customized fallback engine.'
        : '⚠️ GROQ_API_KEY not configured in .env. Executing profile-customized adaptive verification fallback.',
      questions: fallbackQuestions
    });

  } catch (error: any) {
    console.error(`❌ [LLM Quiz Generator] Critical error: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Fallback question generator tailored dynamically to candidate registration input
function generateUniversalProfileQuestions(profile: {
  education: string;
  experience: string;
  completedCourses: string;
  careerGoal: string;
  designation: string;
  dept: string;
}) {
  const coursesList = profile.completedCourses && profile.completedCourses.toLowerCase() !== 'none'
    ? profile.completedCourses.split(',').map(c => c.trim())
    : ['Professional Fundamentals'];
  
  const primaryCourse = coursesList[0] || 'Core Domain Competency';

  return [
    {
      id: 'q1',
      text: `In practical execution of your claimed completed course/skill (${primaryCourse}), which methodology or core principle is essential to ensure quality execution and mitigate risk?`,
      options: [
        'Ad-hoc execution without documented processes',
        'Structured standards, iterative validation, and objective measurement metrics',
        'Relying entirely on post-hoc manual review without baseline metrics',
        'Bypassing initial requirements gathering to accelerate timeline'
      ],
      correctIndex: 1,
      explanation: 'Structured standards, baseline metrics, and iterative validation are fundamental across all technical and operational domains to guarantee quality execution.',
      competency: `${primaryCourse} Principles`,
      difficulty: 'medium' as const,
      topic: 'Applied Practice',
      validationTarget: `Validating Claimed Skill: ${primaryCourse}`,
      recommendedCourseKeyword: primaryCourse.split(' ')[0] || 'Data',
      gapImpact: 'high' as const
    },
    {
      id: 'q2',
      text: `Given your declared past experience level (${profile.experience || '1-3 years'}), how should complex operational bottlenecks or multi-variable challenges in ${profile.dept || 'your department'} be systematically addressed?`,
      options: [
        'Escalating immediately without preliminary root-cause analysis',
        'Conducting root-cause analysis, mapping dependency workflows, and testing pilot interventions',
        'Implementing immediate site-wide changes without control testing',
        'Ignoring low-frequency operational anomalies'
      ],
      correctIndex: 1,
      explanation: 'Experienced professionals employ root-cause analysis and dependency mapping before rolling out interventions to minimize risk.',
      competency: 'Operational Problem Solving',
      difficulty: profile.experience.includes('5') || profile.experience.includes('10') || profile.experience.includes('15') ? 'hard' as const : 'medium' as const,
      topic: 'Experience Verification',
      validationTarget: `Validating Past Experience: ${profile.experience || 'Professional Background'}`,
      recommendedCourseKeyword: 'Statistical Literacy',
      gapImpact: 'medium' as const
    },
    {
      id: 'q3',
      text: `Based on your educational background (${profile.education || 'Higher Education Degree'}), what is the key theoretical framework used to evaluate performance efficiency and resource allocation?`,
      options: [
        'Unconstrained resource distribution without KPI alignment',
        'Objective KPI benchmarking, ratio analysis, and cost-benefit optimization',
        'Subjective feedback without standardized performance indicators',
        'Static annual budgeting without quarterly variance tracking'
      ],
      correctIndex: 1,
      explanation: 'Formal higher education emphasizes standardized performance metrics, ratio analysis, and cost-benefit frameworks for resource allocation.',
      competency: 'Domain Fundamentals',
      difficulty: 'medium' as const,
      topic: 'Theoretical Foundations',
      validationTarget: `Validating Qualification: ${profile.education || 'Education'}`,
      recommendedCourseKeyword: 'Development',
      gapImpact: 'medium' as const
    },
    {
      id: 'q4',
      text: `Targeting career progression to ${profile.careerGoal || 'Senior Leadership'}, which strategic initiative best demonstrates governance maturity and organizational leadership?`,
      options: [
        'Maintaining siloed departmental communications to restrict data access',
        'Establishing cross-functional alignment, clear SLA standards, and continuous learning frameworks',
        'Minimizing technology adoption to reduce operational training overhead',
        'Focusing exclusively on short-term deliverables while deferring long-term skill development'
      ],
      correctIndex: 1,
      explanation: 'Targeting leadership roles requires establishing cross-functional alignment, SLA standards, and empowering teams through continuous capacity building.',
      competency: 'Strategic Leadership & Governance',
      difficulty: 'hard' as const,
      topic: 'Target Role Readiness',
      validationTarget: `Target Goal Verification: ${profile.careerGoal || 'Leadership Role'}`,
      recommendedCourseKeyword: 'Design Thinking',
      gapImpact: 'high' as const
    },
    {
      id: 'q5',
      text: `In your role as ${profile.designation || 'Professional Specialist'}, when integrating modern digital tools into legacy workflows, what key step prevents operational disruption?`,
      options: [
        'Phased implementation with fallback options, user training, and automated validation checks',
        'Immediate total shutdown of legacy systems without parallel testing',
        'Delegating security and compliance verification entirely to external vendors',
        'Eliminating documentation to speed up system deployment'
      ],
      correctIndex: 0,
      explanation: 'Phased implementation paired with parallel testing and automated validation checks ensures operational continuity during digital transformation.',
      competency: 'Digital Transformation & Quality',
      difficulty: 'hard' as const,
      topic: 'Role Best Practices',
      validationTarget: `Role Verification: ${profile.designation || 'Professional Role'}`,
      recommendedCourseKeyword: 'AI for Digital Transformation',
      gapImpact: 'high' as const
    }
  ];
}
