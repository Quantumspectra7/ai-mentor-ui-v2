import { create } from 'zustand';
import { StudyPlanProfile, defaultStudyPlanProfile } from './studyPlanProfile';

interface AppState {
  profile: StudyPlanProfile;
  setProfile: (profile: StudyPlanProfile) => void;
  currentDay: number;
  setCurrentDay: (day: number) => void;
  isChatOpen: boolean;
  setChatOpen: (isOpen: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  profile: defaultStudyPlanProfile,
  setProfile: (profile) => set({ profile }),
  currentDay: 1,
  setCurrentDay: (day) => set({ currentDay: day }),
  isChatOpen: false,
  setChatOpen: (isOpen) => set({ isChatOpen: isOpen }),
}));
