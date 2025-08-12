import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG } from '../config/supabase.js'

const supabaseUrl = SUPABASE_CONFIG.URL
const supabaseAnonKey = SUPABASE_CONFIG.ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Please configure your Supabase credentials in .env.local file. See env.example for reference.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for trades
export const tradesApi = {
  // Get all trades for current user
  async getTrades() {
    // Get current user or use null for demo mode
    const { data: { user } } = await supabase.auth.getUser()
    
    let query = supabase
      .from('trades')
      .select('*')
      .order('date', { ascending: false })
    
    // If user is logged in, filter by user_id, otherwise get demo trades (user_id is null)
    if (user) {
      query = query.eq('user_id', user.id)
    } else {
      query = query.is('user_id', null)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  },

  // Add new trade
  async addTrade(trade) {
    // Get current user or use null for demo mode
    const { data: { user } } = await supabase.auth.getUser()
    
    const tradeData = {
      ...trade,
      user_id: user?.id || null // Allow null for demo mode
    }
    
    const { data, error } = await supabase
      .from('trades')
      .insert([tradeData])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Update trade
  async updateTrade(id, updates) {
    const { data, error } = await supabase
      .from('trades')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Delete trade
  async deleteTrade(id) {
    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Get trade by ID
  async getTrade(id) {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }
}

// Helper functions for authentication
export const authApi = {
  // Sign up
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  // Sign in
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Helper functions for user profiles
export const profileApi = {
  // Get user profile
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
    return data
  },

  // Update user profile
  async updateUserProfile(userId, updates) {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({ id: userId, ...updates })
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Convert file to base64 and store in database
  async uploadAvatar(userId, file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const base64Data = e.target.result
          console.log('File converted to base64, size:', base64Data.length)
          
          // Store base64 data directly in user_profiles table
          await this.updateUserProfile(userId, {
            avatar_url: base64Data
          })
          
          console.log('Base64 avatar stored successfully')
          resolve(base64Data)
        } catch (error) {
          console.error('Error storing base64 avatar:', error)
          reject(error)
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      
      reader.readAsDataURL(file)
    })
  },

  // Delete avatar (clear base64 data)
  async deleteAvatar(userId) {
    try {
      console.log('Clearing avatar for user:', userId)
      
      // Clear the avatar_url field in user_profiles table
      await this.updateUserProfile(userId, {
        avatar_url: null
      })
      
      console.log('Avatar cleared successfully')
    } catch (error) {
      console.error('Error clearing avatar:', error)
      throw error
    }
  }
}
