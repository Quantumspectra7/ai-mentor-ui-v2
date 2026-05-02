import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';
import {
  MCQ_SYSTEM_PROMPT,
  MCQ_USER_PROMPT,
  safeTruncate,
  cleanText,
} from '@/lib/study/prompts';
import type { MCQItem, Difficulty } from '@/lib/study/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, count = 5, difficulty = 'medium' } = body as {
      text: string;
      count?: number;
      difficulty?: Difficulty;
    };

    if (!text || text.trim().length < 30) {
      return NextResponse.json({ error: 'Provide more study material for MCQ generation.' }, { status: 400 });
    }
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Groq API key not configured.' }, { status: 500 });
    }

    const safeCount = Math.min(Math.max(Number(count) || 5, 3), 15);
    const cleaned = cleanText(text);
    const truncated = safeTruncate(cleaned, 6000);

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: MCQ_SYSTEM_PROMPT },
        { role: 'user', content: MCQ_USER_PROMPT(truncated, safeCount, difficulty) },
      ],
      temperature: 0.6,
      max_tokens: 3000,
    });

    const raw = completion.choices[0]?.message?.content ?? '[]';

    // Strip markdown code fences if model wraps output
    const stripped = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let parsed: MCQItem[];
    try {
      const candidate = JSON.parse(stripped);
      parsed = Array.isArray(candidate) ? candidate : (candidate.mcqs ?? candidate.questions ?? []);
    } catch {
      return NextResponse.json({ error: 'AI returned invalid MCQ format. Please retry.' }, { status: 502 });
    }

    // Validate and normalise items
    const valid: MCQItem[] = parsed
      .filter(
        item =>
          item &&
          typeof item.question === 'string' &&
          Array.isArray(item.options) &&
          item.options.length === 4 &&
          typeof item.correct === 'number'
      )
      .slice(0, safeCount)
      .map(item => ({
        question: item.question,
        options: item.options.slice(0, 4) as [string, string, string, string],
        correct: Math.max(0, Math.min(3, item.correct)),
        explanation: item.explanation ?? 'No explanation provided.',
        difficulty: item.difficulty ?? difficulty,
        topic: item.topic ?? 'General',
      }));

    if (valid.length === 0) {
      return NextResponse.json({ error: 'Could not generate valid MCQs. Try with more content.' }, { status: 502 });
    }

    // Shuffle order of MCQs
    const shuffled = valid.sort(() => Math.random() - 0.5);

    return NextResponse.json({ success: true, mcqs: shuffled });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[study/mcq]', msg);
    if (msg.includes('429') || msg.includes('rate')) {
      return NextResponse.json({ error: 'Rate limit reached. Please wait a moment.' }, { status: 429 });
    }
    return NextResponse.json({ error: 'Failed to generate MCQs. Please retry.' }, { status: 500 });
  }
}
