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
        throw new Error('User not authenticated');
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
      throw error;
    } finally {
      this.loading = false;
    }
  }

  // Add a new psychology entry
  async addEntry(entry) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newEntry = {
        ...entry,
        user_id: user.id,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('daily_psychology')
        .insert([newEntry])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Add to local cache
      this.entries.unshift(data);
      return data;
    } catch (error) {
      console.error('Error adding psychology entry:', error);
      throw error;
    }
  }

  // Update an existing psychology entry
  async updateEntry(id, updates) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

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

      return data;
    } catch (error) {
      console.error('Error updating psychology entry:', error);
      throw error;
    }
  }

  // Delete a psychology entry
  async deleteEntry(id) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

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
      return true;
    } catch (error) {
      console.error('Error deleting psychology entry:', error);
      throw error;
    }
  }

  // Clear all entries (for user logout)
  clearCache() {
    this.entries = [];
    this.loaded = false;
    this.loading = false;
  }

  // Force refresh entries (for manual refresh)
  async refreshEntries() {
    this.loaded = false;
    return await this.getAllEntries();
  }
}

// Export singleton instance
export const psychologyService = new PsychologyService();
