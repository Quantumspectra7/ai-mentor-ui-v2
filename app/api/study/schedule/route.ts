import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ScheduleSession {
  startTime: string;
  endTime: string;
  durationMinutes: number;
  type: 'weak_subject' | 'dsa' | 'review' | 'break';
  title: string;
  description: string;
  resources: { title: string; url: string }[];
}

interface GeneratedSchedule {
  totalMinutes: number;
  summary: string;
  strategy: string;
  sessions: ScheduleSession[];
}

// ── Fallback schedule builder ─────────────────────────────────────────────────
function buildFallback(hoursAvailable: number, weakSubjects: string[], targetDSA: string): GeneratedSchedule {
  const totalMins = Math.round(hoursAvailable * 60);
  const sessions: ScheduleSession[] = [];
  let cursor = 0; // minutes from session start

  const addSession = (durationMinutes: number, type: ScheduleSession['type'], title: string, description: string, resources: { title: string; url: string }[]) => {
    const sh = Math.floor(cursor / 60) + 8;
    const sm = cursor % 60;
    cursor += durationMinutes;
    const eh = Math.floor(cursor / 60) + 8;
    const em = cursor % 60;
    sessions.push({
      startTime: `${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}`,
      endTime: `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`,
      durationMinutes,
      type,
      title,
      description,
      resources,
    });
  };

  // Simple fallback: split evenly across weak subjects + DSA
  const weakMins = Math.round(totalMins * 0.5);
  const dsaMins = Math.round(totalMins * 0.5);

  if (weakSubjects.length > 0) {
    const perSubject = Math.round(weakMins / weakSubjects.length);
    weakSubjects.forEach((sub) => {
      addSession(perSubject, 'weak_subject', `Study: ${sub}`, `Review and practice problems for ${sub}.`, [
        { title: `GeeksForGeeks — ${sub}`, url: `https://geeksforgeeks.org/search/?q=${encodeURIComponent(sub)}` },
      ]);
    });
  }

  addSession(dsaMins, 'dsa', `DSA: ${targetDSA || 'Practice'}`, `Solve problems related to ${targetDSA}.`, [
    { title: 'NeetCode DSA Roadmap', url: 'https://neetcode.io/roadmap' },
  ]);

  return {
    totalMinutes: totalMins,
    summary: 'Balanced study schedule (fallback mode).',
    strategy: '50% weak subjects, 50% DSA practice.',
    sessions,
  };
}

// ── System Prompt ─────────────────────────────────────────────────────────────
function buildSystemPrompt(): string {
  return `You are an expert academic schedule planner for engineering students. Your job is to generate a highly optimized, personalized daily study schedule based on the student's profile.

CRITICAL: You MUST return ONLY a raw JSON object. No markdown. No explanation. No backticks. No code fences. Just the JSON object.

OUTPUT SCHEMA (follow exactly):
{
  "totalMinutes": <number — must equal hoursAvailable * 60>,
  "summary": "<one sentence summary of the day's plan>",
  "strategy": "<one sentence explaining the allocation logic>",
  "sessions": [
    {
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "durationMinutes": <number>,
      "type": "<weak_subject | dsa | review | break>",
      "title": "<concise session title>",
      "description": "<1-2 sentences: what to focus on, what to accomplish>",
      "resources": [
        { "title": "<specific resource name, not a generic site name>", "url": "<specific URL with path or playlist, not just root domain>" }
      ]
    }
  ]
}

RULES YOU MUST FOLLOW:

RULE 1 — Time Allocation (The Planner):
- The SUM of all session durationMinutes MUST equal hoursAvailable * 60. No exceptions.
- If stressLevel is 4 or 5: Insert a 15-minute break session (type: "break", title: "Decompression Break") after every 45 minutes of study.
- If marks < 60: Allocate 60% of time to weakSubjects, 40% to targetDSA.
- If marks >= 60 and marks <= 80: Allocate 50% to weakSubjects, 50% to targetDSA.
- If marks > 80: Allocate 30% to review (type: "review"), 70% to targetDSA.

RULE 2 — Resource Recommendations (Specific, Not Generic):
- DO NOT return bare domain links like "leetcode.com" or "youtube.com".
- Return specific, named resources relevant to the exact subject/DSA topic.
- Examples of GOOD resources:
  * For targetDSA = "Graphs": "Striver's Graph Series (TUF)" → "https://takeuforward.org/graph/striver-graph-series/"
  * For targetDSA = "Graphs": "LeetCode Graph Traversal Study Plan" → "https://leetcode.com/studyplan/graph/"
  * For targetDSA = "Dynamic Programming": "Striver's DP Series" → "https://takeuforward.org/dynamic-programming/striver-dp-series-dynamic-programming-problems/"
  * For weakSubject = "Operating Systems": "GATE Lectures OS by Ravindrababu Ravula" → "https://www.youtube.com/playlist?list=PLEbnTDJUr_IcPtUXFy2b1sGRPsLFMghhS"
  * For weakSubject = "DBMS": "Sanchit Jain DBMS Playlist" → "https://www.youtube.com/playlist?list=PLmXKhU9FNesSFvj6gASuWmQd23Ul5om_C"
  * For weakSubject = "Networks": "Computer Networks by Ravindrababu Ravula" → "https://www.youtube.com/playlist?list=PLEbnTDJUr_IdM___ymxKx6bJiQT7MLeSF"

RULE 3 — Session Sequencing:
- Sessions should start at 08:00 and progress sequentially — endTime of session N = startTime of session N+1.
- A break session has 0 resources (empty array).
- Each study session must have 1-2 resources. Do not give 0 resources for study sessions.`;
}

