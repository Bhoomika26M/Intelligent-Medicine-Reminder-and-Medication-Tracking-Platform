import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  FiActivity, 
  FiCheckCircle, 
  FiXCircle, 
  FiMinusCircle, 
  FiAlertTriangle,
  FiAlertCircle,
  FiClock,
  FiCalendar, 
  FiBarChart2, 
  FiPieChart,
  FiGrid,
  FiDownload
} from 'react-icons/fi';
import { GiPill } from 'react-icons/gi';

// Chart.js integrations
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const MedicationHistory = () => {
  const [report, setReport] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const downloadCSVReport = () => {
    if (!historyLogs || historyLogs.length === 0) {
      toast.error('No history data available to download.');
      return;
    }
    try {
      const headers = ['Date', 'Time', 'Medicine', 'Dosage', 'Status'];
      const rows = historyLogs.map(log => [
        log.date,
        log.time?.substring(0, 5) || '',
        log.medicine?.name || '',
        log.medicine?.dosage || '',
        log.status
      ]);
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pillsync_medication_history_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Medication history report downloaded!');
    } catch (err) {
      toast.error('Failed to generate report. Please try again.');
    }
  };

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

  // Setup Weekly Chart Data
  const weeklyLabels = weeklyReport.map(w => w.week_commencing);
  const weeklyChartData = {
    labels: weeklyLabels,
    datasets: [
      {
        label: 'Taken',
        data: weeklyReport.map(w => w.taken || 0),
        backgroundColor: '#10b981', // Emerald green
        borderRadius: 4,
      },
      {
        label: 'Skipped',
        data: weeklyReport.map(w => w.skipped || 0),
        backgroundColor: '#fbbf24', // Amber/Yellow
        borderRadius: 4,
      },
      {
        label: 'Missed',
        data: weeklyReport.map(w => w.missed || 0),
        backgroundColor: '#ef4444', // Rose red
        borderRadius: 4,
      }
    ]
  };

  const weeklyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 10,
          font: { family: 'Inter', size: 10, weight: 'bold' },
        }
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { font: { family: 'Inter', size: 9 } }
      },
      y: {
        stacked: true,
        grid: { color: '#f1f5f9' },
        ticks: { font: { family: 'Inter', size: 9 } }
      }
    }
  };

  // Setup Doughnut Chart Data for Missed Doses by Time Slot
  const timeSlots = Object.keys(missedAnalysis.by_time_of_day || {});
  const timeCounts = Object.values(missedAnalysis.by_time_of_day || {});
  
  const timeChartData = {
    labels: timeSlots,
    datasets: [
      {
        data: timeCounts,
        backgroundColor: ['#60a5fa', '#f59e0b', '#8b5cf6'], // Blue, Orange, Purple
        borderWidth: 1,
        borderColor: '#ffffff',
      }
    ]
  };

  const timeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 8,
          font: { family: 'Inter', size: 9, weight: 'bold' }
        }
      }
    },
    cutout: '70%'
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Compliance & History</h1>
        <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">Review your historical adherence logs, adherence rates, and weekly compliance reports.</p>
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
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{report?.adherence_rate || 0}%</p>
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
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{report?.taken_count || 0}</p>
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
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{report?.skipped_count || 0}</p>
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
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{report?.missed_count || 0}</p>
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
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FiBarChart2 className="text-blue-500" />
            <span>Weekly Adherence Performance</span>
          </h3>
          {weeklyReport.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">Insufficient data to build trend chart.</p>
          ) : (
            <div className="h-64 pt-2">
              <Bar data={weeklyChartData} options={weeklyChartOptions} />
            </div>
          )}
        </div>

        {/* Missed Dose Time Analysis */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
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
            <div className="h-56 pt-2">
              <Doughnut data={timeChartData} options={timeChartOptions} />
            </div>
          )}
        </div>
      </div>

      {/* Grid containing Missed Dose Drugs & Chronological Log */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Missed Doses by Drug */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
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
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
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
                      <h4 className="font-bold text-slate-900 dark:text-white">{log.medicine?.name}</h4>
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
