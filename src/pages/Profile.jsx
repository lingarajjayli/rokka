import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { Mail, Phone, Edit3, Settings, LogOut, User, Shield, Clock } from 'lucide-react'
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'
import { useAuthState } from 'react-firebase-hooks/auth'

function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [user] = useAuthState(auth)
  const store = useStore()

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
            onClick={() => {
              store.resetToDefaultData();
              window.location.reload();
            }}
          >
            <Shield className="w-4 h-4 mr-2" />
            <span className="text-sm">Load Sample Data</span>
          </button>
          <button className="flex items-center px-4 py-2 border border-brand-200 bg-white text-brand-700 rounded-xl font-semibold hover:bg-brand-50 transition-colors shadow-sm whitespace-nowrap">
            <Settings className="w-4 h-4 mr-2" />
            <span className="text-sm">Settings</span>
          </button>
          <button 
            className="flex items-center px-4 py-2 border border-rose-200 bg-rose-50 text-rose-700 rounded-xl font-semibold hover:bg-rose-100 transition-colors shadow-sm whitespace-nowrap"
            onClick={() => {
              signOut(auth).catch(console.error)
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-brand-200 mb-8 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="flex items-center space-x-8 min-w-max px-1">
          <button
            className={`pb-4 text-sm font-bold transition-all flex items-center space-x-2 relative ${
              activeTab === 'profile' ? 'text-primary-600' : 'text-brand-500 hover:text-brand-800'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            <User className={`w-4 h-4 ${activeTab === 'profile' ? 'scale-110' : ''}`} />
            <span>My Profile</span>
            {activeTab === 'profile' && (
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary-600 rounded-t-full animate-fade-in" />
            )}
          </button>
          <button
            className={`pb-4 text-sm font-bold transition-all flex items-center space-x-2 relative ${
              activeTab === 'security' ? 'text-primary-600' : 'text-brand-500 hover:text-brand-800'
            }`}
            onClick={() => setActiveTab('security')}
          >
            <Shield className={`w-4 h-4 ${activeTab === 'security' ? 'scale-110' : ''}`} />
            <span>Security</span>
            {activeTab === 'security' && (
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary-600 rounded-t-full animate-fade-in" />
            )}
          </button>
        </div>
      </div>

      {activeTab === 'profile' && (
        <div className="card border-brand-100 flex flex-col md:flex-row gap-8 animate-fade-in">
          <div className="md:w-1/3 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-brand-50 to-white rounded-2xl border border-brand-100/50">
            <div className="relative group">
              <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-tr from-primary-600 to-primary-400 text-white flex items-center justify-center text-4xl font-bold font-heading shadow-glow mb-4 rotate-3 group-hover:rotate-0 transition-transform duration-300">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button className="absolute -bottom-2 -right-2 p-2 bg-white text-brand-600 rounded-xl shadow-lg border border-brand-100 hover:text-primary-600 transition-colors">
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-brand-900 font-heading text-center mt-2">{user?.displayName || 'Premium User'}</h2>
            <p className="text-sm font-semibold text-brand-500 mt-1 uppercase tracking-widest">Free Plan</p>
            <button className="mt-6 w-full btn-primary py-2.5 shadow-glow">Upgrade Plan</button>
          </div>

          <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6 items-start content-start pt-4">
            <div className="bg-white p-4 rounded-xl border border-brand-100 shadow-sm hover:shadow-md transition-shadow">
              <label className="block text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-2">Email Address</label>
              <div className="flex items-center text-brand-900 font-medium">
                <div className="p-2 bg-brand-50 rounded-lg mr-3">
                  <Mail className="w-4 h-4 text-brand-500" />
                </div>
                {user?.email || 'Not Provided'}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-brand-100 shadow-sm hover:shadow-md transition-shadow">
              <label className="block text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-2">Phone Number</label>
              <div className="flex items-center text-brand-900 font-medium">
                <div className="p-2 bg-brand-50 rounded-lg mr-3">
                  <Phone className="w-4 h-4 text-brand-500" />
                </div>
                +1 234 567 8900
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-brand-100 shadow-sm hover:shadow-md transition-shadow">
              <label className="block text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-2">Member Since</label>
              <div className="flex items-center text-brand-900 font-medium">
                <div className="p-2 bg-brand-50 rounded-lg mr-3">
                  <Clock className="w-4 h-4 text-brand-500" />
                </div>
                January 2024
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-brand-100 shadow-sm hover:shadow-md transition-shadow">
              <label className="block text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2">Security Status</label>
              <div className="flex items-center text-brand-900 font-medium">
                <div className="p-2 bg-emerald-50 rounded-lg mr-3">
                  <Shield className="w-4 h-4 text-emerald-600" />
                </div>
                Fully Secured
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-brand-100 col-span-full">
            <h3 className="font-bold text-brand-900 font-heading text-lg mb-4">App Settings</h3>
            <div className="bg-white p-5 rounded-2xl border border-brand-100 shadow-sm inline-block min-w-[240px]">
              <label className="block text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-3">Preferred Currency</label>
              <select
                className="input appearance-none bg-white font-bold text-brand-900"
                value={store.currency()}
                onChange={(e) => {
                  store.updateCurrency(e.target.value);
                  window.location.reload();
                }}
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
        </div>
      )}

      {activeTab === 'security' && (
        <div className="card border-brand-100 animate-fade-in bg-gradient-to-br from-white to-brand-50/50">
          <h3 className="font-bold text-brand-900 font-heading text-lg mb-8">Security & Activity Log</h3>
          <div className="text-center text-brand-400 py-12 border border-brand-100 border-dashed rounded-[2rem] bg-white">
            <Clock className="w-12 h-12 mx-auto text-brand-200 mb-4" />
            <p className="font-medium text-brand-600">No unusual activity detected.</p>
            <p className="text-sm">Your account is fully secure.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfilePage