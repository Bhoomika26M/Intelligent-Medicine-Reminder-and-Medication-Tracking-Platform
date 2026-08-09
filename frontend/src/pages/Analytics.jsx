import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function Analytics() {
  const [predictions, setPredictions] = useState([]);
  const [adherence, setAdherence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId') || 1;

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [refillRes, adherenceRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/analytics/refills/${userId}`, { headers }),
        axios.get(`http://localhost:5000/api/analytics/adherence/${userId}`, { headers })
      ]);

      setPredictions(refillRes.data.predictions || []);
      setAdherence(adherenceRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load live backend insights. Please ensure your server is running.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = adherence ? [
    { name: 'Taken', value: adherence.taken },
    { name: 'Missed', value: adherence.missed }
  ] : [];

  const COLORS = ['#16a34a', '#dc2626'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">AI Refill Engine & Adherence Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time health monitoring and automated prediction metrics.</p>
        </div>
        <button 
          onClick={fetchAnalytics}
          className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 font-medium px-4 py-2 rounded-xl border border-gray-200 shadow-sm transition-all"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Refill Predictions Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">Refill Predictions</h2>
              <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-semibold">Active Sync</span>
            </div>

            {predictions.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                No active medicines found.
              </div>
            ) : (
              <div className="space-y-3">
                {predictions.map(item => (
                  <div 
                    key={item.medicineId} 
                    className="p-4 bg-gray-50 hover:bg-gray-100/60 rounded-xl flex justify-between items-center border border-gray-100 transition-all"
                  >
                    <div>
                      <strong className="text-gray-900 font-semibold">{item.name}</strong>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Stock: {item.currentStock} units ({item.remainingDays} days left)
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                      item.remainingDays <= 7 
                        ? 'bg-red-50 text-red-600 border border-red-200/50' 
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-200/50'
                    }`}>
                      {item.remainingDays <= 7 ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                      <span>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 30-Day Adherence Rate Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">30-Day Adherence Rate</h2>
              <span className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-semibold">Verified</span>
            </div>

            {adherence && (
              <div className="text-center">
                <div className="inline-block my-2 px-6 py-2 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                  <span className="text-sm font-bold text-emerald-700">Score: </span>
                  <span className="text-2xl font-extrabold text-emerald-600">{adherence.adherencePercentage}</span>
                </div>
                <div className="w-full h-56 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={chartData} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={75} 
                        innerRadius={45}
                        paddingAngle={4}
                        fill="#8884d8" 
                        label
                      >
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}