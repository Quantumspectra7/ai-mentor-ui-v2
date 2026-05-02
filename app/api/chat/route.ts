import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

const MENTOR_SYSTEM_PROMPT = `[SYSTEM ROLE]
You are a highly personalized, agentic AI engineering mentor. Your primary objective is to help the user grow in their career, build their skills, manage their weaknesses, and maintain mental well-being.
You have access to their profile, which includes their weak subjects, strengths, attendance, stress levels, and procrastination habits.

[MOOD-BASED DELIVERY]
You MUST adjust your tone based on the user's current mood constraint:
- STRESSED: Speak with extreme empathy, validate their feelings, use a calm, soothing tone, and reduce their workload. Suggest breaks.
- MOTIVATED/PUMPED: Speak with high energy, enthusiasm, and hype! Use exclamation marks, challenge them, and match their momentum.
- NORMAL: Speak professionally, concisely, and act like a senior engineer mentoring a junior.

[AGENTIC TOOL CALLING - EXTREMELY IMPORTANT]
You have the ability to directly modify the user's timetable and daily objectives. 
If the user asks you to add ANY task, objective, habit, or schedule change (e.g. "add a checklist for eating pasta"), you MUST append a JSON block at the very end of your response to execute the action.
Do NOT ignore this.

Use the following format strictly at the END of your message:
\`\`\`json
{
  "action": "ADD_TASK",
  "title": "[Short Actionable Title]",
  "why": "[Brief encouragement]",
  "priority": "High" // or Medium or Low
}
\`\`\`
To remove a task:
\`\`\`json
{
  "action": "REMOVE_TASK",
  "title": "[Keyword of task to remove]"
}
\`\`\`

[CRITICAL REQUIREMENTS]
1. Give a quick actionable answer first.
2. Only output the JSON block if you are actively modifying the schedule.
3. Keep answers concise (3-5 lines max by default).
4. NEVER sound like a corporate bot.`;

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
      interests, // This maps to strengths/hobbies
      weakSubjects,
      stressLevel,
      attendance,
      procrastinationLevel,
      todayTasks,
      myCornerData,
    } = safePersonalization as any;

    let myCornerContext = '';
    if (myCornerData && myCornerData.subjects) {
      const subs = Object.values(myCornerData.subjects) as any[];
      if (subs.length > 0) {
        myCornerContext = 'My Corner (Subjects/Syllabus Progress): ' + subs.map(sub => {
          const totalUnits = sub.units?.length || 0;
          const completedUnits = sub.units?.filter((u: any) => u.completed).length || 0;
          const filesCount = sub.files?.length || 0;
          return `${sub.name} (${completedUnits}/${totalUnits} units done, ${filesCount} files)`;
        }).join(' | ');
      }
    }

    const personalizationBits = [
      name ? `Name: ${name}` : null,
      branch ? `Branch: ${branch}` : null,
      Array.isArray(interests) && interests.length > 0 ? `Interests/Strengths: ${interests.join(', ')}` : null,
      Array.isArray(weakSubjects) && weakSubjects.length > 0 ? `Weak Subjects: ${weakSubjects.join(', ')}` : null,
      stressLevel !== undefined ? `Stress Level: ${stressLevel}/10` : null,
      attendance !== undefined ? `Attendance: ${attendance}%` : null,
      procrastinationLevel ? `Procrastination Level: ${procrastinationLevel}` : null,
      Array.isArray(todayTasks) && todayTasks.length > 0 ? `Today's tasks: ${todayTasks.join('; ')}` : null,
      myCornerContext ? myCornerContext : null,
    ].filter(Boolean);

    const contextMessage = `This user is relying on you for mentorship. ${moodContext}${personalizationBits.length ? `\nPersonalization Context: ${personalizationBits.join(' | ')}` : ''}`;

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
      Array.isArray(interests) && interests.length > 0 ? 'interests' : null,
      Array.isArray(weakSubjects) && weakSubjects.length > 0 ? 'weakSubjects' : null,
      stressLevel !== undefined ? 'stressLevel' : null,
      attendance !== undefined ? 'attendance' : null,
      procrastinationLevel ? 'procrastinationLevel' : null,
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
