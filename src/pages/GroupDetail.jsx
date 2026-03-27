import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calculator, Plus, CheckCircle2, TrendingDown, ArrowRight, X, Utensils, Car, Home, ShoppingBag, Film, BadgeCent, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../store';

function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const store = useStore();
  const [group, setGroup] = useState(null);
  const [showSimplify, setShowSimplify] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [newExpense, setNewExpense] = useState({ 
    title: '', 
    amount: '', 
    paidBy: 'You', 
    date: new Date().toISOString().split('T')[0],
    category: 'other',
    splitType: 'Equal'
  });
  const [splitDetails, setSplitDetails] = useState({});
  const [showConfirmSettlement, setShowConfirmSettlement] = useState(null);

  const loadGroup = () => {
    const allGroups = store.groups();
    const currentGroup = allGroups.find(g => g.id === parseInt(groupId) || g.name === groupId);
    setGroup(currentGroup);
  };

  useEffect(() => {
    loadGroup();
  }, [groupId, store]);

  useEffect(() => {
    // Reset split details when amount or group changes
    if (group && newExpense.amount) {
      const amount = parseFloat(newExpense.amount) || 0;
      if (newExpense.splitType === 'Equal') {
        const share = amount / group.members.length;
        const details = {};
        group.members.forEach(m => details[m.name] = share);
        setSplitDetails(details);
      }
    }
  }, [newExpense.amount, newExpense.splitType, group]);

  // Splitwise Debt Simplification Algorithm (Greedy)
  const simplifyDebts = (balances) => {
    const creditors = [];
    const debtors = [];
    for (const [person, amount] of Object.entries(balances)) {
      if (amount > 0.01) creditors.push({ person, amount });
      else if (amount < -0.01) debtors.push({ person, amount: Math.abs(amount) });
    }
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);
    const transactions = [];
    let i = 0, j = 0;
    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];
      const amount = Math.min(creditor.amount, debtor.amount);
      transactions.push({ from: debtor.person, to: creditor.person, amount });
      creditor.amount -= amount;
      debtor.amount -= amount;
      if (creditor.amount < 0.01) i++;
      if (debtor.amount < 0.01) j++;
    }
    return transactions;
  };

  const handleAddExpense = () => {
    if (!newExpense.title || !newExpense.amount) return;
    
    // Validate Split
    const totalAmount = parseFloat(newExpense.amount);
    const sum = Object.values(splitDetails).reduce((a, b) => a + b, 0);
    
    if (newExpense.splitType === 'Exact' && Math.abs(sum - totalAmount) > 0.01) {
      alert(`Total split (${sum.toFixed(2)}) must equal expense amount (${totalAmount.toFixed(2)})`);
      return;
    }
    if (newExpense.splitType === 'Percent' && Math.abs(sum - 100) > 0.01) {
      alert(`Total percentage (${sum.toFixed(2)}%) must equal 100%`);
      return;
    }

    const finalSplitDetails = { ...splitDetails };
    if (newExpense.splitType === 'Percent') {
      // Convert percent to actual amounts
      Object.keys(finalSplitDetails).forEach(name => {
        finalSplitDetails[name] = (finalSplitDetails[name] / 100) * totalAmount;
      });
    }

    const expenseData = {
      title: newExpense.title,
      amount: totalAmount,
      paidBy: newExpense.paidBy,
      date: newExpense.date,
      category: newExpense.category,
      splitType: newExpense.splitType,
      splitDetails: finalSplitDetails
    };
    store.addTransactionToGroup(parseInt(groupId), expenseData);
    setShowAddExpense(false);
    setNewExpense({ 
      title: '', 
      amount: '', 
      paidBy: 'You', 
      date: new Date().toISOString().split('T')[0],
      category: 'other',
      splitType: 'Equal'
    });
    setSplitDetails({});
    loadGroup();
  };

  const handleRecordSettlement = (settlement) => {
    const settlementData = {
      type: 'settlement',
      amount: settlement.amount,
      paidBy: settlement.from,
      to: settlement.to,
      date: new Date().toISOString().split('T')[0],
      title: `Settled up: ${settlement.from} to ${settlement.to}`,
      category: 'other'
    };
    store.addTransactionToGroup(parseInt(groupId), settlementData);
    setShowConfirmSettlement(null);
    loadGroup();
  };

  const handleLeaveGroup = () => {
    const result = store.leaveGroup(parseInt(groupId));
    if (result.success) {
      navigate('/groups');
    } else {
      alert(result.message);
    }
  };

  const handleDeleteTransaction = (e, txId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this transaction? This will revert all balance changes.')) {
      store.deleteTransaction(txId);
      loadGroup();
      setSelectedExpense(null);
    }
  };

  const getCategoryIcon = (catName) => {
    const cats = store.categories();
    const cat = cats[catName] || cats.other;
    const Icon = { Utensils, Car, Home, ShoppingBag, Film, BadgeCent }[cat.icon] || BadgeCent;
    return <Icon className={`w-5 h-5 ${cat.color}`} />;
  };

  const groupTransactionsByMonth = (txs) => {
    const sorted = [...txs].sort((a, b) => new Date(b.date) - new Date(a.date));
    const grouped = {};
    sorted.forEach(tx => {
      const date = new Date(tx.date);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!grouped[monthYear]) grouped[monthYear] = [];
      grouped[monthYear].push(tx);
    });
    return grouped;
  };

  // Build balances from group members
  const memberBalances = {};
  if (group?.members && Array.isArray(group.members)) {
    group.members.forEach(m => {
      memberBalances[m.name] = m.paid ? (group.spent / group.members.length) : -(m.amount || 0);
    });
  } else {
    memberBalances['You'] = 120.50;
    memberBalances['Others'] = -120.50;
  }

  const simplified = simplifyDebts(memberBalances);
  const currency = store.currency();
  const historyGrouped = groupTransactionsByMonth(group?.history || []);
  const memberNames = Array.isArray(group?.members) ? group.members.map(m => m.name) : ['You'];

  if (!group) return <div className="p-8 text-center text-brand-500 font-medium animate-pulse">Loading group details...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/groups')} className="p-2 bg-white hover:bg-brand-50 rounded-xl border border-brand-100 text-brand-600 transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-brand-900 font-heading tracking-tight">{group.name}</h1>
            <p className="text-sm text-brand-500 font-medium">{Array.isArray(group.members) ? group.members.length : group.members} members • {group.splitType} Split</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            className="p-2.5 bg-white hover:bg-rose-50 rounded-xl border border-brand-100 text-rose-500 transition-all shadow-sm"
            title="Leave Group"
            onClick={handleLeaveGroup}
          >
            <X className="w-5 h-5" />
          </button>
          <button
            className="btn-primary flex items-center space-x-2 shadow-glow py-2.5"
            onClick={() => setShowAddExpense(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Group Stats & Balances */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card bg-gradient-to-br from-primary-600 to-primary-500 text-white border-none shadow-glow p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-1">Group Total Spent</p>
            <h2 className="text-4xl font-bold font-heading">{currency}{group.spent?.toFixed(2)}</h2>
            <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center text-xs font-bold uppercase tracking-widest opacity-90">
              <span>Your share:</span>
              <span className="text-lg font-heading">{currency}{(group.spent / (Array.isArray(group.members) ? group.members.length : (group.members || 1))).toFixed(2)}</span>
            </div>
          </div>

          <div className="card border-brand-100">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-4">Member Balances</h3>
            <div className="space-y-3">
              {Array.isArray(group.members) ? group.members.map((m) => (
                <div key={m.name} className="flex justify-between items-center p-3 rounded-xl bg-brand-50 border border-brand-100/50">
                  <span className="font-bold text-brand-900">{m.name}</span>
                  <span className={`font-bold ${m.paid ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {m.paid ? `+${currency}${m.amount?.toFixed(2)}` : `-${currency}${m.amount?.toFixed(2)}`}
                  </span>
                </div>
              )) : (
                <div className="text-sm text-brand-400 font-medium text-center py-4">No member data available</div>
              )}
            </div>
          </div>
        </div>

        {/* Right: History & Optimization */}
        <div className="lg:col-span-2 space-y-6">
          {/* Optimization Section */}
          <div className={`card border-brand-100 overflow-hidden transition-all duration-500 ${showSimplify ? 'ring-2 ring-primary-500/20' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-primary-600" />
                <h3 className="font-bold text-brand-900 font-heading">Debt Optimization</h3>
              </div>
              <button
                onClick={() => setShowSimplify(!showSimplify)}
                className="text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100 transition-colors"
              >
                {showSimplify ? 'Hide Details' : 'Settle Up'}
              </button>
            </div>
            {!showSimplify ? (
              <p className="text-sm text-brand-500 font-medium">Click "Settle Up" to see the most efficient way to balance all debts in this group.</p>
            ) : (
              <div className="space-y-3 animate-fade-in">
                {simplified.length === 0 ? (
                  <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-bold">Group is all settled up!</span>
                  </div>
                ) : (
                  simplified.map((tx, idx) => (
                    <div key={idx} className="flex flex-col bg-brand-50 p-4 rounded-xl border border-brand-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-brand-900 bg-white px-3 py-1 rounded-lg shadow-sm border border-brand-100">{tx.from}</span>
                          <ArrowRight className="w-4 h-4 text-primary-400" />
                          <span className="font-bold text-brand-900 bg-white px-3 py-1 rounded-lg shadow-sm border border-brand-100">{tx.to}</span>
                        </div>
                        <span className="text-lg font-bold text-primary-600 font-heading tracking-tight">{currency}{tx.amount.toFixed(2)}</span>
                      </div>
                      <button 
                        onClick={() => setShowConfirmSettlement(tx)}
                        className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-[0.1em] rounded-lg transition-colors shadow-sm"
                      >
                        Record Payment
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* History Section */}
          <div className="card border-brand-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-brand-900 font-heading text-lg">Group History</h3>
              <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">{group.history?.length || 0} transactions</span>
            </div>
            {Object.keys(historyGrouped).length === 0 ? (
              <div className="text-center py-10 bg-brand-50 border border-brand-100 border-dashed rounded-2xl">
                <TrendingDown className="w-10 h-10 mx-auto text-brand-300 mb-3" />
                <p className="font-bold text-brand-500">No expenses yet</p>
                <p className="text-xs text-brand-400 mt-1">Click "Add Expense" to log the first one</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(historyGrouped).map(([month, txs]) => (
                  <div key={month} className="animate-fade-in">
                    <h4 className="text-[10px] font-extrabold text-brand-400 uppercase tracking-[0.2em] mb-4 border-b border-brand-100 pb-2">{month}</h4>
                    <div className="space-y-1">
                      {txs.map((tx) => (
                        <div 
                          key={tx.id} 
                          onClick={() => setSelectedExpense(selectedExpense === tx.id ? null : tx.id)}
                          className={`transaction-item hover:bg-brand-50/50 cursor-pointer transition-all ${selectedExpense === tx.id ? 'bg-brand-50 ring-1 ring-brand-200' : ''}`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 border shadow-inner ${tx.type === 'settlement' ? 'bg-emerald-50' : (store.categories()[tx.category]?.bg || 'bg-brand-50')}`}>
                                {tx.type === 'settlement' ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                ) : (
                                  getCategoryIcon(tx.category)
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-brand-900">{tx.title}</p>
                                <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mt-1">
                                  {tx.type === 'settlement' ? `${tx.paidBy} settled with ${tx.to}` : `Paid by ${tx.paidBy}`} • {new Date(tx.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-6">
                              <div className="text-right">
                                <p className="font-bold text-brand-900 font-heading text-lg tracking-tight">{currency}{tx.amount.toFixed(2)}</p>
                                <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest mt-1">Split {tx.splitType || group.splitType}</p>
                              </div>
                              <button 
                                onClick={(e) => handleDeleteTransaction(e, tx.id)}
                                className="p-2 text-brand-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                title="Delete Transaction"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              {selectedExpense === tx.id ? <ChevronUp className="w-4 h-4 text-brand-300" /> : <ChevronDown className="w-4 h-4 text-brand-300" />}
                            </div>
                          </div>
                          
                          {/* Expanded Split Detail */}
                          {selectedExpense === tx.id && (
                            <div className="col-span-full mt-4 pt-4 border-t border-brand-100 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
                              {Object.entries(tx.splitDetails || {}).map(([name, amount]) => (
                                <div key={name} className="bg-white p-3 rounded-xl border border-brand-100">
                                  <p className="text-[9px] font-bold text-brand-400 uppercase tracking-wider mb-1">{name}</p>
                                  <p className="font-bold text-brand-900">{currency}{amount.toFixed(2)}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-brand-950/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 w-full max-w-md shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-heading text-brand-900">Add Expense</h2>
              <button onClick={() => setShowAddExpense(false)} className="p-2 bg-brand-100 text-brand-500 hover:text-brand-900 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-brand-700 mb-1.5 ml-1">Description</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Dinner, Hotel, Tickets"
                  value={newExpense.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const suggested = store.suggestCategory(title);
                    setNewExpense({ ...newExpense, title, category: suggested !== 'other' ? suggested : newExpense.category });
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-700 mb-1.5 ml-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-brand-400">{currency}</span>
                  <input
                    type="number"
                    className="input pl-8 font-heading text-lg"
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-brand-700 mb-1.5 ml-1">Category</label>
                  <select
                    className="input appearance-none bg-white"
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  >
                    {Object.entries(store.categories()).map(([key, val]) => (
                      <option key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-700 mb-1.5 ml-1">Date</label>
                  <input
                    type="date"
                    className="input"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-semibold text-brand-700 mb-1.5 ml-1">Paid By</label>
                   <select
                     className="input appearance-none bg-white"
                     value={newExpense.paidBy}
                     onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
                   >
                     {memberNames.map(name => (
                       <option key={name} value={name}>{name}</option>
                     ))}
                   </select>
                </div>
               <div>
                  <label className="block text-sm font-semibold text-brand-700 mb-1.5 ml-1">Split Type</label>
                   <select
                     className="input appearance-none bg-white"
                     value={newExpense.splitType}
                     onChange={(e) => setNewExpense({ ...newExpense, splitType: e.target.value })}
                   >
                     <option value="Equal">Equal</option>
                     <option value="Exact">Exact</option>
                     <option value="Percent">Percent</option>
                   </select>
                </div>
              </div>

              {/* Dynamic Split Details */}
              {(newExpense.splitType === 'Exact' || newExpense.splitType === 'Percent') && (
                <div className="bg-brand-50 rounded-2xl p-4 border border-brand-100 animate-slide-up">
                  <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-3 px-1 flex justify-between">
                    <span>Split by {newExpense.splitType}</span>
                    <span className={Math.abs((Object.values(splitDetails).reduce((a,b)=>a+b,0)) - (newExpense.splitType === 'Exact' ? (parseFloat(newExpense.amount)||0) : 100)) < 0.01 ? 'text-emerald-500' : 'text-rose-500'}>
                      {newExpense.splitType === 'Exact' ? `Remaining: ${currency}${(parseFloat(newExpense.amount)||0 - Object.values(splitDetails).reduce((a,b)=>a+b,0)).toFixed(2)}` : `Total: ${Object.values(splitDetails).reduce((a,b)=>a+b,0).toFixed(1)}%`}
                    </span>
                  </p>
                  <div className="space-y-3">
                    {group.members.map(member => (
                      <div key={member.name} className="flex items-center space-x-3 bg-white p-2 rounded-xl border border-brand-100/50">
                        <span className="flex-1 text-sm font-bold text-brand-700 ml-2">{member.name}</span>
                        <div className="relative w-28">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-400">
                            {newExpense.splitType === 'Exact' ? currency : '%'}
                          </span>
                          <input
                            type="number"
                            className="w-full bg-brand-50 border-none rounded-lg py-1.5 pl-7 pr-3 text-sm font-bold text-brand-900 focus:ring-1 focus:ring-primary-500"
                            value={splitDetails[member.name] || ''}
                            placeholder="0"
                            onChange={(e) => setSplitDetails({
                              ...splitDetails,
                              [member.name]: parseFloat(e.target.value) || 0
                            })}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end space-x-3 mt-8">
              <button
                className="px-5 py-2.5 text-brand-600 hover:bg-brand-50 font-semibold rounded-xl transition-colors"
                onClick={() => setShowAddExpense(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary shadow-glow"
                onClick={handleAddExpense}
                disabled={!newExpense.title || !newExpense.amount}
              >
                Save Expense
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settlement Confirmation Modal */}
      {showConfirmSettlement && (
        <div className="fixed inset-0 bg-brand-950/40 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl border border-white/20 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold font-heading text-brand-900 mb-2">Confirm Payment</h2>
            <p className="text-sm text-brand-500 mb-6">
              Record a payment of <span className="font-bold text-brand-900">{currency}{showConfirmSettlement.amount.toFixed(2)}</span> from <span className="font-bold text-brand-900">{showConfirmSettlement.from}</span> to <span className="font-bold text-brand-900">{showConfirmSettlement.to}</span>?
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowConfirmSettlement(null)}
                className="flex-1 py-3 text-brand-500 font-bold hover:bg-brand-50 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleRecordSettlement(showConfirmSettlement)}
                className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-2xl shadow-glow hover:bg-emerald-600 transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupDetail;
