// Smart Automation Service
// Provides intelligent automation features for the trading journal

class AutomationService {
  constructor() {
    this.automationRules = new Map();
    this.insights = [];
    this.alerts = [];
    this.lastAnalysis = null;
    this.userPreferences = this.loadUserPreferences();
  }

  // Auto-categorization system
  categorizeTrade(trade) {
    if (!trade || typeof trade !== 'object') {
      return {
        setup: 'Unknown',
        riskLevel: 'Low',
        marketCondition: 'Normal',
        timeOfDay: 'Regular Hours',
        emotionalState: 'Unknown',
        quality: 'Poor'
      };
    }

    const categories = {
      setup: this.detectSetupType(trade),
      riskLevel: this.assessTradeRisk(trade),
      marketCondition: this.detectMarketCondition(trade),
      timeOfDay: this.getTimeCategory(trade),
      emotionalState: this.detectEmotionalState(trade),
      quality: this.assessTradeQuality(trade)
    };

    return categories;
  }

  // Detect setup type from trade data
  detectSetupType(trade) {
    const entry = trade.entry?.toLowerCase() || '';
    const notes = trade.notes?.toLowerCase() || '';
    const combined = `${entry} ${notes}`;

    // Pattern matching for common setups
    const patterns = [
      { name: 'Breakout', keywords: ['breakout', 'break out', 'resistance break', 'support break'] },
      { name: 'Pullback', keywords: ['pullback', 'retracement', 'dip buy', 'buy the dip'] },
      { name: 'Reversal', keywords: ['reversal', 'trend change', 'bottom', 'top', 'hammer', 'doji'] },
      { name: 'Momentum', keywords: ['momentum', 'continuation', 'trend follow', 'moving average'] },
      { name: 'Gap Fill', keywords: ['gap', 'gap fill', 'overnight gap'] },
      { name: 'Support/Resistance', keywords: ['support', 'resistance', 'level', 'bounce'] },
      { name: 'Pattern', keywords: ['triangle', 'flag', 'pennant', 'wedge', 'head and shoulders'] },
      { name: 'News', keywords: ['news', 'earnings', 'announcement', 'event'] }
    ];

    for (const pattern of patterns) {
      if (pattern.keywords.some(keyword => combined.includes(keyword))) {
        return pattern.name;
      }
    }

    return trade.setup || 'Unknown';
  }

  // Assess trade risk level
  assessTradeRisk(trade) {
    const amount = Math.abs(trade.meta?.net || 0);
    const riskReward = trade.meta?.riskReward || trade.risk_reward || 0;
    
    let riskScore = 0;
    
    // High amount = higher risk
    if (amount > 5000) riskScore += 3;
    else if (amount > 2000) riskScore += 2;
    else if (amount > 1000) riskScore += 1;
    
    // Poor risk-reward = higher risk
    if (riskReward < 1) riskScore += 3;
    else if (riskReward < 1.5) riskScore += 1;
    
    if (riskScore >= 5) return 'High';
    if (riskScore >= 3) return 'Medium';
    return 'Low';
  }

  // Detect market condition based on trade performance
  detectMarketCondition(trade) {
    // This would ideally use market data, but for now we'll infer from trade
    const profit = trade.meta?.net || 0;
    const notes = trade.notes?.toLowerCase() || '';
    
    if (notes.includes('trending') || notes.includes('momentum')) return 'Trending';
    if (notes.includes('range') || notes.includes('sideways')) return 'Ranging';
    if (notes.includes('volatile') || notes.includes('choppy')) return 'Volatile';
    
    return 'Normal';
  }

  // Get time category
  getTimeCategory(trade) {
    const date = new Date(trade.date);
    const hour = date.getHours();
    
    if (hour >= 9 && hour < 11) return 'Market Open';
    if (hour >= 11 && hour < 14) return 'Mid Day';
    if (hour >= 14 && hour < 16) return 'Market Close';
    if (hour >= 16 || hour < 9) return 'After Hours';
    
    return 'Regular Hours';
  }

  // Detect emotional state from psychology data
  detectEmotionalState(trade) {
    // This would correlate with psychology data if available
    const notes = trade.notes?.toLowerCase() || '';
    
    if (notes.includes('confident') || notes.includes('calm')) return 'Positive';
    if (notes.includes('fear') || notes.includes('panic') || notes.includes('fomo')) return 'Negative';
    if (notes.includes('neutral') || notes.includes('disciplined')) return 'Neutral';
    
    return 'Unknown';
  }

