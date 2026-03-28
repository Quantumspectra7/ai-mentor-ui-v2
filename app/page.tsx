'use client';

import { useState, useEffect, useRef } from 'react';
import { signOut, useSession } from 'next-auth/react';
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

type AppState = 'landing' | 'lpu-explorer' | 'onboarding' | 'dashboard' | 'lpu-module';

interface LPUModuleState {
  userType: UserType;
  currentModule: string | null;
}

export default function Page() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [currentDay, setCurrentDay] = useState(1);
  const [lpuState, setLpuState] = useState<LPUModuleState>({ userType: 'fresher', currentModule: null });
  const [userProfile, setUserProfile] = useState({
    name: '',
    branch: '',
    hostel: '',
    interests: [] as string[],
    extracurricular: ''
  });

  const [userEmail, setUserEmail] = useState('');
  const [userAuthId, setUserAuthId] = useState('');
  const { data: session, status } = useSession();
  const hasBootstrappedSession = useRef(false);

  useEffect(() => {
    // Load from localStorage
    const savedDay = localStorage.getItem('mentorDay');
    const savedState = localStorage.getItem('mentorState');
    const savedProfile = localStorage.getItem('mentorProfile');
    const savedLpuState = localStorage.getItem('lpuState');
    const savedEmail = localStorage.getItem('userEmail');
    const savedAuthId = localStorage.getItem('userAuthId');

    if (savedDay) setCurrentDay(parseInt(savedDay));
    if (savedState) setAppState(savedState as AppState);
    if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    if (savedLpuState) setLpuState(JSON.parse(savedLpuState));
    if (savedEmail) setUserEmail(savedEmail);
    if (savedAuthId) setUserAuthId(savedAuthId);
  }, []);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.email || hasBootstrappedSession.current) return;

    const authId = (session.user as { id?: string }).id || '';
    const email = session.user.email;

    if (email) {
      setUserEmail(email);
      localStorage.setItem('userEmail', email);
    }
    if (authId) {
      setUserAuthId(authId);
      localStorage.setItem('userAuthId', authId);
    }

    if (appState === 'landing') {
      hasBootstrappedSession.current = true;
      fetch('/api/auth/get-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authId, email }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          const profile = data?.user?.profile;
          const progress = data?.user?.progress;

          if (profile?.name) {
            setUserProfile(profile);
            localStorage.setItem('mentorProfile', JSON.stringify(profile));

            const savedDay = progress?.currentDay || 1;
            setCurrentDay(savedDay);
            localStorage.setItem('mentorDay', savedDay.toString());
            localStorage.setItem('mentorState', 'dashboard');

            if (progress?.lpuState) {
              setLpuState(progress.lpuState);
              localStorage.setItem('lpuState', JSON.stringify(progress.lpuState));
            }

            if (progress?.tasksByDay) {
              localStorage.setItem('tasksByDay', JSON.stringify(progress.tasksByDay));
              Object.entries(progress.tasksByDay as Record<string, string[]>).forEach(([day, tasks]) => {
                localStorage.setItem(`tasksDay${day}`, JSON.stringify(tasks));
              });
            }

            if (progress?.chatHistory) {
              localStorage.setItem('chatHistory', JSON.stringify(progress.chatHistory));
            }

            setAppState('dashboard');
            return;
          }

          setAppState('onboarding');
        })
        .catch(() => {
          setAppState('onboarding');
        });
    }
  }, [status, session, appState]);

  const handleSelectUserType = (userType: UserType) => {
    const newLpuState = { userType, currentModule: null };
    setLpuState(newLpuState);
    localStorage.setItem('lpuState', JSON.stringify(newLpuState));

    if (userAuthId || userEmail) {
      fetch('/api/auth/update-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authId: userAuthId,
          email: userEmail,
          progress: { lpuState: newLpuState },
        }),
      }).catch((error) => {
        console.error('Failed to persist LPU state:', error);
      });
    }
    
  };

  const handleNavigateToModule = (module: string) => {
    const newLpuState = { ...lpuState, currentModule: module };
    setLpuState(newLpuState);
    localStorage.setItem('lpuState', JSON.stringify(newLpuState));
    setAppState('lpu-module');

    if (userAuthId || userEmail) {
      fetch('/api/auth/update-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authId: userAuthId,
          email: userEmail,
          progress: { lpuState: newLpuState },
        }),
      }).catch((error) => {
        console.error('Failed to persist LPU state:', error);
      });
    }
  };

  const handleBackToExplorer = () => {
    const newLpuState = { ...lpuState, currentModule: null };
    setLpuState(newLpuState);
    localStorage.setItem('lpuState', JSON.stringify(newLpuState));
    setAppState('lpu-explorer');
  };

  const handleStartJourney = (profile: typeof userProfile) => {
    setUserProfile(profile);
    localStorage.setItem('mentorDay', '1');
    localStorage.setItem('mentorState', 'dashboard');
    localStorage.setItem('mentorProfile', JSON.stringify(profile));
    setAppState('dashboard');
    setCurrentDay(1);
  };

  const handleLogout = async () => {
    try {
      if (userAuthId || userEmail) {
        const tasksByDay = localStorage.getItem('tasksByDay');
        const chatHistory = localStorage.getItem('chatHistory');
        await fetch('/api/auth/update-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            authId: userAuthId,
            email: userEmail,
            progress: {
              currentDay,
              mentorState: 'dashboard',
              lpuState,
              tasksByDay: tasksByDay ? JSON.parse(tasksByDay) : undefined,
              chatHistory: chatHistory ? JSON.parse(chatHistory) : undefined,
            },
            profile: userProfile,
          }),
        });
      }
    } catch (error) {
      console.error('Failed to save progress on logout:', error);
    }

    await signOut({ redirect: false });

    setUserEmail('');
    setUserAuthId('');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userAuthId');
    localStorage.removeItem('mentorDay');
    localStorage.removeItem('mentorState');
    localStorage.removeItem('mentorProfile');
    localStorage.removeItem('lpuState');
    setAppState('landing');
    setCurrentDay(1);
    setUserProfile({ name: '', branch: '', hostel: '', interests: [], extracurricular: '' });
  };

  if (appState === 'landing') {
    return (
      <LandingScreen
        mode="landing"
        onStart={handleStartJourney}
        onStartJourney={() => setAppState('onboarding')}
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
    return (
      <LandingScreen
        mode="onboarding"
        onStart={handleStartJourney}
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
      userEmail={userEmail}
      onLogout={handleLogout}
    />
  );
}
