import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';
import {
  VIVA_SYSTEM_PROMPT,
  VIVA_FIRST_PROMPT,
  VIVA_FOLLOW_UP_PROMPT,
  safeTruncate,
  cleanText,
} from '@/lib/study/prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      notes,
      topic = 'Study Notes',
      studentAnswer,
      history = [],
      isFirst = false,
    } = body as {
      notes: string;
      topic?: string;
      studentAnswer?: string;
      history?: { role: 'user' | 'assistant'; content: string }[];
      isFirst?: boolean;
    };

    if (!notes || notes.trim().length < 10) {
      return NextResponse.json({ error: 'Study notes are required for viva mode.' }, { status: 400 });
    }
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Groq API key not configured.' }, { status: 500 });
    }

    const cleaned = cleanText(notes);
    const truncatedNotes = safeTruncate(cleaned, 4000);

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: VIVA_SYSTEM_PROMPT(topic) },
    ];

    if (isFirst || history.length === 0) {
      messages.push({ role: 'user', content: VIVA_FIRST_PROMPT(truncatedNotes) });
    } else {
      // Replay history to maintain context (keep last 10 turns)
      const recentHistory = history.slice(-10);
      for (const msg of recentHistory) {
        messages.push({ role: msg.role, content: msg.content });
      }
      messages.push({
        role: 'user',
        content: VIVA_FOLLOW_UP_PROMPT(studentAnswer ?? '(no answer)'),
      });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 600,
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';

    // Strip markdown code fences
    const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    let parsed: { question?: string; feedback?: string | null; isCorrect?: boolean | null };
    try {
      parsed = JSON.parse(stripped);
    } catch {
      // If JSON parsing fails, treat entire response as the question
      parsed = { question: raw, feedback: null, isCorrect: null };
    }

    return NextResponse.json({
      success: true,
      question: parsed.question ?? 'Please elaborate on your answer.',
      feedback: parsed.feedback ?? null,
      isCorrect: parsed.isCorrect ?? null,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[study/viva]', msg);
    if (msg.includes('429') || msg.includes('rate')) {
      return NextResponse.json({ error: 'Rate limit reached. Please wait a moment.' }, { status: 429 });
    }
    return NextResponse.json({ error: 'Failed to process viva response. Please retry.' }, { status: 500 });
  }
}
