import React from 'react';
import { Layers } from 'lucide-react';

const REGIME_COLORS = {
  0: 'bg-emerald-500',
  1: 'bg-amber-500', 
  2: 'bg-rose-500',
  3: 'bg-indigo-500'
};

const REGIME_NAMES = {
  0: 'High Wind / Low Load',
  1: 'Mid Solar / Mid Load',
  2: 'High Load / Low Gen',
  3: 'Balanced Baseline'
};

export default function RegimeTimeline({ regimes }) {
  if (!regimes || regimes.length === 0) {
    return null;
  }

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Layers className="text-indigo-400" />
        Regime Classification Timeline
      </h2>
      
      {/* Timeline visualization */}
      <div className="w-full h-12 flex rounded-lg overflow-hidden border border-slate-700/50 shadow-inner">
        {regimes.map((r, idx) => (
          <div 
            key={idx} 
            className={`h-full flex-grow ${REGIME_COLORS[r.regime_label] || 'bg-slate-500'} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
            title={`Window ${r.window_id}: ${REGIME_NAMES[r.regime_label]}`}
          ></div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 mt-6 justify-center text-sm">
        {[0, 1, 2, 3].map(label => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded shadow-sm ${REGIME_COLORS[label]}`}></div>
            <span className="text-slate-300">{REGIME_NAMES[label]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
