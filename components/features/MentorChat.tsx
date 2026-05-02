'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Smile, AlertCircle, Zap, MessageCircle, AlertTriangle } from 'lucide-react';
import { getMentorResponse, getPhaseNumber } from '@/lib/mentorKnowledge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'mentor';
  timestamp: string;
  isError?: boolean;
}

interface MentorChatProps {
  currentDay: number;
  onBack?: () => void;
  isFloating?: boolean;
}

interface ChatPersonalization {
  name?: string;
  branch?: string;
  hostel?: string;
  interests?: string[];
  extracurricular?: string;
  userType?: string;
  currentModule?: string | null;
  todayTasks?: string[];
  myCornerData?: any;
}

export function MentorChat({ currentDay, onBack, isFloating }: MentorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [mood, setMood] = useState<'neutral' | 'stressed' | 'motivated'>('neutral');
  const [isTyping, setIsTyping] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const phase = getPhaseNumber(currentDay);

  const buildWelcomeMessage = () => ({
    id: '1',
    text: `Hey! 👋 I'm your AI mentor. Day ${currentDay} of your journey! I'm here to help with anything - academics, campus life, stress, you name it. What's on your mind?`,
    sender: 'mentor' as const,
    timestamp: new Date().toISOString(),
  });

  const persistChatHistory = async (nextMessages: Message[]) => {
    const trimmed = nextMessages.slice(-50);
    localStorage.setItem('chatHistory', JSON.stringify(trimmed));
  };

  useEffect(() => {
    const cached = localStorage.getItem('chatHistory');
    if (cached) {
      const parsed = JSON.parse(cached) as Message[];
      if (parsed.length > 0) {
        setMessages(parsed);
        return;
      }
    }
    setMessages([buildWelcomeMessage()]);
  }, [currentDay]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const getContextualChips = () => {
    try {
      const raw = localStorage.getItem('mentorProfile');
      const profile = raw ? JSON.parse(raw) : null;
      const interests: string[] = Array.isArray(profile?.interests) ? profile.interests : [];
      const chips: { topic: string; emoji: string }[] = [
        { topic: `What should I focus on Day ${currentDay}?`, emoji: '📅' },
        { topic: 'How do I check attendance on ERP?', emoji: '📋' },
        { topic: 'I\'m feeling overwhelmed', emoji: '😤' },
        { topic: 'Help me with my academics', emoji: '📚' },
      ];
      if (interests.includes('Coding')) chips.splice(2, 0, { topic: 'Give me a DSA problem to practice', emoji: '💻' });
      if (interests.includes('Design')) chips.splice(2, 0, { topic: 'How do I start learning Figma?', emoji: '🎨' });
      if (interests.includes('Sports')) chips.splice(2, 0, { topic: 'How to balance sports and studies?', emoji: '⚽' });
      return chips.slice(0, 4);
    } catch {
      return [
        { topic: `What should I focus on Day ${currentDay}?`, emoji: '📅' },
        { topic: 'I\'m feeling overwhelmed', emoji: '😤' },
        { topic: 'Help me with my academics', emoji: '📚' },
        { topic: 'How to stay consistent?', emoji: '⚡' },
      ];
    }
  };

  const moodOptions = [
    { value: 'stressed' as const, icon: AlertCircle, label: 'Stressed', color: 'text-red-500' },
    { value: 'neutral' as const, icon: Smile, label: 'Normal', color: 'text-primary' },
    { value: 'motivated' as const, icon: Zap, label: 'Pumped', color: 'text-green-500' }
  ];

  const inferMood = (text: string, topic?: string): 'neutral' | 'stressed' | 'motivated' => {
    const normalized = `${text} ${topic || ''}`.toLowerCase();
    const stressedKeywords = [
      'stress', 'stressed', 'anxious', 'anxiety', 'overwhelmed', 'panic', 'scared', 'worried', 'tired', 'exhausted', 'burnout', 'pressure', 'sad', 'depressed', 'low', 'fail', 'failing'
    ];
    const motivatedKeywords = [
      'motivated', 'pumped', 'excited', 'confident', 'ready', "let's go", 'let us go', 'ambitious', 'goal', 'goals', 'grind', 'focus', 'productive', 'energy', 'hype'
    ];

    if (stressedKeywords.some((keyword) => normalized.includes(keyword))) {
      return 'stressed';
    }
    if (motivatedKeywords.some((keyword) => normalized.includes(keyword))) {
      return 'motivated';
    }
    if (topic?.toLowerCase().includes('stress')) {
      return 'stressed';
    }
    return 'neutral';
  };

  const handleSendMessage = async (text: string, topic?: string) => {
    if (!text.trim()) return;

    const now = Date.now();
    if (now - lastRequestTime < 2000) {
      setApiError('Please wait a moment before sending another message');
      return;
    }
    setLastRequestTime(now);

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => {
      const next = [...prev, userMessage];
      persistChatHistory(next);
      return next;
    });
    setInput('');
    setIsTyping(true);
    setApiError(null);
    const derivedMood = inferMood(text, topic);
    if (derivedMood !== mood) {
      setMood(derivedMood);
    }


    try {
      const personalization: ChatPersonalization = (() => {
        try {
          const profileRaw = localStorage.getItem('mentorProfile');
          const lpuRaw = localStorage.getItem('lpuState');
          const tasksByDayRaw = localStorage.getItem('tasksByDay');
          const myCornerRaw = localStorage.getItem('myCornerData');
          const profile = profileRaw ? JSON.parse(profileRaw) : null;
          const lpuState = lpuRaw ? JSON.parse(lpuRaw) : null;
          const tasksByDay = tasksByDayRaw ? JSON.parse(tasksByDayRaw) : null;
          const myCornerData = myCornerRaw ? JSON.parse(myCornerRaw) : null;
          const todayTasks = tasksByDay?.[String(currentDay)] || tasksByDay?.[currentDay] || [];

          return {
            name: profile?.name || undefined,
            branch: profile?.branch || undefined,
            hostel: profile?.hostel || undefined,
            interests: Array.isArray(profile?.interests) ? profile.interests : undefined,
            extracurricular: profile?.extracurricular || undefined,
            userType: lpuState?.userType || undefined,
            currentModule: lpuState?.currentModule ?? undefined,
            todayTasks: Array.isArray(todayTasks) ? todayTasks : undefined,
            // New Evaluation Engine Profile Data
            weakSubjects: Array.isArray(profile?.weakSubjects) ? profile.weakSubjects : undefined,
            stressLevel: profile?.stressLevel ?? undefined,
            attendance: profile?.attendance ?? undefined,
            procrastinationLevel: profile?.procrastinationLevel || undefined,
            myCornerData: myCornerData || undefined,
          };
        } catch {
          return {};
        }
      })();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          mood: derivedMood,
          currentDay,
          phase,
          personalization,
        }),
      });

      if (!response.ok) {
        let errorMsg = `API error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          errorMsg = response.statusText || errorMsg;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (data.success && data.response) {
        let cleanText = data.response;
        
        // Agentic JSON interceptor
        const jsonMatch = data.response.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          try {
            const command = JSON.parse(jsonMatch[1]);
            cleanText = data.response.replace(/```json\n([\s\S]*?)\n```/, '').trim();
            
            // Dispatch command to custom tasks
            const customTasksKey = `customTasks_${currentDay}`;
            const existingTasksRaw = localStorage.getItem(customTasksKey);
            let customTasks = existingTasksRaw ? JSON.parse(existingTasksRaw) : [];
            
            if (command.action === 'ADD_TASK') {
              customTasks.push({
                title: command.title,
                why: command.why || 'Added by AI Mentor',
                type: 'academics',
                priority: command.priority || 'Medium'
              });
            } else if (command.action === 'REMOVE_TASK') {
              customTasks = customTasks.filter((t: any) => !t.title.toLowerCase().includes(command.title.toLowerCase()));
            }
            
            localStorage.setItem(customTasksKey, JSON.stringify(customTasks));
            // Trigger a custom event so DashboardScreen can update
            window.dispatchEvent(new Event('customTasksUpdated'));
            
          } catch (err) {
            console.error('Failed to parse Agentic command', err);
          }
        }

        const mentorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: cleanText,
          sender: 'mentor',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => {
          const next = [...prev, mentorMessage];
          persistChatHistory(next);
          return next;
        });
      } else {
        throw new Error(data.error || 'Invalid response format');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Connection error';
      
      let userFriendlyError = errorMessage;
      if (errorMessage.includes('429') || errorMessage.includes('Too many') || errorMessage.includes('rate')) {
        userFriendlyError = 'Server is busy - please wait a few seconds and try again';
      } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('API key')) {
        userFriendlyError = 'API key issue - try refreshing the page';
      } else if (errorMessage.includes('model') || errorMessage.includes('503')) {
        userFriendlyError = 'Service temporarily unavailable - using smart responses';
      } else if (errorMessage.includes('Connection')) {
        userFriendlyError = 'Connection issue - check your internet';
      }
      
      setApiError(userFriendlyError);
      
      const fallbackResponse = getMentorResponse(text, phase, mood);
      const mentorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: fallbackResponse,
        sender: 'mentor',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => {
        const next = [...prev, mentorMessage];
        persistChatHistory(next);
        return next;
      });
    } finally {
      setIsTyping(false);
    }
  };


  return (
    <div className={`${isFloating ? 'h-full' : 'min-h-screen'} bg-background relative flex flex-col font-sans`}>

      {/* Header */}
      {!isFloating && (
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 rounded-xl bg-card border hover:bg-accent hover:text-accent-foreground transition-colors shrink-0 shadow-sm"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-xl md:text-2xl font-bold text-foreground truncate flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary shrink-0" />
                  Mentor Chat
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground font-medium">Day {currentDay} • Constant Support</p>
              </div>
            </div>
            
            {/* Mood Selector */}
            <div className="flex gap-2 ml-4 shrink-0">
              {moodOptions.map(({ value, icon: Icon, label, color }) => (
                <button
                  key={value}
                  onClick={() => setMood(value)}
                  className={`p-2.5 rounded-xl transition-all border shadow-sm ${
                    mood === value
                      ? `bg-primary/10 border-primary/30 text-primary`
                      : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                  title={label}
                >
                  <Icon className={`w-4 h-4 md:w-5 md:h-5 ${mood === value ? color : ''}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {apiError && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 md:px-6 py-3 relative z-30">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-destructive text-sm flex-1 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{apiError}</span>
            </div>
            <button
              onClick={() => setApiError(null)}
              className="text-destructive hover:text-destructive/80 text-sm font-bold shrink-0"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 md:px-6 py-6 md:py-8 relative z-10 scrollbar-thin bg-muted/30">
        <div className="max-w-4xl mx-auto space-y-5 md:space-y-6">
          {messages.map((message, idx) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
            >
              <div
                className={`max-w-xs md:max-w-md px-5 py-4 rounded-3xl shadow-sm text-sm leading-relaxed ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-card text-card-foreground border rounded-bl-sm'
                }`}
              >
                <div
                  className="prose-mentor"
                  dangerouslySetInnerHTML={{
                    __html: message.text
                      // bold
                      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                      // italic
                      .replace(/\*(.+?)\*/g, '<em>$1</em>')
                      // bullet list lines starting with "- " or "* "
                      .replace(/^(?:[-*]) (.+)/gm, '<li>$1</li>')
                      // wrap consecutive <li> in <ul>
                      .replace(/(<li>[\s\S]*?<\/li>(\n|$))+/g, (m) => `<ul class="mt-2 ml-4 space-y-1 list-disc">${m}</ul>`)
                      // double newline → paragraph break
                      .replace(/\n{2,}/g, '</p><p class="mt-2">')
                      // single newline → line break
                      .replace(/\n/g, '<br />')
                  }}
                />
                <p className={`text-[10px] mt-2 font-medium ${
                  message.sender === 'user' 
                    ? 'text-primary-foreground/70' 
                    : 'text-muted-foreground'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-card border px-5 py-4 rounded-3xl rounded-bl-sm shadow-sm flex items-center gap-2 shadow-sm">
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Contextual chips — only on first load, before any user message */}
      {messages.length <= 1 && messages.every(m => m.sender === 'mentor') && (
        <div className="bg-background border-t px-4 md:px-6 py-5 relative z-10">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Quick start</p>
            <div className="flex flex-wrap gap-2">
              {getContextualChips().map((q) => (
                <button
                  key={q.topic}
                  onClick={() => handleSendMessage(q.topic)}
                  className="px-4 py-2.5 rounded-xl bg-card border hover:border-primary hover:bg-accent text-foreground text-sm font-medium transition-all flex items-center gap-2 shadow-sm"
                >
                  <span>{q.emoji}</span>
                  <span>{q.topic}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-background border-t sticky bottom-0 z-40">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex gap-3 items-center">
          <Input
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(input);
              }
            }}
            className="flex-1 bg-card border-input text-foreground px-5 py-6 rounded-2xl text-base shadow-sm focus-visible:ring-primary"
          />

          <button
            onClick={() => handleSendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 w-12 shrink-0 p-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center rounded-2xl transition-all hover:scale-105 shadow-sm"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
