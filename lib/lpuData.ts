// LPU Explorer Data Models

export type UserType = 'pre-admission' | 'new-student' | 'fresher';

// Video Hub Data
export interface Video {
  id: string;
  title: string;
  category: 'admission' | 'campus-tour' | 'hostel' | 'academics' | 'coding';
  youtubeId: string;
  duration: number; // minutes
  description: string;
  thumbnailUrl?: string;
  forUserTypes: UserType[];
  views: number;
  helpful: number; // upvotes
  uploadedDate: string;
  tags: string[];
}

export const videoData: Video[] = [
  {
    id: 'vid-1',
    title: 'LPU Admission Process 2026 - Complete Guide',
    category: 'admission',
    youtubeId: 'P_yE_iEE9w0',
    duration: 12,
    description: 'Step-by-step guide to LPU admission process, forms, and timelines',
    forUserTypes: ['pre-admission', 'new-student'],
    views: 2450,
    helpful: 189,
    uploadedDate: '2026-01-15',
    tags: ['admission', 'process', 'forms'],
  },
  {
    id: 'vid-2',
    title: 'Campus Tour: Buildings, Canteen & Hidden Spots',
    category: 'campus-tour',
    youtubeId: 'hVvEISFw9w0',
    duration: 18,
    description: 'Full tour of LPU campus - where to eat, study, and hang out',
    forUserTypes: ['new-student', 'fresher'],
    views: 3890,
    helpful: 342,
    uploadedDate: '2026-01-10',
    tags: ['campus', 'tour', 'facilities'],
  },
  {
    id: 'vid-3',
    title: 'Hostel Life: What Actually Happens (Honest Review)',
    category: 'hostel',
    youtubeId: '8qZAMyE_iEE',
    duration: 15,
    description: 'Real hostel experience - room allocation, rules, freedom, and making friends',
    forUserTypes: ['new-student', 'fresher'],
    views: 5612,
    helpful: 567,
    uploadedDate: '2026-01-08',
    tags: ['hostel', 'dorm', 'life'],
  },
  {
    id: 'vid-4',
    title: 'First Semester: Classes, Exams & Survival Tips',
    category: 'academics',
    youtubeId: 'm022y2dYwGE',
    duration: 20,
    description: 'Academic reality, professor expectations, exam patterns, and how to succeed',
    forUserTypes: ['new-student', 'fresher'],
    views: 4123,
    helpful: 456,
    uploadedDate: '2025-12-20',
    tags: ['academics', 'exams', 'study'],
  },
  {
    id: 'vid-5',
    title: 'Coding at LPU: From Zero to Placement Ready',
    category: 'coding',
    youtubeId: 'W6NZfCO5SIk',
    duration: 22,
    description: 'How to start coding, resources available, competitive programming, and internships',
    forUserTypes: ['new-student', 'fresher'],
    views: 6234,
    helpful: 789,
    uploadedDate: '2025-12-15',
    tags: ['coding', 'skills', 'placement'],
  },
];

// Success Stories & Achievements
export interface SuccessStory {
  id: string;
  title: string;
  branch: string;
  year: number; // graduation year
  category: 'placement' | 'hackathon' | 'internship' | 'startup';
  imageUrl?: string;
  story: string;
  achievement: string;
  advice: string;
  linkedIn?: string;
  tags: string[];
}

