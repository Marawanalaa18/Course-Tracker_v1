import React from 'react';
import { Course } from '../types';
import { ProgressBar } from './ProgressBar';
import { BookOpen, Clock, MoreVertical, Trash2 } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onClick, onDelete }) => {
  const totalLessons = course.lessons.length;
  const completedLessons = course.lessons.filter(l => l.isCompleted).length;
  const progress = totalLessons === 0 ? 0 : (completedLessons / totalLessons) * 100;
  
  // Calculate total remaining time
  const remainingMinutes = course.lessons
    .filter(l => !l.isCompleted)
    .reduce((acc, l) => acc + l.durationMinutes, 0);
    
  const hours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;
  const timeString = hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`;

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 cursor-pointer hover:shadow-md transition-shadow group relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: course.color }}></div>
      
      <div className="flex justify-between items-start mb-3 pl-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 block">
            {course.platform}
          </span>
          <h3 className="font-bold text-lg text-slate-800 leading-tight line-clamp-2">
            {course.title}
          </h3>
        </div>
        <button 
          onClick={onDelete}
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
          title="Delete Course"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex items-center space-x-4 mb-4 pl-2 text-sm text-slate-500">
        <div className="flex items-center">
          <BookOpen size={14} className="mr-1.5" />
          <span>{completedLessons}/{totalLessons} lessons</span>
        </div>
        {remainingMinutes > 0 && (
          <div className="flex items-center">
            <Clock size={14} className="mr-1.5" />
            <span>{timeString}</span>
          </div>
        )}
      </div>

      <div className="pl-2">
        <ProgressBar progress={progress} height="h-2" color="bg-blue-600" />
        <div className="mt-2 text-right">
          <span className="text-xs font-medium text-slate-400">{Math.round(progress)}% Complete</span>
        </div>
      </div>
    </div>
  );
};