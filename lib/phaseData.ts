import { StudyPlanProfile } from '@/lib/studyPlanProfile';

export const phaseTitles = {
  1: "AI Calibration Phase",
  2: "Adaptive Execution Phase",
  3: "Predictive Mastery Phase"
};

export const phaseDescriptions = {
  1: "Get familiar with campus, understand systems, and build your initial support network.",
  2: "Balance academics with skill development and extracurricular activities.",
  3: "Polish your skills, build confidence, and plan your college journey."
};

export const phaseTasks = {
  1: [
    { day: 1, tasks: ["Attend orientation program", "Meet your roommate and floor mates", "Locate important buildings"] },
    { day: 2, tasks: ["Get your ID card", "Visit the library", "Check ERP system"] },
    { day: 3, tasks: ["Attend your first class", "Talk to a professor", "Join one club interest session"] },
    { day: 4, tasks: ["Explore the campus fully", "Visit the mess", "Get your phone recharged"] },
    { day: 5, tasks: ["Visit academic block", "Check attendance on ERP", "Talk to one senior"] },
    { day: 6, tasks: ["Attend a club meeting", "Visit the sports complex", "Make a weekly schedule"] },
    { day: 7, tasks: ["Review your first week", "Connect with classmates", "Plan next week"] },
    { day: 8, tasks: ["Submit any pending documents", "Join class WhatsApp group", "Understand deadline system"] },
    { day: 9, tasks: ["Visit medical center", "Get laundry sorted", "Attend extra class"] },
    { day: 10, tasks: ["Explore the city near campus", "Have lunch with a classmate", "Update family"] },
  ],
  2: [
    { day: 31, tasks: ["Finalize 1-2 clubs to focus on", "Create a study plan", "Start a small project"] },
    { day: 32, tasks: ["Join club communications", "Review notes", "Attend club meeting"] },
    { day: 40, tasks: ["Start coding practice", "Attend seminar", "Complete assignments"] },
    { day: 50, tasks: ["Work on a small project", "Prepare for midterms", "Mentor a junior"] },
    { day: 60, tasks: ["Review progress", "Prepare for exams", "Plan skills"] },
  ],
  3: [
    { day: 61, tasks: ["Work on portfolio", "Practice interview questions", "Attend placement talks"] },
    { day: 70, tasks: ["Complete a project", "Help juniors", "Build something cool"] },
    { day: 80, tasks: ["Prepare resume", "Do mock interviews", "Reflect on growth"] },
    { day: 90, tasks: ["Celebrate your progress", "Plan next semester", "Share your journey with juniors"] },
  ]
};

// ─── Dynamic Task Engine ─────────────────────────────────────────────────────

export type TaskCategory = 'academics' | 'exploration' | 'social' | 'admin' | 'activities' | 'learning' | 'skills' | 'planning' | 'coding' | 'design' | 'sports' | 'career' | 'health';

export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface DailyTask {
  title: string;
  category: TaskCategory;
  why?: string; // expandable tip
  priority?: TaskPriority;
}

