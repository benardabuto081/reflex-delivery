import React, { useState } from 'react';
import DispatcherDashboard from './features/dispatcher/DispatcherDashboard';
import RiderDashboard from './features/rider/RiderDashboard';

type ActiveView = 'dispatcher' | 'rider';

export default function App() {
  const [currentView, setCurrentView] = useState<ActiveView>('dispatcher');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Simulation Toggle Bar for Panel Presentation */}
      <div className="bg-slate-900 border-b border-slate-800 p-2 flex justify-center items-center gap-4 sticky top-0 z-50">
        <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
          Environment Sandbox:
        </span>
        <div className="bg-slate-800 p-1 rounded-lg flex border border-slate-700">
          <button
            onClick={() => setCurrentView('dispatcher')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              currentView === 'dispatcher'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🖥️ Dispatcher Panel
          </button>
          <button
            onClick={() => setCurrentView('rider')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              currentView === 'rider'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📱 Rider App Mobile
          </button>
        </div>
      </div>

      {/* Render Selected Interface View Context */}
      <div className="flex-1">
        {currentView === 'dispatcher' ? (
          <DispatcherDashboard />
        ) : (
          <RiderDashboard />
        )}
      </div>
    </div>
  );
}
