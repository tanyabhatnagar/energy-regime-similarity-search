import React, { useState, useEffect } from 'react';
import { Clock, Calendar, ArrowRight, Activity, Search } from 'lucide-react';
import { api } from '../api/client';

export default function HistoryTab({ onViewHistory }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.getSearchHistory();
        setHistory(data);
      } catch (err) {
        setError('Failed to fetch search history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-zinc-500">
        <div className="w-12 h-12 border-4 border-[#333] border-t-indigo-500 rounded-full animate-spin mb-4"></div>
        <p>Loading your past searches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
        {error}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="glass-card p-12 text-center text-zinc-500">
        <Search size={48} className="mx-auto mb-4 opacity-50" />
        <h2 className="text-xl">No Search History Found</h2>
        <p className="mt-2 text-sm">When you run similarity searches from your dashboard, they will be saved here.</p>
      </div>
    );
  }

  const handleView = (item) => {
    // Inject the raw cached JSON results directly to the top-level app handler
    const rawData = typeof item.results_json === 'string' ? JSON.parse(item.results_json) : item.results_json;
    onViewHistory(rawData);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <Clock className="text-zinc-300" />
        Search History
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((item) => {
          const date = new Date(item.timestamp);
          return (
            <div key={item.id} className="glass-card p-5 group hover:border-[#333] transition-colors flex flex-col justify-between">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3 text-sm text-zinc-500">
                  <div className="flex items-center gap-1.5 bg-zinc-900/50 px-2.5 py-1 rounded-md border border-zinc-800">
                    <Calendar size={14} className="text-zinc-300" />
                    {date.toLocaleDateString()}
                  </div>
                  <span className="text-xs bg-[#1C1C1C] text-zinc-300 px-2 py-1 rounded-md">
                    Top {item.top_k} results
                  </span>
                </div>
                
                <h3 className="font-semibold text-zinc-300 mb-1 flex items-center gap-2">
                  <Activity size={16} className="text-zinc-400" />
                  Query Signature
                </h3>
                <p className="text-xs text-zinc-500 mb-2">
                  {new Date(item.start_time).toLocaleString()} to <br/>
                  {new Date(item.end_time).toLocaleString()}
                </p>
              </div>

              <button 
                onClick={() => handleView(item)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900/50 hover:bg-indigo-600/20 text-zinc-300 hover:text-indigo-300 rounded-lg text-sm transition-colors border border-indigo-500/20"
              >
                View Matches
                <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