// Pool of tasks by category
const taskPool: Record<TaskCategory, DailyTask[]> = {
  academics: [
    { title: "Solve 3 past-year questions on your hardest core subject", category: "academics", why: "Past papers are the ultimate heuristic for exam patterns.", priority: "High" },
    { title: "Create a 1-page algorithmic cheat sheet", category: "academics", why: "Distilling complex concepts into one page forces deep understanding." },
    { title: "Map out the syllabus weightage for internals", category: "academics", why: "Don't study blindly. Optimize for high-yield topics first.", priority: "High" },
    { title: "Watch a 30-minute MIT/Stanford lecture on your weakest topic", category: "academics", why: "World-class explanations can instantly unblock conceptual hurdles.", priority: "Medium" },
    { title: "Implement a theoretical concept from today's class in code", category: "academics", why: "Theory is forgotten; applied code becomes permanent knowledge." },
  ],
  admin: [
    { title: "Organize your local dev environment & project folders", category: "admin", why: "A cluttered workspace creates cognitive friction. Clean your desktop." },
    { title: "Clear out old node_modules using npkill", category: "admin", why: "Free up gigs of SSD space to keep your machine running fast." },
    { title: "Update your academic tracker with current internal scores", category: "admin", why: "You can't manage what you don't measure. Know your exact academic standing.", priority: "High" },
  ],
  exploration: [
    { title: "Set up and explore Docker for local development", category: "exploration", why: "Containerization is industry standard. Get comfortable with Dockerfiles." },
    { title: "Explore a new API using Postman or Bruno", category: "exploration", why: "API integration is 80% of modern software engineering." },
    { title: "Read the documentation for a new UI library (e.g., Aceternity, Shadcn)", category: "exploration", why: "Expanding your UI toolkit drastically speeds up hackathon builds." },
  ],
  social: [
    { title: "Conduct a 30-minute mock technical interview with a peer", category: "social", why: "Practicing DSA out loud is entirely different from coding alone." },
    { title: "Review a classmate's GitHub Pull Request", category: "social", why: "Code reviews teach you how to read code, a critical senior dev skill." },
    { title: "Share a technical article in your batch's Discord/WhatsApp", category: "social", why: "Become the go-to person for technical resources in your network." },
  ],
  activities: [
    { title: "Register for an upcoming weekend Hackathon", category: "activities", why: "Hackathons force you to build and deploy under pressure.", priority: "Medium" },
    { title: "Contribute to an Open Source repository (Good First Issue)", category: "activities", why: "OSS contributions are the strongest signal you can send to recruiters." },
    { title: "Attend a technical workshop or webinar", category: "activities", why: "Expose yourself to paradigms outside your current curriculum." },
  ],
  learning: [
    { title: "Read 1 article on System Design (e.g., Load Balancing, Caching)", category: "learning", why: "System design separates junior devs from mid-level engineers.", priority: "High" },
    { title: "Learn the internals of how the V8 JavaScript Engine works", category: "learning", why: "Understanding the engine makes you write significantly faster code." },
    { title: "Implement a basic version of a library you use (e.g., React reactivity)", category: "learning", why: "Reinventing the wheel is the best way to understand how the wheel works." },
  ],
  skills: [
    { title: "Learn 5 advanced Git commands (rebase, cherry-pick, stash)", category: "skills", why: "Git mastery prevents catastrophic codebase losses during internships." },
    { title: "Set up a clean terminal environment (Zsh + Oh My Zsh/Tmux)", category: "skills", why: "Your terminal is your primary tool. Make it extremely efficient." },
    { title: "Master 10 new VS Code / Cursor keyboard shortcuts", category: "skills", why: "Mouse dependency slows down your coding throughput." },
  ],
  planning: [
    { title: "Design the database schema for your next side project", category: "planning", why: "Data modeling is the foundation. If the schema is wrong, the app fails.", priority: "Medium" },
    { title: "Break down your weekend project into Jira/Trello tickets", category: "planning", why: "Professional engineering is about scoped execution, not blind coding.", priority: "High" },
    { title: "Map out your exact target companies and their tech stacks", category: "planning", why: "Reverse engineer your learning path based on your target roles." },
  ],
  coding: [
    { title: "Solve 2 DSA questions on Arrays (Two Pointers approach)", category: "coding", why: "Two pointers is the most heavily tested pattern in technical screens.", priority: "High" },
    { title: "Implement a REST API endpoint with input validation (Zod)", category: "coding", why: "Never trust client data. Validation is mandatory in production.", priority: "High" },
    { title: "Set up a CI/CD pipeline using GitHub Actions", category: "coding", why: "Automated testing and deployment is a requirement for modern workflows." },
    { title: "Write unit tests for a critical function using Jest/Vitest", category: "coding", why: "Un-tested code is legacy code. Build the habit of testing early." },
    { title: "Optimize an O(n^2) algorithm to O(n log n) or O(n)", category: "coding", why: "Algorithmic optimization is the core of engineering problem-solving.", priority: "Medium" },
  ],
  design: [
    { title: "Design a responsive landing page layout in Figma", category: "design", why: "Visual prototyping saves hours of wasted CSS coding." },
    { title: "Implement a CSS Grid layout for a complex dashboard", category: "design", why: "CSS Grid is exponentially more powerful than standard flexbox for layouts." },
    { title: "Audit your app for Web Content Accessibility Guidelines (WCAG)", category: "design", why: "Accessibility is a legal and ethical requirement for modern web apps." },
  ],
  sports: [
    { title: "Do a 20-minute HIIT workout to spike endorphins", category: "sports", why: "High-intensity cardio resets your dopamine baseline for deep work." },
    { title: "Perform 3 sets of posture-correction exercises (face pulls, dead hangs)", category: "sports", why: "Programmer posture (rounded shoulders) will destroy your back long-term.", priority: "High" },
  ],
  career: [
    { title: "Draft 3 resume bullet points using the STAR/XYZ method", category: "career", why: "Recruiters scan resumes in 6 seconds. Make your impact quantifiable.", priority: "High" },
    { title: "Send a cold message to a senior engineer at a target company", category: "career", why: "A 5% reply rate on 20 messages is exactly 1 referral." },
    { title: "Update your GitHub profile README to showcase your top 2 projects", category: "career", why: "Your GitHub profile is your real resume for technical recruiters." },
    { title: "Practice your 2-minute 'Tell me about yourself' elevator pitch", category: "career", why: "This question sets the tone for the entire technical interview.", priority: "High" },
  ],
  health: [
    { title: "Implement the 20-20-20 rule to prevent ocular degradation", category: "health", why: "Staring at screens continuously causes permanent myopia progression." },
    { title: "Block blue light 2 hours before your target sleep time", category: "health", why: "Melatonin suppression destroys REM sleep, reducing memory consolidation.", priority: "High" },
  ],
};

