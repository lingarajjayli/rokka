import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Plus, TrendingDown, ArrowUpRight, MoreVertical, Trash2 } from 'lucide-react';
import { useStore } from '../store';

function IndividualChat() {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const store = useStore();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('lent'); // 'lent' or 'owe'
  const [refresh, setRefresh] = useState(0);
  const scrollRef = useRef(null);

  // Fetch unified transaction history (Individual + Group)
  useEffect(() => {
    // 1. Fetch Individual IOUs
    const stored = localStorage.getItem('rokka_individual_ious');
    const allIous = (stored ? JSON.parse(stored) : []).filter(i => i.contact === contactId);
    
    // 2. Fetch Relevant Group Expenses
    const groups = store.groups();
    const groupTransactions = [];
    
    groups.forEach(group => {
      (group.history || []).forEach(tx => {
        const membersCount = Array.isArray(group.members) ? group.members.length : group.members;
        
        if (tx.type === 'settlement') {
          // Check if this settlement involves "You" and the contact
          if ((tx.paidBy === 'You' && tx.to === contactId) || (tx.paidBy === contactId && tx.to === 'You')) {
            groupTransactions.push({
              ...tx,
              source: 'group',
              groupName: group.name,
              // For individual view, 'You paid Mike' looks like 'Lent'
              type: tx.paidBy === 'You' ? 'lent' : 'owe',
              description: `Settlement in ${group.name}`
            });
          }
        } else {
          // Regular expense
          let amountForContact = 0;
          let involvesContact = false;
          
          if (tx.paidBy === 'You') {
            // How much contactId owes "You"
            if (tx.splitType === 'equal') {
              amountForContact = tx.amount / membersCount;
            } else {
              amountForContact = tx.splitDetails?.[contactId] || 0;
            }
            if (amountForContact > 0) {
              groupTransactions.push({
                ...tx,
                source: 'group',
                groupName: group.name,
                type: 'lent',
                amount: amountForContact,
                description: `${tx.title} (${group.name})`
              });
            }
          } else if (tx.paidBy === contactId) {
            // How much "You" owe contactId
            if (tx.splitType === 'equal') {
              amountForContact = tx.amount / membersCount;
            } else {
              amountForContact = tx.splitDetails?.['You'] || 0;
            }
            if (amountForContact > 0) {
              groupTransactions.push({
                ...tx,
                source: 'group',
                groupName: group.name,
                type: 'owe',
                amount: amountForContact,
                description: `${tx.title} (${group.name})`
              });
            }
          }
        }
      });
    });

    const unified = [...allIous, ...groupTransactions];
    setMessages(unified.sort((a, b) => new Date(a.date) - new Date(b.date)));
  }, [contactId, store, refresh]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!amount || !inputText) return;
    
    const newMessage = {
      id: Date.now(),
      contact: contactId,
      amount: parseFloat(amount),
      type: type,
      description: inputText,
      date: new Date().toISOString().split('T')[0]
    };

    // Save to individual IOUs
    const stored = localStorage.getItem('rokka_individual_ious');
    const allIous = stored ? JSON.parse(stored) : [];
    const updated = [...allIous, newMessage];
    localStorage.setItem('rokka_individual_ious', JSON.stringify(updated));

    // Also link to personal transactions ledger
    // 'lent' = you gave money (income from their side, expense for you tracking-wise)
    // 'owe' = you owe them (expense for you)
    store.addTransaction({
      type: type === 'lent' ? 'expense' : 'expense',
      category: store.suggestCategory(inputText),
      account: `IOU: ${contactId}`,
      amount: parseFloat(amount),
      date: newMessage.date,
      source: 'individual',
      contactId,
      iouType: type,
    });
    
    setMessages([...messages, newMessage]);
    setInputText('');
    setAmount('');
    setRefresh(prev => prev + 1);
  };

  const handleDelete = (e, msg) => {
    e.stopPropagation();
    if (window.confirm('Delete this transaction?')) {
      // Find the global transaction ID if it exists
      // In this app, many IDs are Date.now() or 101, 102...
      // deleteTransaction handles group/individual cases by searching by date/amount if ID doesn't match perfectly
      store.deleteTransaction(msg.id);
      setRefresh(prev => prev + 1);
    }
  };

  const totalBalance = messages.reduce((acc, curr) => {
    return curr.type === 'lent' ? acc + curr.amount : acc - curr.amount;
  }, 0);

  const groupMessagesByMonth = (msgs) => {
    const sorted = [...msgs].sort((a, b) => new Date(a.date) - new Date(b.date));
    const grouped = {};
    sorted.forEach(msg => {
      const date = new Date(msg.date);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!grouped[monthYear]) grouped[monthYear] = [];
      grouped[monthYear].push(msg);
    });
    return grouped;
  };

  const groupedMessages = groupMessagesByMonth(messages);

  return (
    <div className="flex flex-col h-screen bg-brand-50 animate-fade-in max-w-2xl mx-auto border-x border-brand-100 shadow-xl">
      {/* Header */}
      <div className="glass-panel sticky top-0 z-10 px-4 py-3 flex items-center justify-between border-b border-brand-100 shadow-sm">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/individual')} className="p-2 hover:bg-brand-50 rounded-full text-brand-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white font-bold shadow-soft">
              {contactId?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-brand-900 font-heading leading-tight">{contactId}</h2>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${totalBalance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {totalBalance >= 0 ? 'Owes you' : 'You owe'} {store.currency()}{Math.abs(totalBalance).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-brand-50 rounded-full text-brand-400">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-8 scroll-smooth bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
        {Object.keys(groupedMessages).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-50">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-soft">
              <Plus className="w-8 h-8 text-brand-300" />
            </div>
            <p className="text-sm font-medium text-brand-500">No transactions yet.<br />Start by clicking one of the options below.</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([month, msgs]) => (
            <div key={month} className="space-y-6">
              <div className="flex justify-center">
                <span className="bg-white px-3 py-1 rounded-full text-[9px] font-bold text-brand-400 uppercase tracking-widest border border-brand-100 shadow-sm">{month}</span>
              </div>
              {msgs.map((item) => (
                <div key={item.id} className={`flex flex-col group ${item.type === 'lent' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-4 shadow-soft border transition-all ${
                    item.type === 'lent' 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-900' 
                    : 'bg-white border-brand-200 text-brand-900'
                  }`}>
                    <div className="flex items-center justify-between gap-4 mb-2">
                       <div className="flex items-center space-x-2">
                         <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${item.source === 'group' ? 'bg-blue-100 text-blue-600' : 'bg-brand-100 text-brand-600'}`}>
                           {item.source === 'group' ? 'Group' : 'Direct'}
                         </span>
                         <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                           {item.type === 'lent' ? 'They Owe' : 'You Owe'}
                         </span>
                       </div>
                       <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-medium opacity-40">
                          {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <button 
                          onClick={(e) => handleDelete(e, item)}
                          className="p-1 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                       </div>
                    </div>
                    <h3 className="text-xl font-bold font-heading mb-1">{store.currency()}{item.amount.toFixed(2)}</h3>
                    <p className="text-sm opacity-80 leading-relaxed">{item.description}</p>
                    {item.groupName && (
                       <div className="mt-2 pt-2 border-t border-black/5 flex items-center text-[9px] font-bold text-brand-400 uppercase tracking-widest">
                          <Plus className="w-3 h-3 mr-1 opacity-50" /> {item.groupName}
                       </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-brand-100 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)]">
        <div className="flex items-center space-x-2 mb-3">
          <button 
            onClick={() => setType('lent')}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl border transition-all ${
              type === 'lent' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-inner' : 'bg-brand-50 text-brand-400 border-transparent hover:bg-brand-100'
            }`}
          >
            I Lent
          </button>
          <button 
            onClick={() => setType('owe')}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl border transition-all ${
              type === 'owe' ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-inner' : 'bg-brand-50 text-brand-400 border-transparent hover:bg-brand-100'
            }`}
          >
            I Owe
          </button>
        </div>
        <div className="flex items-end space-x-2 bg-brand-50 p-2 rounded-2xl border border-brand-100">
          <div className="flex flex-col flex-1 pl-2 pb-1">
            <input 
              type="number" 
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-xl font-bold font-heading text-brand-900 placeholder:text-brand-300 w-full"
            />
            <input 
              type="text" 
              placeholder="For dinner, drinks..."
              value={inputText}
              onChange={(e) => {
                const desc = e.target.value;
                setInputText(desc);
                // IndividualChat doesn't have a category picker yet, but we use it when adding to global ledger
              }}
              className="bg-transparent border-none focus:ring-0 text-sm font-medium text-brand-600 placeholder:text-brand-300 w-full"
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={!amount || !inputText}
            className={`p-3 rounded-xl transition-all ${
              !amount || !inputText 
              ? 'bg-brand-200 text-white cursor-not-allowed' 
              : 'bg-primary-600 text-white shadow-glow hover:translate-y-[-1px] active:scale-95'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-2 text-center">
            <p className="text-[10px] text-brand-300 font-bold uppercase tracking-widest">Tap to change type above</p>
        </div>
      </div>
    </div>
  );
}

export default IndividualChat;
