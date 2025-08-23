import React, { useState, useEffect } from 'react';
import { 
  IconZap, 
  IconBrain, 
  IconTarget, 
  IconAlertTriangle, 
  IconRefresh,
  IconCheck,
  IconX,
  IconStar,
  IconClock,
  IconShield,
  IconTrendingUp,
  IconBarChart,
  IconSettings,
  IconLightbulb,
  IconCalendar,
  IconActivity
} from './icons';
import { automationService } from '../services/automationService';

const SmartAutomationTab = ({ trades, psychologyData, formatNumber }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [insights, setInsights] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoCategories, setAutoCategories] = useState({});
  const [preferences, setPreferences] = useState(automationService.userPreferences);
  const [timeframe, setTimeframe] = useState('week');

  useEffect(() => {
    if (trades.length > 0) {
      runAutomation();
    }
  }, [trades, psychologyData, timeframe]);

  const runAutomation = async () => {
    setIsProcessing(true);
    
    try {
      // Validate inputs
      if (!trades || !Array.isArray(trades)) {
        console.warn('Invalid trades data provided to SmartAutomationTab');
        setInsights([]);
        setAlerts([]);
        setAutoCategories({});
        return;
      }

      // Generate automated insights
      const newInsights = automationService.generateAutomatedInsights(trades, psychologyData, timeframe);
      setInsights(newInsights || []);

      // Generate smart alerts
      const newAlerts = automationService.generateSmartAlerts(trades, psychologyData);
      setAlerts(newAlerts || []);

      // Auto-categorize recent trades
      const categories = {};
      console.log('Processing trades for auto-categorization:', trades.length);
      
      trades.slice(0, 10).forEach((trade, index) => {
        console.log(`Processing trade ${index}:`, trade);
        
        // Use the most reliable ID - prefer trade.id, fallback to index
        const tradeId = trade.id !== undefined && trade.id !== null ? trade.id : `trade_${index}`;
        
        if (trade) {
          try {
            categories[tradeId] = automationService.categorizeTrade(trade);
            console.log(`Categorized trade ${tradeId}:`, categories[tradeId]);
          } catch (error) {
            console.error('Error categorizing trade:', error);
            categories[tradeId] = {
              setup: 'Unknown',
              riskLevel: 'Low',
              marketCondition: 'Normal',
              timeOfDay: 'Regular Hours',
              emotionalState: 'Unknown',
              quality: 'Poor'
            };
          }
        }
      });
      
      console.log('Final categories:', categories);
      setAutoCategories(categories);

    } catch (error) {
      console.error('Automation error:', error);
      setInsights([]);
      setAlerts([]);
      setAutoCategories({});
    } finally {
      setIsProcessing(false);
    }
  };

  const dismissInsight = (insightId) => {
    setInsights(prev => prev.filter(insight => insight.id !== insightId));
  };

  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'positive': return '✅';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📊';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '🔔';
    }
  };

  const getCategoryColor = (category, value) => {
    const colors = {
      setup: {
        'Breakout': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        'Pullback': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        'Reversal': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        'Momentum': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
        'Unknown': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
      },
      riskLevel: {
        'High': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        'Medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        'Low': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      },
      quality: {
        'Excellent': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        'Good': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        'Fair': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        'Poor': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      }
    };
    
    return colors[category]?.[value] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8 animate-bounce"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <IconZap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Smart Automation</h1>
              <p className="text-indigo-100">Intelligent insights and automated analysis for your trading</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <IconLightbulb className="w-4 h-4" />
                <span className="text-sm font-medium">Active Insights</span>
              </div>
              <div className="text-2xl font-bold">{insights.length}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <IconAlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Smart Alerts</span>
              </div>
              <div className="text-2xl font-bold">{alerts.length}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <IconTarget className="w-4 h-4" />
                <span className="text-sm font-medium">Auto-Tagged</span>
              </div>
              <div className="text-2xl font-bold">{Object.keys(autoCategories).length}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <IconRefresh className="w-4 h-4" />
                <span className="text-sm font-medium">Status</span>
              </div>
              <div className="text-sm font-bold">
                {isProcessing ? 'Processing...' : 'Ready'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Timeframe:</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={runAutomation}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 disabled:opacity-50"
            >
              <IconRefresh className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              {isProcessing ? 'Processing...' : 'Refresh Analysis'}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-2 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="flex gap-1 overflow-x-auto">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: IconBarChart },
            { id: 'insights', name: 'Auto Insights', icon: IconLightbulb },
            { id: 'alerts', name: 'Smart Alerts', icon: IconAlertTriangle },
            { id: 'categories', name: 'Auto Categories', icon: IconTarget },
            { id: 'settings', name: 'Settings', icon: IconSettings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeSection === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Section */}
      {activeSection === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Insights */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <IconLightbulb className="w-5 h-5 text-yellow-500" />
              Recent Insights
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {insights.slice(0, 5).map((insight, index) => (
                <div key={insight.id} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{getInsightIcon(insight.type)}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{insight.title}</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">{insight.message}</p>
                    </div>
                  </div>
                </div>
              ))}
              {insights.length === 0 && (
                <p className="text-slate-500 dark:text-slate-500 text-center py-4">No insights available</p>
              )}
            </div>
          </div>

          {/* Active Alerts */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <IconAlertTriangle className="w-5 h-5 text-red-500" />
              Active Alerts
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {alerts.map((alert, index) => (
                <div key={alert.id} className={`p-3 rounded-lg border ${
                  alert.type === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' :
                  alert.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700' :
                  'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                }`}>
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{getAlertIcon(alert.type)}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{alert.title}</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">{alert.message}</p>
                    </div>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                    >
                      <IconX className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
              {alerts.length === 0 && (
                <p className="text-slate-500 dark:text-slate-500 text-center py-4">No alerts active</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auto Insights Section */}
      {activeSection === 'insights' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <IconLightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Automated Insights</h2>
              <p className="text-slate-600 dark:text-slate-400">AI-generated insights from your trading patterns</p>
            </div>
          </div>

          {insights.length === 0 ? (
            <div className="text-center py-12">
              <IconLightbulb className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">No Insights Yet</h3>
              <p className="text-slate-500 dark:text-slate-500">Add more trades to get automated insights</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div 
                  key={insight.id}
                  className={`bg-gradient-to-r rounded-xl p-6 border ${
                    insight.type === 'positive' ? 'from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-700' :
                    insight.type === 'warning' ? 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700' :
                    'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{getInsightIcon(insight.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-slate-900 dark:text-white">{insight.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            insight.category === 'performance' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                            insight.category === 'pattern' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                            insight.category === 'risk' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                            insight.category === 'behavior' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                          }`}>
                            {insight.category}
                          </span>
                          <button
                            onClick={() => dismissInsight(insight.id)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                          >
                            <IconX className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mb-3">{insight.message}</p>
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Recommended Action:</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{insight.action}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Smart Alerts Section */}
      {activeSection === 'alerts' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
              <IconAlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Smart Alerts</h2>
              <p className="text-slate-600 dark:text-slate-400">Real-time alerts based on your trading behavior</p>
            </div>
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <IconCheck className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">All Clear!</h3>
              <p className="text-slate-500 dark:text-slate-500">No alerts at the moment. Keep up the good work!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div 
                  key={alert.id}
                  className={`bg-gradient-to-r rounded-xl p-6 border ${
                    alert.type === 'critical' ? 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-700' :
                    alert.type === 'warning' ? 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700' :
                    'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{getAlertIcon(alert.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-slate-900 dark:text-white">{alert.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            alert.urgency === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                            alert.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}>
                            {alert.urgency} priority
                          </span>
                          <button
                            onClick={() => dismissAlert(alert.id)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                          >
                            <IconX className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mb-3">{alert.message}</p>
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Recommended Action:</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{alert.action}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Auto Categories Section */}
      {activeSection === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <IconTarget className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Auto Categories</h2>
              <p className="text-slate-600 dark:text-slate-400">Automatically categorized trades and patterns</p>
            </div>
          </div>

          {Object.keys(autoCategories).length === 0 ? (
            <div className="text-center py-12">
              <IconTarget className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">No Categories Yet</h3>
              <p className="text-slate-500 dark:text-slate-500">Categories will appear as trades are analyzed</p>
              <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400">Debug Info:</p>
                <p className="text-xs text-slate-500 dark:text-slate-500">Total trades: {trades.length}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500">Processing: {isProcessing ? 'Yes' : 'No'}</p>
                <button 
                  onClick={runAutomation}
                  className="mt-2 px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
                >
                  Force Refresh
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(autoCategories).map(([tradeId, categories]) => {
                // Try multiple ways to find the trade
                let trade = null;
                
                // Method 1: Direct ID match
                trade = trades.find(t => t.id === tradeId);
                
                // Method 2: String ID match (in case IDs are stored as strings)
                if (!trade) {
                  trade = trades.find(t => String(t.id) === String(tradeId));
                }
                
                // Method 3: Index-based fallback
                if (!trade && tradeId.startsWith('trade_')) {
                  const index = parseInt(tradeId.replace('trade_', ''));
                  trade = trades[index];
                }
                
                // Method 4: Try to find by any numeric ID
                if (!trade && !isNaN(tradeId)) {
                  trade = trades.find(t => t.id === parseInt(tradeId));
                }
                
                if (!trade) {
                  console.log('Trade not found for ID:', tradeId, 'Available trades:', trades.map(t => ({ id: t.id, stock: t.stock })));
                  // Show a fallback display for the categories even if trade not found
                  return (
                    <div key={tradeId} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">Trade #{tradeId}</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Trade data not available</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-slate-500 dark:text-slate-400">Unknown Date</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor('setup', categories.setup)}`}>
                          {categories.setup}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor('riskLevel', categories.riskLevel)}`}>
                          {categories.riskLevel}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor('quality', categories.quality)}`}>
                          {categories.quality}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                          {categories.marketCondition}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                          {categories.timeOfDay}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                          {categories.emotionalState}
                        </span>
                      </div>
                    </div>
                  );
                }

                // Safely get trade data with fallbacks
                const stockName = trade.stock || 'Unknown Stock';
                const tradeDate = trade.date ? new Date(trade.date).toLocaleDateString() : 'Unknown Date';
                const profit = trade.meta?.net || 0;
                const isProfitable = profit > 0;

                return (
                  <div key={tradeId} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start gap-4">
                      <div className={`w-3 h-3 rounded-full mt-2 ${
                        isProfitable ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {stockName} • {tradeDate}
                          </h3>
                          <span className={`text-sm font-bold ${
                            isProfitable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            ₹{formatNumber(profit)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                          <div>
                            <span className="text-xs text-slate-500 dark:text-slate-500 block mb-1">Setup</span>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor('setup', categories.setup)}`}>
                              {categories.setup}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 dark:text-slate-500 block mb-1">Risk Level</span>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor('riskLevel', categories.riskLevel)}`}>
                              {categories.riskLevel}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 dark:text-slate-500 block mb-1">Quality</span>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor('quality', categories.quality)}`}>
                              {categories.quality}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 dark:text-slate-500 block mb-1">Market</span>
                            <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
                              {categories.marketCondition}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 dark:text-slate-500 block mb-1">Time</span>
                            <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
                              {categories.timeOfDay}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 dark:text-slate-500 block mb-1">Emotion</span>
                            <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
                              {categories.emotionalState}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Settings Section */}
      {activeSection === 'settings' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-slate-500 rounded-xl flex items-center justify-center">
              <IconSettings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Automation Settings</h2>
              <p className="text-slate-600 dark:text-slate-400">Configure your automation preferences</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">General Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Enable Auto Insights</label>
                  <p className="text-xs text-slate-500 dark:text-slate-500">Automatically generate trading insights</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.enableAutoInsights}
                  onChange={(e) => setPreferences(prev => ({ ...prev, enableAutoInsights: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Enable Smart Alerts</label>
                  <p className="text-xs text-slate-500 dark:text-slate-500">Get alerts for important trading events</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.enableSmartAlerts}
                  onChange={(e) => setPreferences(prev => ({ ...prev, enableSmartAlerts: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Enable Auto Tagging</label>
                  <p className="text-xs text-slate-500 dark:text-slate-500">Automatically categorize trades</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.enableAutoTagging}
                  onChange={(e) => setPreferences(prev => ({ ...prev, enableAutoTagging: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Alert Thresholds</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Losing Streak Alert
                </label>
                <input
                  type="number"
                  value={preferences.alertThresholds.losingStreak}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    alertThresholds: { ...prev.alertThresholds, losingStreak: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-sm"
                  min="1"
                  max="10"
                />
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Number of consecutive losses</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Daily Trade Limit
                </label>
                <input
                  type="number"
                  value={preferences.alertThresholds.dailyTradeLimit}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    alertThresholds: { ...prev.alertThresholds, dailyTradeLimit: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-sm"
                  min="1"
                  max="20"
                />
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Trades per day threshold</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Large Loss Amount
                </label>
                <input
                  type="number"
                  value={preferences.alertThresholds.largeLossAmount}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    alertThresholds: { ...prev.alertThresholds, largeLossAmount: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-sm"
                  min="100"
                  step="100"
                />
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Loss amount in ₹</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => automationService.saveUserPreferences(preferences)}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-600 transition-all duration-300"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartAutomationTab;
