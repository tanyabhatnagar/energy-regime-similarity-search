import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Activity, Database, Zap, Clock } from 'lucide-react';
import TransitionMatrixViewer from './TransitionMatrixViewer';

export default function Dashboard() {
  const [statsData, setStatsData] = useState({
    data_points: 0,
    active_windows: 0,
    regimes_mapped: 0,
    system_status: 'Connecting...'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await api.getSystemStats();
        setStatsData(result);
      } catch (err) {
        console.error('Failed to fetch system stats', err);
        setStatsData(prev => ({ ...prev, system_status: 'Offline' }));
      }
    };
    fetchStats();
    
    // Auto-refresh stats every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { title: 'Data Points', value: statsData.data_points.toLocaleString(), icon: <Database />, color: 'text-[#86b9b0]' },
    { title: 'Active Windows', value: statsData.active_windows.toLocaleString(), icon: <Clock />, color: 'text-[#86b9b0]' },
    { title: 'Regimes Mapped', value: statsData.regimes_mapped, icon: <Activity />, color: 'text-[#86b9b0]' },
    { 
      title: 'System Status', 
      value: statsData.system_status, 
      icon: <Zap />, 
      color: statsData.system_status === 'Healthy' ? 'text-[#86b9b0]' : 'text-rose-400' 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="glass-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[#4c7273] text-sm font-bold uppercase tracking-wider">{stat.title}</h3>
            <div className={`p-2 bg-[#042630] rounded-lg ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
          <p className="text-4xl font-bold text-[#d0d6d6] truncate">{stat.value}</p>
        </div>
      ))}
      <TransitionMatrixViewer />
    </div>
  );
}
