'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, CheckCircle2, Phone, Clock, Wifi, BookOpen, GraduationCap, ShieldAlert, CalendarCheck, MapPin } from 'lucide-react';

interface CampusGuideProps {
  onBack: () => void;
}

type Tab = 'portals' | 'checklist' | 'contacts' | 'hostel';

const portals = [
  {
    name: 'LPU ERP (UMS)',
    desc: 'Attendance, grades, timetable, fee payment',
    url: 'https://ums.lpu.in',
    icon: '🖥️',
    tag: 'Primary Portal',
    tagColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  {
    name: 'LPU Live',
    desc: 'Online classes, recorded lectures, study material',
    url: 'https://lpulive.lpu.in/',
    icon: '📡',
    tag: 'Learning',
    tagColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  {
    name: 'LPUNEST / Admission Portal',
    desc: 'Scholarship status, admission documents, merit check',
    url: 'https://admission.lpu.in',
    icon: '🎓',
    tag: 'Admissions',
    tagColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  {
    name: 'LPU Email (Office 365)',
    desc: 'Official student email — check for circulars and exam notices',
    url: 'https://outlook.office.com',
    icon: '📧',
    tag: 'Communication',
    tagColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  },
  {
    name: 'Wi-Fi Login (Captive Portal)',
    desc: 'Connect to campus Wi-Fi — use student ID + ERP password',
    url: 'https://internet.lpu.in/24online/webpages/client.jsp',
    icon: '📶',
    tag: 'Network',
    tagColor: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  },
  {
    name: 'LPU One App',
    desc: 'Mobile app for attendance, mess menu, transport, events',
    url: 'https://play.google.com/store/apps/details?id=ums.lovely.university&hl=en_IN',
    icon: '📱',
    tag: 'App',
    tagColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  },
];

const contacts = [
  { name: 'Main Reception / Info Desk', number: '0181-304-3434', note: '24/7 general queries', icon: '📞' },
  { name: 'Medical Center (Campus)', number: '0181-304-3000 Ext. 3000', note: 'Doctor available 9AM–5PM weekdays', icon: '🏥' },
  { name: 'Security Control Room', number: '0181-304-0000', note: 'Nights + emergencies', icon: '🚨' },
  { name: 'Exam Cell', number: '0181-304-3090', note: 'Datesheet, hall tickets, grievances', icon: '📝' },
  { name: 'IT Help Desk', number: 'Ext. 3100 / Admin Block 101', note: 'ERP, Wi-Fi, email issues', icon: '🖥️' },
  { name: 'Hostel Warden Office', number: 'Contact hostel block reception', note: 'Room issues, gate passes, curfew', icon: '🏠' },
  { name: 'Career Services', number: 'LPU Career Center — Block 40', note: 'Placement registration, internships', icon: '🚀' },
  { name: 'Library Helpdesk', number: 'Central Library, Block 33', note: 'Book issue, e-library access, printing', icon: '📚' },
];

const firstWeekChecklist = [
  { id: 'id-card', label: 'Collect ID card from Admin Block', priority: 'urgent', day: 1 },
  { id: 'erp-login', label: 'Log in to ERP (UMS) and verify your details', priority: 'urgent', day: 1 },
  { id: 'email-setup', label: 'Set up your official @lpu.in email account', priority: 'urgent', day: 1 },
  { id: 'wifi-connect', label: 'Connect to campus Wi-Fi (use ERP password)', priority: 'urgent', day: 1 },
  { id: 'timetable', label: 'Download your class timetable from ERP', priority: 'high', day: 2 },
  { id: 'hostel-warden', label: 'Meet your hostel warden and note their contact', priority: 'high', day: 1 },
  { id: 'attendance-check', label: 'Check your ERP attendance is registering correctly', priority: 'high', day: 3 },
  { id: 'fees-confirm', label: 'Verify fee payment and scholarship status', priority: 'high', day: 2 },
  { id: 'lpu-app', label: 'Install the LPU One App on your phone', priority: 'medium', day: 2 },
  { id: 'library-card', label: 'Register for a library card', priority: 'medium', day: 3 },
  { id: 'club-explore', label: 'Shortlist 2-3 clubs you want to join', priority: 'medium', day: 4 },
  { id: 'mess-register', label: 'Check mess plan and meal timings', priority: 'medium', day: 2 },
  { id: 'bank-account', label: 'Open a local bank account (UCO Bank on campus)', priority: 'medium', day: 5 },
  { id: 'emergency-contacts', label: 'Save security + warden numbers on your phone', priority: 'high', day: 1 },
  { id: 'academic-advisor', label: 'Identify your academic advisor / faculty mentor', priority: 'medium', day: 5 },
];

const hostelFacts = [
  { icon: '🍽️', title: 'Mess Timings', lines: ['Breakfast: 7:00 – 8:30 AM', 'Lunch: 12:00 – 2:00 PM', 'Evening snacks: 5:00 – 6:00 PM', 'Dinner: 7:00 – 9:00 PM'] },
  { icon: '🕐', title: 'Hostel Gate Times', lines: ['Regular curfew: 10:00 PM', 'Gate pass required after curfew', 'Weekend return: 8:00 PM Sunday', 'Late entry: Submit next-day request to warden'] },
  { icon: '🧺', title: 'Laundry', lines: ['Coin laundry machines in block basement', 'Dhobi service outside Block H (Mon, Thu)', 'Price: ₹10–15 per kg', 'Keep a laundry bag handy from Day 1'] },
  { icon: '🔌', title: 'Power & Devices', lines: ['Power cuts: rare, generators kick in within 5 min', 'Extension boards: allowed for laptops and phones', 'High-wattage appliances (kettle, iron) restricted', 'Report room issues to warden within 48 hrs'] },
  { icon: '🏠', title: 'Room Essentials', lines: ['Bring padlock for almirah (not always provided)', 'Mattress provided, bring bedsheet + pillow', 'Window curtains: bring your own', 'Cleaning supplies: keep a mop and disinfectant'] },
  { icon: '🚨', title: 'Safety SOS', lines: ['Security: 0181-304-0000 (24/7)', 'Medical emergency: Medical Center ext 3000', 'Fire alarm drill: held in Week 1', 'Night warden contact: Available at block reception'] },
];

export function CampusGuide({ onBack }: CampusGuideProps) {
  const [activeTab, setActiveTab] = useState<Tab>('portals');
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('firstWeekChecklist');
    if (saved) setCheckedItems(JSON.parse(saved));
  }, []);

  const toggleCheck = (id: string) => {
    const updated = checkedItems.includes(id)
      ? checkedItems.filter(i => i !== id)
      : [...checkedItems, id];
    setCheckedItems(updated);
    localStorage.setItem('firstWeekChecklist', JSON.stringify(updated));
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'portals', label: 'Portals', icon: <Wifi className="w-4 h-4" /> },
    { id: 'checklist', label: 'First-Week List', icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 'contacts', label: 'Key Contacts', icon: <Phone className="w-4 h-4" /> },
    { id: 'hostel', label: 'Hostel Guide', icon: <BookOpen className="w-4 h-4" /> },
  ];

  const urgentCount = firstWeekChecklist.filter(i => i.priority === 'urgent' && !checkedItems.includes(i.id)).length;
  const doneCount = checkedItems.length;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-card border rounded-xl hover:bg-accent transition-all shadow-sm shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary shrink-0" />
              LPU Quick Reference
            </h1>
            <p className="text-xs text-muted-foreground font-medium">Portals · Contacts · Checklist · Hostel Guide</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-6 pb-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border hover:border-primary/40 text-muted-foreground hover:text-foreground'
                  }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === 'checklist' && urgentCount > 0 && (
                  <span className="ml-1 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1">
                    {urgentCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8">

        {/* PORTALS */}
        {activeTab === 'portals' && (
          <div>
            <p className="text-sm text-muted-foreground mb-6">All the key portals you'll use every week at LPU. Bookmark them — you'll need them constantly.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portals.map((p, i) => (
                <a
                  key={i}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-5 bg-card border rounded-2xl hover:border-primary/50 hover:shadow-md transition-all group"
                >
                  <div className="text-3xl shrink-0">{p.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">{p.name}</h3>
                      <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 leading-snug">{p.desc}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-md border text-[11px] font-semibold uppercase tracking-wide ${p.tagColor}`}>{p.tag}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* CHECKLIST */}
        {activeTab === 'checklist' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Complete these during your first week. These are not optional.</p>
              </div>
              <div className="bg-card border px-4 py-2 rounded-xl text-center shadow-sm shrink-0">
                <p className="text-xl font-bold text-primary">{doneCount}/{firstWeekChecklist.length}</p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">Done</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-6 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(doneCount / firstWeekChecklist.length) * 100}%` }}
              />
            </div>

            <div className="space-y-2">
              {firstWeekChecklist.map(item => {
                const done = checkedItems.includes(item.id);
                const priorityConfig = {
                  urgent: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
                  high: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
                  medium: 'bg-muted text-muted-foreground border-border',
                }[item.priority];
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${done ? 'border-primary/20 bg-primary/5' : 'bg-card border-border hover:border-primary/30 hover:shadow-sm'
                      }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${done ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30 hover:border-primary/60'
                      }`}>
                      {done && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm transition-colors ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">Day {item.day}</p>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wide ${priorityConfig}`}>
                      {item.priority}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CONTACTS */}
        {activeTab === 'contacts' && (
          <div>
            <p className="text-sm text-muted-foreground mb-6">Save these now. You'll need them at the worst moments — don't search when it's urgent.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contacts.map((c, i) => (
                <div key={i} className="flex items-start gap-4 p-5 bg-card border rounded-2xl hover:border-primary/30 hover:shadow-sm transition-all">
                  <div className="text-2xl shrink-0">{c.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-sm mb-1">{c.name}</h3>
                    <p className="text-sm font-mono text-primary font-semibold mb-1">{c.number}</p>
                    <p className="text-xs text-muted-foreground">{c.note}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-5 bg-card border border-amber-500/30 rounded-2xl flex items-start gap-4">
              <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground text-sm mb-1">Save security contact NOW</p>
                <p className="text-sm text-muted-foreground">Many students underestimate how early they'll need security, medical, or IT support. Add these to your contacts today before you need them.</p>
              </div>
            </div>
          </div>
        )}

        {/* HOSTEL */}
        {activeTab === 'hostel' && (
          <div>
            <p className="text-sm text-muted-foreground mb-6">Everything you need to know to survive and thrive in the hostel. Real info, no fluff.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {hostelFacts.map((f, i) => (
                <div key={i} className="bg-card border rounded-2xl p-5 hover:border-primary/30 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{f.icon}</span>
                    <h3 className="font-bold text-foreground">{f.title}</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {f.lines.map((line, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-0.5 shrink-0">·</span>
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-8 p-5 bg-card border border-primary/20 rounded-2xl flex items-start gap-4">
              <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-foreground mb-1">Pro tip: Gate passes</p>
                <p className="text-sm text-muted-foreground">If you need to leave campus after curfew, apply for a gate pass via UMS ERP at least 24 hours in advance. Night security won't let you out without one, even for emergencies unless you call the duty warden.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
