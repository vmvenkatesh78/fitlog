# FitLog Architecture Documentation

## Overview

FitLog is a production-grade frontend fitness tracking application built using **Micro Frontend (MFE) architecture**. This document explains the system architecture, design decisions, and how all the pieces fit together.

---

## Table of Contents

1. [What is Micro Frontend?](#what-is-micro-frontend)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Monorepo Structure](#monorepo-structure)
5. [Module Federation](#module-federation)
6. [State Management](#state-management)
7. [Shared Packages](#shared-packages)
8. [Communication Patterns](#communication-patterns)
9. [Development Workflow](#development-workflow)
10. [Deployment Strategy](#deployment-strategy)

---

## What is Micro Frontend?

Micro Frontend is an architectural pattern where a frontend application is decomposed into smaller, independent "micro" applications that can be:

- **Developed independently** by different teams
- **Deployed independently** without affecting other parts
- **Built with different technologies** if needed
- **Scaled independently** based on requirements

### Analogy

Think of it like a shopping mall:
- The **mall building** = Shell (container app)
- Individual **stores** = Micro Frontends (Workout, Food, Analytics)
- **Shared facilities** (electricity, AC) = Shared packages (@fitlog/ui, @fitlog/icons)

Each store can renovate independently without shutting down the entire mall.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           BROWSER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                         SHELL                               │ │
│  │   • Routing           • Authentication      • Navigation   │ │
│  │   • Global State      • Error Boundaries    • Theme        │ │
│  │   Port: 3000                                               │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │                    MODULE FEDERATION                        │ │
│  │          (Runtime loading of remote modules)               │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │                    MICRO FRONTENDS                          │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │ │
│  │  │   Workout    │ │     Food     │ │  Analytics   │       │ │
│  │  │   MFE        │ │     MFE      │ │     MFE      │       │ │
│  │  │  Port 3001   │ │   Port 3002  │ │   Port 3003  │       │ │
│  │  │              │ │              │ │              │       │ │
│  │  │ • Exercises  │ │ • Meals      │ │ • Charts     │       │ │
│  │  │ • Sets/Reps  │ │ • Calories   │ │ • Progress   │       │ │
│  │  │ • History    │ │ • Macros     │ │ • Reports    │       │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   SHARED PACKAGES                           │ │
│  │  @fitlog/ui    •    @fitlog/icons    •    @fitlog/utils    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Framework** | React 18 | Industry standard, large ecosystem |
| **Build Tool** | Vite 7 | Fast builds, native ESM, great DX |
| **Module Federation** | @originjs/vite-plugin-federation | Runtime module loading for Vite |
| **State Management** | Redux Toolkit | Shell global state |
| **Routing** | React Router v6 | Declarative routing |
| **Styling** | CSS (Design Tokens planned) | Simple, no runtime overhead |
| **Monorepo** | npm workspaces | Native, no extra tools |
| **Language** | TypeScript | Type safety |

---

## Monorepo Structure

```
fitlog/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # Lint, build on PR
│   │   └── security.yml        # npm audit
│   └── dependabot.yml          # Auto dependency updates
│
├── apps/
│   ├── shell/                  # Container application
│   │   ├── src/
│   │   │   ├── components/     # Shell-only components
│   │   │   │   └── Header.tsx
│   │   │   ├── store/          # Redux store
│   │   │   │   └── index.ts
│   │   │   ├── App.tsx         # Main app with routes
│   │   │   ├── main.tsx        # Entry point
│   │   │   ├── index.css       # Global styles
│   │   │   └── remotes.d.ts    # Type declarations for remotes
│   │   ├── index.html
│   │   ├── vite.config.ts      # Module Federation HOST config
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── workout-mfe/            # Workout micro frontend
│   │   ├── src/
│   │   │   ├── App.tsx         # EXPOSED component
│   │   │   ├── main.tsx        # Standalone entry
│   │   │   └── index.css
│   │   ├── index.html
│   │   ├── vite.config.ts      # Module Federation REMOTE config
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── food-mfe/               # Food micro frontend (planned)
│   └── analytics-mfe/          # Analytics micro frontend (planned)
│
├── packages/
│   ├── ui/                     # Shared UI components
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Button/
│   │   │   │   ├── Card/
│   │   │   │   └── Input/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── icons/                  # Shared icon components
│   │   ├── src/
│   │   │   ├── icons/
│   │   │   │   ├── Dumbbell.tsx
│   │   │   │   ├── Apple.tsx
│   │   │   │   └── ...
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── utils/                  # Shared utilities
│   │   ├── src/
│   │   │   ├── eventBus.ts     # Cross-MFE communication
│   │   │   ├── formatters.ts   # Date, number formatters
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── api/                    # Shared API client (planned)
│
├── docs/                       # Documentation
├── package.json                # Root package.json with workspaces
├── package-lock.json
├── README.md
├── LICENSE
└── .gitignore
```

---

## Module Federation

### What is Module Federation?

Module Federation allows a JavaScript application to dynamically load code from another application at **runtime**. Unlike traditional imports (which bundle everything at build time), Module Federation loads modules on-demand.

### How It Works in FitLog

**Shell (Host)** - `apps/shell/vite.config.ts`:
```typescript
federation({
  name: 'shell',
  remotes: {
    workout: 'http://localhost:3001/assets/remoteEntry.js',
  },
  shared: ['react', 'react-dom', 'react-router-dom'],
})
```

**Workout MFE (Remote)** - `apps/workout-mfe/vite.config.ts`:
```typescript
federation({
  name: 'workout',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/App.tsx',
  },
  shared: ['react', 'react-dom', 'react-router-dom'],
})
```

### The Flow

1. User visits `localhost:3000/workout`
2. Shell's router matches `/workout/*`
3. Shell calls `import('workout/App')`
4. Browser fetches `localhost:3001/assets/remoteEntry.js`
5. remoteEntry.js tells browser where to find the actual code
6. Browser loads the Workout App component
7. React renders it inside Shell

### Shared Dependencies

The `shared` array ensures React is loaded only once:
- Without sharing: Shell loads React, Workout loads React = 2 copies
- With sharing: Shell loads React, Workout reuses it = 1 copy

---

## State Management

### Global State (Shell Only)

Redux Toolkit in Shell manages only **truly global** concerns:

```typescript
// apps/shell/src/store/index.ts
{
  auth: {
    isLoggedIn: true,
    token: 'xxx'
  },
  user: {
    id: '1',
    name: 'Venkatesh',
    email: 'venkatesh@example.com'
  },
  preferences: {
    theme: 'light' | 'dark',
    units: 'metric' | 'imperial'
  }
}
```

### Local State (MFEs)

Each MFE manages its own state using `useState` or `useReducer`:

```typescript
// Workout MFE - manages its own workout data
const [workouts, setWorkouts] = useState([]);
const [selectedExercise, setSelectedExercise] = useState(null);
```

### Why This Split?

| Approach | Problem |
|----------|---------|
| Everything in Redux | MFEs become tightly coupled, hard to extract |
| No shared state | Can't share user info across MFEs |
| **Our approach** | Global essentials shared, features stay local |

---

## Shared Packages

### @fitlog/ui

Reusable UI components used across all MFEs:

```typescript
import { Button, Card, Input } from '@fitlog/ui';
```

Components:
- `Button` - Primary, secondary, ghost variants
- `Card` - Container with header, body, footer
- `Input` - Form input with label and error states

### @fitlog/icons

SVG icons as React components:

```typescript
import { Dumbbell, Apple, ChartBar } from '@fitlog/icons';

<Dumbbell size={24} />
```

### @fitlog/utils

Shared utilities:

```typescript
import { emit, on, formatDate, formatCalories } from '@fitlog/utils';

// Event bus
emit('workout:logged', { exercise: 'Squat', sets: 3 });
on('workout:logged', (data) => console.log(data));

// Formatters
formatDate(new Date());        // "Dec 31, 2024"
formatCalories(1500);          // "1,500 cal"
```

---

## Communication Patterns

### Cross-MFE Events

Using simple DOM CustomEvents (no library):

```typescript
// Workout MFE - emit event
import { emit } from '@fitlog/utils';
emit('workout:logged', { exercise: 'Squat', sets: 3, reps: 10 });

// Analytics MFE - listen
import { on } from '@fitlog/utils';
useEffect(() => {
  const cleanup = on('workout:logged', (data) => {
    updateChart(data);
  });
  return cleanup;
}, []);
```

### Why Not RxJS?

| Library | Complexity | Our Need |
|---------|------------|----------|
| RxJS | High | Overkill |
| Custom event bus lib | Medium | Unnecessary |
| **DOM CustomEvents** | Low | Perfect |

We can always add complexity later if needed.

---

## Development Workflow

### Running Locally

**Terminal 1 - Build + Preview MFE:**
```bash
npm run build -w apps/workout-mfe && npm run preview -w apps/workout-mfe
```

**Terminal 2 - Dev Shell:**
```bash
npm run dev -w apps/shell
```

### Why Build + Preview for MFE?

Vite's dev mode doesn't generate `remoteEntry.js` - it's created only during build. Module Federation needs this file to work.

```
Dev Mode:          Build + Preview:
├── No bundling    ├── Creates bundle
├── Raw files      ├── remoteEntry.js ✅
└── MFE fails ❌   └── MFE works ✅
```

### Developing MFE Standalone

For faster iteration on MFE features:
```bash
npm run dev -w apps/workout-mfe
# Open localhost:3001 directly
```

---

## Deployment Strategy

### Local Development
- Shell: `localhost:3000`
- Workout MFE: `localhost:3001`
- Food MFE: `localhost:3002`
- Analytics MFE: `localhost:3003`

### Production (Vercel)

Each app deploys as a separate Vercel project:

```
Same GitHub Repo → Multiple Vercel Projects
                 → Each with different root directory

fitlog-shell.vercel.app      → apps/shell
fitlog-workout.vercel.app    → apps/workout-mfe
fitlog-food.vercel.app       → apps/food-mfe
fitlog-analytics.vercel.app  → apps/analytics-mfe
```

### Path-based CI/CD

```yaml
# Only deploy shell when shell changes
on:
  push:
    paths:
      - 'apps/shell/**'
      - 'packages/**'
```

---

## Summary

FitLog demonstrates modern frontend architecture patterns:

1. **Micro Frontends** - Independent, deployable features
2. **Module Federation** - Runtime module loading
3. **Monorepo** - Shared code, single repository
4. **Minimal Global State** - Only essentials in Redux
5. **Simple Communication** - DOM events, no complex libraries
6. **Shared Packages** - Consistent UI across MFEs

This architecture scales from a solo project to a large team while keeping complexity manageable.