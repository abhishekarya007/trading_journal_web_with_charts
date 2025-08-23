import React, { useEffect, useState, useMemo } from "react";
import { calcTradeCharges } from "./utils/calc";
import * as XLSX from "xlsx";
import JSZip from 'jszip';
import { dataUrlToBlob } from './utils/imageUtils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import AnalyticsTab from "./components/AnalyticsTab";
import TradesTab from "./components/TradesTab";
import TradingRulesTab from "./components/TradingRulesTab";
import GrowthCalculatorTab from "./components/GrowthCalculatorTab";
import ReportsTab from "./components/ReportsTab";
import DailyPsychologyTab from "./components/DailyPsychologyTab";
import CooldownTimer from "./components/CooldownTimer";
import Navigation from "./components/Navigation";
import Auth from "./components/Auth";
import Profile from "./components/Profile";
import { tradeService } from "./services/tradeService";
import { growthCalculatorService } from "./services/growthCalculatorService";
import { psychologyService } from "./services/psychologyService";
import { authApi, profileApi } from "./lib/supabase";
import { IconCandle, IconDownload, IconReset, IconMoon, IconSun, IconMenu, IconX, IconAlertTriangle, IconTrash, IconLogOut, IconUser } from "./components/icons";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const STORAGE_KEY = "trading_journal_trades_v1";

// Money sound function
function playSuccessSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create multiple oscillators for a richer money sound
    const oscillators = [];
    const gainNodes = [];
    
    // Create 3 oscillators with different frequencies for a coin-like sound
    const frequencies = [800, 1200, 1600];
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set frequency
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
      
      // Create a money-like envelope with higher volume
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.02); // Higher volume
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime + (index * 0.05)); // Staggered start
      oscillator.stop(audioContext.currentTime + 0.3 + (index * 0.05));
      
      oscillators.push(oscillator);
      gainNodes.push(gainNode);
    });
    
  } catch (error) {
    console.log('Audio not supported:', error);
  }
}

// Delete sound function
function playDeleteSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create a delete sound with lower frequencies for a "thud" effect
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Set frequency for delete sound (lower, more ominous)
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
    
    // Create a delete-like envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
    
  } catch (error) {
    console.log('Audio not supported:', error);
  }
}

function blankTrade() {
  return {
    id: Date.now() + Math.random(),
    date: new Date().toISOString().slice(0,10),
    symbol: "",
    type: "Long",
    qty: "",
    buy: "",
    sell: "",
    trend: "Up",
    rule: "Yes",
    emotion: "",
    riskReward: "",
    setup: "",
    remarks: "",
    screenshots: [] // Array of {id, name, thumbnail, fullSize, fileName}
  };
}

