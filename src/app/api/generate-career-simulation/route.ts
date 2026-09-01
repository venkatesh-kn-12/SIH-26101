import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      currentRole = 'Specialist',
      currentSkills = 'CyberSecurity',
      experience = '1-3 years',
      targetRole = 'CyberSecurity Analyst'
    } = body;

    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'qwen-2.5-32b';
    const baseUrl = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';

    const isApiKeyValid = Boolean(apiKey && apiKey !== 'your_groq_api_key_here' && apiKey.trim().length > 0);

    if (isApiKeyValid) {
      try {
        console.log(`⚡ [Career Simulator API] Invoking Groq LLM (${model}) for target role: "${targetRole}"...`);

        const prompt = `You are a Career Progression & Skill Intelligence Expert for SkillPath AI.
Generate 5 EXACT, realistic skill parameters / competencies required for a professional transitioning from their current state to the target role.

User Context:
- Current Role / Designation: ${currentRole}
- Current Claimed Skills & Domain: ${currentSkills}
- Experience Level: ${experience}
- Target Simulated Role: ${targetRole}

OUTPUT REQUIREMENT:
Return ONLY a valid JSON object matching this exact schema (no markdown, no code blocks):

{
  "targetRole": "${targetRole}",
  "readinessPct": number (between 35 and 85 based on overlap),
  "estimatedMonths": number (between 4 and 24),
  "description": "string (Concise 2-sentence description of the target role and its core responsibilities)",
  "skillParameters": [
    {
      "name": "string (Exact Skill Parameter 1)",
      "category": "string (Technical, Operational, or Governance)",
      "currentScore": number (between 1.5 and 4.8 out of 5.0 based on current skills),
      "requiredScore": number (between 4.0 and 5.0),
      "description": "string (Why this skill parameter is required for target role)"
    },
    {
      "name": "string (Exact Skill Parameter 2)",
      "category": "string",
      "currentScore": number,
      "requiredScore": number,
      "description": "string"
    },
    {
      "name": "string (Exact Skill Parameter 3)",
      "category": "string",
      "currentScore": number,
      "requiredScore": number,
      "description": "string"
    },
    {
      "name": "string (Exact Skill Parameter 4)",
      "category": "string",
      "currentScore": number,
      "requiredScore": number,
      "description": "string"
    },
    {
      "name": "string (Exact Skill Parameter 5)",
      "category": "string",
      "currentScore": number,
      "requiredScore": number,
      "description": "string"
    }
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
            max_tokens: 1500
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content?.trim();
          if (content) {
            const jsonStr = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
            const parsed = JSON.parse(jsonStr);
            if (parsed && parsed.targetRole && Array.isArray(parsed.skillParameters) && parsed.skillParameters.length === 5) {
              console.log(`✅ [Career Simulator API] Generated 5 skill parameters via Groq LLM for ${targetRole}.`);
              return NextResponse.json({
                source: 'groq-qwen',
                model,
                simulation: parsed
              });
            }
          }
        }
      } catch (err: any) {
        console.warn(`⚠️ [Career Simulator API] Groq LLM failed: ${err.message}. Using fallback parameter generator.`);
      }
    }

    // Domain Fallback Parameter Generator for CyberSecurity, Data Science, Software, etc.
    const fallbackSimulation = generateFallbackCareerSimulation(targetRole, currentSkills);

    return NextResponse.json({
      source: 'domain-fallback',
      simulation: fallbackSimulation
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function generateFallbackCareerSimulation(targetRole: string, currentSkills: string) {
  const tLower = targetRole.toLowerCase();
  const cLower = (currentSkills || '').toLowerCase();

  // CyberSecurity Domain Parameters
  if (tLower.includes('cyber') || tLower.includes('security') || cLower.includes('cyber') || cLower.includes('security')) {
    const hasNetwork = cLower.includes('network');
    const hasLinux = cLower.includes('linux');

    return {
      targetRole,
      readinessPct: hasNetwork ? 75 : 55,
      estimatedMonths: 8,
      description: `Specialized security position defending enterprise digital assets, conducting threat audits, and enforcing Zero-Trust access controls.`,
      skillParameters: [
        {
          name: 'Network Security & Firewalls',
          category: 'Infrastructure Security',
          currentScore: hasNetwork ? 4.2 : 2.5,
          requiredScore: 4.8,
          description: 'Configuring IDS/IPS rules, segmenting subnets, and monitoring perimeter traffic.'
        },
        {
          name: 'Threat Intelligence & SIEM',
          category: 'Security Operations',
          currentScore: 2.0,
          requiredScore: 4.5,
          description: 'Analyzing real-time log telemetry in Splunk/ELK to detect anomalies and breach indicators.'
        },
        {
          name: 'Penetration Testing & SAST/DAST',
          category: 'Application Security',
          currentScore: 1.8,
          requiredScore: 4.6,
          description: 'Executing ethical hacking, static/dynamic code analysis, and vulnerability patching.'
        },
        {
          name: 'Zero-Trust IAM & Encryption',
          category: 'Identity & Data Security',
          currentScore: hasLinux ? 3.5 : 2.2,
          requiredScore: 4.7,
          description: 'Enforcing MFA, PKI certificate management, and AES-256 data-at-rest encryption.'
        },
        {
          name: 'Security Compliance (ISO 27001 / SOC 2)',
          category: 'Governance & Audit',
          currentScore: 2.5,
          requiredScore: 4.5,
          description: 'Conducting risk assessments and auditing compliance against ISO 27001 & NIST frameworks.'
        }
      ]
    };
  }

  // Data Science Domain Parameters
  if (tLower.includes('data') || tLower.includes('machine') || cLower.includes('python')) {
    return {
      targetRole,
      readinessPct: cLower.includes('python') ? 72 : 50,
      estimatedMonths: 6,
      description: `Core data science position constructing predictive models, vectorized data pipelines, and statistical analysis.`,
      skillParameters: [
        {
          name: 'Python Vectorization & NumPy',
          category: 'Data Engineering',
          currentScore: cLower.includes('python') ? 4.5 : 2.0,
          requiredScore: 4.8,
          description: 'Leveraging C-optimized contiguous SIMD operations for high-throughput array calculations.'
        },
        {
          name: 'Pandas Data Wrangling & Cleaning',
          category: 'Data Engineering',
          currentScore: cLower.includes('pandas') ? 4.5 : 2.5,
          requiredScore: 4.8,
          description: 'Performing multi-table joins, memory profiling, and categorical dtype optimization.'
        },
        {
          name: 'Machine Learning Algorithms',
          category: 'Predictive Modeling',
          currentScore: 2.2,
          requiredScore: 4.6,
          description: 'Training supervised XGBoost, Random Forest, and neural network classification models.'
        },
        {
          name: 'Statistical Inference & Hypothesis Testing',
          category: 'Analytics',
          currentScore: 3.0,
          requiredScore: 4.5,
          description: 'Conducting A/B hypothesis testing, confidence interval estimation, and ANOVA.'
        },
        {
          name: 'MLOps & Model Deployment',
          category: 'Production Systems',
          currentScore: 1.5,
          requiredScore: 4.2,
          description: 'Serving models via REST endpoints, containerization, and automated retraining pipelines.'
        }
      ]
    };
  }

  // Universal Default Parameters
  return {
    targetRole,
    readinessPct: 60,
    estimatedMonths: 8,
    description: `Professional role focused on domain excellence, operational SLAs, and quality standards.`,
    skillParameters: [
      {
        name: 'Domain Technical Execution',
        category: 'Technical',
        currentScore: 3.5,
        requiredScore: 4.5,
        description: 'Executing core domain workflows in accordance with technical specifications.'
      },
      {
        name: 'SLA Governance & Quality Controls',
        category: 'Operations',
        currentScore: 3.8,
        requiredScore: 4.7,
        description: 'Enforcing Service Level Agreements and automated quality validation checks.'
      },
      {
        name: 'Risk Management & Audit',
        category: 'Governance',
        currentScore: 2.5,
        requiredScore: 4.4,
        description: 'Identifying operational risks and establishing preventive controls.'
      },
      {
        name: 'Process Optimization & Automation',
        category: 'Operations',
        currentScore: 2.8,
        requiredScore: 4.5,
        description: 'Streamlining manual tasks into automated, repeatable digital workflows.'
      },
      {
        name: 'Strategic Leadership & Team Mentorship',
        category: 'Leadership',
        currentScore: 2.2,
        requiredScore: 4.3,
        description: 'Guiding cross-functional teams and aligning operational goals.'
      }
    ]
  };
}
