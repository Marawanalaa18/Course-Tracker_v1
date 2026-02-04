import { Course, UserSettings, UserStats } from '../types';

const STORAGE_KEY = 'course-tracker-data';
const SETTINGS_KEY = 'course-tracker-settings';
const STATS_KEY = 'course-tracker-stats';

export const loadCourses = (): Course[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load courses from storage', error);
  }
  return [];
};

export const saveCourses = (courses: Course[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  } catch (error) {
    console.error('Failed to save courses to storage', error);
  }
};

export const loadSettings = (): UserSettings => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load settings', error);
  }
  return {
    enableDailyReminder: false,
    dailyReminderTime: "09:00",
    enableDeadlineReminders: true,
    darkMode: false
  };
};

export const saveSettings = (settings: UserSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings', error);
  }
};

export const loadUserStats = (): UserStats => {
  try {
    const data = localStorage.getItem(STATS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load stats', error);
  }
  return {
    streak: 0,
    lastActivityDate: new Date().toISOString(),
    totalStudyMinutes: 0,
    badges: []
  };
};

export const saveUserStats = (stats: UserStats): void => {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to save stats', error);
  }
};

// Export all data as JSON string
export const exportData = (): string => {
  const data = {
    courses: loadCourses(),
    settings: loadSettings(),
    stats: loadUserStats(),
    exportedAt: new Date().toISOString()
  };
  return JSON.stringify(data, null, 2);
};

// Import data from JSON string
export const importData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (data.courses) saveCourses(data.courses);
    if (data.settings) saveSettings(data.settings);
    if (data.stats) saveUserStats(data.stats);
    return true;
  } catch (e) {
    console.error("Import failed", e);
    return false;
  }
};

// Helper to seed initial data if empty
export const seedInitialData = (): Course[] => {
  const initial: Course[] = [
    {
      id: '1',
      title: 'Advanced React Patterns',
      platform: 'Frontend Masters',
      instructor: 'Kent C. Dodds',
      startDate: new Date().toISOString(),
      lessons: [
        { id: 'l1', title: 'Context API', description: 'Deep dive into Context', isCompleted: true, durationMinutes: 45, resources: [] },
        { id: 'l2', title: 'Compound Components', description: 'Building flexible components', isCompleted: false, durationMinutes: 60, resources: [] },
      ],
      color: '#3b82f6',
    }
  ];
  saveCourses(initial);
  return initial;
};