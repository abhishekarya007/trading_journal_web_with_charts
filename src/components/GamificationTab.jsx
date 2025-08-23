import React, { useState } from 'react';
import { 
  IconTrophy, 
  IconStar, 
  IconTarget, 
  IconTrendingUp, 
  IconFire,
  IconBrain,
  IconCalendar,
  IconUsers,
  IconActivity,
  IconZap,
  IconAward,
  IconCheck,
  IconClock
} from './icons';

const GamificationTab = ({ gamificationData, formatNumber }) => {
  const [activeSection, setActiveSection] = useState('overview');

  const getXPForLevel = (level) => {
    // Calculate total XP needed to reach a specific level
    let totalXP = 0;
    for (let i = 1; i < level; i++) {
      totalXP += 200 + (i - 1) * 100;
    }
    return totalXP;
  };

  const getLevelProgress = () => {
    const currentLevel = gamificationData.level;
    const currentXP = gamificationData.experience;
    const xpForCurrentLevel = getXPForLevel(currentLevel);
    const xpForNextLevel = getXPForLevel(currentLevel + 1);
    const xpNeededForThisLevel = xpForNextLevel - xpForCurrentLevel;
    const xpEarnedInThisLevel = currentXP - xpForCurrentLevel;
    
    const progress = (xpEarnedInThisLevel / xpNeededForThisLevel) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const getNextLevelExp = () => {
    const currentLevel = gamificationData.level;
    const currentXP = gamificationData.experience;
    const xpForNextLevel = getXPForLevel(currentLevel + 1);
    return xpForNextLevel - currentXP;
  };

  const getXPRequiredForNextLevel = () => {
    const currentLevel = gamificationData.level;
    return 200 + (currentLevel - 1) * 100; // XP needed for next level
  };

  const getLevelTitle = (level) => {
    const titles = {
      1: 'Novice Trader',
      2: 'Apprentice Trader', 
      3: 'Skilled Trader',
      4: 'Experienced Trader',
      5: 'Advanced Trader',
      6: 'Expert Trader',
      7: 'Master Trader',
      8: 'Elite Trader',
      9: 'Legendary Trader',
      10: 'Mythic Trader',
      11: 'Divine Trader',
      12: 'Immortal Trader',
      13: 'Transcendent Trader',
      14: 'Cosmic Trader',
      15: 'Universal Trader',
      16: 'Dimensional Trader',
      17: 'Omniscient Trader',
      18: 'Supreme Trader',
      19: 'Ultimate Trader',
      20: 'Trading God'
    };
    return titles[level] || `Level ${level} Trading Master`;
  };

  const getLevelColor = (level) => {
    if (level <= 3) return 'from-gray-400 to-gray-600'; // Bronze
    if (level <= 7) return 'from-green-400 to-green-600'; // Silver
    if (level <= 12) return 'from-blue-400 to-blue-600'; // Gold
    if (level <= 17) return 'from-purple-400 to-purple-600'; // Diamond
    return 'from-yellow-400 to-yellow-600'; // Legendary
  };

  const getTierColor = (tier) => {
    const colors = {
      'Bronze': 'from-amber-600 to-orange-600',
      'Silver': 'from-slate-400 to-slate-600', 
      'Gold': 'from-yellow-400 to-yellow-600',
      'Diamond': 'from-cyan-400 to-blue-500'
    };
    return colors[tier] || 'from-gray-400 to-gray-600';
  };

  const getTierTextColor = (tier) => {
    const colors = {
      'Bronze': 'text-amber-600 dark:text-amber-400',
      'Silver': 'text-slate-600 dark:text-slate-400',
      'Gold': 'text-yellow-600 dark:text-yellow-400', 
      'Diamond': 'text-cyan-600 dark:text-cyan-400'
    };
    return colors[tier] || 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 xl:p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8 sm:-translate-y-12 sm:translate-x-12 lg:-translate-y-16 lg:translate-x-16 animate-bounce"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-18 sm:h-18 lg:w-24 lg:h-24 bg-white/10 rounded-full translate-y-6 -translate-x-6 sm:translate-y-9 sm:-translate-x-9 lg:translate-y-12 lg:-translate-x-12 animate-pulse"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-16 xl:h-16 bg-white/20 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <IconTrophy className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-8 xl:h-8" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5 sm:mb-1 lg:mb-2">Trading Achievements</h1>
              <p className="text-yellow-100 text-xs sm:text-sm lg:text-base xl:text-lg">Level up your trading skills and track your progress</p>
            </div>
          </div>

          {/* Level Progress */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${getLevelColor(gamificationData.level)} rounded-xl flex items-center justify-center shadow-lg`}>
                  <span className="text-white font-bold text-lg sm:text-2xl">{gamificationData.level}</span>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">{getLevelTitle(gamificationData.level)}</h2>
                  <p className="text-yellow-100 text-sm">{gamificationData.experience} XP • {getNextLevelExp()} XP to next level</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-bold">{gamificationData.experience}</div>
                <div className="text-yellow-100 text-sm">Total XP</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-3 sm:h-4">
              <div 
                className="bg-gradient-to-r from-yellow-300 to-orange-400 h-3 sm:h-4 rounded-full transition-all duration-1000 ease-out shadow-lg"
                style={{ width: `${getLevelProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-2 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="flex gap-1">
          {[
            { id: 'overview', name: 'Overview', icon: IconStar },
            { id: 'achievements', name: 'Achievements', icon: IconTrophy },
            { id: 'streaks', name: 'Streaks', icon: IconFire },
            { id: 'challenges', name: 'Daily Challenges', icon: IconTarget }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
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
          {/* Total Trades */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 sm:p-6 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <IconActivity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Total Trades</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">All time</p>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
              {gamificationData.totalTrades}
            </div>
          </div>

          {/* Win Rate */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-4 sm:p-6 border border-emerald-200 dark:border-emerald-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                <IconTrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Win Rate</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Success rate</p>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {gamificationData.totalTrades > 0 
                ? Math.round((gamificationData.totalWins / gamificationData.totalTrades) * 100)
                : 0}%
            </div>
          </div>

          {/* Best Win Streak */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 sm:p-6 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <IconFire className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Best Streak</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Winning days</p>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
              {gamificationData.bestWinStreak}
            </div>
          </div>

          {/* Achievements Unlocked */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 sm:p-6 border border-yellow-200 dark:border-yellow-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <IconAward className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Achievements</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Unlocked</p>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {gamificationData.achievements.length}
            </div>
          </div>
        </div>
      )}

      {/* Achievements Section */}
      {activeSection === 'achievements' && (
        <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-bounce"></div>
            <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full opacity-30 animate-ping"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                  <IconTrophy className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-300 rounded-full animate-ping"></div>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                  Trading Achievements
                </h2>
                <p className="text-slate-600 dark:text-slate-400">Unlock legendary milestones on your trading journey</p>
              </div>
            </div>
            
            {/* Achievement Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white text-center">
                <div className="text-2xl font-bold">{gamificationData.achievements.filter(a => a.tier === 'Bronze').length}</div>
                <div className="text-xs opacity-90">Bronze</div>
              </div>
              <div className="bg-gradient-to-r from-slate-400 to-gray-500 rounded-xl p-4 text-white text-center">
                <div className="text-2xl font-bold">{gamificationData.achievements.filter(a => a.tier === 'Silver').length}</div>
                <div className="text-xs opacity-90">Silver</div>
              </div>
              <div className="bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl p-4 text-white text-center">
                <div className="text-2xl font-bold">{gamificationData.achievements.filter(a => a.tier === 'Gold').length}</div>
                <div className="text-xs opacity-90">Gold</div>
              </div>
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl p-4 text-white text-center">
                <div className="text-2xl font-bold">{gamificationData.achievements.filter(a => a.tier === 'Diamond').length}</div>
                <div className="text-xs opacity-90">Diamond</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gamificationData.achievements.map((achievement, index) => (
                <div 
                  key={achievement.id} 
                  className={`group relative overflow-hidden rounded-xl border-2 achievement-card animate-achievement-unlock ${
                    achievement.tier === 'Bronze' ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/30 dark:via-orange-900/30 dark:to-yellow-900/30 border-amber-300 dark:border-amber-600 shadow-amber-200 dark:shadow-amber-800 tier-bronze' :
                    achievement.tier === 'Silver' ? 'bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-800/30 dark:via-gray-800/30 dark:to-slate-700/30 border-slate-300 dark:border-slate-600 shadow-slate-200 dark:shadow-slate-800 tier-silver' :
                    achievement.tier === 'Gold' ? 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-900/30 dark:via-amber-900/30 dark:to-orange-900/30 border-yellow-300 dark:border-yellow-600 shadow-yellow-200 dark:shadow-yellow-800 tier-gold' :
                    achievement.tier === 'Diamond' ? 'bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-cyan-900/30 dark:via-blue-900/30 dark:to-indigo-900/30 border-cyan-300 dark:border-cyan-600 shadow-cyan-200 dark:shadow-cyan-800 tier-diamond animate-diamond-sparkle' :
                    'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-gray-800/30 dark:via-slate-800/30 dark:to-gray-700/30 border-gray-300 dark:border-gray-600'
                  }`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >

                  
                  {/* Achievement Content */}
                  <div className="relative p-6">
                    <div className="flex items-start gap-4 mb-4">
                                             <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform group-hover:scale-110 transition-transform duration-300 ${
                         achievement.tier === 'Bronze' ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/50' :
                         achievement.tier === 'Silver' ? 'bg-gradient-to-br from-slate-400 to-gray-500 shadow-slate-500/50' :
                         achievement.tier === 'Gold' ? 'bg-gradient-to-br from-yellow-500 to-amber-500 shadow-yellow-500/50 animate-trophy-glow' :
                         achievement.tier === 'Diamond' ? 'bg-gradient-to-br from-cyan-500 to-blue-500 shadow-cyan-500/50 animate-diamond-sparkle' :
                         'bg-gradient-to-br from-gray-400 to-slate-500'
                       }`}>
                         <span className="text-white drop-shadow-lg">{achievement.icon}</span>
                         {/* Sparkle Effect for Diamond */}
                         {achievement.tier === 'Diamond' && (
                           <>
                             <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-sparkle"></div>
                             <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-cyan-300 rounded-full animate-sparkle" style={{ animationDelay: '0.5s' }}></div>
                             <div className="absolute top-1/2 -right-2 w-1.5 h-1.5 bg-white rounded-full animate-sparkle" style={{ animationDelay: '1s' }}></div>
                           </>
                         )}
                         {/* Sparkle Effect for Gold */}
                         {achievement.tier === 'Gold' && (
                           <>
                             <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-200 rounded-full animate-sparkle"></div>
                             <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-amber-200 rounded-full animate-sparkle" style={{ animationDelay: '0.7s' }}></div>
                           </>
                         )}
                       </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-yellow-600 group-hover:to-orange-600 group-hover:bg-clip-text transition-all duration-300">
                            {achievement.name}
                          </h3>
                          <span className={`px-3 py-1 text-xs font-bold rounded-full border-2 ${
                            achievement.tier === 'Bronze' ? 'text-amber-700 bg-amber-100 border-amber-300 dark:text-amber-300 dark:bg-amber-900/30 dark:border-amber-600' :
                            achievement.tier === 'Silver' ? 'text-slate-700 bg-slate-100 border-slate-300 dark:text-slate-300 dark:bg-slate-900/30 dark:border-slate-600' :
                            achievement.tier === 'Gold' ? 'text-yellow-700 bg-yellow-100 border-yellow-300 dark:text-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-600' :
                            achievement.tier === 'Diamond' ? 'text-cyan-700 bg-cyan-100 border-cyan-300 dark:text-cyan-300 dark:bg-cyan-900/30 dark:border-cyan-600' :
                            'text-gray-700 bg-gray-100 border-gray-300'
                          }`}>
                            {achievement.tier}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Achievement Unlocked Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-semibold text-green-600 dark:text-green-400">UNLOCKED</span>
                      </div>
                      <IconCheck className="w-5 h-5 text-green-500 animate-bounce" />
                    </div>
                  </div>
                </div>
              ))}
              
              {gamificationData.achievements.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <div className="relative">
                    <IconTrophy className="w-24 h-24 mx-auto mb-6 text-slate-300 animate-pulse" />
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 animate-ping"></div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-3">Begin Your Legendary Journey</h3>
                  <p className="text-slate-500 dark:text-slate-500 mb-6">Start trading to unlock your first achievement and begin your path to trading greatness!</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full text-sm font-semibold animate-pulse">
                    <span>🚀</span>
                    <span>Ready to Trade?</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Streaks Section */}
      {activeSection === 'streaks' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
              <IconFire className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Trading Streaks</h2>
              <p className="text-slate-600 dark:text-slate-400">Track your consistency and momentum</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Trading Days Streak */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconCalendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Trading Days</h3>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {gamificationData.streaks.tradingDays}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Consecutive days</p>
            </div>

            {/* Winning Days Streak */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-700 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconTrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Winning Days</h3>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                {gamificationData.streaks.winningDays}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Consecutive wins</p>
            </div>

            {/* Psychology Streak */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconBrain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Mind Check</h3>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {gamificationData.streaks.psychologyEntries}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Psychology entries</p>
            </div>
          </div>
        </div>
      )}

      {/* Daily Challenges Section */}
      {activeSection === 'challenges' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <IconTarget className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Daily Challenges</h2>
              <p className="text-slate-600 dark:text-slate-400">Complete challenges to earn XP and stay motivated</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gamificationData.dailyChallenges.map(challenge => (
              <div key={challenge.id} className={`bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-700 ${
                challenge.disabled ? 'opacity-50' : ''
              }`}>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-2xl">
                    {challenge.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{challenge.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{challenge.description}</p>
                    
                    {/* Progress Bar */}
                    {challenge.target > 1 && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                          <span>Progress</span>
                          <span>
                            {challenge.showAsPercentage 
                              ? `${Math.round(challenge.progress)}%`
                              : `${challenge.progress}/${challenge.target}`
                            }
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              challenge.completed 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                            }`}
                            style={{ 
                              width: `${Math.min(
                                challenge.showAsPercentage 
                                  ? challenge.progress 
                                  : (challenge.progress / challenge.target) * 100, 
                                100
                              )}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconStar className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{challenge.xp} XP</span>
                      </div>
                      <div className="flex items-center gap-2">

                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          challenge.completed 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : challenge.disabled
                            ? 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                        }`}>
                          {challenge.completed ? 'Completed' : challenge.disabled ? 'Locked' : 'In Progress'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationTab;
