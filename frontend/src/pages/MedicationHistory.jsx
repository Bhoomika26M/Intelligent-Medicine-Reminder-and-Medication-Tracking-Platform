import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  FiActivity, 
  FiCheckCircle, 
  FiXCircle, 
  FiMinusCircle, 
  FiAlertTriangle, 
  FiClock,
  FiCalendar, 
  FiBarChart2, 
  FiPieChart,
  FiGrid
} from 'react-icons/fi';
import { GiPill } from 'react-icons/gi';

const MedicationHistory = () => {
  const [report, setReport] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        const [reportRes, logsRes] = await Promise.all([
          api.get('/history/report'),
          api.get('/history?limit=100')
        ]);
        setReport(reportRes.data);
        setHistoryLogs(logsRes.data);
      } catch (err) {
        console.error("Error retrieving history logs:", err);
        setErrorMsg("Failed to load medication logs and adherence statistics.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistoryData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const dailyReport = report?.daily_report || [];
  const weeklyReport = report?.weekly_report || [];
  const monthlyReport = report?.monthly_report || [];
  const missedAnalysis = report?.missed_dose_analysis || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Compliance & History</h1>
        <p className="text-sm text-slate-500 mt-1">Review your historical adherence logs, adherence rates, and weekly compliance reports.</p>
      </div>

      {errorMsg && (
        <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100 flex items-center gap-2">
          <FiAlertCircle className="text-lg shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Adherence Gauge */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Adherence Rate</span>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">{report?.adherence_rate || 0}%</p>
            <span className="text-[10px] text-teal-600 font-semibold mt-1.5 inline-flex items-center gap-0.5 bg-teal-50 px-2 py-0.5 rounded-full">
              {report?.adherence_rate >= 90 ? "Excellent" : report?.adherence_rate >= 75 ? "Good" : "Needs Review"}
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FiActivity className="text-2xl" />
          </div>
        </div>

        {/* Card 2: Taken */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Doses Taken</span>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">{report?.taken_count || 0}</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Total successful treatments</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FiCheckCircle className="text-2xl" />
          </div>
        </div>

        {/* Card 3: Skipped */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Doses Skipped</span>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">{report?.skipped_count || 0}</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Total intentional skips</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <FiMinusCircle className="text-2xl" />
          </div>
        </div>

        {/* Card 4: Missed */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Doses Missed</span>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">{report?.missed_count || 0}</p>
            <span className="text-[10px] text-rose-500 font-semibold mt-1 block">Requires reminder adjustment</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <FiXCircle className="text-2xl" />
          </div>
        </div>
      </div>

      {/* Main Reports layout (Charts) */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Weekly Compliance Trend (Bars) */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FiBarChart2 className="text-blue-500" />
            <span>Weekly Adherence Performance</span>
          </h3>
          {weeklyReport.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">Insufficient data to build trend chart.</p>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="flex justify-between text-xs text-slate-400 font-semibold">
                <span>Week Commencing</span>
                <span className="flex gap-4">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Taken</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> Skipped</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Missed</span>
                </span>
              </div>
              <div className="space-y-3.5">
                {weeklyReport.map((w, i) => {
                  const t = w.taken || 0;
                  const s = w.skipped || 0;
                  const m = w.missed || 0;
                  const tot = t + s + m || 1;
                  const pctT = (t / tot) * 100;
                  const pctS = (s / tot) * 100;
                  const pctM = (m / tot) * 100;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-600">{w.week_commencing}</span>
                        <span className="font-medium text-slate-500">{t} of {tot} Taken ({Math.round(pctT)}%)</span>
                      </div>
                      <div className="flex h-3.5 w-full rounded-full overflow-hidden bg-slate-100">
                        {t > 0 && <div style={{ width: `${pctT}%` }} className="bg-emerald-500 h-full" />}
                        {s > 0 && <div style={{ width: `${pctS}%` }} className="bg-amber-400 h-full" />}
                        {m > 0 && <div style={{ width: `${pctM}%` }} className="bg-rose-500 h-full" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Missed Dose Time Analysis */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FiPieChart className="text-teal-500" />
            <span>Missed Doses by Time</span>
          </h3>
          {report?.missed_count === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FiCheckCircle className="text-3xl text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-semibold">Perfect Adherence!</p>
              <p className="text-[10px] mt-0.5">No missed doses on record.</p>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {Object.entries(missedAnalysis.by_time_of_day || {}).map(([timeSlot, count]) => {
                const totalMissed = report?.missed_count || 1;
                const pct = (count / totalMissed) * 100;
                return (
                  <div key={timeSlot} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>{timeSlot}</span>
                      <span>{count} missed ({Math.round(pct)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div style={{ width: `${pct}%` }} className="bg-rose-500 h-full" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Grid containing Missed Dose Drugs & Chronological Log */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Missed Doses by Drug */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FiAlertTriangle className="text-rose-500" />
            <span>Missed Doses by Medicine</span>
          </h3>
          {report?.missed_count === 0 || !missedAnalysis.by_medicine || Object.keys(missedAnalysis.by_medicine).length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-12">No record of missed medicines.</p>
          ) : (
            <div className="space-y-3.5">
              {Object.entries(missedAnalysis.by_medicine).map(([medName, count]) => (
                <div key={medName} className="flex justify-between items-center rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs">
                  <span className="font-semibold text-slate-700">{medName}</span>
                  <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">{count} missed</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Timeline History Log */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FiGrid className="text-violet-500" />
            <span>Chronological Logs ({historyLogs.length})</span>
          </h3>
          {historyLogs.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-12">No treatment logs recorded yet.</p>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-3 pr-2 scrollbar">
              {historyLogs.map((log) => (
                <div 
                  key={log.id} 
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-xs transition-colors ${
                    log.status === 'Taken' 
                      ? 'bg-emerald-50/10 border-emerald-100'
                      : log.status === 'Skipped' 
                      ? 'bg-amber-50/10 border-amber-100' 
                      : 'bg-rose-50/10 border-rose-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-base ${
                      log.status === 'Taken' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : log.status === 'Skipped' 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      <GiPill />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{log.medicine?.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <FiCalendar /> {log.date} at <FiClock /> {log.time.substring(0, 5)}
                      </p>
                    </div>
                  </div>

                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    log.status === 'Taken'
                      ? 'bg-emerald-100 text-emerald-800'
                      : log.status === 'Skipped'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicationHistory;
