import { tradesApi } from '../lib/supabase.js'
import { calcTradeCharges } from '../utils/calc.js'

class TradeService {
  constructor() {
    this.trades = []
    this.isLoading = false
    this.error = null
  }

  // Load trades from Supabase
  async loadTrades() {
    try {
      this.isLoading = true
      this.error = null
      
      const trades = await tradesApi.getTrades()
      
      // Transform data to match your current format
      this.trades = trades.map(trade => ({
        id: trade.id,
        date: trade.date,
        symbol: trade.symbol,
        type: trade.type,
        qty: trade.qty,
        buy: trade.buy,
        sell: trade.sell,
        trend: trade.trend,
        rule: trade.rule,
        emotion: trade.emotion,
        riskReward: trade.risk_reward,
        setup: trade.setup,
        remarks: trade.remarks,
        screenshots: trade.screenshots || [],
        meta: trade.meta || {}
      }))
      
      return this.trades
    } catch (error) {
      console.error('Error loading trades:', error)
      this.error = error.message
      throw error
    } finally {
      this.isLoading = false
    }
  }

  // Add new trade
  async addTrade(tradeData) {
    try {
      // Calculate charges
      const meta = calcTradeCharges(tradeData)
      
      // Prepare data for Supabase
      const tradeForDb = {
        date: tradeData.date,
        symbol: tradeData.symbol,
        type: tradeData.type,
        qty: parseInt(tradeData.qty),
        buy: parseFloat(tradeData.buy),
        sell: parseFloat(tradeData.sell),
        trend: tradeData.trend,
        rule: tradeData.rule,
        emotion: tradeData.emotion,
        risk_reward: tradeData.riskReward,
        setup: tradeData.setup,
        remarks: tradeData.remarks,
        screenshots: tradeData.screenshots || [],
        meta: meta
      }

      const newTrade = await tradesApi.addTrade(tradeForDb)
      
      // Transform back to app format
      const transformedTrade = {
        id: newTrade.id,
        date: newTrade.date,
        symbol: newTrade.symbol,
        type: newTrade.type,
        qty: newTrade.qty,
        buy: newTrade.buy,
        sell: newTrade.sell,
        trend: newTrade.trend,
        rule: newTrade.rule,
        emotion: newTrade.emotion,
        riskReward: newTrade.risk_reward,
        setup: newTrade.setup,
        remarks: newTrade.remarks,
        screenshots: newTrade.screenshots || [],
        meta: newTrade.meta || {}
      }

      // Add to local array
      this.trades.unshift(transformedTrade)
      
      return transformedTrade
    } catch (error) {
      console.error('Error adding trade:', error)
      throw error
    }
  }

  // Update trade
  async updateTrade(id, updates) {
    try {
      // Calculate charges if prices changed
      let meta = updates.meta
      if (updates.buy || updates.sell) {
        const existingTrade = this.trades.find(t => t.id === id)
        const tradeData = { ...existingTrade, ...updates }
        meta = calcTradeCharges(tradeData)
      }

      // Prepare data for Supabase
      const updatesForDb = {
        ...updates,
        meta: meta
      }

      // Convert camelCase to snake_case for database
      if (updates.riskReward) {
        updatesForDb.risk_reward = updates.riskReward
        delete updatesForDb.riskReward
      }

      const updatedTrade = await tradesApi.updateTrade(id, updatesForDb)
      
      // Transform back to app format
      const transformedTrade = {
        id: updatedTrade.id,
        date: updatedTrade.date,
        symbol: updatedTrade.symbol,
        type: updatedTrade.type,
        qty: updatedTrade.qty,
        buy: updatedTrade.buy,
        sell: updatedTrade.sell,
        trend: updatedTrade.trend,
        rule: updatedTrade.rule,
        emotion: updatedTrade.emotion,
        riskReward: updatedTrade.risk_reward,
        setup: updatedTrade.setup,
        remarks: updatedTrade.remarks,
        screenshots: updatedTrade.screenshots || [],
        meta: updatedTrade.meta || {}
      }

      // Update local array
      const index = this.trades.findIndex(t => t.id === id)
      if (index !== -1) {
        this.trades[index] = transformedTrade
      }
      
      return transformedTrade
    } catch (error) {
      console.error('Error updating trade:', error)
      throw error
    }
  }

  // Delete trade
  async deleteTrade(id) {
    try {
      await tradesApi.deleteTrade(id)
      
      // Remove from local array
      this.trades = this.trades.filter(t => t.id !== id)
    } catch (error) {
      console.error('Error deleting trade:', error)
      throw error
    }
  }

  // Get all trades
  getTrades() {
    return this.trades
  }

  // Get trade by ID
  getTrade(id) {
    return this.trades.find(t => t.id === id)
  }

  // Get loading state
  getLoadingState() {
    return {
      isLoading: this.isLoading,
      error: this.error
    }
  }
}

// Create singleton instance
export const tradeService = new TradeService()
