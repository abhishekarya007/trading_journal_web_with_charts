// AI Trading Assistant Service
// Provides intelligent analysis and recommendations based on trading data

class AITradingAssistant {
  constructor() {
    this.analysisCache = new Map();
    this.lastAnalysis = null;
  }

  // Main analysis function
  analyzeTradingPerformance(trades, psychologyData) {
    if (!trades || trades.length === 0) {
      return {
        overallScore: 0,
        insights: [],
        recommendations: [],
        riskLevel: 'LOW',
        patterns: {},
        alerts: []
      };
    }

    const analysis = {
      overallScore: this.calculateOverallScore(trades, psychologyData),
      insights: this.generateInsights(trades, psychologyData),
      recommendations: this.generateRecommendations(trades, psychologyData),
      riskLevel: this.assessRiskLevel(trades, psychologyData),
      patterns: this.identifyPatterns(trades, psychologyData),
      alerts: this.generateAlerts(trades, psychologyData),
      performanceMetrics: this.calculatePerformanceMetrics(trades),
      psychologyAnalysis: this.analyzePsychology(trades, psychologyData)
    };

    this.lastAnalysis = analysis;
    return analysis;
  }

  // Calculate overall trading score (0-100)
  calculateOverallScore(trades, psychologyData) {
    let score = 0;
    
    // Win rate contribution (40% weight)
    const winRate = this.calculateWinRate(trades);
    score += winRate * 0.4;
    
    // Profit factor contribution (30% weight)
    const profitFactor = this.calculateProfitFactor(trades);
    score += Math.min(profitFactor * 10, 30); // Cap at 30 points
    
    // Consistency contribution (20% weight)
    const consistency = this.calculateConsistency(trades);
    score += consistency * 0.2;
    
    // Psychology contribution (10% weight)
    const psychologyScore = this.calculatePsychologyScore(psychologyData);
    score += psychologyScore * 0.1;
    
    return Math.round(score);
  }

  // Generate intelligent insights
  generateInsights(trades, psychologyData) {
    const insights = [];
    
    // Win rate insights
    const winRate = this.calculateWinRate(trades);
    if (winRate >= 70) {
      insights.push({
        type: 'excellent',
        title: 'Outstanding Win Rate',
        message: `Your ${winRate}% win rate is exceptional! You're clearly doing something right.`,
        icon: '🏆'
      });
    } else if (winRate >= 60) {
      insights.push({
        type: 'good',
        title: 'Solid Win Rate',
        message: `Your ${winRate}% win rate shows good trading discipline.`,
        icon: '✅'
      });
    } else if (winRate < 40) {
      insights.push({
        type: 'warning',
        title: 'Win Rate Needs Improvement',
        message: `Your ${winRate}% win rate suggests reviewing your entry/exit strategies.`,
        icon: '⚠️'
      });
    }

    // Profit factor insights
    const profitFactor = this.calculateProfitFactor(trades);
    if (profitFactor >= 2) {
      insights.push({
        type: 'excellent',
        title: 'Excellent Profit Factor',
        message: `Your profit factor of ${profitFactor.toFixed(2)} shows great risk management.`,
        icon: '💰'
      });
    } else if (profitFactor < 1) {
      insights.push({
        type: 'danger',
        title: 'Negative Profit Factor',
        message: `Your profit factor of ${profitFactor.toFixed(2)} indicates losses exceed gains.`,
        icon: '📉'
      });
    }

    // Trading frequency insights
    const avgTradesPerDay = this.calculateAverageTradesPerDay(trades);
    if (avgTradesPerDay > 5) {
      insights.push({
        type: 'warning',
        title: 'High Trading Frequency',
        message: `You're averaging ${avgTradesPerDay.toFixed(1)} trades per day. Consider quality over quantity.`,
        icon: '⚡'
      });
    }

    // Psychology insights
    if (psychologyData.length > 0) {
      const recentPsychology = psychologyData.slice(-7); // Last 7 entries
      const emotionalTrades = this.analyzeEmotionalTrading(trades, psychologyData);
      
      if (emotionalTrades.length > 0) {
        insights.push({
          type: 'info',
          title: 'Emotional Trading Detected',
          message: `${emotionalTrades.length} trades show signs of emotional decision-making.`,
          icon: '🧠'
        });
      }
    }

    return insights;
  }

