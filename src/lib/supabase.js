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
