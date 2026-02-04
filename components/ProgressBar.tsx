import React from 'react';

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  color = 'bg-blue-600', 
  height = 'h-2.5',
  showLabel = false
}) => {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-slate-700">Progress</span>
          <span className="text-sm font-medium text-slate-700">{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-200 rounded-full ${height}`}>
        <div 
          className={`${color} ${height} rounded-full transition-all duration-500 ease-out`} 
          style={{ width: `${clampedProgress}%` }}
        ></div>
      </div>
    </div>
  );
};