export const successStories: SuccessStory[] = [
  {
    id: 'story-1',
    title: 'From CSE Fresher to Google Intern',
    branch: 'CSE',
    year: 2025,
    category: 'internship',
    story:
      'I was scared in my first semester. But I focused on DSA + competitive programming. Solved 500+ problems on LeetCode. Google noticed and offered me internship.',
    achievement: 'Google Summer Internship 2024',
    advice:
      'What I wish I knew: Consistency > intensity. Code 1 hour daily, not 8 hours once a week. Start early.',
    tags: ['coding', 'placement', 'google'],
  },
  {
    id: 'story-2',
    title: 'Robotics Hackathon Winner',
    branch: 'ECE',
    year: 2024,
    category: 'hackathon',
    story:
      'Joined robotics club in first month. Assembled a team, learned embedded systems, won TechCrunch Disrupt hackathon in second year.',
    achievement: '₹5 Lakhs Prize Money, Media Coverage',
    advice:
      'Real talk: First month is confusing (normal!). Find your people early. Pick a club and stick with it.',
    tags: ['robotics', 'hackathon', 'innovation'],
  },
  {
    id: 'story-3',
    title: 'Civil Engineering to Construction Tech Startup',
    branch: 'Civil',
    year: 2023,
    category: 'startup',
    story:
      'Hated traditional civil work. Built an app for construction site management with 2 friends. Now bootstrapped to 50 clients.',
    achievement: 'Co-founder, YC Interview Selected (pending decision)',
    advice:
      'Warning: Your branch name doesn\'t define your future. Code, ideate, take risks in college while failure is free.',
    tags: ['startup', 'innovation', 'tech'],
  },
  {
    id: 'story-4',
    title: 'Mechanical Engineer in Strategy Consulting',
    branch: 'Mechanical',
    year: 2022,
    category: 'placement',
    story:
      'Took extra courses in business analytics. Published one research paper. McKinsey recruited me for strategy + operations role.',
    achievement: 'McKinsey & Company - APD Role, ₹24 LPA',
    advice:
      'Most valuable: Don\'t limit yourself. A mechanical engineer CAN be a consultant. Build diverse skills.',
    tags: ['placement', 'consulting', 'diverse-skills'],
  },
];

// Procedures & Official Guides
export interface Procedure {
  id: string;
  title: string;
  category:
  | 'admission'
  | 'documents'
  | 'hostel'
  | 'fees'
  | 'academic'
  | 'identity';
  steps: string[];
  estimatedTime: string;
  important: boolean;
  downloadUrl?: string;
  contact?: string;
  tags: string[];
}

export const procedures: Procedure[] = [
  {
    id: 'proc-1',
    title: 'Admission Documents Checklist',
    category: 'documents',
    steps: [
      '10th & 12th marksheets (original + copy)',
      'AADHAR card (original + copy)',
      'PAN card (optional)',
      'Caste certificate (if applicable)',
      'Migration certificate from previous school',
      '4x6 passport-size photos (20 copies recommended)',
      'Medical fitness certificate (as per LPU format)',
      'Character certificate from school',
      'Address proof (electricity bill, rent agreement)',
      'Parent ID proof (passport/AADHAR)',
    ],
    estimatedTime: '2-3 days to collect',
    important: true,
    downloadUrl: 'https://lpu.in/documents-checklist.pdf',
    contact: 'admissions@lpu.in',
    tags: ['admission', 'documents', 'checklist'],
  },
  {
    id: 'proc-2',
    title: 'Hostel Allocation Process',
    category: 'hostel',
    steps: [
      'Fill hostel preference form online during registration',
      'Mention preferred hostel (Boys/Girls, depends on campus)',
      'Select roommate preferences if applicable',
      're are no guarantees but preferences are considered',
      'Allocation list announced 2 weeks before semester',
      'Report to hostel warden on day 1 with documents',
      'Room allotted on first-come-first-served basis at check-in',
      'Pay hostel fees (₹70,000-₹1,20,000 per year depending on facility)',
    ],
    estimatedTime: '1 week process',
    important: false,
    contact: 'hostel@lpu.in | Hostel Office: Building A, 3rd Floor',
    tags: ['hostel', 'accommodation', 'process'],
  },
  {
    id: 'proc-3',
    title: 'Fee Payment Schedule',
    category: 'fees',
    steps: [
      'Admission fee: ₹2,000 (non-refundable, due with admission)',
      'Semester 1: Due by registration day',
      'Semester 2: Due 15 days before classes start',
      'Online payment via NEFT/RTGS accepted',
      'Installment options available - contact finance office',
      'Late fees: 2% per month after due date',
      'Request fee waiver/scholarship within 30 days of admission',
      'Keep all payment receipts (required for marksheet/certificate)',
    ],
    estimatedTime: 'Ongoing across semesters',
    important: true,
    downloadUrl: 'https://lpu.in/fee-structure.pdf',
    contact: 'finance@lpu.in | +91-1234-FINANCE',
    tags: ['fees', 'payment', 'financial'],
  },
  {
    id: 'proc-4',
    title: 'ID Card & Library Access',
    category: 'identity',
    steps: [
      'Photo taken at registration desk (bring 1 passport photo as backup)',
      'ID card issued same day or within 2 days',
      'Library access activated automatically',
      'Use ID for all campus access (hostels, labs, canteen)',
      'Report lost ID within 24 hours',
      'Replacement fee: ₹500 (takes 3-5 days)',
      'Login to portal using ID number + password',
      'ID remains valid 6 months after graduation',
    ],
    estimatedTime: '2 days',
    important: false,
    contact: 'registration@lpu.in',
    tags: ['id-card', 'library', 'access'],
  },
];