const interestCategoryMap: Record<string, TaskCategory[]> = {
  Coding: ['coding', 'skills', 'career'],
  Design: ['design', 'skills', 'career'],
  Sports: ['sports', 'health', 'activities'],
  Robotics: ['coding', 'skills', 'learning'],
  Arts: ['design', 'activities', 'learning'],
  Core: ['academics', 'learning', 'planning'],
};

const phaseBaseTasks: Record<1 | 2 | 3, TaskCategory[]> = {
  1: ['admin', 'exploration', 'social'],
  2: ['academics', 'learning', 'activities'],
  3: ['skills', 'career', 'planning'],
};

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function pickUnique<T>(arr: T[], n: number, rng: () => number): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

export function getDailyTasks(day: number, interests: string[] = [], count = 4): DailyTask[] {
  const phase = getPhaseNumber(day);
  const rng = seededRandom(day * 31337 + interests.length * 7);

  // 2 base tasks from phase category
  const baseCategories = phaseBaseTasks[phase];
  const selectedBase = pickUnique(baseCategories, 2, rng);
  const baseTasks: DailyTask[] = [];
  for (const cat of selectedBase) {
    const pool = taskPool[cat] || [];
    if (pool.length > 0) {
      const idx = Math.floor(rng() * pool.length);
      const t = pool[idx];
      baseTasks.push({ ...t, priority: t.priority || 'Medium' });
    }
  }

  // 2 interest-specific tasks
  const interestCategories: TaskCategory[] = [];
  for (const interest of interests) {
    const cats = interestCategoryMap[interest] || [];
    interestCategories.push(...cats);
  }
  // Fallback if no interests
  if (interestCategories.length === 0) {
    interestCategories.push('academics', 'learning', 'health');
  }
  const uniqueInterestCats = [...new Set(interestCategories)];
  const selectedInterest = pickUnique(uniqueInterestCats, 2, rng);
  const interestTasks: DailyTask[] = [];
  for (const cat of selectedInterest) {
    const pool = taskPool[cat] || [];
    if (pool.length > 0) {
      const idx = Math.floor(rng() * pool.length);
      const candidate = pool[idx];
      if (!baseTasks.some(t => t.title === candidate.title) && !interestTasks.some(t => t.title === candidate.title)) {
        interestTasks.push({ ...candidate, priority: candidate.priority || 'Medium' });
      } else {
        const next = pool[(idx + 1) % pool.length];
        if (!baseTasks.some(t => t.title === next.title) && !interestTasks.some(t => t.title === next.title)) {
          interestTasks.push({ ...next, priority: next.priority || 'Medium' });
        }
      }
    }
  }

  return [...baseTasks, ...interestTasks].slice(0, count);
}

export const motivationalQuotes = [
  "The best time to plant a tree was 20 years ago. The second best is now.",
  "Your limitations don't define your potential.",
  "Progress over perfection. Every small step counts.",
  "You're doing better than you think you are.",
  "Consistency beats talent every single time.",
  "Fail fast, learn faster.",
  "Your 90 days ago self would be proud of you today.",
  "Don't compare your beginning with someone else's middle.",
  "Success is a marathon, not a sprint.",
  "You have exactly what it takes to reach your goals.",
  "Ship it, then fix it. Done beats perfect.",
  "The best engineers aren't the smartest — they're the most consistent.",
  "Every expert was once a beginner with the guts to start.",
  "You don't rise to the level of your goals. You fall to the level of your systems.",
  "Build the habit. The results will follow.",
];

