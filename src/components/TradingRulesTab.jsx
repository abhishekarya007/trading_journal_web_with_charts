import React, { useState, useEffect } from 'react';
import { 
  IconBookOpen, 
  IconSearch, 
  IconFilter, 
  IconTarget,
  IconShield,
  IconClock,
  IconAlertTriangle,
  IconBrain,
  IconStar,
  IconHeart,
  IconLightbulb,
  IconAward,
  IconBookmark,
  IconEye
} from './icons';

const tradingRules = [
  {
    id: 1,
    title: "No Plan No Trade",
    description: "Never enter a trade without a clear plan and strategy. Every trade should have defined entry, exit, and risk management points.",
    category: "Planning",
    icon: "📋",
    priority: "high",
    color: "blue",
    tips: ["Define entry and exit points", "Set stop loss before entry", "Know your risk-reward ratio"]
  },
  {
    id: 2,
    title: "No Journal No Trade", 
    description: "Document every trade to learn from your decisions. Your trading journal is your best teacher.",
    category: "Documentation",
    icon: "📝",
    priority: "high",
    color: "green",
    tips: ["Record entry/exit reasons", "Note your emotions", "Review weekly"]
  },
  {
    id: 3,
    title: "One Trade a Day & Scalping Strategy",
    description: "Levels → One trade a day | Price action → Scalping. Choose your strategy and stick to it.",
    category: "Frequency",
    icon: "🎯",
    priority: "medium",
    color: "purple",
    tips: ["Don't mix strategies", "Be consistent", "Quality over quantity"]
  },
  {
    id: 4,
    title: "Short Target in Opposite Trend",
    description: "Keep shorter targets when trading against the main trend. Respect the market direction.",
    category: "Risk Management",
    icon: "⚡",
    priority: "medium",
    color: "red",
    tips: ["Identify trend first", "Reduce position size", "Tighten stops"]
  },
  {
    id: 5,
    title: "Limited Loss Per Day - 1% Max",
    description: "Never risk more than 1% of your capital in a single day. Protect your capital at all costs.",
    category: "Risk Management",
    icon: "🛡️",
    priority: "high",
    color: "red",
    tips: ["Calculate 1% of capital", "Set daily loss limit", "Stop when hit"]
  },
  {
    id: 6,
    title: "Trail SL & Book Half on Fear",
    description: "Trail stop loss and book 50% quantity when feeling fearful. Let profits run, cut losses short.",
    category: "Psychology",
    icon: "🎪",
    priority: "medium",
    color: "orange",
    tips: ["Move SL to breakeven", "Book partial profits", "Trust your instincts"]
  },
  {
    id: 7,
    title: "No Overtrading - Accept Daily Loss",
    description: "Stop trading for the day once daily limit is hit. Tomorrow is another opportunity.",
    category: "Discipline",
    icon: "🚫",
    priority: "high",
    color: "indigo",
    tips: ["Set daily limits", "Walk away when hit", "Don't revenge trade"]
  },
  {
    id: 8,
    title: "Survival Over Hope",
    description: "Place stops where you can survive, not where you hope price won't go. Be realistic.",
    category: "Risk Management",
    icon: "🏔️",
    priority: "high",
    color: "red",
    tips: ["Use technical levels", "Don't hope for reversal", "Accept the loss"]
  },
  {
    id: 9,
    title: "30-Min Cool Down After Loss",
    description: "Wait at least 30 minutes before taking another trade after a loss. Clear your mind.",
    category: "Psychology",
    icon: "⏰",
    priority: "medium",
    color: "orange",
    tips: ["Take a walk", "Review the loss", "Reset mentally"]
  }
];

const categories = [
  { name: "All", color: "slate", icon: IconBookOpen },
  { name: "Planning", color: "blue", icon: IconTarget },
  { name: "Documentation", color: "green", icon: IconBookmark },
  { name: "Frequency", color: "purple", icon: IconClock },
  { name: "Risk Management", color: "red", icon: IconShield },
  { name: "Psychology", color: "orange", icon: IconBrain },
  { name: "Discipline", color: "indigo", icon: IconAward }
];

const priorities = [
  { name: "All", color: "slate", icon: IconBookOpen },
  { name: "High", color: "red", icon: IconAlertTriangle },
  { name: "Medium", color: "yellow", icon: IconStar }
];

export default function TradingRulesTab() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredRule, setHoveredRule] = useState(null);
  const [animateCards, setAnimateCards] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);

  useEffect(() => {
    setAnimateCards(true);
  }, []);

  // Add some fun animations on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setHoveredRule(1);
      setTimeout(() => setHoveredRule(2), 300);
      setTimeout(() => setHoveredRule(3), 600);
      setTimeout(() => setHoveredRule(null), 900);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredRules = tradingRules.filter(rule => {
    const matchesCategory = selectedCategory === "All" || rule.category === selectedCategory;
    const matchesPriority = selectedPriority === "All" || rule.priority === selectedPriority.toLowerCase();
    const matchesSearch = rule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesPriority && matchesSearch;
  });

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-gradient-to-r from-red-500 to-pink-500';
      case 'medium': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      default: return 'bg-gradient-to-r from-slate-500 to-gray-500';
    }
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      'Planning': 'from-blue-500 to-cyan-500',
      'Documentation': 'from-green-500 to-emerald-500',
      'Frequency': 'from-purple-500 to-pink-500',
      'Risk Management': 'from-red-500 to-rose-500',
      'Psychology': 'from-orange-500 to-red-500',
      'Discipline': 'from-indigo-500 to-purple-500'
    };
    return `bg-gradient-to-r ${colorMap[category] || 'from-slate-500 to-gray-500'}`;
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Planning': IconTarget,
      'Documentation': IconBookmark,
      'Frequency': IconClock,
      'Risk Management': IconShield,
      'Psychology': IconBrain,
      'Discipline': IconAward
    };
    return iconMap[category] || IconBookOpen;
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white animate-pulse">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 animate-bounce"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/5 rounded-full -translate-x-8 -translate-y-8 animate-spin"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <IconBookOpen className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Trading Rules</h1>
              <p className="text-indigo-100 text-lg">Your foundation for disciplined trading success</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center animate-pulse">
                  <IconBookOpen className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold animate-pulse">{tradingRules.length}</div>
                  <div className="text-indigo-100 text-sm">Total Rules</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center animate-bounce">
                  <IconAlertTriangle className="w-5 h-5 text-red-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold animate-pulse">
                    {tradingRules.filter(r => r.priority === 'high').length}
                  </div>
                  <div className="text-indigo-100 text-sm">High Priority</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center animate-spin">
                  <IconAward className="w-5 h-5 text-green-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold animate-pulse">{categories.length - 1}</div>
                  <div className="text-indigo-100 text-sm">Categories</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="space-y-6">
          {/* Search */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <IconSearch className="w-4 h-4 text-white" />
              </div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Search Rules
              </label>
            </div>
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <IconFilter className="w-4 h-4 text-white" />
              </div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Category
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                      selectedCategory === category.name
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <IconStar className="w-4 h-4 text-white" />
              </div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Priority
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {priorities.map(priority => {
                const IconComponent = priority.icon;
                return (
                  <button
                    key={priority.name}
                    onClick={() => setSelectedPriority(priority.name)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                      selectedPriority === priority.name
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {priority.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRules.map((rule, index) => {
          const CategoryIcon = getCategoryIcon(rule.category);
          return (
            <div
              key={rule.id}
              className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                hoveredRule === rule.id ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
              onMouseEnter={() => setHoveredRule(rule.id)}
              onMouseLeave={() => setHoveredRule(null)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${getCategoryColor(rule.category)} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                    <span className="text-lg">{rule.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                      {rule.title}
                    </h3>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${getPriorityColor(rule.priority)} shadow-lg`}>
                    {rule.priority.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 leading-relaxed">
                {rule.description}
              </p>

              {/* Tips */}
              {rule.tips && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <IconLightbulb className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quick Tips:</span>
                  </div>
                  <ul className="space-y-1">
                    {rule.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <CategoryIcon className="w-4 h-4 text-slate-400" />
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${getCategoryColor(rule.category)}`}>
                    {rule.category}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <IconEye className="w-3 h-3" />
                  <span className="text-xs">Rule #{rule.id}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredRules.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl animate-bounce">
            🔍
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">No rules found</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Try adjusting your search or filter criteria to find the trading rules you're looking for.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
              setSelectedPriority("All");
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Footer Info */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <IconHeart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-amber-900 dark:text-amber-200 mb-2 text-lg">Remember</h4>
            <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
              These trading rules are your foundation for consistent, disciplined trading. Review them regularly, 
              integrate them into your daily routine, and let them guide your decisions in the market. 
              Success comes from following your rules consistently, not from breaking them occasionally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
