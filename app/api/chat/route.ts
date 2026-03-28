import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

const MENTOR_SYSTEM_PROMPT = `You are a student-first AI mentor focused on real campus life and day-to-day college success. Your role is to:

1. Prioritize practical student needs: schedules, assignments, exams, attendance, deadlines, and routines
2. Help with campus survival: clubs, hostel life, food, transport, navigation, and peer connections
3. Give step-by-step, actionable advice with clear next actions
4. Be friendly, relatable, and supportive without being preachy
5. Adapt tone to the student's mood (stressed, neutral, motivated)
6. Keep answers short: 2-3 lines max unless the user explicitly asks for detail
7. Use simple language, avoid jargon, and be specific when possible
8. Reference their current day/phase in the 90-day journey when it helps
9. Encourage healthy habits: sleep, focus, stress control, and balance
10. If unsure, ask a short clarifying question before giving a long answer

11. Use the personalization details from the onboarding form when relevant

Remember: You're a helpful senior who gives practical, student-oriented guidance.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, mood = 'neutral', currentDay = 1, phase = 1, personalization = {} } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key is not configured' },
        { status: 500 }
      );
    }

    // Initialize Groq client at runtime, not at module load
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // Enhance the user message with context about mood and day
    let moodContext = '';
    if (mood === 'stressed') {
      moodContext = ' (They seem stressed and need extra support and encouragement)';
    } else if (mood === 'motivated') {
      moodContext = ' (They seem energized and motivated!)';
    }

    const safePersonalization = personalization && typeof personalization === 'object' ? personalization : {};
    const {
      name,
      branch,
      hostel,
      interests,
      extracurricular,
      userType,
      currentModule,
      todayTasks,
    } = safePersonalization as {
      name?: string;
      branch?: string;
      hostel?: string;
      interests?: string[];
      extracurricular?: string;
      userType?: string;
      currentModule?: string | null;
      todayTasks?: string[];
    };

    const personalizationBits = [
      name ? `Name: ${name}` : null,
      branch ? `Branch: ${branch}` : null,
      hostel ? `Hostel: ${hostel}` : null,
      Array.isArray(interests) && interests.length > 0 ? `Interests: ${interests.join(', ')}` : null,
      extracurricular ? `Co-curricular: ${extracurricular}` : null,
      userType ? `User type: ${userType}` : null,
      currentModule ? `Current module: ${currentModule}` : null,
      Array.isArray(todayTasks) && todayTasks.length > 0 ? `Today's tasks: ${todayTasks.join('; ')}` : null,
    ].filter(Boolean);

    const contextMessage = `This is day ${currentDay} of their 90-day college journey (Phase ${phase}). They're in the ${
      phase === 1 ? 'Orientation' : phase === 2 ? 'Growth' : 'Confidence'
    } phase.${moodContext}${personalizationBits.length ? `\nPersonalization: ${personalizationBits.join(' | ')}` : ''}`;

    const messages = [
      {
        role: 'system' as const,
        content: MENTOR_SYSTEM_PROMPT,
      },
      {
        role: 'user' as const,
        content: `Context: ${contextMessage}\n\nStudent's message: ${message}`,
      },
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: messages,
      temperature: 0.9,
      max_tokens: 250,
    });

    const responseText =
      completion.choices[0]?.message?.content ||
      "I'm having trouble responding right now. Please try again!";

    const paramsUsed = [
      'message',
      'mood',
      'currentDay',
      'phase',
      name ? 'name' : null,
      branch ? 'branch' : null,
      hostel ? 'hostel' : null,
      Array.isArray(interests) && interests.length > 0 ? 'interests' : null,
      extracurricular ? 'extracurricular' : null,
      userType ? 'userType' : null,
      currentModule ? 'currentModule' : null,
      Array.isArray(todayTasks) && todayTasks.length > 0 ? 'todayTasks' : null,
    ].filter(Boolean);

    return NextResponse.json({
      success: true,
      response: responseText,
      paramsUsed,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    console.error('Detailed error:', { errorMessage, error });

    // Check for specific error types
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('API key')) {
      return NextResponse.json(
        { error: 'Authentication failed - check Groq API key configuration' },
        { status: 401 }
      );
    }

    if (errorMessage.includes('429') || errorMessage.includes('rate') || errorMessage.includes('quota')) {
      return NextResponse.json(
        { error: 'Service rate limit exceeded - please wait a moment' },
        { status: 429 }
      );
    }

    if (errorMessage.includes('model') || errorMessage.includes('not found')) {
      return NextResponse.json(
        { error: 'Model configuration issue - using fallback' },
        { status: 503 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: `Failed to get response: ${errorMessage.substring(0, 100)}` },
      { status: 500 }
    );
  }
}
