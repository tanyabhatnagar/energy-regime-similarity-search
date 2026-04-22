import React, { useState, useEffect } from 'react';
import { api } from './api/client';
import Dashboard from './components/Dashboard';
import SimilaritySearchPanel from './components/SimilaritySearchPanel';
import TimeSeriesViewer from './components/TimeSeriesViewer';
import RegimeTimeline from './components/RegimeTimeline';
import ResultsView from './components/ResultsView';
import AdminPanel from './components/AdminPanel';
import AuthPanel from './components/AuthPanel';
import HistoryTab from './components/HistoryTab';
import { Activity, LogOut, Clock } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [regimes, setRegimes] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [queryWindow, setQueryWindow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  useEffect(() => {
    const loadInitial = async () => {
      if (!token) return;
      try {
        const data = await api.getRegimes();
        setRegimes(data);
      } catch (err) {
        console.error("Failed to load regimes", err);
        // If 401 unauthorized, force logout
        if (err.response?.status === 401) {
          handleLogout();
        }
      }
    };
    loadInitial();
  }, [token]);

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

  const handleHistoryView = (cachedData) => {
    setQueryWindow(cachedData.query_window);
    setSearchResults(cachedData.results);
    setActiveTab('results');
  };

  if (!token) {
    return <AuthPanel onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#041421] text-[#d0d6d6]">
      {/* Top Header */}
      <header className="sticky top-0 z-50 glass-card rounded-none border-t-0 border-x-0 border-b-[#4c7273] mb-8 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#86b9b0] flex items-center justify-center shadow-lg">
             <Activity className="text-[#041421]" size={20} />
          </div>
          <h1 className="text-2xl font-bold text-[#E0E0E0]">
            Energy Regime System
          </h1>
        </div>
        
        <nav className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-[#042630] text-[#86b9b0]' : 'text-[#d0d6d6] opacity-70 hover:opacity-100'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('results')} 
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'results' ? 'bg-[#042630] text-[#86b9b0]' : 'text-[#d0d6d6] opacity-70 hover:opacity-100'}`}
          >
            Search Results
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'history' ? 'bg-[#042630] text-[#86b9b0]' : 'text-[#d0d6d6] opacity-70 hover:opacity-100'} flex items-center gap-1.5`}
          >
            <Clock size={16} /> History
          </button>
          <button 
            onClick={() => setActiveTab('admin')} 
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'admin' ? 'bg-[#042630] text-[#86b9b0]' : 'text-[#d0d6d6] opacity-70 hover:opacity-100'}`}
          >
            Settings
          </button>
          
          <div className="w-px h-6 bg-[#4c7273] mx-2"></div>
          
          <button 
            onClick={handleLogout}
            className="px-3 py-2 rounded-lg text-[#d0d6d6] opacity-70 hover:text-red-400 hover:opacity-100 hover:bg-[#042630] transition-all flex items-center gap-2"
          >
            <LogOut size={18} />
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 pb-12 space-y-6">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Dashboard />
            <RegimeTimeline regimes={regimes} />
            <div className="grid grid-cols-1">
              <SimilaritySearchPanel onSearch={handleSearch} />
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {loading ? (
               <div className="flex flex-col items-center justify-center p-24 text-zinc-500">
                 <div className="w-12 h-12 border-4 border-[#4c7273] border-t-[#86b9b0] rounded-full animate-spin mb-4"></div>
                 <p>Analyzing Time Series Regimes...</p>
               </div>
            ) : queryWindow ? (
              <>
                <TimeSeriesViewer title="Query Window Signature" data={queryWindow.data} />
                <ResultsView results={searchResults} />
              </>
            ) : (
              <div className="glass-card p-12 text-center text-zinc-500">
                <Activity size={48} className="mx-auto mb-4 opacity-50" />
                <h2 className="text-xl">No Active Query</h2>
                <p className="mt-2">Use the Similarity Search Panel on the Dashboard to find matches.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <HistoryTab onViewHistory={handleHistoryView} />
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
