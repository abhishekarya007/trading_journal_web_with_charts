import React, { useMemo, useState, useEffect, useRef } from 'react'
import { IconTrendingUp, IconTrendingDown, IconCalendar, IconBarChart, IconSparkles, IconTarget, IconZap, IconStar, IconX } from './icons'

export default function PerformanceHeatmap({ trades, isOpen, onClose }) {
  const [selectedPeriod, setSelectedPeriod] = useState('month') // 'week', 'month', 'year'
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
        // Show last 30 days
        for (let i = 29; i >= 0; i--) {
          const day = new Date(today)
          day.setDate(today.getDate() - i)
          const dayKey = day.toISOString().slice(0, 10)
          data[dayKey] = { trades: [], net: 0, count: 0 }
        }
        break
        
      case 'year':
      default:
        // Show last 365 days
        for (let i = 364; i >= 0; i--) {
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

  // Generate creative visual elements
  const visualElements = useMemo(() => {
    const elements = []
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']
    
    Object.entries(periodData).forEach(([key, data], index) => {
      if (data.count > 0) {
        const intensity = Math.min(Math.abs(data.net) / 1000, 1) // Normalize intensity
        const colorIndex = Math.floor(Math.random() * colors.length)
        const size = Math.max(0.3, intensity * 0.8)
        
        elements.push({
          key,
          data,
          color: colors[colorIndex],
          size,
          intensity,
          x: Math.random() * 100,
          y: Math.random() * 100,
          rotation: Math.random() * 360,
          pulse: Math.random() > 0.5
        })
      }
    })
    
    return elements
  }, [periodData])

  // Animate canvas elements
  useEffect(() => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
      
      // Draw animated background particles
      visualElements.forEach((element, index) => {
        const time = Date.now() * 0.001
        const x = (element.x + Math.sin(time + index) * 20) % canvas.offsetWidth
        const y = (element.y + Math.cos(time + index) * 15) % canvas.offsetHeight
        
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(element.rotation + time * 30)
        
        // Create gradient
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, element.size * 50)
        gradient.addColorStop(0, `${element.color}80`)
        gradient.addColorStop(0.7, `${element.color}40`)
        gradient.addColorStop(1, 'transparent')
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(0, 0, element.size * 50, 0, Math.PI * 2)
        ctx.fill()
        
        // Add sparkle effect
        if (element.pulse && Math.sin(time * 3 + index) > 0.8) {
          ctx.fillStyle = '#ffffff'
          ctx.beginPath()
          ctx.arc(0, 0, 3, 0, Math.PI * 2)
          ctx.fill()
        }
        
        ctx.restore()
      })
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [visualElements])

  // Get grid layout
  const getGridLayout = () => {
    switch (selectedPeriod) {
      case 'week':
        return { cols: 7, rows: 1, cellSize: 80 }
      case 'month':
        return { cols: 6, rows: 5, cellSize: 70 }
      case 'year':
        return { cols: 53, rows: 7, cellSize: 12 }
      default:
        return { cols: 6, rows: 5, cellSize: 70 }
    }
  }

  const gridLayout = getGridLayout()

  // Handle period change with animation
  const handlePeriodChange = (period) => {
    setIsAnimating(true)
    setSelectedPeriod(period)
    setTimeout(() => setIsAnimating(false), 500)
  }

  // Get period label
  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'week': return '7 Days'
      case 'month': return '30 Days'
      case 'year': return '365 Days'
      default: return 'Month'
    }
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
        >
          <IconX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <IconBarChart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Performance Heatmap
                </h2>
                <p className="text-gray-600 dark:text-gray-400">Visualize your trading performance</p>
              </div>
            </div>

            {/* Period Selector */}
            <div className="flex items-center justify-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              {['week', 'month', 'year'].map((period) => (
                <button
                  key={period}
                  onClick={() => handlePeriodChange(period)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    selectedPeriod === period
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <IconTarget className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total P&L</p>
                  <p className={`text-xl font-bold ${insights.totalNet >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    ₹{insights.totalNet.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <IconZap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Win Rate</p>
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{insights.winRate}%</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <IconStar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">Best Streak</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{insights.bestStreak}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200 dark:border-orange-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <IconCalendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Active Days</p>
                  <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{insights.activePeriods}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Heatmap Grid */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{getPeriodLabel()} Performance</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Loss</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Profit</span>
                </div>
              </div>
            </div>

            {/* Grid Container */}
            <div className="flex justify-center">
              <div 
                className="grid gap-1"
                style={{
                  gridTemplateColumns: `repeat(${gridLayout.cols}, ${gridLayout.cellSize}px)`,
                  gridTemplateRows: `repeat(${gridLayout.rows}, ${gridLayout.cellSize}px)`
                }}
              >
                {Object.entries(periodData).map(([key, data], index) => {
                  const net = data.net || 0
                  const intensity = Math.min(Math.abs(net) / 1000, 1)
                  const isPositive = net > 0
                  const hasTrades = data.count > 0
                  
                  return (
                    <div
                      key={key}
                      className={`
                        relative transition-all duration-300 transform hover:scale-105
                        ${hasTrades ? 'hover:shadow-lg cursor-pointer' : ''}
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
                      <div
                        className={`
                          w-full h-full rounded-lg border transition-all duration-300
                          ${hasTrades 
                            ? isPositive 
                              ? 'bg-green-500 border-green-400' 
                              : 'bg-red-500 border-red-400'
                            : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                          }
                        `}
                        style={{
                          opacity: hasTrades ? 0.3 + (intensity * 0.7) : 0.3
                        }}
                      />
                      
                      {/* Trade count indicator */}
                      {hasTrades && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full opacity-90"></div>
                        </div>
                      )}
                      
                      {/* Hover glow effect */}
                      {hoveredDay?.key === key && (
                        <div className="absolute inset-0 rounded-lg bg-white/30 animate-ping"></div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Interactive Legend */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              💡 Hover over colored cells to see trading details
            </p>
          </div>

          {/* Floating Tooltip */}
          {hoveredDay && (
            <div
              className="fixed z-50 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-2xl pointer-events-none"
              style={{
                left: tooltipPosition.x + 10,
                top: tooltipPosition.y - 10,
                transform: 'translateY(-50%)'
              }}
            >
              <div className="text-gray-900 dark:text-white">
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
    </div>
  )
}

