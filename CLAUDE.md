# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Rokka** is a FinTech web app combining Group Expense Splitting (Splitwise-style), Personal Finance Tracking (Mint-style), and Individual IOU tracking.

**Tech Stack:** Vite + React 18 + Tailwind CSS + Firebase Auth + React Router v7

## Commands

```bash
npm run dev        # Dev server at http://localhost:5173
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # ESLint
```

No test infrastructure exists (no Jest/Vitest setup).

## Architecture

### Auth & Routing (`src/App.jsx`)

Firebase Auth guards all app routes via a `PrivateRoute` component using `useAuthState(auth)` from `react-firebase-hooks`. Public routes: `/login`, `/register`, `/forgot-password`. All other routes require auth and redirect to `/login` if unauthenticated.

Protected routes:
- `/dashboard` - Overview with net balance, recent groups, activity feed
- `/groups` / `/groups/:groupId` - Group listing and detail with expense history
- `/individual` / `/individual/:contactId` - Contact management and 1-to-1 IOU chat
- `/personal` - Personal income/expense tracking with category breakdown
- `/profile` - Account settings

Firebase config reads from `VITE_FIREBASE_*` env vars (`src/firebase.js`).

### State Management (`src/store/index.js`)

Custom `useStore()` hook — **not** Zustand (installed but unused). All data persists to localStorage under keys: `rokka_groups`, `rokka_transactions`, `rokka_members`, `rokka_currency`, `rokka_individual_ious`.

Usage in components:
```js
const { getGroups, addGroup, addTransactionToGroup, ... } = useStore();
```

**Data models:**
- **Groups:** `{ id, name, icon, spent, members[], history[], splitType, status, created }`
  - Member: `{ id, name, amount (balance), paid }`
  - Split types: `'Equal'`, `'Percent'`, `'Exact'`
- **Transactions:** `{ id, type ('income'|'expense'), category, amount, date, account, source }`
- **Members:** `{ id, name, avatar, phone, email }`

**Key methods:**
- `getGroups()`, `getTransactions()`, `getMembers()`, `getCurrency()` — read with localStorage fallback to sample data
- `addGroup()`, `updateGroup()`, `deleteGroup()`, `leaveGroup()`
- `addTransaction()`, `deleteTransaction()`
- `addTransactionToGroup(groupId, expense, splitDetails)` — adds expense, recalculates member balances, syncs to personal ledger
- `addMember()`, `updateMember()`, `deleteMember()`
- `getGlobalHistory()` — aggregates all transaction sources sorted by date
- `suggestCategory(description)` — keyword-based category inference
- `resetToDefaultData()` — restore sample data

Balance convention: positive = owed money (creditor), negative = owes money (debtor).

`GroupDetail.jsx` implements a greedy debt-simplification algorithm (Splitwise-style) to minimize settlement transactions.

### Layout (`src/layout/`)

`MainLayout` detects mobile (`< 768px`) and conditionally renders `BottomNav`. Desktop uses `Header` with sidebar-style top nav. Both use glassmorphic styling (`backdrop-blur-xl`, `bg-white/70`).

### Styling

Tailwind custom theme in `tailwind.config.js`:
- **Font:** Inter (sans), Outfit (headings via `font-heading`)
- **Primary:** Electric purple `#6d28d9` (Tailwind `violet-700`)
- **Success:** Emerald `#10b981`
- **Custom shadows:** `shadow-soft`, `shadow-glow` (purple), `shadow-glow-success` (green), `shadow-glass`

Utility classes in `src/index.css`: `.card`, `.btn-primary`, `.btn-success`, `.input`, `.glass-panel`, `.text-primary`, `.text-success`, `.group-card`, `.transaction-item`.

### External Integrations

- **Google Contacts API** — `src/pages/Individual.jsx` authenticates with Google OAuth and pulls contacts via the People API to populate the member list.
- **Firebase** — Auth only; no Firestore/Realtime Database. All app data is localStorage-only.
