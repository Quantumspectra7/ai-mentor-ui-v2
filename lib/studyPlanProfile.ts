export type ConsistencyLevel = 'regular' | 'irregular';
export type ProcrastinationLevel = 'low' | 'medium' | 'high';
export type StressCause = 'academics' | 'time' | 'peer' | 'other';

export interface UpcomingExam {
  title: string;
  date: string;
  topics: string[];
}

export interface StudyPlanProfile {
  name: string;
  branch: string;
  attendance: number;
  averageMarks: number;
  weakSubjects: string[];
  currentSubjects: string[];
  upcomingExams: UpcomingExam[];
  dsaTopic: string;
  studyHoursPerDay: number;
  consistency: ConsistencyLevel;
  procrastinationLevel: ProcrastinationLevel;
  stressLevel: number;
  stressCause: StressCause;
  hoursAvailableToday: number;
}

export const defaultStudyPlanProfile: StudyPlanProfile = {
  name: '',
  branch: '',
  attendance: 75,
  averageMarks: 60,
  weakSubjects: [],
  currentSubjects: [],
  upcomingExams: [],
  dsaTopic: '',
  studyHoursPerDay: 3,
  consistency: 'irregular',
  procrastinationLevel: 'medium',
  stressLevel: 3,
  stressCause: 'academics',
  hoursAvailableToday: 3,
};
