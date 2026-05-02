'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X } from 'lucide-react';
import { MentorChat } from './MentorChat';
import { StudyPlanProfile } from '@/lib/studyPlanProfile';

interface FloatingChatProps {
  currentDay: number;
  userProfile: StudyPlanProfile;
}

export function FloatingChat({ currentDay, userProfile }: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-4 rounded-full shadow-xl transition-transform hover:scale-110 flex items-center justify-center ${
            isOpen ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'
          }`}
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 w-[400px] h-[600px] max-h-[80vh] max-w-[calc(100vw-3rem)] z-50 bg-card border shadow-2xl rounded-3xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b bg-accent/50">
              <h3 className="font-display font-bold text-lg">AI Mentor</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden relative">
              <MentorChat currentDay={currentDay} isFloating />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