// Senior Advice Comments
export interface SeniorComment {
  id: string;
  name: string; // Can be optional for anonymity
  branch: string;
  year: number; // 2, 3, or 4
  hostel?: string;
  gender?: 'M' | 'F';
  advice: string;
  mood: 'motivation' | 'reality-check' | 'warning' | 'funny';
  helpful: number; // upvotes
  tags: string[];
}

export const seniorComments: SeniorComment[] = [
  {
    id: 'comment-1',
    name: 'Arjun',
    branch: 'CSE',
    year: 3,
    hostel: 'Silver Oak',
    gender: 'M',
    advice:
      'First month me coding se mat darna, sab zero se start karte hai. Mere se na ho toh duniya ke experts se bhi ho jayega.',
    mood: 'motivation',
    helpful: 234,
    tags: ['coding', 'fresher', 'motivation'],
  },
  {
    id: 'comment-2',
    name: 'Priya',
    branch: 'Mechanical',
    year: 2,
    gender: 'F',
    advice:
      'Ladkiyooon, first 2 weeks में اکثر loneliness feel hogi. Yeh normal hai. Dorm mates and floor mates se baat karo, clubs join karo. Sab theek ho jayega.',
    mood: 'reality-check',
    helpful: 189,
    tags: ['hostel', 'fresher', 'social'],
  },
  {
    id: 'comment-3',
    name: 'Rahul',
    branch: 'ECE',
    year: 4,
    advice:
      'BIGGEST WARNING: Ignore studies in first semester, sochte ho "catch-up kar lenge". You won\'t. GPA haunts you for placements. It\'s NOT just about marks, it\'s about consistency + reputation.',
    mood: 'warning',
    helpful: 456,
    tags: ['academics', 'gpa', 'serious'],
  },
  {
    id: 'comment-4',
    name: 'Anonymous',
    branch: 'CSE',
    year: 2,
    advice:
      'Why is the WiFi password on the dorm whiteboard always wrong 😭 Pro tip: Call IT support day 1, not day 30.',
    mood: 'funny',
    helpful: 123,
    tags: ['hostel', 'funny', 'it-support'],
  },
  {
    id: 'comment-5',
    name: 'Divya',
    branch: 'Civil',
    year: 3,
    gender: 'F',
    advice:
      'Your branch choice feels permanent. IT\'S NOT. If you don\'t like civil, learn to code in first year. Pivot to tech. I did it. Now in tech startup, civil ki degree is just paper now.',
    mood: 'reality-check',
    helpful: 312,
    tags: ['branch', 'pivot', 'career'],
  },
];

// Expectation vs Reality
export interface ComparisonItem {
  id: string;
  category: string;
  expectation: string;
  reality: string;
  impact: 'positive' | 'negative' | 'surprising';
  advice: string;
}

