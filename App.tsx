import React, { useEffect, useState } from 'react';
import { Course, ViewState, UserSettings, UserStats, Badge } from './types';
import { loadCourses, saveCourses, seedInitialData, loadSettings, saveSettings, loadUserStats, saveUserStats } from './services/storageService';
import { Dashboard } from './components/Dashboard';
import { CourseCard } from './components/CourseCard';
import { AddCourseModal } from './components/AddCourseModal';
import { CourseDetail } from './components/CourseDetail';
import { Settings } from './components/Settings';
import { ChatBot } from './components/ChatBot';
import { 
  LayoutDashboard, BookOpen, Plus, Search, Settings as SettingsIcon
} from 'lucide-react';

const App: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [settings, setSettings] = useState<UserSettings>(loadSettings());
  const [stats, setStats] = useState<UserStats>(loadUserStats());
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Initial Load
  useEffect(() => {
    let data = loadCourses();
    if (data.length === 0) {
      data = seedInitialData();
    }
    setCourses(data);
  }, []);

  // Save on change
  useEffect(() => {
    saveCourses(courses);
  }, [courses]);

  // Apply Dark Mode
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const handleAddCourse = (course: Course) => {
    setCourses([...courses, course]);
    setCurrentView('courses');
  };

  // Logic to update stats, streak and badges
  const handleUpdateCourse = (updatedCourse: Course) => {
    // Check if a lesson was just completed (naive check: compare completed count)
    const oldCourse = courses.find(c => c.id === updatedCourse.id);
    const oldCompletedCount = oldCourse ? oldCourse.lessons.filter(l => l.isCompleted).length : 0;
    const newCompletedCount = updatedCourse.lessons.filter(l => l.isCompleted).length;
    
    if (newCompletedCount > oldCompletedCount) {
      updateUserStats();
    }

    setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
  };

  const updateUserStats = () => {
    const today = new Date().toDateString();
    const lastActive = new Date(stats.lastActivityDate).toDateString();
    
    let newStreak = stats.streak;
    
    // Streak Logic
    if (today !== lastActive) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActive === yesterday.toDateString()) {
        newStreak += 1;
      } else {
        newStreak = 1; // Reset streak if missed a day
      }
    } else {
       // Already active today, streak doesn't increase but doesn't reset
       if (newStreak === 0) newStreak = 1; 
    }

    const newStats: UserStats = {
      ...stats,
      streak: newStreak,
      lastActivityDate: new Date().toISOString(),
      badges: [...stats.badges]
    };

    // Badge Logic
    const existingBadges = new Set(newStats.badges.map(b => b.id));
    
    // Badge 1: First Step
    if (!existingBadges.has('first-step')) {
      newStats.badges.push({
        id: 'first-step',
        title: 'First Step',
        description: 'Completed your first lesson',
        icon: 'Award',
        dateEarned: new Date().toISOString()
      });
      alert('Badge Earned: First Step! 🏆');
    }

    // Badge 2: On Fire (3 Day Streak)
    if (newStreak >= 3 && !existingBadges.has('on-fire')) {
      newStats.badges.push({
         id: 'on-fire',
         title: 'On Fire',
         description: 'Reached a 3-day study streak',
         icon: 'Flame',
         dateEarned: new Date().toISOString()
      });
      alert('Badge Earned: On Fire! 🔥');
    }
    
    // Badge 3: Scholar (Complete 5 lessons total across all courses)
    // Need to calculate total lessons across ALL courses, but courses state is not yet updated in this closure
    // Approximation for this demo
    
    setStats(newStats);
    saveUserStats(newStats);
  };

  const handleDeleteCourse = (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      setCourses(courses.filter(c => c.id !== id));
      if (activeCourseId === id) {
        setCurrentView('courses');
        setActiveCourseId(null);
      }
    }
  };

  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleImportReload = () => {
    setCourses(loadCourses());
    setSettings(loadSettings());
    setStats(loadUserStats());
    alert("Data reloaded.");
  };

  const navigateToCourse = (id: string) => {
    setActiveCourseId(id);
    setCurrentView('course-detail');
  };

  const activeCourse = courses.find(c => c.id === activeCourseId);

  // Filter courses
  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.platform.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 flex text-slate-800 dark:text-slate-200 font-sans transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 hidden md:flex flex-col fixed h-full z-10 transition-colors duration-200">
        <div className="p-6">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-xl">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <BookOpen size={18} />
             </div>
             <span>Tracker</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all ${currentView === 'dashboard' ? 'bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            <LayoutDashboard size={20} className="mr-3" />
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentView('courses')}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all ${currentView === 'courses' ? 'bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            <BookOpen size={20} className="mr-3" />
            My Courses
          </button>
          <button 
            onClick={() => setCurrentView('settings')}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all ${currentView === 'settings' ? 'bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            <SettingsIcon size={20} className="mr-3" />
            Settings
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
           <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-medium py-3 rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-slate-200 dark:shadow-none"
           >
             <Plus size={18} className="mr-2" />
             New Course
           </button>
        </div>
      </aside>

      {/* Mobile Nav Header */}
      <div className="md:hidden fixed top-0 w-full bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-20 px-4 py-3 flex justify-between items-center transition-colors duration-200">
          <div className="font-bold text-lg flex items-center gap-2 text-slate-800 dark:text-white">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white">
               <BookOpen size={14} />
            </div>
            Tracker
          </div>
          <button onClick={() => setIsModalOpen(true)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-200">
             <Plus size={20} />
          </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 px-4 pt-20 pb-28 md:p-8 md:pt-8 min-h-screen relative">
        
        {/* View Router */}
        {currentView === 'dashboard' && <Dashboard courses={courses} userStats={stats} />}
        
        {currentView === 'courses' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Courses</h1>
                <p className="text-slate-500 dark:text-slate-400">Manage and track your active learning paths.</p>
              </div>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search courses..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full md:w-64"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  onClick={() => navigateToCourse(course.id)} 
                  onDelete={(e) => handleDeleteCourse(course.id)}
                />
              ))}
              {filteredCourses.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  <p>No courses found. Create one to get started!</p>
                  <button onClick={() => setIsModalOpen(true)} className="mt-2 text-blue-600 dark:text-blue-400 font-medium hover:underline">
                    Add your first course
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'course-detail' && activeCourse && (
          <CourseDetail 
            course={activeCourse} 
            onBack={() => setCurrentView('courses')}
            onUpdate={handleUpdateCourse}
          />
        )}

        {currentView === 'settings' && (
          <Settings 
            settings={settings}
            onSave={handleSaveSettings}
            onImport={handleImportReload}
          />
        )}
      </main>

      <ChatBot />

      <AddCourseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddCourse} 
      />
      
      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 w-full bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 z-20 flex justify-around py-3 px-2 safe-area-pb">
         <button 
           onClick={() => setCurrentView('dashboard')}
           className={`flex flex-col items-center p-2 rounded-lg ${currentView === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}
         >
            <LayoutDashboard size={24} />
            <span className="text-[10px] mt-1 font-medium">Home</span>
         </button>
         <button 
           onClick={() => setCurrentView('courses')}
           className={`flex flex-col items-center p-2 rounded-lg ${currentView === 'courses' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}
         >
            <BookOpen size={24} />
            <span className="text-[10px] mt-1 font-medium">Courses</span>
         </button>
         <button 
           onClick={() => setCurrentView('settings')}
           className={`flex flex-col items-center p-2 rounded-lg ${currentView === 'settings' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}
         >
            <SettingsIcon size={24} />
            <span className="text-[10px] mt-1 font-medium">Settings</span>
         </button>
      </div>

    </div>
  );
};

export default App;