// ── User Prompt ───────────────────────────────────────────────────────────────
function buildUserPrompt(body: {
  branch: string;
  marks: number;
  weakSubjects: string[];
  targetDSA: string;
  stressLevel: number;
  hoursAvailable: number;
}): string {
  const totalMins = Math.round(body.hoursAvailable * 60);

  let allocationNote = '';
  if (body.marks < 60) {
    allocationNote = `Marks are below 60% → allocate ${Math.round(totalMins * 0.6)} minutes (60%) to weak subjects and ${Math.round(totalMins * 0.4)} minutes (40%) to ${body.targetDSA}.`;
  } else if (body.marks > 80) {
    allocationNote = `Marks are above 80% → allocate ${Math.round(totalMins * 0.7)} minutes (70%) to advanced ${body.targetDSA} and ${Math.round(totalMins * 0.3)} minutes (30%) to review.`;
  } else {
    allocationNote = `Marks are between 60–80% → allocate 50% to weak subjects and 50% to ${body.targetDSA}.`;
  }

  let stressNote = '';
  if (body.stressLevel >= 4) {
    stressNote = `Stress level is ${body.stressLevel}/5 (HIGH) → insert a mandatory 15-minute Decompression Break after every 45 minutes of study.`;
  }

  return `Generate a study schedule for this student:

Branch: ${body.branch}
Average Marks: ${body.marks}%
Weak Subjects: ${body.weakSubjects.join(', ') || 'None specified'}
Target DSA Topic: ${body.targetDSA || 'General DSA'}
Stress Level: ${body.stressLevel}/5
Hours Available Today: ${body.hoursAvailable} hours (= ${totalMins} minutes TOTAL)

Allocation Instructions:
${allocationNote}
${stressNote}

Remember: ALL session durationMinutes must add up to EXACTLY ${totalMins} minutes. Return only the JSON object.`;
}

// ── Route Handler ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  let body: {
    branch: string;
    marks: number;
    weakSubjects: string[];
    targetDSA: string;
    stressLevel: number;
    hoursAvailable: number;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  // Input validation
  const { branch, marks, weakSubjects, targetDSA, stressLevel, hoursAvailable } = body;

  if (typeof hoursAvailable !== 'number' || hoursAvailable <= 0 || hoursAvailable > 12) {
    return NextResponse.json({ error: 'hoursAvailable must be a number between 0 and 12.' }, { status: 400 });
  }
  if (typeof stressLevel !== 'number' || stressLevel < 1 || stressLevel > 5) {
    return NextResponse.json({ error: 'stressLevel must be between 1 and 5.' }, { status: 400 });
  }
  if (typeof marks !== 'number' || marks < 0 || marks > 100) {
    return NextResponse.json({ error: 'marks must be between 0 and 100.' }, { status: 400 });
  }
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: 'Groq API key not configured.' }, { status: 500 });
  }

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: buildUserPrompt(body) },
      ],
      temperature: 0.4,
      max_tokens: 2500,
    });

    const raw = completion.choices[0]?.message?.content ?? '';

    // Robust JSON extraction — strip any accidental markdown fences
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let schedule: GeneratedSchedule;

    try {
      schedule = JSON.parse(cleaned);

      // Validate critical fields
      if (!schedule.sessions || !Array.isArray(schedule.sessions)) {
        throw new Error('sessions is missing or not an array');
      }
      if (typeof schedule.totalMinutes !== 'number') {
        schedule.totalMinutes = Math.round(hoursAvailable * 60);
      }
    } catch (parseErr) {
      console.error('[study/schedule] JSON parse failed:', parseErr, '\nRaw response:', raw);
      // Return safe fallback
      schedule = buildFallback(hoursAvailable, weakSubjects ?? [], targetDSA ?? '');
      return NextResponse.json({
        success: true,
        schedule,
        isFallback: true,
        warning: 'AI response could not be parsed. Showing a safe fallback schedule.',
      });
    }

    return NextResponse.json({ success: true, schedule, isFallback: false });
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.error('[study/schedule] Error:', msg);

    if (msg.includes('429') || msg.includes('rate')) {
      return NextResponse.json({ error: 'Rate limit reached. Please wait a moment and try again.' }, { status: 429 });
    }

    // Return fallback instead of a hard error for better UX
    const fallback = buildFallback(hoursAvailable, weakSubjects ?? [], targetDSA ?? '');
    return NextResponse.json({
      success: true,
      schedule: fallback,
      isFallback: true,
      warning: 'AI service temporarily unavailable. Showing a safe fallback schedule.',
    });
  }
}
