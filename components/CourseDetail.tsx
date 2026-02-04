import React, { useState, useEffect } from 'react';
import { Course, Lesson, Resource, StudyGuideContent } from '../types';
import { ProgressBar } from './ProgressBar';
import { getStudyGuide } from '../services/geminiService';
import { 
  ArrowLeft, CheckCircle, Circle, Clock, Plus, Trash2, 
  ExternalLink, Video, FileText, ChevronDown, ChevronUp,
  Calendar, AlertCircle, Sparkles, Lightbulb, List, Dumbbell, Loader2,
  Presentation, Link as LinkIcon, File, Maximize2, Minimize2
} from 'lucide-react';

interface CourseDetailProps {
  course: Course;
  onBack: () => void;
  onUpdate: (updatedCourse: Course) => void;
}

export const CourseDetail: React.FC<CourseDetailProps> = ({ course, onBack, onUpdate }) => {
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDeadline, setNewLessonDeadline] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState<number>(30);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  // Resource Form State
  const [addingResourceToLessonId, setAddingResourceToLessonId] = useState<string | null>(null);
  const [resTitle, setResTitle] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resType, setResType] = useState<Resource['type']>('link');

  // State to track which lesson is currently generating AI content
  const [generatingLessonId, setGeneratingLessonId] = useState<string | null>(null);

  const totalLessons = course.lessons.length;
  const completedLessons = course.lessons.filter(l => l.isCompleted).length;
  const progress = totalLessons === 0 ? 0 : (completedLessons / totalLessons) * 100;

  // Handle ESC key to exit focus mode
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsFocusMode(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const toggleLesson = (lessonId: string) => {
    const updatedLessons = course.lessons.map(l => 
      l.id === lessonId ? { ...l, isCompleted: !l.isCompleted } : l
    );
    onUpdate({ ...course, lessons: updatedLessons });
  };

  const deleteLesson = (lessonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this lesson?')) {
      const updatedLessons = course.lessons.filter(l => l.id !== lessonId);
      onUpdate({ ...course, lessons: updatedLessons });
    }
  };

  const addLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;

    const newLesson: Lesson = {
      id: Math.random().toString(36).substr(2, 9),
      title: newLessonTitle,
      description: '',
      isCompleted: false,
      durationMinutes: newLessonDuration || 30, 
      deadline: newLessonDeadline || undefined,
      resources: []
    };

    onUpdate({ ...course, lessons: [...course.lessons, newLesson] });
    setNewLessonTitle('');
    setNewLessonDeadline('');
    setNewLessonDuration(30);
    setIsAddingLesson(false);
  };

  const initiateAddResource = (lessonId: string) => {
    setAddingResourceToLessonId(lessonId);
    setResTitle('');
    setResUrl('');
    setResType('link');
  };

  const saveResource = () => {
    if (!resTitle || !addingResourceToLessonId) return;

    const updatedLessons = course.lessons.map(l => {
      if (l.id === addingResourceToLessonId) {
        const newResource: Resource = {
          id: Math.random().toString(36).substr(2, 9),
          title: resTitle,
          type: resType,
          url: resUrl
        };
        return { ...l, resources: [...l.resources, newResource] };
      }
      return l;
    });
    onUpdate({ ...course, lessons: updatedLessons });
    setAddingResourceToLessonId(null);
  };

  const cancelAddResource = () => {
    setAddingResourceToLessonId(null);
  };

  const deleteResource = (lessonId: string, resourceId: string) => {
    if(!confirm("Remove this resource?")) return;
    const updatedLessons = course.lessons.map(l => {
      if (l.id === lessonId) {
        return { ...l, resources: l.resources.filter(r => r.id !== resourceId) };
      }
      return l;
    });
    onUpdate({ ...course, lessons: updatedLessons });
  };

  const handleGenerateStudyGuide = async (lesson: Lesson) => {
    setGeneratingLessonId(lesson.id);
    try {
      const guide = await getStudyGuide(course.title, lesson.title);
      if (guide) {
        const updatedLessons = course.lessons.map(l => 
          l.id === lesson.id ? { ...l, aiStudyGuide: guide } : l
        );
        onUpdate({ ...course, lessons: updatedLessons });
      }
    } catch (e) {
      alert("Failed to generate study guide. Please try again.");
    } finally {
      setGeneratingLessonId(null);
    }
  };

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const formatDeadline = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'video': return <Video size={18} />;
      case 'file': return <FileText size={18} />;
      case 'slide': return <Presentation size={18} />;
      case 'link': 
      default: return <LinkIcon size={18} />;
    }
  };

  // Focus Mode Overlay
  if (isFocusMode && expandedLessonId) {
    const lesson = course.lessons.find(l => l.id === expandedLessonId);
    if (lesson) {
      return (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 overflow-y-auto animate-fade-in flex flex-col">
          <div className="container max-w-4xl mx-auto px-6 py-8 flex-1">
            <div className="flex justify-between items-center mb-10">
              <button 
                onClick={() => setIsFocusMode(false)}
                className="flex items-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                <Minimize2 size={20} className="mr-2" />
                Exit Focus Mode
              </button>
              <div className="flex items-center space-x-4">
                 <span className="text-sm font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">{course.title}</span>
              </div>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="flex items-start justify-between mb-8">
                 <h1 className="text-4xl font-bold text-slate-900 dark:text-white leading-tight">{lesson.title}</h1>
                 <button 
                    onClick={() => toggleLesson(lesson.id)}
                    className={`flex-shrink-0 transition-all p-2 rounded-full ${lesson.isCompleted ? 'text-green-500 bg-green-50 dark:bg-green-900/20' : 'text-slate-300 dark:text-slate-600 hover:text-blue-500'}`}
                  >
                    {lesson.isCompleted ? <CheckCircle size={40} className="fill-current" /> : <Circle size={40} />}
                  </button>
              </div>

              {lesson.description && (
                 <div className="prose prose-slate dark:prose-invert max-w-none mb-10">
                   <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">{lesson.description}</p>
                 </div>
              )}

              {/* AI Study Guide in Focus Mode */}
              {lesson.aiStudyGuide && (
                  <div className="mb-10 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-2xl p-8">
                     <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 flex items-center mb-4">
                        <Sparkles size={20} className="mr-2" /> Study Guide
                     </h3>
                     <p className="text-blue-900 dark:text-slate-300 mb-6 text-lg">{lesson.aiStudyGuide.summary}</p>
                     
                     <div className="grid md:grid-cols-2 gap-8">
                        <div>
                           <h4 className="font-bold text-slate-700 dark:text-slate-400 uppercase text-xs tracking-wider mb-3">Key Points</h4>
                           <ul className="space-y-3">
                              {lesson.aiStudyGuide.keyPoints.map((p, i) => (
                                <li key={i} className="flex items-start text-slate-800 dark:text-slate-200">
                                   <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                   {p}
                                </li>
                              ))}
                           </ul>
                        </div>
                        <div>
                           <h4 className="font-bold text-slate-700 dark:text-slate-400 uppercase text-xs tracking-wider mb-3">Challenge</h4>
                           <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-blue-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 italic">
                              "{lesson.aiStudyGuide.exercise}"
                           </div>
                        </div>
                     </div>
                  </div>
              )}

              {/* Resources in Focus Mode */}
              {lesson.resources.length > 0 && (
                <div>
                   <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Resources</h3>
                   <div className="grid md:grid-cols-2 gap-4">
                      {lesson.resources.map(res => (
                        <a 
                          key={res.id} 
                          href={res.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:shadow-md transition-all group"
                        >
                          <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg mr-4 text-slate-500 dark:text-slate-300 group-hover:text-blue-500">
                             {getResourceIcon(res.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-slate-800 dark:text-white group-hover:text-blue-600 block truncate text-lg">{res.title}</span>
                            <span className="text-sm text-slate-400 block truncate">{res.url}</span>
                          </div>
                          <ExternalLink size={18} className="opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" />
                        </a>
                      ))}
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={onBack}
          className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors mb-4 group"
        >
          <ArrowLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Courses
        </button>
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: course.color }}></div>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wide">
                {course.platform}
              </span>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{course.title}</h1>
              {course.instructor && (
                <p className="text-slate-500 dark:text-slate-400">Instructor: {course.instructor}</p>
              )}
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 min-w-[200px]">
               <div className="flex justify-between items-end mb-2">
                 <span className="text-4xl font-bold text-slate-800 dark:text-white">{Math.round(progress)}%</span>
                 <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">{completedLessons}/{totalLessons} Done</span>
               </div>
               <ProgressBar progress={progress} color="bg-green-500" height="h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Lessons</h2>
          <button 
            onClick={() => setIsAddingLesson(true)}
            className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={16} className="mr-1" />
            Add Lesson
          </button>
        </div>

        {isAddingLesson && (
          <form onSubmit={addLesson} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 animate-fade-in">
            <div className="mb-3">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Title</label>
              <input 
                autoFocus
                required
                type="text" 
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                placeholder="Lesson title..."
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Due Date (Optional)</label>
                <input 
                  type="datetime-local" 
                  value={newLessonDeadline}
                  onChange={(e) => setNewLessonDeadline(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Est. Duration (minutes)</label>
                <input 
                  type="number" 
                  min="1"
                  value={newLessonDuration}
                  onChange={(e) => setNewLessonDuration(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button 
                type="button" 
                onClick={() => setIsAddingLesson(false)}
                className="px-3 py-1.5 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Save Lesson
              </button>
            </div>
          </form>
        )}

        {course.lessons.length === 0 && !isAddingLesson && (
           <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
             <p className="text-slate-500 dark:text-slate-400">No lessons yet. Add one to get started!</p>
           </div>
        )}

        {course.lessons.map((lesson) => {
          const overdue = !lesson.isCompleted && isOverdue(lesson.deadline);
          
          return (
            <div 
              key={lesson.id} 
              className={`bg-white dark:bg-slate-800 rounded-xl border transition-all duration-200 ${lesson.isCompleted ? 'border-slate-100 dark:border-slate-700 opacity-75' : 'border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md'}`}
            >
              <div className="p-4 flex items-center gap-4">
                <button 
                  onClick={() => toggleLesson(lesson.id)}
                  className={`flex-shrink-0 transition-colors ${lesson.isCompleted ? 'text-green-500' : 'text-slate-300 dark:text-slate-600 hover:text-blue-500'}`}
                >
                  {lesson.isCompleted ? <CheckCircle size={24} className="fill-current" /> : <Circle size={24} />}
                </button>
                
                <div className="flex-1 cursor-pointer" onClick={() => setExpandedLessonId(expandedLessonId === lesson.id ? null : lesson.id)}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-4">
                    <h3 className={`font-medium text-lg ${lesson.isCompleted ? 'text-slate-500 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                      {lesson.title}
                    </h3>
                    
                    {lesson.deadline && !lesson.isCompleted && (
                      <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-md w-fit ${overdue ? 'bg-red-50 text-red-600' : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300'}`}>
                        {overdue ? <AlertCircle size={12} className="mr-1" /> : <Calendar size={12} className="mr-1" />}
                        {overdue ? 'Overdue: ' : 'Due: '}
                        {formatDeadline(lesson.deadline)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-slate-400 dark:text-slate-500 mt-1">
                    <span className="flex items-center"><Clock size={12} className="mr-1" /> {lesson.durationMinutes} min</span>
                    {lesson.resources.length > 0 && (
                       <span className="flex items-center"><File size={12} className="mr-1" /> {lesson.resources.length} resources</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Focus Mode Button */}
                  {expandedLessonId === lesson.id && (
                     <button
                        onClick={() => setIsFocusMode(true)}
                        className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors hidden md:block"
                        title="Focus Mode"
                     >
                        <Maximize2 size={16} />
                     </button>
                  )}
                  
                  <button 
                    onClick={() => deleteLesson(lesson.id, {} as any)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button 
                     onClick={() => setExpandedLessonId(expandedLessonId === lesson.id ? null : lesson.id)}
                     className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg"
                  >
                    {expandedLessonId === lesson.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedLessonId === lesson.id && (
                <div className="border-t border-slate-100 dark:border-slate-700 p-4 md:p-6 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-xl">
                  
                  {/* AI Study Assistant Section */}
                  <div className="mb-6 bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="flex items-center text-sm font-bold text-blue-900 dark:text-blue-300">
                        <Sparkles size={16} className="mr-2 text-blue-500" />
                        AI Study Assistant
                      </h4>
                      {!lesson.aiStudyGuide && (
                        <button 
                          onClick={() => handleGenerateStudyGuide(lesson)}
                          disabled={generatingLessonId === lesson.id}
                          className="text-xs bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center"
                        >
                          {generatingLessonId === lesson.id ? (
                            <><Loader2 size={14} className="animate-spin mr-1" /> Analyzing...</>
                          ) : (
                            "Generate Guide"
                          )}
                        </button>
                      )}
                    </div>

                    {lesson.aiStudyGuide && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                          <div className="flex items-start">
                            <Lightbulb size={16} className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                            <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
                              {lesson.aiStudyGuide.summary}
                            </p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                             <h5 className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                               <List size={14} className="mr-1" /> Key Takeaways
                             </h5>
                             <ul className="space-y-2">
                               {lesson.aiStudyGuide.keyPoints.map((point, idx) => (
                                 <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start">
                                   <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                   {point}
                                 </li>
                               ))}
                             </ul>
                          </div>
                          <div>
                             <h5 className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                               <Dumbbell size={14} className="mr-1" /> Try This
                             </h5>
                             <p className="text-sm text-slate-600 dark:text-slate-300 italic border-l-2 border-slate-200 dark:border-slate-600 pl-3">
                               "{lesson.aiStudyGuide.exercise}"
                             </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {lesson.description && (
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Notes</h4>
                      <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">{lesson.description}</p>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Resources</h4>
                    <div className="space-y-2">
                      {lesson.resources.map(res => (
                        <div 
                          key={res.id} 
                          className="flex items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:shadow-sm transition-all group"
                        >
                          <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-md mr-3 text-slate-500 dark:text-slate-300 group-hover:text-blue-500 transition-colors">
                             {getResourceIcon(res.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <a 
                              href={res.url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-700 block truncate text-sm"
                            >
                              {res.title}
                            </a>
                            <span className="text-xs text-slate-400 truncate block">{res.url}</span>
                          </div>
                          <button 
                            onClick={() => deleteResource(lesson.id, res.id)}
                            className="p-1.5 text-slate-300 hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove resource"
                          >
                             <Trash2 size={14} />
                          </button>
                        </div>
                      ))}

                      {addingResourceToLessonId === lesson.id ? (
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 animate-fade-in">
                          <input 
                            autoFocus
                            type="text" 
                            value={resTitle}
                            onChange={(e) => setResTitle(e.target.value)}
                            placeholder="Resource Title (e.g. Slides)"
                            className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm mb-2 focus:outline-none focus:border-blue-500 dark:text-white"
                          />
                          <input 
                            type="text" 
                            value={resUrl}
                            onChange={(e) => setResUrl(e.target.value)}
                            placeholder="URL or File Path"
                            className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm mb-2 focus:outline-none focus:border-blue-500 dark:text-white"
                          />
                          <div className="flex gap-2 mb-3">
                            {(['link', 'video', 'file', 'slide'] as const).map(type => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setResType(type)}
                                className={`flex-1 py-1 text-xs rounded border transition-colors ${resType === type ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                              >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </button>
                            ))}
                          </div>
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={cancelAddResource}
                              className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={saveResource}
                              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Add Resource
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => initiateAddResource(lesson.id)}
                          className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 flex items-center mt-3 px-1"
                        >
                          <Plus size={14} className="mr-1" /> Add Resource
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};