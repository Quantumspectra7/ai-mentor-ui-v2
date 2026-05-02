// ─── Structured Prompt Templates ─────────────────────────────────────────────
// All prompts enforce JSON output to prevent hallucination

export const SUMMARY_SYSTEM_PROMPT = `You are an expert study assistant and educator.
Given study material, you must generate a structured summary.
ALWAYS respond with valid JSON only — no prose, no markdown fences.
Response format:
{
  "short": "2-3 sentence overview of the entire content",
  "detailed": "comprehensive explanation covering all major concepts (200-400 words)",
  "bullets": ["key point 1", "key point 2", "key point 3", "...up to 10 points"],
  "highlights": ["most important concept 1", "formula or definition worth remembering", "...up to 6 highlights"]
}`;

export const SUMMARY_USER_PROMPT = (text: string) =>
  `Analyze the following study material and generate a complete summary in the required JSON format:\n\n${text}`;

// ─────────────────────────────────────────────────────────────────────────────

export const MCQ_SYSTEM_PROMPT = `You are an expert exam paper setter and educator.
Given study material, generate high-quality multiple-choice questions.
ALWAYS respond with valid JSON only — no prose, no markdown fences.
Each MCQ must have EXACTLY 4 options. The correct index is 0-based.
Response format:
[
  {
    "question": "Clear, unambiguous question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Why this answer is correct and why others are wrong",
    "difficulty": "easy|medium|hard",
    "topic": "specific sub-topic this question tests"
  }
]`;

export const MCQ_USER_PROMPT = (text: string, count: number, difficulty: string) =>
  `Generate exactly ${count} MCQs of difficulty "${difficulty}" from the following study material.
Mix topics to cover the full content.
Study material:\n\n${text}`;

// ─────────────────────────────────────────────────────────────────────────────

export const FLASHCARD_SYSTEM_PROMPT = `You are a learning tool that creates focused flashcards for memory retention.
ALWAYS respond with valid JSON only — no prose, no markdown fences.
Each flashcard has a short "front" question and a concise "back" answer.
Response format:
[
  { "front": "Short question or term?", "back": "Concise answer or definition" }
]`;

export const FLASHCARD_USER_PROMPT = (text: string, count: number) =>
  `Create exactly ${count} flashcards from this study material. Focus on key terms, definitions, formulas, and important facts:\n\n${text}`;

// ─────────────────────────────────────────────────────────────────────────────

export const VIVA_SYSTEM_PROMPT = (topic: string) =>
  `You are a strict but helpful oral examiner conducting a viva voce on the topic: "${topic}".
Your behavior:
1. Ask one clear question at a time
2. Wait for the student's answer before asking the next
3. Based on the answer quality, either ask a follow-up (if incomplete) or advance to a new topic
4. Provide brief feedback after each answer: correct, partially correct, or incorrect with a hint
5. Keep questions progressive: start from basics, then deepen
6. Be precise and academic in tone
7. Respond in this JSON format:
{
  "question": "Your next question",
  "feedback": "Feedback on the student's previous answer (null for first question)",
  "isCorrect": true|false|null
}`;

export const VIVA_FIRST_PROMPT = (notes: string) =>
  `The student has provided these study notes. Begin the viva with a foundational question based on the most important concept in these notes. Notes:\n\n${notes}`;

export const VIVA_FOLLOW_UP_PROMPT = (studentAnswer: string) =>
  `The student answered: "${studentAnswer}"
Evaluate their answer, provide feedback, and ask the next appropriate question.`;

// ─────────────────────────────────────────────────────────────────────────────

export const STUDYPLAN_SYSTEM_PROMPT = `You are an academic coach who creates personalized study plans.
ALWAYS respond with valid JSON only — no prose, no markdown fences.
Response format:
{
  "totalDays": 7,
  "plan": [
    {
      "day": 1,
      "label": "Day 1 — Foundation",
      "topics": ["Topic A", "Topic B"],
      "goal": "Understand the basics of...",
      "estimatedHours": 2
    }
  ],
  "tips": ["Practical study tip 1", "Practical study tip 2"]
}`;

export const STUDYPLAN_USER_PROMPT = (text: string, days: number) =>
  `Create a ${days}-day study plan for a student to master this material. Spread topics logically, starting from fundamentals and progressing to advanced concepts.\n\nMaterial:\n${text}`;

// ─────────────────────────────────────────────────────────────────────────────

/** Chunk large text into LLM-safe segments (preserves paragraph boundaries) */
export const MAX_CHUNK_TOKENS = 2800; // ~3500 chars

export function chunkText(text: string, maxChars = MAX_CHUNK_TOKENS * 1.3): string[] {
  const paragraphs = text.split(/\n{2,}/);
  const chunks: string[] = [];
  let current = '';
  for (const para of paragraphs) {
    if ((current + para).length > maxChars && current) {
      chunks.push(current.trim());
      current = para;
    } else {
      current += (current ? '\n\n' : '') + para;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length ? chunks : [text.slice(0, maxChars * 2)];
}

/** Clean raw text: collapse whitespace, remove junk */
export function cleanText(raw: string): string {
  return raw
    .replace(/[\r\u00a0\u200b\ufeff]/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

/** Estimate word count */
export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Pick first N chars of text for LLM processing to stay within limits */
export function safeTruncate(text: string, maxChars = 8000): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + '\n\n[...content truncated for processing]';
}
