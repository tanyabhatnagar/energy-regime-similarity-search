import React from 'react';
import TimeSeriesViewer from './TimeSeriesViewer';

export default function ResultsView({ results }) {
  if (!results || results.length === 0) return null;

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
        Similar Regimes Discovered
        <span className="text-sm font-normal px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full">
          {results.length} Matches
        </span>
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {results.map((item, idx) => (
          <div key={idx} className="relative group">
            {/* Glossy hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
            
            <TimeSeriesViewer 
              title={`Rank #${item.rank} - Score: ${item.log_likelihood_score.toFixed(2)}`} 
              data={item.target_window.data} 
            />
            
            <div className="absolute top-4 right-4 text-xs font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded">
              Window ID: {item.target_window.id}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