export const expectationVsReality: ComparisonItem[] = [
  {
    id: 'exp-1',
    category: 'Academics',
    expectation: 'Professors will teach everything. I\'ll study from lectures only.',
    reality:
      'Lectures are 20% of learning. Self-study, Google, YouTube, and peer learning are 80%. Professors expect you to be independent.',
    impact: 'negative',
    advice:
      'Treat college as a self-learning journey. The degree is a credential, education is your responsibility. Very different.',
  },
  {
    id: 'exp-2',
    category: 'Social Life',
    expectation: 'I\'ll make 100 best friends. College is non-stop parties and fun.',
    reality:
      'You\'ll find 3-5 close friends. Lots of acquaintances. Academically demanding. Parties exist but are spaced out.',
    impact: 'surprising',
    advice:
      'Quality > quantity. Invest in people who share your interests/goals. Clubs are underrated for friendship-building.',
  },
  {
    id: 'exp-3',
    category: 'Freedom',
    expectation: 'Complete freedom. No one will care what I do.',
    reality:
      'Hostel curfew exists (though lenient). Parent calls are mandatory. Peer judgment still real. Freedom is more than school, but not unlimited.',
    impact: 'negative',
    advice:
      'Use your freedom smartly. Late-night coding? Yes. Late-night partying every day? Backlog incoming. Balance.',
  },
  {
    id: 'exp-4',
    category: 'Placements',
    expectation: 'I\'ll get placed with a high package without trying hard.',
    reality:
      'Top 20% of students get placed in first round. Others take 2-3 rounds or switch to startups/higher ed. Hard work is mandatory.',
    impact: 'negative',
    advice:
      'Start networking, side projects, and skill-building from day 1. Placements are not guaranteed. Build yourself.',
  },
  {
    id: 'exp-5',
    category: 'Mental Health',
    expectation: 'College is the best time of my life. I\'ll always be happy.',
    reality:
      'First month = homesickness. Exams = stress. Placements = anxiety. Failures = common. It\'s NOT always happy. And that\'s okay.',
    impact: 'surprising',
    advice:
      '¿ NORMALIZE STRUGGLES ¿ Talk to seniors, counselors, friends. If you feel lost in first 30 days, you\'re not alone. Literally everyone feels it.',
  },
];

// Branch Explorer Data
export interface BranchInfo {
  id: string;
  name: string;
  code: string;
  description: string;
  subjects: string[];
  placementRate: number; // percentage
  avgPackage: number; // in LPA
  topRecruiters: string[];
  careerPaths: string[];
  seniorAdvice: string;
  isForYou: string[];
  needUrgently: string[];
}

export const branchInfo: BranchInfo[] = [
  {
    id: 'branch-cse',
    name: 'Computer Science & Engineering',
    code: 'CSE',
    description:
      'Core IT, software development, AI/ML, web development. Most placements, highest packages. Most competitive branch.',
    subjects: [
      'Data Structures',
      'Algorithms',
      'OOP',
      'Database Management',
      'Operating Systems',
      'Networking',
    ],
    placementRate: 95,
    avgPackage: 15,
    topRecruiters: ['Google', 'Amazon', 'Microsoft', 'Flipkart', 'Netapp'],
    careerPaths: [
      'Software Engineer',
      'Data Scientist',
      'DevOps Engineer',
      'Product Manager',
      'Founder',
    ],
    seniorAdvice:
      'Competition is REAL. You won\'t be the smartest. That\'s ok. Start coding from day 1. Consistency matters more than intelligence.',
    isForYou: ['If you like problem-solving', 'If you like building things', 'If you can commit to learning'],
    needUrgently: ['Coding fundamentals', 'Math for CS', 'English for communication'],
  },
  {
    id: 'branch-ece',
    name: 'Electronics & Communication Engineering',
    code: 'ECE',
    description:
      'Microelectronics, embedded systems, IoT, signal processing. Good placements, diverse career options.',
    subjects: [
      'Circuit Theory',
      'Signals & Systems',
      'Microprocessors',
      'VLSI Design',
      'Communication Systems',
      'Electromagnetics',
    ],
    placementRate: 85,
    avgPackage: 12,
    topRecruiters: [
      'Intel',
      'Qualcomm',
      'Texas Instruments',
      'Samsung',
      'Broadcom',
    ],
    careerPaths: [
      'Embedded Systems Engineer',
      'VLSI Designer',
      'IoT Developer',
      'Hardware Engineer',
      'Signal Processing',
    ],
    seniorAdvice:
      'Hardware is exciting but takes longer to learn. Be patient. Practical labs are more important than theory here. Join robotics club.',
    isForYou: [
      'If you like hardware + programming combo',
      'If you like tinkering with circuits',
      'If you hate pure theory',
    ],
    needUrgently: [
      'Electronics basics (resistors, capacitors, transistors)',
      'MATLAB or Python for signal processing',
    ],
  },
  {
    id: 'branch-mechanical',
    name: 'Mechanical Engineering',
    code: 'ME',
    description:
      'Machines, engines, thermodynamics, manufacturing. Sector-wide demand (auto, aerospace, HVAC, startups). Diverse paths.',
    subjects: [
      'Thermodynamics',
      'Fluid Mechanics',
      'Machine Design',
      'Manufacturing',
      'CAD Modeling',
      'Internal Combustion Engines',
    ],
    placementRate: 80,
    avgPackage: 10,
    topRecruiters: [
      'Maruti Suzuki',
      'Bosch',
      'TVS',
      'Siemens',
      'Caterpillar',
      'BHEL',
    ],
    careerPaths: [
      'Design Engineer',
      'Manufacturing Engineer',
      'Product Engineer',
      'Tech Entrepreneur',
      'Pivot to Tech/Management',
    ],
    seniorAdvice:
      'Mechanical is flexible. Learn CAD strictly (CATIA/SOLIDWORKS). If you\'re interested in product, join startup clubs. Many of us pivoted to tech and it worked out.',
    isForYou: [
      'If you like designing physical products',
      'If you like working with machines',
      'If you want flexibility in career options',
    ],
    needUrgently: [
      'CAD software skills (learn in first year)',
      'Physics concepts (mechanics, thermodynamics)',
      'Optional: Coding helps (many do it)',
    ],
  },
  {
    id: 'branch-civil',
    name: 'Civil Engineering',
    code: 'CE',
    description:
      'Buildings, roads, dams, infrastructure. Traditional placements in construction, also consulting, tech, entrepreneurship.',
    subjects: [
      'Structural Analysis',
      'RCC Design',
      'Surveying',
      'Geotechnical Engineering',
      'Environmental Engineering',
      'Construction Management',
    ],
    placementRate: 75,
    avgPackage: 9,
    topRecruiters: [
      'L&T',
      'Balfour Beatty',
      'Larsen & Toubro Infrastructure',
      'Schneider Electric',
      'Tech firms (for pivot)',
    ],
    careerPaths: [
      'Structural Engineer',
      'Site Engineer',
      'Project Manager',
      'Tech Entrepreneur',
      'Management Consultant',
    ],
    seniorAdvice:
      'Civil has the most varied paths. If you want pure infrastructure, great placements exist. If you want to pivot, learn to code in second year. Both work.',
    isForYou: [
      'If you like building large structures',
      'If you care about infrastructure',
      'If you\'re okay with on-site work',
    ],
    needUrgently: [
      'AutoCAD (essential from day 1)',
      'Physics (structural mechanics)',
      'Optional: Coding (for future tech pivots)',
    ],
  },
];

