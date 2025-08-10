import React from "react";
import { Line, Bar } from "react-chartjs-2";

export default function AnalyticsTab({ totals, monthRows, allMonthRows, activeMonthLabel, setupRows, directionRows, emotionRows, monthlyChart, equityChart, commonChartOptions, formatNumber, periodLabel, periodControls, onSelectMonth }) {
  return (
    <div>
      {/* Period Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div className="text-sm text-slate-600 dark:text-slate-300">{periodLabel}</div>
        <div className="flex items-center gap-2">{periodControls}</div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="card">
          <div className="card-body">
            <div className="section-title">Total Net</div>
            <div className={totals.net >= 0 ? "mt-1 text-xl font-semibold text-green-700" : "mt-1 text-xl font-semibold text-red-700"}>{formatNumber(totals.net)}</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="section-title">Win Rate</div>
            <div className="mt-1 text-xl font-semibold">{totals.winRate}%</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="section-title">Total Trades</div>
            <div className="mt-1 text-xl font-semibold">{totals.trades}</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="section-title">Avg Net / Trade</div>
            <div className={totals.avg >= 0 ? "mt-1 text-xl font-semibold text-green-700" : "mt-1 text-xl font-semibold text-red-700"}>{formatNumber(totals.avg)}</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <div className="card-header"><h2 className="font-semibold">Monthly P&L</h2></div>
          <div className="card-body h-48 sm:h-64">
            {allMonthRows.length ? (
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
            ) : <div className="text-slate-500">No monthly data</div>}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h2 className="font-semibold">Equity Curve</h2></div>
          <div className="card-body h-48 sm:h-64">
            {totals.trades ? <Line data={equityChart} options={{...commonChartOptions, scales:{ x:{ grid:{ display:false } }, y:{ grid:{ color:'#e5e7eb' } } }}} /> : <div className="text-slate-500">No trades yet</div>}
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="card table-wrap mb-6">
        <div className="card-header flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2 className="font-semibold">Monthly Summary</h2>
        </div>
        <div className="table-scroll">
          <table className="table">
            <thead className="thead">
              <tr>
                <th className="th">Month</th>
                <th className="th">Trades</th>
                <th className="th">Win%</th>
                <th className="th">Total Net</th>
                <th className="th">Avg</th>
              </tr>
            </thead>
            <tbody>
              {allMonthRows.length ? allMonthRows.map(m => (
                <tr key={m.month} className={"tr cursor-pointer " + (activeMonthLabel===m.month ? 'bg-sky-50 dark:bg-slate-700' : '')} onClick={() => onSelectMonth(m.month)}>
                  <td className="td">{m.month}</td>
                  <td className="td">{m.total}</td>
                  <td className="td">{m.winRate}%</td>
                  <td className={"td " + (m.totalNet >= 0 ? "text-green-700" : "text-red-700")}>{formatNumber(m.totalNet)}</td>
                  <td className="td">{formatNumber(m.avg)}</td>
                </tr>
              )) : <tr><td colSpan="5" className="td text-slate-500">No trades yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Analytics Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Performance Analytics</h3>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Setup Performance */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-medium text-sm">Setup Performance</h4>
            </div>
            <div className="card-body !p-0">
              <div className="max-h-80 overflow-y-auto">
                {setupRows && setupRows.length ? setupRows.map(s => (
                  <div key={s.setup} className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-slate-800 dark:text-slate-100">{s.setup}</span>
                      <span className={"text-sm font-semibold " + (s.avgNet >= 0 ? "text-green-600" : "text-red-600")}>
                        {formatNumber(s.avgNet)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{s.trades} trades</span>
                      <span className={s.winRate >= 50 ? "text-green-600" : "text-red-600"}>{s.winRate}% win rate</span>
                    </div>
                  </div>
                )) : (
                  <div className="px-4 py-8 text-center text-slate-500">No setups yet</div>
                )}
              </div>
            </div>
          </div>

          {/* Direction Analytics */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <h4 className="font-medium text-sm">Direction Analytics</h4>
            </div>
            <div className="card-body !p-0">
              <div className="max-h-80 overflow-y-auto">
                {directionRows && directionRows.length ? directionRows.map(d => (
                  <div key={d.combo} className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-slate-800 dark:text-slate-100">{d.combo}</span>
                      <span className={"text-sm font-semibold " + (d.avgNet >= 0 ? "text-green-600" : "text-red-600")}>
                        {formatNumber(d.avgNet)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{d.trades} trades</span>
                      <span className={d.winRate >= 50 ? "text-green-600" : "text-red-600"}>{d.winRate}% win rate</span>
                    </div>
                  </div>
                )) : (
                  <div className="px-4 py-8 text-center text-slate-500">No direction data yet</div>
                )}
              </div>
            </div>
          </div>

          {/* Emotion Analytics */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-medium text-sm">Emotion Analytics</h4>
            </div>
            <div className="card-body !p-0">
              <div className="max-h-80 overflow-y-auto">
                {emotionRows && emotionRows.length ? emotionRows.map(e => (
                  <div key={e.emotion} className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-slate-800 dark:text-slate-100">{e.emotion}</span>
                      <span className={"text-sm font-semibold " + (e.avgNet >= 0 ? "text-green-600" : "text-red-600")}>
                        {formatNumber(e.avgNet)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{e.trades} trades</span>
                      <span className={e.winRate >= 50 ? "text-green-600" : "text-red-600"}>{e.winRate}% win rate</span>
                    </div>
                  </div>
                )) : (
                  <div className="px-4 py-8 text-center text-slate-500">No emotion data yet</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
