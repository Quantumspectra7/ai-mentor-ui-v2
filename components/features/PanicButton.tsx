'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';

const panicResponses = [
  {
    title: "Take a Deep Breath",
    advice: "I get it—things feel overwhelming right now. But here's the truth: This feeling will pass. Take 5 minutes, step away, breathe, and come back.",
    actions: ["Take a 10-minute walk", "Call a friend", "Get some water"]
  },
  {
    title: "You're Not Alone",
    advice: "Everyone feels like this sometimes. Your seniors felt this on their day 1. Your roommate is probably stressed too. Reach out—vulnerability is strength.",
    actions: ["Talk to a friend", "Visit your mentor", "Join a group chat"]
  },
  {
    title: "Focus on What You Can Control",
    advice: "Can't control the exam questions or others' opinions. But you CAN control your effort, attitude, and next action. Start small.",
    actions: ["Pick one task", "Study for 30 mins", "Complete one assignment"]
  },
  {
    title: "Perspective Check",
    advice: "This one moment, this one day, this one exam—it doesn't define your entire college. You have 4 years. You have time to grow.",
    actions: ["Remember your progress", "Reach out for help", "Take a break"]
  },
  {
    title: "The Panic Button Wisdom",
    advice: "The fact that you're stressed means you care. That's actually a good sign. Channel that energy into action, not anxiety.",
    actions: ["Make a plan", "Ask for help", "Rest and recover"]
  }
];

export function PanicButton() {
  const [open, setOpen] = useState(false);
  const [currentResponse, setCurrentResponse] = useState(panicResponses[0]);

  const handleOpen = () => {
    const randomResponse = panicResponses[Math.floor(Math.random() * panicResponses.length)];
    setCurrentResponse(randomResponse);
    setOpen(true);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="px-4 py-2.5 rounded-xl font-bold text-destructive-foreground bg-destructive hover:bg-destructive/90 hover:shadow-lg transition-all flex items-center gap-2 shadow-sm animate-pulse"
      >
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span className="hidden sm:inline">Help!</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-card border-destructive/20 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              I'm Stressed
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2 p-5 bg-background border rounded-2xl shadow-sm">
              <h3 className="text-lg font-bold text-foreground">{currentResponse.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm font-medium">{currentResponse.advice}</p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">What you can do right now:</p>
              <div className="space-y-2">
                {currentResponse.actions.map((action, index) => (
                  <button
                    key={index}
                    className="w-full px-5 py-4 rounded-xl bg-card border hover:border-primary hover:bg-accent hover:shadow-sm text-left text-sm font-bold text-foreground transition-all flex items-center gap-3"
                  >
                    <div className="w-6 h-6 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">
                      {index + 1}
                    </div>
                    {action}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground font-medium text-balance leading-relaxed">
                <strong className="text-primary font-bold">Remember:</strong> You've handled 100% of the difficult days in your life so far. You've got this.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                className="flex-1 px-4 py-3 rounded-xl bg-card border hover:bg-accent text-foreground font-bold transition-colors shadow-sm"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
              <button
                className="flex-1 px-4 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-colors shadow-sm"
                onClick={() => {
                  const newResponse = panicResponses[Math.floor(Math.random() * panicResponses.length)];
                  setCurrentResponse(newResponse);
                }}
              >
                More Advice
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
