import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { documentText, count = 5, difficulty = 'medium', topic = 'Official Statistics' } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return simulated high quality MCQs if API key is not set
      return NextResponse.json({
        source: 'simulated',
        mcqs: [
          {
            question: `In survey methodology for ${topic}, what is the primary advantage of stratified sampling over simple random sampling?`,
            options: [
              'It eliminates non-sampling errors completely',
              'It guarantees lower sample variance by representing key sub-populations',
              'It requires no prior population frame information',
              'It reduces data processing cost to zero'
            ],
            correctIndex: 1,
            explanation: 'Stratification reduces overall sampling variance by ensuring that key sub-groups (strata) are represented in proportion to their population weights.',
            difficulty,
            topic
          },
          {
            question: `When computing national index numbers, which formula uses current-period quantity weights?`,
            options: ['Laspeyres Index', 'Paasche Index', 'Fisher Ideal Index', 'Marshall-Edgeworth Index'],
            correctIndex: 1,
            explanation: 'The Paasche price index utilizes current-period quantities as weights for price comparisons.',
            difficulty,
            topic
          }
        ]
      });
    }

    // Call live Google Gemini 2.5 API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an AI assessment generator for India's Official Statistical System. Generate ${count} multiple choice questions from the following text on topic '${topic}' at difficulty level '${difficulty}'. Output valid JSON format with keys: question, options (array of 4 strings), correctIndex (0-3), explanation, difficulty, topic.\n\nText: ${documentText || topic}`
          }]
        }]
      })
    });

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    return NextResponse.json({
      source: 'gemini-live',
      rawResponse: candidateText
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
