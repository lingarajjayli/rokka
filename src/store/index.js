// Simple state management using localStorage
import { useMemo } from 'react'

export const useStore = () => {
  const categories = {
    food: { icon: 'Utensils', color: 'text-orange-500', bg: 'bg-orange-50' },
    transport: { icon: 'Car', color: 'text-blue-500', bg: 'bg-blue-50' },
    rent: { icon: 'Home', color: 'text-purple-500', bg: 'bg-purple-50' },
    shopping: { icon: 'ShoppingBag', color: 'text-pink-500', bg: 'bg-pink-50' },
    entertainment: { icon: 'Film', color: 'text-amber-500', bg: 'bg-amber-50' },
    other: { icon: 'BadgeCent', color: 'text-brand-500', bg: 'bg-brand-50' },
  };

  const defaultGroups = [];

  const defaultTransactions = [];

  const defaultMembers = [];

  const defaultSettings = {
    theme: 'light',
    notifications: {
      groupCreated: true,
      expenseAdded: true,
      debtSettled: true,
    },
    dataExport: false,
  };

  // Get stored data or initialize with default
  const getGroups = () => {
    try {
      const stored = localStorage.getItem('rokka_groups')
      return stored ? JSON.parse(stored) : defaultGroups
    } catch {
      return defaultGroups
    }
  }

  const getTransactions = () => {
    try {
      const stored = localStorage.getItem('rokka_transactions')
      return stored ? JSON.parse(stored) : defaultTransactions
    } catch {
      return defaultTransactions
    }
  }

  const getMembers = () => {
    try {
      const stored = localStorage.getItem('rokka_members')
      return stored ? JSON.parse(stored) : defaultMembers
    } catch {
      return defaultMembers
    }
  }

  const getCurrency = () => {
    try {
      const stored = localStorage.getItem('rokka_currency')
      return stored || '$'
    } catch {
      return '$'
    }
  }

  // Actions
  const saveGroups = (groups) => {
    localStorage.setItem('rokka_groups', JSON.stringify(groups))
  }

  const saveTransactions = (transactions) => {
    localStorage.setItem('rokka_transactions', JSON.stringify(transactions))
  }

  const saveMembers = (members) => {
    localStorage.setItem('rokka_members', JSON.stringify(members))
  }

  const saveCurrency = (symbol) => {
    localStorage.setItem('rokka_currency', symbol)
  }

  const getSettings = () => {
    try {
      const stored = localStorage.getItem('rokka_settings')
      return stored ? JSON.parse(stored) : defaultSettings
    } catch {
      return defaultSettings
    }
  }

  const saveSettings = (settings) => {
    localStorage.setItem('rokka_settings', JSON.stringify(settings))
  }

  const updateTheme = (theme) => {
    const settings = getSettings()
    settings.theme = theme
    saveSettings(settings)
  }

  const exportData = () => {
    try {
      const currency = getCurrency()
      const groups = getGroups()
      const transactions = getTransactions()
      const members = getMembers()
      const settings = getSettings()
      
      const data = {
        exportedAt: new Date().toISOString(),
        currency,
        groups,
        transactions,
        members,
        settings,
      }
      
      return JSON.stringify(data, null, 2)
    } catch {
      return ''
    }
  }

  const importData = (jsonData) => {
    try {
      const data = JSON.parse(jsonData)
      localStorage.setItem('rokka_currency', data.currency || '$')
      localStorage.setItem('rokka_settings', JSON.stringify(data.settings || {}))
      saveGroups(data.groups)
      saveTransactions(data.transactions)
      saveMembers(data.members)
      return { success: true, message: 'Data imported successfully!' }
    } catch (err) {
      return { success: false, message: 'Import failed: ' + err.message }
    }
  }

  const updateCurrency = (symbol) => {
    saveCurrency(symbol)
  }

  const addGroup = (groupData) => {
    const groups = getGroups()
    const newGroup = {
      ...groupData,
      id: Date.now(),
      status: 'active',
    }
    groups.push(newGroup)
    saveGroups(groups)
    return newGroup
  }

  const deleteGroup = (groupId) => {
    const groups = getGroups()
    const filtered = groups.filter((g) => g.id !== groupId)
    saveGroups(filtered)
  }

  const updateGroup = (groupId, updates) => {
    const groups = getGroups()
    const index = groups.findIndex((g) => g.id === groupId)
    if (index !== -1) {
      groups[index] = { ...groups[index], ...updates }
      saveGroups(groups)
    }
  }

  const leaveGroup = (groupId) => {
    const groups = getGroups()
    const index = groups.findIndex((g) => g.id === groupId)
    if (index !== -1) {
      const group = groups[index]
      const userMember = group.members.find(m => m.name === 'You')
      if (userMember && Math.abs(userMember.amount || 0) < 0.01) {
        const updatedMembers = group.members.filter(m => m.name !== 'You')
        if (updatedMembers.length === 0) {
          // If no members left, delete group
          deleteGroup(groupId)
        } else {
          updateGroup(groupId, { members: updatedMembers })
        }
        return { success: true }
      } else {
        return { success: false, message: 'You must settle all debts before leaving the group.' }
      }
    }
    return { success: false, message: 'Group not found.' }
  }

  const addTransaction = (transactionData) => {
    const transactions = getTransactions()
    const newTransaction = {
      ...transactionData,
      id: Date.now(),
    }
    transactions.unshift(newTransaction)
    saveTransactions(transactions)
    return newTransaction
  }

  const addTransactionToGroup = (groupId, transactionData) => {
    // 1. Save the expense in group history
    const groups = getGroups()
    const index = groups.findIndex((g) => g.id === groupId)
    if (index !== -1) {
      const group = groups[index]
      
      const isSettlement = transactionData.type === 'settlement'
      let splitDetails = transactionData.splitDetails || {};
      
      if (!isSettlement) {
        // For regular expenses, if splitDetails is empty but splitType is Equal, populate it
        if (transactionData.splitType === 'Equal' && Object.keys(splitDetails).length === 0) {
          const share = transactionData.amount / group.members.length;
          group.members.forEach(m => {
            splitDetails[m.name] = share;
          });
        }
      }

      const expenseWithMetadata = {
        ...transactionData,
        id: Date.now(),
        splitDetails,
      }

      group.history = [...(group.history || []), expenseWithMetadata]
      
      if (isSettlement) {
        // Settlement: PaidBy pays To. amount is positive.
        // We reduce the "owed" amount for PaidBy and reduce the "lent" amount for the receiver.
        const payer = transactionData.paidBy;
        const receiver = transactionData.to;
        const amount = transactionData.amount;

        group.members = group.members.map(m => {
          if (m.name === payer) {
            // Payer moves towards positive (paying off debt)
            return { ...m, amount: (m.amount || 0) + amount };
          }
          if (m.name === receiver) {
            // Receiver moves towards negative (receiving payment)
            return { ...m, amount: (m.amount || 0) - amount };
          }
          return m;
        });
      } else {
        // Regular Expense
        group.spent = (group.spent || 0) + Math.abs(transactionData.amount)
        
        // Update individual member balances in the group
        group.members = group.members.map(m => {
          const isPayer = m.name === transactionData.paidBy;
          const owerAmount = splitDetails[m.name] || 0;
          const balanceChange = isPayer ? (transactionData.amount - owerAmount) : -owerAmount;
          return {
            ...m,
            amount: (m.amount || 0) + balanceChange,
          };
        });
      }

      // Final pass to update 'paid' status (positive balance means they are "lent" money)
      group.members = group.members.map(m => ({
        ...m,
        paid: (m.amount || 0) >= -0.01
      }));

      saveGroups(groups)

      // 2. Also write to the personal transactions ledger
      const groupName = group.name
      addTransaction({
        type: isSettlement ? 'income' : 'expense', // Settlement receipt is income-like for global tracking
        category: transactionData.category || (isSettlement ? 'Payment' : 'Other'),
        title: transactionData.title || (isSettlement ? `Settlement: ${transactionData.paidBy} to ${transactionData.to}` : 'Group Expense'),
        account: `Group: ${groupName}`,
        amount: transactionData.amount,
        date: transactionData.date || new Date().toISOString().split('T')[0],
        source: 'group',
        groupId,
        isSettlement
      })
    }
  }

  const addMember = (memberData) => {
    const members = getMembers()
    const newMember = {
      ...memberData,
      id: Date.now(),
    }
    members.push(newMember)
    saveMembers(members)
    return newMember
  }

  const updateMember = (memberId, updates) => {
    const members = getMembers()
    const index = members.findIndex((m) => m.id === memberId)
    if (index !== -1) {
      members[index] = { ...members[index], ...updates }
      saveMembers(members)
    }
  }

  const deleteMember = (memberId) => {
    const members = getMembers()
    const filtered = members.filter((m) => m.id !== memberId && m.name !== memberId) // support ID or Name for deletion
    saveMembers(filtered)
  }

  const deleteTransaction = (transactionId) => {
    // 1. Delete from global ledger
    const transactions = getTransactions()
    const txToDelete = transactions.find(t => t.id === transactionId)
    const filtered = transactions.filter((t) => t.id !== transactionId)
    saveTransactions(filtered)

    // 2. If it was a group transaction, remove from group history and revert balances
    if (txToDelete && txToDelete.source === 'group' && txToDelete.groupId) {
      const groups = getGroups()
      const groupIndex = groups.findIndex(g => g.id === txToDelete.groupId)
      if (groupIndex !== -1) {
        const group = groups[groupIndex]
        const groupTxIndex = (group.history || []).findIndex(t => t.id === transactionId || (t.date === txToDelete.date && t.amount === txToDelete.amount && t.title === txToDelete.title))
        
        if (groupTxIndex !== -1) {
          const gTx = group.history[groupTxIndex]
          const isSettlement = gTx.type === 'settlement'
          
          if (isSettlement) {
            const payer = gTx.paidBy
            const receiver = gTx.to
            const amount = gTx.amount
            group.members = group.members.map(m => {
              if (m.name === payer) return { ...m, amount: (m.amount || 0) - amount }
              if (m.name === receiver) return { ...m, amount: (m.amount || 0) + amount }
              return m
            })
          } else {
            group.spent = (group.spent || 0) - Math.abs(gTx.amount)
            const splitDetails = gTx.splitDetails || {}
            group.members = group.members.map(m => {
              const isPayer = m.name === gTx.paidBy
              const owerAmount = splitDetails[m.name] || 0
              const balanceChange = isPayer ? (gTx.amount - owerAmount) : -owerAmount
              return { ...m, amount: (m.amount || 0) - balanceChange }
            })
          }

          group.history.splice(groupTxIndex, 1)
          group.members = group.members.map(m => ({ ...m, paid: (m.amount || 0) >= -0.01 }))
          saveGroups(groups)
        }
      }
    }

    // 3. If it was an individual IOU, handle that (though individual IOUs usually live in their own localStorage)
    if (txToDelete && txToDelete.source === 'individual') {
      const stored = localStorage.getItem('rokka_individual_ious')
      if (stored) {
        const ious = JSON.parse(stored)
        const updatedIous = ious.filter(i => !(i.date === txToDelete.date && i.amount === txToDelete.amount && i.contact === txToDelete.contactId))
        localStorage.setItem('rokka_individual_ious', JSON.stringify(updatedIous))
      }
    }
  }

  const resetToDefaultData = () => {
    saveGroups(defaultGroups)
    saveTransactions(defaultTransactions)
    saveMembers(defaultMembers)
    localStorage.removeItem('rokka_individual_ious')
  }

  const getGlobalHistory = () => {
    const groups = getGroups()
    const transactions = getTransactions()
    const ious = JSON.parse(localStorage.getItem('rokka_individual_ious') || '[]')
    
    const allHistory = []
    
    // Group history
    groups.forEach(g => {
      (g.history || []).forEach(tx => {
        allHistory.push({ ...tx, source: 'group', groupName: g.name, groupId: g.id })
      })
    })
    
    // Individual IOUs
    ious.forEach(iou => {
      allHistory.push({ ...iou, source: 'individual', title: iou.description, type: iou.type === 'lent' ? 'income' : 'expense' })
    })
    
    // Personal Transactions (non-group, non-iou)
    transactions.filter(t => t.source !== 'group' && t.source !== 'individual').forEach(t => {
      allHistory.push({ ...t, source: 'personal' })
    })
    
    return allHistory.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  const suggestCategory = (description) => {
    const desc = description.toLowerCase()
    if (desc.includes('food') || desc.includes('dinner') || desc.includes('lunch') || desc.includes('pizza') || desc.includes('restaurant')) return 'food'
    if (desc.includes('uber') || desc.includes('taxi') || desc.includes('flight') || desc.includes('train') || desc.includes('fuel')) return 'transport'
    if (desc.includes('rent') || desc.includes('electricity') || desc.includes('water') || desc.includes('bill')) return 'rent'
    if (desc.includes('amazon') || desc.includes('shop') || desc.includes('clothe') || desc.includes('gift')) return 'shopping'
    if (desc.includes('movie') || desc.includes('netflix') || desc.includes('game') || desc.includes('party')) return 'entertainment'
    return 'other'
  }

  return useMemo(() => ({
    groups: getGroups,
    transactions: getTransactions,
    members: getMembers,
    currency: getCurrency,
    settings: getSettings,
    saveGroups,
    saveTransactions,
    saveMembers,
    addGroup,
    addTransaction,
    addTransactionToGroup,
    updateGroup,
    leaveGroup,
    deleteGroup,
    updateMember,
    deleteMember,
    deleteTransaction,
    addMember,
    resetToDefaultData,
    updateCurrency,
    saveSettings,
    updateTheme,
    exportData,
    importData,
    getGlobalHistory,
    suggestCategory,
    categories: () => categories,
  }), [])
}
