import React, { useEffect, useState, useMemo } from "react";
import { calcTradeCharges } from "./utils/calc";
import * as XLSX from "xlsx";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const STORAGE_KEY = "trading_journal_trades_v1";

function blankTrade() {
  return {
    id: Date.now() + Math.random(),
    date: new Date().toISOString().slice(0,10),
    symbol: "",
    type: "Long",
    qty: 0,
    buy: 0,
    sell: 0,
    setup: "",
    remarks: ""
  };
}

export default function App() {
  const [trades, setTrades] = useState([]);
  const [form, setForm] = useState(blankTrade());
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('ui_dark');
    if (saved != null) return saved === '1';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isCompact, setIsCompact] = useState(() => localStorage.getItem('ui_compact') === '1');

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setTrades(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
  }, [trades]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('ui_dark', isDark ? '1' : '0');
  }, [isDark]);

  useEffect(() => {
    document.documentElement.classList.toggle('compact', isCompact);
    localStorage.setItem('ui_compact', isCompact ? '1' : '0');
  }, [isCompact]);

  function addOrUpdateTrade(e) {
    e.preventDefault();
    // Coerce string inputs to numbers here to avoid the "0 not deletable" UX issue
    const trade = {
      ...form,
      qty: Number(form.qty || 0),
      buy: Number(form.buy || 0),
      sell: Number(form.sell || 0),
    };
    const computed = calcTradeCharges({
      qty: trade.qty, buy: trade.buy, sell: trade.sell, type: trade.type
    });
    trade.meta = computed;
    setTrades(prev => {
      const i = prev.findIndex(p => p.id === trade.id);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = trade;
        return copy;
      }
      return [trade, ...prev];
    });
    setForm(blankTrade());
  }

  function editTrade(t) {
    // Keep numeric fields as strings for better editing UX
    setForm({
      ...t,
      qty: String(t.qty ?? ''),
      buy: String(t.buy ?? ''),
      sell: String(t.sell ?? ''),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteTrade(id) {
    if (!confirm("Delete this trade?")) return;
    setTrades(prev => prev.filter(t => t.id !== id));
  }

  function importExcel(file) {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const wb = XLSX.read(data, {type:"array"});
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, {defval:""});
      const mapped = json.map(r => {
        const t = {
          id: Date.now() + Math.random(),
          date: r.Date || r.date || new Date().toISOString().slice(0,10),
          symbol: r.Symbol || r.symbol || r.SymbolName || "",
          type: r["Trade Type"] || r.type || "Long",
          qty: Number(r.Qty || r.qty || 0),
          buy: Number(r["Buy Price"] || r.buy || 0),
          sell: Number(r["Sell Price"] || r.sell || 0),
          setup: r.Setup || r.setup || "",
          remarks: r.Remarks || r.remarks || ""
        };
        t.meta = calcTradeCharges({ qty: t.qty, buy: t.buy, sell: t.sell, type: t.type});
        return t;
      });
      setTrades(prev => [...mapped, ...prev]);
    };
    reader.readAsArrayBuffer(file);
  }

  function exportExcel() {
    const rows = trades.map(t => ({
      Date: t.date,
      Symbol: t.symbol,
      "Trade Type": t.type,
      Qty: t.qty,
      "Buy Price": t.buy,
      "Sell Price": t.sell,
      Turnover: t.meta?.turnover,
      Brokerage: t.meta?.brokerage,
      STT: t.meta?.stt,
      "Exchange Charges": t.meta?.exchangeCharges,
      "Stamp Duty": t.meta?.stampDuty,
      "SEBI Fees": t.meta?.sebi,
      GST: t.meta?.gst,
      "Total Charges": t.meta?.totalCharges,
      "Gross P&L": t.meta?.gross,
      "Net P&L": t.meta?.net,
      Setup: t.setup,
      Remarks: t.remarks
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Trades");
    XLSX.writeFile(wb, "trading_journal_export.xlsx");
  }

  // Derived summaries
  const tradesSorted = useMemo(() => {
    return [...trades].sort((a,b) => new Date(a.date) - new Date(b.date));
  }, [trades]);

  const monthly = trades.reduce((acc, t) => {
    const m = new Date(t.date).toLocaleString("en-GB",{ month: "short", year: "numeric" });
    if (!acc[m]) acc[m] = { trades:0, wins:0, losses:0, net:0 };
    acc[m].trades++;
    const net = t.meta?.net || 0;
    if (net > 0) acc[m].wins++; else acc[m].losses++;
    acc[m].net += net;
    return acc;
  }, {});
  const monthRows = Object.entries(monthly).map(([m, v]) => ({
    month: m,
    total: v.trades,
    wins: v.wins,
    losses: v.losses,
    winRate: v.trades ? Math.round((v.wins/v.trades)*100*100)/100 : 0,
    totalNet: Math.round(v.net*100)/100,
    avg: v.trades ? Math.round((v.net/v.trades)*100)/100 : 0
  }));

  const setupMap = trades.reduce((acc, t) => {
    const s = t.setup || "Unspecified";
    if (!acc[s]) acc[s] = { trades:0, wins:0, losses:0, net:0 };
    acc[s].trades++;
    const net = t.meta?.net || 0;
    if (net > 0) acc[s].wins++; else acc[s].losses++;
    acc[s].net += net;
    return acc;
  }, {});
  const setupRows = Object.entries(setupMap).map(([s, v]) => ({
    setup: s,
    trades: v.trades,
    wins: v.wins,
    losses: v.losses,
    winRate: v.trades ? Math.round((v.wins/v.trades)*100*100)/100 : 0,
    avgNet: v.trades ? Math.round((v.net/v.trades)*100)/100 : 0
  }));

  // Chart data: Monthly P&L bar
  const monthLabels = monthRows.map(m => m.month);
  const monthData = monthRows.map(m => m.totalNet);

  const monthlyChart = {
    labels: monthLabels,
    datasets: [
      {
        label: "Total Net P&L",
        data: monthData,
        // colors will be automatic
      }
    ]
  };

  // Equity curve: cumulative net over time
  const equityLabels = tradesSorted.map(t => t.date);
  let cum = 0;
  const equityDataPoints = tradesSorted.map(t => {
    cum += (t.meta?.net || 0);
    return Math.round(cum * 100) / 100;
  });
  const equityChart = {
    labels: equityLabels,
    datasets: [
      {
        label: "Equity Curve (Net P&L)",
        data: equityDataPoints,
        tension: 0.25,
        borderColor: "#0ea5e9",
        backgroundColor: "rgba(14,165,233,0.15)",
        fill: true,
      }
    ]
  };

  // Chart options
  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#eef2f7" } }
    }
  };

  // Add styling for bar dataset
  monthlyChart.datasets[0].backgroundColor = "rgba(2,132,199,0.2)";
  monthlyChart.datasets[0].borderColor = "#0284c7";
  monthlyChart.datasets[0].borderWidth = 2;
  monthlyChart.datasets[0].borderRadius = 6;

  // KPIs
  const round2 = (x) => Math.round(x * 100) / 100;
  const totals = useMemo(() => {
    const net = trades.reduce((sum, t) => sum + (t.meta?.net || 0), 0);
    const wins = trades.filter(t => (t.meta?.net || 0) > 0).length;
    const losses = trades.filter(t => (t.meta?.net || 0) <= 0).length;
    const winRate = trades.length ? Math.round((wins / trades.length) * 10000) / 100 : 0;
    const avg = trades.length ? round2(net / trades.length) : 0;
    return { net: round2(net), wins, losses, winRate, avg, trades: trades.length };
  }, [trades]);

  const formatNumber = (n) => (typeof n === "number" ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : n);

  return (
    <div>
      {/* Topbar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="container-wrap flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">Trading Journal</span>
            <span className="badge badge-green">v1</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsCompact(v => !v)} type="button" className="btn btn-secondary" title="Toggle density">{isCompact ? 'Comfortable' : 'Compact'}</button>
            <button onClick={() => setIsDark(v => !v)} type="button" className="btn btn-secondary" title="Toggle dark mode">{isDark ? 'Light' : 'Dark'}</button>
            <button onClick={exportExcel} type="button" className="btn btn-secondary">Export</button>
            <button onClick={() => { localStorage.removeItem(STORAGE_KEY); setTrades([]); }} type="button" className="btn btn-danger">Reset</button>
          </div>
        </div>
      </div>

      <div className="container-wrap py-6">
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
              {trades.length ? <Line data={equityChart} options={commonChartOptions} /> : <div className="text-slate-500">No trades yet</div>}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={addOrUpdateTrade} className="card mb-6">
          <div className="card-header"><h2 className="font-semibold">Add / Edit Trade</h2></div>
          <div className="card-body grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-3">
              <div className="text-slate-500 dark:text-slate-300 text-sm mb-2">Trade details</div>
            </div>
            <div>
              <label className="label">Date</label>
              <input required value={form.date} onChange={e => setForm({...form, date: e.target.value})} type="date" className="mt-1 field field-md"/>
            </div>
            <div>
              <label className="label">Symbol</label>
              <input placeholder="e.g. NIFTY" required value={form.symbol} onChange={e => setForm({...form, symbol: e.target.value.toUpperCase()})} className="mt-1 field field-md"/>
            </div>
            <div>
              <label className="label">Trade Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="mt-1 field field-md">
                <option>Long</option>
                <option>Short</option>
              </select>
            </div>

            <div>
              <label className="label">Qty</label>
              <input placeholder="0" inputMode="numeric" type="text" value={form.qty} onChange={e => setForm({...form, qty: e.target.value.replace(/[^0-9]/g, '')})} className="mt-1 field field-md"/>
            </div>
            <div>
              <label className="label">Buy Price</label>
              <input placeholder="0.00" inputMode="decimal" type="text" value={form.buy} onChange={e => setForm({...form, buy: e.target.value.replace(/[^0-9.]/g, '')})} className="mt-1 field field-md"/>
            </div>
            <div>
              <label className="label">Sell Price</label>
              <input placeholder="0.00" inputMode="decimal" type="text" value={form.sell} onChange={e => setForm({...form, sell: e.target.value.replace(/[^0-9.]/g, '')})} className="mt-1 field field-md"/>
            </div>

            <div>
              <label className="label">Setup</label>
              <input placeholder="e.g. Breakout, Pullback" value={form.setup} onChange={e => setForm({...form, setup: e.target.value})} className="mt-1 field field-md"/>
            </div>
            <div className="md:col-span-2">
              <label className="label">Remarks</label>
              <input placeholder="Notes, mistakes, improvements..." value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} className="mt-1 field field-md"/>
            </div>

            <div className="md:col-span-3 flex flex-wrap gap-2 pt-1">
              <button type="submit" className="btn btn-primary">Save Trade</button>
              <button type="button" onClick={() => setForm(blankTrade())} className="btn btn-secondary">Clear</button>

              <label className="btn btn-secondary cursor-pointer">
                Import Excel
                <input accept=".xlsx, .xls" type="file" onChange={e => e.target.files?.[0] && importExcel(e.target.files[0])} className="hidden"/>
              </label>
            </div>
          </div>
        </form>

        {/* Tables */}
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
                  {setupRows.length ? setupRows.map(s => (
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

        <div className="card table-wrap">
          <div className="card-header"><h2 className="font-semibold">Trade Log</h2></div>
          <div className="table-scroll">
            <table className="table">
              <thead className="thead">
                <tr>
                  <th className="th">Date</th>
                  <th className="th">Symbol</th>
                  <th className="th">Type</th>
                  <th className="th">Qty</th>
                  <th className="th">Buy</th>
                  <th className="th">Sell</th>
                  <th className="th">Net P&L</th>
                  <th className="th">Setup</th>
                  <th className="th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trades.length ? trades.map(t => (
                  <tr key={t.id} className="tr">
                    <td className="td">{t.date}</td>
                    <td className="td">{t.symbol}</td>
                    <td className="td">{t.type}</td>
                    <td className="td">{t.qty}</td>
                    <td className="td">{formatNumber(t.buy)}</td>
                    <td className="td">{formatNumber(t.sell)}</td>
                    <td className={"td " + ((t.meta?.net || 0) > 0 ? "text-green-700" : "text-red-700")}>
                      {t.meta?.net !== undefined ? formatNumber(t.meta?.net) : "-"}
                    </td>
                    <td className="td">{t.setup}</td>
                    <td className="td">
                      <div className="flex gap-2">
                        <button onClick={() => editTrade(t)} className="btn btn-secondary !px-2 !py-1 text-xs">Edit</button>
                        <button onClick={() => deleteTrade(t.id)} className="btn btn-danger !px-2 !py-1 text-xs">Delete</button>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan="9" className="td text-slate-500">No trades added</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
