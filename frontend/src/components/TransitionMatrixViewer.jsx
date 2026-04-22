import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Grid } from 'lucide-react';
import { REGIME_NAMES } from './RegimeTimeline';

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

  if (loading) return <div className="text-zinc-500">Loading transition matrix...</div>;
  if (!matrix) return <div className="text-zinc-500 italic">{error}</div>;

  return (
    <div className="glass-card p-6 col-span-1 md:col-span-2 lg:col-span-4">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-zinc-100">
        <Grid className="text-zinc-400" />
        Regime Transition Matrix
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-zinc-300">
          <thead className="text-xs uppercase bg-zinc-800/50 text-zinc-500">
            <tr>
              <th className="px-6 py-3 rounded-tl-lg">From \\ To</th>
              {matrix.map((_, i) => (
                <th key={i} className={`px-6 py-3 font-semibold ${i === matrix.length - 1 ? 'rounded-tr-lg' : ''}`}>
                  {REGIME_NAMES[i]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i} className="border-b border-zinc-700/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-6 py-4 font-bold text-zinc-300 bg-zinc-800/20 max-w-[150px]">
                  {REGIME_NAMES[i]}
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
                      <span className={`relative z-10 ${isHigh ? 'text-white font-bold' : 'text-zinc-300'}`}>
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
      <p className="mt-4 text-xs text-zinc-500">
        Values represent the probability of transitioning from the row regime to the column regime.
      </p>
    </div>
  );
}
