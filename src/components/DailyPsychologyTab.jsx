import React, { useState, useEffect } from 'react';
import { psychologyService } from '../services/psychologyService';
import { 
  IconBrain, 
  IconCalendar, 
  IconEdit, 
  IconTrash, 
  IconPlus,
  IconMood,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconDownload
} from './icons';

const DailyPsychologyTab = ({ showToast, playSuccessSound, playDeleteSound }) => {
  const [entries, setEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [psychology, setPsychology] = useState('');
  const [emotions, setEmotions] = useState('');
  const [mistakes, setMistakes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load entries from database on component mount
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const data = await psychologyService.getAllEntries();
        setEntries(data);
      } catch (error) {
        console.error('Error loading psychology entries:', error);
        
        // Try to load from localStorage as fallback
        try {
          const localData = psychologyService.loadFromLocalStorage();
          setEntries(localData);
          if (showToast) {
            showToast('Loaded entries from local storage. Some features may be limited.', 'warning');
          }
        } catch (localError) {
          console.error('Error loading from localStorage:', localError);
          setEntries([]);
          if (showToast) {
            showToast('Failed to load psychology entries. Please refresh the page.', 'error');
          }
        }
      }
    };

    loadEntries();
  }, [showToast]);

  // Filter entries by month and year
  const filteredEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate.getFullYear() === filterYear && entryDate.getMonth() + 1 === filterMonth;
  });

  // Get available years for filter
  const availableYears = [...new Set(entries.map(entry => new Date(entry.date).getFullYear()))].sort((a, b) => b - a);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!psychology.trim() && !emotions.trim() && !mistakes.trim()) {
      if (showToast) {
        showToast('Please fill in at least one field before saving.', 'warning');
      } else {
        alert('Please fill in at least one field before saving.');
      }
      return;
    }

    const entryData = {
      date: selectedDate,
      psychology: psychology.trim(),
      emotions: emotions.trim(),
      mistakes: mistakes.trim()
    };

    if (isEditing) {
      // Update existing entry
      try {
        const updatedEntry = await psychologyService.updateEntry(editingId, entryData);
        setEntries(prev => prev.map(entry => 
          entry.id === editingId ? updatedEntry : entry
        ));
        setIsEditing(false);
        setEditingId(null);
        
        if (showToast) {
          showToast('Psychology entry updated successfully!', 'success');
        } else {
          alert('Psychology entry updated successfully!');
        }
        if (playSuccessSound) {
          playSuccessSound();
        }
      } catch (error) {
        console.error('Error updating entry:', error);
        if (showToast) {
          showToast('Failed to update entry. Please try again.', 'error');
        } else {
          alert('Failed to update entry. Please try again.');
        }
      }
    } else {
      // Add new entry
      try {
        const newEntry = await psychologyService.addEntry(entryData);
        setEntries(prev => [newEntry, ...prev]);
        
        if (showToast) {
          showToast('Psychology entry saved successfully!', 'success');
        } else {
          alert('Psychology entry saved successfully!');
        }
        if (playSuccessSound) {
          playSuccessSound();
        }
      } catch (error) {
        console.error('Error adding entry:', error);
        if (showToast) {
          showToast('Failed to save entry. Please try again.', 'error');
        } else {
          alert('Failed to save entry. Please try again.');
        }
      }
    }

    // Reset form
    setPsychology('');
    setEmotions('');
    setMistakes('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setShowAddModal(false);
  };

  const handleEdit = (entry) => {
    setSelectedDate(entry.date);
    setPsychology(entry.psychology);
    setEmotions(entry.emotions);
    setMistakes(entry.mistakes);
    setIsEditing(true);
    setEditingId(entry.id);
    setShowAddModal(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setPsychology('');
    setEmotions('');
    setMistakes('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setShowAddModal(false);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await psychologyService.deleteEntry(deleteId);
      setEntries(prev => prev.filter(entry => entry.id !== deleteId));
      setShowDeleteConfirm(false);
      setDeleteId(null);
      
      if (showToast) {
        showToast('Psychology entry deleted successfully!', 'success');
      } else {
        alert('Psychology entry deleted successfully!');
      }
      if (playDeleteSound) {
        playDeleteSound();
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      if (showToast) {
        showToast('Failed to delete entry. Please try again.', 'error');
      } else {
        alert('Failed to delete entry. Please try again.');
      }
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setPsychology('');
    setEmotions('');
    setMistakes('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setShowAddModal(true);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await psychologyService.syncWithDatabase();
      const data = await psychologyService.getAllEntries();
      setEntries(data);
      if (showToast) {
        showToast('Successfully synced with database!', 'success');
      }
      if (playSuccessSound) {
        playSuccessSound();
      }
    } catch (error) {
      console.error('Error syncing with database:', error);
      if (showToast) {
        showToast('Failed to sync with database. Please try again.', 'error');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-white/10 rounded-full -translate-y-8 sm:-translate-y-12 lg:-translate-y-16 translate-x-8 sm:translate-x-12 lg:translate-x-16 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-24 lg:h-24 bg-white/10 rounded-full translate-y-6 sm:translate-y-8 lg:translate-y-12 -translate-x-6 sm:-translate-x-8 lg:-translate-x-12 animate-bounce"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <IconBrain className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Daily Psychology</h1>
              <p className="text-sm sm:text-base text-purple-100">Track your trading mindset and emotions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Add Button Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg sm:rounded-xl flex items-center justify-center">
              <IconBrain className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Psychology History</h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {filteredEntries.length} entries for {new Date(filterYear, filterMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            {/* Month Filter */}
            <div className="flex items-center gap-2">
              <label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Month:</label>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                className="px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                <option value={1}>January</option>
                <option value={2}>February</option>
                <option value={3}>March</option>
                <option value={4}>April</option>
                <option value={5}>May</option>
                <option value={6}>June</option>
                <option value={7}>July</option>
                <option value={8}>August</option>
                <option value={9}>September</option>
                <option value={10}>October</option>
                <option value={11}>November</option>
                <option value={12}>December</option>
              </select>
            </div>

            {/* Year Filter */}
            <div className="flex items-center gap-2">
              <label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Year:</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(parseInt(e.target.value))}
                className="px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                {availableYears.length > 0 ? (
                  availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))
                ) : (
                  <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                )}
              </select>
            </div>

            {/* Sync Button */}
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              title="Sync with database"
            >
              <IconDownload className={`w-3 h-3 sm:w-4 sm:h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync'}
            </button>

            {/* Add New Entry Button */}
            <button
              onClick={openAddModal}
              className="px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <IconPlus className="w-3 h-3 sm:w-4 sm:h-4" />
              Add Entry
            </button>
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <IconBrain className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
              No entries for {new Date(filterYear, filterMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Start tracking your trading psychology by adding your first entry for this month.
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4 max-h-[32rem] overflow-y-auto pr-2">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                      {formatDate(entry.date)}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      {new Date(entry.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-1 sm:gap-2">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit Entry"
                    >
                      <IconEdit className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1.5 sm:p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete Entry"
                    >
                      <IconTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {entry.psychology && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center">
                        <IconBrain className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                        Trading Psychology
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-lg p-2 sm:p-3 border border-slate-200 dark:border-slate-600">
                        {entry.psychology}
                      </p>
                    </div>
                  )}

                  {entry.emotions && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center">
                        <IconMood className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                        Emotions & Feelings
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-lg p-2 sm:p-3 border border-slate-200 dark:border-slate-600">
                        {entry.emotions}
                      </p>
                    </div>
                  )}

                  {entry.mistakes && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center">
                        <IconAlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                        Mistakes & Lessons
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-lg p-2 sm:p-3 border border-slate-200 dark:border-slate-600">
                        {entry.mistakes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <IconPlus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {isEditing ? 'Edit Psychology Entry' : 'Add New Entry'}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Record your daily trading psychology, emotions, and lessons learned
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <IconCalendar className="w-4 h-4 inline mr-2" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                {/* Psychology Section */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <IconBrain className="w-4 h-4 inline mr-2" />
                    Trading Psychology & Mindset
                  </label>
                  <textarea
                    value={psychology}
                    onChange={(e) => setPsychology(e.target.value)}
                    placeholder="How was your mental state today? What was your mindset going into trades? Any psychological challenges you faced?"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows="4"
                  />
                </div>

                {/* Emotions Section */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <IconMood className="w-4 h-4 inline mr-2" />
                    Emotions & Feelings
                  </label>
                  <textarea
                    value={emotions}
                    onChange={(e) => setEmotions(e.target.value)}
                    placeholder="What emotions did you experience during trading? Were you calm, anxious, excited, fearful? How did emotions affect your decisions?"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows="4"
                  />
                </div>

                {/* Mistakes Section */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <IconAlertTriangle className="w-4 h-4 inline mr-2" />
                    Mistakes & Lessons Learned
                  </label>
                  <textarea
                    value={mistakes}
                    onChange={(e) => setMistakes(e.target.value)}
                    placeholder="What mistakes did you make today? What could you have done better? What lessons did you learn?"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows="4"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <IconCheck className="w-5 h-5 inline mr-2" />
                    {isEditing ? 'Update Entry' : 'Save Entry'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200"
                  >
                    <IconX className="w-5 h-5 inline mr-2" />
                    Cancel
                  </button>
                </div>
              </form>
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
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Entry</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Are you sure you want to delete this psychology entry? This will permanently remove the entry and all its data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyPsychologyTab;
