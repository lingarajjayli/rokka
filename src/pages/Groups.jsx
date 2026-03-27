import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { Plus, Trash2, Users } from 'lucide-react'

function GroupsPage() {
  const [groups, setGroups] = useState([])
  const [allMembers, setAllMembers] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newGroup, setNewGroup] = useState({ name: '', spent: '', members: [], splitType: 'Equal' })
  const navigate = useNavigate()
  const store = useStore()

  useEffect(() => {
    setGroups(store.groups())
    setAllMembers(store.members())
  }, [store])

  const toggleMember = (member) => {
    const isSelected = newGroup.members.some(m => m.id === member.id)
    if (isSelected) {
      setNewGroup({
        ...newGroup,
        members: newGroup.members.filter(m => m.id !== member.id)
      })
    } else {
      setNewGroup({
        ...newGroup,
        members: [...newGroup.members, { id: member.id, name: member.name, amount: 0, paid: false }]
      })
    }
  }

  const handleAddGroup = () => {
    // Automatically include 'You' if not present
    const finalMembers = [...newGroup.members];
    if (!finalMembers.some(m => m.name === 'You')) {
      finalMembers.unshift({ id: 'you', name: 'You', amount: 0, paid: true });
    }

    store.addGroup({
      name: newGroup.name,
      spent: parseFloat(newGroup.spent) || 0,
      members: finalMembers,
      splitType: newGroup.splitType,
      history: [],
    })
    setShowAddForm(false)
    setNewGroup({ name: '', spent: '', members: [], splitType: 'Equal' })
    setGroups(store.groups())
  }

  const handleDeleteGroup = (groupId) => {
    store.deleteGroup(groupId)
    setGroups(store.groups())
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in pb-24 md:pb-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-900 font-heading tracking-tight">Financial Groups</h1>
          <p className="text-sm text-brand-500 mt-1 font-medium tracking-wide">Shared expenses and split bills</p>
        </div>
        <button
          className="btn-primary flex items-center space-x-2 shadow-glow"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Create Group</span>
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-20 bg-white/50 border border-brand-100 border-dashed rounded-[3rem]">
          <Users className="w-16 h-16 mx-auto text-brand-200 mb-4" />
          <p className="text-brand-500 font-bold text-lg mb-2">No groups created yet</p>
          <button onClick={() => setShowAddForm(true)} className="text-primary-600 font-bold hover:underline">Start a new group</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              className="card border-brand-100 hover:shadow-glow hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden bg-white"
              onClick={() => navigate(`/groups/${group.id}`)}
            >
              {/* Visual accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-all group-hover:bg-primary-500/20" />
              
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl ${
                  group.splitType === 'Equal' ? 'bg-primary-50 text-primary-600 border border-primary-100' :
                  group.splitType === 'Percent' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                  'bg-blue-50 text-blue-600 border border-blue-100'
                } flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform`}>
                  <Users className="w-7 h-7" />
                </div>
                <button
                  className="p-2 text-brand-400 hover:text-rose-500 transition-colors bg-white rounded-xl border border-brand-100 opacity-0 group-hover:opacity-100 shadow-sm"
                  onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.id) }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-brand-900 font-heading tracking-tight mb-1 truncate">{group.name}</h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-400 mb-6">
                {Array.isArray(group.members) ? group.members.length : group.members} Members ACTIVE
              </p>
              
              <div className="bg-brand-50 rounded-2xl p-4 border border-brand-100/50 flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-brand-400 tracking-wider mb-1">Total Spent</p>
                  <p className="font-heading font-bold text-brand-900 text-lg tracking-tight">{store.currency()}{group.spent?.toFixed(2)}</p>
                </div>
                <div className="bg-white px-3 py-1 rounded-lg text-[10px] font-bold text-primary-600 border border-primary-100 shadow-sm uppercase tracking-widest">
                  {group.splitType}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Group Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-brand-950/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in text-left">
          <div className="bg-white rounded-[2rem] p-6 lg:p-8 w-full max-w-lg shadow-2xl border border-white/20">
            <h2 className="text-2xl font-bold font-heading text-brand-900 mb-6">Create New Group</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-brand-700 mb-1.5 ml-1">Group Name</label>
                <input
                  type="text"
                  className="input"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="e.g., Weekend Trip"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-700 mb-1.5 ml-1">Initial Total Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-brand-400">{store.currency()}</span>
                  <input
                    type="number"
                    className="input pl-8"
                    value={newGroup.spent}
                    onChange={(e) => setNewGroup({ ...newGroup, spent: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-brand-700 mb-3 ml-1">Add Members from Individual</label>
                <div className="max-h-48 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                  {allMembers.map((member) => (
                    <div 
                      key={member.id}
                      onClick={() => toggleMember(member)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        newGroup.members.some(m => m.id === member.id)
                        ? 'bg-primary-50 border-primary-300 shadow-sm'
                        : 'bg-brand-50/50 border-brand-100 hover:border-brand-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          newGroup.members.some(m => m.id === member.id) ? 'bg-primary-600 text-white' : 'bg-brand-200 text-brand-600'
                        }`}>
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-brand-900 text-sm">{member.name}</span>
                      </div>
                      {newGroup.members.some(m => m.id === member.id) && (
                        <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                          <Plus className="w-3 h-3 text-white rotate-45" />
                        </div>
                      )}
                    </div>
                  ))}
                  {allMembers.length === 0 && (
                    <div className="text-center py-4 bg-brand-50 border border-brand-100 border-dashed rounded-xl">
                      <p className="text-xs text-brand-400">No contacts found to add.</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-700 mb-1.5 ml-1">Split Strategy</label>
                <div className="relative">
                  <select
                    className="input appearance-none bg-white pr-10"
                    value={newGroup.splitType}
                    onChange={(e) => setNewGroup({ ...newGroup, splitType: e.target.value })}
                  >
                    <option value="Equal">Equal</option>
                    <option value="Percent">Percent</option>
                    <option value="Exact">Exact</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-8">
              <button
                className="px-5 py-2.5 text-brand-600 hover:bg-brand-50 font-semibold rounded-xl transition-colors"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary shadow-glow"
                onClick={handleAddGroup}
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GroupsPage