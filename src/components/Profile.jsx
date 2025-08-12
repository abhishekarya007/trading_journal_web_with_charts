import React, { useState, useEffect, useRef } from 'react'
import { profileApi } from '../lib/supabase.js'
import { 
  IconUser, 
  IconCamera, 
  IconX, 
  IconCheck,
  IconLoader,
  IconEdit,
  IconSave
} from './icons.jsx'

export default function Profile({ user, onClose, onProfileUpdate }) {
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const userProfile = await profileApi.getUserProfile(user.id)
      setProfile(userProfile)
      setDisplayName(userProfile?.display_name || user.email?.split('@')[0] || 'Trader')
      setAvatarUrl(userProfile?.avatar_url || '')
    } catch (error) {
      console.error('Error loading profile:', error)
      setDisplayName(user.email?.split('@')[0] || 'Trader')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError('')
      
      const updates = {
        display_name: displayName.trim()
      }
      
      if (avatarUrl && avatarUrl !== profile?.avatar_url) {
        updates.avatar_url = avatarUrl
      }
      
      await profileApi.updateUserProfile(user.id, updates)
      
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
      
      // Notify parent component
      if (onProfileUpdate) {
        onProfileUpdate({ displayName: displayName.trim(), avatarUrl })
      }
      
      // Reload profile
      await loadProfile()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Failed to update profile. Please try again.')
      setTimeout(() => setError(''), 5000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB.')
      return
    }

    try {
      setIsSaving(true)
      setError('')
      
      console.log('Starting base64 avatar upload for user:', user.id)
      console.log('File details:', { name: file.name, size: file.size, type: file.type })
      
      // Upload avatar as base64
      const newAvatarUrl = await profileApi.uploadAvatar(user.id, file)
      console.log('Avatar uploaded successfully as base64')
      
      setAvatarUrl(newAvatarUrl)
      setSuccess('Avatar uploaded successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      setError('Failed to upload avatar. Please try again.')
      setTimeout(() => setError(''), 5000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveAvatar = async () => {
    try {
      setIsSaving(true)
      setError('')
      
      await profileApi.deleteAvatar(user.id)
      setAvatarUrl('')
      
      setSuccess('Avatar removed successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error removing avatar:', error)
      setError('Failed to remove avatar. Please try again.')
      setTimeout(() => setError(''), 5000)
    } finally {
      setIsSaving(false)
    }
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6">
          <div className="flex items-center justify-center py-8">
            <IconLoader className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-3 text-slate-600 dark:text-slate-400">Loading profile...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Profile Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Profile Picture
          </label>
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg border-2 border-slate-200 dark:border-slate-600">
                  {getInitials(displayName)}
                </div>
              )}
              
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white transition-colors"
                  disabled={isSaving}
                >
                  <IconCamera className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              
              <div className="space-y-2">
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    disabled={isSaving}
                  >
                    {avatarUrl ? 'Change Photo' : 'Upload Photo'}
                  </button>
                )}
                
                {isEditing && avatarUrl && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="w-full px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    disabled={isSaving}
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Display Name Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Display Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your display name"
              maxLength={50}
            />
          ) : (
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white">
              {displayName}
            </div>
          )}
        </div>

        {/* Email Section (Read-only) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Email Address
          </label>
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400">
            {user.email}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setDisplayName(profile?.display_name || user.email?.split('@')[0] || 'Trader')
                  setAvatarUrl(profile?.avatar_url || '')
                  setError('')
                }}
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <IconLoader className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <IconSave className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <IconEdit className="w-4 h-4" />
                Edit Profile
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
