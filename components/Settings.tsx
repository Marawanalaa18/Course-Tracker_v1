import React, { useEffect, useState, useRef } from 'react';
import { UserSettings } from '../types';
import { Bell, Clock, Save, ShieldAlert, Moon, Sun, Download, Upload, FileJson } from 'lucide-react';
import { exportData, importData } from '../services/storageService';

interface SettingsProps {
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
  onImport: () => void; // Callback to trigger app reload/update
}

export const Settings: React.FC<SettingsProps> = ({ settings, onSave, onImport }) => {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(Notification.permission);
  const [savedMessage, setSavedMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const requestPermission = async () => {
    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);
    if (permission === 'granted') {
      new Notification("Notifications Enabled", {
        body: "You will now receive study reminders.",
      });
    }
  };

  const handleSave = () => {
    onSave(localSettings);
    setSavedMessage('Settings saved successfully!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  // Immediate toggle for dark mode
  const toggleDarkMode = (checked: boolean) => {
    const newSettings = { ...localSettings, darkMode: checked };
    setLocalSettings(newSettings);
    onSave(newSettings); // Save immediately to trigger app-wide effect
  };

  const handleExport = () => {
    const jsonString = exportData();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `course-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        if (importData(content)) {
          alert('Data imported successfully! The app will reload.');
          onImport();
        } else {
          alert('Failed to import data. Invalid file format.');
        }
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Settings</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">Manage your notifications, appearance, and data.</p>

      <div className="space-y-6">
        
        {/* Appearance & Notifications */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
             <div className="flex items-center mb-6">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg mr-4">
                  <Moon size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">Appearance</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Customize how the app looks.</p>
                </div>
             </div>
             
             <div className="flex items-center justify-between">
                <div className="flex items-center">
                   {localSettings.darkMode ? <Moon size={18} className="mr-2 text-slate-600 dark:text-slate-300"/> : <Sun size={18} className="mr-2 text-orange-500"/>}
                   <label htmlFor="darkMode" className="font-medium text-slate-800 dark:text-slate-200">Dark Mode</label>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input 
                    type="checkbox" 
                    name="darkMode" 
                    id="darkMode" 
                    checked={localSettings.darkMode}
                    onChange={(e) => toggleDarkMode(e.target.checked)}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-blue-600"
                    style={{ right: localSettings.darkMode ? '0' : 'auto', left: localSettings.darkMode ? 'auto' : '0' }}
                  />
                  <label 
                    htmlFor="darkMode" 
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${localSettings.darkMode ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                  ></label>
                </div>
             </div>
          </div>

          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg mr-4">
                <Bell size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Notifications</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Configure how you want to be reminded.</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Permission Check */}
              {permissionStatus !== 'granted' && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 flex items-start">
                  <ShieldAlert className="text-amber-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="font-semibold text-amber-800 dark:text-amber-200 text-sm">Notifications Disabled</h4>
                    <p className="text-amber-700 dark:text-amber-300 text-sm mt-1 mb-2">
                      Browser notifications are currently blocked or not yet granted. Enable them to receive reminders.
                    </p>
                    <button 
                      onClick={requestPermission}
                      className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      Enable Notifications
                    </button>
                  </div>
                </div>
              )}

              {/* Daily Reminder Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="dailyReminder" className="font-medium text-slate-800 dark:text-slate-200 block">Daily Study Reminder</label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Get a notification to study every day.</p>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input 
                    type="checkbox" 
                    name="dailyReminder" 
                    id="dailyReminder" 
                    checked={localSettings.enableDailyReminder}
                    onChange={(e) => setLocalSettings({...localSettings, enableDailyReminder: e.target.checked})}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-blue-600"
                    style={{ right: localSettings.enableDailyReminder ? '0' : 'auto', left: localSettings.enableDailyReminder ? 'auto' : '0' }}
                  />
                  <label 
                    htmlFor="dailyReminder" 
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${localSettings.enableDailyReminder ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                  ></label>
                </div>
              </div>

              {/* Daily Reminder Time */}
              {localSettings.enableDailyReminder && (
                <div className="flex items-center justify-between pl-4 border-l-2 border-slate-100 dark:border-slate-700 ml-1 animate-fade-in">
                  <div className="flex items-center text-slate-600 dark:text-slate-400">
                    <Clock size={16} className="mr-2" />
                    <span className="text-sm font-medium">Time</span>
                  </div>
                  <input 
                    type="time" 
                    value={localSettings.dailyReminderTime}
                    onChange={(e) => setLocalSettings({...localSettings, dailyReminderTime: e.target.value})}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              )}

              {/* Deadline Reminders */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                <div>
                  <label htmlFor="deadlineReminder" className="font-medium text-slate-800 dark:text-slate-200 block">Deadline Alerts</label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Get notified when a lesson deadline is approaching or overdue.</p>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input 
                    type="checkbox" 
                    name="deadlineReminder" 
                    id="deadlineReminder" 
                    checked={localSettings.enableDeadlineReminders}
                    onChange={(e) => setLocalSettings({...localSettings, enableDeadlineReminders: e.target.checked})}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    style={{ right: localSettings.enableDeadlineReminders ? '0' : 'auto', left: localSettings.enableDeadlineReminders ? 'auto' : '0' }}
                  />
                  <label 
                    htmlFor="deadlineReminder" 
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${localSettings.enableDeadlineReminders ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                  ></label>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-green-600 font-medium">{savedMessage}</p>
            <button 
              onClick={handleSave}
              className="flex items-center px-6 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              <Save size={18} className="mr-2" />
              Save Changes
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
           <div className="flex items-center mb-6">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg mr-4">
                <FileJson size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Data Management</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Export your progress or import a backup.</p>
              </div>
           </div>

           <div className="flex gap-4">
             <button 
               onClick={handleExport}
               className="flex-1 flex items-center justify-center px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 font-medium"
             >
               <Download size={18} className="mr-2" />
               Export Data
             </button>
             <button 
               onClick={handleImportClick}
               className="flex-1 flex items-center justify-center px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 font-medium"
             >
               <Upload size={18} className="mr-2" />
               Import Data
             </button>
             <input 
               type="file" 
               accept=".json" 
               ref={fileInputRef} 
               onChange={handleFileChange}
               className="hidden" 
             />
           </div>
        </div>

      </div>
    </div>
  );
};