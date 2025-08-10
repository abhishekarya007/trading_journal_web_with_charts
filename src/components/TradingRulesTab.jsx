import React, { useState } from 'react';

const tradingRules = [
  {
    id: 1,
    title: "No Plan No Trade",
    description: "Never enter a trade without a clear plan and strategy",
    category: "Planning",
    icon: "📋",
    priority: "high"
  },
  {
    id: 2,
    title: "No Journal No Trade", 
    description: "Document every trade to learn from your decisions",
    category: "Documentation",
    icon: "📝",
    priority: "high"
  },
  {
    id: 3,
    title: "One Trade a Day & Scalping Strategy",
    description: "Levels → One trade a day | Price action → Scalping",
    category: "Frequency",
    icon: "🎯",
    priority: "medium"
  },
  {
    id: 4,
    title: "Short Target in Opposite Trend",
    description: "Keep shorter targets when trading against the main trend",
    category: "Risk Management",
    icon: "⚡",
    priority: "medium"
  },
  {
    id: 5,
    title: "Limited Loss Per Day - 1% Max",
    description: "Never risk more than 1% of your capital in a single day",
    category: "Risk Management",
    icon: "🛡️",
    priority: "high"
  },
  {
    id: 6,
    title: "Trail SL & Book Half on Fear",
    description: "Trail stop loss and book 50% quantity when feeling fearful",
    category: "Psychology",
    icon: "🎪",
    priority: "medium"
  },
  {
    id: 7,
    title: "No Overtrading - Accept Daily Loss",
    description: "Stop trading for the day once daily limit is hit",
    category: "Discipline",
    icon: "🚫",
    priority: "high"
  },
  {
    id: 8,
    title: "Survival Over Hope",
    description: "Place stops where you can survive, not where you hope price won't go",
    category: "Risk Management",
    icon: "🏔️",
    priority: "high"
  },
  {
    id: 9,
    title: "30-Min Cool Down After Loss",
    description: "Wait at least 30 minutes before taking another trade after a loss",
    category: "Psychology",
    icon: "⏰",
    priority: "medium"
  }
];

const categories = [
  { name: "All", color: "slate" },
  { name: "Planning", color: "blue" },
  { name: "Documentation", color: "green" },
  { name: "Frequency", color: "purple" },
  { name: "Risk Management", color: "red" },
  { name: "Psychology", color: "orange" },
  { name: "Discipline", color: "indigo" }
];

const priorities = [
  { name: "All", color: "slate" },
  { name: "High", color: "red" },
  { name: "Medium", color: "yellow" }
];

export default function TradingRulesTab() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRules = tradingRules.filter(rule => {
    const matchesCategory = selectedCategory === "All" || rule.category === selectedCategory;
    const matchesPriority = selectedPriority === "All" || rule.priority === selectedPriority.toLowerCase();
    const matchesSearch = rule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesPriority && matchesSearch;
  });

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      'Planning': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Documentation': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Frequency': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'Risk Management': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'Psychology': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'Discipline': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
    };
    return colorMap[category] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
            📚
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Trading Rules</h1>
            <p className="text-slate-600 dark:text-slate-300">Essential principles for disciplined trading</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{tradingRules.length}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Total Rules</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {tradingRules.filter(r => r.priority === 'high').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">High Priority</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {categories.length - 1}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Categories</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Search Rules
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.name
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Priority
            </label>
            <div className="flex flex-wrap gap-2">
              {priorities.map(priority => (
                <button
                  key={priority.name}
                  onClick={() => setSelectedPriority(priority.name)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedPriority === priority.name
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {priority.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRules.map((rule) => (
          <div
            key={rule.id}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-lg">
                  {rule.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-tight">
                    {rule.title}
                  </h3>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rule.priority)}`}>
                  {rule.priority}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 leading-relaxed">
              {rule.description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(rule.category)}`}>
                {rule.category}
              </span>
              <div className="flex items-center gap-1 text-slate-400">
                <span className="text-xs">Rule #{rule.id}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredRules.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            🔍
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No rules found</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
              setSelectedPriority("All");
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Footer Info */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-amber-900 dark:text-amber-200 mb-1">Remember</h4>
            <p className="text-sm text-amber-800 dark:text-amber-300">
              These rules are your foundation for consistent, disciplined trading. Review them regularly and integrate them into your daily routine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
