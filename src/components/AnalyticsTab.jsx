import React, { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import { 
  IconTrendingUp, 
  IconTrendingDown, 
  IconBarChart, 
  IconTarget,
  IconBrain,
  IconZap,
  IconRocket,
  IconTrophy,
  IconStar,
  IconFire,
  IconChartBar,
  IconCalendar,
  IconRupee,
  IconPercent,
  IconUsers,
  IconActivity
} from './icons';

export default function AnalyticsTab({ totals, monthRows, allMonthRows, activeMonthLabel, setupRows, directionRows, emotionRows, monthlyChart, equityChart, commonChartOptions, formatNumber, periodLabel, periodControls, onSelectMonth }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [animateCharts, setAnimateCharts] = useState(false);
  const [hoveredMetric, setHoveredMetric] = useState(null);

  useEffect(() => {
    setAnimateCharts(true);
  }, []);

  // Add some fun animations on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setHoveredMetric('net');
      setTimeout(() => setHoveredMetric('winRate'), 500);
      setTimeout(() => setHoveredMetric('trades'), 1000);
      setTimeout(() => setHoveredMetric('avg'), 1500);
      setTimeout(() => setHoveredMetric(null), 2000);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getPerformanceColor = (value) => {
    if (value >= 0) return 'text-emerald-600 dark:text-emerald-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getPerformanceGradient = (value) => {
    if (value >= 0) return 'from-emerald-500 to-green-500';
    return 'from-red-500 to-pink-500';
  };

  const getWinRateColor = (rate) => {
    if (rate >= 70) return 'text-emerald-600 dark:text-emerald-400';
    if (rate >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white animate-pulse">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 animate-bounce"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/5 rounded-full -translate-x-8 -translate-y-8 animate-spin"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <IconChartBar className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Trading Analytics</h1>
              <p className="text-indigo-100 text-lg">Deep insights into your trading performance</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div 
              className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                hoveredMetric === 'net' ? 'bg-white/30 scale-110 shadow-2xl' : 'hover:bg-white/20'
              }`}
              onMouseEnter={() => setHoveredMetric('net')}
              onMouseLeave={() => setHoveredMetric(null)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center ${
                  hoveredMetric === 'net' ? 'animate-bounce' : 'animate-pulse'
                }`}>
                                      <IconRupee className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <div className={`text-2xl font-bold ${
                    hoveredMetric === 'net' ? 'animate-pulse text-emerald-200' : 'animate-pulse'
                  }`}>
                    {formatNumber(totals.net)}
                  </div>
                  <div className="text-indigo-100 text-sm">Total Net P&L</div>
                </div>
              </div>
            </div>

            <div 
              className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                hoveredMetric === 'winRate' ? 'bg-white/30 scale-110 shadow-2xl' : 'hover:bg-white/20'
              }`}
              onMouseEnter={() => setHoveredMetric('winRate')}
              onMouseLeave={() => setHoveredMetric(null)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center ${
                  hoveredMetric === 'winRate' ? 'animate-spin' : 'animate-bounce'
                }`}>
                  <IconPercent className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <div className={`text-2xl font-bold ${
                    hoveredMetric === 'winRate' ? 'animate-pulse text-blue-200' : 'animate-pulse'
                  }`}>
                    {totals.winRate}%
                  </div>
                  <div className="text-indigo-100 text-sm">Win Rate</div>
                </div>
              </div>
            </div>

            <div 
              className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                hoveredMetric === 'trades' ? 'bg-white/30 scale-110 shadow-2xl' : 'hover:bg-white/20'
              }`}
              onMouseEnter={() => setHoveredMetric('trades')}
              onMouseLeave={() => setHoveredMetric(null)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center ${
                  hoveredMetric === 'trades' ? 'animate-bounce' : 'animate-pulse'
                }`}>
                  <IconUsers className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <div className={`text-2xl font-bold ${
                    hoveredMetric === 'trades' ? 'animate-pulse text-purple-200' : 'animate-pulse'
                  }`}>
                    {totals.trades}
                  </div>
                  <div className="text-indigo-100 text-sm">Total Trades</div>
                </div>
              </div>
            </div>

            <div 
              className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                hoveredMetric === 'avg' ? 'bg-white/30 scale-110 shadow-2xl' : 'hover:bg-white/20'
              }`}
              onMouseEnter={() => setHoveredMetric('avg')}
              onMouseLeave={() => setHoveredMetric(null)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center ${
                  hoveredMetric === 'avg' ? 'animate-pulse' : 'animate-spin'
                }`}>
                  <IconActivity className="w-5 h-5 text-orange-300" />
                </div>
                <div>
                  <div className={`text-2xl font-bold ${
                    hoveredMetric === 'avg' ? 'animate-pulse text-orange-200' : 'animate-pulse'
                  }`}>
                    {formatNumber(totals.avg)}
                  </div>
                  <div className="text-indigo-100 text-sm">Avg Net/Trade</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Period Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <IconCalendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Analysis Period</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">{periodLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
            {periodControls}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly P&L Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                <IconBarChart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Monthly P&L</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Performance by month</p>
              </div>
            </div>
          </div>
          <div className="p-6 h-64">
            {allMonthRows.length ? (
              <div className={`transition-all duration-1000 ${animateCharts ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <Bar
                  data={monthlyChart}
                  options={{
                    ...commonChartOptions,
                    scales: {
                      x: { grid: { display: false } },
                      y: { grid: { color: '#e5e7eb' } }
                    },
                    onClick: (evt, elements, chart) => {
                      const el = elements && elements[0];
                      if (!el) return;
                      const idx = el.index;
                      const label = chart.data.labels?.[idx];
                      if (label) onSelectMonth(label);
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                  <IconBarChart className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p>No monthly data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Equity Curve Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <IconTrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Equity Curve</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Cumulative performance</p>
              </div>
            </div>
          </div>
          <div className="p-6 h-64">
            {totals.trades ? (
              <div className={`transition-all duration-1000 ${animateCharts ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <Line 
                  data={equityChart} 
                  options={{
                    ...commonChartOptions, 
                    scales:{ 
                      x:{ grid:{ display:false } }, 
                      y:{ grid:{ color:'#e5e7eb' } } 
                    }
                  }} 
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                  <IconTrendingUp className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p>No trades yet</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Summary Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <IconCalendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Monthly Summary</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Click on any month to filter data</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Trades
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Win Rate
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Total Net
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Average
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {allMonthRows.length ? allMonthRows.map((m, index) => (
                <tr 
                  key={m.month} 
                  className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-lg cursor-pointer ${
                    activeMonthLabel === m.month ? 'bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20' : ''
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => onSelectMonth(m.month)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">{m.month}</span>
                      {activeMonthLabel === m.month && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <IconUsers className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">{m.total}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${getWinRateColor(m.winRate)}`}>
                      {m.winRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${getPerformanceColor(m.totalNet)}`}>
                      ₹{formatNumber(m.totalNet)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${getPerformanceColor(m.avg)}`}>
                      ₹{formatNumber(m.avg)}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <IconCalendar className="w-8 h-8 text-slate-300" />
                      <p>No trades yet</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Analytics Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <IconTarget className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Performance Analytics</h2>
            <p className="text-slate-600 dark:text-slate-400">Deep dive into your trading patterns</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Setup Performance */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                  <IconTarget className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white">Setup Performance</h4>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {setupRows && setupRows.length ? setupRows.map((s, index) => (
                                 <div 
                   key={s.setup} 
                   className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 last:border-b-0 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 dark:hover:from-emerald-900/10 dark:hover:to-green-900/10 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                   style={{ animationDelay: `${index * 100}ms` }}
                 >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900 dark:text-white">{s.setup}</span>
                    <span className={`text-lg font-bold ${getPerformanceColor(s.avgNet)}`}>
                      ₹{formatNumber(s.avgNet)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <IconUsers className="w-3 h-3" />
                      <span>{s.trades} trades</span>
                    </div>
                    <span className={`font-medium ${getWinRateColor(s.winRate)}`}>
                      {s.winRate}% win rate
                    </span>
                  </div>
                </div>
              )) : (
                <div className="px-6 py-8 text-center text-slate-500">
                  <IconTarget className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>No setups yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Direction Analytics */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <IconTrendingUp className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white">Direction Analytics</h4>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {directionRows && directionRows.length ? directionRows.map((d, index) => (
                                 <div 
                   key={d.combo} 
                   className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 last:border-b-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-900/10 dark:hover:to-cyan-900/10 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                   style={{ animationDelay: `${index * 100}ms` }}
                 >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900 dark:text-white">{d.combo}</span>
                    <span className={`text-lg font-bold ${getPerformanceColor(d.avgNet)}`}>
                      ₹{formatNumber(d.avgNet)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <IconUsers className="w-3 h-3" />
                      <span>{d.trades} trades</span>
                    </div>
                    <span className={`font-medium ${getWinRateColor(d.winRate)}`}>
                      {d.winRate}% win rate
                    </span>
                  </div>
                </div>
              )) : (
                <div className="px-6 py-8 text-center text-slate-500">
                  <IconTrendingUp className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>No direction data yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Emotion Analytics */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <IconBrain className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white">Emotion Analytics</h4>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {emotionRows && emotionRows.length ? emotionRows.map((e, index) => (
                                 <div 
                   key={e.emotion} 
                   className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 last:border-b-0 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 dark:hover:from-orange-900/10 dark:hover:to-red-900/10 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                   style={{ animationDelay: `${index * 100}ms` }}
                 >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900 dark:text-white">{e.emotion}</span>
                    <span className={`text-lg font-bold ${getPerformanceColor(e.avgNet)}`}>
                      ₹{formatNumber(e.avgNet)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <IconUsers className="w-3 h-3" />
                      <span>{e.trades} trades</span>
                    </div>
                    <span className={`font-medium ${getWinRateColor(e.winRate)}`}>
                      {e.winRate}% win rate
                    </span>
                  </div>
                </div>
              )) : (
                <div className="px-6 py-8 text-center text-slate-500">
                  <IconBrain className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>No emotion data yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
