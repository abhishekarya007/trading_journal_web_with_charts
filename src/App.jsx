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
import AnalyticsTab from "./components/AnalyticsTab";
import TradesTab from "./components/TradesTab";

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
    qty: "",
    buy: "",
    sell: "",
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
  const [filterText, setFilterText] = useState("");

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
    // Toast
    try {
      const el = document.createElement('div');
      el.className = 'fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg';
      el.textContent = 'Trade saved';
      document.body.appendChild(el);
      setTimeout(() => { el.remove(); }, 1500);
    } catch {}
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

  function duplicateTrade(t) {
    const dup = {
      ...t,
      id: Date.now() + Math.random(),
      qty: String(t.qty ?? ''),
      buy: String(t.buy ?? ''),
      sell: String(t.sell ?? ''),
    };
    setForm(dup);
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

  // Live charges preview from current form inputs
  const chargesPreview = useMemo(() => {
    return calcTradeCharges({
      qty: Number(form.qty || 0),
      buy: Number(form.buy || 0),
      sell: Number(form.sell || 0),
      type: form.type,
    });
  }, [form.qty, form.buy, form.sell, form.type]);

  // Filtered trades for table view
  const filteredTrades = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) return trades;
    return trades.filter(t =>
      (t.symbol || '').toLowerCase().includes(q) ||
      (t.setup || '').toLowerCase().includes(q) ||
      (t.type || '').toLowerCase().includes(q) ||
      (t.remarks || '').toLowerCase().includes(q) ||
      (t.date || '').toLowerCase().includes(q)
    );
  }, [trades, filterText]);

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
        {/* Tabs */}
        <Tabs
          analyticsComponent={
            <AnalyticsTab
              totals={totals}
              monthRows={monthRows}
              setupRows={setupRows}
              monthlyChart={monthlyChart}
              equityChart={equityChart}
              commonChartOptions={commonChartOptions}
              formatNumber={formatNumber}
            />
          }
          tradesComponent={
            <TradesTab
              form={form}
              setForm={setForm}
              addOrUpdateTrade={addOrUpdateTrade}
              importExcel={importExcel}
              chargesPreview={chargesPreview}
              formatNumber={formatNumber}
              filteredTrades={filteredTrades}
              editTrade={editTrade}
              duplicateTrade={duplicateTrade}
              deleteTrade={deleteTrade}
              filterText={filterText}
              setFilterText={setFilterText}
            />
          }
        />
      </div>
    </div>
  );
}

function Tabs({ analyticsComponent, tradesComponent }) {
  const [active, setActive] = React.useState(() => localStorage.getItem('ui_active_tab') || 'trades');
  React.useEffect(() => { localStorage.setItem('ui_active_tab', active); }, [active]);
  return (
    <div>
      <div className="mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
        <button onClick={() => setActive('trades')} className={(active === 'trades' ? 'bg-sky-600 text-white shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200') + ' rounded-lg px-3 py-1.5 text-sm font-medium transition-colors'}>
          Trades
        </button>
        <button onClick={() => setActive('analytics')} className={(active === 'analytics' ? 'bg-sky-600 text-white shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200') + ' rounded-lg px-3 py-1.5 text-sm font-medium transition-colors'}>
          Analytics
        </button>
      </div>
      {active === 'trades' ? tradesComponent : analyticsComponent}
    </div>
  );
}
