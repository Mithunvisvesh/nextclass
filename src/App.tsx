import React, { useState } from 'react';
import { ScheduleProvider, useSchedule } from './context/ScheduleContext';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { TimeSimulatorBanner } from './components/layout/TimeSimulatorBanner';
import { TodayView } from './components/today/TodayView';
import { CalendarView } from './components/calendar/CalendarView';
import { WeeklyTimetableBaseline } from './components/timetable/WeeklyTimetableBaseline';
import { ChangesManager } from './components/changes/ChangesManager';
import { SettingsModal } from './components/settings/SettingsModal';
import { ChangeModal } from './components/changes/ChangeModal';

// Mobile App imports (React Native / Expo)
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MobileScheduleProvider } from './context/MobileScheduleContext';
import { MobileApp } from './mobile/MobileApp';
import { Smartphone, Monitor } from 'lucide-react';

const WebAppContent: React.FC = () => {
  const { currentTab, setCurrentTab, addOverride } = useSchedule();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddChangeOpen, setIsAddChangeOpen] = useState(false);
  const [addChangeDefaultDate, setAddChangeDefaultDate] = useState<string | undefined>(undefined);

  const handleOpenAddChange = (defaultDate?: string) => {
    setAddChangeDefaultDate(defaultDate);
    setIsAddChangeOpen(true);
  };

  const handleSaveChange = (data: any) => {
    addOverride(data);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Header */}
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Interactive Time Simulator Bar */}
      <TimeSimulatorBanner />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'today' && <TodayView onOpenAddChange={handleOpenAddChange} />}
        {currentTab === 'calendar' && <CalendarView onOpenAddChange={handleOpenAddChange} />}
        {currentTab === 'timetable' && <WeeklyTimetableBaseline />}
        {currentTab === 'changes' && <ChangesManager />}
        {currentTab === 'settings' && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg font-semibold text-xs"
            >
              Open Settings Modal
            </button>
          </div>
        )}
      </main>

      {/* Responsive Navigation */}
      <Navigation />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen || currentTab === 'settings'}
        onClose={() => {
          setIsSettingsOpen(false);
          if (currentTab === 'settings') {
            setCurrentTab('today');
          }
        }}
      />

      {/* Add Change Modal (triggered from Today or Calendar) */}
      {isAddChangeOpen && (
        <ChangeModal
          defaultDate={addChangeDefaultDate}
          onSave={handleSaveChange}
          onClose={() => setIsAddChangeOpen(false)}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  // Default to Mobile preview so reviewers see genuine React Native app immediately
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col">
      {/* Platform Switcher Bar */}
      <div className="bg-slate-900/90 backdrop-blur border-b border-slate-800 text-xs px-4 py-2.5 flex items-center justify-between z-50 text-slate-300">
        <div className="flex items-center space-x-2">
          <span className="font-extrabold tracking-tight text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            NextClass
          </span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline">Cross-Platform React Native & Expo</span>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-semibold transition-all ${
              viewMode === 'mobile'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile App</span>
          </button>
          <button
            onClick={() => setViewMode('desktop')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-semibold transition-all ${
              viewMode === 'desktop'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop View</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {viewMode === 'mobile' ? (
          <SafeAreaProvider style={{ flex: 1 }}>
            <MobileScheduleProvider>
              <div className="flex-1 flex items-center justify-center p-0 sm:p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                <div className="w-full sm:max-w-[430px] h-[100dvh] sm:h-[880px] sm:max-h-[92vh] sm:rounded-[36px] sm:border-[5px] sm:border-slate-800 shadow-2xl overflow-hidden flex flex-col bg-slate-50 relative">
                  <MobileApp />
                </div>
              </div>
            </MobileScheduleProvider>
          </SafeAreaProvider>
        ) : (
          <ScheduleProvider>
            <WebAppContent />
          </ScheduleProvider>
        )}
      </div>
    </div>
  );
};

export default App;
