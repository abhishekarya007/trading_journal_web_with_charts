import React, { useEffect, useState, useMemo } from "react";
import { calcTradeCharges } from "./utils/calc";
import * as XLSX from "xlsx";
import JSZip from 'jszip';
import { dataUrlToBlob } from './utils/imageUtils';
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
import TradingRulesTab from "./components/TradingRulesTab";
import CooldownTimer from "./components/CooldownTimer";
import { IconCandle, IconDownload, IconReset, IconMoon, IconSun } from "./components/icons";

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

// Success sound function
function playSuccessSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Create a pleasant success sound (rising tone)
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    console.log('Audio not supported:', error);
  }
}

function blankTrade() {
  return {
    id: Date.now() + Math.random(),
    date: new Date().toISOString().slice(0,10),
    symbol: "",
    type: "Long",
    qty: "",
    buy: "",
    sell: "",
    trend: "Up",
    rule: "Yes",
    emotion: "",
    riskReward: "",
    setup: "",
    remarks: "",
    screenshots: [] // Array of {id, name, thumbnail, fullSize, fileName}
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
  const [filterStatus, setFilterStatus] = useState('all'); // all | wins | losses
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc'); // asc | desc
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showExportMenu, setShowExportMenu] = useState(false);

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
      trend: form.trend || 'Up',
      rule: form.rule || 'Yes',
      emotion: form.emotion || '',
      riskReward: form.riskReward || '',
      screenshots: form.screenshots || [],
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
    // Toast and sound notification
    try {
      const el = document.createElement('div');
      el.className = 'fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg';
      el.textContent = 'Trade saved';
      document.body.appendChild(el);
      setTimeout(() => { el.remove(); }, 1500);

      // Play success sound
      playSuccessSound();
    } catch {}
  }

  function editTrade(t) {
    // Keep numeric fields as strings for better editing UX
    setForm({
      ...t,
      qty: String(t.qty ?? ''),
      buy: String(t.buy ?? ''),
      sell: String(t.sell ?? ''),
      trend: t.trend || 'Up',
      rule: t.rule || 'Yes',
      emotion: t.emotion || '',
      riskReward: t.riskReward || '',
      screenshots: t.screenshots || [],
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
          trend: r.Trend || r.trend || "Up",
          rule: r["Rule Followed"] || r.rule || "Yes",
          emotion: r.Emotion || r.emotion || "",
          riskReward: r["Risk Reward"] || r.riskReward || "",
          qty: Number(r.Qty || r.qty || 0),
          buy: Number(r["Buy Price"] || r.buy || 0),
          sell: Number(r["Sell Price"] || r.sell || 0),
          setup: r.Setup || r.setup || "",
          remarks: r.Remarks || r.remarks || "",
          screenshots: [] // Screenshots can't be imported from Excel, start with empty array
        };
        t.meta = calcTradeCharges({ qty: t.qty, buy: t.buy, sell: t.sell, type: t.type});
        return t;
      });
      setTrades(prev => [...mapped, ...prev]);
    };
    reader.readAsArrayBuffer(file);
  }

  // Import ZIP file with Excel + Screenshots
  async function importZip(file) {
    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      
      // Find and read Excel file
      let excelFile = null;
      let excelData = null;
      
      const excelFileName = Object.keys(zipContent.files).find(name => 
        name.endsWith('.xlsx') || name.endsWith('.xls')
      );
      
      if (!excelFileName) {
        throw new Error('No Excel file found in ZIP archive');
      }
      
      const excelBuffer = await zipContent.files[excelFileName].async('arraybuffer');
      const wb = XLSX.read(new Uint8Array(excelBuffer), {type: "array"});
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, {defval: ""});
      
      // Process screenshot files
      const screenshotFiles = {};
      const screenshotsFolder = 'screenshots/';
      
      for (const [fileName, file] of Object.entries(zipContent.files)) {
        if (fileName.startsWith(screenshotsFolder) && !file.dir) {
          const actualFileName = fileName.replace(screenshotsFolder, '');
          if (actualFileName && (actualFileName.endsWith('.jpg') || actualFileName.endsWith('.jpeg') || actualFileName.endsWith('.png') || actualFileName.endsWith('.gif'))) {
            try {
              const imageData = await file.async('base64');
              const mimeType = actualFileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
              screenshotFiles[actualFileName] = `data:${mimeType};base64,${imageData}`;
            } catch (error) {
              console.warn(`Failed to process screenshot ${actualFileName}:`, error);
            }
          }
        }
      }
      
      // Map Excel data to trades and restore screenshots
      const mapped = json.map(r => {
        const t = {
          id: Date.now() + Math.random(),
          date: r.Date || r.date || new Date().toISOString().slice(0,10),
          symbol: r.Symbol || r.symbol || r.SymbolName || "",
          type: r["Trade Type"] || r.type || "Long",
          trend: r.Trend || r.trend || "Up",
          rule: r["Rule Followed"] || r.rule || "Yes",
          emotion: r.Emotion || r.emotion || "",
          riskReward: r["Risk Reward"] || r.riskReward || "",
          qty: Number(r.Qty || r.qty || 0),
          buy: Number(r["Buy Price"] || r.buy || 0),
          sell: Number(r["Sell Price"] || r.sell || 0),
          setup: r.Setup || r.setup || "",
          remarks: r.Remarks || r.remarks || "",
          screenshots: []
        };
        
        // Restore screenshots if references exist
        const screenshotFilesPaths = r["Screenshot Files"] || "";
        if (screenshotFilesPaths) {
          const filePaths = screenshotFilesPaths.split(', ').filter(Boolean);
          t.screenshots = filePaths.map((filePath, index) => {
            const fileName = filePath.replace('screenshots/', '');
            const fullSizeData = screenshotFiles[fileName];
            
            if (fullSizeData) {
              // Create a basic screenshot object
              // Note: We can't recreate the exact thumbnail without processing, 
              // but we'll use the full image as both thumbnail and full size for now
              return {
                id: Date.now() + Math.random() + index,
                name: r["Screenshot Names"]?.split(', ')[index] || `Screenshot ${index + 1}`,
                thumbnail: fullSizeData, // Using full size as thumbnail for imported
                fullSize: fullSizeData,
                fileName: fileName,
                originalSize: Math.round(fullSizeData.length * 0.75), // Approximate
                processedSize: Math.round(fullSizeData.length * 0.75),
                dimensions: {
                  original: { width: 0, height: 0 }, // Unknown for imported
                  fullSize: { width: 0, height: 0 },
                  thumbnail: { width: 150, height: 100 }
                },
                uploadedAt: new Date().toISOString(),
                imported: true // Mark as imported
              };
            }
            return null;
          }).filter(Boolean);
        }
        
        t.meta = calcTradeCharges({ qty: t.qty, buy: t.buy, sell: t.sell, type: t.type});
        return t;
      });
      
      setTrades(prev => [...mapped, ...prev]);
      
      // Show success message
      const totalScreenshots = mapped.reduce((sum, t) => sum + t.screenshots.length, 0);
      alert(`Import successful!\n${mapped.length} trades imported with ${totalScreenshots} screenshots restored.`);
      
    } catch (error) {
      alert(`Import failed: ${error.message}`);
      console.error('ZIP import error:', error);
    }
  }

  // Export Excel only
  function exportExcel() {
    const rows = trades.map(t => ({
      Date: t.date,
      Symbol: t.symbol,
      "Trade Type": t.type,
      Trend: t.trend,
      "Rule Followed": t.rule,
      Emotion: t.emotion,
      "Risk Reward": t.riskReward,
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
      Remarks: t.remarks,
      "Screenshots Count": t.screenshots?.length || 0,
      "Screenshot Names": t.screenshots?.map(s => s.name).join(', ') || ''
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Trades");
    XLSX.writeFile(wb, "trading_journal_export.xlsx");
  }

  // Export ZIP with Excel + Screenshots
  async function exportZip() {
    const zip = new JSZip();
    
    // Create Excel file data
    const rows = trades.map(t => ({
      Date: t.date,
      Symbol: t.symbol,
      "Trade Type": t.type,
      Trend: t.trend,
      "Rule Followed": t.rule,
      Emotion: t.emotion,
      "Risk Reward": t.riskReward,
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
      Remarks: t.remarks,
      "Screenshots Count": t.screenshots?.length || 0,
      "Screenshot Names": t.screenshots?.map(s => s.name).join(', ') || '',
      "Screenshot Files": t.screenshots?.map(s => `screenshots/${s.fileName}`).join(', ') || ''
    }));
    
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Trades");
    
    // Add Excel file to ZIP
    const excelBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    zip.file("trading_journal_export.xlsx", excelBuffer);
    
    // Add screenshots to ZIP
    const screenshotsFolder = zip.folder("screenshots");
    let hasScreenshots = false;
    
    for (const trade of trades) {
      if (trade.screenshots && trade.screenshots.length > 0) {
        for (const screenshot of trade.screenshots) {
          try {
            const blob = dataUrlToBlob(screenshot.fullSize);
            screenshotsFolder.file(screenshot.fileName, blob);
            hasScreenshots = true;
          } catch (error) {
            console.error('Error processing screenshot:', error);
          }
        }
      }
    }
    
    // Add README with instructions
    const readmeContent = `Trading Journal Export
=====================

This archive contains:
- trading_journal_export.xlsx: Complete trade data with screenshot references
- screenshots/ folder: All trade screenshots in full resolution

Screenshot Files:
- Each screenshot is saved with its original filename
- The Excel file contains references to screenshot files in the "Screenshot Files" column
- You can view screenshots by opening the files in the screenshots folder

Generated on: ${new Date().toLocaleString()}
Total Trades: ${trades.length}
Total Screenshots: ${trades.reduce((sum, t) => sum + (t.screenshots?.length || 0), 0)}
`;
    
    zip.file("README.txt", readmeContent);
    
    // Generate and download ZIP
    try {
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `trading_journal_export_${new Date().toISOString().slice(0,10)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Show success message
      const message = hasScreenshots 
        ? `Export complete! ZIP contains ${trades.length} trades and ${trades.reduce((sum, t) => sum + (t.screenshots?.length || 0), 0)} screenshots.`
        : `Export complete! ZIP contains ${trades.length} trades (no screenshots found).`;
      
      alert(message);
    } catch (error) {
      alert('Error creating ZIP file: ' + error.message);
    }
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

  // Add styling for bar dataset with green/red colors per bar
  const barBg = monthData.map(v => (v >= 0 ? "rgba(22,163,74,0.2)" : "rgba(220,38,38,0.2)"));
  const barBorder = monthData.map(v => (v >= 0 ? "#16a34a" : "#dc2626"));
  monthlyChart.datasets[0].backgroundColor = barBg;
  monthlyChart.datasets[0].borderColor = barBorder;
  monthlyChart.datasets[0].borderWidth = 2;
  monthlyChart.datasets[0].borderRadius = 6;
  monthlyChart.datasets[0].borderSkipped = false;

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
  // Analytics period controls
  const [analyticsScope, setAnalyticsScope] = useState('month'); // 'month' | 'overall'
  const dateKey = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  };
  const monthLabelFromKey = (key) => {
    if (!key) return '';
    const [y, m] = key.split('-');
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleString("en-GB", { month: "short", year: "numeric" });
  };
  const [selectedMonthKey, setSelectedMonthKey] = useState(() => dateKey(new Date().toISOString()));
  const [activeMonthLabel, setActiveMonthLabel] = useState(() => new Date().toLocaleString("en-GB", { month: "short", year: "numeric" }));
  const availableMonths = useMemo(() => {
    const set = new Set(trades.map(t => dateKey(t.date)).filter(Boolean));
    const arr = Array.from(set);
    arr.sort((a,b) => a.localeCompare(b));
    return arr.reverse();
  }, [trades]);
  const scopedTrades = useMemo(() => {
    if (analyticsScope === 'overall') return trades;
    // Prefer activeMonthLabel if set via click; fall back to selectedMonthKey
    const label = activeMonthLabel || monthLabelFromKey(selectedMonthKey);
    return trades.filter(t => new Date(t.date).toLocaleString("en-GB", { month: "short", year: "numeric" }) === label);
  }, [trades, analyticsScope, selectedMonthKey, activeMonthLabel]);
  const scopedTotals = useMemo(() => {
    const net = scopedTrades.reduce((sum, t) => sum + (t.meta?.net || 0), 0);
    const wins = scopedTrades.filter(t => (t.meta?.net || 0) > 0).length;
    const losses = scopedTrades.filter(t => (t.meta?.net || 0) <= 0).length;
    const winRate = scopedTrades.length ? Math.round((wins / scopedTrades.length) * 10000) / 100 : 0;
    const avg = scopedTrades.length ? Math.round((net / scopedTrades.length) * 100) / 100 : 0;
    return { net: Math.round(net * 100) / 100, wins, losses, winRate, avg, trades: scopedTrades.length };
  }, [scopedTrades]);

  // Scoped Setup Analytics
  const scopedSetupRows = useMemo(() => {
    const setupMap = scopedTrades.reduce((acc, t) => {
      const s = t.setup || "Unspecified";
      if (!acc[s]) acc[s] = { trades:0, wins:0, losses:0, net:0 };
      acc[s].trades++;
      const net = t.meta?.net || 0;
      if (net > 0) acc[s].wins++; else acc[s].losses++;
      acc[s].net += net;
      return acc;
    }, {});
    return Object.entries(setupMap).map(([s, v]) => ({
      setup: s,
      trades: v.trades,
      wins: v.wins,
      losses: v.losses,
      winRate: v.trades ? Math.round((v.wins/v.trades)*100*100)/100 : 0,
      avgNet: v.trades ? Math.round((v.net/v.trades)*100)/100 : 0
    }));
  }, [scopedTrades]);

  // Scoped Direction Analytics (Type + Trend combinations)
  const scopedDirectionRows = useMemo(() => {
    const directionMap = scopedTrades.reduce((acc, t) => {
      const combo = `${t.type || 'Long'}→${t.trend || 'Up'}`;
      if (!acc[combo]) acc[combo] = { trades:0, wins:0, losses:0, net:0 };
      acc[combo].trades++;
      const net = t.meta?.net || 0;
      if (net > 0) acc[combo].wins++; else acc[combo].losses++;
      acc[combo].net += net;
      return acc;
    }, {});
    return Object.entries(directionMap).map(([combo, v]) => ({
      combo,
      trades: v.trades,
      wins: v.wins,
      losses: v.losses,
      winRate: v.trades ? Math.round((v.wins/v.trades)*100*100)/100 : 0,
      avgNet: v.trades ? Math.round((v.net/v.trades)*100)/100 : 0
    }));
  }, [scopedTrades]);

  // Scoped Emotion Analytics
  const scopedEmotionRows = useMemo(() => {
    const emotionMap = scopedTrades.reduce((acc, t) => {
      const emotion = t.emotion || "Not Specified";
      if (!acc[emotion]) acc[emotion] = { trades:0, wins:0, losses:0, net:0 };
      acc[emotion].trades++;
      const net = t.meta?.net || 0;
      if (net > 0) acc[emotion].wins++; else acc[emotion].losses++;
      acc[emotion].net += net;
      return acc;
    }, {});
    return Object.entries(emotionMap).map(([emotion, v]) => ({
      emotion,
      trades: v.trades,
      wins: v.wins,
      losses: v.losses,
      winRate: v.trades ? Math.round((v.wins/v.trades)*100*100)/100 : 0,
      avgNet: v.trades ? Math.round((v.net/v.trades)*100)/100 : 0
    }));
  }, [scopedTrades]);

  const scopedMonthly = useMemo(() => {
    if (analyticsScope === 'overall') return monthRows;
    const label = activeMonthLabel || monthLabelFromKey(selectedMonthKey);
    return monthRows.filter(m => m.month === label);
  }, [monthRows, analyticsScope, selectedMonthKey, activeMonthLabel]);
  const scopedTradesSorted = useMemo(() => {
    return [...scopedTrades].sort((a,b) => new Date(a.date) - new Date(b.date));
  }, [scopedTrades]);
  // Scoped equity
  const scopedEquityLabels = scopedTradesSorted.map(t => t.date);
  let scopedCum = 0;
  const scopedEquityDataPoints = scopedTradesSorted.map(t => {
    scopedCum += (t.meta?.net || 0);
    return Math.round(scopedCum * 100) / 100;
  });
  const scopedEquityChart = {
    labels: scopedEquityLabels,
    datasets: [
      { label: "Equity Curve (Net P&L)", data: scopedEquityDataPoints, tension: 0.25, borderColor: "#0ea5e9", backgroundColor: "rgba(14,165,233,0.15)", fill: true }
    ]
  };
  // Sparkline for last 10 trades
  const last10 = tradesSorted.slice(-10);
  let s = 0;
  const spark = last10.map(t => { s += (t.meta?.net || 0); return Math.round(s*100)/100; });
  const periodLabel = analyticsScope === 'overall' ? 'Showing: Overall' : `Showing: ${activeMonthLabel || monthLabelFromKey(selectedMonthKey)}`;
  const periodControls = (
    <div className="flex items-center gap-2">
      <button className={"btn btn-secondary " + (analyticsScope==='overall'?'!bg-sky-600 !text-white':'')} onClick={(e)=>{e.preventDefault(); setAnalyticsScope('overall');}}>Overall</button>
      {/* Select month via clicking Monthly Summary rows or Monthly P&L bars */}
    </div>
  );
  const onSelectMonth = (label) => {
    setAnalyticsScope('month');
    setActiveMonthLabel(label);
  };
  const formatCurrency = (n) => (typeof n === "number" ? `₹ ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : n);

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
    return trades.filter(t => {
      const matchesText = !q || (t.symbol || '').toLowerCase().includes(q) || (t.setup || '').toLowerCase().includes(q) || (t.type || '').toLowerCase().includes(q) || (t.remarks || '').toLowerCase().includes(q) || (t.date || '').toLowerCase().includes(q);
      const net = t.meta?.net || 0;
      const matchesStatus = filterStatus === 'all' || (filterStatus === 'wins' && net > 0) || (filterStatus === 'losses' && net <= 0);
      const d = (t.date || '');
      const matchesFrom = !fromDate || d >= fromDate;
      const matchesTo = !toDate || d <= toDate;
      return matchesText && matchesStatus && matchesFrom && matchesTo;
    });
  }, [trades, filterText, filterStatus, fromDate, toDate]);

  // Pagination calculations
  const totalTrades = filteredTrades.length;
  const totalPages = Math.ceil(totalTrades / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const visibleTrades = useMemo(() => {
    const arr = [...filteredTrades];
    const get = (t) => {
      switch (sortKey) {
        case 'date': return t.date || '';
        case 'symbol': return (t.symbol || '').toLowerCase();
        case 'type': return (t.type || '').toLowerCase();
        case 'trend': return (t.trend || '').toLowerCase();
        case 'rule': return (t.rule || '').toLowerCase();
        case 'qty': return Number(t.qty) || 0;
        case 'buy': return Number(t.buy) || 0;
        case 'sell': return Number(t.sell) || 0;
        case 'net': return Number(t.meta?.net) || 0;
        case 'riskReward': return (t.riskReward || '').toLowerCase();
        default: return '';
      }
    };
    arr.sort((a,b) => {
      const va = get(a), vb = get(b);
      if (typeof va === 'number' && typeof vb === 'number') return sortDir === 'asc' ? va - vb : vb - va;
      // string compare
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    // Apply pagination
    return arr.slice(startIndex, endIndex);
  }, [filteredTrades, sortKey, sortDir, startIndex, endIndex]);

  const onSortChange = (key) => {
    setSortKey(prev => {
      if (prev === key) {
        setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortDir('asc');
      return key;
    });
  };

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterText, filterStatus, fromDate, toDate]);

  // Close export menu when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (showExportMenu && !event.target.closest('.relative')) {
        setShowExportMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="nav">
          <div className="text-xs uppercase tracking-wider text-slate-500 px-3 mb-2">Navigation</div>
          <button className="nav-btn active">Dashboard</button>
          <button className="nav-btn">Reports</button>
          <button className="nav-btn">Settings</button>
        </div>
      </aside>

      {/* Main */}
      <div className="grid grid-rows-[auto_1fr]">
        {/* Header */}
        <header className="header">
          <div className="container-wrap flex flex-col sm:flex-row items-start sm:items-center justify-between min-h-14 py-2 gap-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <IconCandle className="w-5 h-5 text-sky-600"/>
                <span className="text-lg font-semibold">Trading Journal</span>
                <span className="badge badge-green">v1</span>
              </div>
              
              {/* Cooldown Timer */}
              <CooldownTimer />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setIsCompact(v => !v)} type="button" className="btn btn-secondary hidden sm:inline-flex" title="Toggle density">{isCompact ? 'Comfortable' : 'Compact'}</button>
              <button onClick={() => setIsDark(v => !v)} type="button" className="btn btn-secondary" title="Toggle dark mode">{isDark ? <IconSun/> : <IconMoon/>}</button>
              <div className="relative">
                <button 
                  onClick={() => setShowExportMenu(v => !v)} 
                  type="button" 
                  className="btn btn-secondary flex items-center gap-1"
                >
                  <IconDownload/> 
                  <span className="hidden sm:inline">Export</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
                    <div className="py-1">
                      <button 
                        onClick={() => { exportExcel(); setShowExportMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Excel Only
                        <span className="text-xs text-slate-500 ml-auto">Fast</span>
                      </button>
                      <button 
                        onClick={() => { exportZip(); setShowExportMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        ZIP with Screenshots
                        <span className="text-xs text-slate-500 ml-auto">Complete</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => { localStorage.removeItem(STORAGE_KEY); setTrades([]); }} type="button" className="btn btn-danger"><IconReset/> <span className="hidden sm:inline">Reset</span></button>
        </div>
        </div>
        </header>
        <div className="container-wrap pt-4">
          <div className="rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 border border-slate-200 dark:border-slate-700 p-4 mb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Welcome back</div>
                <div className="text-xl font-semibold">Your trading performance at a glance</div>
        </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="px-3 py-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"><span className="text-slate-500">Win Rate</span> <span className="ml-2 font-semibold">{totals.winRate}%</span></div>
                <div className="px-3 py-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                  <span className="text-slate-500">Total Net</span>
                  <span className={"ml-2 font-semibold " + (totals.net>=0?'text-green-700':'text-red-700')}>{formatNumber(totals.net)}</span>
                  <div className="mt-1 h-6">
                    <Line data={{ labels: spark.map((_,i)=>i+1), datasets:[{ data:spark, borderColor: totals.net>=0?'#16a34a':'#dc2626', backgroundColor:'transparent', tension:0.3, pointRadius:0, borderWidth:1.5 }] }} options={{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}, tooltip:{enabled:false}}, scales:{ x:{display:false}, y:{display:false} } }} />
        </div>
        </div>
                <div className="px-3 py-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"><span className="text-slate-500">Trades</span> <span className="ml-2 font-semibold">{totals.trades}</span></div>
        </div>
        </div>
        </div>
        </div>

        <main className="content">
          <div className="container-wrap">
            <Tabs
          analyticsComponent={
            <AnalyticsTab
              totals={scopedTotals}
              monthRows={scopedMonthly}
              allMonthRows={monthRows}
              activeMonthLabel={activeMonthLabel}
              setupRows={scopedSetupRows}
              directionRows={scopedDirectionRows}
              emotionRows={scopedEmotionRows}
              monthlyChart={monthlyChart}
              equityChart={scopedEquityChart}
              commonChartOptions={commonChartOptions}
              formatNumber={formatNumber}
              periodLabel={periodLabel}
              periodControls={periodControls}
              onSelectMonth={onSelectMonth}
            />
          }
          tradesComponent={
            <TradesTab
              form={form}
              setForm={setForm}
              addOrUpdateTrade={addOrUpdateTrade}
              importExcel={importExcel}
              importZip={importZip}
              chargesPreview={chargesPreview}
              formatNumber={formatNumber}
              formatCurrency={formatCurrency}
              visibleTrades={visibleTrades}
              editTrade={editTrade}
              duplicateTrade={duplicateTrade}
              deleteTrade={deleteTrade}
              filterText={filterText}
              setFilterText={setFilterText}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              fromDate={fromDate}
              setFromDate={setFromDate}
              toDate={toDate}
              setToDate={setToDate}
              sortKey={sortKey}
              sortDir={sortDir}
              onSortChange={onSortChange}
              currentPage={currentPage}
              totalPages={totalPages}
              totalTrades={totalTrades}
              pageSize={pageSize}
              setPageSize={setPageSize}
              goToPage={goToPage}
              goToFirstPage={goToFirstPage}
              goToLastPage={goToLastPage}
              goToPrevPage={goToPrevPage}
              goToNextPage={goToNextPage}
            />
          }
          rulesComponent={
            <TradingRulesTab />
          }
            />
        </div>
        </main>
      </div>
        </div>
  );
}

function Tabs({ analyticsComponent, tradesComponent, rulesComponent }) {
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
        <button onClick={() => setActive('rules')} className={(active === 'rules' ? 'bg-sky-600 text-white shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200') + ' rounded-lg px-3 py-1.5 text-sm font-medium transition-colors'}>
          Trading Rules
        </button>
      </div>
      {active === 'trades' ? tradesComponent : active === 'analytics' ? analyticsComponent : rulesComponent}
    </div>
  );
}
