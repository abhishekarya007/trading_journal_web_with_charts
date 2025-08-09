import React from "react";
import { Line, Bar } from "react-chartjs-2";

export default function AnalyticsTab({ totals, monthRows, setupRows, monthlyChart, equityChart, commonChartOptions, formatNumber }) {
  return (
    <div>
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
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <div className="card-header"><h2 className="font-semibold">Monthly P&L</h2></div>
          <div className="card-body h-64">
            {monthRows.length ? <Bar data={monthlyChart} options={commonChartOptions} /> : <div className="text-slate-500">No monthly data</div>}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h2 className="font-semibold">Equity Curve</h2></div>
          <div className="card-body h-64">
            {totals.trades ? <Line data={equityChart} options={commonChartOptions} /> : <div className="text-slate-500">No trades yet</div>}
          </div>
        </div>
      </div>

      {/* Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="card table-wrap">
          <div className="card-header"><h2 className="font-semibold">Monthly Summary</h2></div>
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
                {monthRows.length ? monthRows.map(m => (
                  <tr key={m.month} className="tr">
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

        <div className="card table-wrap">
          <div className="card-header"><h2 className="font-semibold">Setup-wise Performance</h2></div>
          <div className="table-scroll">
            <table className="table">
              <thead className="thead">
                <tr>
                  <th className="th">Setup</th>
                  <th className="th">Trades</th>
                  <th className="th">Win%</th>
                  <th className="th">Avg Net</th>
                </tr>
              </thead>
              <tbody>
                {setupRows && setupRows.length ? setupRows.map(s => (
                  <tr key={s.setup} className="tr">
                    <td className="td">{s.setup}</td>
                    <td className="td">{s.trades}</td>
                    <td className="td">{s.winRate}%</td>
                    <td className={"td " + (s.avgNet >= 0 ? "text-green-700" : "text-red-700")}>{formatNumber(s.avgNet)}</td>
                  </tr>
                )) : <tr><td colSpan="4" className="td text-slate-500">No setups yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