// Quiz: Is this branch for you?
export interface QuizQuestion {
  id: string;
  question: string;
  options: {
    text: string;
    branch: string[]; // which branches this points to
  }[];
}

export const branchQuiz: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'What excites you the most?',
    options: [
      {
        text: 'Building software, apps, and digital products',
        branch: ['CSE'],
      },
      { text: 'Designing physical objects and machines', branch: ['ME'] },
      {
        text: 'Building buildings, roads, and infrastructure',
        branch: ['CE'],
      },
      {
        text: 'Circuits, electronics, and embedded systems',
        branch: ['ECE'],
      },
    ],
  },
  {
    id: 'q2',
    question: 'How do you prefer to work?',
    options: [
      { text: 'Solo, focused, problem-solving on computer', branch: ['CSE'] },
      { text: 'Hands-on, building prototypes, lab work', branch: ['ECE', 'ME'] },
      { text: 'On-site, coordinating large projects', branch: ['CE'] },
      {
        text: 'Diverse mix - some lab, some theory, some coding',
        branch: ['ME', 'ECE', 'CE'],
      },
    ],
  },
  {
    id: 'q3',
    question: 'What matters most for your future?',
    options: [
      { text: 'Highest salary packages', branch: ['CSE'] },
      {
        text: 'Job security and stability',
        branch: ['CE', 'ME', 'ECE'],
      },
      { text: 'Startup potential and innovation', branch: ['CSE', 'ME'] },
      {
        text: 'International opportunities',
        branch: ['CSE', 'ECE', 'ME'],
      },
    ],
  },
];

// Study Resources
export interface StudyResource {
  id: string;
  title: string;
  category:
  | 'coding'
  | 'math'
  | 'physics'
  | 'electronics'
  | 'mechanical'
  | 'civil'
  | 'soft-skills'
  | 'placement';
  type: 'playlist' | 'course' | 'doc' | 'pdf' | 'tool';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  source: string;
  url: string;
  description: string;
  tags: string[];
}