  // Generate actionable recommendations
  generateRecommendations(trades, psychologyData) {
    const recommendations = [];
    
    // Win rate recommendations
    const winRate = this.calculateWinRate(trades);
    if (winRate < 50) {
      recommendations.push({
        priority: 'high',
        title: 'Improve Entry Criteria',
        description: 'Focus on higher probability setups. Consider waiting for stronger confirmation signals.',
        action: 'Review your entry criteria and wait for better setups',
        icon: '🎯'
      });
    }

    // Risk management recommendations
    const avgLoss = this.calculateAverageLoss(trades);
    const avgWin = this.calculateAverageWin(trades);
    const riskRewardRatio = avgWin / avgLoss;
    
    if (riskRewardRatio < 1.5) {
      recommendations.push({
        priority: 'high',
        title: 'Improve Risk-Reward Ratio',
        description: `Your average win (₹${avgWin.toFixed(0)}) is too close to your average loss (₹${avgLoss.toFixed(0)}).`,
        action: 'Look for trades with at least 2:1 risk-reward ratio',
        icon: '⚖️'
      });
    }

    // Overtrading recommendations
    const avgTradesPerDay = this.calculateAverageTradesPerDay(trades);
    if (avgTradesPerDay > 3) {
      recommendations.push({
        priority: 'medium',
        title: 'Reduce Trading Frequency',
        description: 'You might be overtrading. Focus on quality setups rather than quantity.',
        action: 'Limit yourself to 2-3 high-quality trades per day',
        icon: '⏰'
      });
    }

    // Psychology recommendations
    if (psychologyData.length < 7) {
      recommendations.push({
        priority: 'medium',
        title: 'Log Psychology Regularly',
        description: 'Regular psychology logging helps identify emotional patterns.',
        action: 'Log your psychology at least 3 times per week',
        icon: '📝'
      });
    }

    return recommendations;
  }

  // Assess risk level
  assessRiskLevel(trades, psychologyData) {
    let riskScore = 0;
    
    // High frequency trading
    const avgTradesPerDay = this.calculateAverageTradesPerDay(trades);
    if (avgTradesPerDay > 5) riskScore += 3;
    else if (avgTradesPerDay > 3) riskScore += 2;
    else if (avgTradesPerDay > 1) riskScore += 1;
    
    // Poor win rate
    const winRate = this.calculateWinRate(trades);
    if (winRate < 40) riskScore += 3;
    else if (winRate < 50) riskScore += 2;
    else if (winRate < 60) riskScore += 1;
    
    // Negative profit factor
    const profitFactor = this.calculateProfitFactor(trades);
    if (profitFactor < 1) riskScore += 3;
    else if (profitFactor < 1.5) riskScore += 1;
    
    // Emotional trading
    const emotionalTrades = this.analyzeEmotionalTrading(trades, psychologyData);
    if (emotionalTrades.length > 5) riskScore += 2;
    else if (emotionalTrades.length > 0) riskScore += 1;
    
    if (riskScore >= 8) return 'HIGH';
    if (riskScore >= 5) return 'MEDIUM';
    if (riskScore >= 2) return 'LOW';
    return 'VERY_LOW';
  }

  // Identify trading patterns
  identifyPatterns(trades, psychologyData) {
    const bestDays = this.findBestTradingDays(trades);
    const worstDays = this.findWorstTradingDays(trades);
    
    console.log('Best Days:', bestDays);
    console.log('Worst Days:', worstDays);
    
    const patterns = {
      bestDays: bestDays,
      worstDays: worstDays,
      timePatterns: this.analyzeTimePatterns(trades),
      emotionalPatterns: this.analyzeEmotionalPatterns(trades, psychologyData),
      setupPatterns: this.analyzeSetupPatterns(trades),
      averageTradesPerDay: this.calculateAverageTradesPerDay(trades)
    };
    
    return patterns;
  }

  // Generate alerts
  generateAlerts(trades, psychologyData) {
    const alerts = [];
    
    // Recent losing streak
    const recentTrades = trades.slice(0, 5);
    const recentLosses = recentTrades.filter(t => (t.meta?.net || 0) <= 0).length;
    if (recentLosses >= 4) {
      alerts.push({
        type: 'danger',
        title: 'Losing Streak Alert',
        message: `You've lost ${recentLosses} out of your last 5 trades. Consider taking a break.`,
        icon: '🚨'
      });
    }
    
    // Overtrading alert
    const todayTrades = trades.filter(t => {
      const tradeDate = new Date(t.date).toDateString();
      const today = new Date().toDateString();
      return tradeDate === today;
    });
    
    if (todayTrades.length > 5) {
      alerts.push({
        type: 'warning',
        title: 'Overtrading Alert',
        message: `You've made ${todayTrades.length} trades today. Consider slowing down.`,
        icon: '⚡'
      });
    }
    
    return alerts;
  }

  // Helper methods
  calculateWinRate(trades) {
    if (trades.length === 0) return 0;
    const wins = trades.filter(t => (t.meta?.net || 0) > 0).length;
    return Math.round((wins / trades.length) * 100);
  }

