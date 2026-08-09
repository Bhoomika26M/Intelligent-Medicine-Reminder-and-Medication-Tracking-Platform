import React, { useState } from 'react';
import { Pill, Clock, Activity, CheckCircle2, Circle } from 'lucide-react';

export default function Dashboard() {
  // Mock data for the daily schedule (this will eventually come from your backend)
  const [schedule, setSchedule] = useState([
    { id: 1, name: 'Levocetirizine', dosage: '5mg', time: '08:00 AM', status: 'taken' },
    { id: 2, name: 'Vitamin D3', dosage: '1000 IU', time: '01:00 PM', status: 'pending' },
    { id: 3, name: 'Metformin', dosage: '500mg', time: '08:00 PM', status: 'pending' }
  ]);

  return (
    <div className="p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back!</h1>
        <p className="text-sm text-gray-500 mt-1">Here is your health overview and schedule for today.</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl">
            <Pill className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Medicines</p>
            <p className="text-2xl font-bold text-gray-900">3</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Taken Today</p>
            <p className="text-2xl font-bold text-gray-900">1</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl">
            <Activity className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Upcoming Doses</p>
            <p className="text-2xl font-bold text-gray-900">2</p>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            Today's Schedule
          </h2>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className="space-y-4">
          {schedule.map((med) => (
            <div 
              key={med.id} 
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                med.status === 'taken' 
                  ? 'bg-gray-50 border-gray-100 opacity-75' 
                  : 'bg-white border-indigo-100 hover:border-indigo-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-4">
                <button className="focus:outline-none">
                  {med.status === 'taken' ? (
                    <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                  ) : (
                    <Circle className="w-7 h-7 text-gray-300 hover:text-indigo-400 transition-colors" />
                  )}
                </button>
                <div>
                  <h3 className={`font-bold ${med.status === 'taken' ? 'text-gray-500 line-through decoration-gray-300' : 'text-gray-900'}`}>
                    {med.name}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">Dosage: {med.dosage}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-sm font-bold ${med.status === 'taken' ? 'text-gray-400' : 'text-indigo-600'}`}>
                  {med.time}
                </span>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">{med.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}