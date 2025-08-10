import React, { useState, useEffect, useRef } from 'react';

const CooldownTimer = () => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(15); // Default 15 minutes
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cooldown_timer');
    if (saved) {
      try {
        const { timeLeft: savedTime, isActive: savedActive, duration: savedDuration, startTime } = JSON.parse(saved);
        setDuration(savedDuration || 15);
        
        if (savedActive && startTime) {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          const remaining = (savedDuration * 60) - elapsed;
          
          if (remaining > 0) {
            setTimeLeft(remaining);
            setIsActive(true);
          } else {
            // Timer already finished
            setTimeLeft(0);
            setIsActive(false);
            localStorage.removeItem('cooldown_timer');
          }
        }
      } catch (e) {
        localStorage.removeItem('cooldown_timer');
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (isActive) {
      const state = {
        timeLeft,
        isActive,
        duration,
        startTime: Date.now() - ((duration * 60) - timeLeft) * 1000
      };
      localStorage.setItem('cooldown_timer', JSON.stringify(state));
    } else {
      localStorage.removeItem('cooldown_timer');
    }
  }, [timeLeft, isActive, duration]);

  // Timer logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsActive(false);
            playCompletionSound();
            showCompletionNotification();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft]);

  const playCompletionSound = () => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log('Audio not available');
    }
  };

  const showCompletionNotification = () => {
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification('Cooldown Timer Complete', {
        body: `${duration}-minute cooldown period is over. You can trade again.`,
        icon: '/favicon.ico'
      });
    }
    
    // Visual alert
    document.title = '🔔 Cooldown Complete - Trading Journal';
    setTimeout(() => {
      document.title = 'Trading Journal';
    }, 5000);
  };

  const startTimer = () => {
    setTimeLeft(duration * 60);
    setIsActive(true);
    
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const stopTimer = () => {
    setIsActive(false);
    setTimeLeft(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (!isActive) return 'text-slate-600 dark:text-slate-400';
    const percentLeft = timeLeft / (duration * 60);
    if (percentLeft > 0.5) return 'text-green-600 dark:text-green-400';
    if (percentLeft > 0.25) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getProgressColor = () => {
    const percentLeft = timeLeft / (duration * 60);
    if (percentLeft > 0.5) return 'bg-green-500';
    if (percentLeft > 0.25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
        {/* Timer Display */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center">
            {isActive ? (
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            ) : (
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          
          <div className="flex flex-col">
            <div className={`font-mono text-sm font-semibold ${getTimerColor()}`}>
              {formatTime(timeLeft)}
            </div>
            {isActive && (
              <div className="w-16 h-1 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${getProgressColor()}`}
                  style={{ width: `${(timeLeft / (duration * 60)) * 100}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-1">
          {!isActive ? (
            <button
              onClick={startTimer}
              className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
              title={`Start ${duration}-minute cooldown timer`}
            >
              Start {duration}m
            </button>
          ) : (
            <button
              onClick={stopTimer}
              className="px-2 py-1 text-xs bg-slate-500 hover:bg-slate-600 text-white rounded transition-colors"
              title="Stop timer"
            >
              Stop
            </button>
          )}
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title="Timer settings"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Settings Dropdown */}
      {showSettings && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-[100] overflow-hidden">
          <div className="p-4">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Cooldown Duration
            </div>
            <div className="space-y-2">
              {[10, 15, 20, 30].map(minutes => (
                <button
                  key={minutes}
                  onClick={() => {
                    setDuration(minutes);
                    setShowSettings(false);
                  }}
                  disabled={isActive}
                  className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all duration-300 ${
                    duration === minutes
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                      : 'hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-700 dark:hover:to-slate-600 text-slate-700 dark:text-slate-300'
                  } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {minutes} minutes
                  {minutes === 15 && <span className="text-xs opacity-75 ml-1">(recommended)</span>}
                  {minutes === 30 && <span className="text-xs opacity-75 ml-1">(rule #9)</span>}
                </button>
              ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-600">
              <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                💡 Start timer immediately after a stop-loss to enforce disciplined trading
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close settings */}
      {showSettings && (
        <div 
          className="fixed inset-0 z-[90]" 
          onClick={() => setShowSettings(false)}
        ></div>
      )}
    </div>
  );
};

export default CooldownTimer;