export const studyResources: StudyResource[] = [
  {
    id: 'res-1',
    title: 'C Programming Essentials for Freshers',
    category: 'coding',
    type: 'course',
    level: 'beginner',
    duration: '6 hours',
    source: 'NPTEL',
    url: 'https://nptel.ac.in/courses/106105171',
    description: 'Start from zero: variables, loops, functions, and pointers with practice.',
    tags: ['c', 'fundamentals', 'first-sem'],
  },
  {
    id: 'res-2',
    title: 'Discrete Mathematics Crash Notes',
    category: 'math',
    type: 'pdf',
    level: 'beginner',
    duration: '42 pages',
    source: 'LPU Study Circle',
    url: 'https://example.com/lpu-discrete-math-notes.pdf',
    description: 'Short notes with solved questions for sets, relations, graphs, and logic.',
    tags: ['math', 'notes', 'exam'],
  },
  {
    id: 'res-3',
    title: 'Engineering Physics One-Shots',
    category: 'physics',
    type: 'playlist',
    level: 'beginner',
    duration: '12 videos',
    source: 'YouTube',
    url: 'https://www.youtube.com/playlist?list=PL-physics',
    description: 'Concise video lectures on waves, optics, and modern physics.',
    tags: ['physics', 'playlist', 'revision'],
  },
  {
    id: 'res-4',
    title: 'Digital Electronics Cheatsheet',
    category: 'electronics',
    type: 'pdf',
    level: 'beginner',
    duration: '18 pages',
    source: 'ECE Seniors',
    url: 'https://example.com/digital-electronics-cheatsheet.pdf',
    description: 'Logic gates, K-maps, flip-flops, and common ICs in one place.',
    tags: ['ece', 'digital', 'exam'],
  },
  {
    id: 'res-5',
    title: 'AutoCAD Starter Toolkit',
    category: 'civil',
    type: 'tool',
    level: 'beginner',
    duration: 'Setup + 3 tutorials',
    source: 'Autodesk',
    url: 'https://www.autodesk.com/products/autocad',
    description: 'Install AutoCAD and follow three starter tutorials for layout drawings.',
    tags: ['civil', 'cad', 'tools'],
  },
  {
    id: 'res-6',
    title: 'SolidWorks Basics: Parts to Assembly',
    category: 'mechanical',
    type: 'course',
    level: 'beginner',
    duration: '4 hours',
    source: 'Coursera',
    url: 'https://www.coursera.org/learn/solidworks',
    description: 'Create parts, constraints, and assemblies with hands-on exercises.',
    tags: ['mechanical', 'cad', 'design'],
  },
  {
    id: 'res-7',
    title: 'Resume Blueprint for First-Year Students',
    category: 'placement',
    type: 'doc',
    level: 'beginner',
    duration: '15 min read',
    source: 'LPU Career Cell',
    url: 'https://example.com/lpu-resume-blueprint',
    description: 'Clean resume template with do and do not examples.',
    tags: ['resume', 'placement', 'career'],
  },
  {
    id: 'res-8',
    title: 'Communication Skills for Engineers',
    category: 'soft-skills',
    type: 'course',
    level: 'beginner',
    duration: '3 hours',
    source: 'LinkedIn Learning',
    url: 'https://www.linkedin.com/learning/communication-skills-for-engineers',
    description: 'Improve presentations, interviews, and peer collaboration.',
    tags: ['communication', 'soft-skills', 'interview'],
  },
  {
    id: 'res-9',
    title: 'Data Structures in 30 Days',
    category: 'coding',
    type: 'playlist',
    level: 'intermediate',
    duration: '30 videos',
    source: 'YouTube',
    url: 'https://www.youtube.com/watch?v=0bHoB32fuj0&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz',
    description: 'Step-by-step DSA roadmap with practice problems.',
    tags: ['dsa', 'placement', 'coding'],
  },
  {
    id: 'res-10',
    title: 'Linear Algebra Visual Notes',
    category: 'math',
    type: 'pdf',
    level: 'beginner',
    duration: '26 pages',
    source: 'LPU Math Club',
    url: 'https://example.com/linear-algebra-visual-notes.pdf',
    description: 'Vectors, matrices, eigenvalues with diagrams and shortcuts.',
    tags: ['math', 'linear-algebra', 'visual'],
  },
];
