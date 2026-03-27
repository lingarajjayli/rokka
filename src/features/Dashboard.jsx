import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { TrendingDown, ArrowUpRight, Users, CreditCard, Plus, Bell, Wallet, User, Search, X, ChevronRight } from 'lucide-react'

function Dashboard() {
  const navigate = useNavigate()
  const store = useStore()
  const [groups, setGroups] = useState([])
  const [members, setMembers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [showAddChoice, setShowAddChoice] = useState(false)
  const [choiceType, setChoiceType] = useState(null) // 'individual' or 'group'
  const [searchTerm, setSearchTerm] = useState('')
  const [globalHistory, setGlobalHistory] = useState([])

  useEffect(() => {
    setGroups(store.groups())
    setMembers(store.members())
    setTransactions(store.transactions())
    if (store.getGlobalHistory) {
      setGlobalHistory(store.getGlobalHistory().slice(0, 5))
    }
  }, [store])

  const totalBalance = transactions.reduce((sum, t) => sum + t.amount, 0)
  const currentMonthSpend = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  
  // Dynamic Owe/Owed calculation
  const youOwe = transactions.filter(t => t.source === 'individual' && t.iouType === 'owe').reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const youAreOwed = transactions.filter(t => t.source === 'individual' && t.iouType === 'lent').reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const handleChoice = (type) => {
    setChoiceType(type)
  }

  const filteredItems = choiceType === 'group' 
    ? groups.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 animate-fade-in pb-24 md:pb-8">
      {/* Action Bar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-900 font-heading tracking-tight">Overview</h1>
          <p className="text-sm text-brand-500 mt-1 font-medium tracking-wide">Manage your finances and groups</p>
        </div>
        <div className="hidden md:flex items-center space-x-3">
          <button
            className="btn-primary flex items-center space-x-2 bg-white text-brand-700 border border-brand-200 shadow-sm hover:shadow-soft hover:bg-brand-50"
            onClick={() => navigate('/groups')}
          >
            <Users className="w-4 h-4 text-primary-600" />
            <span>Groups</span>
          </button>
          <button
            className="btn-primary flex items-center space-x-2 shadow-glow"
            onClick={() => setShowAddChoice(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
          <button className="relative p-2.5 bg-white text-brand-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all border border-brand-100 shadow-sm">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Main Combined Balance */}
        <div className="md:col-span-1 relative overflow-hidden bg-gradient-to-br from-brand-900 to-brand-800 text-white rounded-[2.5rem] p-8 shadow-glow transition-all hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <p className="text-[10px] text-brand-300 font-extrabold uppercase tracking-[0.2em] mb-4">Total Net Balance</p>
          <div className="flex items-center space-x-3 mb-6">
            <h2 className="text-4xl font-bold font-heading tracking-tight">
              <span className="text-2xl mr-1 font-medium opacity-60">{store.currency()}</span>
              {Math.abs(totalBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
            <div className={`p-1.5 rounded-full ${totalBalance >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {totalBalance >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <div className="space-y-3">
             <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-brand-400">
               <span>Lent</span>
               <span className="text-emerald-400">+{store.currency()}{youAreOwed.toFixed(0)}</span>
             </div>
             <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full transition-all duration-1000" 
                  style={{ width: `${(youAreOwed / (youAreOwed + youOwe + 1) * 100).toFixed(0)}%` }}
                />
             </div>
             <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-brand-400">
               <span>Owe</span>
               <span className="text-rose-400">-{store.currency()}{youOwe.toFixed(0)}</span>
             </div>
          </div>
        </div>

        {/* You Owe Card */}
        <div className="md:col-span-1 card border-brand-100 bg-white p-7 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-500">
                <TrendingDown className="w-6 h-6" />
              </div>
              <span className="text-[10px] text-rose-500 font-extrabold uppercase tracking-widest">You Owe</span>
            </div>
            <h3 className="text-3xl font-bold font-heading text-brand-900">{store.currency()}{youOwe.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
          </div>
          <p className="text-[10px] text-brand-400 font-bold uppercase tracking-widest mt-4">Across all personal IOUs</p>
        </div>

        {/* You Are Owed Card */}
        <div className="md:col-span-1 card border-brand-100 bg-white p-7 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-500">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest">You are owed</span>
            </div>
            <h3 className="text-3xl font-bold font-heading text-brand-900">{store.currency()}{youAreOwed.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
          </div>
          <p className="text-[10px] text-brand-400 font-bold uppercase tracking-widest mt-4">Pending from friends</p>
        </div>
      </div>

      {/* Recent Groups */}
      <section className="mb-10">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-brand-900 font-heading">Recent Groups</h3>
            <p className="text-xs text-brand-500 font-medium">Active shared expenses</p>
          </div>
          <button onClick={() => navigate('/groups')} className="text-primary-600 text-sm font-semibold hover:text-primary-700 transition-colors">View All</button>
        </div>
        <div className="flex space-x-5 overflow-x-auto pb-6 pt-2 px-1 -mx-4 sm:-mx-6 lg:-mx-8 sm:px-6 lg:px-8 snap-x" style={{ scrollbarWidth: 'none' }}>
          {groups.map((group) => (
            <div
              key={group.id}
              className="group-card snap-start hover:-translate-y-1 shadow-sm border border-brand-100 cursor-pointer bg-white"
              onClick={() => navigate(`/groups/${group.id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-inner">
                  <Users className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">Active</span>
              </div>
              <h4 className="font-bold text-brand-900 mb-1 font-heading">{group.name}</h4>
              <div className="flex items-center text-xs text-brand-400 font-medium mb-4">
                <Users className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                <span>{Array.isArray(group.members) ? group.members.length : group.members} members</span>
              </div>
              <div className="bg-brand-50 rounded-xl p-3 border border-brand-100/50">
                <p className="text-[10px] text-brand-500 font-bold tracking-widest mb-1 uppercase">Total Spent</p>
                <p className="text-lg font-bold text-brand-900 font-heading tracking-tight">{store.currency()}{group.spent.toLocaleString()}</p>
              </div>
            </div>
          ))}
          <div onClick={() => navigate('/groups')} className="flex-shrink-0 w-56 h-auto min-h-[180px] rounded-2xl border-2 border-dashed border-brand-200 hover:border-primary-400 hover:bg-primary-50/30 flex flex-col items-center justify-center text-brand-400 hover:text-primary-600 transition-all cursor-pointer snap-start">
            <Plus className="w-12 h-12 mb-3 bg-brand-50 rounded-full p-3" />
            <span className="font-semibold text-sm">Create New Group</span>
          </div>
        </div>
      </section>

      {/* Recent Activity Feed */}
      <section className="mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-brand-900 font-heading">Recent Activity</h3>
            <p className="text-xs text-brand-500 font-medium">Synced from groups & individuals</p>
          </div>
        </div>
        <div className="card p-0 border-brand-100 overflow-hidden bg-white shadow-soft">
          {globalHistory.length === 0 ? (
            <div className="p-10 text-center text-brand-400 font-medium">No recent activity</div>
          ) : (
            <div className="divide-y divide-brand-100/50">
              {globalHistory.map((item, idx) => (
                <div 
                  key={idx} 
                  className="p-4 hover:bg-brand-50 transition-colors flex items-center justify-between cursor-pointer group"
                  onClick={() => {
                    const path = item.source === 'group' ? `/groups/${item.groupId}` : `/individual/${item.contact || item.source === 'personal' ? '' : item.contact}`;
                    if (path.length > 12) navigate(path);
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner ${item.source === 'group' ? 'bg-blue-50 text-blue-500 border-blue-100' : item.source === 'individual' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-purple-50 text-purple-500 border-purple-100'}`}>
                      {item.source === 'group' ? <Users className="w-5 h-5" /> : item.source === 'individual' ? <User className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-900 text-sm group-hover:text-primary-600 transition-colors">{item.title || item.description}</h4>
                      <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mt-0.5">
                        {item.groupName || item.contact || 'Personal'} • {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold font-heading text-base ${item.type === 'income' ? 'text-emerald-500' : 'text-brand-900'}`}>
                      {item.type === 'income' ? '+' : ''}{store.currency()}{Math.abs(item.amount).toFixed(2)}
                    </p>
                    <p className="text-[9px] font-extrabold text-brand-400 uppercase tracking-[0.1em]">{item.source}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Floating Action Button */}
      <button 
        className="md:hidden fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-full shadow-glow flex items-center justify-center z-40 active:scale-95 transition-transform"
        onClick={() => setShowAddChoice(true)}
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Splitwise-style Add Expense Flow */}
      {showAddChoice && (
        <div className="fixed inset-0 bg-brand-950/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in text-left">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-8 w-full max-w-lg shadow-2xl border border-white/20 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand-50 to-white -z-10" />
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold font-heading text-brand-900">Add New Expense</h2>
                <p className="text-sm font-medium text-brand-500">Choose the context for this record</p>
              </div>
              <button 
                onClick={() => { setShowAddChoice(false); setChoiceType(null); setSearchTerm(''); }}
                className="p-2 bg-brand-100 text-brand-500 hover:text-brand-900 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!choiceType ? (
              <div className="grid grid-cols-2 gap-4 animate-fade-in">
                <button 
                  onClick={() => handleChoice('individual')}
                  className="flex flex-col items-center justify-center p-8 bg-white border border-brand-100 rounded-[2rem] hover:shadow-glow hover:border-primary-300 hover:-translate-y-1 transition-all group"
                >
                  <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                    <User className="w-8 h-8" />
                  </div>
                  <span className="font-bold text-brand-800">Individual</span>
                  <span className="text-[10px] uppercase font-bold text-brand-400 mt-1 tracking-widest">Peer-to-Peer</span>
                </button>
                <button 
                  onClick={() => handleChoice('group')}
                  className="flex flex-col items-center justify-center p-8 bg-white border border-brand-100 rounded-[2rem] hover:shadow-glow hover:border-primary-300 hover:-translate-y-1 transition-all group"
                >
                  <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                    <Users className="w-8 h-8" />
                  </div>
                  <span className="font-bold text-brand-800">Group</span>
                  <span className="text-[10px] uppercase font-bold text-brand-400 mt-1 tracking-widest">Shared Bills</span>
                </button>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="flex items-center space-x-2 mb-4">
                  <button onClick={() => { setChoiceType(null); setSearchTerm(''); }} className="text-primary-600 text-[10px] font-bold uppercase tracking-widest hover:underline">← Back to Type</button>
                </div>
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-300" />
                  <input 
                    type="text" 
                    placeholder={`Search ${choiceType === 'group' ? 'groups' : 'contacts'}...`}
                    className="input pl-12 py-3 bg-brand-50/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {filteredItems.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => {
                        setShowAddChoice(false);
                        const path = choiceType === 'group' ? `/groups/${item.id}` : `/individual/${item.name}`;
                        navigate(path);
                      }}
                      className="flex items-center justify-between p-4 bg-white border border-brand-100 rounded-2xl hover:border-primary-400 hover:bg-primary-50/50 transition-all cursor-pointer group shadow-sm"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${choiceType === 'group' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-brand-900">{item.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-brand-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                  ))}
                  {filteredItems.length === 0 && (
                     <div className="text-center py-8 text-brand-400 font-medium">No results found.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
