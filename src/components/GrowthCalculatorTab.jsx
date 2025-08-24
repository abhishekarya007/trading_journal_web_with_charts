import React, { useState, useEffect, useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Chart } from 'chart.js';

// Register the zoom plugin
Chart.register(zoomPlugin);
import * as XLSX from 'xlsx';
import { growthCalculatorService } from '../services/growthCalculatorService.js';
import { 
  IconTrendingUp, 
  IconTrendingDown, 
  IconDownload, 
  IconUpload, 
  IconCalendar,
  IconRupee,
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
  IconChevronDown,
  IconRefresh,
  IconEdit,
  IconTrash,
  IconImage,
  IconFileText
} from './icons';

const GrowthCalculatorTab = ({ trades, growthData, setGrowthData, recalculateMetrics, loadGrowthData, formatNumber, formatCurrency, showToast, playSuccessSound, playDeleteSound }) => {
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('asc');
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [enlargedChart, setEnlargedChart] = useState(null);
  const [enlargedChartData, setEnlargedChartData] = useState(null);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    capitalUsed: ''
  });

  // Auto-select latest month when data changes
  useEffect(() => {
    if (growthData.length > 0 && !selectedMonth) {
      const latestMonth = growthData.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      if (latestMonth) {
        setSelectedMonth(latestMonth.id);
      }
    }
  }, [growthData, selectedMonth]);

  const handleChartClick = (chartType, data, title) => {
    setEnlargedChart(chartType);
    setEnlargedChartData({ data, title });
  };

  const closeEnlargedChart = () => {
    setEnlargedChart(null);
    setEnlargedChartData(null);
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
        link.download = `${enlargedChartData.title.replace(/\s+/g, '_')}_Growth_Calculator.${format}`;
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

      pdf.save(`${enlargedChartData.title.replace(/\s+/g, '_')}_Growth_Calculator.pdf`);
    } catch (error) {
      console.error('Error exporting chart as PDF:', error);
    }
  };

  // Enhanced chart options for enlarged view with zoom and pan
  const enlargedChartOptions = {
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
            if (context.dataset.label === 'Growth %') {
              return `${label}: ${formatNumber(value)}%`;
            }
            return `${label}: ${formatCurrency(value)}`;
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
            if (enlargedChart === 'growth') {
              return formatNumber(value) + '%';
            }
            return formatCurrency(value);
          }
        }
      }
    }
  };

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

  // Auto-select earliest month when growth data changes
  useEffect(() => {
    if (growthData.length > 0 && !selectedMonth) {
      const earliestMonth = growthData.sort((a, b) => new Date(a.date) - new Date(b.date))[0];
      if (earliestMonth) {
        setSelectedMonth(earliestMonth.id);
      }
    }
  }, [growthData, selectedMonth]);

  // Recalculate metrics whenever component mounts (when user navigates to this tab)
  useEffect(() => {
    if (growthData.length > 0 && trades.length > 0) {
      recalculateMetrics();
    }
  }, []); // Empty dependency array means it runs once when component mounts



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

  // Add new growth data
  const handleAddGrowthData = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      await growthCalculatorService.addGrowthData(
        formData.year,
        formData.month,
        formData.capitalUsed
      );
      
      // Reload data from parent
      await loadGrowthData();
      
      // Reset form
      setFormData({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        capitalUsed: ''
      });
      
      setShowAddModal(false);
      if (showToast) {
        showToast('Growth data added successfully!', 'success');
      }
      if (playSuccessSound) {
        playSuccessSound();
      }
    } catch (error) {
      console.error('Error adding growth data:', error);
      if (showToast) {
        showToast('Failed to add growth data. Please try again.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Edit growth data
  const handleEditGrowthData = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      await growthCalculatorService.updateGrowthData(
        editingItem.id,
        formData.year,
        formData.month,
        formData.capitalUsed
      );
      
      // Reload data from parent
      await loadGrowthData();
      
      // Reset form
      setFormData({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        capitalUsed: ''
      });
      
      setShowEditModal(false);
      setEditingItem(null);
      if (showToast) {
        showToast('Growth data updated successfully!', 'success');
      }
      if (playSuccessSound) {
        playSuccessSound();
      }
    } catch (error) {
      console.error('Error updating growth data:', error);
      if (showToast) {
        showToast('Failed to update growth data. Please try again.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show delete confirmation
  const showDeleteConfirmation = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      setIsLoading(true);
      
      await growthCalculatorService.deleteGrowthData(deleteId);
      
      // Reload data from parent
      await loadGrowthData();
      
      if (showToast) {
        showToast('Growth data deleted successfully!', 'success');
      }
      if (playDeleteSound) {
        playDeleteSound();
      }
    } catch (error) {
      console.error('Error deleting growth data:', error);
      if (showToast) {
        showToast('Failed to delete growth data. Please try again.', 'error');
      }
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  // Open edit modal
  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      year: item.year,
      month: item.monthNum,
      capitalUsed: item.initialCapital.toString()
    });
    setShowEditModal(true);
  };

  // Import functionality
  const importExcel = async (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setIsLoading(true);
        
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
            year,
            monthNum,
            capitalUsed: capital
          };
        });

        // Save each imported record to database
        console.log('Importing growth data to database:', importedData);
        
        for (const record of importedData) {
          try {
            await growthCalculatorService.addGrowthData(
              record.year,
              record.monthNum,
              record.capitalUsed
            );
          } catch (error) {
            console.error('Error importing record:', record, error);
            // Continue with other records even if one fails
          }
        }

        // Reload data from parent
        await loadGrowthData();
        
        setShowImportMenu(false);
        if (showToast) {
          showToast(`Successfully imported ${importedData.length} growth records!`, 'success');
        }
        if (playSuccessSound) {
          playSuccessSound();
        }
      } catch (error) {
        console.error('Error importing Excel file:', error);
        if (showToast) {
          showToast('Error importing file. Please check the format. Expected columns: Year, Month, Capital', 'error');
        }
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
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

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      
      // Use parent's recalculate function
      recalculateMetrics();
      
      if (showToast) {
        showToast('Metrics recalculated successfully!', 'success');
      }
      if (playSuccessSound) {
        playSuccessSound();
      }
    } catch (error) {
      console.error('Error recalculating metrics:', error);
      if (showToast) {
        showToast('Failed to recalculate metrics. Please try again.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
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

    // Get the selected month data or the earliest month if none selected
    const selectedData = selectedMonth 
      ? sortedData.find(item => item.id === selectedMonth)
      : sortedData[0];

    if (!selectedData) return null;

    // Calculate totals for all data
    const totalPnL = sortedData.reduce((sum, item) => sum + item.pnl, 0);
    const totalGrowth = ((sortedData[sortedData.length - 1]?.finalCapital || 20000) - (sortedData[0]?.initialCapital || 20000)) / (sortedData[0]?.initialCapital || 20000) * 100;
    const totalTrades = sortedData.reduce((sum, item) => sum + item.trades, 0);

    return {
      // Selected month data
      selectedMonth: selectedData.month,
      selectedYear: selectedData.year,
      selectedPnL: selectedData.pnl,
      selectedGrowth: selectedData.growthPercentage,
      selectedTrades: selectedData.trades,
      selectedWinRate: selectedData.winRate,
      selectedCapitalUsed: selectedData.initialCapital,
      selectedFinalCapital: selectedData.finalCapital,
      // Overall data
      totalPnL,
      totalGrowth,
      totalTrades
    };
  }, [sortedData, selectedMonth]);

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-white/10 rounded-full -translate-y-8 sm:-translate-y-12 lg:-translate-y-16 translate-x-8 sm:translate-x-12 lg:translate-x-16 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-24 lg:h-24 bg-white/10 rounded-full translate-y-6 sm:translate-y-8 lg:translate-y-12 -translate-x-6 sm:-translate-x-8 lg:-translate-x-12 animate-bounce"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <IconChartBar className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Growth Calculator</h1>
              <p className="text-sm sm:text-base text-indigo-100">Track your capital growth journey over time</p>
            </div>
          </div>

          {/* Summary Cards */}
          {summaryMetrics && (
            <>
              {/* Selected Month Header */}
              <div className="mb-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                  <IconCalendar className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-200" />
                  <span className="text-sm sm:text-lg font-semibold text-white">
                    {summaryMetrics.selectedMonth} {summaryMetrics.selectedYear}
                  </span>
                  {selectedMonth && (
                    <button
                      onClick={() => setSelectedMonth(null)}
                      className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors"
                      title="Show earliest month"
                    >
                      <IconX className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-200" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <IconRupee className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-300" />
                    <div>
                      <div className="text-lg sm:text-2xl font-bold">{formatCurrency(summaryMetrics.selectedFinalCapital)}</div>
                      <div className="text-indigo-100 text-xs sm:text-sm">Final Capital</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <IconTarget className="w-4 h-4 sm:w-6 sm:h-6 text-blue-300" />
                    <div>
                      <div className="text-lg sm:text-2xl font-bold">{formatCurrency(summaryMetrics.selectedCapitalUsed)}</div>
                      <div className="text-indigo-100 text-xs sm:text-sm">Capital Used</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <IconTrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-300" />
                    <div>
                      <div className="text-lg sm:text-2xl font-bold">{formatNumber(summaryMetrics.selectedGrowth)}%</div>
                      <div className="text-indigo-100 text-xs sm:text-sm">Growth</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <IconTrophy className="w-4 h-4 sm:w-6 sm:h-6 text-purple-300" />
                    <div>
                      <div className="text-lg sm:text-2xl font-bold">{summaryMetrics.selectedTrades}</div>
                      <div className="text-indigo-100 text-xs sm:text-sm">Trades</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Growth Data Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Growth Data</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Detailed monthly breakdown</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              {/* Add New Button */}
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
              >
                <IconPlus className="w-4 h-4" />
                <span>Add New</span>
              </button>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                className="btn btn-secondary flex items-center justify-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-200 dark:from-blue-700 dark:to-indigo-600 hover:from-blue-200 hover:to-indigo-300 dark:hover:from-blue-600 dark:hover:to-indigo-500 text-blue-700 dark:text-blue-200 px-3 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
                title="Recalculate metrics based on current trades"
              >
                <IconRefresh className="w-4 h-4" />
                <span>Recalculate Metrics</span>
              </button>

              {/* Import Button */}
              <div className="relative w-full sm:w-auto">
                <button
                  onClick={() => setShowImportMenu(!showImportMenu)}
                  className="btn btn-secondary flex items-center justify-center gap-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-500 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto"
                >
                  <IconUpload className="w-4 h-4" />
                  <span>Import</span>
                </button>

                {showImportMenu && (
                  <div className="absolute right-0 sm:right-0 left-0 sm:left-auto mt-2 w-full sm:w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
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
                className="btn btn-primary flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-3 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
              >
                <IconDownload className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('date')}
                    className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200"
                    title={getSortTooltip('date')}
                  >
                    <span>Period</span>
                    {getSortIcon('date')}
                  </button>
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('initialCapital')}
                    className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200"
                    title={getSortTooltip('initialCapital')}
                  >
                    <span>Capital Used</span>
                    {getSortIcon('initialCapital')}
                  </button>
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('pnl')}
                    className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200"
                    title={getSortTooltip('pnl')}
                  >
                    <span>P&L</span>
                    {getSortIcon('pnl')}
                  </button>
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('finalCapital')}
                    className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200"
                    title={getSortTooltip('finalCapital')}
                  >
                    <span>Final Capital</span>
                    {getSortIcon('finalCapital')}
                  </button>
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('growthPercentage')}
                    className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200"
                    title={getSortTooltip('growthPercentage')}
                  >
                    <span>Growth %</span>
                    {getSortIcon('growthPercentage')}
                  </button>
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('trades')}
                    className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200"
                    title={getSortTooltip('trades')}
                  >
                    <span>Trades</span>
                    {getSortIcon('trades')}
                  </button>
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('winRate')}
                    className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200"
                    title={getSortTooltip('winRate')}
                  >
                    <span>Win Rate</span>
                    {getSortIcon('winRate')}
                  </button>
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {sortedData.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-300 cursor-pointer hover:shadow-md ${
                    selectedMonth === item.id ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedMonth(item.id)}
                  title="Click to view this month's details"
                >
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">{item.month} {item.year}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">{formatCurrency(item.initialCapital)}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className={`font-semibold text-sm sm:text-base ${item.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(item.pnl)}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">{formatCurrency(item.finalCapital)}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className={`font-semibold text-sm sm:text-base ${item.growthPercentage >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatNumber(item.growthPercentage)}%
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">{item.trades}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">{formatNumber(item.winRate)}%</div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-1 sm:gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1 sm:p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <IconEdit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => showDeleteConfirmation(item.id)}
                        className="p-1 sm:p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <IconTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Capital Used Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Capital Used Over Time</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Track your capital utilization</p>
              </div>
              <button 
                onClick={() => handleChartClick('capital', chartData.capitalUsed, 'Capital Used Over Time')}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600"
                title="Enlarge chart"
              >
                <IconChartBar className="w-3 h-3 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
          <div 
            className="p-4 sm:p-6"
            onClick={() => handleChartClick('capital', chartData.capitalUsed, 'Capital Used Over Time')}
          >
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
        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Monthly Growth %</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Percentage growth or loss by month</p>
              </div>
              <button 
                onClick={() => handleChartClick('growth', chartData.growthPercentage, 'Monthly Growth Percentage')}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600"
                title="Enlarge chart"
              >
                <IconChartBar className="w-3 h-3 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
          <div 
            className="p-4 sm:p-6"
            onClick={() => handleChartClick('growth', chartData.growthPercentage, 'Monthly Growth Percentage')}
          >
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



      {/* Add Growth Data Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Growth Data</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGrowthData} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="2020"
                  max="2030"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Month
                </label>
                <select
                  value={formData.month}
                  onChange={(e) => setFormData(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
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

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Capital Used
                </label>
                <input
                  type="number"
                  value={formData.capitalUsed}
                  onChange={(e) => setFormData(prev => ({ ...prev, capitalUsed: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter capital amount"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? 'Adding...' : 'Add Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Growth Data Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Growth Data</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditGrowthData} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="2020"
                  max="2030"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Month
                </label>
                <select
                  value={formData.month}
                  onChange={(e) => setFormData(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
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

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Capital Used
                </label>
                <input
                  type="number"
                  value={formData.capitalUsed}
                  onChange={(e) => setFormData(prev => ({ ...prev, capitalUsed: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter capital amount"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? 'Updating...' : 'Update Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <IconTrash className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Growth Data</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Are you sure you want to delete this growth data? This will permanently remove the record and all associated calculations.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteId(null);
                }}
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Chart Modal */}
      {enlargedChart && enlargedChartData && (
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
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{enlargedChartData.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Growth Calculator Analysis</p>
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
                  className="w-8 h-8 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <span className="text-slate-600 dark:text-slate-400 text-lg font-bold">×</span>
                </button>
              </div>
            </div>
            
            <div className="h-96 sm:h-[500px] lg:h-[600px]">
              {enlargedChart === 'capital' && (
                <Line
                  data={enlargedChartData.data}
                  options={enlargedChartOptions}
                  data-chart-id={enlargedChart}
                />
              )}
              {enlargedChart === 'growth' && (
                <Bar
                  data={enlargedChartData.data}
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
};

export default GrowthCalculatorTab;
