import React, { useState, useRef } from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { 
  X, 
  Sparkles, 
  Download, 
  Upload, 
  Trash2, 
  Check, 
  AlertTriangle, 
  Clock, 
  Sliders, 
  BookOpen,
  Building,
  RotateCcw
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    settings, 
    updateSettings, 
    resetToDemo, 
    clearAllData, 
    exportData, 
    importData, 
    setSimulatedDate, 
    clearSimulation,
    todaySchedule,
    currentSimulatedTime 
  } = useSchedule();

  const [institutionName, setInstitutionName] = useState(settings.institutionName || '');
  const [programName, setProgramName] = useState(settings.programName || '');
  const [semesterName, setSemesterName] = useState(settings.semesterName || '');
  const [sectionName, setSectionName] = useState(settings.sectionName || '');

  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSaveMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      institutionName,
      programName,
      semesterName,
      sectionName
    });
  };

  const handleExport = () => {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nextclass-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importData(content);
      if (res.success) {
        setImportStatus({ success: true, message: 'Schedule imported successfully!' });
      } else {
        setImportStatus({ success: false, message: `Import failed: ${res.errors.join(', ')}` });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-6 space-y-5 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-brand-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Settings & Demo Controls
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Data Quick Action */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-brand-50 to-indigo-50/50 border border-brand-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span className="font-bold text-slate-900">Bundled Demo Data</span>
            </div>
            <button
              onClick={() => {
                resetToDemo();
                alert('Sample timetable, academic calendar, and overrides loaded successfully!');
              }}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors active:scale-95 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Load Sample Timetable</span>
            </button>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Restores the sample 5th Semester CSE schedule and Odd Semester academic calendar (with holidays, Oct 1 special timetable, and date overrides) for grading demonstrations.
          </p>
        </div>

        {/* Backup: Import / Export */}
        <div className="space-y-2">
          <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
            Schedule Data Backup & Transfer (JSON)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExport}
              className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center space-x-2 font-semibold text-slate-700 transition-colors"
            >
              <Download className="w-4 h-4 text-brand-600" />
              <span>Export Schedule</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center space-x-2 font-semibold text-slate-700 transition-colors"
            >
              <Upload className="w-4 h-4 text-brand-600" />
              <span>Import Schedule</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>

          {importStatus && (
            <div
              className={`p-2.5 rounded-lg text-[11px] ${
                importStatus.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {importStatus.message}
            </div>
          )}
        </div>

        {/* University / Academic Profile */}
        <form onSubmit={handleSaveMetadata} className="space-y-3 pt-2 border-t border-slate-100">
          <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
            Institution & Student Profile (Generic)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Institution Name
              </label>
              <input
                type="text"
                value={institutionName}
                onChange={e => setInstitutionName(e.target.value)}
                placeholder="e.g. University Name"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Degree / Program
              </label>
              <input
                type="text"
                value={programName}
                onChange={e => setProgramName(e.target.value)}
                placeholder="e.g. B.Tech Computer Science"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Semester / Year
              </label>
              <input
                type="text"
                value={semesterName}
                onChange={e => setSemesterName(e.target.value)}
                placeholder="e.g. Semester 5"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Section / Batch
              </label>
              <input
                type="text"
                value={sectionName}
                onChange={e => setSectionName(e.target.value)}
                placeholder="e.g. Section C"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
          >
            Save Profile
          </button>
        </form>

        {/* Danger Zone: Clear all */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="font-bold text-rose-700 block">Reset to Blank Slate</span>
            <span className="text-[10px] text-slate-500">Removes all classes to build a fresh schedule</span>
          </div>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to clear all data? You can restore sample data anytime.')) {
                clearAllData();
              }
            }}
            className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold transition-colors"
          >
            Clear All Data
          </button>
        </div>

        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
