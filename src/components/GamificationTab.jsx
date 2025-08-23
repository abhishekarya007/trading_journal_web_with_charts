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

  const getLevelProgress = () => {
    const currentLevelExp = gamificationData.experience % 100;
    const progress = (currentLevelExp / 100) * 100;
    return Math.min(progress, 100);
  };

  const getNextLevelExp = () => {
    return 100 - (gamificationData.experience % 100);
  };

  const getLevelTitle = (level) => {
    const titles = {
      1: 'Novice Trader',
      2: 'Apprentice Trader',
      3: 'Skilled Trader',
      4: 'Experienced Trader',
      5: 'Master Trader',
      6: 'Elite Trader',
      7: 'Legendary Trader',
      8: 'Mythic Trader',
      9: 'Divine Trader',
      10: 'Immortal Trader'
    };
    return titles[level] || `Level ${level} Trader`;
  };

  const getLevelColor = (level) => {
    const colors = {
      1: 'from-gray-400 to-gray-600',
      2: 'from-green-400 to-green-600',
      3: 'from-blue-400 to-blue-600',
      4: 'from-purple-400 to-purple-600',
      5: 'from-yellow-400 to-yellow-600',
      6: 'from-orange-400 to-orange-600',
      7: 'from-red-400 to-red-600',
      8: 'from-pink-400 to-pink-600',
      9: 'from-indigo-400 to-indigo-600',
      10: 'from-emerald-400 to-emerald-600'
    };
    return colors[level] || 'from-gray-400 to-gray-600';
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
        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <IconTrophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Achievements</h2>
              <p className="text-slate-600 dark:text-slate-400">Unlock achievements by reaching milestones</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gamificationData.achievements.map(achievement => (
              <div key={achievement.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center text-2xl">
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{achievement.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{achievement.description}</p>
                  </div>
                  <IconCheck className="w-5 h-5 text-green-500" />
                </div>
              </div>
            ))}
            
            {gamificationData.achievements.length === 0 && (
              <div className="col-span-full text-center py-8">
                <IconTrophy className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">No Achievements Yet</h3>
                <p className="text-slate-500 dark:text-slate-500">Start trading to unlock your first achievement!</p>
              </div>
            )}
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
              <div key={challenge.id} className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-700">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-2xl">
                    {challenge.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{challenge.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{challenge.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconStar className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{challenge.xp} XP</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        challenge.completed 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                      }`}>
                        {challenge.completed ? 'Completed' : 'In Progress'}
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
