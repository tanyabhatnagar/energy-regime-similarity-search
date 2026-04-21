import React, { useState } from 'react';
import { api } from '../api/client';
import { Database, Settings, Activity } from 'lucide-react';

export default function AdminPanel() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleAction = async (actionFn, successMsg) => {
    setLoading(true);
    setStatus('Processing...');
    try {
      const result = await actionFn();
      let msg = `Success: ${successMsg}`;
      if (result && result.train_score !== undefined) {
        msg += ` | Train Log-Likelihood: ${result.train_score.toFixed(2)} | Validation: ${result.validation_score.toFixed(2)}`;
      }
      setStatus(msg);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Settings className="text-indigo-400" />
        System Administration
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          disabled={loading}
          onClick={() => handleAction(() => api.loadData(true), 'Data loaded')}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Database size={18} />
          {loading ? 'Working...' : 'Load Default Data'}
        </button>

        <button 
          disabled={loading}
          onClick={() => handleAction(() => api.preprocessData(), 'Data preprocessed')}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Activity size={18} />
          {loading ? 'Working...' : 'Preprocess & Window'}
        </button>

        <button 
          disabled={loading}
          onClick={() => handleAction(() => api.trainModel(), 'HMM Model Trained')}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Settings size={18} />
          {loading ? 'Working...' : 'Train HMM Model'}
        </button>
      </div>

      {status && (
        <div className={`mt-4 p-3 rounded-lg border ${status.includes('Error') ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
          {status}
        </div>
      )}
    </div>
  );
}
