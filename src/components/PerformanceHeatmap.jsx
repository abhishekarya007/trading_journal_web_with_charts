import React, { useMemo, useState, useEffect, useRef } from 'react'
import { IconTrendingUp, IconTrendingDown, IconCalendar, IconBarChart, IconSparkles, IconTarget, IconZap, IconStar, IconX, IconTrendingUp2, IconTrendingDown2 } from './icons'

export default function PerformanceHeatmap({ trades, isOpen, onClose }) {
  const [selectedPeriod, setSelectedPeriod] = useState('month') // 'week', 'month'
  const [hoveredDay, setHoveredDay] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [isAnimating, setIsAnimating] = useState(false)
  
  const canvasRef = useRef(null)
  const animationRef = useRef(null)

  // Calculate data based on selected period
  const periodData = useMemo(() => {
    const today = new Date()
    const data = {}
    
    switch (selectedPeriod) {
      case 'week':
        // Show last 7 days
        for (let i = 6; i >= 0; i--) {
          const day = new Date(today)
          day.setDate(today.getDate() - i)
          const dayKey = day.toISOString().slice(0, 10)
          data[dayKey] = { trades: [], net: 0, count: 0 }
        }
        break
        
      case 'month':
      default:
        // Show last 30 days
        for (let i = 29; i >= 0; i--) {
          const day = new Date(today)
          day.setDate(today.getDate() - i)
          const dayKey = day.toISOString().slice(0, 10)
          data[dayKey] = { trades: [], net: 0, count: 0 }
        }
        break
    }
    
    // Populate with actual trade data
    trades.forEach(trade => {
      const key = trade.date
      if (data[key]) {
        data[key].trades.push(trade)
        data[key].net += trade.meta?.net || 0
        data[key].count++
      }
    })
    
    return data
  }, [trades, selectedPeriod])

  // Calculate insights and statistics
  const insights = useMemo(() => {
    const entries = Object.values(periodData)
    const activePeriods = entries.filter(entry => entry.count > 0)
    const totalNet = entries.reduce((sum, entry) => sum + entry.net, 0)
    const totalTrades = entries.reduce((sum, entry) => sum + entry.count, 0)
    const winningPeriods = activePeriods.filter(entry => entry.net > 0).length
    const winRate = activePeriods.length > 0 ? (winningPeriods / activePeriods.length) * 100 : 0
    
    // Find best and worst periods
    const bestPeriod = activePeriods.reduce((best, current) => 
      current.net > best.net ? current : best, { net: -Infinity })
    const worstPeriod = activePeriods.reduce((worst, current) => 
      current.net < worst.net ? current : worst, { net: Infinity })
    
    // Calculate streaks
    let currentStreak = 0
    let bestStreak = 0
    let tempStreak = 0
    
    entries.forEach(entry => {
      if (entry.count > 0) {
        if (entry.net > 0) {
          tempStreak++
          bestStreak = Math.max(bestStreak, tempStreak)
        } else {
          tempStreak = 0
        }
      }
    })
    
    return {
      totalNet: Math.round(totalNet * 100) / 100,
      totalTrades,
      activePeriods: activePeriods.length,
      winRate: Math.round(winRate * 100) / 100,
      bestPeriod: bestPeriod.net,
      worstPeriod: worstPeriod.net,
      bestStreak,
      avgPerPeriod: activePeriods.length > 0 ? Math.round((totalNet / activePeriods.length) * 100) / 100 : 0
    }
  }, [periodData])

  // Get grid layout for calendar
  const getGridLayout = () => {
    switch (selectedPeriod) {
      case 'week':
        return { cols: 7, rows: 1, cellSize: 80, showHeaders: true }
      case 'month':
      default:
        return { cols: 7, rows: 5, cellSize: 70, showHeaders: true }
    }
  }

  const gridLayout = getGridLayout()

  // Get period label
  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'week': return '7 Days'
      case 'month': return '30 Days'
      default: return 'Month'
    }
  }

  // Handle period change with animation
  const handlePeriodChange = (period) => {
    setIsAnimating(true)
    setSelectedPeriod(period)
    setTimeout(() => setIsAnimating(false), 500)
  }

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="relative bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-7xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
        >
          <IconX className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400" />
        </button>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header with Period Selector */}
          <div className="text-center mb-6 sm:mb-8">
            {/* Period Selector */}
            <div className="flex items-center justify-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              {['week', 'month'].map((period) => (
                <button
                  key={period}
                  onClick={() => handlePeriodChange(period)}
                  className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${
                    selectedPeriod === period
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-3 sm:p-4 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <IconTarget className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium">Total P&L</p>
                  <p className={`text-base sm:text-xl font-bold truncate ${insights.totalNet >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    ₹{insights.totalNet.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-3 sm:p-4 border border-purple-200 dark:border-purple-700">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <IconZap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-purple-600 dark:text-purple-400 text-xs sm:text-sm font-medium">Win Rate</p>
                  <p className="text-base sm:text-xl font-bold text-purple-600 dark:text-purple-400">{insights.winRate}%</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-3 sm:p-4 border border-emerald-200 dark:border-emerald-700">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <IconStar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-medium">Best Streak</p>
                  <p className="text-base sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">{insights.bestStreak}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-3 sm:p-4 border border-orange-200 dark:border-orange-700">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <IconCalendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-orange-600 dark:text-orange-400 text-xs sm:text-sm font-medium">Active Days</p>
                  <p className="text-base sm:text-xl font-bold text-orange-600 dark:text-orange-400">{insights.activePeriods}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white text-center sm:text-left">{getPeriodLabel()} Performance Calendar</h3>
              <div className="flex items-center justify-center sm:justify-end gap-3 sm:gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                  <span>Loss</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                  <span>Profit</span>
                </div>
              </div>
            </div>

            {/* Calendar Container */}
            <div className="flex justify-center overflow-x-auto">
              <div className="space-y-2 min-w-0">
                {/* Day Headers for Week and Month */}
                {gridLayout.showHeaders && (
                  <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${gridLayout.cols}, ${gridLayout.cellSize}px)` }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 py-1 sm:py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                )}

                {/* Calendar Grid */}
                <div 
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${gridLayout.cols}, ${gridLayout.cellSize}px)`,
                    gridTemplateRows: `repeat(${gridLayout.rows}, ${gridLayout.cellSize}px)`
                  }}
                >
                  {Object.entries(periodData).map(([key, data], index) => {
                    const net = data.net || 0
                    const isPositive = net > 0
                    const hasTrades = data.count > 0
                    const date = new Date(key)
                    const dayOfMonth = date.getDate()
                    
                    // Simple color coding - no intensity
                    let backgroundColor, borderColor, hoverColor
                    if (hasTrades) {
                      if (isPositive) {
                        backgroundColor = 'bg-green-500'
                        borderColor = 'border-green-400'
                        hoverColor = 'hover:bg-green-600'
                      } else {
                        backgroundColor = 'bg-red-500'
                        borderColor = 'border-red-400'
                        hoverColor = 'hover:bg-red-600'
                      }
                    } else {
                      backgroundColor = 'bg-slate-200 dark:bg-slate-700'
                      borderColor = 'border-slate-300 dark:border-slate-600'
                      hoverColor = ''
                    }
                    
                    return (
                      <div
                        key={key}
                        className={`
                          relative transition-all duration-300 transform hover:scale-105 border rounded-lg
                          ${backgroundColor} ${borderColor} ${hoverColor}
                          ${isAnimating ? 'animate-pulse' : ''}
                        `}
                        style={{
                          width: gridLayout.cellSize,
                          height: gridLayout.cellSize
                        }}
                        onMouseEnter={(e) => {
                          if (hasTrades) {
                            setHoveredDay({ key, data, net, count: data.count })
                            setTooltipPosition({ x: e.clientX, y: e.clientY })
                          }
                        }}
                        onMouseLeave={() => setHoveredDay(null)}
                      >
                        {/* Date Number */}
                        <div className="absolute top-1 left-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                          {dayOfMonth}
                        </div>
                        
                        {/* Trade Count Indicator */}
                        {hasTrades && (
                          <div className="absolute bottom-1 right-1">
                            <div className="w-2 h-2 rounded-full bg-white opacity-90"></div>
                          </div>
                        )}
                        
                        {/* Hover Glow Effect */}
                        {hoveredDay?.key === key && (
                          <div className="absolute inset-0 rounded-lg bg-white/30 animate-ping"></div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Empty State */}
            {Object.values(periodData).filter(entry => entry.count > 0).length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconCalendar className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                </div>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">No trading activity in this period</p>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500">Start trading to see your performance here!</p>
              </div>
            )}
          </div>

          {/* Performance Summary */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {/* Best vs Worst Day */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
              <h4 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-4">Performance Highlights</h4>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <IconTrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <span className="text-green-700 dark:text-green-300 font-medium text-sm sm:text-base">Best Day</span>
                  </div>
                  <span className="text-green-600 dark:text-green-400 font-bold text-sm sm:text-base">
                    ₹{insights.bestPeriod.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <IconTrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <span className="text-red-700 dark:text-red-300 font-medium text-sm sm:text-base">Worst Day</span>
                  </div>
                  <span className="text-red-600 dark:text-red-400 font-bold text-sm sm:text-base">
                    ₹{insights.worstPeriod.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Trading Statistics - Improved UI */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
              <h4 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-4">Trading Statistics</h4>
              <div className="space-y-3 sm:space-y-4">
                {/* Total Trades with Icon */}
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <IconBarChart className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <span className="text-blue-700 dark:text-blue-300 font-medium text-sm sm:text-base">Total Trades</span>
                  </div>
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-base sm:text-lg">{insights.totalTrades}</span>
                </div>

                {/* Average per Day with Icon */}
                <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                      <IconTarget className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <span className="text-emerald-700 dark:text-emerald-300 font-medium text-sm sm:text-base">Avg per Day</span>
                  </div>
                  <span className={`font-bold text-base sm:text-lg ${insights.avgPerPeriod >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    ₹{insights.avgPerPeriod.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Tooltip */}
        {hoveredDay && (
          <div
            className="fixed z-50 bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-2xl pointer-events-none"
            style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y - 10,
              transform: 'translateY(-50%)'
            }}
          >
            <div className="text-slate-900 dark:text-white">
              <p className="font-bold text-blue-600 dark:text-blue-400">{hoveredDay.key}</p>
              <p className="text-sm">Trades: {hoveredDay.count}</p>
              <p className={`text-sm font-bold ${hoveredDay.net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                Net: ₹{hoveredDay.net.toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