  // Assess overall trade quality
  assessTradeQuality(trade) {
    const profit = trade.meta?.net || 0;
    const riskReward = trade.meta?.riskReward || trade.risk_reward || 0;
    const hasNotes = trade.notes && trade.notes.length > 10;
    const hasScreenshot = trade.screenshots && trade.screenshots.length > 0;
    
    let qualityScore = 0;
    
    // Profitable trade
    if (profit > 0) qualityScore += 2;
    
    // Good risk-reward
    if (riskReward >= 2) qualityScore += 2;
    else if (riskReward >= 1.5) qualityScore += 1;
    
    // Well documented
    if (hasNotes) qualityScore += 1;
    if (hasScreenshot) qualityScore += 1;
    
    if (qualityScore >= 5) return 'Excellent';
    if (qualityScore >= 3) return 'Good';
    if (qualityScore >= 1) return 'Fair';
    return 'Poor';
  }

  // Generate automated insights
  generateAutomatedInsights(trades, psychologyData, timeframe = 'week') {
    const insights = [];
    
    // Validate inputs
    if (!trades || !Array.isArray(trades)) {
      console.warn('Invalid trades data provided to generateAutomatedInsights');
      return insights;
    }
    
    const recentTrades = this.getRecentTrades(trades, timeframe);
    
    if (recentTrades.length === 0) return insights;

    try {
      // Performance insights
      insights.push(...this.generatePerformanceInsights(recentTrades));
      
      // Pattern insights
      insights.push(...this.generatePatternInsights(recentTrades));
      
      // Risk insights
      insights.push(...this.generateRiskInsights(recentTrades));
      
      // Behavioral insights
      insights.push(...this.generateBehavioralInsights(recentTrades, psychologyData));
      
      // Time-based insights
      insights.push(...this.generateTimeInsights(recentTrades));
    } catch (error) {
      console.error('Error generating insights:', error);
    }

    return insights.sort((a, b) => b.priority - a.priority);
  }

  // Performance insights
  generatePerformanceInsights(trades) {
    const insights = [];
    const profits = trades.map(t => t.meta?.net || 0);
    const totalProfit = profits.reduce((sum, p) => sum + p, 0);
    const wins = trades.filter(t => (t.meta?.net || 0) > 0).length;
    const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;
    
    // Win rate insights
    if (winRate >= 70) {
      insights.push({
        id: 'high_win_rate',
        type: 'positive',
        title: 'Exceptional Performance',
        message: `Outstanding ${winRate.toFixed(1)}% win rate this period! Your strategy is working excellently.`,
        action: 'Continue with current approach and consider increasing position sizes.',
        priority: 9,
        category: 'performance',
        timestamp: Date.now()
      });
    } else if (winRate < 40) {
      insights.push({
        id: 'low_win_rate',
        type: 'warning',
        title: 'Win Rate Concern',
        message: `Win rate of ${winRate.toFixed(1)}% is below optimal levels. Review your entry criteria.`,
        action: 'Analyze losing trades and tighten entry requirements.',
        priority: 8,
        category: 'performance',
        timestamp: Date.now()
      });
    }

    // Profit insights
    if (totalProfit > 0) {
      insights.push({
        id: 'profitable_period',
        type: 'positive',
        title: 'Profitable Trading Period',
        message: `Generated ₹${totalProfit.toFixed(2)} profit with ${trades.length} trades.`,
        action: 'Review what worked well and document successful strategies.',
        priority: 7,
        category: 'performance',
        timestamp: Date.now()
      });
    }

    return insights;
  }

  // Pattern insights
  generatePatternInsights(trades) {
    const insights = [];
    const setups = {};
    
    trades.forEach(trade => {
      const setup = this.detectSetupType(trade);
      if (!setups[setup]) setups[setup] = { total: 0, wins: 0, profit: 0 };
      setups[setup].total++;
      if ((trade.meta?.net || 0) > 0) setups[setup].wins++;
      setups[setup].profit += (trade.meta?.net || 0);
    });

    // Find best and worst setups
    const setupStats = Object.entries(setups).map(([setup, stats]) => ({
      setup,
      winRate: (stats.wins / stats.total) * 100,
      profit: stats.profit,
      total: stats.total
    }));

    const bestSetup = setupStats.reduce((best, current) => 
      current.winRate > best.winRate ? current : best, setupStats[0]);
    
    const worstSetup = setupStats.reduce((worst, current) => 
      current.winRate < worst.winRate ? current : worst, setupStats[0]);

    if (bestSetup && bestSetup.total >= 3) {
      insights.push({
        id: 'best_setup',
        type: 'positive',
        title: 'Top Performing Setup',
        message: `${bestSetup.setup} setup has ${bestSetup.winRate.toFixed(1)}% win rate (${bestSetup.total} trades).`,
        action: `Focus more on ${bestSetup.setup} setups for better results.`,
        priority: 8,
        category: 'pattern',
        timestamp: Date.now()
      });
    }

    if (worstSetup && worstSetup.total >= 3 && worstSetup.winRate < 30) {
      insights.push({
        id: 'worst_setup',
        type: 'warning',
        title: 'Underperforming Setup',
        message: `${worstSetup.setup} setup has low ${worstSetup.winRate.toFixed(1)}% win rate.`,
        action: `Avoid or refine ${worstSetup.setup} strategy.`,
        priority: 7,
        category: 'pattern',
        timestamp: Date.now()
      });
    }

    return insights;
  }

