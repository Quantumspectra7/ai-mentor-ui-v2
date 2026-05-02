import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';
import {
  SUMMARY_SYSTEM_PROMPT,
  SUMMARY_USER_PROMPT,
  safeTruncate,
  cleanText,
} from '@/lib/study/prompts';
import type { SummaryResult } from '@/lib/study/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body as { text: string };

    if (!text || typeof text !== 'string' || text.trim().length < 20) {
      return NextResponse.json({ error: 'Provide at least a sentence of study material.' }, { status: 400 });
    }
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Groq API key not configured.' }, { status: 500 });
    }

    const cleaned = cleanText(text);
    const truncated = safeTruncate(cleaned, 7000);

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SUMMARY_SYSTEM_PROMPT },
        { role: 'user', content: SUMMARY_USER_PROMPT(truncated) },
      ],
      temperature: 0.4,
      max_tokens: 1800,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    let parsed: SummaryResult;
    try {
      parsed = JSON.parse(raw) as SummaryResult;
    } catch {
      return NextResponse.json({ error: 'AI returned invalid format. Please retry.' }, { status: 502 });
    }

    // Validate shape
    if (!parsed.short || !parsed.detailed || !Array.isArray(parsed.bullets)) {
      return NextResponse.json({ error: 'Incomplete summary generated. Please retry.' }, { status: 502 });
    }

    return NextResponse.json({ success: true, summary: parsed });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[study/summarize]', msg);
    if (msg.includes('429') || msg.includes('rate')) {
      return NextResponse.json({ error: 'Rate limit reached. Please wait a moment.' }, { status: 429 });
    }
    return NextResponse.json({ error: 'Failed to generate summary. Please retry.' }, { status: 500 });
  }
}
