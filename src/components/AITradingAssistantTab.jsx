import React, { useState, useEffect } from 'react';
import { 
  IconBrain, 
  IconTrendingUp, 
  IconAlertTriangle, 
  IconTarget, 
  IconLightbulb,
  IconBarChart,
  IconClock,
  IconZap,
  IconCheck,
  IconX,
  IconRefresh,
  IconStar,
  IconShield,
  IconActivity,
  IconCalendar
} from './icons';
import { aiTradingAssistant } from '../services/aiTradingAssistant';

const AITradingAssistantTab = ({ trades, psychologyData, formatNumber }) => {
  const [analysis, setAnalysis] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (trades.length > 0 || psychologyData.length > 0) {
      analyzeData();
    }
  }, [trades, psychologyData]);

  const analyzeData = () => {
    setIsAnalyzing(true);
    // Simulate analysis time for better UX
    setTimeout(() => {
      console.log('Analyzing data with:', { trades: trades.length, psychologyData: psychologyData.length });
      const result = aiTradingAssistant.analyzeTradingPerformance(trades, psychologyData);
      console.log('Analysis result:', result);
      setAnalysis(result);
      setIsAnalyzing(false);
    }, 500);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-emerald-500 to-green-500';
    if (score >= 60) return 'from-blue-500 to-cyan-500';
    if (score >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'VERY_LOW': return 'from-emerald-500 to-green-500';
      case 'LOW': return 'from-blue-500 to-cyan-500';
      case 'MEDIUM': return 'from-yellow-500 to-orange-500';
      case 'HIGH': return 'from-red-500 to-pink-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'excellent': return 'from-emerald-500 to-green-500';
      case 'good': return 'from-blue-500 to-cyan-500';
      case 'warning': return 'from-yellow-500 to-orange-500';
      case 'danger': return 'from-red-500 to-pink-500';
      case 'info': return 'from-indigo-500 to-purple-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'from-red-500 to-pink-500';
      case 'medium': return 'from-yellow-500 to-orange-500';
      case 'low': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  if (!analysis) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <IconBrain className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {isAnalyzing ? 'Analyzing Your Trading Data...' : 'No Data Available'}
          </h3>
          <p className="text-slate-500 dark:text-slate-500">
            {isAnalyzing ? 'AI is processing your trades and psychology data' : 'Add some trades to get AI insights'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8 animate-bounce"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <IconBrain className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">AI Trading Assistant</h1>
              <p className="text-indigo-100">Intelligent insights and recommendations for your trading journey</p>
            </div>
          </div>

          {/* Overall Score */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Overall Trading Score</h2>
                <p className="text-indigo-100 text-sm">Based on win rate, profit factor, consistency, and psychology</p>
              </div>
              <button
                onClick={analyzeData}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-white/30 disabled:opacity-50"
              >
                <IconRefresh className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            <div className="flex items-center gap-6">
              <div className={`w-20 h-20 bg-gradient-to-r ${getScoreColor(analysis.overallScore)} rounded-full flex items-center justify-center shadow-lg`}>
                <span className="text-white font-bold text-2xl">{analysis.overallScore}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">{getScoreLabel(analysis.overallScore)}</h3>
                <p className="text-indigo-100 text-sm">Trading Performance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-2 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="flex gap-1 overflow-x-auto">
          {[
            { id: 'overview', name: 'Overview', icon: IconBarChart },
            { id: 'insights', name: 'Insights', icon: IconLightbulb },
            { id: 'recommendations', name: 'Recommendations', icon: IconTarget },
            { id: 'patterns', name: 'Patterns', icon: IconTrendingUp },
            { id: 'alerts', name: 'Alerts', icon: IconAlertTriangle },
            { id: 'how-it-works', name: 'How It Works', icon: IconLightbulb }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeSection === tab.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Risk Level */}
          <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-red-200 dark:border-red-700">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 bg-gradient-to-r ${getRiskColor(analysis.riskLevel)} rounded-xl flex items-center justify-center`}>
                <IconShield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Risk Level</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Current assessment</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
              {analysis.riskLevel.replace('_', ' ')}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {analysis.riskLevel === 'HIGH' ? 'High risk detected' : 
               analysis.riskLevel === 'MEDIUM' ? 'Moderate risk level' : 
               'Low risk profile'}
            </p>
          </div>

          {/* Performance Metrics */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <IconTrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Win Rate</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Success rate</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {analysis.performanceMetrics.winRate}%
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {analysis.performanceMetrics.totalWins} wins out of {analysis.performanceMetrics.totalTrades}
            </p>
          </div>

          {/* Profit Factor */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                <IconStar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Profit Factor</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Risk management</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              {analysis.performanceMetrics.profitFactor.toFixed(2)}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {analysis.performanceMetrics.profitFactor >= 2 ? 'Excellent' : 
               analysis.performanceMetrics.profitFactor >= 1.5 ? 'Good' : 'Needs improvement'}
            </p>
          </div>

          {/* Consistency */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <IconActivity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Consistency</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Performance stability</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {analysis.performanceMetrics.consistency}%
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {analysis.performanceMetrics.consistency >= 80 ? 'Very consistent' : 
               analysis.performanceMetrics.consistency >= 60 ? 'Moderately consistent' : 'Inconsistent'}
            </p>
          </div>
        </div>
      )}

      {/* Insights Section */}
      {activeSection === 'insights' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <IconLightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Insights</h2>
              <p className="text-slate-600 dark:text-slate-400">Intelligent observations about your trading</p>
            </div>
          </div>
          
          {analysis.insights.length === 0 ? (
            <div className="text-center py-8">
              <IconLightbulb className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">No Insights Yet</h3>
              <p className="text-slate-500 dark:text-slate-500">Add more trades to get AI insights</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {analysis.insights.map((insight, index) => (
                <div 
                  key={index}
                  className={`bg-gradient-to-r rounded-xl p-6 border ${
                    insight.type === 'excellent' ? 'from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-700' :
                    insight.type === 'good' ? 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-700' :
                    insight.type === 'warning' ? 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700' :
                    insight.type === 'danger' ? 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-700' :
                    'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${getInsightColor(insight.type)} rounded-xl flex items-center justify-center text-2xl`}>
                      {insight.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-2">{insight.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{insight.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recommendations Section */}
      {activeSection === 'recommendations' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <IconTarget className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Recommendations</h2>
              <p className="text-slate-600 dark:text-slate-400">Actionable steps to improve your trading</p>
            </div>
          </div>
          
          {analysis.recommendations.length === 0 ? (
            <div className="text-center py-8">
              <IconTarget className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">No Recommendations</h3>
              <p className="text-slate-500 dark:text-slate-500">Your trading looks good! Keep it up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analysis.recommendations.map((rec, index) => (
                <div 
                  key={index}
                  className={`bg-gradient-to-r rounded-xl p-6 border ${
                    rec.priority === 'high' ? 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-700' :
                    rec.priority === 'medium' ? 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700' :
                    'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${getPriorityColor(rec.priority)} rounded-xl flex items-center justify-center text-2xl`}>
                      {rec.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-slate-900 dark:text-white">{rec.title}</h3>
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                          rec.priority === 'high' ? 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30' :
                          rec.priority === 'medium' ? 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30' :
                          'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30'
                        }`}>
                          {rec.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mb-3">{rec.description}</p>
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Action:</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{rec.action}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Patterns Section */}
      {activeSection === 'patterns' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <IconTrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Trading Patterns</h2>
              <p className="text-slate-600 dark:text-slate-400">AI-identified patterns in your trading behavior</p>
            </div>
          </div>

          {/* Pattern Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Best Day</span>
                <IconCalendar className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
                {analysis.patterns.bestDays?.[0]?.day || 'N/A'}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {analysis.patterns.bestDays?.[0]?.winRate || 0}% Win Rate
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Best Setup</span>
                <IconTarget className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-xl font-bold text-green-900 dark:text-green-100">
                {analysis.patterns.setupPatterns?.[0]?.setup || 'N/A'}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">
                {analysis.patterns.setupPatterns?.[0]?.winRate || 0}% Success
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Avg Trades/Day</span>
                <IconBarChart className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-xl font-bold text-purple-900 dark:text-purple-100">
                {analysis.patterns.averageTradesPerDay || 0}
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                Daily Average
              </p>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Worst Day</span>
                <IconAlertTriangle className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
                {analysis.patterns.worstDays?.[0]?.day || 'N/A'}
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                {analysis.patterns.worstDays?.[0]?.winRate || 0}% Win Rate
              </p>
            </div>
          </div>

          {/* Best Trading Days */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                <IconCalendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Best Trading Days</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Your most profitable days of the week</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {analysis.patterns.bestDays?.slice(0, 3).map((day, index) => (
                <div key={index} className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-800 rounded-lg flex items-center justify-center">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">{index + 1}</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{day.day}</div>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">{day.winRate}%</div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{day.trades} trades</div>
                    {day.avgProfit && (
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                        ₹{day.avgProfit} avg profit
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Worst Trading Days */}
          {analysis.patterns.worstDays && analysis.patterns.worstDays.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <IconAlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Days to Avoid</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Your least profitable days of the week</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {analysis.patterns.worstDays?.slice(0, 3).map((day, index) => (
                  <div key={index} className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-red-200 dark:border-red-700">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-red-100 dark:bg-red-800 rounded-lg flex items-center justify-center">
                          <span className="text-red-600 dark:text-red-400 font-bold text-sm">{index + 1}</span>
                        </div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{day.day}</div>
                      </div>
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">{day.winRate}%</div>
                      <div className="text-xs text-red-600 dark:text-red-400 font-medium">{day.trades} trades</div>
                      {day.avgLoss && (
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                          ₹{day.avgLoss} avg loss
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Setup Patterns - Progress Bar Grid */}
          {analysis.patterns.setupPatterns && analysis.patterns.setupPatterns.length > 0 && (
            <div className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-600">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
                  <IconTarget className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Setup Performance</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Your trading setup effectiveness with progress indicators</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.patterns.setupPatterns.map((setup, index) => (
                  <div key={index} className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-700 dark:to-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-600 shadow-md hover:shadow-lg transition-shadow">
                    <div className="mb-2">
                      <div className="text-base font-bold text-slate-900 dark:text-white">{setup.setup}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">{setup.total} trades</div>
                    </div>
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Win Rate</span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{setup.winRate}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 shadow-inner">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            setup.winRate >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                            setup.winRate >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                            setup.winRate >= 40 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                            'bg-gradient-to-r from-red-500 to-pink-500'
                          }`}
                          style={{ width: `${Math.min(setup.winRate, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-base font-bold ${(setup.avgProfit || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        ₹{setup.avgProfit || 0}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Average Profit</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time-based Patterns */}
          {analysis.patterns.timePatterns && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <IconClock className="w-5 h-5 text-purple-500" />
                Time-based Patterns
              </h3>
              
              {analysis.patterns.timePatterns.message && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-400">{analysis.patterns.timePatterns.message}</p>
                </div>
              )}

              {!analysis.patterns.timePatterns.bestHours && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    No time data available. Add entry and exit times to your trades to see time-based analysis.
                  </p>
                </div>
              )}

              {analysis.patterns.timePatterns.bestHours && (
                <div className="space-y-8">
                  {/* Session Analysis */}
                  {analysis.patterns.timePatterns.sessionAnalysis && analysis.patterns.timePatterns.sessionAnalysis.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                          <IconClock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white">Market Session Performance</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">How you perform during different market hours</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {analysis.patterns.timePatterns.sessionAnalysis.map((session, index) => (
                          <div key={index} className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-700">
                            <div className="text-center">
                              <div className="text-sm font-semibold text-slate-900 dark:text-white mb-2">{session.session}</div>
                              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">{session.winRate}%</div>
                              <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{session.trades} trades</div>
                              <div className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                                ₹{session.avgProfit} avg profit
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Duration Analysis */}
                  {analysis.patterns.timePatterns.durationAnalysis && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                          <IconClock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white">Trade Duration Analysis</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Performance based on how long you hold positions</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <div className="text-sm font-semibold text-slate-900 dark:text-white">Short (≤30min)</div>
                            </div>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{analysis.patterns.timePatterns.durationAnalysis.short.winRate}%</div>
                            <div className="text-xs text-green-600 dark:text-green-400 font-medium">{analysis.patterns.timePatterns.durationAnalysis.short.count} trades</div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                              ₹{analysis.patterns.timePatterns.durationAnalysis.short.avgProfit} avg profit
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-700">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <div className="text-sm font-semibold text-slate-900 dark:text-white">Medium (30min-2h)</div>
                            </div>
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">{analysis.patterns.timePatterns.durationAnalysis.medium.winRate}%</div>
                            <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">{analysis.patterns.timePatterns.durationAnalysis.medium.count} trades</div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                              ₹{analysis.patterns.timePatterns.durationAnalysis.medium.avgProfit} avg profit
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <div className="text-sm font-semibold text-slate-900 dark:text-white">Long (&gt;2h)</div>
                            </div>
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">{analysis.patterns.timePatterns.durationAnalysis.long.winRate}%</div>
                            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">{analysis.patterns.timePatterns.durationAnalysis.long.count} trades</div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                              ₹{analysis.patterns.timePatterns.durationAnalysis.long.avgProfit} avg profit
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Hourly Analysis */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <IconClock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">Trading Hour Performance</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Your best and worst trading hours</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                          <h5 className="font-semibold text-slate-900 dark:text-white">Best Trading Hours</h5>
                        </div>
                        <div className="space-y-3">
                          {analysis.patterns.timePatterns.bestHours?.map((hour, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-800 rounded-lg flex items-center justify-center">
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">{index + 1}</span>
                                </div>
                                <div>
                                  <div className="text-slate-900 dark:text-white font-medium">{hour.time}</div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400">{hour.trades} trades</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">{hour.winRate}%</div>
                                <div className="text-xs text-emerald-600 dark:text-emerald-400">₹{hour.avgProfit}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <h5 className="font-semibold text-slate-900 dark:text-white">Worst Trading Hours</h5>
                        </div>
                        <div className="space-y-3">
                          {analysis.patterns.timePatterns.worstHours?.map((hour, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-red-100 dark:bg-red-800 rounded-lg flex items-center justify-center">
                                  <span className="text-red-600 dark:text-red-400 font-bold text-sm">{index + 1}</span>
                                </div>
                                <div>
                                  <div className="text-slate-900 dark:text-white font-medium">{hour.time}</div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400">{hour.trades} trades</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-red-600 dark:text-red-400 font-bold text-lg">{hour.winRate}%</div>
                                <div className="text-xs text-red-600 dark:text-red-400">₹{hour.avgProfit}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Psychology Analysis with Enhanced Visualization */}
          {analysis && analysis.psychologyAnalysis && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <IconBrain className="w-5 h-5 text-indigo-500" />
                Psychology Analysis
              </h3>
              
              {analysis.psychologyAnalysis.hasData ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Entry Statistics</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded">
                        <span className="text-slate-600 dark:text-slate-400">Total Entries</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{analysis.psychologyAnalysis.totalEntries}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded">
                        <span className="text-slate-600 dark:text-slate-400">Recent Entries (10 days)</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{analysis.psychologyAnalysis.recentEntries}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded">
                        <span className="text-slate-600 dark:text-slate-400">Data Quality</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">Good</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Emotional Patterns</h4>
                    {analysis.psychologyAnalysis.dominantEmotions.length > 0 ? (
                      <div className="space-y-2">
                        {analysis.psychologyAnalysis.dominantEmotions.map((emotion, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                {emotion.emotion === 'fear' ? '😨' : 
                                 emotion.emotion === 'greed' ? '😈' : 
                                 emotion.emotion === 'confident' ? '😎' : 
                                 emotion.emotion === 'frustrated' ? '😤' : 
                                 emotion.emotion === 'calm' ? '😌' : 
                                 emotion.emotion === 'excited' ? '🤩' : 
                                 emotion.emotion === 'anxious' ? '😰' : 
                                 emotion.emotion === 'optimistic' ? '😊' : 
                                 emotion.emotion === 'stressed' ? '😫' : 
                                 emotion.emotion === 'focused' ? '🎯' : 
                                 emotion.emotion === 'distracted' ? '🤔' : '😐'}
                              </span>
                              <span className="text-slate-900 dark:text-white capitalize">{emotion.emotion}</span>
                            </div>
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{emotion.count}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                          <IconBrain className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">No emotional patterns detected yet</p>
                        <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Add more psychology entries to see patterns</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconBrain className="w-8 h-8 text-indigo-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Psychology Data Available</h4>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Start logging your daily psychology to get AI-powered emotional analysis and insights.
                  </p>
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-xl p-4 border border-indigo-200 dark:border-indigo-700">
                    <h5 className="font-semibold text-slate-900 dark:text-white mb-2">What you'll get:</h5>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      <li>• Emotional pattern recognition</li>
                      <li>• Trading mindset analysis</li>
                      <li>• Psychology-based recommendations</li>
                      <li>• Consistency tracking</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Alerts Section */}
      {activeSection === 'alerts' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
              <IconAlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Alerts</h2>
              <p className="text-slate-600 dark:text-slate-400">Important warnings and notifications</p>
            </div>
          </div>
          
          {analysis.alerts.length === 0 ? (
            <div className="text-center py-8">
              <IconCheck className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">All Clear!</h3>
              <p className="text-slate-500 dark:text-slate-500">No alerts at the moment. Keep up the good work!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analysis.alerts.map((alert, index) => (
                <div 
                  key={index}
                  className={`bg-gradient-to-r rounded-xl p-6 border ${
                    alert.type === 'danger' ? 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-700' :
                    'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${
                      alert.type === 'danger' ? 'from-red-500 to-pink-500' : 'from-yellow-500 to-orange-500'
                    } rounded-xl flex items-center justify-center text-2xl`}>
                      {alert.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-2">{alert.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{alert.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* How It Works Section */}
      {activeSection === 'how-it-works' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <IconLightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">How AI Analysis Works</h2>
              <p className="text-slate-600 dark:text-slate-400">Understanding your trading score and insights</p>
            </div>
          </div>

          {/* Overall Score Explanation */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <IconStar className="w-4 h-4 text-white" />
              </div>
              Overall Trading Score (0-100)
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Score Components:</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-slate-700 dark:text-slate-300">Win Rate</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">40% Weight</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <span className="text-slate-700 dark:text-slate-300">Profit Factor</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">30% Weight</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <span className="text-slate-700 dark:text-slate-300">Consistency</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">20% Weight</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <span className="text-slate-700 dark:text-slate-300">Psychology</span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">10% Weight</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Score Ranges:</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                    <span className="text-slate-700 dark:text-slate-300">80-100: <strong>Excellent</strong></span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-slate-700 dark:text-slate-300">60-79: <strong>Good</strong></span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span className="text-slate-700 dark:text-slate-300">40-59: <strong>Fair</strong></span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="text-slate-700 dark:text-slate-300">0-39: <strong>Needs Improvement</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Explanation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Win Rate */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <IconTrendingUp className="w-4 h-4 text-white" />
                </div>
                Win Rate Analysis
              </h3>
              <div className="space-y-3">
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  <strong>Formula:</strong> (Winning Trades ÷ Total Trades) × 100
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-600 dark:text-emerald-400">≥70%</span>
                    <span className="text-slate-600 dark:text-slate-400">Exceptional Performance</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-600 dark:text-blue-400">60-69%</span>
                    <span className="text-slate-600 dark:text-slate-400">Solid Performance</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-yellow-600 dark:text-yellow-400">50-59%</span>
                    <span className="text-slate-600 dark:text-slate-400">Average Performance</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-600 dark:text-red-400">&lt;50%</span>
                    <span className="text-slate-600 dark:text-slate-400">Needs Improvement</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profit Factor */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                  <IconStar className="w-4 h-4 text-white" />
                </div>
                Profit Factor Analysis
              </h3>
              <div className="space-y-3">
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  <strong>Formula:</strong> Total Profits ÷ Total Losses
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-600 dark:text-emerald-400">≥2.0</span>
                    <span className="text-slate-600 dark:text-slate-400">Excellent Risk Management</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-600 dark:text-blue-400">1.5-1.99</span>
                    <span className="text-slate-600 dark:text-slate-400">Good Risk Management</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-yellow-600 dark:text-yellow-400">1.0-1.49</span>
                    <span className="text-slate-600 dark:text-slate-400">Needs Improvement</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-600 dark:text-red-400">&lt;1.0</span>
                    <span className="text-slate-600 dark:text-slate-400">Poor Risk Management</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Consistency */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <IconActivity className="w-4 h-4 text-white" />
                </div>
                Consistency Analysis
              </h3>
              <div className="space-y-3">
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  <strong>Formula:</strong> Based on standard deviation of trade profits
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-600 dark:text-emerald-400">≥80%</span>
                    <span className="text-slate-600 dark:text-slate-400">Very Consistent</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-600 dark:text-blue-400">60-79%</span>
                    <span className="text-slate-600 dark:text-slate-400">Moderately Consistent</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-yellow-600 dark:text-yellow-400">40-59%</span>
                    <span className="text-slate-600 dark:text-slate-400">Somewhat Inconsistent</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-600 dark:text-red-400">&lt;40%</span>
                    <span className="text-slate-600 dark:text-slate-400">Highly Inconsistent</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Psychology */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <IconBrain className="w-4 h-4 text-white" />
                </div>
                Psychology Analysis
              </h3>
              <div className="space-y-3">
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  <strong>Formula:</strong> Based on psychology logging frequency and emotional patterns
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-600 dark:text-emerald-400">≥80%</span>
                    <span className="text-slate-600 dark:text-slate-400">Excellent Mindset</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-600 dark:text-blue-400">60-79%</span>
                    <span className="text-slate-600 dark:text-slate-400">Good Mindset</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-yellow-600 dark:text-yellow-400">40-59%</span>
                    <span className="text-slate-600 dark:text-slate-400">Needs Attention</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-600 dark:text-red-400">&lt;40%</span>
                    <span className="text-slate-600 dark:text-slate-400">Requires Focus</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                <IconShield className="w-4 h-4 text-white" />
              </div>
              Risk Assessment Algorithm
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Risk Factors:</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-red-700 dark:text-red-300">Trading Frequency</span>
                                              <span className="text-xs text-red-600 dark:text-red-400">+3 points if &gt;5/day</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">High frequency trading increases risk</p>
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">Win Rate</span>
                                              <span className="text-xs text-yellow-600 dark:text-yellow-400">+3 points if &lt;40%</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Low win rate indicates poor strategy</p>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">Profit Factor</span>
                                              <span className="text-xs text-orange-600 dark:text-orange-400">+3 points if &lt;1.0</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Negative profit factor is dangerous</p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Emotional Trading</span>
                                              <span className="text-xs text-purple-600 dark:text-purple-400">+2 points if &gt;5 trades</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Trades made during emotional states</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Risk Levels:</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                    <div>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-300">VERY LOW (0-1 points)</span>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Excellent risk management</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <div>
                      <span className="font-semibold text-blue-700 dark:text-blue-300">LOW (2-4 points)</span>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Good risk management</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <div>
                      <span className="font-semibold text-yellow-700 dark:text-yellow-300">MEDIUM (5-7 points)</span>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Moderate risk level</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <div>
                      <span className="font-semibold text-red-700 dark:text-red-300">HIGH (8+ points)</span>
                      <p className="text-xs text-slate-600 dark:text-slate-400">High risk detected</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pattern Recognition */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <IconTrendingUp className="w-4 h-4 text-white" />
              </div>
              Pattern Recognition System
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Day Analysis</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Analyzes your performance by day of the week to identify your best and worst trading days.
                </p>
                <div className="text-xs text-slate-500 dark:text-slate-500">
                  • Groups trades by day of week<br/>
                  • Calculates win rate per day<br/>
                  • Identifies patterns in performance
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Setup Analysis</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Evaluates the success rate of different trading setups to help you focus on what works.
                </p>
                <div className="text-xs text-slate-500 dark:text-slate-500">
                  • Categorizes trades by setup type<br/>
                  • Calculates success rate per setup<br/>
                  • Recommends focus areas
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Psychology Patterns</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Connects your emotional state with trading performance to identify emotional patterns.
                </p>
                <div className="text-xs text-slate-500 dark:text-slate-500">
                  • Analyzes psychology entries<br/>
                  • Detects emotional keywords<br/>
                  • Correlates with trade outcomes
                </div>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <IconLightbulb className="w-4 h-4 text-white" />
              </div>
              Pro Tips for Better Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">Log psychology entries regularly for better emotional analysis</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">Use consistent setup names for better pattern recognition</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">Focus on quality over quantity for better win rates</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">Review recommendations regularly and track improvements</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">Pay attention to alerts to avoid emotional trading</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">Use the refresh button to get updated analysis after new trades</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITradingAssistantTab;
