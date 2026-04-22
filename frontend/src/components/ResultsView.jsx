import React from 'react';
import TimeSeriesViewer from './TimeSeriesViewer';

export default function ResultsView({ results }) {
  if (!results || results.length === 0) return null;

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
        Similar Regimes Discovered
        <span className="text-sm font-normal px-3 py-1 bg-[#042630] border border-[#86b9b0] text-[#86b9b0] rounded-sm">
          {results.length} Matches
        </span>
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {results.map((item, idx) => (
          <div key={idx} className="relative group">
            {/* Soft highlight hover effect */}
            <div className="absolute inset-0 bg-[#042630]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-sm pointer-events-none"></div>
            
            <TimeSeriesViewer 
              title={`Rank #${item.rank} - Score: ${item.log_likelihood_score.toFixed(2)}`} 
              data={item.target_window.data} 
            />
            
            <div className="absolute top-4 right-4 text-[11px] font-mono bg-[#041421]/90 backdrop-blur-sm border border-[#4c7273] text-[#d0d6d6] px-3 py-2 rounded-sm flex flex-col items-end opacity-90 shadow-lg">
              <span className="text-[#86b9b0] font-bold mb-1 tracking-wider uppercase">Window #{item.target_window.id}</span>
              <span className="opacity-80 break-words whitespace-nowrap">
                {new Date(item.target_window.start_time).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })} →
              </span>
              <span className="opacity-80 break-words whitespace-nowrap">
                {new Date(item.target_window.end_time).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
