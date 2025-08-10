import React, { useState, useEffect } from 'react';
import { 
  IconTrendingUp, 
  IconBarChart, 
  IconBookOpen, 
  IconChevronLeft, 
  IconChevronRight,
  IconCandle,
  IconDownload,
  IconZap,
  IconRocket,
  IconStar,
  IconHeart,
  IconSparkles
} from './icons';

const Navigation = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [animateItems, setAnimateItems] = useState(false);

  useEffect(() => {
    setAnimateItems(true);
  }, []);

  // Add some fun animations on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setHoveredItem('trades');
      setTimeout(() => setHoveredItem('analytics'), 300);
      setTimeout(() => setHoveredItem('rules'), 600);
      setTimeout(() => setHoveredItem(null), 900);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case '1':
            e.preventDefault();
            setActiveTab('trades');
            break;
          case '2':
            e.preventDefault();
            setActiveTab('analytics');
            break;
          case '3':
            e.preventDefault();
            setActiveTab('rules');
            break;
          case 'b':
            e.preventDefault();
            setIsCollapsed(!isCollapsed);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab, isCollapsed, setIsCollapsed]);

  const navigationItems = [
    {
      id: 'trades',
      label: 'Trades',
      icon: IconTrendingUp,
      description: 'Manage your trades',
      color: 'from-emerald-500 to-green-500',
      bgColor: 'from-emerald-50 to-green-50',
      darkBgColor: 'from-emerald-900/20 to-green-900/20'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: IconBarChart,
      description: 'View performance metrics',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      darkBgColor: 'from-blue-900/20 to-cyan-900/20'
    },
    {
      id: 'rules',
      label: 'Trading Rules',
      icon: IconBookOpen,
      description: 'Essential trading principles',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
      darkBgColor: 'from-purple-900/20 to-pink-900/20'
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm" 
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      {/* Navigation Sidebar */}
      <nav className={`bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-r border-slate-200 dark:border-slate-700 transition-all duration-500 flex flex-col z-10 shadow-xl ${
        // Desktop: Always visible with collapse functionality
        isCollapsed ? 'hidden lg:flex lg:w-20' : 'hidden lg:flex lg:w-72'
      } ${
        // Mobile: Fixed overlay when open
        mobileOpen ? 'fixed inset-y-0 left-0 w-72' : ''
      }`}>
        
        {/* Navigation Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8 animate-bounce"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              {!isCollapsed && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <IconCandle className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Trading Journal</h1>
                    <p className="text-indigo-100 text-sm">Your success companion</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all duration-300 transform hover:scale-110"
                title={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
              >
                {isCollapsed ? (
                  <IconChevronRight className="w-5 h-5" />
                ) : (
                  <IconChevronLeft className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Quick Stats */}
            {!isCollapsed && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <div className="flex items-center gap-2">
                    <IconZap className="w-4 h-4 text-yellow-300" />
                    <div>
                      <div className="text-lg font-bold">Active</div>
                      <div className="text-indigo-100 text-xs">Ready to trade</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <div className="flex items-center gap-2">
                    <IconRocket className="w-4 h-4 text-emerald-300" />
                    <div>
                      <div className="text-lg font-bold">Pro</div>
                      <div className="text-indigo-100 text-xs">Premium features</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 p-4">
          <div className="space-y-2">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    // Close mobile menu when item is selected
                    if (setMobileOpen) setMobileOpen(false);
                  }}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 group relative overflow-hidden ${
                    isActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                      : `text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r ${item.bgColor} dark:hover:${item.darkBgColor}`
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  title={isCollapsed ? item.label : item.description}
                >
                  {/* Background Animation */}
                  {hoveredItem === item.id && !isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.bgColor} dark:${item.darkBgColor} opacity-50 animate-pulse`}></div>
                  )}
                  
                  <div className="relative z-10 flex items-center gap-4 w-full">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                      isActive 
                        ? 'bg-white/20 backdrop-blur-sm' 
                        : `bg-gradient-to-r ${item.color} text-white group-hover:scale-110`
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        isActive 
                          ? 'text-white' 
                          : 'text-white group-hover:animate-pulse'
                      }`} />
                    </div>
                    
                    {!isCollapsed && (
                      <div className="flex flex-col items-start min-w-0 flex-1">
                        <span className="font-bold text-base truncate">{item.label}</span>
                        <span className={`text-sm truncate ${
                          isActive 
                            ? 'text-white/80' 
                            : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                        }`}>
                          {item.description}
                        </span>
                      </div>
                    )}
                    
                    {/* Active indicator for collapsed state */}
                    {isCollapsed && isActive && (
                      <div className="absolute left-0 w-1 h-12 bg-white rounded-r-full shadow-lg"></div>
                    )}

                    {/* Hover indicator */}
                    {hoveredItem === item.id && !isActive && !isCollapsed && (
                      <div className="absolute right-2 w-2 h-2 bg-current rounded-full animate-pulse"></div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <IconStar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">Trading Journal</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">v1.0.0</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <IconHeart className="w-3 h-3 text-red-500" />
                <span>Made with passion</span>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed Footer */}
        {isCollapsed && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mx-auto">
              <IconSparkles className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navigation;
