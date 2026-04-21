import React, { useState, useEffect } from 'react';
import { api } from './api/client';
import Dashboard from './components/Dashboard';
import SimilaritySearchPanel from './components/SimilaritySearchPanel';
import TimeSeriesViewer from './components/TimeSeriesViewer';
import RegimeTimeline from './components/RegimeTimeline';
import ResultsView from './components/ResultsView';
import AdminPanel from './components/AdminPanel';
import { Activity } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [regimes, setRegimes] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [queryWindow, setQueryWindow] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Optionally fetch regimes when viewing the Dashboard
    const loadInitial = async () => {
      try {
        const data = await api.getRegimes();
        setRegimes(data);
      } catch (err) {
        console.error("Failed to load regimes", err);
      }
    };
    loadInitial();
  }, []);

  const handleSearch = async ({ startTime, endTime, topK }) => {
    setLoading(true);
    try {
      const resp = await api.searchSimilar(startTime, endTime, topK);
      setQueryWindow(resp.query_window);
      setSearchResults(resp.results);
      setActiveTab('results');
    } catch (err) {
      console.error(err);
      alert("Search failed. Ensure data is loaded and models are trained.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Top Header */}
      <header className="sticky top-0 z-50 glass-card rounded-none border-t-0 border-x-0 bg-slate-950/80 mb-8 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
             <Activity className="text-white" size={20} />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
            Energy Regime System
          </h1>
        </div>
        
        <nav className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('results')} 
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'results' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Search Results
          </button>
          <button 
            onClick={() => setActiveTab('admin')} 
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'admin' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Settings
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 pb-12 space-y-6">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Dashboard />
            <RegimeTimeline regimes={regimes} />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <TimeSeriesViewer title="Current Global Time Series (Last 24h Placeholder)" data={[]} />
              </div>
              <div className="xl:col-span-1">
                <SimilaritySearchPanel onSearch={handleSearch} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {loading ? (
               <div className="flex flex-col items-center justify-center p-24 text-slate-400">
                 <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                 <p>Analyzing Time Series Regimes...</p>
               </div>
            ) : queryWindow ? (
              <>
                <TimeSeriesViewer title="Query Window Signature" data={queryWindow.data} />
                <ResultsView results={searchResults} />
              </>
            ) : (
              <div className="glass-card p-12 text-center text-slate-500">
                <Activity size={48} className="mx-auto mb-4 opacity-50" />
                <h2 className="text-xl">No Active Query</h2>
                <p className="mt-2">Use the Similarity Search Panel on the Dashboard to find matches.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AdminPanel />
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