export default function App() {
  const [trades, setTrades] = useState([]);
  const [form, setForm] = useState(blankTrade());
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('ui_dark');
    if (saved != null) return saved === '1';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  
  // Navigation states
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('ui_active_tab') || 'trades');
  const [navCollapsed, setNavCollapsed] = useState(() => localStorage.getItem('ui_nav_collapsed') === '1');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [filterStatus, setFilterStatus] = useState('all'); // all | wins | losses
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc'); // asc | desc
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentFilteredTrades, setCurrentFilteredTrades] = useState(trades);
  const [deleteTradeId, setDeleteTradeId] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  
  // Authentication state
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Growth calculator state
  const [growthData, setGrowthData] = useState([]);
  const [growthDataLoaded, setGrowthDataLoaded] = useState(false);

  // Toast functions
  const showToast = (message, type = 'info') => {
    const toastId = Date.now();
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    setToasts(prev => [...prev, {
      id: toastId,
      type,
      message,
      icon: icons[type] || icons.info
    }]);
    
    const duration = type === 'error' ? 5000 : 4000;
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== toastId));
    }, duration);
  };



  // Note: Trades are now saved to database automatically via tradeService
  // localStorage backup is only used as fallback if database fails

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('ui_dark', isDark ? '1' : '0');
    // Clean up old compact mode setting
    localStorage.removeItem('ui_compact');
  }, [isDark]);



  useEffect(() => {
    localStorage.setItem('ui_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('ui_nav_collapsed', navCollapsed ? '1' : '0');
  }, [navCollapsed]);

  // Authentication initialization
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing authentication...');
        // Get current user
        const currentUser = await authApi.getCurrentUser();
        console.log('Current user:', currentUser ? currentUser.email : 'None');
        setUser(currentUser);
        
        // If user is already authenticated, load their trades, profile, and growth data
        if (currentUser) {
          console.log('User is authenticated, loading trades, profile, and growth data...');
          await loadTrades();
          await loadUserProfile(currentUser.id);
          await loadGrowthData();
        } else {
          console.log('No authenticated user found');
        }
        
        // Listen for auth state changes
        const { data: { subscription } } = authApi.onAuthStateChange((event, session) => {
          console.log('Auth state change:', event, session?.user?.email);
          setUser(session?.user || null);
          
          if (event === 'SIGNED_IN') {
            // Reload trades, profile, and growth data when user signs in
            loadTrades();
            if (session?.user) {
              loadUserProfile(session.user.id);
            }
            loadGrowthData();
          } else if (event === 'SIGNED_OUT') {
            // Clear trades, profile, and growth data when user signs out
            setTrades([]);
            setUserProfile(null);
            setGrowthData([]);
            setGrowthDataLoaded(false);
            // Clear psychology service cache
            psychologyService.clearCache();
          }
        });
        
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showLogoutConfirm) {
          setShowLogoutConfirm(false);
        }
        if (showProfile) {
          setShowProfile(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showLogoutConfirm, showProfile]);

  // Load user profile function
  const loadUserProfile = async (userId) => {
    try {
      const profile = await profileApi.getUserProfile(userId);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUserProfile(null);
    }
  };

  // Load trades function (moved from useEffect for reuse)
  const loadTrades = async () => {
    try {
      console.log('Loading trades from database...');
      const loadedTrades = await tradeService.loadTrades();
      console.log(`Loaded ${loadedTrades.length} trades from database`);
      setTrades(loadedTrades);
    } catch (error) {
      console.error('Error loading trades from database:', error);
      // Fallback to localStorage if database fails
      const savedTrades = localStorage.getItem(STORAGE_KEY);
      if (savedTrades) {
        try {
          const parsedTrades = JSON.parse(savedTrades);
          console.log(`Loaded ${parsedTrades.length} trades from localStorage fallback`);
          setTrades(parsedTrades);
        } catch (parseError) {
          console.error('Error parsing saved trades:', parseError);
          setTrades([]);
        }
      } else {
        console.log('No trades found in localStorage fallback');
        setTrades([]);
      }
    }
  };

  // Load growth data from database
  const loadGrowthData = async () => {
    try {
      console.log('Loading growth data from database...');
      const data = await growthCalculatorService.loadGrowthData();
      console.log(`Loaded ${data.length} growth records from database`);
      setGrowthData(data);
      setGrowthDataLoaded(true);
    } catch (error) {
      console.error('Error loading growth data:', error);
      setGrowthData([]);
      setGrowthDataLoaded(true);
    }
  };

  // Recalculate growth metrics based on current trades
  const recalculateGrowthMetrics = () => {
    if (growthData.length > 0 && trades.length > 0) {
      const calculatedData = growthCalculatorService.calculateGrowthMetrics(growthData, trades);
      setGrowthData(calculatedData);
    }
  };

  // Authentication handlers
  const handleAuthSuccess = (user) => {
    setUser(user);
    loadTrades();
    if (user.id !== 'demo') {
      loadUserProfile(user.id);
    }
  };

  const handleProfileUpdate = (updatedProfile) => {
    setUserProfile(prev => ({ ...prev, ...updatedProfile }));
  };

  const handleSignOut = () => {
    setShowLogoutConfirm(true);
  };

  const confirmSignOut = async () => {
    try {
      await authApi.signOut();
      setUser(null);
      setTrades([]);
      setShowLogoutConfirm(false);
      
      // Show success toast
      const toastId = Date.now();
      setToasts(prev => [...prev, {
        id: toastId,
        type: 'success',
        message: 'Signed out successfully!',
        icon: '👋'
      }]);
      
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== toastId));
      }, 3000);
    } catch (error) {
      console.error('Sign out error:', error);
      
      // Show error toast
      const toastId = Date.now();
      setToasts(prev => [...prev, {
        id: toastId,
        type: 'error',
        message: 'Failed to sign out. Please try again.',
        icon: '❌'
      }]);
      
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== toastId));
      }, 5000);
    }
  };

  async function addOrUpdateTrade(e) {
    e.preventDefault();
    
    try {
    // Coerce string inputs to numbers here to avoid the "0 not deletable" UX issue
    const trade = {
      ...form,
      qty: Number(form.qty || 0),
      buy: Number(form.buy || 0),
      sell: Number(form.sell || 0),
      trend: form.trend || 'Up',
      rule: form.rule || 'Yes',
      emotion: form.emotion || '',
      riskReward: form.riskReward || '',
      screenshots: form.screenshots || [],
    };
      
    const computed = calcTradeCharges({
      qty: trade.qty, buy: trade.buy, sell: trade.sell, type: trade.type
    });
    trade.meta = computed;
      
      // Check if this is an update or new trade
      const existingTradeIndex = trades.findIndex(p => p.id === trade.id);
      
      if (existingTradeIndex >= 0) {
        // Update existing trade
        await tradeService.updateTrade(trade.id, trade);
    setTrades(prev => {
        const copy = [...prev];
          copy[existingTradeIndex] = trade;
        return copy;
        });
      } else {
        // Add new trade
        const newTrade = await tradeService.addTrade(trade);
        setTrades(prev => [newTrade, ...prev]);
      }
      
    setForm(blankTrade());
    
    // Show success toast
    const toastId = Date.now();
    setToasts(prev => [...prev, {
      id: toastId,
      type: 'success',
      message: 'Trade saved successfully!',
      icon: '🎯'
    }]);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== toastId));
    }, 3000);

    // Play success sound
    playSuccessSound();
      
    } catch (error) {
      console.error('Error saving trade:', error);
      
      // Show error toast
      const toastId = Date.now();
      setToasts(prev => [...prev, {
        id: toastId,
        type: 'error',
        message: 'Failed to save trade. Please try again.',
        icon: '❌'
      }]);
      
      // Remove toast after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== toastId));
      }, 5000);
    }
  }

  function editTrade(t) {
    // Keep numeric fields as strings for better editing UX
    setForm({
      ...t,
      qty: String(t.qty ?? ''),
      buy: String(t.buy ?? ''),
      sell: String(t.sell ?? ''),
      trend: t.trend || 'Up',
      rule: t.rule || 'Yes',
      emotion: t.emotion || '',
      riskReward: t.riskReward || '',
      screenshots: t.screenshots || [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function duplicateTrade(t) {
    const dup = {
      ...t,
      id: Date.now() + Math.random(),
      qty: String(t.qty ?? ''),
      buy: String(t.buy ?? ''),
      sell: String(t.sell ?? ''),
    };
    setForm(dup);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }



  function showDeleteConfirmation(id) {
    setDeleteTradeId(id);
    setShowDeleteConfirm(true);
  }

  async function confirmDelete() {
    if (deleteTradeId) {
      try {
        await tradeService.deleteTrade(deleteTradeId);
      setTrades(prev => prev.filter(t => t.id !== deleteTradeId));
      
        // Play delete sound
        playDeleteSound();
        
        // Show success toast
      const toastId = Date.now();
      setToasts(prev => [...prev, {
        id: toastId,
          type: 'success',
        message: 'Trade deleted successfully!',
        icon: '🗑️'
      }]);
      
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== toastId));
      }, 3000);
        
      } catch (error) {
        console.error('Error deleting trade:', error);
        
        // Show error toast
        const toastId = Date.now();
        setToasts(prev => [...prev, {
          id: toastId,
          type: 'error',
          message: 'Failed to delete trade. Please try again.',
          icon: '❌'
        }]);
        
        setTimeout(() => {
          setToasts(prev => prev.filter(toast => toast.id !== toastId));
        }, 5000);
      }
    }
    setShowDeleteConfirm(false);
    setDeleteTradeId(null);
  }

  async function importExcel(file) {
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
      const data = new Uint8Array(evt.target.result);
      const wb = XLSX.read(data, {type:"array"});
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, {defval:""});
        
        // Show loading toast
        const loadingToastId = Date.now();
        setToasts(prev => [...prev, {
          id: loadingToastId,
          type: 'info',
          message: `Importing ${json.length} trades...`,
          icon: '⏳'
        }]);
        
      const mapped = json.map(r => {
        const t = {
          id: Date.now() + Math.random(),
          date: r.Date || r.date || new Date().toISOString().slice(0,10),
          symbol: r.Symbol || r.symbol || r.SymbolName || "",
          type: r["Trade Type"] || r.type || "Long",
          trend: r.Trend || r.trend || "Up",
          rule: r["Rule Followed"] || r.rule || "Yes",
          emotion: r.Emotion || r.emotion || "",
          riskReward: r["Risk Reward"] || r.riskReward || "",
          qty: Number(r.Qty || r.qty || 0),
          buy: Number(r["Buy Price"] || r.buy || 0),
          sell: Number(r["Sell Price"] || r.sell || 0),
          setup: r.Setup || r.setup || "",
          remarks: r.Remarks || r.remarks || "",
          screenshots: [] // Screenshots can't be imported from Excel, start with empty array
        };
        t.meta = calcTradeCharges({ qty: t.qty, buy: t.buy, sell: t.sell, type: t.type});
        return t;
      });
        
        // Save each trade to database
        const savedTrades = [];
        for (const trade of mapped) {
          try {
            const savedTrade = await tradeService.addTrade(trade);
            savedTrades.push(savedTrade);
          } catch (error) {
            console.error('Error saving trade to database:', error);
            // Continue with other trades even if one fails
          }
        }
        
        // Update UI state with saved trades
        setTrades(prev => [...savedTrades, ...prev]);
        
        // Remove loading toast
        setToasts(prev => prev.filter(toast => toast.id !== loadingToastId));
      
      // Show success toast
      const toastId = Date.now();
      setToasts(prev => [...prev, {
        id: toastId,
        type: 'success',
          message: `Excel import successful! ${savedTrades.length} trades imported.`,
        icon: '📊'
      }]);
      
      // Remove toast after 4 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== toastId));
      }, 4000);
        
      } catch (error) {
        // Show error toast
        const toastId = Date.now();
        setToasts(prev => [...prev, {
          id: toastId,
          type: 'error',
          message: `Excel import failed: ${error.message}`,
          icon: '❌'
        }]);
        
        // Remove toast after 5 seconds
        setTimeout(() => {
          setToasts(prev => prev.filter(toast => toast.id !== toastId));
        }, 5000);
        
        console.error('Excel import error:', error);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // Import ZIP file with Excel + Screenshots
  async function importZip(file) {
    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      
      // Find and read Excel file
      let excelFile = null;
      let excelData = null;
      
      const excelFileName = Object.keys(zipContent.files).find(name => 
        name.endsWith('.xlsx') || name.endsWith('.xls')
      );
      
      if (!excelFileName) {
        throw new Error('No Excel file found in ZIP archive');
      }
      
      const excelBuffer = await zipContent.files[excelFileName].async('arraybuffer');
      const wb = XLSX.read(new Uint8Array(excelBuffer), {type: "array"});
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, {defval: ""});
      
      // Process screenshot files
      const screenshotFiles = {};
      const screenshotsFolder = 'screenshots/';
      
      for (const [fileName, file] of Object.entries(zipContent.files)) {
        if (fileName.startsWith(screenshotsFolder) && !file.dir) {
          const actualFileName = fileName.replace(screenshotsFolder, '');
          if (actualFileName && (actualFileName.endsWith('.jpg') || actualFileName.endsWith('.jpeg') || actualFileName.endsWith('.png') || actualFileName.endsWith('.gif'))) {
            try {
              const imageData = await file.async('base64');
              const mimeType = actualFileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
              screenshotFiles[actualFileName] = `data:${mimeType};base64,${imageData}`;
            } catch (error) {
              console.warn(`Failed to process screenshot ${actualFileName}:`, error);
            }
          }
        }
      }
      
      // Map Excel data to trades and restore screenshots
      const mapped = json.map(r => {
        const t = {
          id: Date.now() + Math.random(),
          date: r.Date || r.date || new Date().toISOString().slice(0,10),
          symbol: r.Symbol || r.symbol || r.SymbolName || "",
          type: r["Trade Type"] || r.type || "Long",
          trend: r.Trend || r.trend || "Up",
          rule: r["Rule Followed"] || r.rule || "Yes",
          emotion: r.Emotion || r.emotion || "",
          riskReward: r["Risk Reward"] || r.riskReward || "",
          qty: Number(r.Qty || r.qty || 0),
          buy: Number(r["Buy Price"] || r.buy || 0),
          sell: Number(r["Sell Price"] || r.sell || 0),
          setup: r.Setup || r.setup || "",
          remarks: r.Remarks || r.remarks || "",
          screenshots: []
        };
        
        // Restore screenshots if references exist
        const screenshotFilesPaths = r["Screenshot Files"] || "";
        if (screenshotFilesPaths) {
          const filePaths = screenshotFilesPaths.split(', ').filter(Boolean);
          t.screenshots = filePaths.map((filePath, index) => {
            const fileName = filePath.replace('screenshots/', '');
            const fullSizeData = screenshotFiles[fileName];
            
            if (fullSizeData) {
              // Create a basic screenshot object
              // Note: We can't recreate the exact thumbnail without processing, 
              // but we'll use the full image as both thumbnail and full size for now
              return {
                id: Date.now() + Math.random() + index,
                name: r["Screenshot Names"]?.split(', ')[index] || `Screenshot ${index + 1}`,
                thumbnail: fullSizeData, // Using full size as thumbnail for imported
                fullSize: fullSizeData,
                fileName: fileName,
                originalSize: Math.round(fullSizeData.length * 0.75), // Approximate
                processedSize: Math.round(fullSizeData.length * 0.75),
                dimensions: {
                  original: { width: 0, height: 0 }, // Unknown for imported
                  fullSize: { width: 0, height: 0 },
                  thumbnail: { width: 150, height: 100 }
                },
                uploadedAt: new Date().toISOString(),
                imported: true // Mark as imported
              };
            }
            return null;
          }).filter(Boolean);
        }
        
        t.meta = calcTradeCharges({ qty: t.qty, buy: t.buy, sell: t.sell, type: t.type});
        return t;
      });
      
      // Show loading toast
      const loadingToastId = Date.now();
      setToasts(prev => [...prev, {
        id: loadingToastId,
        type: 'info',
        message: `Importing ${mapped.length} trades with screenshots...`,
        icon: '⏳'
      }]);
      
      // Save each trade to database
      const savedTrades = [];
      for (const trade of mapped) {
        try {
          const savedTrade = await tradeService.addTrade(trade);
          savedTrades.push(savedTrade);
        } catch (error) {
          console.error('Error saving trade to database:', error);
          // Continue with other trades even if one fails
        }
      }
      
      // Update UI state with saved trades
      setTrades(prev => [...savedTrades, ...prev]);
      
      // Remove loading toast
      setToasts(prev => prev.filter(toast => toast.id !== loadingToastId));
      
      // Show success toast
      const totalScreenshots = savedTrades.reduce((sum, t) => sum + t.screenshots.length, 0);
      const toastId = Date.now();
      setToasts(prev => [...prev, {
        id: toastId,
        type: 'success',
        message: `ZIP import successful! ${savedTrades.length} trades imported with ${totalScreenshots} screenshots restored.`,
        icon: '📥'
      }]);
      
      // Remove toast after 4 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== toastId));
      }, 4000);
      
    } catch (error) {
      // Show error toast
      const toastId = Date.now();
      setToasts(prev => [...prev, {
        id: toastId,
        type: 'error',
        message: `ZIP import failed: ${error.message}`,
        icon: '❌'
      }]);
      
      // Remove toast after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== toastId));
      }, 5000);
      
      console.error('ZIP import error:', error);
    }
  }

  // Export Excel only
  function exportExcel(dataToExport = currentFilteredTrades) {
    const rows = dataToExport.map(t => ({
      Date: t.date,
      Symbol: t.symbol,
      "Trade Type": t.type,
      Trend: t.trend,
      "Rule Followed": t.rule,
      Emotion: t.emotion,
      "Risk Reward": t.riskReward,
      Qty: t.qty,
      "Buy Price": t.buy,
      "Sell Price": t.sell,
      Turnover: t.meta?.turnover,
      Brokerage: t.meta?.brokerage,
      STT: t.meta?.stt,
      "Exchange Charges": t.meta?.exchangeCharges,
      "Stamp Duty": t.meta?.stampDuty,
      "SEBI Fees": t.meta?.sebi,
      GST: t.meta?.gst,
      "Total Charges": t.meta?.totalCharges,
      "Gross P&L": t.meta?.gross,
      "Net P&L": t.meta?.net,
      Setup: t.setup,
      Remarks: t.remarks,
      "Screenshots Count": t.screenshots?.length || 0,
      "Screenshot Names": t.screenshots?.map(s => s.name).join(', ') || ''
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Trades");
    XLSX.writeFile(wb, "trading_journal_export.xlsx");
  }

  // Export ZIP with Excel + Screenshots
  async function exportZip(dataToExport = currentFilteredTrades) {
    const zip = new JSZip();
    
    // Create Excel file data
    const rows = dataToExport.map(t => ({
      Date: t.date,
      Symbol: t.symbol,
      "Trade Type": t.type,
      Trend: t.trend,
      "Rule Followed": t.rule,
      Emotion: t.emotion,
      "Risk Reward": t.riskReward,
      Qty: t.qty,
      "Buy Price": t.buy,
      "Sell Price": t.sell,
      Turnover: t.meta?.turnover,
      Brokerage: t.meta?.brokerage,
      STT: t.meta?.stt,
      "Exchange Charges": t.meta?.exchangeCharges,
      "Stamp Duty": t.meta?.stampDuty,
      "SEBI Fees": t.meta?.sebi,
      GST: t.meta?.gst,
      "Total Charges": t.meta?.totalCharges,
      "Gross P&L": t.meta?.gross,
      "Net P&L": t.meta?.net,
      Setup: t.setup,
      Remarks: t.remarks,
      "Screenshots Count": t.screenshots?.length || 0,
      "Screenshot Names": t.screenshots?.map(s => s.name).join(', ') || '',
      "Screenshot Files": t.screenshots?.map(s => `screenshots/${s.fileName}`).join(', ') || ''
    }));
    
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Trades");
    
    // Add Excel file to ZIP
    const excelBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    zip.file("trading_journal_export.xlsx", excelBuffer);
    
    // Add screenshots to ZIP
    const screenshotsFolder = zip.folder("screenshots");
    let hasScreenshots = false;
    
    for (const trade of dataToExport) {
      if (trade.screenshots && trade.screenshots.length > 0) {
        for (const screenshot of trade.screenshots) {
          try {
            const blob = dataUrlToBlob(screenshot.fullSize);
            screenshotsFolder.file(screenshot.fileName, blob);
            hasScreenshots = true;
          } catch (error) {
            console.error('Error processing screenshot:', error);
          }
        }
      }
    }
    
    // Add README with instructions
    const readmeContent = `Trading Journal Export
=====================

This archive contains:
- trading_journal_export.xlsx: Complete trade data with screenshot references
- screenshots/ folder: All trade screenshots in full resolution

Screenshot Files:
- Each screenshot is saved with its original filename
- The Excel file contains references to screenshot files in the "Screenshot Files" column
- You can view screenshots by opening the files in the screenshots folder

Generated on: ${new Date().toLocaleString()}
Total Trades: ${trades.length}
Total Screenshots: ${trades.reduce((sum, t) => sum + (t.screenshots?.length || 0), 0)}
`;
    
    zip.file("README.txt", readmeContent);
    
    // Generate and download ZIP
    try {
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `trading_journal_export_${new Date().toISOString().slice(0,10)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Show success message
      const message = hasScreenshots 
        ? `Export complete! ZIP contains ${trades.length} trades and ${trades.reduce((sum, t) => sum + (t.screenshots?.length || 0), 0)} screenshots.`
        : `Export complete! ZIP contains ${trades.length} trades (no screenshots found).`;
      
      alert(message);
    } catch (error) {
      alert('Error creating ZIP file: ' + error.message);
    }
  }

  // Derived summaries
  const tradesSorted = useMemo(() => {
    return [...trades].sort((a,b) => new Date(a.date) - new Date(b.date));
  }, [trades]);

  const monthly = trades.reduce((acc, t) => {
    const m = new Date(t.date).toLocaleString("en-GB",{ month: "short", year: "numeric" });
    if (!acc[m]) acc[m] = { trades:0, wins:0, losses:0, net:0 };
    acc[m].trades++;
    const net = t.meta?.net || 0;
    if (net > 0) acc[m].wins++; else acc[m].losses++;
    acc[m].net += net;
    return acc;
  }, {});
  const monthRows = Object.entries(monthly)
    .map(([m, v]) => ({
    month: m,
    total: v.trades,
    wins: v.wins,
    losses: v.losses,
    winRate: v.trades ? Math.round((v.wins/v.trades)*100*100)/100 : 0,
    totalNet: Math.round(v.net*100)/100,
    avg: v.trades ? Math.round((v.net/v.trades)*100)/100 : 0
    }))
    .sort((a, b) => {
      // Sort by month in ascending order (chronological)
      const dateA = new Date(a.month + '-01');
      const dateB = new Date(b.month + '-01');
      return dateA - dateB;
    });



  // Chart data: Monthly P&L bar
  const monthLabels = monthRows.map(m => m.month);
  const monthData = monthRows.map(m => m.totalNet);

  const monthlyChart = {
    labels: monthLabels,
    datasets: [
      {
        label: "Total Net P&L",
        data: monthData,
        // colors will be automatic
      }
    ]
  };

  // Equity curve: cumulative net over time
  const equityLabels = tradesSorted.map(t => t.date);
  let cum = 0;
  const equityDataPoints = tradesSorted.map(t => {
    cum += (t.meta?.net || 0);
    return Math.round(cum * 100) / 100;
  });
  const equityChart = {
    labels: equityLabels,
    datasets: [
      {
        label: "Equity Curve (Net P&L)",
        data: equityDataPoints,
        tension: 0.25,
        borderColor: "#0ea5e9",
        backgroundColor: "rgba(14,165,233,0.15)",
        fill: true,
      }
    ]
  };

  // Chart options
  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#eef2f7" } }
    }
  };

  // Add styling for bar dataset with green/red colors per bar
  const barBg = monthData.map(v => (v >= 0 ? "rgba(22,163,74,0.2)" : "rgba(220,38,38,0.2)"));
  const barBorder = monthData.map(v => (v >= 0 ? "#16a34a" : "#dc2626"));
  monthlyChart.datasets[0].backgroundColor = barBg;
  monthlyChart.datasets[0].borderColor = barBorder;
  monthlyChart.datasets[0].borderWidth = 2;
  monthlyChart.datasets[0].borderRadius = 6;
  monthlyChart.datasets[0].borderSkipped = false;

  // KPIs
  const round2 = (x) => Math.round(x * 100) / 100;
  const totals = useMemo(() => {
    const net = trades.reduce((sum, t) => sum + (t.meta?.net || 0), 0);
    const wins = trades.filter(t => (t.meta?.net || 0) > 0).length;
    const losses = trades.filter(t => (t.meta?.net || 0) <= 0).length;
    const winRate = trades.length ? Math.round((wins / trades.length) * 10000) / 100 : 0;
    const avg = trades.length ? round2(net / trades.length) : 0;
    return { net: round2(net), wins, losses, winRate, avg, trades: trades.length };
  }, [trades]);

  // Advanced Performance Metrics
  const advancedMetrics = useMemo(() => {
    if (trades.length === 0) {
      return {
        maxDrawdown: 0,
        sharpeRatio: 0,
        profitFactor: 0,
        avgWin: 0,
        avgLoss: 0,
        winLossRatio: 0,
        largestWin: 0,
        largestLoss: 0,
        consecutiveWins: 0,
        consecutiveLosses: 0,
        expectancy: 0,
        recoveryFactor: 0
      };
    }

    // Calculate returns for each trade
    const returns = trades.map(t => t.meta?.net || 0);
    
    // Maximum Drawdown
    let peak = 0;
    let maxDrawdown = 0;
    let runningTotal = 0;
    
    returns.forEach(return_ => {
      runningTotal += return_;
      if (runningTotal > peak) {
        peak = runningTotal;
      }
      const drawdown = peak - runningTotal;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    // Win/Loss Analysis
    const wins = returns.filter(r => r > 0);
    const losses = returns.filter(r => r < 0);
    const avgWin = wins.length > 0 ? wins.reduce((sum, w) => sum + w, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, l) => sum + l, 0) / losses.length) : 0;
    const winLossRatio = avgLoss > 0 ? avgWin / avgLoss : 0;
    
    // Profit Factor
    const grossProfit = wins.reduce((sum, w) => sum + w, 0);
    const grossLoss = Math.abs(losses.reduce((sum, l) => sum + l, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;

    // Largest Win/Loss
    const largestWin = wins.length > 0 ? Math.max(...wins) : 0;
    const largestLoss = losses.length > 0 ? Math.min(...losses) : 0;

    // Consecutive Wins/Losses
    let currentStreak = 0;
    let maxConsecutiveWins = 0;
    let maxConsecutiveLosses = 0;
    
    returns.forEach(return_ => {
      if (return_ > 0) {
        if (currentStreak > 0) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
        maxConsecutiveWins = Math.max(maxConsecutiveWins, currentStreak);
      } else if (return_ < 0) {
        if (currentStreak < 0) {
          currentStreak--;
        } else {
          currentStreak = -1;
        }
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, Math.abs(currentStreak));
      } else {
        currentStreak = 0;
      }
    });

    // Expectancy
    const winRate = wins.length / returns.length;
    const lossRate = losses.length / returns.length;
    const expectancy = (winRate * avgWin) - (lossRate * avgLoss);

    // Recovery Factor
    const recoveryFactor = maxDrawdown > 0 ? totals.net / maxDrawdown : 0;

    // Sharpe Ratio (simplified - assuming risk-free rate of 0)
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? meanReturn / stdDev : 0;

    return {
      maxDrawdown: round2(maxDrawdown),
      sharpeRatio: round2(sharpeRatio),
      profitFactor: round2(profitFactor),
      avgWin: round2(avgWin),
      avgLoss: round2(avgLoss),
      winLossRatio: round2(winLossRatio),
      largestWin: round2(largestWin),
      largestLoss: round2(largestLoss),
      consecutiveWins: maxConsecutiveWins,
      consecutiveLosses: maxConsecutiveLosses,
      expectancy: round2(expectancy),
      recoveryFactor: round2(recoveryFactor)
    };
  }, [trades, totals.net]);



  const formatNumber = (n) => (typeof n === "number" ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : n);
  // Analytics period controls
  const [analyticsScope, setAnalyticsScope] = useState('month'); // 'month' | 'overall'
  const dateKey = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  };
  const monthLabelFromKey = (key) => {
    if (!key) return '';
    const [y, m] = key.split('-');
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleString("en-GB", { month: "short", year: "numeric" });
  };
  const [selectedMonthKey, setSelectedMonthKey] = useState(() => dateKey(new Date().toISOString()));
  const [activeMonthLabel, setActiveMonthLabel] = useState(() => new Date().toLocaleString("en-GB", { month: "short", year: "numeric" }));
  const availableMonths = useMemo(() => {
    const set = new Set(trades.map(t => dateKey(t.date)).filter(Boolean));
    const arr = Array.from(set);
    arr.sort((a,b) => a.localeCompare(b));
    return arr.reverse();
  }, [trades]);
  const scopedTrades = useMemo(() => {
    if (analyticsScope === 'overall') return trades;
    // Prefer activeMonthLabel if set via click; fall back to selectedMonthKey
    const label = activeMonthLabel || monthLabelFromKey(selectedMonthKey);
    return trades.filter(t => new Date(t.date).toLocaleString("en-GB", { month: "short", year: "numeric" }) === label);
  }, [trades, analyticsScope, selectedMonthKey, activeMonthLabel]);
  const scopedTotals = useMemo(() => {
    const net = scopedTrades.reduce((sum, t) => sum + (t.meta?.net || 0), 0);
    const wins = scopedTrades.filter(t => (t.meta?.net || 0) > 0).length;
    const losses = scopedTrades.filter(t => (t.meta?.net || 0) <= 0).length;
    const winRate = scopedTrades.length ? Math.round((wins / scopedTrades.length) * 10000) / 100 : 0;
    const avg = scopedTrades.length ? Math.round((net / scopedTrades.length) * 100) / 100 : 0;
    return { net: Math.round(net * 100) / 100, wins, losses, winRate, avg, trades: scopedTrades.length };
  }, [scopedTrades]);

  // Scoped Advanced Metrics (for selected month or overall)
  const scopedAdvancedMetrics = useMemo(() => {
    const tradesToAnalyze = analyticsScope === 'overall' ? trades : scopedTrades;
    
    if (tradesToAnalyze.length === 0) {
      return {
        maxDrawdown: 0,
        profitFactor: 0,
        avgWin: 0,
        avgLoss: 0,
        winLossRatio: 0,
        largestWin: 0,
        consecutiveWins: 0,
        consecutiveLosses: 0,
        recoveryFactor: 0
      };
    }

    // Calculate returns for each trade
    const returns = tradesToAnalyze.map(t => t.meta?.net || 0);
    
    // Maximum Drawdown
    let peak = 0;
    let maxDrawdown = 0;
    let runningTotal = 0;
    
    returns.forEach(return_ => {
      runningTotal += return_;
      if (runningTotal > peak) {
        peak = runningTotal;
      }
      const drawdown = peak - runningTotal;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    // Win/Loss Analysis
    const wins = returns.filter(r => r > 0);
    const losses = returns.filter(r => r < 0);
    const avgWin = wins.length > 0 ? wins.reduce((sum, w) => sum + w, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, l) => sum + l, 0) / losses.length) : 0;
    const winLossRatio = avgLoss > 0 ? avgWin / avgLoss : 0;
    
    // Profit Factor
    const grossProfit = wins.reduce((sum, w) => sum + w, 0);
    const grossLoss = Math.abs(losses.reduce((sum, l) => sum + l, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;

    // Largest Win
    const largestWin = wins.length > 0 ? Math.max(...wins) : 0;

    // Consecutive Wins/Losses
    let currentStreak = 0;
    let maxConsecutiveWins = 0;
    let maxConsecutiveLosses = 0;
    
    returns.forEach(return_ => {
      if (return_ > 0) {
        if (currentStreak > 0) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
        maxConsecutiveWins = Math.max(maxConsecutiveWins, currentStreak);
      } else if (return_ < 0) {
        if (currentStreak < 0) {
          currentStreak--;
        } else {
          currentStreak = -1;
        }
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, Math.abs(currentStreak));
      } else {
        currentStreak = 0;
      }
    });

    // Recovery Factor
    const scopedNet = tradesToAnalyze.reduce((sum, t) => sum + (t.meta?.net || 0), 0);
    const recoveryFactor = maxDrawdown > 0 ? scopedNet / maxDrawdown : 0;

    return {
      maxDrawdown: round2(maxDrawdown),
      profitFactor: round2(profitFactor),
      avgWin: round2(avgWin),
      avgLoss: round2(avgLoss),
      winLossRatio: round2(winLossRatio),
      largestWin: round2(largestWin),
      consecutiveWins: maxConsecutiveWins,
      consecutiveLosses: maxConsecutiveLosses,
      recoveryFactor: round2(recoveryFactor)
    };
  }, [trades, scopedTrades, analyticsScope]);

  // Scoped Setup Analytics
  const scopedSetupRows = useMemo(() => {
    const setupMap = scopedTrades.reduce((acc, t) => {
      const s = t.setup || "Unspecified";
      if (!acc[s]) acc[s] = { trades:0, wins:0, losses:0, net:0 };
      acc[s].trades++;
      const net = t.meta?.net || 0;
      if (net > 0) acc[s].wins++; else acc[s].losses++;
      acc[s].net += net;
      return acc;
    }, {});
    return Object.entries(setupMap)
      .map(([s, v]) => ({
      setup: s,
      trades: v.trades,
      wins: v.wins,
      losses: v.losses,
      winRate: v.trades ? Math.round((v.wins/v.trades)*100*100)/100 : 0,
      avgNet: v.trades ? Math.round((v.net/v.trades)*100)/100 : 0
      }))
      .sort((a, b) => b.trades - a.trades); // Sort by number of trades (descending)
  }, [scopedTrades]);

  // Scoped Direction Analytics (Type + Trend combinations)
  const scopedDirectionRows = useMemo(() => {
    const directionMap = scopedTrades.reduce((acc, t) => {
      const combo = `${t.type || 'Long'}→${t.trend || 'Up'}`;
      if (!acc[combo]) acc[combo] = { trades:0, wins:0, losses:0, net:0 };
      acc[combo].trades++;
      const net = t.meta?.net || 0;
      if (net > 0) acc[combo].wins++; else acc[combo].losses++;
      acc[combo].net += net;
      return acc;
    }, {});
    return Object.entries(directionMap)
      .map(([combo, v]) => ({
      combo,
      trades: v.trades,
      wins: v.wins,
      losses: v.losses,
      winRate: v.trades ? Math.round((v.wins/v.trades)*100*100)/100 : 0,
      avgNet: v.trades ? Math.round((v.net/v.trades)*100)/100 : 0
      }))
      .sort((a, b) => b.trades - a.trades); // Sort by number of trades (descending)
  }, [scopedTrades]);

  // Scoped Emotion Analytics
  const scopedEmotionRows = useMemo(() => {
    const emotionMap = scopedTrades.reduce((acc, t) => {
      const emotion = t.emotion || "Not Specified";
      if (!acc[emotion]) acc[emotion] = { trades:0, wins:0, losses:0, net:0 };
      acc[emotion].trades++;
      const net = t.meta?.net || 0;
      if (net > 0) acc[emotion].wins++; else acc[emotion].losses++;
      acc[emotion].net += net;
      return acc;
    }, {});
    return Object.entries(emotionMap)
      .map(([emotion, v]) => ({
      emotion,
      trades: v.trades,
      wins: v.wins,
      losses: v.losses,
      winRate: v.trades ? Math.round((v.wins/v.trades)*100*100)/100 : 0,
      avgNet: v.trades ? Math.round((v.net/v.trades)*100)/100 : 0
      }))
      .sort((a, b) => b.trades - a.trades); // Sort by number of trades (descending)
  }, [scopedTrades]);

  // Risk-Reward Analysis
  const rrAnalysis = useMemo(() => {
    // Parse RR ratios and categorize trades
    const rrCategories = {
      '1:1': { trades: 0, wins: 0, losses: 0, net: 0, long: { trades: 0, wins: 0, losses: 0, net: 0 }, short: { trades: 0, wins: 0, losses: 0, net: 0 } },
      '1:2': { trades: 0, wins: 0, losses: 0, net: 0, long: { trades: 0, wins: 0, losses: 0, net: 0 }, short: { trades: 0, wins: 0, losses: 0, net: 0 } },
      '1:3': { trades: 0, wins: 0, losses: 0, net: 0, long: { trades: 0, wins: 0, losses: 0, net: 0 }, short: { trades: 0, wins: 0, losses: 0, net: 0 } },
      '1:4': { trades: 0, wins: 0, losses: 0, net: 0, long: { trades: 0, wins: 0, losses: 0, net: 0 }, short: { trades: 0, wins: 0, losses: 0, net: 0 } },
      '1:5+': { trades: 0, wins: 0, losses: 0, net: 0, long: { trades: 0, wins: 0, losses: 0, net: 0 }, short: { trades: 0, wins: 0, losses: 0, net: 0 } },
      'Other': { trades: 0, wins: 0, losses: 0, net: 0, long: { trades: 0, wins: 0, losses: 0, net: 0 }, short: { trades: 0, wins: 0, losses: 0, net: 0 } }
    };

    scopedTrades.forEach(trade => {
      const rr = trade.riskReward || '';
      const net = trade.meta?.net || 0;
      const isWin = net > 0;
      const tradeType = trade.type || 'Long';
      
      // Categorize RR ratio
      let category = 'Other';
      if (rr.includes('1:1') || rr.includes('1:2') || rr.includes('1:3') || rr.includes('1:4') || rr.includes('1:5')) {
        if (rr.includes('1:1')) category = '1:1';
        else if (rr.includes('1:2')) category = '1:2';
        else if (rr.includes('1:3')) category = '1:3';
        else if (rr.includes('1:4')) category = '1:4';
        else if (rr.includes('1:5')) category = '1:5+';
      }
      
      // Update overall stats
      rrCategories[category].trades++;
      if (isWin) rrCategories[category].wins++;
      else rrCategories[category].losses++;
      rrCategories[category].net += net;
      
      // Update type-specific stats
      if (tradeType === 'Long') {
        rrCategories[category].long.trades++;
        if (isWin) rrCategories[category].long.wins++;
        else rrCategories[category].long.losses++;
        rrCategories[category].long.net += net;
      } else {
        rrCategories[category].short.trades++;
        if (isWin) rrCategories[category].short.wins++;
        else rrCategories[category].short.losses++;
        rrCategories[category].short.net += net;
      }
    });

    // Convert to array format
    const rrRows = Object.entries(rrCategories)
      .filter(([_, data]) => data.trades > 0)
      .map(([rr, data]) => ({
        rr,
        trades: data.trades,
        wins: data.wins,
        losses: data.losses,
        winRate: data.trades ? Math.round((data.wins / data.trades) * 100 * 100) / 100 : 0,
        avgNet: data.trades ? Math.round((data.net / data.trades) * 100) / 100 : 0,
        long: {
          trades: data.long.trades,
          wins: data.long.wins,
          losses: data.long.losses,
          winRate: data.long.trades ? Math.round((data.long.wins / data.long.trades) * 100 * 100) / 100 : 0,
          avgNet: data.long.trades ? Math.round((data.long.net / data.long.trades) * 100) / 100 : 0
        },
        short: {
          trades: data.short.trades,
          wins: data.short.wins,
          losses: data.short.losses,
          winRate: data.short.trades ? Math.round((data.short.wins / data.short.trades) * 100 * 100) / 100 : 0,
          avgNet: data.short.trades ? Math.round((data.short.net / data.short.trades) * 100) / 100 : 0
        }
      }))
      .sort((a, b) => {
        // Sort by predefined RR order: 1:1, 1:2, 1:3, 1:4, 1:5+, Other
        const rrOrder = { '1:1': 1, '1:2': 2, '1:3': 3, '1:4': 4, '1:5+': 5, 'Other': 6 };
        return (rrOrder[a.rr] || 999) - (rrOrder[b.rr] || 999);
      });

    // Long vs Short Analysis
    const longTrades = scopedTrades.filter(t => t.type === 'Long');
    const shortTrades = scopedTrades.filter(t => t.type === 'Short');
    
    const longAnalysis = {
      trades: longTrades.length,
      wins: longTrades.filter(t => (t.meta?.net || 0) > 0).length,
      losses: longTrades.filter(t => (t.meta?.net || 0) <= 0).length,
      net: longTrades.reduce((sum, t) => sum + (t.meta?.net || 0), 0),
      winRate: longTrades.length ? Math.round((longTrades.filter(t => (t.meta?.net || 0) > 0).length / longTrades.length) * 100 * 100) / 100 : 0,
      avgNet: longTrades.length ? Math.round((longTrades.reduce((sum, t) => sum + (t.meta?.net || 0), 0) / longTrades.length) * 100) / 100 : 0
    };

    const shortAnalysis = {
      trades: shortTrades.length,
      wins: shortTrades.filter(t => (t.meta?.net || 0) > 0).length,
      losses: shortTrades.filter(t => (t.meta?.net || 0) <= 0).length,
      net: shortTrades.reduce((sum, t) => sum + (t.meta?.net || 0), 0),
      winRate: shortTrades.length ? Math.round((shortTrades.filter(t => (t.meta?.net || 0) > 0).length / shortTrades.length) * 100 * 100) / 100 : 0,
      avgNet: shortTrades.length ? Math.round((shortTrades.reduce((sum, t) => sum + (t.meta?.net || 0), 0) / shortTrades.length) * 100) / 100 : 0
    };

    return {
      rrRows,
      longAnalysis,
      shortAnalysis,
      totalTrades: scopedTrades.length
    };
  }, [scopedTrades]);

  const scopedMonthly = useMemo(() => {
    if (analyticsScope === 'overall') return monthRows;
    const label = activeMonthLabel || monthLabelFromKey(selectedMonthKey);
    return monthRows.filter(m => m.month === label);
  }, [monthRows, analyticsScope, selectedMonthKey, activeMonthLabel]);
  const scopedTradesSorted = useMemo(() => {
    return [...scopedTrades].sort((a,b) => new Date(a.date) - new Date(b.date));
  }, [scopedTrades]);
  // Scoped equity
  const scopedEquityLabels = scopedTradesSorted.map(t => t.date);
  let scopedCum = 0;
  const scopedEquityDataPoints = scopedTradesSorted.map(t => {
    scopedCum += (t.meta?.net || 0);
    return Math.round(scopedCum * 100) / 100;
  });
  const scopedEquityChart = {
    labels: scopedEquityLabels,
    datasets: [
      { label: "Equity Curve (Net P&L)", data: scopedEquityDataPoints, tension: 0.25, borderColor: "#0ea5e9", backgroundColor: "rgba(14,165,233,0.15)", fill: true }
    ]
  };

  // Drawdown Chart
  const drawdownChart = useMemo(() => {
    if (scopedTradesSorted.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: "Drawdown",
          data: [],
          borderColor: "#dc2626",
          backgroundColor: "rgba(220,38,38,0.1)",
          fill: true,
        }]
      };
    }

    let peak = 0;
    let runningTotal = 0;
    const drawdownData = scopedTradesSorted.map(t => {
      runningTotal += (t.meta?.net || 0);
      if (runningTotal > peak) {
        peak = runningTotal;
      }
      const drawdown = peak - runningTotal;
      return Math.round(drawdown * 100) / 100;
    });

    return {
      labels: scopedEquityLabels,
      datasets: [{
        label: "Drawdown",
        data: drawdownData,
        borderColor: "#dc2626",
        backgroundColor: "rgba(220,38,38,0.1)",
        fill: true,
        tension: 0.25,
      }]
    };
  }, [scopedTradesSorted, scopedEquityLabels]);
  // Sparkline for last 10 trades
  const last10 = tradesSorted.slice(-10);
  let s = 0;
  const spark = last10.map(t => { s += (t.meta?.net || 0); return Math.round(s*100)/100; });
  const periodLabel = analyticsScope === 'overall' ? 'Showing: Overall' : `Showing: ${activeMonthLabel || monthLabelFromKey(selectedMonthKey)}`;
  const periodControls = (
    <div className="flex items-center gap-2">
      <button className={"btn btn-secondary " + (analyticsScope==='overall'?'!bg-sky-600 !text-white':'')} onClick={(e)=>{e.preventDefault(); setAnalyticsScope('overall');}}>Overall</button>
      {/* Select month via clicking Monthly Summary rows or Monthly P&L bars */}
    </div>
  );
  const onSelectMonth = (label) => {
    setAnalyticsScope('month');
    setActiveMonthLabel(label);
  };
  const formatCurrency = (n) => (typeof n === "number" ? `₹ ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : n);

  // Live charges preview from current form inputs
  const chargesPreview = useMemo(() => {
    return calcTradeCharges({
      qty: Number(form.qty || 0),
      buy: Number(form.buy || 0),
      sell: Number(form.sell || 0),
      type: form.type,
    });
  }, [form.qty, form.buy, form.sell, form.type]);

  // Filtered trades for table view
  const filteredTrades = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    return trades.filter(t => {
      const matchesText = !q || (t.symbol || '').toLowerCase().includes(q) || (t.setup || '').toLowerCase().includes(q) || (t.type || '').toLowerCase().includes(q) || (t.trend || '').toLowerCase().includes(q) || (t.rule || '').toLowerCase().includes(q) || (t.remarks || '').toLowerCase().includes(q) || (t.date || '').toLowerCase().includes(q);
      const net = t.meta?.net || 0;
      const matchesStatus = filterStatus === 'all' || (filterStatus === 'wins' && net > 0) || (filterStatus === 'losses' && net <= 0);
      const d = (t.date || '');
      const matchesFrom = !fromDate || d >= fromDate;
      const matchesTo = !toDate || d <= toDate;
      return matchesText && matchesStatus && matchesFrom && matchesTo;
    });
  }, [trades, filterText, filterStatus, fromDate, toDate]);

  // Total trades count
  const totalTrades = filteredTrades.length;

  const visibleTrades = useMemo(() => {
    const arr = [...filteredTrades];
    const get = (t) => {
      switch (sortKey) {
        case 'date': return t.date || '';
        case 'symbol': return (t.symbol || '').toLowerCase();
        case 'type': return (t.type || '').toLowerCase();
        case 'trend': return (t.trend || '').toLowerCase();
        case 'rule': return (t.rule || '').toLowerCase();
        case 'qty': return Number(t.qty) || 0;
        case 'buy': return Number(t.buy) || 0;
        case 'sell': return Number(t.sell) || 0;
        case 'net': return Number(t.meta?.net) || 0;
        case 'riskReward': return (t.riskReward || '').toLowerCase();
        default: return '';
      }
    };
    arr.sort((a,b) => {
      const va = get(a), vb = get(b);
      if (typeof va === 'number' && typeof vb === 'number') return sortDir === 'asc' ? va - vb : vb - va;
      // string compare
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    // Return all sorted trades
    return arr;
  }, [filteredTrades, sortKey, sortDir]);

  const onSortChange = (key) => {
    setSortKey(prev => {
      if (prev === key) {
        setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortDir('asc');
      return key;
    });
  };



  // Close export menu when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (showExportMenu && !event.target.closest('.relative')) {
        setShowExportMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  // Show loading screen while initializing auth
  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <IconCandle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Loading Trading Journal</h2>
          <p className="text-slate-600 dark:text-slate-400">Please wait...</p>
        </div>
      </div>
    );
  }

  // Show authentication screen if not logged in
  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Navigation Sidebar */}
      <Navigation 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={navCollapsed}
        setIsCollapsed={setNavCollapsed}
        mobileOpen={mobileNavOpen}
        setMobileOpen={setMobileNavOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {/* z-index hierarchy: 
            z-[100] - Timer settings dropdown (highest)
            z-[90]  - Timer backdrop overlay
            z-50    - Export dropdown
            z-30    - Export container
            z-20    - Header & Timer container
            z-10    - Navigation sidebar
        */}
        <header className="relative bg-gradient-to-r from-white via-slate-50 to-white dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-lg z-20">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full translate-y-12 -translate-x-12 animate-bounce"></div>
          
          <div className="relative z-10 container-wrap flex items-center justify-between min-h-10 sm:min-h-12 py-1 sm:py-2 lg:py-3 gap-1 sm:gap-2 lg:gap-4">
            {/* Left Section - Mobile Menu + Logo */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 flex-shrink-0">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="lg:hidden w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-500 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-md"
                title="Toggle navigation menu"
              >
                {mobileNavOpen ? (
                  <IconX className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                ) : (
                  <IconMenu className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                )}
              </button>
              
              <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-3">
                <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-12 lg:h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                  <IconCandle className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-6 lg:h-6 text-white"/>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xs sm:text-sm lg:text-xl font-bold text-slate-900 dark:text-white leading-tight">Trading Journal</h1>
                  <p className="text-xs lg:text-sm text-slate-600 dark:text-slate-400 hidden lg:block leading-tight">Professional Trading Companion</p>
                </div>
                <div className="px-1 sm:px-1.5 lg:px-3 py-0.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold rounded-full shadow-md hidden lg:block">
                  v1.0
                </div>
              </div>
            </div>

            {/* Center Section - Timer */}
            <div className="transform hover:scale-105 transition-transform duration-300 relative z-20 flex-shrink-0">
              <CooldownTimer />
            </div>

            {/* Right Section - Controls */}
            <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-3 flex-shrink-0">

              {/* Dark Mode Toggle */}
              <button 
                onClick={() => setIsDark(v => !v)} 
                type="button" 
                className="w-6 h-6 sm:w-7 sm:h-7 lg:w-10 lg:h-10 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-500 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-md" 
                title="Toggle dark mode"
              >
                {isDark ? <IconSun className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-5 lg:h-5 text-slate-600 dark:text-slate-400"/> : <IconMoon className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-5 lg:h-5 text-slate-600 dark:text-slate-400"/>}
              </button>

              {/* Export Menu */}
              <div className="relative z-30">
                <button 
                  onClick={() => setShowExportMenu(v => !v)} 
                  type="button" 
                  className="flex items-center gap-0.5 sm:gap-1 lg:gap-2 px-1.5 sm:px-2 lg:px-4 py-1 lg:py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg text-xs lg:text-base"
                >
                  <IconDownload className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4"/> 
                  <span className="hidden lg:inline">Export</span>
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showExportMenu && (
                  <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                    <div className="p-2">
                      <button 
                        onClick={() => { exportExcel(); setShowExportMenu(false); }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-700 dark:hover:to-slate-600 flex items-center gap-3 rounded-xl transition-all duration-300"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">Excel Only</div>
                          <div className="text-xs text-slate-500">Fast export</div>
                        </div>
                      </button>
                      <button 
                        onClick={() => { exportZip(); setShowExportMenu(false); }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-700 dark:hover:to-slate-600 flex items-center gap-3 rounded-xl transition-all duration-300"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">ZIP with Screenshots</div>
                          <div className="text-xs text-slate-500">Complete backup</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="flex items-center gap-0.5 sm:gap-1 lg:gap-3 px-1 sm:px-1.5 lg:px-4 py-0.5 sm:py-1 lg:py-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-lg">
              <button 
                  onClick={() => setShowProfile(true)}
                  className="flex items-center gap-0.5 sm:gap-1 lg:gap-3 hover:opacity-80 transition-opacity"
                  title="Profile Settings"
                >
                  {userProfile?.avatar_url ? (
                    <img
                      src={userProfile.avatar_url}
                      alt="Profile"
                      className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded-full object-cover border-2 border-white dark:border-slate-600"
                    />
                  ) : (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-white">
                        {(userProfile?.display_name || user.email?.split('@')[0] || 'T').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="hidden lg:block">
                    <div className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-32">
                      {userProfile?.display_name || user.email?.split('@')[0] || 'Demo User'}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {user.id === 'demo' ? 'Demo Mode' : 'Authenticated'}
                    </div>
                  </div>
                </button>
                <button
                  onClick={handleSignOut}
                  className="p-0.5 lg:p-1 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Sign out"
                >
                  <IconLogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
              </button>
              </div>


            </div>
          </div>
        </header>


        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container-wrap p-4 sm:p-6">
        {activeTab === 'analytics' && (
              <div className="relative overflow-hidden bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5"></div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full -translate-y-12 translate-x-12 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full translate-y-10 -translate-x-10 animate-bounce"></div>
              
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
                <div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <IconCandle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                      <div className="text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        Welcome back, {userProfile?.display_name || user.email?.split('@')[0] || 'Trader'}!
                  </div>
                    </div>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">Your trading performance at a glance</div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Track your progress and optimize your strategy</p>
                </div>
                
                  <div className="grid grid-cols-1 sm:grid-cols-3 md:flex md:items-center gap-2 sm:gap-3 md:gap-4">
                    <div className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 bg-white dark:bg-slate-700 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-600 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                      <div className="flex items-center gap-1 sm:gap-2 mb-1">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">Win Rate</span>
                    </div>
                      <div className="text-sm sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white">{totals.winRate}%</div>
                  </div>
                  
                    <div className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 bg-white dark:bg-slate-700 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-600 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                      <div className="flex items-center gap-1 sm:gap-2 mb-1">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">Total Net</span>
                    </div>
                      <div className={`text-sm sm:text-lg lg:text-xl font-bold ${totals.net>=0?'text-emerald-600 dark:text-emerald-400':'text-red-600 dark:text-red-400'}`}>
                      ₹{formatNumber(totals.net)}
                    </div>
                      <div className="mt-1 sm:mt-2 h-6 sm:h-8">
                      <Line 
                        data={{ 
                          labels: spark.map((_,i)=>i+1), 
                          datasets:[{ 
                            data:spark, 
                            borderColor: totals.net>=0?'#16a34a':'#dc2626', 
                            backgroundColor:'transparent', 
                            tension:0.4, 
                            pointRadius:0, 
                            borderWidth:2 
                          }] 
                        }} 
                        options={{ 
                          responsive:true, 
                          maintainAspectRatio:false, 
                          plugins:{legend:{display:false}, tooltip:{enabled:false}}, 
                          scales:{ x:{display:false}, y:{display:false} } 
                        }} 
                      />
                    </div>
                  </div>
                  
                    <div className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 bg-white dark:bg-slate-700 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-600 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                      <div className="flex items-center gap-1 sm:gap-2 mb-1">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">Total Trades</span>
                    </div>
                      <div className="text-sm sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white">{totals.trades}</div>
                </div>
              </div>
            </div>
          </div>
        )}

            {activeTab === 'trades' && (
              <TradesTab
                form={form}
                setForm={setForm}
                addOrUpdateTrade={addOrUpdateTrade}
                importExcel={importExcel}
                importZip={importZip}
                chargesPreview={chargesPreview}
                formatNumber={formatNumber}
                formatCurrency={formatCurrency}
                visibleTrades={visibleTrades}
                editTrade={editTrade}
                duplicateTrade={duplicateTrade}
                deleteTrade={showDeleteConfirmation}
                filterText={filterText}
                setFilterText={setFilterText}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                fromDate={fromDate}
                setFromDate={setFromDate}
                toDate={toDate}
                setToDate={setToDate}
                sortKey={sortKey}
                sortDir={sortDir}
                onSortChange={onSortChange}
                setCurrentFilteredTrades={setCurrentFilteredTrades}
              />
            )}
            
            {activeTab === 'analytics' && (
              <AnalyticsTab
                totals={scopedTotals}
                monthRows={scopedMonthly}
                allMonthRows={monthRows}
                activeMonthLabel={activeMonthLabel}
                setupRows={scopedSetupRows}
                directionRows={scopedDirectionRows}
                emotionRows={scopedEmotionRows}
                rrAnalysis={rrAnalysis}
                monthlyChart={monthlyChart}
                equityChart={scopedEquityChart}
                drawdownChart={drawdownChart}
                commonChartOptions={commonChartOptions}
                formatNumber={formatNumber}
                periodLabel={periodLabel}
                periodControls={periodControls}
                onSelectMonth={onSelectMonth}
                advancedMetrics={scopedAdvancedMetrics}
              />
            )}
            
            {activeTab === 'growth-calculator' && (
              <GrowthCalculatorTab
                trades={trades}
                growthData={growthData}
                setGrowthData={setGrowthData}
                recalculateMetrics={recalculateGrowthMetrics}
                loadGrowthData={loadGrowthData}
                formatNumber={formatNumber}
                formatCurrency={formatCurrency}
                showToast={showToast}
                playSuccessSound={playSuccessSound}
                playDeleteSound={playDeleteSound}
              />
            )}
            
            {activeTab === 'reports' && (
              <ReportsTab
                trades={trades}
                formatNumber={formatNumber}
                formatCurrency={formatCurrency}
                showToast={showToast}
              />
            )}
            
            {activeTab === 'psychology' && (
              <DailyPsychologyTab 
                showToast={showToast} 
                playSuccessSound={playSuccessSound}
                playDeleteSound={playDeleteSound}
              />
            )}
            
            {activeTab === 'rules' && (
              <TradingRulesTab />
            )}
        </div>
        </main>
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md transform transition-all duration-300 max-w-sm ${
              toast.type === 'success' 
                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white border-emerald-400 shadow-emerald-500/25' 
                : toast.type === 'error'
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-400 shadow-red-500/25'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-400 shadow-blue-500/25'
            }`}
            style={{
              animation: 'slideInRight 0.4s ease-out'
            }}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              toast.type === 'success' 
                ? 'bg-white/20' 
                : toast.type === 'error'
                ? 'bg-white/20'
                : 'bg-white/20'
            }`}>
              <span className="text-xl">{toast.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-sm leading-tight">{toast.message}</span>
              <div className="mt-2 w-full bg-white/20 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full transition-all duration-300 ${
                    toast.type === 'success' 
                      ? 'bg-white' 
                      : toast.type === 'error'
                      ? 'bg-white'
                      : 'bg-white'
                  }`}
                  style={{
                    width: '100%',
                    animation: 'shrink 4s linear forwards'
                  }}
                ></div>
              </div>
            </div>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="ml-2 p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
              title="Dismiss"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <IconAlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reset All Data</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Are you sure you want to delete all trades and reset the application? This will permanently remove all your trading data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    // Clear database
                    await tradeService.clearAllTrades();
                    
                  localStorage.removeItem(STORAGE_KEY);
                  setTrades([]);
                  setShowResetConfirm(false);
                  
                  // Show reset toast
                  const toastId = Date.now();
                  setToasts(prev => [...prev, {
                    id: toastId,
                    type: 'info',
                    message: 'All data has been reset!',
                    icon: '🔄'
                  }]);
                  
                  setTimeout(() => {
                    setToasts(prev => prev.filter(toast => toast.id !== toastId));
                  }, 3000);
                  } catch (error) {
                    console.error('Error resetting data:', error);
                    
                    // Show error toast
                    const toastId = Date.now();
                    setToasts(prev => [...prev, {
                      id: toastId,
                      type: 'error',
                      message: 'Failed to reset data. Please try again.',
                      icon: '❌'
                    }]);
                    
                    setTimeout(() => {
                      setToasts(prev => prev.filter(toast => toast.id !== toastId));
                    }, 5000);
                  }
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
              >
                Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <IconTrash className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Trade</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Are you sure you want to delete this trade? This action cannot be undone and the trade data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTradeId(null);
                }}
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
              >
                Delete Trade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <IconLogOut className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sign Out</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">You'll need to sign in again</p>
              </div>
            </div>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Are you sure you want to sign out? Your trading data will be saved securely in the cloud.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSignOut}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <Profile
          user={user}
          onClose={() => setShowProfile(false)}
          onProfileUpdate={handleProfileUpdate}
        />
      )}

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}


