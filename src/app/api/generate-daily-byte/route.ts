import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name = 'Candidate',
      careerGoal = 'Data Scientist',
      completedCourses = 'Python',
      education = 'Bachelor Degree',
      experience = '1-3 years',
      dept = 'Operations'
    } = body;

    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'qwen-2.5-32b';
    const baseUrl = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';

    const isApiKeyValid = Boolean(apiKey && apiKey !== 'your_groq_api_key_here' && apiKey.trim().length > 0);

    if (isApiKeyValid) {
      try {
        console.log(`⚡ [Daily Byte Generator] Invoking Groq LLM (${model}) for domain: ${completedCourses} / ${careerGoal}...`);

        const prompt = `You are a Daily Micro-Learning Content Creator for SkillPath AI.
Generate a 5-10 minute Daily Byte micro-learning unit and a 3-question scenario quiz tailored to the user's specific domain background and target career goal.

Candidate Domain Context:
- Name: ${name}
- Claimed Completed Courses & Skills: ${completedCourses}
- Target Career Role: ${careerGoal}
- Department: ${dept}
- Experience Level: ${experience}

OUTPUT REQUIREMENT:
Return ONLY a valid JSON object matching this exact schema (no markdown, no code blocks):

{
  "concept": "string (Short, clear concept title in candidate's domain)",
  "competency": "string (Skill competency name)",
  "shortExplanation": "string (Concise 2-sentence explanation of the concept)",
  "exampleTitle": "string (Title of real-world scenario)",
  "exampleText": "string (Practical real-world application text)",
  "diagramSteps": [
    "string (Step 1 description)",
    "string (Step 2 description)",
    "string (Step 3 description)"
  ],
  "quizQuestions": [
    {
      "id": "q1",
      "questionText": "string (Question 1 testing core execution)",
      "options": ["string (Opt A)", "string (Opt B)", "string (Opt C)", "string (Opt D)"],
      "correctIndex": number (0 to 3),
      "explanation": "string (Detailed explanation)"
    },
    {
      "id": "q2",
      "questionText": "string (Question 2 testing real-world problem solving)",
      "options": ["string (Opt A)", "string (Opt B)", "string (Opt C)", "string (Opt D)"],
      "correctIndex": number (0 to 3),
      "explanation": "string (Detailed explanation)"
    },
    {
      "id": "q3",
      "questionText": "string (Question 3 testing best practices or optimization)",
      "options": ["string (Opt A)", "string (Opt B)", "string (Opt C)", "string (Opt D)"],
      "correctIndex": number (0 to 3),
      "explanation": "string (Detailed explanation)"
    }
  ],
  "retentionItems": [
    { "concept": "string (Domain Concept 1)", "learnedDays": 21, "status": "due" },
    { "concept": "string (Domain Concept 2)", "learnedDays": 14, "status": "due" },
    { "concept": "string (Domain Concept 3)", "learnedDays": 7, "status": "ok" },
    { "concept": "string (Domain Concept 4)", "learnedDays": 3, "status": "ok" }
  ]
}
`;

        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content: 'You are an AI content generator that outputs raw JSON objects without markdown code blocks.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.3,
            max_tokens: 1800
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content?.trim();
          if (content) {
            const jsonStr = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
            const parsed = JSON.parse(jsonStr);
            if (parsed && parsed.concept && Array.isArray(parsed.quizQuestions) && parsed.quizQuestions.length > 0) {
              console.log(`✅ [Daily Byte Generator] Generated 3-question daily quiz via Groq LLM.`);
              return NextResponse.json({
                source: 'groq-qwen',
                model,
                byte: parsed
              });
            }
          }
        }
      } catch (err: any) {
        console.warn(`⚠️ [Daily Byte Generator] Groq LLM failed: ${err.message}. Using domain fallback engine.`);
      }
    }

    // Domain Fallback Engine with 3 multi-choice questions
    const fallbackByte = generateDomainFallbackByte(completedCourses, careerGoal, dept);

    return NextResponse.json({
      source: 'domain-fallback',
      byte: fallbackByte
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function generateDomainFallbackByte(completedCourses: string, careerGoal: string, dept: string) {
  const cLower = (completedCourses || '').toLowerCase();
  const gLower = (careerGoal || '').toLowerCase();

  if (cLower.includes('python') || cLower.includes('data') || gLower.includes('data') || gLower.includes('analyst')) {
    return {
      concept: 'Vectorization & Memory Optimization in Pandas',
      competency: 'Data Pipeline Engineering',
      shortExplanation: 'Vectorization performs operations on entire data arrays simultaneously by leveraging low-level C-optimized SIMD instructions instead of slow Python element-by-element loops.',
      exampleTitle: '📋 Large Dataset Processing Scenario',
      exampleText: 'In processing a 10-million-row transactional dataset, using df["total"] = df["qty"] * df["price"] executes vectorized element-wise multiplication in ~40ms, compared to ~12.5 seconds using iterrows() loops.',
      diagramSteps: [
        'Raw Data Series (Numeric Float64) → Contiguous Memory Block',
        'C-Engine Vectorization → SIMD Parallel Execution (40ms)',
        'Optimized DataFrame Result → Memory Footprint Reduced by 65%'
      ],
      quizQuestions: [
        {
          id: 'q1',
          questionText: 'When executing batch calculations on a multi-gigabyte pandas DataFrame, why is vectorization using NumPy/Pandas native operators significantly faster than using .apply() or for-loops?',
          options: [
            'Vectorization automatically increases CPU clock frequency during execution',
            'Vectorization delegates computation to C-level contiguous memory blocks using SIMD instructions without Python loop overhead',
            'Vectorization converts all floating-point numbers to integers before processing',
            'Vectorization bypasses memory allocation completely'
          ],
          correctIndex: 1,
          explanation: 'Vectorized operations in Pandas use contiguous C memory structures and CPU SIMD (Single Instruction Multiple Data) registers, avoiding Python interpreter loop overhead.'
        },
        {
          id: 'q2',
          questionText: 'Which Pandas data type optimization strategy reduces memory usage by up to 90% for columns containing repetitive string values (e.g. state names or category tags)?',
          options: [
            'Converting the column to Object dtype',
            'Converting the column to Categorical dtype (pd.Categorical)',
            'Casting all values to 64-bit Floating Point',
            'Storing values as JSON strings'
          ],
          correctIndex: 1,
          explanation: 'Categorical dtypes replace repeated text strings with integer codes referencing a single unique category index, drastically cutting memory consumption.'
        },
        {
          id: 'q3',
          questionText: 'When chaining multiple data filtering and aggregation operations in Pandas, which method avoids creating intermediate copied DataFrames in RAM?',
          options: [
            'Using method chaining with query() or eval() expression strings',
            'Creating separate global variables for every filtering step',
            'Writing DataFrames to CSV files after each operation',
            'Executing deep copies using df.copy(deep=True)'
          ],
          correctIndex: 0,
          explanation: 'pd.eval() and df.query() evaluate expressions inline using NumExpr, avoiding the creation of temporary intermediate array copies in memory.'
        }
      ],
      retentionItems: [
        { concept: 'NumPy Memory Layout (C vs Fortran)', learnedDays: 21, status: 'due' },
        { concept: 'Pandas Categorical Data Types', learnedDays: 14, status: 'due' },
        { concept: 'SQL Window Functions (OVER / PARTITION)', learnedDays: 7, status: 'ok' },
        { concept: 'Exploratory Data Analysis (EDA)', learnedDays: 3, status: 'ok' }
      ]
    };
  }

  if (cLower.includes('system') || cLower.includes('software') || gLower.includes('architect') || gLower.includes('developer')) {
    return {
      concept: 'Database per Service Pattern in Microservices',
      competency: 'System Architecture & Microservices',
      shortExplanation: 'Each microservice owns and manages its private database storage, preventing direct cross-service database access and ensuring loose coupling and independent scalability.',
      exampleTitle: '📋 Distributed Enterprise Architecture Scenario',
      exampleText: 'An e-commerce system separates User Auth, Inventory, and Billing into independent services. The Billing service queries Inventory strictly via REST/gRPC API contracts rather than joining foreign SQL tables.',
      diagramSteps: [
        'Client Gateway → Routing Request',
        'Order Microservice → Private Order DB',
        'gRPC Service Call → Payment Microservice (Private Payment DB)'
      ],
      quizQuestions: [
        {
          id: 'q1',
          questionText: 'In a microservices architecture, what is the primary benefit of enforcing the "Database per Service" design pattern?',
          options: [
            'It eliminates the need for database backups',
            'It ensures service autonomy, prevents tight coupling, and allows independent schema evolution',
            'It guarantees zero latency for cross-service JOIN queries',
            'It reduces cloud hosting storage costs to zero'
          ],
          correctIndex: 1,
          explanation: 'Database per Service guarantees that microservices are loosely coupled and can evolve schemas independently without causing cascading failures across other services.'
        },
        {
          id: 'q2',
          questionText: 'When data consistency must be maintained across multiple microservices without distributed 2-Phase Commit (2PC) deadlocks, which pattern is recommended?',
          options: [
            'Saga Pattern (Choreography or Orchestration using local transactions)',
            'Monolithic SQL JOINs across cross-network databases',
            'Storing all data in browser LocalStorage',
            'Ignoring failed transactions completely'
          ],
          correctIndex: 0,
          explanation: 'The Saga pattern coordinates a sequence of local transactions across services with compensating transactions for rollback on failure.'
        },
        {
          id: 'q3',
          questionText: 'Which API protocol is preferred for high-throughput, low-latency inter-service communication between microservices?',
          options: [
            'gRPC over HTTP/2 with Protocol Buffers',
            'SOAP XML over HTTP/1.1',
            'Manual FTP file transfers',
            'HTML Web Scraped Pages'
          ],
          correctIndex: 0,
          explanation: 'gRPC utilizes HTTP/2 multiplexing and compact binary Protocol Buffers for fast, strongly-typed service-to-service RPC calls.'
        }
      ],
      retentionItems: [
        { concept: 'API Gateway Routing & Rate Limiting', learnedDays: 21, status: 'due' },
        { concept: 'Circuit Breaker Pattern (Resilience)', learnedDays: 14, status: 'due' },
        { concept: 'Event-Driven Messaging (Kafka)', learnedDays: 7, status: 'ok' },
        { concept: 'Docker & Kubernetes Containerization', learnedDays: 3, status: 'ok' }
      ]
    };
  }

  // Universal Default for Management / Operations / Governance
  return {
    concept: 'Key Performance Indicator (KPI) Alignment & SLA Governance',
    competency: 'Strategic Governance & Operations',
    shortExplanation: 'KPI alignment ensures operational activities directly contribute to organizational strategic objectives through standardized Service Level Agreements (SLAs) and objective benchmarking.',
    exampleTitle: '📋 Public Operations Governance Scenario',
    exampleText: 'A divisional leader establishes target turnaround times (SLAs) for citizen service requests, tracking weekly variance metrics to reallocate capacity before backlogs develop.',
    diagramSteps: [
      'Strategic Objectives → Defined Operational Metrics',
      'Continuous SLA Tracking → Real-time Variance Alerts',
      'Capacity Re-allocation → Targeted Process Improvement'
    ],
    quizQuestions: [
      {
        id: 'q1',
        questionText: 'When implementing digital transformation in operational workflows, which strategic step best ensures long-term operational quality and compliance?',
        options: [
          'Removing performance benchmarks to reduce administrative workload',
          'Establishing clear SLA metrics, automated validation checks, and phased deployment with continuous user feedback',
          'Replacing all internal personnel with third-party vendors',
          'Deferring process documentation until final system completion'
        ],
        correctIndex: 1,
        explanation: 'Establishing clear SLA benchmarks, continuous feedback loops, and automated validation checks prevents operational disruption during organizational change.'
      },
      {
        id: 'q2',
        questionText: 'What is the main goal of conducting a Root-Cause Analysis (5 Whys methodology) when an operational bottleneck occurs?',
        options: [
          'Assigning immediate financial penalties to line staff',
          'Identifying underlying systemic failures rather than treating superficial symptoms',
          'Suspending all project operations indefinitely',
          'Writing press releases'
        ],
        correctIndex: 1,
        explanation: '5 Whys digs beneath surface symptoms to uncover root systemic process gaps so preventive controls can be instituted.'
      },
      {
        id: 'q3',
        questionText: 'In Agile project management, how does sprint capacity planning mitigate scope creep?',
        options: [
          'By restricting team velocity to fixed work commitments during defined sprint iterations',
          'By allowing stakeholders to add unlimited backlog items mid-sprint without prioritization',
          'By eliminating all sprint retrospective meetings',
          'By doubling working hours automatically'
        ],
        correctIndex: 0,
        explanation: 'Sprint capacity planning locks down committed scope for fixed iterations, preventing unplanned mid-sprint additions.'
      }
    ],
    retentionItems: [
      { concept: 'Root-Cause Analysis (5 Whys)', learnedDays: 21, status: 'due' },
      { concept: 'Design Thinking & User Mapping', learnedDays: 14, status: 'due' },
      { concept: 'Budget Variance Tracking', learnedDays: 7, status: 'ok' },
      { concept: 'Agile Task Sprint Planning', learnedDays: 3, status: 'ok' }
    ]
  };
}
