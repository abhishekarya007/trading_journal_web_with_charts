import React from 'react';
import { 
  IconTrendingUp, 
  IconBarChart, 
  IconBookOpen, 
  IconChevronLeft, 
  IconChevronRight,
  IconCandle 
} from './icons';

const Navigation = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen }) => {
  const navigationItems = [
    {
      id: 'trades',
      label: 'Trades',
      icon: IconTrendingUp,
      description: 'Manage your trades'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: IconBarChart,
      description: 'View performance metrics'
    },
    {
      id: 'rules',
      label: 'Trading Rules',
      icon: IconBookOpen,
      description: 'Essential trading principles'
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      {/* Navigation Sidebar */}
      <nav className={`bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 flex flex-col z-50 ${
        // Desktop: Always visible with collapse functionality
        isCollapsed ? 'hidden lg:flex lg:w-16' : 'hidden lg:flex lg:w-64'
      } ${
        // Mobile: Fixed overlay when open
        mobileOpen ? 'fixed inset-y-0 left-0 w-64' : ''
      }`}>
      {/* Navigation Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <IconCandle className="w-6 h-6 text-sky-600" />
              <span className="font-semibold text-slate-900 dark:text-white">Navigation</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            {isCollapsed ? (
              <IconChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            ) : (
              <IconChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-2">
        <div className="space-y-1">
          {navigationItems.map((item) => {
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                title={isCollapsed ? item.label : item.description}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                }`} />
                
                {!isCollapsed && (
                  <div className="flex flex-col items-start min-w-0">
                    <span className="font-medium truncate">{item.label}</span>
                    <span className={`text-xs truncate ${
                      isActive 
                        ? 'text-sky-100' 
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {item.description}
                    </span>
                  </div>
                )}
                
                {/* Active indicator for collapsed state */}
                {isCollapsed && isActive && (
                  <div className="absolute left-0 w-1 h-8 bg-white rounded-r-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Trading Journal v1
          </div>
        </div>
      )}
    </nav>
    </>
  );
};

export default Navigation;