  // Risk insights
  generateRiskInsights(trades) {
    const insights = [];
    const highRiskTrades = trades.filter(t => this.assessTradeRisk(t) === 'High').length;
    const avgAmount = trades.reduce((sum, t) => sum + Math.abs(t.meta?.net || 0), 0) / trades.length;

    if (highRiskTrades >= trades.length * 0.3) {
      insights.push({
        id: 'high_risk_warning',
        type: 'warning',
        title: 'High Risk Trading Detected',
        message: `${highRiskTrades} out of ${trades.length} trades are high risk.`,
        action: 'Consider reducing position sizes and improving risk management.',
        priority: 9,
        category: 'risk',
        timestamp: Date.now()
      });
    }

    if (avgAmount > 3000) {
      insights.push({
        id: 'large_position_warning',
        type: 'info',
        title: 'Large Average Position Size',
        message: `Average trade amount is ₹${avgAmount.toFixed(2)}.`,
        action: 'Ensure position sizing aligns with your risk tolerance.',
        priority: 6,
        category: 'risk',
        timestamp: Date.now()
      });
    }

    return insights;
  }

  // Behavioral insights
  generateBehavioralInsights(trades, psychologyData) {
    const insights = [];
    
    // Trading frequency
    const avgTradesPerDay = this.calculateTradingFrequency(trades);
    if (avgTradesPerDay > 5) {
      insights.push({
        id: 'overtrading_warning',
        type: 'warning',
        title: 'Potential Overtrading',
        message: `Averaging ${avgTradesPerDay.toFixed(1)} trades per day.`,
        action: 'Focus on quality over quantity. Consider taking fewer, better trades.',
        priority: 8,
        category: 'behavior',
        timestamp: Date.now()
      });
    }

    // Psychology correlation
    if (psychologyData && psychologyData.length > 0) {
      const negativeDays = psychologyData.filter(p => 
        p.entry && p.entry.toLowerCase().includes('fear') ||
        p.entry && p.entry.toLowerCase().includes('frustrated')
      ).length;
      
      if (negativeDays >= psychologyData.length * 0.3) {
        insights.push({
          id: 'emotional_state_warning',
          type: 'warning',
          title: 'Emotional Trading Concern',
          message: `Frequent negative emotional states detected in psychology logs.`,
          action: 'Focus on mindfulness and emotional control before trading.',
          priority: 7,
          category: 'behavior',
          timestamp: Date.now()
        });
      }
    }

    return insights;
  }

  // Time-based insights
  generateTimeInsights(trades) {
    const insights = [];
    const timeStats = {};
    
    trades.forEach(trade => {
      const timeCategory = this.getTimeCategory(trade);
      if (!timeStats[timeCategory]) timeStats[timeCategory] = { total: 0, wins: 0 };
      timeStats[timeCategory].total++;
      if ((trade.meta?.net || 0) > 0) timeStats[timeCategory].wins++;
    });

    const bestTime = Object.entries(timeStats).reduce((best, [time, stats]) => {
      const winRate = (stats.wins / stats.total) * 100;
      return winRate > best.winRate ? { time, winRate, total: stats.total } : best;
    }, { time: '', winRate: 0, total: 0 });

    if (bestTime.total >= 3 && bestTime.winRate >= 70) {
      insights.push({
        id: 'best_trading_time',
        type: 'positive',
        title: 'Optimal Trading Time',
        message: `Best performance during ${bestTime.time} (${bestTime.winRate.toFixed(1)}% win rate).`,
        action: `Focus more trading activity during ${bestTime.time}.`,
        priority: 6,
        category: 'timing',
        timestamp: Date.now()
      });
    }

    return insights;
  }

