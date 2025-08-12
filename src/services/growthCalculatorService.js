import { growthCalculatorApi } from '../lib/supabase.js'

class GrowthCalculatorService {
  constructor() {
    this.growthData = []
  }

  // Load growth data from database
  async loadGrowthData() {
    try {
      console.log('Loading growth data from database...')
      const data = await growthCalculatorApi.getGrowthData()
      console.log(`Loaded ${data.length} growth records from database`)
      
      // Transform database data to the format expected by the component
      const transformedData = data.map(item => ({
        id: item.id,
        year: item.year,
        month: this.getMonthName(item.month),
        monthNum: item.month,
        date: `${item.year}-${String(item.month).padStart(2, '0')}-01`,
        initialCapital: parseFloat(item.capital_used),
        // These will be calculated based on trades data
        pnl: 0,
        finalCapital: 0,
        growthPercentage: 0,
        trades: 0,
        wins: 0,
        losses: 0,
        winRate: 0
      }))
      
      this.growthData = transformedData
      return transformedData
    } catch (error) {
      console.error('Error loading growth data:', error)
      // Fallback to localStorage if database fails
      const saved = localStorage.getItem('growth_calculator_data')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          this.growthData = parsed.data || []
          return this.growthData
        } catch (e) {
          console.error('Error parsing saved growth data:', e)
          return []
        }
      }
      return []
    }
  }

  // Add new growth data
  async addGrowthData(year, month, capitalUsed) {
    try {
      console.log('Adding growth data:', { year, month, capitalUsed })
      
      const newData = await growthCalculatorApi.addGrowthData({
        year: parseInt(year),
        month: parseInt(month),
        capital_used: parseFloat(capitalUsed)
      })
      
      console.log('Growth data added successfully:', newData)
      
      // Reload data to get the updated list
      await this.loadGrowthData()
      
      return newData
    } catch (error) {
      console.error('Error adding growth data:', error)
      throw error
    }
  }

  // Update growth data
  async updateGrowthData(id, year, month, capitalUsed) {
    try {
      console.log('Updating growth data:', { id, year, month, capitalUsed })
      
      const updatedData = await growthCalculatorApi.updateGrowthData(id, {
        year: parseInt(year),
        month: parseInt(month),
        capital_used: parseFloat(capitalUsed)
      })
      
      console.log('Growth data updated successfully:', updatedData)
      
      // Reload data to get the updated list
      await this.loadGrowthData()
      
      return updatedData
    } catch (error) {
      console.error('Error updating growth data:', error)
      throw error
    }
  }

  // Delete growth data
  async deleteGrowthData(id) {
    try {
      console.log('Deleting growth data:', id)
      
      await growthCalculatorApi.deleteGrowthData(id)
      
      console.log('Growth data deleted successfully')
      
      // Reload data to get the updated list
      await this.loadGrowthData()
    } catch (error) {
      console.error('Error deleting growth data:', error)
      throw error
    }
  }

  // Calculate growth metrics based on trades data
  calculateGrowthMetrics(growthData, trades) {
    return growthData.map(growthItem => {
      // Filter trades for this specific month and year
      const monthTrades = trades.filter(trade => {
        const tradeDate = new Date(trade.date)
        return tradeDate.getFullYear() === growthItem.year && 
               tradeDate.getMonth() + 1 === growthItem.monthNum
      })
      
      // Calculate metrics
      const pnl = monthTrades.reduce((sum, trade) => sum + (trade.meta?.net || 0), 0)
      const finalCapital = growthItem.initialCapital + pnl
      const growthPercentage = growthItem.initialCapital > 0 ? (pnl / growthItem.initialCapital) * 100 : 0
      const wins = monthTrades.filter(trade => (trade.meta?.net || 0) > 0).length
      const losses = monthTrades.filter(trade => (trade.meta?.net || 0) < 0).length
      const winRate = monthTrades.length > 0 ? (wins / monthTrades.length) * 100 : 0
      
      return {
        ...growthItem,
        pnl,
        finalCapital,
        growthPercentage,
        trades: monthTrades.length,
        wins,
        losses,
        winRate
      }
    })
  }

  // Get month name from month number
  getMonthName(monthNum) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return months[monthNum - 1] || 'Unknown'
  }

  // Get month number from month name
  getMonthNumber(monthName) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return months.indexOf(monthName) + 1
  }

  // Get current growth data
  getGrowthData() {
    return this.growthData
  }
}

// Create singleton instance
export const growthCalculatorService = new GrowthCalculatorService()
