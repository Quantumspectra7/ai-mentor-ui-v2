import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

const MENTOR_RESOURCES_SYSTEM_PROMPT = `[SYSTEM ROLE]
You are an academic resource curator for college students.
Given the user's weak subjects, interests, and current academic stage, recommend exactly 4 highly specific, high-quality free learning resources (URLs) tailored to them.

[OUTPUT FORMAT]
You MUST return ONLY a raw JSON array of objects. No markdown, no backticks, no explanations. Just the JSON array.
Each object must have:
{
  "name": "Resource Name",
  "desc": "Short description of why it helps them specifically",
  "url": "https://...",
  "tag": "Short Tag (e.g. YouTube, Course, Tool)",
  "tagColor": "bg-primary/10 text-primary border-primary/20",
  "free": true
}`;

export async function POST(request: NextRequest) {
  try {
    const { weakSubjects, interests, currentDay } = await request.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Groq API key is not configured' }, { status: 500 });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const context = `Student Profile:
Weak Subjects: ${weakSubjects?.join(', ') || 'None specified'}
Interests: ${interests?.join(', ') || 'None specified'}
Current Day in Program: ${currentDay}/90

Please generate 4 personalized resources.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: MENTOR_RESOURCES_SYSTEM_PROMPT },
        { role: 'user', content: context }
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const responseText = completion.choices[0]?.message?.content || "[]";
    let recommendations = [];
    
    try {
      // Clean potential markdown blocks
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      recommendations = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse recommendations JSON", responseText);
      // Fallback
      recommendations = [
        { name: 'Khan Academy', desc: 'Fallback resource for foundational knowledge.', url: 'https://khanacademy.org', tag: 'General', tagColor: 'bg-green-500/10 text-green-600', free: true }
      ];
    }

    return NextResponse.json({ success: true, recommendations });
  } catch (error: any) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
