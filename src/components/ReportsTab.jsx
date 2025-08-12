import React, { useState, useMemo } from 'react';
import { 
  IconDownload, 
  IconCalendar, 
  IconFileText, 
  IconChartBar,
  IconTrendingUp,
  IconTrendingDown,
  IconTarget,
  IconZap,
  IconStar,
  IconClock,
  IconDollarSign,
  IconPercent,
  IconCheck,
  IconX,
  IconImage,
  IconFilter,
  IconEye,
  IconChevronUp,
  IconChevronDown
} from './icons';

const ReportsTab = ({ trades, formatNumber, formatCurrency, showToast }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);

  // Get unique years from trades
  const availableYears = useMemo(() => {
    const years = [...new Set(trades.map(trade => new Date(trade.date).getFullYear()))];
    return years.sort((a, b) => b - a); // Sort descending
  }, [trades]);

  // Filter and sort trades by selected month and year
  const filteredTrades = useMemo(() => {
    const filtered = trades.filter(trade => {
      const tradeDate = new Date(trade.date);
      return tradeDate.getFullYear() === selectedYear && 
             tradeDate.getMonth() + 1 === selectedMonth;
    });

    // Sort the filtered trades
    return filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'symbol':
          aValue = (a.symbol || '').toLowerCase();
          bValue = (b.symbol || '').toLowerCase();
          break;
        case 'type':
          aValue = (a.type || '').toLowerCase();
          bValue = (b.type || '').toLowerCase();
          break;
        case 'qty':
          aValue = parseFloat(a.qty) || 0;
          bValue = parseFloat(b.qty) || 0;
          break;
        case 'buy':
          aValue = parseFloat(a.buy) || 0;
          bValue = parseFloat(b.buy) || 0;
          break;
        case 'sell':
          aValue = parseFloat(a.sell) || 0;
          bValue = parseFloat(b.sell) || 0;
          break;
        case 'netPnL':
          aValue = a.meta?.net || 0;
          bValue = b.meta?.net || 0;
          break;
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [trades, selectedYear, selectedMonth, sortField, sortDirection]);

  // Calculate metrics for filtered trades
  const metrics = useMemo(() => {
    if (filteredTrades.length === 0) {
      return {
        totalTrades: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        grossPnL: 0,
        netPnL: 0,
        avgWin: 0,
        avgLoss: 0,
        largestWin: 0,
        largestLoss: 0,
        totalCharges: 0,
        totalScreenshots: 0,
        setups: {},
        emotions: {},
        symbols: {}
      };
    }

    const wins = filteredTrades.filter(t => (t.meta?.net || 0) > 0);
    const losses = filteredTrades.filter(t => (t.meta?.net || 0) < 0);
    const breakEven = filteredTrades.filter(t => (t.meta?.net || 0) === 0);

    const winAmounts = wins.map(t => t.meta?.net || 0);
    const lossAmounts = losses.map(t => Math.abs(t.meta?.net || 0));

    // Setup analysis
    const setups = {};
    filteredTrades.forEach(trade => {
      const setup = trade.setup || 'Unknown';
      setups[setup] = (setups[setup] || 0) + 1;
    });

    // Emotion analysis
    const emotions = {};
    filteredTrades.forEach(trade => {
      const emotion = trade.emotion || 'Unknown';
      emotions[emotion] = (emotions[emotion] || 0) + 1;
    });

    // Symbol analysis
    const symbols = {};
    filteredTrades.forEach(trade => {
      const symbol = trade.symbol || 'Unknown';
      symbols[symbol] = (symbols[symbol] || 0) + 1;
    });

    return {
      totalTrades: filteredTrades.length,
      wins: wins.length,
      losses: losses.length,
      breakEven: breakEven.length,
      winRate: filteredTrades.length > 0 ? (wins.length / filteredTrades.length) * 100 : 0,
      grossPnL: filteredTrades.reduce((sum, t) => sum + (t.meta?.gross || 0), 0),
      netPnL: filteredTrades.reduce((sum, t) => sum + (t.meta?.net || 0), 0),
      avgWin: winAmounts.length > 0 ? winAmounts.reduce((a, b) => a + b, 0) / winAmounts.length : 0,
      avgLoss: lossAmounts.length > 0 ? lossAmounts.reduce((a, b) => a + b, 0) / lossAmounts.length : 0,
      largestWin: winAmounts.length > 0 ? Math.max(...winAmounts) : 0,
      largestLoss: lossAmounts.length > 0 ? Math.max(...lossAmounts) : 0,
      totalCharges: filteredTrades.reduce((sum, t) => sum + (t.meta?.totalCharges || 0), 0),
      totalScreenshots: filteredTrades.reduce((sum, t) => sum + (t.screenshots?.length || 0), 0),
      setups,
      emotions,
      symbols
    };
  }, [filteredTrades]);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle trade detail view
  const handleTradeClick = (trade) => {
    setSelectedTrade(trade);
    setShowDetailModal(true);
  };

  // Handle screenshot preview
  const handleScreenshotClick = (screenshot) => {
    setSelectedScreenshot(screenshot);
    setShowScreenshotModal(true);
  };

  // Generate PDF Report
  const generatePDFReport = async () => {
    if (filteredTrades.length === 0) {
      // Show warning toast
      if (showToast) {
        showToast('No trades found for the selected month and year.', 'warning');
      } else {
        alert('No trades found for the selected month and year.');
      }
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('Starting PDF generation...');
      
      // Import jsPDF
      const jsPDF = (await import('jspdf')).default;
      console.log('jsPDF imported successfully');
      
      const doc = new jsPDF();
      console.log('PDF document created');
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      let yPosition = margin;
      
      // Helper function to add text with word wrapping
      const addWrappedText = (text, x, y, maxWidth, fontSize = 12) => {
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return lines.length * (fontSize * 0.4); // Return height used
      };

      // Helper function to add new page if needed
      const checkNewPage = (requiredHeight) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
      };

      // Helper function to add section header
      const addSectionHeader = (title) => {
        checkNewPage(30);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, yPosition);
        yPosition += 15;
      };

      // Helper function to add image to PDF
      const addImageToPDF = async (imageData, x, y, maxWidth, maxHeight) => {
        try {
          const img = new Image();
          img.src = imageData;
          
          return new Promise((resolve) => {
            img.onload = () => {
              const aspectRatio = img.width / img.height;
              let width = maxWidth;
              let height = width / aspectRatio;
              
              if (height > maxHeight) {
                height = maxHeight;
                width = height * aspectRatio;
              }
              
              doc.addImage(img, 'JPEG', x, y, width, height);
              resolve(height);
            };
            img.onerror = () => {
              console.log('Failed to load image');
              resolve(0);
            };
          });
        } catch (error) {
          console.log('Error adding image:', error);
          return 0;
        }
      };

      // Title
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Trading Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Period
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const periodText = `${monthNames[selectedMonth - 1]} ${selectedYear}`;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text(periodText, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Summary Metrics
      addSectionHeader('Summary Metrics');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const summaryData = [
        `Total Trades: ${String(metrics.totalTrades)}`,
        `Wins: ${String(metrics.wins)} | Losses: ${String(metrics.losses)} | Break Even: ${String(metrics.breakEven)}`,
        `Win Rate: ${String(metrics.winRate.toFixed(2))}%`,
        `Gross P&L: ${formatCurrency(metrics.grossPnL)}`,
        `Net P&L: ${formatCurrency(metrics.netPnL)}`,
        `Total Charges: ${formatCurrency(metrics.totalCharges)}`,
        `Average Win: ${formatCurrency(metrics.avgWin)}`,
        `Average Loss: ${formatCurrency(metrics.avgLoss)}`,
        `Largest Win: ${formatCurrency(metrics.largestWin)}`,
        `Largest Loss: ${formatCurrency(metrics.largestLoss)}`,
        `Total Screenshots: ${String(metrics.totalScreenshots)}`
      ];

      summaryData.forEach(line => {
        doc.text(line, margin, yPosition);
        yPosition += 6;
      });

      yPosition += 10;

      // Setup Analysis
      addSectionHeader('Setup Analysis');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      Object.entries(metrics.setups)
        .sort(([,a], [,b]) => b - a)
        .forEach(([setup, count]) => {
          const percentage = ((count / metrics.totalTrades) * 100).toFixed(1);
          doc.text(`${String(setup)}: ${String(count)} trades (${String(percentage)}%)`, margin, yPosition);
          yPosition += 6;
        });

      yPosition += 10;

      // Emotion Analysis
      addSectionHeader('Emotion Analysis');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      Object.entries(metrics.emotions)
        .sort(([,a], [,b]) => b - a)
        .forEach(([emotion, count]) => {
          const percentage = ((count / metrics.totalTrades) * 100).toFixed(1);
          doc.text(`${String(emotion)}: ${String(count)} trades (${String(percentage)}%)`, margin, yPosition);
          yPosition += 6;
        });

      yPosition += 10;

      // Symbol Analysis
      addSectionHeader('Symbol Analysis');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      Object.entries(metrics.symbols)
        .sort(([,a], [,b]) => b - a)
        .forEach(([symbol, count]) => {
          const percentage = ((count / metrics.totalTrades) * 100).toFixed(1);
          doc.text(`${String(symbol)}: ${String(count)} trades (${String(percentage)}%)`, margin, yPosition);
          yPosition += 6;
        });

      yPosition += 15;

      // Detailed Trades Table
      addSectionHeader('Detailed Trades');
      
      // Table headers
      const headers = ['Date', 'Symbol', 'Type', 'Qty', 'Buy', 'Sell', 'Net P&L', 'Status'];
      const columnWidths = [25, 25, 20, 15, 20, 20, 25, 20];
      let xPosition = margin;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      headers.forEach((header, index) => {
        doc.text(header, xPosition, yPosition);
        xPosition += columnWidths[index];
      });
      yPosition += 8;

      // Table data
      doc.setFont('helvetica', 'normal');
      filteredTrades.forEach(trade => {
        checkNewPage(20);
        
        xPosition = margin;
        const netPnL = trade.meta?.net || 0;
        const status = netPnL > 0 ? 'WIN' : netPnL < 0 ? 'LOSS' : 'BE';
        
        const rowData = [
          new Date(trade.date).toLocaleDateString(),
          String(trade.symbol || '-'),
          String(trade.type || '-'),
          String(trade.qty || '-'),
          String(trade.buy || '-'),
          String(trade.sell || '-'),
          formatCurrency(netPnL),
          String(status)
        ];

        rowData.forEach((cell, index) => {
          doc.text(String(cell), xPosition, yPosition);
          xPosition += columnWidths[index];
        });
        
        yPosition += 6;
      });

      yPosition += 20;
      
      // Add screenshots section if available
      const tradesWithScreenshots = filteredTrades.filter(t => t.screenshots && t.screenshots.length > 0);
      if (tradesWithScreenshots.length > 0) {
        addSectionHeader('Trade Screenshots');
        
        for (const trade of tradesWithScreenshots) {
          checkNewPage(100);
          
          // Trade info
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`${new Date(trade.date).toLocaleDateString()} - ${trade.symbol}`, margin, yPosition);
          yPosition += 8;
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(`Type: ${trade.type || 'N/A'} | Qty: ${trade.qty || 'N/A'} | Net P&L: ${formatCurrency(trade.meta?.net || 0)}`, margin, yPosition);
          yPosition += 15;
          
          // Screenshots
          for (const screenshot of trade.screenshots) {
            try {
              const imageHeight = await addImageToPDF(screenshot.fullSize || screenshot.thumbnail, margin, yPosition, contentWidth, 120);
              if (imageHeight > 0) {
                yPosition += imageHeight + 10;
                
                // Screenshot name
                if (screenshot.name) {
                  doc.setFontSize(8);
                  doc.text(`Screenshot: ${screenshot.name}`, margin, yPosition);
                  yPosition += 5;
                }
              }
            } catch (error) {
              console.log('Error adding screenshot:', error);
            }
            
            checkNewPage(50);
          }
          
          yPosition += 20;
        }
      }

      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text(`Generated on ${new Date().toLocaleString()}`, margin, pageHeight - 10);
      }

      // Save the PDF
      const fileName = `trading_report_${selectedYear}_${String(selectedMonth).padStart(2, '0')}.pdf`;
      console.log('Saving PDF as:', fileName);
      
      try {
        doc.save(fileName);
        console.log('PDF saved successfully');
        // Show success toast
        if (showToast) {
          showToast(`PDF report generated successfully: ${fileName}`, 'success');
        } else {
          alert(`PDF report generated successfully: ${fileName}`);
        }
      } catch (saveError) {
        console.error('Error saving PDF:', saveError);
        throw new Error(`Failed to save PDF: ${saveError.message}`);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      // Show error toast
      if (showToast) {
        showToast(`Error generating PDF report: ${error.message}. Please try again.`, 'error');
      } else {
        alert(`Error generating PDF report: ${error.message}. Please try again.`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12 animate-bounce"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <IconFileText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Trading Reports</h1>
              <p className="text-blue-100">Generate detailed monthly trading reports</p>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <IconFilter className="w-5 h-5 text-blue-200" />
              <span className="text-blue-200 font-medium">Filter by:</span>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="text-blue-200 text-sm font-medium">Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                {availableYears.map(year => (
                  <option key={year} value={year} className="text-slate-900">
                    {year}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="text-blue-200 text-sm font-medium">Month:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value={1}>January</option>
                <option value={2}>February</option>
                <option value={3}>March</option>
                <option value={4}>April</option>
                <option value={5}>May</option>
                <option value={6}>June</option>
                <option value={7}>July</option>
                <option value={8}>August</option>
                <option value={9}>September</option>
                <option value={10}>October</option>
                <option value={11}>November</option>
                <option value={12}>December</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <IconChartBar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.totalTrades}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Trades</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <IconTrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.winRate.toFixed(1)}%</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Win Rate</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <IconDollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className={`text-2xl font-bold ${metrics.netPnL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(metrics.netPnL)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Net P&L</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
              <IconImage className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.totalScreenshots}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Screenshots</div>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Report Button */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Generate PDF Report</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Create a detailed PDF report for {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} 
              ({filteredTrades.length} trades)
            </p>
          </div>
          
          <button
            onClick={generatePDFReport}
            disabled={isGenerating || filteredTrades.length === 0}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <IconDownload className="w-5 h-5" />
                <span>Generate PDF Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Trades Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Trades Log</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {filteredTrades.length} trades for {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800">
              <tr>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-2">
                    Date
                    {sortField === 'date' && (
                      sortDirection === 'asc' ? <IconChevronUp className="w-4 h-4" /> : <IconChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  onClick={() => handleSort('symbol')}
                >
                  <div className="flex items-center gap-2">
                    Symbol
                    {sortField === 'symbol' && (
                      sortDirection === 'asc' ? <IconChevronUp className="w-4 h-4" /> : <IconChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center gap-2">
                    Type
                    {sortField === 'type' && (
                      sortDirection === 'asc' ? <IconChevronUp className="w-4 h-4" /> : <IconChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  onClick={() => handleSort('qty')}
                >
                  <div className="flex items-center gap-2">
                    Qty
                    {sortField === 'qty' && (
                      sortDirection === 'asc' ? <IconChevronUp className="w-4 h-4" /> : <IconChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  onClick={() => handleSort('buy')}
                >
                  <div className="flex items-center gap-2">
                    Buy
                    {sortField === 'buy' && (
                      sortDirection === 'asc' ? <IconChevronUp className="w-4 h-4" /> : <IconChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  onClick={() => handleSort('sell')}
                >
                  <div className="flex items-center gap-2">
                    Sell
                    {sortField === 'sell' && (
                      sortDirection === 'asc' ? <IconChevronUp className="w-4 h-4" /> : <IconChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  onClick={() => handleSort('netPnL')}
                >
                  <div className="flex items-center gap-2">
                    Net P&L
                    {sortField === 'netPnL' && (
                      sortDirection === 'asc' ? <IconChevronUp className="w-4 h-4" /> : <IconChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Screenshots</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    <IconFileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No trades found for the selected month and year</p>
                  </td>
                </tr>
              ) : (
                filteredTrades.map((trade) => {
                  const netPnL = trade.meta?.net || 0;
                  const status = netPnL > 0 ? 'WIN' : netPnL < 0 ? 'LOSS' : 'BE';
                  
                  return (
                    <tr key={trade.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {new Date(trade.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900 dark:text-white">{trade.symbol || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900 dark:text-white">{trade.type || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900 dark:text-white">{trade.qty || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900 dark:text-white">{trade.buy || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900 dark:text-white">{trade.sell || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-semibold ${netPnL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                          {formatCurrency(netPnL)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          status === 'WIN' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : status === 'LOSS'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400'
                        }`}>
                          {status === 'WIN' ? <IconCheck className="w-3 h-3" /> : status === 'LOSS' ? <IconX className="w-3 h-3" /> : <IconClock className="w-3 h-3" />}
                          {status}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {trade.screenshots && trade.screenshots.length > 0 ? (
                            <>
                              <IconImage className="w-4 h-4 text-blue-500" />
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                {trade.screenshots.length}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-slate-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTradeClick(trade)}
                            className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <IconEye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trade Detail Modal */}
      {showDetailModal && selectedTrade && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Trade Details</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <IconX className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">Trade Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Date:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {new Date(selectedTrade.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Symbol:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{selectedTrade.symbol || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Type:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{selectedTrade.type || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Quantity:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{selectedTrade.qty || '-'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">Price Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Buy Price:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{selectedTrade.buy || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Sell Price:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{selectedTrade.sell || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Gross P&L:</span>
                      <span className={`font-medium ${(selectedTrade.meta?.gross || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatCurrency(selectedTrade.meta?.gross || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Net P&L:</span>
                      <span className={`font-medium ${(selectedTrade.meta?.net || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatCurrency(selectedTrade.meta?.net || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">Trade Analysis</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Setup:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{selectedTrade.setup || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Emotion:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{selectedTrade.emotion || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Notes:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{selectedTrade.notes || '-'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">Charges</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Brokerage:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(selectedTrade.meta?.brokerage || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">STT:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(selectedTrade.meta?.stt || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Exchange:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(selectedTrade.meta?.exchange || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">GST:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(selectedTrade.meta?.gst || 0)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2">
                      <span className="text-slate-600 dark:text-slate-400 font-semibold">Total Charges:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(selectedTrade.meta?.totalCharges || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Screenshots */}
              {selectedTrade.screenshots && selectedTrade.screenshots.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">Screenshots</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedTrade.screenshots.map((screenshot, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={screenshot.thumbnail || screenshot.fullSize}
                          alt={screenshot.name || `Screenshot ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleScreenshotClick(screenshot)}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <IconEye className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 truncate">
                          {screenshot.name || `Screenshot ${index + 1}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Preview Modal */}
      {showScreenshotModal && selectedScreenshot && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setShowScreenshotModal(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <IconX className="w-6 h-6" />
            </button>
            <img
              src={selectedScreenshot.fullSize || selectedScreenshot.thumbnail}
              alt={selectedScreenshot.name || 'Screenshot'}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            {selectedScreenshot.name && (
              <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg">
                {selectedScreenshot.name}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsTab;