  // Smart alerts system
  generateSmartAlerts(trades, psychologyData) {
    const alerts = [];
    
    // Validate inputs
    if (!trades || !Array.isArray(trades)) {
      console.warn('Invalid trades data provided to generateSmartAlerts');
      return alerts;
    }
    
    try {
      // Recent losing streak
      const recentTrades = trades.slice(0, 5);
      const recentLosses = recentTrades.filter(t => (t.meta?.net || 0) <= 0).length;
      
      if (recentLosses >= 4) {
        alerts.push({
          id: 'losing_streak_alert',
          type: 'critical',
          title: 'Losing Streak Alert',
          message: `${recentLosses} losses in last 5 trades. Consider taking a break.`,
          action: 'Stop trading and review what went wrong.',
          urgency: 'high',
          timestamp: Date.now()
        });
      }

      // High trading frequency today
      const today = new Date().toDateString();
      const todayTrades = trades.filter(t => {
        try {
          return new Date(t.date).toDateString() === today;
        } catch (error) {
          return false;
        }
      });
      
      if (todayTrades.length >= 5) {
        alerts.push({
          id: 'daily_trade_limit',
          type: 'warning',
          title: 'Daily Trade Limit',
          message: `${todayTrades.length} trades today. Risk of overtrading.`,
          action: 'Consider stopping for the day.',
          urgency: 'medium',
          timestamp: Date.now()
        });
      }

      // Large loss alert
      const recentLargeLoss = trades.find(t => (t.meta?.net || 0) < -2000);
      if (recentLargeLoss && this.isRecentTrade(recentLargeLoss)) {
        alerts.push({
          id: 'large_loss_alert',
          type: 'critical',
          title: 'Large Loss Detected',
          message: `Large loss of ₹${Math.abs(recentLargeLoss.meta.net).toFixed(2)} detected.`,
          action: 'Review risk management and position sizing.',
          urgency: 'high',
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Error generating alerts:', error);
    }

    return alerts;
  }

  // Auto-tagging system
  autoTagTrade(trade) {
    const tags = [];
    const profit = trade.meta?.net || 0;
    const amount = Math.abs(profit);
    
    // Performance tags
    if (profit > 0) tags.push('Profitable');
    else tags.push('Loss');
    
    // Size tags
    if (amount > 5000) tags.push('Large Position');
    else if (amount > 2000) tags.push('Medium Position');
    else tags.push('Small Position');
    
    // Quality tags
    const quality = this.assessTradeQuality(trade);
    tags.push(quality);
    
    // Setup tags
    const setup = this.detectSetupType(trade);
    tags.push(setup);
    
    // Risk tags
    const risk = this.assessTradeRisk(trade);
    tags.push(`${risk} Risk`);
    
    // Time tags
    const timeCategory = this.getTimeCategory(trade);
    tags.push(timeCategory);

    return tags;
  }

  // Helper methods
  getRecentTrades(trades, timeframe) {
    if (!trades || !Array.isArray(trades)) {
      return [];
    }
    
    const now = new Date();
    let cutoffDate;
    
    switch (timeframe) {
      case 'day':
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    return trades.filter(trade => {
      try {
        return new Date(trade.date) >= cutoffDate;
      } catch (error) {
        return false;
      }
    });
  }

  calculateTradingFrequency(trades) {
    if (!trades || trades.length === 0) return 0;
    
    try {
      const tradingDays = new Set(trades.map(t => {
        try {
          return new Date(t.date).toDateString();
        } catch (error) {
          return 'unknown';
        }
      })).size;
      return trades.length / tradingDays;
    } catch (error) {
      return 0;
    }
  }

  isRecentTrade(trade) {
    if (!trade || !trade.date) return false;
    
    try {
      const now = new Date();
      const tradeDate = new Date(trade.date);
      const daysDiff = (now - tradeDate) / (1000 * 60 * 60 * 24);
      return daysDiff <= 1;
    } catch (error) {
      return false;
    }
  }

  loadUserPreferences() {
    const stored = localStorage.getItem('automation_preferences');
    return stored ? JSON.parse(stored) : {
      enableAutoInsights: true,
      enableSmartAlerts: true,
      enableAutoTagging: true,
      insightFrequency: 'daily',
      alertThresholds: {
        losingStreak: 3,
        dailyTradeLimit: 5,
        largeLossAmount: 2000
      }
    };
  }

  saveUserPreferences(preferences) {
    this.userPreferences = { ...this.userPreferences, ...preferences };
    localStorage.setItem('automation_preferences', JSON.stringify(this.userPreferences));
  }

  // Clear cache and reset
  clearCache() {
    this.insights = [];
    this.alerts = [];
    this.lastAnalysis = null;
  }
}

// Export singleton instance
export const automationService = new AutomationService();