  calculateProfitFactor(trades) {
    const wins = trades.filter(t => (t.meta?.net || 0) > 0);
    const losses = trades.filter(t => (t.meta?.net || 0) <= 0);
    
    const totalWins = wins.reduce((sum, t) => sum + (t.meta?.net || 0), 0);
    const totalLosses = Math.abs(losses.reduce((sum, t) => sum + (t.meta?.net || 0), 0));
    
    return totalLosses === 0 ? totalWins : totalWins / totalLosses;
  }

  calculateConsistency(trades) {
    if (trades.length < 10) return 50; // Not enough data
    
    const profits = trades.map(t => t.meta?.net || 0);
    const mean = profits.reduce((sum, p) => sum + p, 0) / profits.length;
    const variance = profits.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / profits.length;
    const stdDev = Math.sqrt(variance);
    
    // Lower standard deviation = higher consistency
    const consistency = Math.max(0, 100 - (stdDev / Math.abs(mean)) * 100);
    return Math.round(consistency);
  }

  calculatePsychologyScore(psychologyData) {
    if (psychologyData.length === 0) return 0;
    
    // Simple scoring based on frequency and recency
    const recentEntries = psychologyData.filter(entry => {
      const entryDate = new Date(entry.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return entryDate >= weekAgo;
    });
    
    return Math.min(100, recentEntries.length * 20);
  }

  calculateAverageTradesPerDay(trades) {
    if (trades.length === 0) return 0;
    
    const tradingDays = new Set(trades.map(t => new Date(t.date).toDateString())).size;
    return trades.length / tradingDays;
  }

  calculateAverageWin(trades) {
    const wins = trades.filter(t => (t.meta?.net || 0) > 0);
    if (wins.length === 0) return 0;
    return wins.reduce((sum, t) => sum + (t.meta?.net || 0), 0) / wins.length;
  }

  calculateAverageLoss(trades) {
    const losses = trades.filter(t => (t.meta?.net || 0) <= 0);
    if (losses.length === 0) return 0;
    return Math.abs(losses.reduce((sum, t) => sum + (t.meta?.net || 0), 0)) / losses.length;
  }

  analyzeEmotionalTrading(trades, psychologyData) {
    // Simple heuristic: trades made on days with negative psychology entries
    const negativePsychologyDays = psychologyData
      .filter(entry => entry && entry.entry && typeof entry.entry === 'string')
      .filter(entry => {
        const entryText = entry.entry.toLowerCase();
        return entryText.includes('fear') || 
               entryText.includes('greed') ||
               entryText.includes('panic') ||
               entryText.includes('frustrated');
      })
      .map(entry => new Date(entry.date).toDateString());
    
    return trades.filter(trade => {
      const tradeDate = new Date(trade.date).toDateString();
      return negativePsychologyDays.includes(tradeDate);
    });
  }

  findBestTradingDays(trades) {
    const tradesByDay = {};
    trades.forEach(trade => {
      const day = new Date(trade.date).getDay();
      if (!tradesByDay[day]) tradesByDay[day] = [];
      tradesByDay[day].push(trade);
    });
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayScores = Object.entries(tradesByDay)
      .filter(([day, dayTrades]) => dayTrades.length >= 2) // Only include days with at least 2 trades
      .map(([day, dayTrades]) => {
        const winRate = this.calculateWinRate(dayTrades);
        const avgProfit = dayTrades.reduce((sum, t) => sum + (t.meta?.net || 0), 0) / dayTrades.length;
        return { 
          day: dayNames[day], 
          winRate, 
          avgProfit: Math.round(avgProfit), 
          trades: dayTrades.length 
        };
      });
    
    return dayScores.sort((a, b) => b.winRate - a.winRate);
  }

  findWorstTradingDays(trades) {
    const tradesByDay = {};
    trades.forEach(trade => {
      const day = new Date(trade.date).getDay();
      if (!tradesByDay[day]) tradesByDay[day] = [];
      tradesByDay[day].push(trade);
    });
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayScores = Object.entries(tradesByDay)
      .filter(([day, dayTrades]) => dayTrades.length >= 2) // Only include days with at least 2 trades
      .map(([day, dayTrades]) => {
        const winRate = this.calculateWinRate(dayTrades);
        const avgLoss = dayTrades.reduce((sum, t) => sum + (t.meta?.net || 0), 0) / dayTrades.length;
        return { 
          day: dayNames[day], 
          winRate, 
          avgLoss: Math.round(avgLoss), 
          trades: dayTrades.length 
        };
      });
    
    return dayScores.sort((a, b) => a.winRate - b.winRate);
  }

  analyzeTimePatterns(trades) {
    // Analyze time of day patterns
    const tradesWithTime = trades.filter(trade => trade.entryTime && trade.exitTime);
    
    if (tradesWithTime.length === 0) {
      return { message: 'No trades with time data available' };
    }

    // Group trades by hour
    const tradesByHour = {};
    tradesWithTime.forEach(trade => {
      const entryHour = parseInt(trade.entryTime.split(':')[0]);
      if (!tradesByHour[entryHour]) {
        tradesByHour[entryHour] = { trades: [], wins: 0, total: 0 };
      }
      tradesByHour[entryHour].trades.push(trade);
      tradesByHour[entryHour].total++;
      if ((trade.meta?.net || 0) > 0) {
        tradesByHour[entryHour].wins++;
      }
    });

    // Calculate win rates by hour
    const hourStats = Object.entries(tradesByHour)
      .filter(([hour, data]) => data.total >= 2) // Only include hours with at least 2 trades
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        time: `${hour}:00`,
        winRate: Math.round((data.wins / data.total) * 100),
        trades: data.total
      }))
      .sort((a, b) => b.winRate - a.winRate);

    const bestHours = hourStats.slice(0, 3);
    const worstHours = hourStats.slice(-3).reverse();

    return {
      bestHours,
      worstHours,
      totalTradesWithTime: tradesWithTime.length,
      message: `Analyzed ${tradesWithTime.length} trades with time data`
    };
  }

  analyzeEmotionalPatterns(trades, psychologyData) {
    const emotionalTrades = this.analyzeEmotionalTrading(trades, psychologyData);
    return {
      emotionalTradeCount: emotionalTrades.length,
      percentage: trades.length > 0 ? Math.round((emotionalTrades.length / trades.length) * 100) : 0
    };
  }

  analyzeSetupPatterns(trades) {
    // Analyze setup types and their success rates
    const setups = {};
    trades.forEach(trade => {
      const setup = trade.setup || 'Unknown';
      if (!setups[setup]) {
        setups[setup] = { 
          total: 0, 
          wins: 0, 
          profits: [],
          dates: []
        };
      }
      setups[setup].total++;
      setups[setup].profits.push(trade.meta?.net || 0);
      setups[setup].dates.push(new Date(trade.date));
      if ((trade.meta?.net || 0) > 0) setups[setup].wins++;
    });
    
    return Object.entries(setups).map(([setup, data]) => {
      const avgProfit = data.profits.reduce((sum, profit) => sum + profit, 0) / data.profits.length;
      const lastUsed = data.dates.length > 0 ? 
        data.dates.sort((a, b) => b - a)[0].toLocaleDateString() : 'N/A';
      
      return {
        setup,
        total: data.total,
        wins: data.wins,
        winRate: Math.round((data.wins / data.total) * 100),
        avgProfit: Math.round(avgProfit),
        lastUsed: lastUsed
      };
    }).sort((a, b) => b.winRate - a.winRate); // Sort by win rate descending
  }

  calculatePerformanceMetrics(trades) {
    return {
      totalTrades: trades.length,
      totalWins: trades.filter(t => (t.meta?.net || 0) > 0).length,
      totalLosses: trades.filter(t => (t.meta?.net || 0) <= 0).length,
      winRate: this.calculateWinRate(trades),
      profitFactor: this.calculateProfitFactor(trades),
      averageWin: this.calculateAverageWin(trades),
      averageLoss: this.calculateAverageLoss(trades),
      totalProfit: trades.reduce((sum, t) => sum + (t.meta?.net || 0), 0),
      consistency: this.calculateConsistency(trades)
    };
  }

  analyzePsychology(trades, psychologyData) {
    if (psychologyData.length === 0) {
      return { message: 'No psychology data available' };
    }
    
    const recentEntries = psychologyData.slice(-10);
    const emotionalWords = ['fear', 'greed', 'panic', 'frustrated', 'confident', 'calm', 'excited'];
    const emotionCounts = {};
    
    recentEntries.forEach(entry => {
      if (entry && entry.entry && typeof entry.entry === 'string') {
        const entryText = entry.entry.toLowerCase();
        emotionalWords.forEach(word => {
          if (entryText.includes(word)) {
            emotionCounts[word] = (emotionCounts[word] || 0) + 1;
          }
        });
      }
    });
    
    return {
      totalEntries: psychologyData.length,
      recentEntries: recentEntries.length,
      dominantEmotions: Object.entries(emotionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([emotion, count]) => ({ emotion, count }))
    };
  }

  // Clear cache
  clearCache() {
    this.analysisCache.clear();
    this.lastAnalysis = null;
  }
}

// Export singleton instance
export const aiTradingAssistant = new AITradingAssistant();
