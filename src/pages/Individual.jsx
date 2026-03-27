import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowUpRight, TrendingDown, Users2, Search, UserPlus, Edit2, RotateCw, Globe } from 'lucide-react';
import { useStore } from '../store';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

function IndividualPage() {
  const navigate = useNavigate();
  const store = useStore();
  const [members, setMembers] = useState([]);
  const [ious, setIous] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [newMember, setNewMember] = useState({ name: '', email: '', phone: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setMembers(store.members());
    const storedIous = localStorage.getItem('rokka_individual_ious');
    setIous(storedIous ? JSON.parse(storedIous) : []);
  }, [store]);

  const handleAddMember = () => {
    if (!newMember.name) return;
    if (editingMember) {
      store.updateMember(editingMember.id, newMember);
    } else {
      store.addMember(newMember);
    }
    setMembers(store.members());
    setShowAddMember(false);
    setEditingMember(null);
    setNewMember({ name: '', email: '', phone: '' });
  };

  const handleDeleteMember = (e, member) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${member.name}?`)) {
      store.deleteMember(member.id);
      setMembers(store.members());
    }
  };

  const handleEditMember = (e, member) => {
    e.stopPropagation();
    setEditingMember(member);
    setNewMember({ name: member.name, email: member.email || '', phone: member.phone || '' });
    setShowAddMember(true);
  };

  const handleGoogleSync = async () => {
    setSyncing(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;

      const response = await fetch('https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.connections) {
        data.connections.forEach(person => {
          const name = person.names?.[0]?.displayName;
          const email = person.emailAddresses?.[0]?.value;
          const phone = person.phoneNumbers?.[0]?.value;
          if (name) {
            store.addMember({ name, email, phone });
          }
        });
        setMembers(store.members());
        alert('Contacts synced successfully!');
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to sync contacts. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const getContactBalance = (contactName) => {
    // 1. Direct IOUs
    const contactIous = ious.filter(i => i.contact === contactName);
    let balance = contactIous.reduce((acc, curr) => {
      return curr.type === 'lent' ? acc + curr.amount : acc - curr.amount;
    }, 0);

    // 2. Group balances involving this contact
    // contactMember.amount: positive = they are owed (creditor), negative = they owe (debtor)
    // From your perspective: negate it → positive means they owe you
    store.groups().forEach(group => {
      if (!Array.isArray(group.members)) return;
      const contactMember = group.members.find(m => m.name === contactName);
      if (contactMember) {
        balance += -(contactMember.amount || 0);
      }
    });

    return balance;
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvatar = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  const getAvatarColor = (name) => {
    const colors = [
      'bg-primary-50 text-primary-600 border-primary-100',
      'bg-blue-50 text-blue-600 border-blue-100',
      'bg-emerald-50 text-emerald-600 border-emerald-100',
      'bg-amber-50 text-amber-600 border-amber-100',
      'bg-rose-50 text-rose-600 border-rose-100',
    ];
    return colors[name.length % colors.length];
  };

  const totalNet = members.reduce((acc, m) => acc + getContactBalance(m.name), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-900 font-heading tracking-tight">Your Network</h1>
          <p className="text-sm text-brand-500 mt-1 font-medium tracking-wide">Manage individual IOUs and balances</p>
        </div>
        <div className="flex items-center space-x-3">
           <div className={`px-4 py-2 rounded-xl border font-bold flex items-center space-x-2 shadow-sm ${totalNet >= 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
              <span className="text-[10px] uppercase tracking-widest opacity-70">Total Net:</span>
              <span>{totalNet >= 0 ? '+' : ''}{store.currency()}{Math.abs(totalNet).toFixed(2)}</span>
           </div>
           <button 
            disabled={syncing}
            onClick={handleGoogleSync}
            className="p-2.5 bg-white text-brand-500 hover:text-primary-600 border border-brand-100 rounded-xl transition-all shadow-sm flex items-center space-x-2 hover:bg-primary-50 active:scale-95 disabled:opacity-50"
            title="Sync with Google"
          >
            <RotateCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Sync</span>
          </button>
           <button 
            className="btn-primary flex items-center space-x-2 shadow-glow" 
            onClick={() => setShowAddMember(true)}
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Contact</span>
          </button>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-300" />
          <input 
            type="text" 
            placeholder="Search contacts..." 
            className="input pl-12 py-3 bg-white shadow-soft border-brand-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Contacts Grid */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-20 bg-white/50 border border-brand-100 border-dashed rounded-[3rem]">
          <Users2 className="w-16 h-16 mx-auto text-brand-200 mb-4" />
          <p className="text-brand-500 font-bold text-lg mb-2">No contacts found</p>
          <button onClick={() => setShowAddMember(true)} className="text-primary-600 font-bold hover:underline">Add your first connection</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => {
            const balance = getContactBalance(member.name);
            return (
              <div 
                key={member.id}
                onClick={() => navigate(`/individual/${member.name}`)}
                className="card border-brand-100 p-5 hover:shadow-glow hover:-translate-y-1 transition-all cursor-pointer group bg-white relative overflow-hidden"
              >
                {/* Visual accent */}
                <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 ${balance >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                
                <div className="flex items-center space-x-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-heading font-bold text-xl border shadow-soft transition-transform group-hover:scale-110 ${getAvatarColor(member.name)}`}>
                    {getAvatar(member.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-brand-900 text-lg truncate font-heading">{member.name}</h3>
                    <p className="text-xs font-semibold text-brand-400 truncate">{member.email || member.phone || 'Personal Network'}</p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button 
                      onClick={(e) => handleEditMember(e, member)}
                      className="p-2 text-brand-300 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteMember(e, member)}
                      className="p-2 text-brand-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-brand-50 border border-brand-100/50">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400">Balance</span>
                  <div className="flex items-center space-x-1.5">
                    {balance > 0 ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" /> : balance < 0 ? <TrendingDown className="w-3.5 h-3.5 text-rose-500" /> : null}
                    <span className={`font-bold font-heading ${balance > 0 ? 'text-emerald-500' : balance < 0 ? 'text-rose-500' : 'text-brand-400'}`}>
                      {balance === 0 ? 'Settled' : `${balance > 0 ? '+' : ''}${store.currency()}${Math.abs(balance).toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-brand-950/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in text-left">
          <div className="bg-white rounded-[2rem] p-6 lg:p-8 w-full max-w-md shadow-2xl border border-white/20">
            <h2 className="text-2xl font-bold font-heading text-brand-900 mb-6">Add New Contact</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-brand-700 mb-1.5 ml-1">Full Name</label>
                <input
                  type="text"
                  className="input"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="e.g., Sarah Jenkins"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-700 mb-1.5 ml-1">Email Address</label>
                <input
                  type="email"
                  className="input"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="sarah@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-700 mb-1.5 ml-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  className="input"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-8">
              <button
                className="px-5 py-2.5 text-brand-600 hover:bg-brand-50 font-semibold rounded-xl transition-colors"
                onClick={() => { setShowAddMember(false); setEditingMember(null); setNewMember({ name: '', email: '', phone: '' }); }}
              >
                Cancel
              </button>
              <button
                className="btn-primary shadow-glow"
                onClick={handleAddMember}
              >
                {editingMember ? 'Update Contact' : 'Save Contact'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IndividualPage;