export const getPhaseNumber = (day: number): 1 | 2 | 3 => {
  if (day <= 30) return 1;
  if (day <= 60) return 2;
  return 3;
};

// Legacy — kept for backward compat with any remaining imports
export const dailyTasksByPhase = {
  1: [
    { title: "Attend morning class", category: "academics" },
    { title: "Explore a new area of campus", category: "exploration" },
    { title: "Check ERP attendance", category: "admin" },
  ],
  2: [
    { title: "Study for 2 hours", category: "academics" },
    { title: "Work on project", category: "skills" },
    { title: "Learn a new skill", category: "learning" },
  ],
  3: [
    { title: "Build project feature", category: "skills" },
    { title: "Practice DSA", category: "coding" },
    { title: "Work on resume", category: "career" },
  ]
};

export const campusGuide = {
  buildings: [
    { name: "Academic Block A", description: "Main classroom building for core subjects", tips: "Check the schedule board for class timings", icon: "🏢" },
    { name: "Central Library", description: "Study sanctuary — 4th floor is the quiet zone", tips: "Open until 10 PM. 4th floor silent study area is gold", icon: "📚" },
    { name: "Sports Complex", description: "Gym, courts, swimming pool, and outdoor areas", tips: "Gym: 6AM–9PM. Badminton courts bookable at sports desk", icon: "⚽" },
    { name: "Medical Center", description: "On-campus health services and emergency care", tips: "Doctor 9AM–5PM weekdays. Night emergency: call security", icon: "🏥" },
  ],
  facilities: [
    { name: "Mess & Cafeteria", description: "Multiple mess halls and cafes across campus", tips: "Breakfast 7–8AM, Lunch 12–2PM, Dinner 7–9PM", icon: "🍽️" },
    { name: "Computer Lab", description: "24/7 access during exam season", tips: "Book early during internal exam week — fills up fast", icon: "💻" },
  ],
  resources: [
    { name: "Career Center", description: "Placement prep, resume reviews, and career counseling", tips: "Register before 2nd year. They run mock interview sessions", icon: "🎓" },
    { name: "IT Help Desk", description: "Wi-Fi, ERP issues, and device support", tips: "Admin block, Room 101. Resolve ERP issues here", icon: "🖥️" },
  ]
};

export const studyResources = {
  programming: {
    title: "Programming & DSA",
    topics: [
      { name: "Data Structures", difficulty: "Intermediate", time: "4 weeks" },
      { name: "Algorithms", difficulty: "Advanced", time: "6 weeks" },
      { name: "System Design", difficulty: "Advanced", time: "8 weeks" },
      { name: "Database Design", difficulty: "Intermediate", time: "3 weeks" }
    ],
    tips: "Start with basics. LeetCode Easy problems help build confidence",
    platforms: ["LeetCode", "HackerRank", "CodeChef", "GeeksForGeeks", "NeetCode"]
  },
  mathematics: {
    title: "Mathematics & Core",
    topics: [
      { name: "Calculus", difficulty: "Intermediate", time: "5 weeks" },
      { name: "Linear Algebra", difficulty: "Intermediate", time: "4 weeks" },
      { name: "Probability & Statistics", difficulty: "Intermediate", time: "3 weeks" },
      { name: "Discrete Math", difficulty: "Intermediate", time: "4 weeks" },
    ],
    tips: "Solve past question papers. Practice is key",
    platforms: ["NPTEL", "Khan Academy", "MIT OpenCourseWare", "Brilliant.org"]
  },
  webDevelopment: {
    title: "Web Development",
    topics: [
      { name: "HTML & CSS", difficulty: "Easy", time: "2 weeks" },
      { name: "JavaScript", difficulty: "Intermediate", time: "4 weeks" },
      { name: "React / Next.js", difficulty: "Intermediate", time: "4 weeks" },
      { name: "Backend & APIs", difficulty: "Advanced", time: "6 weeks" }
    ],
    tips: "Build projects as you learn. Deploy them on Vercel or GitHub Pages",
    platforms: ["freeCodeCamp", "The Odin Project", "Udemy", "Frontend Mentor"]
  }
};

