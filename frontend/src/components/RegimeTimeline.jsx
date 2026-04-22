import React from 'react';
import { Layers } from 'lucide-react';

const REGIME_COLORS = {
  0: 'bg-emerald-500',
  1: 'bg-amber-500', 
  2: 'bg-rose-500',
  3: 'bg-indigo-500'
};

export const REGIME_NAMES = {
  0: 'Regime 0 (High Wind / Low Load)',
  1: 'Regime 1 (Mid Solar / Mid Load)',
  2: 'Regime 2 (High Load / Low Gen)',
  3: 'Regime 3 (Balanced Baseline)'
};

export default function RegimeTimeline({ regimes }) {
  if (!regimes || regimes.length === 0) {
    return null;
  }

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Layers className="text-zinc-300" />
        Regime Classification Timeline
      </h2>
      
      {/* Timeline visualization */}
      <div className="w-full h-12 flex rounded-lg shadow-inner border border-zinc-700/50">
        {regimes.map((r, idx) => (
          <div 
            key={idx} 
            className={`h-full flex-grow relative group ${REGIME_COLORS[r.regime_label] || 'bg-zinc-500'} opacity-80 hover:opacity-100 transition-opacity cursor-pointer first:rounded-l-sm last:rounded-r-sm`}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10 border border-zinc-700 shadow-xl hidden md:group-hover:block">
              Window {r.window_id}: {REGIME_NAMES[r.regime_label]}
            </div>
          </div>
        ))}
      </div>
      
      <p className="mt-3 text-xs text-zinc-500 text-center">
        This timeline spans the complete dataset, where each colored block sequentially represents a standard 24-hour time window.
      </p>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 mt-6 justify-center text-sm">
        {[0, 1, 2, 3].map(label => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded shadow-sm ${REGIME_COLORS[label]}`}></div>
            <span className="text-zinc-300">{REGIME_NAMES[label]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
