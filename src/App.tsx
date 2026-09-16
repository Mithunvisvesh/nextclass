import React, { useState } from 'react';
import { ScheduleProvider, useSchedule, NavigationTab } from './context/ScheduleContext';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { TimeSimulatorBanner } from './components/layout/TimeSimulatorBanner';
import { TodayView } from './components/today/TodayView';
import { CalendarView } from './components/calendar/CalendarView';
import { WeeklyTimetableBaseline } from './components/timetable/WeeklyTimetableBaseline';
import { ChangesManager } from './components/changes/ChangesManager';
import { SettingsModal } from './components/settings/SettingsModal';
import { ChangeModal } from './components/changes/ChangeModal';

const AppContent: React.FC = () => {
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
        {currentTab === 'today' && (
          <TodayView onOpenAddChange={handleOpenAddChange} />
        )}
        {currentTab === 'calendar' && (
          <CalendarView onOpenAddChange={handleOpenAddChange} />
        )}
        {currentTab === 'timetable' && (
          <WeeklyTimetableBaseline />
        )}
        {currentTab === 'changes' && (
          <ChangesManager />
        )}
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
  return (
    <ScheduleProvider>
      <AppContent />
    </ScheduleProvider>
  );
};

export default App;
