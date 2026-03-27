import { useState, useEffect } from 'react'
import { ArrowUpRight as ArrowUpRightIcon, CreditCard as CreditCardIcon, TrendingDown as TrendingDownIcon, Users as UsersIcon } from 'lucide-react'

export function useStore() {
  const [groups, setGroups] = useState([])
  const [transactions, setTransactions] = useState([])
  const [members, setMembers] = useState([])

  // Load from localStorage
  useEffect(() => {
    try {
      const storedGroups = localStorage.getItem('rokka_groups')
      if (storedGroups) {
        setGroups(JSON.parse(storedGroups))
      } else {
        const defaultGroups = [
          {
            id: 1,
            name: 'Office Lunch',
            icon: CreditCardIcon,
            color: 'bg-blue-100 text-blue-600',
            spent: 420,
            members: 8,
            status: 'Active',
            nextExpense: 'Friday - 2pm',
            splitType: 'Equal',
            history: [
              { date: 'Today', amount: 420, description: 'Team lunch at cafe' },
              { date: 'Last week', amount: 180, description: 'Happy hour drinks' },
            ],
          },
          {
            id: 2,
            name: 'Trip to Bali',
            icon: UsersIcon,
            color: 'bg-purple-100 text-purple-600',
            spent: 2850,
            members: 6,
            status: 'Active',
            nextExpense: 'Book tickets',
            splitType: 'Percent',
            history: [
              { date: '2 days ago', amount: 800, description: 'Hotel booking' },
              { date: 'Yesterday', amount: 2050, description: 'Flight tickets' },
            ],
          },
        ]
        setGroups(defaultGroups)
        localStorage.setItem('rokka_groups', JSON.stringify(defaultGroups))
      }

      const storedTransactions = localStorage.getItem('rokka_transactions')
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions))
      } else {
        const defaultTransactions = [
          { id: 1, type: 'income', category: 'Salary', amount: 5000, date: '2024-01-15', account: 'Main Account', iconColor: 'bg-green-100 text-success', icon: 'ArrowUpRight' },
          { id: 2, type: 'expense', category: 'Food', amount: -45, date: '2024-01-15', account: 'Main Account', iconColor: 'bg-gray-100 text-gray-600', icon: 'CreditCard' },
          { id: 3, type: 'expense', category: 'Transport', amount: -12.50, date: '2024-01-14', account: 'Transport Card', iconColor: 'bg-gray-100 text-gray-600', icon: 'TrendingDown' },
        ]
        setTransactions(defaultTransactions)
        localStorage.setItem('rokka_transactions', JSON.stringify(defaultTransactions))
      }

      const storedMembers = localStorage.getItem('rokka_members')
      if (storedMembers) {
        setMembers(JSON.parse(storedMembers))
      } else {
        const defaultMembers = [
          { id: 1, name: 'You', avatar: 'user', phone: '+1 234 567 890', email: 'you@example.com' },
        ]
        setMembers(defaultMembers)
        localStorage.setItem('rokka_members', JSON.stringify(defaultMembers))
      }
    } catch (e) {
      console.error('Error loading data:', e)
    }
  }, [])

  return {
    groups,
    transactions,
    members,
    getGroups: () => groups,
    getTransactions: () => transactions,
    getMembers: () => members,
  }
}
