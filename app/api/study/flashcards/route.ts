import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';
import {
  FLASHCARD_SYSTEM_PROMPT,
  FLASHCARD_USER_PROMPT,
  safeTruncate,
  cleanText,
} from '@/lib/study/prompts';
import type { Flashcard } from '@/lib/study/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, count = 10 } = body as { text: string; count?: number };

    if (!text || text.trim().length < 30) {
      return NextResponse.json({ error: 'Provide more content to generate flashcards.' }, { status: 400 });
    }
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Groq API key not configured.' }, { status: 500 });
    }

    const safeCount = Math.min(Math.max(Number(count) || 10, 5), 20);
    const cleaned = cleanText(text);
    const truncated = safeTruncate(cleaned, 5000);

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: FLASHCARD_SYSTEM_PROMPT },
        { role: 'user', content: FLASHCARD_USER_PROMPT(truncated, safeCount) },
      ],
      temperature: 0.5,
      max_tokens: 2000,
    });

    const raw = completion.choices[0]?.message?.content ?? '[]';
    const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    let parsed: Flashcard[];
    try {
      const candidate = JSON.parse(stripped);
      parsed = Array.isArray(candidate) ? candidate : (candidate.flashcards ?? []);
    } catch {
      return NextResponse.json({ error: 'AI returned invalid flashcard format. Please retry.' }, { status: 502 });
    }

    const valid = parsed
      .filter(f => f && typeof f.front === 'string' && typeof f.back === 'string')
      .slice(0, safeCount);

    if (valid.length === 0) {
      return NextResponse.json({ error: 'Could not generate flashcards. Try with more content.' }, { status: 502 });
    }

    return NextResponse.json({ success: true, flashcards: valid });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[study/flashcards]', msg);
    if (msg.includes('429') || msg.includes('rate')) {
      return NextResponse.json({ error: 'Rate limit reached. Please wait a moment.' }, { status: 429 });
    }
    return NextResponse.json({ error: 'Failed to generate flashcards. Please retry.' }, { status: 500 });
  }
}
