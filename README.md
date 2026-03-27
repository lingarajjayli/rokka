# Rokka

A high-performance web application that combines Group Expense Splitting (Splitwise-style) with Personal Finance & Budgeting (Mint-style).

![Rokka Banner](https://via.placeholder.com/1200x400/5f259f/ffffff?text=Rokka)

## Features

- **Personal Finance**: Transaction tracking, category-wise budgeting, monthly overview
- **Group Expenses**: Create groups, manage members, split expenses (Equal/Percent/Exact)
- **Smart Settlement**: Automatic debt simplification and "Settle Up" flow
- **PhonePe UI**: Clean, modern design with rounded cards and high-contrast typography

## Tech Stack

- **Frontend**: React.js + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── features/
│   ├── splitting/      # Group expense splitting logic
│   └── budgeting/      # Personal finance tracking
├── layout/
│   ├── MainLayout.jsx  # Main layout wrapper
│   ├── Header.jsx      # App header
│   ├── BottomNav.jsx   # Mobile navigation
│   └── MainLayout.css  # Layout styles
├── components/         # Shared UI components
├── stores/             # Zustand stores
├── hooks/              # Custom React hooks
└── types/              # TypeScript type definitions
```

## Color Palette

- Primary Purple: `#5f259f`
- Success Green: `#22ab59`
- Background Grey: `#f4f4f4`
- Card White: `#ffffff`

## License

MIT
