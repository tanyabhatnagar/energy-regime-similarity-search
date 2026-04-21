import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Grid } from 'lucide-react';

export default function TransitionMatrixViewer() {
  const [matrix, setMatrix] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        const data = await api.getTransitionMatrix();
        setMatrix(data.matrix);
      } catch (err) {
        setError('No model trained yet or failed to fetch matrix.');
      } finally {
        setLoading(false);
      }
    };
    fetchMatrix();
  }, []);

  if (loading) return <div className="text-slate-400">Loading transition matrix...</div>;
  if (!matrix) return <div className="text-slate-400 italic">{error}</div>;

  return (
    <div className="glass-card p-6 col-span-1 md:col-span-2 lg:col-span-4">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-100">
        <Grid className="text-purple-400" />
        Regime Transition Matrix
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="text-xs uppercase bg-slate-800/50 text-slate-400">
            <tr>
              <th className="px-6 py-3 rounded-tl-lg">From \\ To</th>
              {matrix.map((_, i) => (
                <th key={i} className={`px-6 py-3 font-semibold ${i === matrix.length - 1 ? 'rounded-tr-lg' : ''}`}>
                  Regime {i}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-200 bg-slate-800/20">
                  Regime {i}
                </td>
                {row.map((val, j) => {
                  // Color intensity based on transition probability
                  const intensity = Math.floor(val * 100);
                  const isHigh = val > 0.5;
                  return (
                    <td 
                      key={j} 
                      className={`px-6 py-4 relative group`}
                    >
                      <div className="absolute inset-0 m-1 rounded bg-indigo-500" style={{ opacity: val * 0.7 }}></div>
                      <span className={`relative z-10 ${isHigh ? 'text-white font-bold' : 'text-slate-300'}`}>
                        {(val * 100).toFixed(1)}%
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Values represent the probability of transitioning from the row regime to the column regime.
      </p>
    </div>
  );
}
