import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function SimilaritySearchPanel({ onSearch }) {
  const [startTime, setStartTime] = useState('2020-01-01T00:00:00');
  const [endTime, setEndTime] = useState('2020-01-01T23:00:00');
  const [topK, setTopK] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ startTime, endTime, topK: parseInt(topK, 10) });
  };

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Search className="text-indigo-400" />
        Find Similar Regimes
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Start Time</label>
          <input 
            type="datetime-local" 
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="input-field"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">End Time</label>
          <input 
            type="datetime-local" 
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Top K Results</label>
          <input 
            type="number" 
            min="1"
            max="20"
            value={topK}
            onChange={(e) => setTopK(e.target.value)}
            className="input-field"
            required
          />
        </div>

        <button type="submit" className="btn-primary py-2.5 h-[42px]">
          Search
        </button>
      </form>
    </div>
  );
}
