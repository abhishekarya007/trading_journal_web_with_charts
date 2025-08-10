import React, { useState, useEffect, useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import { 
  IconTrendingUp, 
  IconTrendingDown, 
  IconDownload, 
  IconUpload, 
  IconCalendar,
  IconDollarSign,
  IconTarget,
  IconChartBar,
  IconStar,
  IconFire,
  IconZap,
  IconRocket,
  IconTrophy,
  IconPlus,
  IconX,
  IconChevronUp,
  IconChevronDown
} from './icons';

const GrowthCalculatorTab = ({ trades, formatNumber, formatCurrency }) => {
  const [growthData, setGrowthData] = useState([]);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  // Generate dummy data for August
  const generateDummyData = () => {
    const dummyData = [
      {
        id: 1,
        year: 2024,
        month: 'August',
        monthNum: 8,
        date: '2024-08-01',
        initialCapital: 20000,
        pnl: 2500,
        finalCapital: 22500,
        growthPercentage: 12.5,
        trades: 15,
        wins: 10,
        losses: 5,
        winRate: 66.67
      },
      {
        id: 2,
        year: 2024,
        month: 'July',
        monthNum: 7,
        date: '2024-07-01',
        initialCapital: 18000,
        pnl: 2000,
        finalCapital: 20000,
        growthPercentage: 11.11,
        trades: 12,
        wins: 8,
        losses: 4,
        winRate: 66.67
      },
      {
        id: 3,
        year: 2024,
        month: 'June',
        monthNum: 6,
        date: '2024-06-01',
        initialCapital: 16000,
        pnl: 2000,
        finalCapital: 18000,
        growthPercentage: 12.5,
        trades: 18,
        wins: 12,
        losses: 6,
        winRate: 66.67
      }
    ];
    setGrowthData(dummyData);
  };

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('growth_calculator_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGrowthData(parsed.data || []);
      } catch (e) {
        generateDummyData();
      }
    } else {
      generateDummyData();
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('growth_calculator_data', JSON.stringify({
      data: growthData
    }));
  }, [growthData]);

  // Sort data
  const sortedData = useMemo(() => {
    const arr = [...growthData];
    const get = (item) => {
      switch (sortKey) {
        case 'date': return new Date(item.date);
        case 'year': return item.year;
        case 'month': return item.monthNum;
        case 'pnl': return item.pnl;
        case 'growthPercentage': return item.growthPercentage;
        case 'trades': return item.trades;
        case 'winRate': return item.winRate;
        default: return item.date;
      }
    };
    
    arr.sort((a, b) => {
      const va = get(a), vb = get(b);
      if (sortKey === 'date') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    
    return arr;
  }, [growthData, sortKey, sortDir]);

  // Chart data
  const chartData = useMemo(() => {
    const labels = sortedData.map(item => `${item.month} ${item.year}`);
    const capitalUsedData = sortedData.map(item => item.initialCapital);
    const growthPercentageData = sortedData.map(item => item.growthPercentage);

    return {
      capitalUsed: {
        labels,
        datasets: [{
          label: 'Capital Used',
          data: capitalUsedData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      growthPercentage: {
        labels,
        datasets: [{
          label: 'Growth %',
          data: growthPercentageData,
          backgroundColor: growthPercentageData.map(value => value >= 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'),
          borderColor: growthPercentageData.map(value => value >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'),
          borderWidth: 1
        }]
      }
    };
  }, [sortedData]);

  // Export functionality
  const exportExcel = () => {
    const wsData = [
      ['Year', 'Month', 'Capital']
    ];
    
    sortedData.forEach(item => {
      wsData.push([
        item.year,
        item.month,
        item.initialCapital
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Growth Data');
    XLSX.writeFile(wb, 'growth_calculator_data.xlsx');
  };

  // Import functionality
  const importExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Skip header row and process data
        const importedData = jsonData.slice(1).map((row, index) => {
          const year = parseInt(row[0]) || 2024;
          const monthInput = row[1] || 'Unknown';
          const capital = parseFloat(row[2]) || 0;
          
          // Parse month input (could be name, abbreviation, or number)
          let monthNum = 1;
          let monthName = 'January';
          
          if (typeof monthInput === 'number') {
            monthNum = monthInput;
            monthName = new Date(2024, monthInput - 1).toLocaleDateString('en-US', { month: 'long' });
          } else if (typeof monthInput === 'string') {
            const monthStr = monthInput.toLowerCase().trim();
            
            // Try to parse month name or abbreviation
            const monthMap = {
              'jan': 1, 'january': 1,
              'feb': 2, 'february': 2,
              'mar': 3, 'march': 3,
              'apr': 4, 'april': 4,
              'may': 5,
              'jun': 6, 'june': 6,
              'jul': 7, 'july': 7,
              'aug': 8, 'august': 8,
              'sep': 9, 'september': 9,
              'oct': 10, 'october': 10,
              'nov': 11, 'november': 11,
              'dec': 12, 'december': 12
            };
            
            if (monthMap[monthStr]) {
              monthNum = monthMap[monthStr];
              monthName = new Date(2024, monthNum - 1).toLocaleDateString('en-US', { month: 'long' });
            } else {
              // Try to parse as number
              const parsedNum = parseInt(monthStr);
              if (parsedNum >= 1 && parsedNum <= 12) {
                monthNum = parsedNum;
                monthName = new Date(2024, monthNum - 1).toLocaleDateString('en-US', { month: 'long' });
              }
            }
          }
          
          return {
            id: index + 1,
            year,
            month: monthName,
            monthNum,
            date: `${year}-${monthNum.toString().padStart(2, '0')}-01`,
            initialCapital: capital,
            pnl: 0, // Will be calculated from trades
            finalCapital: capital, // Will be calculated
            growthPercentage: 0, // Will be calculated
            trades: 0, // Will be calculated from trades
            wins: 0, // Will be calculated from trades
            losses: 0, // Will be calculated from trades
            winRate: 0 // Will be calculated from trades
          };
        });

        // Calculate missing data from trades
        const enrichedData = calculateMissingDataFromTrades(importedData);
        setGrowthData(enrichedData);
        setShowImportMenu(false);
      } catch (error) {
        console.error('Error importing Excel file:', error);
        alert('Error importing file. Please check the format. Expected columns: Year, Month, Capital');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Calculate missing data from trades for imported Excel data
  const calculateMissingDataFromTrades = (importedData) => {
    if (!trades || trades.length === 0) {
      // If no trades data, return imported data as is
      return importedData;
    }

    // Group trades by month
    const monthlyTrades = {};
    trades.forEach(trade => {
      const date = new Date(trade.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthName = date.toLocaleDateString('en-US', { month: 'long' });
      const key = `${year}-${month}`;
      
      if (!monthlyTrades[key]) {
        monthlyTrades[key] = {
          year,
          month: monthName,
          monthNum: month,
          trades: [],
          pnl: 0,
          wins: 0,
          losses: 0
        };
      }
      
      const netPnl = trade.meta?.net || 0;
      monthlyTrades[key].trades.push(trade);
      monthlyTrades[key].pnl += netPnl;
      
      if (netPnl > 0) {
        monthlyTrades[key].wins++;
      } else if (netPnl < 0) {
        monthlyTrades[key].losses++;
      }
    });

    // Enrich imported data with trades data
    const enrichedData = importedData.map(item => {
      const key = `${item.year}-${item.monthNum}`;
      const tradeData = monthlyTrades[key];
      
      if (tradeData) {
        // Month has trades data
        return {
          ...item,
          pnl: tradeData.pnl,
          finalCapital: item.initialCapital + tradeData.pnl,
          growthPercentage: item.initialCapital > 0 ? (tradeData.pnl / item.initialCapital) * 100 : 0,
          trades: tradeData.trades.length,
          wins: tradeData.wins,
          losses: tradeData.losses,
          winRate: tradeData.trades.length > 0 ? (tradeData.wins / tradeData.trades.length) * 100 : 0
        };
      } else {
        // Month has no trades data - keep as imported
        return {
          ...item,
          pnl: 0,
          finalCapital: item.initialCapital,
          growthPercentage: 0,
          trades: 0,
          wins: 0,
          losses: 0,
          winRate: 0
        };
      }
    });

    // Add any months that have trades but weren't in the Excel import
    const importedKeys = new Set(importedData.map(item => `${item.year}-${item.monthNum}`));
    const missingMonths = Object.keys(monthlyTrades).filter(key => !importedKeys.has(key));
    
    missingMonths.forEach(key => {
      const tradeData = monthlyTrades[key];
      const [year, month] = key.split('-');
      const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long' });
      
      // Find the previous month's final capital or use initial capital
      const previousMonth = enrichedData.find(item => 
        item.year === parseInt(year) && item.monthNum === parseInt(month) - 1
      ) || enrichedData.find(item => 
        item.year === parseInt(year) - 1 && item.monthNum === 12
      );
      
      const initialCapital = previousMonth ? previousMonth.finalCapital : 20000; // Default to 20000 if no previous month
      
      enrichedData.push({
        id: enrichedData.length + 1,
        year: parseInt(year),
        month: monthName,
        monthNum: parseInt(month),
        date: `${year}-${month.padStart(2, '0')}-01`,
        initialCapital,
        pnl: tradeData.pnl,
        finalCapital: initialCapital + tradeData.pnl,
        growthPercentage: initialCapital > 0 ? (tradeData.pnl / initialCapital) * 100 : 0,
        trades: tradeData.trades.length,
        wins: tradeData.wins,
        losses: tradeData.losses,
        winRate: tradeData.trades.length > 0 ? (tradeData.wins / tradeData.trades.length) * 100 : 0
      });
    });

    // Sort by date
    return enrichedData.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Sort handlers
  const handleSort = (key) => {
    setSortKey(prev => {
      if (prev === key) {
        setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortDir('asc');
      return key;
    });
  };

  const getSortIcon = (columnKey) => {
    if (sortKey !== columnKey) {
      return <IconChevronUp className="w-4 h-4 text-slate-400" />;
    }
    return sortDir === 'asc' 
      ? <IconChevronUp className="w-4 h-4 text-blue-500" />
      : <IconChevronDown className="w-4 h-4 text-blue-500" />;
  };

  const getSortTooltip = (columnKey) => {
    if (sortKey !== columnKey) {
      return `Sort by ${columnKey === 'initialCapital' ? 'Capital Used' : columnKey}`;
    }
    return sortDir === 'asc' 
      ? `Sorted by ${columnKey === 'initialCapital' ? 'Capital Used' : columnKey} (ascending) - Click to sort descending`
      : `Sorted by ${columnKey === 'initialCapital' ? 'Capital Used' : columnKey} (descending) - Click to sort ascending`;
  };

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    if (sortedData.length === 0) return null;

    const totalPnL = sortedData.reduce((sum, item) => sum + item.pnl, 0);
    const totalGrowth = ((sortedData[sortedData.length - 1]?.finalCapital || 20000) - 20000) / 20000 * 100;
    const avgMonthlyGrowth = sortedData.reduce((sum, item) => sum + item.growthPercentage, 0) / sortedData.length;
    const totalTrades = sortedData.reduce((sum, item) => sum + item.trades, 0);
    const avgWinRate = sortedData.reduce((sum, item) => sum + item.winRate, 0) / sortedData.length;

    return {
      totalPnL,
      totalGrowth,
      avgMonthlyGrowth,
      totalTrades,
      avgWinRate,
      finalCapital: sortedData[sortedData.length - 1]?.finalCapital || 20000
    };
  }, [sortedData]);

  return (
    <div className="space-y-6 p-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12 animate-bounce"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <IconChartBar className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Growth Calculator</h1>
              <p className="text-indigo-100">Track your capital growth journey over time</p>
            </div>
          </div>

          {/* Summary Cards */}
          {summaryMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <IconDollarSign className="w-6 h-6 text-emerald-300" />
                  <div>
                    <div className="text-2xl font-bold">{formatCurrency(summaryMetrics.finalCapital)}</div>
                    <div className="text-indigo-100 text-sm">Final Capital</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <IconTarget className="w-6 h-6 text-blue-300" />
                  <div>
                    <div className="text-2xl font-bold">{formatCurrency(sortedData[sortedData.length - 1]?.initialCapital || 20000)}</div>
                    <div className="text-indigo-100 text-sm">Latest Capital Used</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <IconTrendingUp className="w-6 h-6 text-yellow-300" />
                  <div>
                    <div className="text-2xl font-bold">{formatNumber(summaryMetrics.totalGrowth)}%</div>
                    <div className="text-indigo-100 text-sm">Total Growth</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <IconTrophy className="w-6 h-6 text-purple-300" />
                  <div>
                    <div className="text-2xl font-bold">{summaryMetrics.totalTrades}</div>
                    <div className="text-indigo-100 text-sm">Total Trades</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Growth Data Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Growth Data</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Detailed monthly breakdown</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Import Button */}
              <div className="relative">
                <button
                  onClick={() => setShowImportMenu(!showImportMenu)}
                  className="btn btn-secondary flex items-center gap-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-500 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <IconUpload className="w-4 h-4" />
                  <span>Import</span>
                </button>

                {showImportMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                    <div className="p-2">
                      <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <IconDownload className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-900 dark:text-white">Import Excel</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Year, Month, Capital format</div>
                        </div>
                        <input 
                          accept=".xlsx, .xls" 
                          type="file" 
                          onChange={e => { 
                            if (e.target.files?.[0]) { 
                              importExcel(e.target.files[0]); 
                              e.target.value = ''; 
                            } 
                          }} 
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Export Button */}
              <button
                onClick={exportExcel}
                className="btn btn-primary flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-3 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
              >
                <IconDownload className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('date')}
                    className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200"
                    title={getSortTooltip('date')}
                  >
                    <span>Period</span>
                    {getSortIcon('date')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('initialCapital')}
                    className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200"
                    title={getSortTooltip('initialCapital')}
                  >
                    <span>Capital Used</span>
                    {getSortIcon('initialCapital')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('pnl')}
                    className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200"
                    title={getSortTooltip('pnl')}
                  >
                    <span>P&L</span>
                    {getSortIcon('pnl')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('finalCapital')}
                    className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200"
                    title={getSortTooltip('finalCapital')}
                  >
                    <span>Final Capital</span>
                    {getSortIcon('finalCapital')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('growthPercentage')}
                    className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200"
                    title={getSortTooltip('growthPercentage')}
                  >
                    <span>Growth %</span>
                    {getSortIcon('growthPercentage')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('trades')}
                    className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200"
                    title={getSortTooltip('trades')}
                  >
                    <span>Trades</span>
                    {getSortIcon('trades')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('winRate')}
                    className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200"
                    title={getSortTooltip('winRate')}
                  >
                    <span>Win Rate</span>
                    {getSortIcon('winRate')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {sortedData.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-300">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{item.month} {item.year}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-600 dark:text-slate-400">{formatCurrency(item.initialCapital)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`font-semibold ${item.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(item.pnl)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{formatCurrency(item.finalCapital)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`font-semibold ${item.growthPercentage >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatNumber(item.growthPercentage)}%
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-600 dark:text-slate-400">{item.trades}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-600 dark:text-slate-400">{formatNumber(item.winRate)}%</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Capital Used Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Capital Used Over Time</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Track your capital utilization</p>
          </div>
          <div className="p-6">
            {sortedData.length > 0 ? (
              <Line 
                data={chartData.capitalUsed}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return formatCurrency(value);
                        }
                      }
                    }
                  }
                }}
              />
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <IconChartBar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Growth Percentage Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Monthly Growth %</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Percentage growth or loss by month</p>
          </div>
          <div className="p-6">
            {sortedData.length > 0 ? (
              <Bar 
                data={chartData.growthPercentage}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      ticks: {
                        callback: function(value) {
                          return formatNumber(value) + '%';
                        }
                      }
                    }
                  }
                }}
              />
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <IconChartBar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrowthCalculatorTab;
