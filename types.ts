export interface Resource {
  id: string;
  title: string;
  type: 'video' | 'link' | 'file' | 'slide';
  url?: string;
}

export interface StudyGuideContent {
  summary: string;
  keyPoints: string[];
  exercise: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  deadline?: string; // ISO Date string
  durationMinutes: number;
  resources: Resource[];
  aiStudyGuide?: StudyGuideContent;
}

export interface Course {
  id: string;
  title: string;
  platform: string;
  instructor?: string;
  startDate: string; // ISO Date string
  endDate?: string; // ISO Date string
  lessons: Lesson[];
  color: string; // Hex color for UI
  lastAccessed?: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  dateEarned: string;
}

export interface UserStats {
  streak: number;
  lastActivityDate: string; // ISO Date string
  totalStudyMinutes: number;
  badges: Badge[];
}

export interface DashboardStats {
  totalCourses: number;
  completedCourses: number;
  totalLessons: number;
  completedLessons: number;
  completionRate: number;
  upcomingDeadlines: { courseName: string; lessonTitle: string; deadline: string }[];
}

export interface UserSettings {
  enableDailyReminder: boolean;
  dailyReminderTime: string; // "HH:MM" 24h format
  enableDeadlineReminders: boolean;
  darkMode: boolean;
}

export type ViewState = 'dashboard' | 'courses' | 'course-detail' | 'settings';

export interface AppState {
  courses: Course[];
  activeCourseId: string | null;
  currentView: ViewState;
  darkMode: boolean;
}