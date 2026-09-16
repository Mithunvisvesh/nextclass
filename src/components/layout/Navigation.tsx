import React from 'react';
import { useSchedule, NavigationTab } from '../../context/ScheduleContext';
import { CalendarCheck, CalendarDays, Table, Edit3, Settings } from 'lucide-react';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  badgeCount?: number;
}

export const Navigation: React.FC = () => {
  const { currentTab, setCurrentTab, overrides } = useSchedule();

  const navItems: NavItem[] = [
    { id: 'today', label: 'Today', icon: CalendarCheck },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'timetable', label: 'Timetable', icon: Table },
    { id: 'changes', label: 'Changes', icon: Edit3, badgeCount: overrides.length },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Navigation Tabs */}
      <nav className="hidden md:block bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex space-x-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center space-x-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
                  isActive
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badgeCount && item.badgeCount > 0 ? (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.badgeCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 py-1.5 shadow-lg safe-bottom">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all ${
                  isActive ? 'text-brand-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  {item.badgeCount && item.badgeCount > 0 ? (
                    <span className="absolute -top-1 -right-2 bg-brand-600 text-white text-[9px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center border-2 border-white">
                      {item.badgeCount}
                    </span>
                  ) : null}
                </div>
                <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
