import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { Course, Lesson } from '../types';
import { generateLessonPlan } from '../services/geminiService';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Course) => void;
}

export const AddCourseModal: React.FC<AddCourseModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('');
  const [instructor, setInstructor] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [isGenerating, setIsGenerating] = useState(false);
  const [useAI, setUseAI] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let generatedLessons: Lesson[] = [];

    if (useAI && title) {
      setIsGenerating(true);
      try {
        generatedLessons = await generateLessonPlan(title);
      } catch (err) {
        console.error("AI generation failed", err);
        // Fallback or alert could go here, but we'll just proceed with empty lessons
      } finally {
        setIsGenerating(false);
      }
    }

    const newCourse: Course = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      platform,
      instructor,
      startDate: new Date().toISOString(),
      lessons: generatedLessons,
      color,
      lastAccessed: new Date().toISOString(),
    };

    onSave(newCourse);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setPlatform('');
    setInstructor('');
    setColor('#3b82f6');
    setUseAI(false);
  };

  const colors = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#6366f1', // Indigo
    '#14b8a6', // Teal
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up border border-slate-100 dark:border-slate-700">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Add New Course</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Course Title</label>
            <input 
              required
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mastering Tailwind CSS"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Platform</label>
              <input 
                required
                type="text" 
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="e.g. Udemy"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Instructor (Optional)</label>
              <input 
                type="text" 
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                placeholder="Name"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Theme Color</label>
            <div className="flex gap-2 flex-wrap">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-slate-800 dark:border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-slate-800"
              />
              <div className="flex-1">
                <span className="flex items-center text-sm font-medium text-blue-800 dark:text-blue-200">
                  <Sparkles size={16} className="mr-1.5 text-blue-600 dark:text-blue-400" />
                  Auto-generate lessons with AI
                </span>
                <p className="text-xs text-blue-600/80 dark:text-blue-300/70 mt-0.5">
                  Uses Gemini to create a starter lesson plan.
                </p>
              </div>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isGenerating}
            className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center mt-4"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                Designing Course...
              </>
            ) : (
              'Create Course'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};