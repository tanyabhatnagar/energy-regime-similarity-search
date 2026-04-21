import React from 'react';
import { Activity, Database, Zap, Clock } from 'lucide-react';
import TransitionMatrixViewer from './TransitionMatrixViewer';

export default function Dashboard() {
  const stats = [
    { title: 'Data Points', value: '1,000+', icon: <Database />, color: 'text-blue-400' },
    { title: 'Active Windows', value: '976', icon: <Clock />, color: 'text-indigo-400' },
    { title: 'Regimes Mapped', value: '4', icon: <Activity />, color: 'text-purple-400' },
    { title: 'System Status', value: 'Healthy', icon: <Zap />, color: 'text-emerald-400' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="glass-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{stat.title}</h3>
            <div className={`p-2 bg-slate-800/50 rounded-lg ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-100">{stat.value}</p>
        </div>
      ))}
      <TransitionMatrixViewer />
    </div>
  );
}
