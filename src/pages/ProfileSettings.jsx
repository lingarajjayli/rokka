import { useState } from 'react';
import { Moon, Sun, Download, Upload, Bell, BellOff, X } from 'lucide-react';
import { useStore } from '../store';

function ProfileSettings({ onClose, onChangeTheme }) {
  const [activeTab, setActiveTab] = useState('preferences')
  const store = useStore()
  const [settings, setSettings] = useState(() => store.settings())

  const handleThemeChange = (theme) => {
    const updated = { ...settings, theme }
    setSettings(updated)
    store.saveSettings(updated)
    onChangeTheme(theme)
  }

  const handleNotificationToggle = (key) => {
    const updated = {
      ...settings,
      notifications: { ...settings.notifications, [key]: !settings.notifications[key] }
    }
    setSettings(updated)
    store.saveSettings(updated)
  }

  const handleExport = () => {
    const data = store.exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'rokka-backup.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (file) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = store.importData(event.target.result)
      if (result.success) {
        alert(result.message)
        window.location.reload()
      } else {
        alert(result.message)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-soft max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-brand-100">
          <div>
            <h2 className="text-2xl font-bold text-brand-900 font-heading">Settings</h2>
            <p className="text-sm text-brand-500">Customize your Rokka experience</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-brand-50 rounded-xl text-brand-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-brand-100">
          {['preferences', 'notifications', 'data'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 p-4 text-sm font-bold capitalize transition-all ${
                activeTab === tab
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-brand-50/50'
                  : 'text-brand-500 hover:text-brand-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-2xl border border-brand-100">
                <label className="block text-xs font-bold text-brand-400 uppercase tracking-widest mb-4">
                  Theme
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {['light', 'dark'].map((theme) => (
                    <button
                      key={theme}
                      onClick={() => handleThemeChange(theme)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        settings.theme === theme
                          ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-sm'
                          : 'border-brand-200 bg-white text-brand-600 hover:border-primary-300'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full mb-3 flex items-center justify-center ${
                        theme === 'light' ? 'bg-white border-2 border-brand-200' : 'bg-gray-800'
                      }`}>
                        {theme === 'light' ? <Sun className="w-6 h-6 text-brand-600" /> : <Moon className="w-6 h-6 text-white" />}
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold capitalize">{theme}</div>
                        <div className="text-xs text-brand-400">
                          {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-brand-50 to-white p-6 rounded-2xl border border-brand-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-brand-900">App Version</h3>
                    <p className="text-sm text-brand-500 mt-1">v1.0.0</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-brand-400">Built with React + Vite</p>
                    <p className="text-xs text-brand-300">© 2024 Rokka</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, enabled]) => (
                <div
                  key={key}
                  className="bg-white p-5 rounded-2xl border border-brand-100 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {enabled
                        ? <Bell className="w-5 h-5 text-brand-500" />
                        : <BellOff className="w-5 h-5 text-brand-500" />
                      }
                      <div>
                        <h4 className="font-bold text-brand-900 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                        <p className="text-xs text-brand-400">
                          {key === 'groupCreated' && 'Show notification when a new group is created'}
                          {key === 'expenseAdded' && 'Show notification when an expense is added'}
                          {key === 'debtSettled' && 'Show notification when debts are settled'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle(key)}
                      className={`w-14 h-8 rounded-full p-1 transition-all ${
                        enabled ? 'bg-primary-600' : 'bg-brand-200'
                      }`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                        enabled ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border border-emerald-100">
                <h3 className="font-bold text-emerald-900 mb-2">Backup Your Data</h3>
                <p className="text-sm text-emerald-600 mb-4">
                  Export all your groups, transactions, and settings to a JSON file.
                </p>
                <button
                  onClick={handleExport}
                  className="flex items-center justify-center w-full p-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-sm"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Export Data
                </button>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2">Restore Backup</h3>
                <p className="text-sm text-blue-600 mb-4">
                  Import data from a previously exported backup file.
                </p>
                <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center">
                  <Upload className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <p className="text-xs text-blue-500 mb-2">Drag & drop JSON file here</p>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImport(file)
                    }}
                    className="hidden"
                    id="import-file"
                  />
                  <label
                    htmlFor="import-file"
                    className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition-colors inline-block"
                  >
                    Browse Files
                  </label>
                </div>
              </div>

              <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
                <h4 className="font-bold text-rose-900 mb-2">Warning</h4>
                <p className="text-sm text-rose-700">
                  All settings will be reset to defaults if you clear your browser&apos;s localStorage.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-brand-100 bg-gradient-to-r from-brand-50 to-white">
          <button
            onClick={onClose}
            className="w-full btn-primary py-3 shadow-glow"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfileSettings
