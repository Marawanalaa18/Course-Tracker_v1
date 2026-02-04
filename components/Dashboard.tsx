import React from 'react';
import { Course, UserStats } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Book, CheckCircle, Clock, Zap, Flame, Award } from 'lucide-react';

interface DashboardProps {
  courses: Course[];
  userStats: UserStats;
}

export const Dashboard: React.FC<DashboardProps> = ({ courses, userStats }) => {
  // Compute Stats
  const totalCourses = courses.length;
  const completedCourses = courses.filter(c => c.lessons.length > 0 && c.lessons.every(l => l.isCompleted)).length;
  
  const allLessons = courses.flatMap(c => c.lessons);
  const totalLessons = allLessons.length;
  const completedLessons = allLessons.filter(l => l.isCompleted).length;
  
  const inProgressCourses = courses.filter(c => {
    const completed = c.lessons.filter(l => l.isCompleted).length;
    return completed > 0 && completed < c.lessons.length;
  }).length;

  const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const pieData = [
    { name: 'Completed', value: completedLessons },
    { name: 'Remaining', value: totalLessons - completedLessons },
  ];
  
  const COLORS = ['#10b981', '#e2e8f0'];

  const stats = [
    { label: 'Current Streak', value: `${userStats.streak} Days`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
    { label: 'Lessons Done', value: completedLessons, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-500/10' },
    { label: 'Completion Rate', value: `${completionRate}%`, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { label: 'Active Courses', value: inProgressCourses, icon: Book, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome back! Here is your learning progress.</p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-start hover:shadow-md transition-shadow">
            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} mb-3`}>
              <stat.icon size={20} />
            </div>
            <span className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{stat.value}</span>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progress Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 md:col-span-2">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4">Overall Progress</h3>
          <div className="flex flex-col md:flex-row items-center justify-around h-64">
            <div className="w-full md:w-1/2 h-full">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4 px-4">
               <div>
                  <div className="flex justify-between text-sm mb-1">
                     <span className="text-slate-600 dark:text-slate-400">Completed Lessons</span>
                     <span className="font-bold text-slate-800 dark:text-white">{completedLessons}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                     <div className="h-full bg-green-500 rounded-full" style={{ width: `${completionRate}%`}}></div>
                  </div>
               </div>
               <div>
                  <div className="flex justify-between text-sm mb-1">
                     <span className="text-slate-600 dark:text-slate-400">Remaining</span>
                     <span className="font-bold text-slate-800 dark:text-white">{totalLessons - completedLessons}</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Badges & Activity */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-[50%]">
             <h3 className="font-bold text-slate-800 dark:text-white mb-4">Course Breakdown</h3>
             <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {courses.slice(0, 5).map(course => {
                   const cTotal = course.lessons.length;
                   const cDone = course.lessons.filter(l => l.isCompleted).length;
                   const cProg = cTotal === 0 ? 0 : (cDone / cTotal) * 100;
                   return (
                      <div key={course.id} className="flex items-center space-x-3">
                         <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: course.color }}></div>
                         <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{course.title}</p>
                            <p className="text-xs text-slate-400">{cDone}/{cTotal} lessons</p>
                         </div>
                         <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{Math.round(cProg)}%</span>
                      </div>
                   );
                })}
                {courses.length === 0 && <p className="text-sm text-slate-400">No courses yet.</p>}
             </div>
          </div>

          {/* Badges Section */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-[45%]">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center">
              <Award size={18} className="mr-2 text-yellow-500" />
              Badges ({userStats.badges.length})
            </h3>
            {userStats.badges.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                 <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-full mb-2">
                   <Award size={24} className="text-slate-300 dark:text-slate-500" />
                 </div>
                 <p className="text-xs text-slate-400 dark:text-slate-500">Complete lessons to earn badges!</p>
               </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {userStats.badges.map(badge => (
                  <div key={badge.id} className="group relative flex flex-col items-center">
                    <div className="w-10 h-10 bg-yellow-50 dark:bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-600 dark:text-yellow-500 mb-1 border border-yellow-100 dark:border-yellow-500/20">
                      <Award size={18} />
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 w-max max-w-[150px] bg-slate-900 text-white text-[10px] p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <p className="font-bold">{badge.title}</p>
                      <p className="text-slate-300">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};