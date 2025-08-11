import React, { useState, useEffect, useMemo } from 'react';
import ScreenshotManager from './ScreenshotManager';
import { 
  IconTrendingUp, 
  IconTrendingDown, 
  IconPlus, 
  IconSearch, 
  IconFilter, 
  IconCalendar,
  IconRupee,
  IconTarget,
  IconChartBar,
  IconStar,
  IconFire,
  IconZap,
  IconRocket,
  IconTrophy,
  IconTrendingUp as IconProfit,
  IconTrendingDown as IconLoss,
  IconEye,
  IconEdit,
  IconCopy,
  IconTrash,
  IconDownload,
  IconUpload,
  IconRefresh,
  IconCheck,
  IconX,
  IconChevronUp,
  IconChevronDown
} from './icons';

const TradesTab = ({ 
  form, setForm, addOrUpdateTrade, importExcel, importZip, chargesPreview, 
  formatNumber, formatCurrency, visibleTrades, editTrade, duplicateTrade, 
  deleteTrade, filterText, setFilterText, filterStatus, setFilterStatus, 
  fromDate, setFromDate, toDate, setToDate, sortKey, sortDir, onSortChange, 
  setCurrentFilteredTrades 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [tradesPerPage] = useState(10);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);


  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showModal) {
          setShowModal(false);
          setEditingId(null);
        }
        if (showDetailModal) {
          setShowDetailModal(false);
          setSelectedTrade(null);
        }
        if (showScreenshotModal) {
          setShowScreenshotModal(false);
          setSelectedScreenshot(null);
        }
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'n') {
          e.preventDefault();
          setForm({ id: Date.now() + Math.random(), date: new Date().toISOString().slice(0,10), symbol: "", type: "Long", qty: "", buy: "", sell: "", trend: "Up", rule: "Yes", emotion: "", riskReward: "", setup: "", remarks: "", screenshots: [] });
          setEditingId(null);
          setShowModal(true);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showModal, showDetailModal, setForm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    addOrUpdateTrade(e);
    setShowModal(false);
    setEditingId(null);
  };

  const handleEdit = (trade) => {
    setForm(trade);
    setEditingId(trade.id);
    setShowModal(true);
  };

  const handleDuplicate = (trade) => {
    const duplicatedTrade = { ...trade, id: Date.now() + Math.random() };
    setForm(duplicatedTrade);
    setEditingId(null);
    setShowModal(true);
  };

  const handleTradeDetail = (trade) => {
    setSelectedTrade(trade);
    setShowDetailModal(true);
  };

  const handleScreenshotPreview = (screenshot, index) => {
    setSelectedScreenshot({ url: screenshot, index: index + 1 });
    setShowScreenshotModal(true);
  };

  const getTradeStatusColor = (net) => {
    if (net > 0) return 'bg-gradient-to-r from-emerald-500 to-green-500';
    if (net < 0) return 'bg-gradient-to-r from-red-500 to-pink-500';
    return 'bg-gradient-to-r from-slate-500 to-gray-500';
  };

  const getTradeStatusIcon = (net) => {
    if (net > 0) return <IconTrophy className="w-4 h-4" />;
    if (net < 0) return <IconFire className="w-4 h-4" />;
    return <IconTarget className="w-4 h-4" />;
  };

  const getTradeTypeColor = (type) => {
    return type === 'Long' 
      ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
      : 'bg-gradient-to-r from-red-500 to-pink-500';
  };

  const getTradeTypeIcon = (type) => {
    return type === 'Long' 
      ? <IconTrendingUp className="w-4 h-4" />
      : <IconTrendingDown className="w-4 h-4" />;
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
      return `Sort by ${columnKey}`;
    }
    return sortDir === 'asc' 
      ? `Sorted by ${columnKey} (ascending) - Click to sort descending`
      : `Sorted by ${columnKey} (descending) - Click to sort ascending`;
  };

  const handleSort = (key) => {
    onSortChange(key);
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Use visible trades (already sorted from App.jsx)
  const tableTrades = visibleTrades;

  // Pagination logic
  const totalPages = Math.ceil(tableTrades.length / tradesPerPage);
  const startIndex = (currentPage - 1) * tradesPerPage;
  const endIndex = startIndex + tradesPerPage;
  const paginatedTrades = tableTrades.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterText, filterStatus, fromDate, toDate, sortKey, sortDir]);

  // Update the current filtered trades for export
  useEffect(() => {
    setCurrentFilteredTrades(tableTrades);
  }, [tableTrades]);
  
  // Calculate latest month data for hero header (independent of table filters)
  const latestMonthData = useMemo(() => {
    if (visibleTrades.length === 0) return { month: null, year: null, trades: [], wins: 0, losses: 0, winRate: 0, pnl: 0 };
    
    // Find the latest month from all trades
    const latestTrade = visibleTrades.reduce((latest, trade) => {
      const tradeDate = new Date(trade.date);
      const latestDate = new Date(latest.date);
      return tradeDate > latestDate ? trade : latest;
    });
    
    const latestDate = new Date(latestTrade.date);
    const latestMonth = latestDate.getMonth();
    const latestYear = latestDate.getFullYear();
    
    // Filter trades for the latest month
    const latestMonthTrades = visibleTrades.filter(trade => {
      const tradeDate = new Date(trade.date);
      return tradeDate.getMonth() === latestMonth && tradeDate.getFullYear() === latestYear;
    });
    
    const wins = latestMonthTrades.filter(t => (t.meta?.net || 0) > 0).length;
    const losses = latestMonthTrades.filter(t => (t.meta?.net || 0) < 0).length;
    const winRate = latestMonthTrades.length > 0 ? Math.round((wins / latestMonthTrades.length) * 100) : 0;
    const pnl = latestMonthTrades.reduce((sum, t) => sum + (t.meta?.net || 0), 0);
    
    return {
      month: latestMonth,
      year: latestYear,
      trades: latestMonthTrades,
      wins,
      losses,
      winRate,
      pnl
    };
  }, [visibleTrades]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];

  // Table data (can be filtered by search/status)
  const selectedMonthWins = tableTrades.filter(t => (t.meta?.net || 0) > 0).length;
  const selectedMonthLosses = tableTrades.filter(t => (t.meta?.net || 0) < 0).length;
  const selectedMonthWinRate = tableTrades.length > 0 ? Math.round((selectedMonthWins / tableTrades.length) * 100) : 0;
  const selectedMonthPnL = tableTrades.reduce((sum, t) => sum + (t.meta?.net || 0), 0);



  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white animate-pulse">
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
              <h1 className="text-3xl font-bold mb-2">
                {latestMonthData.month !== null ? `${monthNames[latestMonthData.month]} ${latestMonthData.year} Performance` : 'Overall Performance'}
              </h1>
              <p className="text-blue-100 text-lg">
                {latestMonthData.month !== null ? 'Latest month trading statistics and insights' : 'Complete trading statistics and insights'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center animate-pulse">
                  <IconRocket className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold animate-pulse">{latestMonthData.trades.length}</div>
                  <div className="text-blue-100 text-sm">Latest Month Trades</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center animate-bounce">
                  <IconProfit className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold animate-pulse">
                    {latestMonthData.wins}
                  </div>
                  <div className="text-blue-100 text-sm">Latest Month Wins</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center animate-pulse">
                  <IconZap className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold animate-pulse">
                    {latestMonthData.winRate}%
                  </div>
                  <div className="text-blue-100 text-sm">Latest Month Win Rate</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center animate-spin">
                  <IconRupee className="w-5 h-5 text-orange-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold animate-pulse">
                    {formatNumber(latestMonthData.pnl)}
                  </div>
                  <div className="text-blue-100 text-sm">Latest Month P&L</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setForm({ id: Date.now() + Math.random(), date: new Date().toISOString().slice(0,10), symbol: "", type: "Long", qty: "", buy: "", sell: "", trend: "Up", rule: "Yes", emotion: "", riskReward: "", setup: "", remarks: "", screenshots: [] }); setEditingId(null); setShowModal(true); }}
              className="btn btn-primary flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              title="Add New Trade (Ctrl+N)"
            >
              <IconPlus className="w-5 h-5" />
              <span>Add New Trade</span>
              <span className="text-xs opacity-75">Ctrl+N</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowImportMenu(!showImportMenu)}
                className="btn btn-secondary flex items-center gap-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-500 text-slate-700 dark:text-slate-200 px-4 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300"
              >
                <IconUpload className="w-4 h-4" />
                <span>Import</span>
                <IconTrendingDown className="w-4 h-4" />
              </button>



              {showImportMenu && (
                <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                  <div className="p-2">
                    <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <IconDownload className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 dark:text-white">Excel Only</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Data only</div>
                      </div>
                      <input 
                        accept=".xlsx, .xls" 
                        type="file" 
                        onChange={e => { 
                          if (e.target.files?.[0]) { 
                            importExcel(e.target.files[0]); 
                            setShowImportMenu(false); 
                            e.target.value = ''; 
                          } 
                        }} 
                        className="hidden"
                      />
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <IconDownload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 dark:text-white">ZIP with Screenshots</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Complete backup</div>
                      </div>
                      <input 
                        accept=".zip" 
                        type="file" 
                        onChange={e => { 
                          if (e.target.files?.[0]) { 
                            importZip(e.target.files[0]); 
                            setShowImportMenu(false); 
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
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">


            {/* Search and Status Filters Group */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search trades..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                {['all', 'wins', 'losses'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      filterStatus === status
                        ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {status === 'all' ? 'All' : status === 'wins' ? 'Wins' : 'Losses'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Trade Log */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Trade Log</h2>
            {tableTrades.length > 0 && (
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Showing {startIndex + 1}-{Math.min(endIndex, tableTrades.length)} of {tableTrades.length} trades
              </span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('date')}
                    className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200"
                    title={getSortTooltip('date')}
                  >
                    <span>Date</span>
                    {getSortIcon('date')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('symbol')}
                    className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200"
                    title={getSortTooltip('symbol')}
                  >
                    <span>Symbol</span>
                    {getSortIcon('symbol')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('type')}
                    className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200"
                    title={getSortTooltip('type')}
                  >
                    <span>Type</span>
                    {getSortIcon('type')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('qty')}
                    className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200"
                    title={getSortTooltip('qty')}
                  >
                    <span>Qty</span>
                    {getSortIcon('qty')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('net')}
                    className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200"
                    title={getSortTooltip('net')}
                  >
                    <span>Performance</span>
                    {getSortIcon('net')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <span>Analysis</span>
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <span>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {paginatedTrades.map((trade, index) => (
                <tr 
                  key={trade.id} 
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-lg cursor-pointer" 
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => handleTradeDetail(trade)}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {new Date(trade.date).toLocaleDateString()}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{trade.symbol || 'Unknown'}</div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-white ${getTradeTypeColor(trade.type)}`}>
                      {getTradeTypeIcon(trade.type)}
                      {trade.type}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {trade.qty}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className={`text-lg font-bold ${(trade.meta?.net || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        ₹{formatNumber(trade.meta?.net || 0)}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Buy: ₹{trade.buy} | Sell: ₹{trade.sell}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {trade.setup && (
                        <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-lg">
                          {trade.setup}
                        </span>
                      )}
                      {trade.trend && (
                        <span className="inline-block px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs rounded-lg ml-1">
                          {trade.trend}
                        </span>
                      )}
                      {trade.screenshots && trade.screenshots.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                          <IconEye className="w-3 h-3" />
                          {trade.screenshots.length} screenshot{trade.screenshots.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(trade); }}
                        className="p-2 text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 rounded-lg transition-all duration-300 transform hover:scale-110"
                        title="Edit trade"
                      >
                        <IconEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDuplicate(trade); }}
                        className="p-2 text-green-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 dark:hover:from-green-900/30 dark:hover:to-green-800/30 rounded-lg transition-all duration-300 transform hover:scale-110"
                        title="Duplicate trade"
                      >
                        <IconCopy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteTrade(trade.id); }}
                        className="p-2 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/30 dark:hover:to-red-800/30 rounded-lg transition-all duration-300 transform hover:scale-110"
                        title="Delete trade"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {tableTrades.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Page {currentPage} of {totalPages}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Previous Page Button */}
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                    currentPage === 1
                      ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700'
                  }`}
                  title="Previous page"
                >
                  <IconChevronUp className="w-4 h-4 transform rotate-90" />
                </button>

                {/* Page Numbers */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Next Page Button */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                    currentPage === totalPages
                      ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700'
                  }`}
                  title="Next page"
                >
                  <IconChevronUp className="w-4 h-4 transform -rotate-90" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No Trades Message */}
        {tableTrades.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconChartBar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No trades found</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              No trades found in your trading journal
            </p>
            <button
              onClick={() => {
                setFilterText('');
                setFilterStatus('all');
              }}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all duration-300"
            >
              Clear Filters
            </button>
          </div>
        )}

        
      </div>

      {/* Add/Edit Trade Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => { setShowModal(false); setEditingId(null); }}
        >
          <div 
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-slate-800 p-6 border-b border-slate-200 dark:border-slate-700 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {editingId ? 'Edit Trade' : 'Add New Trade'}
                </h2>
                <button
                  onClick={() => { setShowModal(false); setEditingId(null); }}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors"
                  title="Close (Esc)"
                >
                  <IconX className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Trade Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({...form, date: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Symbol
                  </label>
                  <input
                    type="text"
                    value={form.symbol}
                    onChange={(e) => setForm({...form, symbol: e.target.value})}
                    placeholder="e.g., RELIANCE, TCS"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Trade Type and Quantity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Trade Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({...form, type: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="Long">Long</option>
                    <option value="Short">Short</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={form.qty}
                    onChange={(e) => setForm({...form, qty: e.target.value})}
                    placeholder="Number of shares"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Risk to Reward
                  </label>
                  <input
                    type="text"
                    value={form.riskReward}
                    onChange={(e) => setForm({...form, riskReward: e.target.value})}
                    placeholder="e.g., 1:2"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Buy and Sell Prices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Buy Price
                  </label>
                  <input
                    type="number"
                    value={form.buy}
                    onChange={(e) => setForm({...form, buy: e.target.value})}
                    placeholder="Buy price per share"
                    step="0.01"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Sell Price
                  </label>
                  <input
                    type="number"
                    value={form.sell}
                    onChange={(e) => setForm({...form, sell: e.target.value})}
                    placeholder="Sell price per share"
                    step="0.01"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Analysis Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Trend
                  </label>
                  <select
                    value={form.trend}
                    onChange={(e) => setForm({...form, trend: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="Up">Up</option>
                    <option value="Down">Down</option>
                    <option value="Sideways">Sideways</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Rule Followed
                  </label>
                  <select
                    value={form.rule}
                    onChange={(e) => setForm({...form, rule: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Partially">Partially</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Emotion
                  </label>
                  <select
                    value={form.emotion}
                    onChange={(e) => setForm({...form, emotion: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select emotion...</option>
                    <option value="Confident">Confident</option>
                    <option value="Fearful">Fearful</option>
                    <option value="Greedy">Greedy</option>
                    <option value="Patient">Patient</option>
                    <option value="Impatient">Impatient</option>
                    <option value="FOMO">FOMO</option>
                    <option value="Revenge">Revenge Trading</option>
                    <option value="Calm">Calm</option>
                    <option value="Excited">Excited</option>
                    <option value="Stressed">Stressed</option>
                  </select>
                </div>
              </div>

              {/* Setup and Remarks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Setup
                  </label>
                  <select
                    value={form.setup}
                    onChange={(e) => setForm({...form, setup: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select setup...</option>
                    <option value="Breakout">Breakout</option>
                    <option value="Breakdown">Breakdown</option>
                    <option value="Pullback">Pullback</option>
                    <option value="Support">Support</option>
                    <option value="Resistance">Resistance</option>
                    <option value="Gap">Gap</option>
                    <option value="News">News</option>
                    <option value="Earnings">Earnings</option>
                    <option value="Technical">Technical</option>
                    <option value="Fundamental">Fundamental</option>
                    <option value="Scalping">Scalping</option>
                    <option value="Swing">Swing</option>
                    <option value="Intraday">Intraday</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Remarks
                  </label>
                  <input
                    type="text"
                    value={form.remarks}
                    onChange={(e) => setForm({...form, remarks: e.target.value})}
                    placeholder="Additional notes..."
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Screenshots */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Screenshots
                </label>
                <ScreenshotManager
                  screenshots={form.screenshots || []}
                  onChange={(screenshots) => setForm({...form, screenshots})}
                />
              </div>

              {/* Charges Breakdown - Moved Inside Form */}
              {chargesPreview && (
                <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/20 dark:via-green-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                      <IconRupee className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Charges Breakdown</h3>
                      <p className="text-emerald-700 dark:text-emerald-300 text-sm">Real-time calculation preview</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700">
                      <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{formatNumber(chargesPreview.net)}
                      </div>
                      <div className="text-sm text-emerald-700 dark:text-emerald-300">Net P&L</div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700">
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        ₹{formatNumber(chargesPreview.brokerage)}
                      </div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">Brokerage</div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700">
                      <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        ₹{formatNumber(chargesPreview.totalCharges)}
                      </div>
                      <div className="text-sm text-purple-700 dark:text-purple-300">Total Charges</div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700">
                      <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                        ₹{formatNumber(chargesPreview.breakeven)}
                      </div>
                      <div className="text-sm text-orange-700 dark:text-orange-300">Breakeven</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingId(null); }}
                  className="px-6 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {editingId ? 'Update Trade' : 'Add Trade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trade Detail Modal */}
      {showDetailModal && selectedTrade && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => { setShowDetailModal(false); setSelectedTrade(null); }}
        >
                      <div 
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-slate-800 p-6 border-b border-slate-200 dark:border-slate-700 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTradeStatusColor(selectedTrade.meta?.net || 0)}`}>
                    {getTradeStatusIcon(selectedTrade.meta?.net || 0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {selectedTrade.symbol} - {selectedTrade.type}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                      {new Date(selectedTrade.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleEdit(selectedTrade);
                      setShowDetailModal(false);
                      setSelectedTrade(null);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    title="Edit trade"
                  >
                    <IconEdit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => { setShowDetailModal(false); setSelectedTrade(null); }}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors"
                    title="Close (Esc)"
                  >
                    <IconX className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Performance Summary */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Performance Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <div className={`text-2xl font-bold ${(selectedTrade.meta?.net || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      ₹{formatNumber(selectedTrade.meta?.net || 0)}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Net P&L</div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      ₹{formatNumber(selectedTrade.meta?.brokerage || 0)}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Brokerage</div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      ₹{formatNumber(selectedTrade.meta?.totalCharges || 0)}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Total Charges</div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      ₹{formatNumber(selectedTrade.meta?.breakeven || 0)}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Breakeven</div>
                  </div>
                </div>
              </div>

              {/* Trade Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                      <h4 className="font-semibold text-slate-900 dark:text-white">Basic Information</h4>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Symbol:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{selectedTrade.symbol}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Type:</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium text-white ${getTradeTypeColor(selectedTrade.type)}`}>
                          {getTradeTypeIcon(selectedTrade.type)}
                          {selectedTrade.type}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Quantity:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{selectedTrade.qty}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Buy Price:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">₹{selectedTrade.buy}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Sell Price:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">₹{selectedTrade.sell}</span>
                      </div>
                      {selectedTrade.riskReward && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-400">Risk:Reward:</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{selectedTrade.riskReward}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Analysis */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
                      <h4 className="font-semibold text-slate-900 dark:text-white">Analysis</h4>
                    </div>
                    <div className="p-4 space-y-4">
                      {selectedTrade.trend && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-400">Trend:</span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-sm rounded-lg">
                            {selectedTrade.trend}
                          </span>
                        </div>
                      )}
                      {selectedTrade.rule && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-400">Rule Followed:</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-sm rounded-lg font-medium ${
                            selectedTrade.rule === 'Yes' 
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200'
                              : selectedTrade.rule === 'No'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                          }`}>
                            {selectedTrade.rule}
                          </span>
                        </div>
                      )}
                      {selectedTrade.emotion && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-400">Emotion:</span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 text-sm rounded-lg">
                            {selectedTrade.emotion}
                          </span>
                        </div>
                      )}
                      {selectedTrade.setup && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-400">Setup:</span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm rounded-lg">
                            {selectedTrade.setup}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Screenshots and Remarks */}
                <div className="space-y-6">
                  {/* Screenshots */}
                  {selectedTrade.screenshots && selectedTrade.screenshots.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20">
                        <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <IconEye className="w-4 h-4" />
                          Screenshots ({selectedTrade.screenshots.length})
                        </h4>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                          {selectedTrade.screenshots.map((screenshot, index) => {
                            // Handle both old format (string URLs) and new format (objects)
                            const screenshotUrl = typeof screenshot === 'string' ? screenshot : screenshot.thumbnail;
                            const fullSizeUrl = typeof screenshot === 'string' ? screenshot : screenshot.fullSize;
                            
                            return (
                              <div key={index} className="relative group">
                                <img 
                                  src={screenshotUrl} 
                                  alt={`Screenshot ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleScreenshotPreview(fullSizeUrl, index);
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }}
                                />
                              <div 
                                className="absolute inset-0 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hidden"
                                style={{ display: 'none' }}
                              >
                                <div className="text-center">
                                  <IconEye className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                  <p className="text-sm text-slate-500 dark:text-slate-400">Image not available</p>
                                </div>
                              </div>
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center pointer-events-none">
                                <IconEye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          );
                        })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Remarks */}
                  {selectedTrade.remarks && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                        <h4 className="font-semibold text-slate-900 dark:text-white">Remarks</h4>
                      </div>
                      <div className="p-4">
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {selectedTrade.remarks}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Trade Statistics */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                      <h4 className="font-semibold text-slate-900 dark:text-white">Trade Statistics</h4>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Gross P&L:</span>
                        <span className={`font-semibold ${(selectedTrade.meta?.gross || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                          ₹{formatNumber(selectedTrade.meta?.gross || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">STT:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">₹{formatNumber(selectedTrade.meta?.stt || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Exchange Transaction Charges:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">₹{formatNumber(selectedTrade.meta?.exchangeTransactionCharges || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">GST:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">₹{formatNumber(selectedTrade.meta?.gst || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">SEBI Charges:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">₹{formatNumber(selectedTrade.meta?.sebiCharges || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => {
                    handleEdit(selectedTrade);
                    setShowDetailModal(false);
                    setSelectedTrade(null);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                  <IconEdit className="w-4 h-4" />
                  Edit Trade
                </button>
                <button
                  onClick={() => {
                    handleDuplicate(selectedTrade);
                    setShowDetailModal(false);
                    setSelectedTrade(null);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                  <IconCopy className="w-4 h-4" />
                  Duplicate Trade
                </button>
                <button
                  onClick={() => {
                    deleteTrade(selectedTrade.id);
                    setShowDetailModal(false);
                    setSelectedTrade(null);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                  <IconTrash className="w-4 h-4" />
                  Delete Trade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Preview Modal */}
      {showScreenshotModal && selectedScreenshot && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => { setShowScreenshotModal(false); setSelectedScreenshot(null); }}
        >
                      <div 
              className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => {
                  setShowScreenshotModal(false);
                  setSelectedScreenshot(null);
                }}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors"
                title="Close (Esc)"
              >
                <IconX className="w-6 h-6 text-white" />
              </button>
            </div>
            
            <div className="relative w-full h-full flex items-center justify-center">
              <img 
                src={selectedScreenshot.url} 
                alt={`Screenshot ${selectedScreenshot.index}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div 
                className="absolute inset-0 bg-slate-800 rounded-lg flex items-center justify-center hidden"
                style={{ display: 'none' }}
              >
                <div className="text-center text-white">
                  <IconEye className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-lg text-slate-300">Screenshot not available</p>
                  <p className="text-sm text-slate-400 mt-2">The image could not be loaded</p>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-white text-sm font-medium">
                Screenshot {selectedScreenshot.index}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradesTab;