export const randomSeniorTip = (): string => {
  const tips = [
    "Wake up early. The library is peaceful before 9 AM.",
    "Join clubs in first week itself — it gets harder later.",
    "Attend professor's office hours. They remember helpful students.",
    "Start projects early, not day before deadline.",
    "Your first semester GPA matters. Take it seriously.",
    "Make friends outside your department.",
    "Attendance matters more than you think for grades.",
    "Network with seniors — they become your lifeline.",
    "Start internship hunt by end of 2nd year.",
    "Balance is key. Don't burn out.",
    "Your mental health matters more than marks.",
    "College is about experiences, not just grades.",
    "Read your syllabus on Day 1. Know exactly what's expected.",
    "The best time to ask a 'dumb question' is before the exam, not during.",
    "Use summers wisely — one internship changes everything.",
  ];
  return tips[Math.floor(Math.random() * tips.length)];
};

// ─── Evaluation Engine (Stress-Aware Adaptive Replanning) ─────────────────────

export function generateAdaptivePlan(day: number, profile: StudyPlanProfile): DailyTask[] {
  const interests = profile.weakSubjects && profile.weakSubjects.length > 0 
    ? profile.weakSubjects 
    : ['Coding', 'Design'];
    
  let tasks: DailyTask[] = [];

  // Inject Strategic Exam Prep Planner Tasks
  if (profile.upcomingExams && profile.upcomingExams.length > 0) {
    const nextExam = profile.upcomingExams[0]; // focus on the closest exam
    tasks.push({
      title: `[Exam Prep] Revise ${nextExam.topics[day % nextExam.topics.length] || 'core concepts'} for ${nextExam.title}`,
      category: 'academics',
      priority: 'High',
      why: `You have an upcoming exam on ${nextExam.date}. Regular spaced repetition is key.`
    });
  }

  // Inject DSA Continuous Series (Striver Pattern)
  if (profile.dsaTopic) {
    const dsaPatterns = ['Two Pointers', 'Sliding Window', 'Fast & Slow Pointers', 'Merge Intervals', 'Cyclic Sort', 'In-place Reversal of a LinkedList', 'Tree BFS/DFS', 'Subsets', 'Binary Search', 'Top K Elements'];
    const patternForDay = dsaPatterns[day % dsaPatterns.length];
    tasks.push({
      title: `[DSA Series] Practice ${patternForDay} pattern for ${profile.dsaTopic}`,
      category: 'coding',
      priority: 'High',
      why: 'Striver/Pattern-based practice builds fundamental algorithmic intuition faster than random questions.'
    });
  }

  // Inject Core Subject Progression
  if (profile.currentSubjects && profile.currentSubjects.length > 0) {
    const subjectToStudy = profile.currentSubjects[day % profile.currentSubjects.length];
    tasks.push({
      title: `[Syllabus] Study 1 core module for ${subjectToStudy}`,
      category: 'academics',
      priority: 'Medium',
      why: 'Consistent daily study of current subjects prevents cramming during internal CAs.'
    });
  }

  // Fill the rest with the standard daily tasks engine up to 6 tasks
  const standardTasks = getDailyTasks(day, interests, Math.max(2, 6 - tasks.length));
  tasks = [...tasks, ...standardTasks];

  // 1. Stress-Aware Adjustment
  if (profile.stressLevel >= 7) {
    tasks = tasks.filter(t => t.priority === 'High').slice(0, 3); // Compress heavily
    const healthTasks = taskPool['health'] || [];
    if (healthTasks.length > 0) {
      tasks.push({ ...healthTasks[day % healthTasks.length], priority: 'High' });
    }
  }

  // 2. Attendance Critical Check
  if (profile.attendance < 75) {
    const adminTasks = taskPool['admin'] || [];
    if (adminTasks.length > 0 && !tasks.some(t => t.category === 'admin')) {
      tasks.unshift({ ...adminTasks[day % adminTasks.length], priority: 'High' });
    }
  }

  // 3. Time Constraint Adjustment
  if (profile.hoursAvailableToday <= 2) {
    tasks = tasks.slice(0, 3); // Fit within extremely tight time limits
  }

  // 4. Procrastination check
  if (profile.procrastinationLevel === 'high') {
     const planningTasks = taskPool['planning'] || [];
     if (planningTasks.length > 0 && tasks.length < 5) {
        tasks.push({ ...planningTasks[day % planningTasks.length], priority: 'High' });
     }
  }

  const uniqueTasks = Array.from(new Set(tasks.map(t => t.title)))
    .map(title => tasks.find(t => t.title === title)!);

  return uniqueTasks.slice(0, 6); // Cap at 6 tasks
}
