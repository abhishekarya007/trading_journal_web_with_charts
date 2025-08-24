import React, { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import zoomPlugin from 'chartjs-plugin-zoom';
import { Chart } from 'chart.js';
import PerformanceHeatmap from './PerformanceHeatmap';

// Register the zoom plugin
Chart.register(zoomPlugin);
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
  IconActivity,
  IconRefresh,
  IconDownload,
  IconImage,
  IconFileText
} from './icons';

export default function AnalyticsTab({ totals, monthRows, allMonthRows, activeMonthLabel, setupRows, directionRows, emotionRows, rrAnalysis, monthlyChart, equityChart, drawdownChart, commonChartOptions, formatNumber, periodLabel, periodControls, onSelectMonth, advancedMetrics, trades }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [animateCharts, setAnimateCharts] = useState(false);
  const [hoveredMetric, setHoveredMetric] = useState(null);
  const [enlargedChart, setEnlargedChart] = useState(null);
  const [chartData, setChartData] = useState(null);

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

  const handleChartClick = (chartType, data, title) => {
    setEnlargedChart(chartType);
    setChartData({ data, title });
  };

  const closeEnlargedChart = () => {
    setEnlargedChart(null);
    setChartData(null);
  };

  // Chart export functions
  const exportChartAsImage = async (format = 'png') => {
    try {
      const chartElement = document.querySelector(`[data-chart-id="${enlargedChart}"]`);
      if (!chartElement) return;

      // Use html2canvas to capture the chart
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2, // High resolution
        useCORS: true,
        allowTaint: true
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${chartData.title.replace(/\s+/g, '_')}_${periodLabel.replace(/\s+/g, '_')}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, `image/${format}`);
    } catch (error) {
      console.error('Error exporting chart:', error);
    }
  };

  const exportChartAsPDF = async () => {
    try {
      const chartElement = document.querySelector(`[data-chart-id="${enlargedChart}"]`);
      if (!chartElement) return;

      // Use html2canvas to capture the chart
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      const imgWidth = 297; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 210; // A4 height in mm
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${chartData.title.replace(/\s+/g, '_')}_${periodLabel.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error exporting chart as PDF:', error);
    }
  };

  // Enhanced chart options for enlarged view with zoom and pan
  const enlargedChartOptions = {
    ...commonChartOptions,
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    plugins: {
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.9)',
        titleFont: { size: 16, weight: 'bold' },
        bodyFont: { size: 14 },
        padding: 16,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y || context.parsed;
            return `${label}: ₹${formatNumber(value)}`;
          }
        }
      },
      legend: {
        labels: { 
          font: { size: 14, weight: 'bold' },
          padding: 20
        }
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'xy',
          modifierKey: 'ctrl'
        },
        zoom: {
          wheel: {
            enabled: true,
            speed: 0.1
          },
          pinch: {
            enabled: true
          },
          mode: 'xy',
          drag: {
            enabled: true,
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderColor: 'rgba(0,0,0,0.3)',
            borderWidth: 1
          }
        }
      }
    },
    scales: {
      x: { 
        grid: { 
          display: true,
          color: 'rgba(0,0,0,0.1)',
          lineWidth: 1
        },
        ticks: { 
          font: { size: 12, weight: 'bold' },
          padding: 8
        }
      },
      y: { 
        grid: { 
          display: true,
          color: 'rgba(0,0,0,0.1)',
          lineWidth: 1
        },
        ticks: { 
          font: { size: 12, weight: 'bold' },
          padding: 8,
          callback: function(value) {
            return '₹' + formatNumber(value);
          }
        }
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 xl:p-8 text-white animate-pulse min-h-0">
        <div className="absolute inset-0 bg-black/10"></div>
        {/* Mobile: Smaller decorative elements */}
        <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8 sm:-translate-y-12 sm:translate-x-12 lg:-translate-y-16 lg:translate-x-16 animate-bounce"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-18 sm:h-18 lg:w-24 lg:h-24 bg-white/10 rounded-full translate-y-6 -translate-x-6 sm:translate-y-9 sm:-translate-x-9 lg:translate-y-12 lg:-translate-x-12 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white/5 rounded-full -translate-x-4 -translate-y-4 sm:-translate-x-6 sm:-translate-y-6 lg:-translate-x-8 lg:-translate-y-8 animate-spin"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-16 xl:h-16 bg-white/20 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <IconChartBar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-8 xl:h-8" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 lg:mb-2">Trading Analytics</h1>
              <p className="text-indigo-100 text-xs sm:text-sm lg:text-base xl:text-lg">Deep insights into your trading performance</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            <div 
              className={`bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                hoveredMetric === 'net' ? 'bg-white/30 scale-110 shadow-2xl' : 'hover:bg-white/20'
              }`}
              onMouseEnter={() => setHoveredMetric('net')}
              onMouseLeave={() => setHoveredMetric(null)}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
                <div className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center ${
                  hoveredMetric === 'net' ? 'animate-bounce' : 'animate-pulse'
                }`}>
                  <IconRupee className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-emerald-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm sm:text-lg lg:text-2xl font-bold truncate ${
                    hoveredMetric === 'net' ? 'animate-pulse text-emerald-200' : 'animate-pulse'
                  }`}>
                    {formatNumber(totals.net)}
                  </div>
                  <div className="text-indigo-100 text-xs sm:text-sm truncate">Total Net P&L</div>
                </div>
              </div>
            </div>

            <div 
              className={`bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                hoveredMetric === 'winRate' ? 'bg-white/30 scale-110 shadow-2xl' : 'hover:bg-white/20'
              }`}
              onMouseEnter={() => setHoveredMetric('winRate')}
              onMouseLeave={() => setHoveredMetric(null)}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
                <div className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center ${
                  hoveredMetric === 'winRate' ? 'animate-spin' : 'animate-bounce'
                }`}>
                  <IconPercent className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-blue-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm sm:text-lg lg:text-2xl font-bold truncate ${
                    hoveredMetric === 'winRate' ? 'animate-pulse text-blue-200' : 'animate-pulse'
                  }`}>
                    {totals.winRate}%
                  </div>
                  <div className="text-indigo-100 text-xs sm:text-sm truncate">Win Rate</div>
                </div>
              </div>
            </div>

            <div 
              className={`bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                hoveredMetric === 'trades' ? 'bg-white/30 scale-110 shadow-2xl' : 'hover:bg-white/20'
              }`}
              onMouseEnter={() => setHoveredMetric('trades')}
              onMouseLeave={() => setHoveredMetric(null)}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
                <div className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-purple-500/20 rounded-lg flex items-center justify-center ${
                  hoveredMetric === 'trades' ? 'animate-bounce' : 'animate-pulse'
                }`}>
                  <IconUsers className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-purple-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm sm:text-lg lg:text-2xl font-bold truncate ${
                    hoveredMetric === 'trades' ? 'animate-pulse text-purple-200' : 'animate-pulse'
                  }`}>
                    {totals.trades}
                  </div>
                  <div className="text-indigo-100 text-xs sm:text-sm truncate">Total Trades</div>
                </div>
              </div>
            </div>

            <div 
              className={`bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                hoveredMetric === 'avg' ? 'bg-white/30 scale-110 shadow-2xl' : 'hover:bg-white/20'
              }`}
              onMouseEnter={() => setHoveredMetric('avg')}
              onMouseLeave={() => setHoveredMetric(null)}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
                <div className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-orange-500/20 rounded-lg flex items-center justify-center ${
                  hoveredMetric === 'avg' ? 'animate-pulse' : 'animate-spin'
                }`}>
                  <IconActivity className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-orange-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm sm:text-lg lg:text-2xl font-bold truncate ${
                    hoveredMetric === 'avg' ? 'animate-pulse text-orange-200' : 'animate-pulse'
                  }`}>
                    {formatNumber(totals.avg)}
                  </div>
                  <div className="text-indigo-100 text-xs sm:text-sm truncate">Avg Net/Trade</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Performance Metrics */}
      <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <IconTarget className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Advanced Performance Metrics</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Professional trading analytics for {periodLabel.toLowerCase().replace('showing: ', '')}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {/* Maximum Drawdown */}
          <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-3 sm:p-4 border border-red-200 dark:border-red-700">
            <div className="flex items-center gap-2 mb-2">
              <IconTrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-xs font-semibold text-red-700 dark:text-red-300">Max Drawdown</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400">
              ₹{formatNumber(advancedMetrics?.maxDrawdown || 0)}
            </div>
          </div>



          {/* Profit Factor */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-3 sm:p-4 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-2 mb-2">
              <IconBarChart className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Profit Factor</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatNumber(advancedMetrics?.profitFactor || 0)}
            </div>
          </div>

          {/* Win/Loss Ratio */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-3 sm:p-4 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-2 mb-2">
              <IconTarget className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">Win/Loss Ratio</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-purple-600 dark:text-purple-400">
              {formatNumber(advancedMetrics?.winLossRatio || 0)}
            </div>
          </div>

          {/* Average Win */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-3 sm:p-4 border border-emerald-200 dark:border-emerald-700">
            <div className="flex items-center gap-2 mb-2">
              <IconTrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Average Win</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
              ₹{formatNumber(advancedMetrics?.avgWin || 0)}
            </div>
          </div>

          {/* Average Loss */}
          <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-3 sm:p-4 border border-red-200 dark:border-red-700">
            <div className="flex items-center gap-2 mb-2">
              <IconTrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-xs font-semibold text-red-700 dark:text-red-300">Average Loss</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400">
              ₹{formatNumber(advancedMetrics?.avgLoss || 0)}
            </div>
          </div>



          {/* Recovery Factor */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-3 sm:p-4 border border-indigo-200 dark:border-indigo-700">
            <div className="flex items-center gap-2 mb-2">
              <IconRocket className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Recovery Factor</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {formatNumber(advancedMetrics?.recoveryFactor || 0)}
            </div>
          </div>

          {/* Largest Win */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-3 sm:p-4 border border-emerald-200 dark:border-emerald-700">
            <div className="flex items-center gap-2 mb-2">
              <IconTrophy className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Largest Win</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
              ₹{formatNumber(advancedMetrics?.largestWin || 0)}
            </div>
          </div>



          {/* Consecutive Wins */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-3 sm:p-4 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-2 mb-2">
              <IconStar className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Max Win Streak</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
              {advancedMetrics?.consecutiveWins || 0}
            </div>
          </div>

          {/* Consecutive Losses */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-3 sm:p-4 border border-orange-200 dark:border-orange-700">
            <div className="flex items-center gap-2 mb-2">
              <IconZap className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">Max Loss Streak</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-orange-600 dark:text-orange-400">
              {advancedMetrics?.consecutiveLosses || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Heatmap */}
      <PerformanceHeatmap 
        trades={trades} 
        onDateClick={(date, dayTrades) => {
          // You can add functionality here to show trades for a specific day
          console.log(`Clicked on ${date} with ${dayTrades.length} trades:`, dayTrades);
        }}
      />

      {/* Period Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <IconCalendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Analysis Period</h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{periodLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-xl p-1 w-full sm:w-auto">
            {periodControls}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Monthly P&L Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300 group">
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                  <IconBarChart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Monthly P&L</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Performance by month • Click bars to filter</p>
                </div>
              </div>
              <button 
                onClick={() => handleChartClick('monthly', monthlyChart, 'Monthly P&L Performance')}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600"
                title="Enlarge chart"
              >
                <IconActivity className="w-3 h-3 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
          <div className="p-4 sm:p-6 h-48 sm:h-64">
            {allMonthRows.length ? (
              <div className={`transition-all duration-1000 ${animateCharts ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <Bar
                  data={monthlyChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      title: { display: false },
                    },
                    interaction: {
                      mode: 'nearest',
                      axis: 'x',
                      intersect: false
                    },
                    elements: {
                      bar: {
                        borderWidth: 2,
                        borderRadius: 6,
                        borderSkipped: false,
                      }
                    },
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
                    },
                    onHover: (evt, elements, chart) => {
                      evt.native.target.style.cursor = elements.length ? 'pointer' : 'default';
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                  <IconBarChart className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm sm:text-base">No monthly data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Equity Curve Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <IconTrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Equity Curve</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Cumulative performance</p>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-6 h-6 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <IconActivity className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                </div>
              </div>
            </div>
          </div>
          <div 
            className="p-4 sm:p-6 h-48 sm:h-64"
            onClick={() => handleChartClick('equity', equityChart, 'Equity Curve Analysis')}
          >
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
                  <IconTrendingUp className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm sm:text-base">No trades yet</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drawdown Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <IconTrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Drawdown Analysis</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Risk exposure over time</p>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-6 h-6 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <IconActivity className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                </div>
              </div>
            </div>
          </div>
          <div 
            className="p-4 sm:p-6 h-48 sm:h-64"
            onClick={() => handleChartClick('drawdown', drawdownChart, 'Drawdown Analysis')}
          >
            {totals.trades ? (
              <div className={`transition-all duration-1000 ${animateCharts ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <Line 
                  data={drawdownChart} 
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
                  <IconTrendingDown className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm sm:text-base">No trades yet</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Summary Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <IconCalendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Monthly Summary</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Click on any month to filter data</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Trades
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Win Rate
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Total Net
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
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
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">{m.month}</span>
                      {activeMonthLabel === m.month && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-2">
                      <IconUsers className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />
                      <span className="font-medium text-sm sm:text-base">{m.total}</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className={`font-semibold text-sm sm:text-base ${getWinRateColor(m.winRate)}`}>
                      {m.winRate}%
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className={`font-bold text-sm sm:text-base ${getPerformanceColor(m.totalNet)}`}>
                      ₹{formatNumber(m.totalNet)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className={`font-semibold text-sm sm:text-base ${getPerformanceColor(m.avg)}`}>
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
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <IconTarget className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Performance Analytics</h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Deep dive into your trading patterns</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Setup Performance */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                  <IconTarget className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">Setup Performance</h4>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {setupRows && setupRows.length ? setupRows.map((s, index) => (
                                 <div 
                   key={s.setup} 
                   className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-700 last:border-b-0 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 dark:hover:from-emerald-900/10 dark:hover:to-green-900/10 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                   style={{ animationDelay: `${index * 100}ms` }}
                 >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">{s.setup}</span>
                    <span className={`text-base sm:text-lg font-bold ${getPerformanceColor(s.avgNet)}`}>
                      ₹{formatNumber(s.avgNet)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-400">
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
                <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-slate-500">
                  <IconTarget className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm sm:text-base">No setups yet</p>
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

          {/* Long vs Short Performance */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                  <IconTrendingUp className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white">Long vs Short Performance</h4>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Long Trades */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                      <IconTrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h6 className="font-semibold text-slate-900 dark:text-white">Long Trades</h6>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{rrAnalysis.longAnalysis.trades} trades</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {rrAnalysis.longAnalysis.winRate}%
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Win Rate</div>
                    </div>
                    <div className="min-w-0">
                      <div className={`text-lg font-bold ${getPerformanceColor(rrAnalysis.longAnalysis.avgNet)} break-words`}>
                        ₹{formatNumber(rrAnalysis.longAnalysis.avgNet)}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Avg Net</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-700">
                    <div className={`text-sm font-semibold ${getPerformanceColor(rrAnalysis.longAnalysis.net)}`}>
                      Total: ₹{formatNumber(rrAnalysis.longAnalysis.net)}
                    </div>
                  </div>
                </div>

                {/* Short Trades */}
                <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-red-200 dark:border-red-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <IconTrendingDown className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h6 className="font-semibold text-slate-900 dark:text-white">Short Trades</h6>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{rrAnalysis.shortAnalysis.trades} trades</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-lg font-bold text-red-600 dark:text-red-400">
                        {rrAnalysis.shortAnalysis.winRate}%
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Win Rate</div>
                    </div>
                    <div className="min-w-0">
                      <div className={`text-lg font-bold ${getPerformanceColor(rrAnalysis.shortAnalysis.avgNet)} break-words`}>
                        ₹{formatNumber(rrAnalysis.shortAnalysis.avgNet)}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Avg Net</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-700">
                    <div className={`text-sm font-semibold ${getPerformanceColor(rrAnalysis.shortAnalysis.net)}`}>
                      Total: ₹{formatNumber(rrAnalysis.shortAnalysis.net)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk-Reward Ratio Performance */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <IconTarget className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white">Risk-Reward Ratio Performance</h4>
              </div>
            </div>
            
            <div className="p-6">
              <div className="max-h-80 overflow-y-auto">
                {rrAnalysis.rrRows && rrAnalysis.rrRows.length > 0 ? rrAnalysis.rrRows.map((rr, index) => (
                  <div 
                    key={rr.rr} 
                    className="mb-4 p-4 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-700/50 dark:to-gray-700/50 rounded-xl border border-slate-200 dark:border-slate-600 hover:shadow-lg transition-all duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Overall RR Performance */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-slate-900 dark:text-white">{rr.rr}</span>
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-lg font-medium">
                          {rr.trades} trades
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getPerformanceColor(rr.avgNet)}`}>
                          ₹{formatNumber(rr.avgNet)}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Avg Net</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <IconTrophy className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">{rr.wins} wins</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <IconFire className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">{rr.losses} losses</span>
                        </div>
                      </div>
                      <span className={`font-semibold ${getWinRateColor(rr.winRate)}`}>
                        {rr.winRate}% win rate
                      </span>
                    </div>

                    {/* Long vs Short Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Long Performance */}
                      {rr.long.trades > 0 && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 border border-emerald-200 dark:border-emerald-700">
                          <div className="flex items-center gap-2 mb-2">
                            <IconTrendingUp className="w-3 h-3 text-emerald-600" />
                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">LONG</span>
                            <span className="text-xs text-slate-500">({rr.long.trades} trades)</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <div className="font-semibold text-emerald-600">{rr.long.winRate}%</div>
                              <div className="text-slate-500">Win Rate</div>
                            </div>
                            <div>
                              <div className={`font-semibold ${getPerformanceColor(rr.long.avgNet)}`}>
                                ₹{formatNumber(rr.long.avgNet)}
                              </div>
                              <div className="text-slate-500">Avg Net</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Short Performance */}
                      {rr.short.trades > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-700">
                          <div className="flex items-center gap-2 mb-2">
                            <IconTrendingDown className="w-3 h-3 text-red-600" />
                            <span className="text-xs font-semibold text-red-700 dark:text-red-300">SHORT</span>
                            <span className="text-xs text-slate-500">({rr.short.trades} trades)</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <div className="font-semibold text-red-600">{rr.short.winRate}%</div>
                              <div className="text-slate-500">Win Rate</div>
                            </div>
                            <div>
                              <div className={`font-semibold ${getPerformanceColor(rr.short.avgNet)}`}>
                                ₹{formatNumber(rr.short.avgNet)}
                              </div>
                              <div className="text-slate-500">Avg Net</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="px-6 py-8 text-center text-slate-500">
                    <IconTarget className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p>No risk-reward data yet</p>
                    <p className="text-sm text-slate-400 mt-1">Add risk-reward ratios to your trades to see analysis</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enlarged Chart Modal */}
      {enlargedChart && chartData && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeEnlargedChart}
        >
          <div 
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <IconChartBar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{chartData.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{periodLabel}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Export Controls */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                  <button 
                    onClick={() => exportChartAsImage('png')}
                    className="w-8 h-8 bg-white dark:bg-slate-600 rounded-md flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-500 transition-colors"
                    title="Export as PNG"
                  >
                    <IconDownload className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </button>
                  <button 
                    onClick={() => exportChartAsImage('jpg')}
                    className="w-8 h-8 bg-white dark:bg-slate-600 rounded-md flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-500 transition-colors"
                    title="Export as JPG"
                  >
                    <IconImage className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </button>
                  <button 
                    onClick={exportChartAsPDF}
                    className="w-8 h-8 bg-white dark:bg-slate-600 rounded-md flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-500 transition-colors"
                    title="Export as PDF"
                  >
                    <IconFileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
                
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                  <button 
                    onClick={() => {
                      const chart = Chart.getChart(document.querySelector(`[data-chart-id="${enlargedChart}"]`));
                      if (chart) chart.zoom(1.1);
                    }}
                    className="w-8 h-8 bg-white dark:bg-slate-600 rounded-md flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-500 transition-colors"
                    title="Zoom In"
                  >
                    <span className="text-slate-600 dark:text-slate-400 text-lg font-bold">+</span>
                  </button>
                  <button 
                    onClick={() => {
                      const chart = Chart.getChart(document.querySelector(`[data-chart-id="${enlargedChart}"]`));
                      if (chart) chart.zoom(0.9);
                    }}
                    className="w-8 h-8 bg-white dark:bg-slate-600 rounded-md flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-500 transition-colors"
                    title="Zoom Out"
                  >
                    <span className="text-slate-600 dark:text-slate-400 text-lg font-bold">−</span>
                  </button>
                  <button 
                    onClick={() => {
                      const chart = Chart.getChart(document.querySelector(`[data-chart-id="${enlargedChart}"]`));
                      if (chart) chart.resetZoom();
                    }}
                    className="w-8 h-8 bg-white dark:bg-slate-600 rounded-md flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-500 transition-colors"
                    title="Reset Zoom"
                  >
                    <IconRefresh className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
                <button 
                  onClick={closeEnlargedChart}
                  className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <span className="text-slate-600 dark:text-slate-400 text-lg font-bold">×</span>
                </button>
              </div>
            </div>
            
            <div className="h-96 sm:h-[500px] lg:h-[600px]">
              {enlargedChart === 'monthly' && (
                <Bar
                  data={chartData.data}
                  options={enlargedChartOptions}
                  data-chart-id={enlargedChart}
                />
              )}
              {enlargedChart === 'equity' && (
                <Line
                  data={chartData.data}
                  options={enlargedChartOptions}
                  data-chart-id={enlargedChart}
                />
              )}
              {enlargedChart === 'drawdown' && (
                <Line
                  data={chartData.data}
                  options={enlargedChartOptions}
                  data-chart-id={enlargedChart}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
