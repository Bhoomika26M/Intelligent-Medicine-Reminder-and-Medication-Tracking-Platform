import React, { useState } from 'react';
import { FiSettings, FiVolume2, FiSmartphone, FiBell, FiShield, FiCheckCircle } from 'react-icons/fi';

const Settings = () => {
  const [successMsg, setSuccessMsg] = useState('');
  
  // Settings values backed by State
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [stockThreshold, setStockThreshold] = useState(5);
  const [themeMode, setThemeMode] = useState('light');

  const saveSettings = (e) => {
    e.preventDefault();
    setSuccessMsg('System settings saved successfully!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Platform Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Configure your medication alarms, notification channels, and platform preferences.</p>
      </div>

      {successMsg && (
        <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 border border-emerald-100 flex items-center gap-2">
          <FiCheckCircle className="text-lg shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={saveSettings} className="grid gap-6 md:grid-cols-2">
        {/* Card 1: Alarm & Notification Channels */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-3 flex items-center gap-2">
            <FiBell className="text-blue-500" />
            <span>Alarms & Notifications</span>
          </h3>

          {/* Toggle 1: Push Alerts */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-700">Push Notification Alerts</h4>
              <p className="text-xs text-slate-400">Trigger browser notifications when medications are due.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={pushEnabled} 
                onChange={() => setPushEnabled(!pushEnabled)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Toggle 2: SMS Reminders */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-700">SMS Reminders</h4>
              <p className="text-xs text-slate-400">Send mobile text messages for critical prescription dosages.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={smsEnabled} 
                onChange={() => setSmsEnabled(!smsEnabled)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Toggle 3: Sound Alerts */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-700">Audio Alarm Sounds</h4>
              <p className="text-xs text-slate-400">Play alert tones upon scheduled reminder trigger.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={soundEnabled} 
                onChange={() => setSoundEnabled(!soundEnabled)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Card 2: Treatment & Refill Preferences */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-3 flex items-center gap-2">
            <FiSmartphone className="text-teal-500" />
            <span>Refills & Treatment Stock</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Low Stock Alert Threshold
            </label>
            <input 
              type="number" 
              value={stockThreshold}
              onChange={(e) => setStockThreshold(parseInt(e.target.value, 10))}
              className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-sm focus:border-blue-500 outline-none"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Triggers a dash metric stock warning when remaining counts fall below this level.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Simulated Theme Layout
            </label>
            <div className="flex gap-2 mt-1">
              {['light', 'dark'].map((theme) => (
                <button
                  type="button"
                  key={theme}
                  onClick={() => setThemeMode(theme)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold border capitalize transition-colors cursor-pointer ${
                    themeMode === theme 
                      ? 'bg-blue-550 border-blue-500 text-blue-600 bg-blue-50 font-bold' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {theme} Mode
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Security & Privacy (Read Only Policy) */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-3 flex items-center gap-2">
            <FiShield className="text-violet-500" />
            <span>Security & Privacy Policies</span>
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            PillSync platform adheres strictly to healthcare security metrics. All patient credentials, medication lists, and medical conditions are stored inside encrypted PostgreSQL database segments. Authentication relies on cryptographically signed JWT stateless access tokens with 30-minute expiration rates, backed by secure hashed database password storage.
          </p>
        </div>

        {/* Form Submission */}
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-3 text-sm font-bold text-white shadow-lg hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
