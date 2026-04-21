import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity } from 'lucide-react';

export default function TimeSeriesViewer({ data, title = "Time Series Data" }) {
  // data is expected to be a 2D array from the backend, shape [window_size][features]
  // typically features: 0=load, 1=solar, 2=wind
  
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data.map((row, index) => ({
      time: index,
      load: row[0] || 0,
      solar: row[1] || 0,
      wind: row[2] || 0,
    }));
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="glass-card p-6 h-64 flex flex-col items-center justify-center text-slate-500">
        <Activity size={32} className="mb-2 opacity-50" />
        <p>No data to display</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-semibold mb-6">{title}</h2>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="time" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Line type="monotone" dataKey="load" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="solar" stroke="#eab308" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="wind" stroke="#06b6d4" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-6 mt-4 justify-center text-sm">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#6366f1]"></div> Load</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#eab308]"></div> Solar</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#06b6d4]"></div> Wind</div>
      </div>
    </div>
  );
}
