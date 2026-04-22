import { useState } from 'react'
import { useStore } from '../store'
import {
  Mail, Phone, Edit3, Settings, LogOut, User, Shield, Clock,
  Check, X, Eye, EyeOff, KeyRound, AlertCircle, CheckCircle2
} from 'lucide-react'
import { auth } from '../firebase'
import {
  signOut, updateProfile, updateEmail, updatePassword,
  EmailAuthProvider, reauthenticateWithCredential
} from 'firebase/auth'
import { useAuthState } from 'react-firebase-hooks/auth'
import ProfileSettings from './ProfileSettings'

function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [showSettings, setShowSettings] = useState(false)
  const [user] = useAuthState(auth)
  const store = useStore()

  const phoneKey = user ? `rokka_phone_${user.uid}` : 'rokka_phone'
  const storedPhone = user ? (localStorage.getItem(phoneKey) || user.phoneNumber || '') : ''

  // ── Profile edit ───────────────────────────────────────────────
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [showAuthPw, setShowAuthPw] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const isGoogleUser = user?.providerData?.some(p => p.providerId === 'google.com')
  const emailChanged = editEmail.trim() && editEmail.trim() !== user?.email

  const startEditing = () => {
    setEditName(user?.displayName || '')
    setEditEmail(user?.email || '')
    setEditPhone(storedPhone)
    setAuthPassword('')
    setSaveError('')
    setSaveSuccess(false)
    setEditing(true)
  }

  const cancelEditing = () => {
    setEditing(false)
    setSaveError('')
  }

  const handleSaveProfile = async () => {
    if (!editPhone.trim()) { setSaveError('Mobile number is required.'); return }
    if (!editEmail.trim()) { setSaveError('Email address is required.'); return }
    if (emailChanged && !isGoogleUser && !authPassword) {
      setSaveError('Enter your current password to change your email.')
      return
    }
    setSaving(true)
    setSaveError('')
    try {
      // Update display name
      if (editName.trim() && editName.trim() !== user.displayName) {
        await updateProfile(user, { displayName: editName.trim() })
      }
      // Update email (requires re-auth for email/password accounts)
      if (emailChanged && !isGoogleUser) {
        const credential = EmailAuthProvider.credential(user.email, authPassword)
        await reauthenticateWithCredential(user, credential)
        await updateEmail(user, editEmail.trim())
      }
      // Update phone in localStorage
      localStorage.setItem(phoneKey, editPhone.trim())
      setSaveSuccess(true)
      setEditing(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setSaveError('Current password is incorrect.')
      } else if (err.code === 'auth/email-already-in-use') {
        setSaveError('This email is already in use by another account.')
      } else if (err.code === 'auth/invalid-email') {
        setSaveError('Invalid email address.')
      } else {
        setSaveError('Failed to save. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  // ── Password change ────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [changingPw, setChangingPw] = useState(false)

  const handleChangePassword = async () => {
    setPwError('')
    setPwSuccess('')
    if (!currentPassword) { setPwError('Please enter your current password.'); return }
    if (newPassword.length < 6) { setPwError('New password must be at least 6 characters.'); return }
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match.'); return }
    setChangingPw(true)
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, newPassword)
      setPwSuccess('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setPwError('Current password is incorrect.')
      } else {
        setPwError('Failed to update password. Please try again.')
      }
    } finally {
      setChangingPw(false)
    }
  }

  const memberSince = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown'

  const displayName = user?.displayName || 'Rokka User'
  const displayPhone = storedPhone || 'Not Provided'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-900 font-heading tracking-tight">Account & Settings</h1>
          <p className="text-sm text-brand-500 mt-1 font-medium tracking-wide">Manage your preferences and security</p>
        </div>
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 md:pb-0">
          <button
            className="flex items-center px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-xl font-semibold hover:bg-blue-100 transition-colors shadow-sm whitespace-nowrap"
            onClick={() => { store.resetToDefaultData(); window.location.reload(); }}
          >
            <Shield className="w-4 h-4 mr-2" />
            <span className="text-sm">Load Sample Data</span>
          </button>
          <button
            className="flex items-center px-4 py-2 border border-brand-200 bg-white text-brand-700 rounded-xl font-semibold hover:bg-brand-50 transition-colors shadow-sm whitespace-nowrap"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            <span className="text-sm">Settings</span>
          </button>
          <button
            className="flex items-center px-4 py-2 border border-rose-200 bg-rose-50 text-rose-700 rounded-xl font-semibold hover:bg-rose-100 transition-colors shadow-sm whitespace-nowrap"
            onClick={() => signOut(auth).catch(console.error)}
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-brand-200 mb-8 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="flex items-center space-x-8 min-w-max px-1">
          {[
            { id: 'profile', label: 'My Profile', Icon: User },
            { id: 'security', label: 'Security', Icon: Shield },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`pb-4 text-sm font-bold transition-all flex items-center space-x-2 relative ${
                activeTab === id ? 'text-primary-600' : 'text-brand-500 hover:text-brand-800'
              }`}
              onClick={() => setActiveTab(id)}
            >
              <Icon className={`w-4 h-4 ${activeTab === id ? 'scale-110' : ''}`} />
              <span>{label}</span>
              {activeTab === id && (
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary-600 rounded-t-full animate-fade-in" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Profile Tab ── */}
      {activeTab === 'profile' && (
        <div className="card border-brand-100 flex flex-col md:flex-row gap-8 animate-fade-in">
          {/* Avatar column */}
          <div className="md:w-1/3 flex flex-col items-center justify-start p-6 bg-gradient-to-b from-brand-50 to-white rounded-2xl border border-brand-100/50">
            <div className="relative group mb-4">
              <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-tr from-primary-600 to-primary-400 text-white flex items-center justify-center text-4xl font-bold font-heading shadow-glow rotate-3 group-hover:rotate-0 transition-transform duration-300">
                {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <button
                className="absolute -bottom-2 -right-2 p-2 bg-white text-brand-600 rounded-xl shadow-lg border border-brand-100 hover:text-primary-600 transition-colors"
                onClick={startEditing}
                title="Edit profile"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-brand-900 font-heading text-center">{displayName}</h2>
            <p className="text-sm text-brand-400 mt-1 truncate max-w-full px-2">{user?.email}</p>
            {!editing && (
              <button
                onClick={startEditing}
                className="mt-4 flex items-center px-4 py-2 border border-primary-200 bg-primary-50 text-primary-700 rounded-xl font-semibold text-sm hover:bg-primary-100 transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>

          {/* Details / Edit form */}
          <div className="md:w-2/3 flex flex-col gap-5 pt-4">
            {saveSuccess && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Profile saved successfully!
              </div>
            )}
            {saveError && (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {saveError}
              </div>
            )}

            {editing ? (
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-2">Display Name</label>
                  <input
                    className="input"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-2">
                    Email Address <span className="text-rose-400 normal-case font-normal">*</span>
                  </label>
                  {isGoogleUser ? (
                    <div className="input bg-brand-50 text-brand-500 cursor-not-allowed flex items-center gap-2">
                      <Mail className="w-4 h-4 shrink-0" />
                      <span>{user?.email}</span>
                    </div>
                  ) : (
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-400">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        className="input pl-10"
                        value={editEmail}
                        onChange={e => setEditEmail(e.target.value)}
                        placeholder="you@example.com"
                      />
                    </div>
                  )}
                  {isGoogleUser && (
                    <p className="text-[11px] text-brand-400 mt-1 ml-1">Managed by Google — cannot be changed here.</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-2">
                    Mobile Number <span className="text-rose-400 normal-case font-normal">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      className="input pl-10"
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                {/* Re-auth password — only shown when email is being changed */}
                {emailChanged && !isGoogleUser && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Confirm identity to change email
                    </p>
                    <div className="relative">
                      <input
                        type={showAuthPw ? 'text' : 'password'}
                        className="input pr-11 bg-white"
                        placeholder="Current password"
                        value={authPassword}
                        onChange={e => setAuthPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-700"
                        onClick={() => setShowAuthPw(v => !v)}
                      >
                        {showAuthPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center btn-primary py-2.5 disabled:opacity-60"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="flex items-center px-4 py-2.5 border border-brand-200 bg-white text-brand-600 rounded-xl font-semibold hover:bg-brand-50 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* ── Read-only view ── */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="bg-white p-4 rounded-xl border border-brand-100 shadow-sm hover:shadow-md transition-shadow">
                  <label className="block text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-2">Email Address</label>
                  <div className="flex items-center text-brand-900 font-medium">
                    <div className="p-2 bg-brand-50 rounded-lg mr-3 shrink-0">
                      <Mail className="w-4 h-4 text-brand-500" />
                    </div>
                    <span className="truncate text-sm">{user?.email || 'Not Provided'}</span>
                  </div>
                </div>
                <div className={`bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow ${!storedPhone ? 'border-amber-200' : 'border-brand-100'}`}>
                  <label className="block text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-2">Mobile Number</label>
                  <div className="flex items-center font-medium">
                    <div className={`p-2 rounded-lg mr-3 shrink-0 ${!storedPhone ? 'bg-amber-50' : 'bg-brand-50'}`}>
                      <Phone className={`w-4 h-4 ${!storedPhone ? 'text-amber-500' : 'text-brand-500'}`} />
                    </div>
                    {storedPhone ? (
                      <span className="text-brand-900 text-sm">{storedPhone}</span>
                    ) : (
                      <span className="text-amber-600 text-sm font-semibold">Not set — click Edit Profile</span>
                    )}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-brand-100 shadow-sm hover:shadow-md transition-shadow">
                  <label className="block text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-2">Member Since</label>
                  <div className="flex items-center text-brand-900 font-medium">
                    <div className="p-2 bg-brand-50 rounded-lg mr-3 shrink-0">
                      <Clock className="w-4 h-4 text-brand-500" />
                    </div>
                    <span className="text-sm">{memberSince}</span>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-brand-100 shadow-sm hover:shadow-md transition-shadow">
                  <label className="block text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2">Security Status</label>
                  <div className="flex items-center text-brand-900 font-medium">
                    <div className="p-2 bg-emerald-50 rounded-lg mr-3 shrink-0">
                      <Shield className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm">Fully Secured</span>
                  </div>
                </div>
              </div>
            )}

            {/* Currency setting */}
            {!editing && (
              <div className="mt-2 pt-6 border-t border-brand-100">
                <h3 className="font-bold text-brand-900 font-heading text-base mb-4">App Settings</h3>
                <div className="bg-white p-5 rounded-2xl border border-brand-100 shadow-sm inline-block min-w-[240px]">
                  <label className="block text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-3">Preferred Currency</label>
                  <select
                    className="input appearance-none bg-white font-bold text-brand-900"
                    value={store.currency()}
                    onChange={e => { store.updateCurrency(e.target.value); window.location.reload(); }}
                  >
                    <option value="$">$ — US Dollar (USD)</option>
                    <option value="₹">₹ — Indian Rupee (INR)</option>
                    <option value="€">€ — Euro (EUR)</option>
                    <option value="£">£ — British Pound (GBP)</option>
                    <option value="¥">¥ — Japanese Yen (JPY)</option>
                    <option value="A$">A$ — Australian Dollar (AUD)</option>
                  </select>
                  <p className="mt-3 text-[11px] text-brand-400 font-medium">Applies across all pages instantly.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Security Tab ── */}
      {activeTab === 'security' && (
        <div className="card border-brand-100 animate-fade-in bg-gradient-to-br from-white to-brand-50/50 max-w-lg">
          <h3 className="font-bold text-brand-900 font-heading text-lg mb-6 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary-600" />
            Change Password
          </h3>

          {isGoogleUser ? (
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-5 text-sm text-blue-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Google account</p>
                <p>Your account is managed by Google. To change your password, visit your Google account settings.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {pwError && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {pwError}
                </div>
              )}
              {pwSuccess && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {pwSuccess}
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-2">Current Password</label>
                <div className="relative">
                  <input
                    className="input pr-11"
                    type={showCurrentPw ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-700" onClick={() => setShowCurrentPw(v => !v)}>
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-2">New Password</label>
                <div className="relative">
                  <input
                    className="input pr-11"
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-700" onClick={() => setShowNewPw(v => !v)}>
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword.length > 0 && newPassword.length < 6 && (
                  <p className="text-xs text-rose-500 mt-1">Must be at least 6 characters</p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                <input
                  className={`input ${confirmPassword && confirmPassword !== newPassword ? 'border-rose-400' : ''}`}
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                />
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-xs text-rose-500 mt-1">Passwords do not match</p>
                )}
              </div>
              <button onClick={handleChangePassword} disabled={changingPw} className="w-full btn-primary py-3 mt-2 disabled:opacity-60">
                {changingPw ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          )}
        </div>
      )}

      {showSettings && (
        <ProfileSettings
          onClose={() => setShowSettings(false)}
          onChangeTheme={theme => document.documentElement.setAttribute('data-theme', theme)}
        />
      )}
    </div>
  )
}

export default ProfilePage
