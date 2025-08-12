import { supabase } from '../lib/supabase';

class PsychologyService {
  constructor() {
    this.entries = [];
    this.loaded = false;
    this.loading = false;
  }

  // Get all psychology entries for the current user
  async getAllEntries() {
    if (this.loaded && !this.loading) {
      return this.entries;
    }

    this.loading = true;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Fallback to localStorage for unauthenticated users
        const savedEntries = localStorage.getItem('daily_psychology_entries');
        if (savedEntries) {
          try {
            this.entries = JSON.parse(savedEntries);
            this.loaded = true;
            return this.entries;
          } catch (parseError) {
            console.error('Error parsing localStorage data:', parseError);
            this.entries = [];
            this.loaded = true;
            return this.entries;
          }
        }
        this.entries = [];
        this.loaded = true;
        return this.entries;
      }

      const { data, error } = await supabase
        .from('daily_psychology')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      this.entries = data || [];
      this.loaded = true;
      return this.entries;
    } catch (error) {
      console.error('Error fetching psychology entries:', error);
      
      // Fallback to localStorage if database fails
      const savedEntries = localStorage.getItem('daily_psychology_entries');
      if (savedEntries) {
        try {
          this.entries = JSON.parse(savedEntries);
          this.loaded = true;
          console.log('Using localStorage fallback for psychology entries');
          return this.entries;
        } catch (parseError) {
          console.error('Error parsing localStorage fallback:', parseError);
        }
      }
      
      // Return empty array if all fallbacks fail
      this.entries = [];
      this.loaded = true;
      throw error;
    } finally {
      this.loading = false;
    }
  }

  // Add a new psychology entry
  async addEntry(entry) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const newEntry = {
        ...entry,
        id: Date.now() + Math.random(), // Generate local ID
        created_at: new Date().toISOString()
      };

      if (user) {
        // Try to save to database
        try {
          const entryForDb = {
            ...entry,
            user_id: user.id,
            created_at: new Date().toISOString()
          };

          const { data, error } = await supabase
            .from('daily_psychology')
            .insert([entryForDb])
            .select()
            .single();

          if (error) {
            throw error;
          }

          // Add to local cache
          this.entries.unshift(data);
          
          // Also save to localStorage as backup
          this.saveToLocalStorage();
          
          return data;
        } catch (dbError) {
          console.error('Database save failed, using localStorage:', dbError);
          // Fallback to localStorage
          newEntry.user_id = user.id;
          this.entries.unshift(newEntry);
          this.saveToLocalStorage();
          return newEntry;
        }
      } else {
        // No user, save to localStorage only
        this.entries.unshift(newEntry);
        this.saveToLocalStorage();
        return newEntry;
      }
    } catch (error) {
      console.error('Error adding psychology entry:', error);
      throw error;
    }
  }

  // Update an existing psychology entry
  async updateEntry(id, updates) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const updatedEntry = {
        ...updates,
        id: id,
        updated_at: new Date().toISOString()
      };

      if (user) {
        // Try to update in database
        try {
          const { data, error } = await supabase
            .from('daily_psychology')
            .update({
              ...updates,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

          if (error) {
            throw error;
          }

          // Update local cache
          const index = this.entries.findIndex(entry => entry.id === id);
          if (index !== -1) {
            this.entries[index] = data;
          }

          // Also save to localStorage as backup
          this.saveToLocalStorage();
          
          return data;
        } catch (dbError) {
          console.error('Database update failed, using localStorage:', dbError);
          // Fallback to localStorage
          const index = this.entries.findIndex(entry => entry.id === id);
          if (index !== -1) {
            this.entries[index] = { ...this.entries[index], ...updatedEntry };
          }
          this.saveToLocalStorage();
          return this.entries[index];
        }
      } else {
        // No user, update localStorage only
        const index = this.entries.findIndex(entry => entry.id === id);
        if (index !== -1) {
          this.entries[index] = { ...this.entries[index], ...updatedEntry };
        }
        this.saveToLocalStorage();
        return this.entries[index];
      }
    } catch (error) {
      console.error('Error updating psychology entry:', error);
      throw error;
    }
  }

  // Delete a psychology entry
  async deleteEntry(id) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Try to delete from database
        try {
          const { error } = await supabase
            .from('daily_psychology')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) {
            throw error;
          }

          // Remove from local cache
          this.entries = this.entries.filter(entry => entry.id !== id);
          
          // Also update localStorage
          this.saveToLocalStorage();
          
          return true;
        } catch (dbError) {
          console.error('Database delete failed, using localStorage:', dbError);
          // Fallback to localStorage
          this.entries = this.entries.filter(entry => entry.id !== id);
          this.saveToLocalStorage();
          return true;
        }
      } else {
        // No user, delete from localStorage only
        this.entries = this.entries.filter(entry => entry.id !== id);
        this.saveToLocalStorage();
        return true;
      }
    } catch (error) {
      console.error('Error deleting psychology entry:', error);
      throw error;
    }
  }

  // Save entries to localStorage
  saveToLocalStorage() {
    try {
      localStorage.setItem('daily_psychology_entries', JSON.stringify(this.entries));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Load entries from localStorage
  loadFromLocalStorage() {
    try {
      const savedEntries = localStorage.getItem('daily_psychology_entries');
      if (savedEntries) {
        return JSON.parse(savedEntries);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    return [];
  }

  // Clear all entries (for user logout)
  clearCache() {
    this.entries = [];
    this.loaded = false;
    this.loading = false;
    // Also clear localStorage
    try {
      localStorage.removeItem('daily_psychology_entries');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  // Force refresh entries (for manual refresh)
  async refreshEntries() {
    this.loaded = false;
    return await this.getAllEntries();
  }

  // Sync localStorage with database (for recovery)
  async syncWithDatabase() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('daily_psychology')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      this.entries = data || [];
      this.saveToLocalStorage();
      this.loaded = true;
      
      return this.entries;
    } catch (error) {
      console.error('Error syncing with database:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const psychologyService = new PsychologyService();
