'use client';

import { useState, useEffect } from 'react';
import { LandingScreen } from '@/components/screens/LandingScreen';
import { DashboardScreen } from '@/components/screens/DashboardScreen';
import { LPUExplorer } from '@/components/screens/LPUExplorer';
import { VideoHub } from '@/components/features/VideoHub';
import { SuccessStories } from '@/components/features/SuccessStories';
import { SeniorComments } from '@/components/features/SeniorComments';
import { BranchExplorer } from '@/components/features/BranchExplorer';
import { ExpectationVsReality } from '@/components/features/ExpectationVsReality';
import { Procedures } from '@/components/features/Procedures';
import { StudyResources } from '@/components/features/StudyResources';
import { UserType } from '@/lib/lpuData';
import { defaultStudyPlanProfile, StudyPlanProfile } from '@/lib/studyPlanProfile';

type AppState = 'landing' | 'lpu-explorer' | 'onboarding' | 'dashboard' | 'lpu-module';

interface LPUModuleState {
  userType: UserType;
  currentModule: string | null;
}

export default function Page() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [currentDay, setCurrentDay] = useState(1);
  const [lpuState, setLpuState] = useState<LPUModuleState>({ userType: 'fresher', currentModule: null });
  const [userProfile, setUserProfile] = useState<StudyPlanProfile>(defaultStudyPlanProfile);

  useEffect(() => {
    // Load from localStorage
    const savedState = localStorage.getItem('mentorState');
    const savedProfile = localStorage.getItem('mentorProfile');
    const savedLpuState = localStorage.getItem('lpuState');

    let startDateRaw = localStorage.getItem('mentorStartDate');
    if (savedState === 'dashboard' && !startDateRaw) {
      const savedDay = localStorage.getItem('mentorDay');
      const offsetDays = savedDay ? parseInt(savedDay) - 1 : 0;
      const start = new Date();
      start.setDate(start.getDate() - offsetDays);
      startDateRaw = start.toISOString();
      localStorage.setItem('mentorStartDate', startDateRaw);
    }

    if (startDateRaw) {
      const start = new Date(startDateRaw);
      const now = new Date();
      const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diffTime = today.getTime() - startDay.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
      
      let calculatedDay = diffDays + 1;
      if (calculatedDay > 90) calculatedDay = 90;
      if (calculatedDay < 1) calculatedDay = 1;
      setCurrentDay(calculatedDay);
    }

    if (savedState && savedState !== 'login') setAppState(savedState as AppState);
    if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    if (savedLpuState) setLpuState(JSON.parse(savedLpuState));
  }, []);

  const handleStartJourney = () => {
    setAppState('onboarding');
  };

  const handleExploreLPU = () => {
    // User clicked "Explore LPU Ecosystem" - go to LPU explorer
    setAppState('lpu-explorer');
  };

  const handleSelectUserType = (userType: UserType) => {
    const newLpuState = { userType, currentModule: null };
    setLpuState(newLpuState);
    localStorage.setItem('lpuState', JSON.stringify(newLpuState));
  };

  const handleNavigateToModule = (module: string) => {
    const newLpuState = { ...lpuState, currentModule: module };
    setLpuState(newLpuState);
    localStorage.setItem('lpuState', JSON.stringify(newLpuState));
    setAppState('lpu-module');
  };

  const handleBackToExplorer = () => {
    const newLpuState = { ...lpuState, currentModule: null };
    setLpuState(newLpuState);
    localStorage.setItem('lpuState', JSON.stringify(newLpuState));
    setAppState('lpu-explorer');
  };

  if (appState === 'landing') {
    return (
      <LandingScreen
        mode="landing"
        onStart={handleStartJourney}
        onStartJourney={handleStartJourney}
        onExportLPU={handleExploreLPU}
      />
    );
  }

  if (appState === 'lpu-explorer') {
    return <LPUExplorer onSelectUserType={handleSelectUserType} onNavigateToModule={handleNavigateToModule} />;
  }

  if (appState === 'lpu-module') {
    const { userType, currentModule } = lpuState;

    if (!currentModule) {
      return <LPUExplorer onSelectUserType={handleSelectUserType} onNavigateToModule={handleNavigateToModule} />;
    }

    // Render the selected module
    switch (currentModule) {
      case 'videos':
        return <VideoHub userType={userType} onBack={handleBackToExplorer} />;
      case 'stories':
        return <SuccessStories onBack={handleBackToExplorer} />;
      case 'procedures':
        return <Procedures onBack={handleBackToExplorer} />;
      case 'senior-advice':
        return <SeniorComments onBack={handleBackToExplorer} />;
      case 'reality-check':
        return <ExpectationVsReality onBack={handleBackToExplorer} />;
      case 'branch-explorer':
        return <BranchExplorer onBack={handleBackToExplorer} />;
      case 'resources':
        return <StudyResources onBack={handleBackToExplorer} />;
      default:
        return <LPUExplorer onSelectUserType={handleSelectUserType} onNavigateToModule={handleNavigateToModule} />;
    }
  }

  if (appState === 'onboarding') {
    const handleOnboardingComplete = (profile: StudyPlanProfile) => {
      setUserProfile(profile);
      localStorage.setItem('mentorProfile', JSON.stringify(profile));
      localStorage.setItem('mentorState', 'dashboard');
      
      const startDate = new Date();
      localStorage.setItem('mentorStartDate', startDate.toISOString());

      setAppState('dashboard');
      setCurrentDay(1);
    };

    return (
      <LandingScreen
        mode="onboarding"
        onStart={handleOnboardingComplete}
        onBackFromOnboarding={() => setAppState('landing')}
      />
    );
  }

  // Dashboard (90-day mentor)
  return (
    <DashboardScreen 
      currentDay={currentDay} 
      setCurrentDay={setCurrentDay}
      userProfile={userProfile}
      onEditProfile={() => setAppState('onboarding')}
    />
  );
}
