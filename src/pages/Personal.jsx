import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { ArrowUpRight, TrendingDown, CreditCard, Plus, Filter, Trash2, PieChart } from 'lucide-react'

function PersonalPage() {
  const [transactions, setTransactions] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTransaction, setNewTransaction] = useState({ type: 'expense', category: '', amount: '', date: new Date().toISOString().split('T')[0] })
  const store = useStore()

  useEffect(() => {
    setTransactions(store.transactions())
  }, [])

  const handleAddTransaction = () => {
    store.addTransaction({
      type: newTransaction.type,
      category: newTransaction.category || 'General',
      amount: parseFloat(newTransaction.amount) || 0,
      date: newTransaction.date,
    })
    setShowAddForm(false)
    setNewTransaction({ type: 'expense', category: '', amount: '', date: new Date().toISOString().split('T')[0] })
    setTransactions(store.transactions())
  }

  const deleteTransaction = (id) => {
    store.deleteTransaction(id)
    setTransactions(store.transactions())
  }

  // Calculate stats
  const income = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const expense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const balance = income - expense

  // Axio-inspired Expense Categorization Algorithm
  const categoryData = (() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const total = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const categories = {};
    
    expenses.forEach(t => {
      const cat = t.category || 'Other';
      categories[cat] = (categories[cat] || 0) + Math.abs(t.amount);
    });

    const sorted = Object.entries(categories)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
      
    // Assign elegant colors statically based on index for the UI
    const colors = ['bg-primary-500', 'bg-blue-400', 'bg-emerald-400', 'bg-amber-400', 'bg-rose-400', 'bg-brand-400'];
    return sorted.map((cat, i) => ({ ...cat, color: colors[i % colors.length] }));
  })();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in pb-24 md:pb-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-900 font-heading tracking-tight">Personal Finance</h1>
          <p className="text-sm text-brand-500 mt-1 font-medium">Track your income and expenses Axio-style</p>
        </div>
        <button
          className="btn-primary flex items-center space-x-2 shadow-glow"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add Transaction</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card border-brand-100 flex flex-col justify-center">
          <p className="text-[10px] text-brand-500 uppercase tracking-widest font-bold mb-2">Net Balance</p>
          <h2 className="text-3xl lg:text-4xl font-bold font-heading text-brand-900">
            <span className="text-brand-300 mr-1">{store.currency()}</span>
            {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h2>
        </div>
        
        <div className="card bg-gradient-to-br from-emerald-500 to-emerald-400 text-white border-transparent shadow-glow-success">
          <div className="flex justify-between items-start">
            <p className="text-[10px] text-emerald-100 uppercase tracking-widest font-bold mb-2">Total Income</p>
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <ArrowUpRight className="w-5 h-5 text-white" />
            </div>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold font-heading mt-2">
            <span className="text-emerald-200 mr-1">+{store.currency()}</span>
            {income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h2>
        </div>
        
        <div className="card bg-gradient-to-br from-brand-900 to-brand-800 text-white border-transparent shadow-soft">
          <div className="flex justify-between items-start">
            <p className="text-[10px] text-brand-300 uppercase tracking-widest font-bold mb-2">Total Expense</p>
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold font-heading mt-2">
            <span className="text-brand-400 mr-1">-{store.currency()}</span>
            {expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Transaction List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card border-brand-100 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-brand-900 font-heading text-lg">Recent Transactions</h3>
              <button className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-brand-400 hover:text-primary-600 transition-colors bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-100">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter</span>
              </button>
            </div>

            {transactions.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-4">
                   <CreditCard className="w-8 h-8 text-brand-300" />
                 </div>
                 <p className="text-brand-500 font-medium">No transactions recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="transaction-item group">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 border shadow-inner ${
                        transaction.source === 'group' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        transaction.source === 'individual' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        transaction.type === 'income' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'
                      }`}>
                        {transaction.type === 'income' ? <ArrowUpRight className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-brand-900 leading-tight">{transaction.category}</p>
                          {transaction.source === 'group' && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded">Group</span>
                          )}
                          {transaction.source === 'individual' && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded">IOU</span>
                          )}
                        </div>
                        <p className="text-[11px] font-semibold text-brand-400 mt-1 uppercase tracking-wider">
                          {transaction.account || 'Personal'} • {new Date(transaction.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className={`font-bold tracking-tight text-lg ${transaction.type === 'income' ? 'text-emerald-600' : 'text-brand-900'}`}>
                          {transaction.type === 'income' ? '+' : '-'} {store.currency()}{Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <button
                        className="p-2 opacity-0 group-hover:opacity-100 text-brand-300 hover:text-rose-500 transition-all bg-white rounded-xl shadow-sm border border-brand-100 hover:border-rose-200"
                        onClick={() => deleteTransaction(transaction.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Axio Categorization Algorithm Insights */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card outline-none border-brand-100 bg-gradient-to-b from-white to-brand-50/30">
            <div className="flex items-center space-x-2 mb-6">
              <PieChart className="w-5 h-5 text-primary-500" />
              <h3 className="font-bold text-brand-900 font-heading text-lg">Spending Insights</h3>
            </div>
            
            {categoryData.length === 0 ? (
              <p className="text-sm text-brand-400 text-center py-6 font-medium">Log expenses to see your algorithmic breakdown.</p>
            ) : (
              <div className="space-y-5">
                {categoryData.map((cat) => (
                  <div key={cat.name}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-semibold text-brand-900 text-sm">{cat.name}</span>
                      <div className="text-right">
                         <span className="font-bold text-sm text-brand-900">{store.currency()}{cat.amount.toFixed(2)}</span>
                         <span className="text-[10px] text-brand-400 ml-2 font-bold bg-brand-100 px-1.5 py-0.5 rounded">{cat.percentage.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-brand-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-2.5 rounded-full ${cat.color} transition-all duration-1000 ease-out`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Transaction Modal overlay */}
      {showAddForm && (
        <div className="fixed inset-0 bg-brand-950/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] p-6 lg:p-8 w-full max-w-md shadow-2xl border border-white/20">
            <h2 className="text-2xl font-bold font-heading text-brand-900 mb-6">New Transaction</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-brand-700 mb-1.5 ml-1">Type</label>
                <div className="grid grid-cols-2 gap-3 p-1 bg-brand-50 rounded-xl">
                  <button 
                    className={`py-2 text-sm font-semibold rounded-lg transition-all ${newTransaction.type === 'expense' ? 'bg-white text-rose-600 shadow-sm border border-brand-200' : 'text-brand-500 hover:text-brand-700'}`}
                    onClick={() => setNewTransaction({...newTransaction, type: 'expense'})}
                  >Expense</button>
                  <button 
                    className={`py-2 text-sm font-semibold rounded-lg transition-all ${newTransaction.type === 'income' ? 'bg-white text-emerald-600 shadow-sm border border-brand-200' : 'text-brand-500 hover:text-brand-700'}`}
                    onClick={() => setNewTransaction({...newTransaction, type: 'income'})}
                  >Income</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-700 mb-1.5 ml-1">Category</label>
                <input
                  type="text"
                  className="input"
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                  placeholder="e.g., Food, Salary, Transport"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-700 mb-1.5 ml-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-brand-400">{store.currency()}</span>
                  <input
                    type="number"
                    className="input pl-8 font-heading text-lg"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-700 mb-1.5 ml-1">Date</label>
                <input
                  type="date"
                  className="input"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                />
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
                onClick={handleAddTransaction}
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PersonalPage