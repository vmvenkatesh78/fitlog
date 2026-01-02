# FitLog: Complete Beginner's Guide

## A Comprehensive Guide to Understanding Every Aspect of This Project

**Author:** Venkatesh Mukundan  
**Date:** December 31, 2025 (Updated January 1, 2026)  
**Target Audience:** Juniors, beginners, or anyone wanting to understand MFE from scratch

---

## Table of Contents

1. [What Are We Building?](#1-what-are-we-building)
2. [Why Micro Frontends?](#2-why-micro-frontends)
3. [Project Structure Explained](#3-project-structure-explained)
4. [Every File Explained](#4-every-file-explained)
5. [How Module Federation Works](#5-how-module-federation-works)
6. [State Management Explained](#6-state-management-explained)
7. [Shared Packages Deep Dive](#7-shared-packages-deep-dive)
8. [Cross-MFE Communication](#8-cross-mfe-communication)
9. [Development Workflow](#9-development-workflow)
10. [Common Commands](#10-common-commands)
11. [Common Gotchas](#11-common-gotchas)
12. [Glossary](#12-glossary)

---

## 1. What Are We Building?

### The App: FitLog

FitLog is a **fitness tracking application** where users can:
- Log workouts (exercises, sets, reps)
- Track food intake (meals, calories, macros)
- View analytics (progress charts, reports)

### But Why This App?

We're not just building a fitness app. We're learning **Micro Frontend architecture** - a pattern used by companies like Amazon, IKEA, and Spotify to build large-scale applications.

### The Real Goal

```
Primary Goal:    Learn Micro Frontend patterns
Secondary Goal:  Build a useful fitness app
Bonus:           Create a portfolio-worthy project
```

---

## 2. Why Micro Frontends?

### The Problem with Monolithic Frontends

Imagine a 500,000 line React application:

```
PROBLEMS:
├── 10+ minute build times
├── One bug can break everything
├── 50 developers fighting over same files
├── Can't deploy features independently
├── "It works on my machine" everywhere
└── Fear of changing anything
```

This is the reality at Workhall (our workplace) - 25 developers, single Angular app, painful deployments.

### The Solution: Micro Frontends

Split the monolith into smaller, independent apps:

```
BEFORE (Monolith):
┌─────────────────────────────────┐
│                                 │
│     ONE HUGE APPLICATION        │
│                                 │
│   Everything bundled together   │
│                                 │
└─────────────────────────────────┘

AFTER (Micro Frontends):
┌─────────────────────────────────┐
│            SHELL                │
├─────────┬─────────┬─────────────┤
│ Workout │  Food   │  Analytics  │
│   MFE   │   MFE   │     MFE     │
│         │         │             │
│ Deploy  │ Deploy  │   Deploy    │
│ alone!  │ alone!  │   alone!    │
└─────────┴─────────┴─────────────┘
```

### Benefits

| Benefit | Explanation |
|---------|-------------|
| **Independent Deployment** | Fix a bug in Workout, deploy only Workout |
| **Team Autonomy** | Team A owns Workout, Team B owns Food |
| **Smaller Codebases** | Easier to understand and maintain |
| **Technology Freedom** | Could use React, Vue, Angular in different MFEs |
| **Faster Builds** | Each MFE builds separately |

---

## 3. Project Structure Explained

### Root Level

```
fitlog/                          # Root folder
├── .github/                     # GitHub-specific configuration
├── apps/                        # All applications live here
├── packages/                    # Shared code lives here
├── docs/                        # Documentation
├── node_modules/                # Installed dependencies (auto-generated)
├── package.json                 # Root configuration
├── package-lock.json            # Locked dependency versions
├── eslint.config.js             # ESLint 9 flat config
├── README.md                    # Project description
├── LICENSE                      # MIT license
└── .gitignore                   # Files Git should ignore
```

### The `apps/` Folder

```
apps/
├── shell/                       # The "host" application (port 3000)
├── workout-mfe/                 # Workout micro frontend (port 3001)
├── food-mfe/                    # Food micro frontend (port 3002)
└── analytics-mfe/               # Analytics micro frontend (port 3003)
```

**Think of it like:**
- `shell/` = The mall building
- `workout-mfe/` = A store in the mall
- `food-mfe/` = Another store
- `analytics-mfe/` = Another store

The shell provides the structure (navigation, authentication), and MFEs fill in the content.

### The `packages/` Folder

```
packages/
├── ui/                          # Reusable UI components
├── icons/                       # Icon components
└── utils/                       # Utility functions (event bus, formatters)
```

**Think of it like:**
- `ui/` = The mall's interior design elements (same benches, signs everywhere)
- `icons/` = Standard icons used by all stores
- `utils/` = Shared facilities (electricity, plumbing, communication system)

---

## 4. Every File Explained

### Root Files

#### `package.json` (Root)
```json
{
  "name": "fitlog",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "echo 'Use: npm run dev -w apps/shell'",
    "build": "npm run build --workspaces --if-present",
    "lint": "npm run lint --workspaces --if-present"
  }
}
```

**What is `workspaces`?**

npm workspaces let you:
1. Install all dependencies with single `npm install`
2. Link packages automatically (no npm publish needed)
3. Run scripts in specific packages with `-w` flag

```bash
npm run dev -w apps/shell    # Run dev script in shell workspace
npm install                  # Install deps for ALL workspaces
```

#### `eslint.config.js`
```javascript
// ESLint 9 requires this new "flat config" format
export default [
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        CustomEvent: 'readonly',  // For event bus
      },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
    },
  },
];
```

---

### Shell Application Files

#### `apps/shell/vite.config.ts`
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shell',
      remotes: {
        workout: 'http://localhost:3001/assets/remoteEntry.js',
        food: 'http://localhost:3002/assets/remoteEntry.js',
        analytics: 'http://localhost:3003/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom', 'react-router-dom'],
    }),
  ],
});
```

**What does `shared` do?**

Without `shared`:
```
Shell loads React (500KB)
Workout loads React (500KB)
Food loads React (500KB)
Total: 1.5MB of React!
```

With `shared`:
```
Shell loads React (500KB)
All MFEs reuse Shell's React
Total: 500KB of React!
```

#### `apps/shell/src/App.tsx`
```typescript
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// MAGIC: These load from different servers at RUNTIME!
const WorkoutApp = React.lazy(() => import('workout/App'));
const FoodApp = React.lazy(() => import('food/App'));
const AnalyticsApp = React.lazy(() => import('analytics/App'));

function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route
            path="/workout/*"
            element={
              <Suspense fallback={<div>Loading Workout...</div>}>
                <WorkoutApp />
              </Suspense>
            }
          />
          <Route
            path="/food/*"
            element={
              <Suspense fallback={<div>Loading Food...</div>}>
                <FoodApp />
              </Suspense>
            }
          />
          <Route
            path="/analytics/*"
            element={
              <Suspense fallback={<div>Loading Analytics...</div>}>
                <AnalyticsApp />
              </Suspense>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
```

#### `apps/shell/src/remotes.d.ts`
```typescript
// Tell TypeScript about remote modules
declare module 'workout/App' {
  const App: React.ComponentType;
  export default App;
}

declare module 'food/App' {
  const App: React.ComponentType;
  export default App;
}

declare module 'analytics/App' {
  const App: React.ComponentType;
  export default App;
}
```

**Why is this needed?**

TypeScript doesn't know these modules exist - they're loaded at runtime! This file says "trust me, these modules exist."

---

### Workout MFE Files

#### `apps/workout-mfe/vite.config.ts`
```typescript
federation({
  name: 'workout',
  filename: 'remoteEntry.js',      // THE KEY FILE!
  exposes: {
    './App': './src/App.tsx',      // What we share
  },
  shared: ['react', 'react-dom', 'react-router-dom'],
})
```

#### `apps/workout-mfe/src/App.tsx`
```typescript
import { useState } from 'react';
import { emit, Events } from '@fitlog/utils';

function WorkoutApp() {
  const [workouts, setWorkouts] = useState(() => {
    const saved = localStorage.getItem('fitlog-workouts');
    if (!saved) return [];
    // Convert timestamps back to Date objects!
    return JSON.parse(saved).map(w => ({
      ...w,
      timestamp: new Date(w.timestamp),
    }));
  });

  const handleLogWorkout = (workout) => {
    const newWorkout = { ...workout, id: Date.now(), timestamp: new Date() };
    const updated = [newWorkout, ...workouts];
    setWorkouts(updated);
    
    // Save to localStorage (persistence)
    localStorage.setItem('fitlog-workouts', JSON.stringify(updated));
    
    // Emit event (real-time update for Analytics)
    emit(Events.WORKOUT_LOGGED, workout);
  };

  return (/* UI */);
}
```

---

### Food MFE Files (apps/food-mfe/)

#### Purpose
Minimal Food tracking MFE to prove Module Federation scales to multiple remotes.

#### `vite.config.ts`
```typescript
federation({
  name: 'food',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/App.tsx',
  },
  shared: ['react', 'react-dom', 'react-router-dom'],
})
```

Port: 3002

---

### Analytics MFE Files (apps/analytics-mfe/)

#### Purpose
Dashboard that displays data from OTHER MFEs. Proves cross-MFE communication works.

#### `src/App.tsx`
```typescript
import { useState, useEffect } from 'react';
import { on, Events } from '@fitlog/utils';

function AnalyticsApp() {
  // Load initial count from localStorage
  const [workoutCount, setWorkoutCount] = useState(() => {
    const saved = localStorage.getItem('fitlog-workouts');
    return saved ? JSON.parse(saved).length : 0;
  });

  // Listen for real-time updates
  useEffect(() => {
    const cleanup = on(Events.WORKOUT_LOGGED, () => {
      setWorkoutCount((prev) => prev + 1);
    });
    return cleanup;
  }, []);

  return (
    <div>
      <h2>Workouts Logged: {workoutCount}</h2>
    </div>
  );
}
```

**Why two data sources?**
1. `localStorage` - For data that persists across page navigation
2. Event listener - For real-time updates when both MFEs are mounted

---

## 5. How Module Federation Works

### The Flow

```
1. User opens localhost:3000
   └── Browser loads Shell app

2. User clicks "Workout" link
   └── Router matches /workout/*

3. Shell encounters React.lazy(() => import('workout/App'))
   └── "I need to load workout/App"

4. Browser fetches http://localhost:3001/assets/remoteEntry.js
   └── This file describes what Workout MFE exposes

5. remoteEntry.js says "App is at ./App"
   └── Browser fetches the actual component code

6. React renders WorkoutApp inside Shell
   └── User sees workout page!
```

### Visual Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     BROWSER                                  │
│                                                              │
│  localhost:3000 (Shell)                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  import('workout/App')                                 │ │
│  │         │                                              │ │
│  │         ▼                                              │ │
│  │  Check vite.config.ts remotes:                         │ │
│  │  workout: 'http://localhost:3001/assets/remoteEntry.js'│ │
│  └─────────┼──────────────────────────────────────────────┘ │
│            │                                                 │
│            ▼ HTTP Request                                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  localhost:3001 (Workout MFE)                           ││
│  │  remoteEntry.js → "Here's the App code..."              ││
│  └─────────────────────────────────────────────────────────┘│
│            │                                                 │
│            ▼                                                │
│  Shell renders WorkoutApp component                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. State Management Explained

### The Philosophy

```
RULE: Keep global state MINIMAL

GLOBAL (Redux in Shell):
├── auth      → Is user logged in?
├── user      → Who is the user?
└── preferences → Theme, units

LOCAL (useState in MFEs):
├── workouts   → List of workouts (Workout MFE)
├── meals      → List of meals (Food MFE)
└── chartData  → Chart data (Analytics MFE)
```

### Why This Split?

**If everything is in Redux:**
```
PROBLEMS:
1. Workout MFE depends on Shell
2. Can't extract to separate repo
3. Shell knows about workout data structure
4. TIGHT COUPLING!
```

**With our approach:**
```
BENEFITS:
1. Workout MFE is INDEPENDENT
2. Can extract to separate repo easily
3. Shell doesn't care about workout data
4. LOOSE COUPLING!
```

---

## 7. Shared Packages Deep Dive

### Package: @fitlog/ui

**Components:**
- `Button` - Variants: primary, secondary, ghost
- `Card` - With CardHeader, CardBody, CardFooter
- `Input` - With label and error states

### Package: @fitlog/icons

**Icons:**
- `Dumbbell`, `Apple`, `ChartBar` - Navigation
- `User`, `Settings` - Header
- `Plus`, `Check`, `X` - Actions

### Package: @fitlog/utils

**Event Bus:**
```typescript
import { emit, on, Events } from '@fitlog/utils';

// Emit
emit(Events.WORKOUT_LOGGED, { exercise: 'Squat' });

// Listen
const cleanup = on(Events.WORKOUT_LOGGED, (data) => {
  console.log(data);
});

// Cleanup when component unmounts
return cleanup;
```

**Formatters:**
```typescript
formatDate(new Date());        // "Dec 31, 2025"
formatCalories(1500);          // "1,500 cal"
formatWeight(70, 'metric');    // "70.0 kg"
```

---

## 8. Cross-MFE Communication

### The Problem

MFEs are independent. How do they share data without tight coupling?

### The Solution: Event Bus + Persistence

```
┌─────────────────┐                     ┌─────────────────┐
│   Workout MFE   │                     │  Analytics MFE  │
│                 │                     │                 │
│  1. Save to     │                     │  3. Read from   │
│     localStorage│                     │     localStorage│
│                 │                     │     on mount    │
│  2. emit()      │ ──── Event Bus ───► │                 │
│     event       │                     │  4. Listen for  │
│                 │                     │     real-time   │
└─────────────────┘                     └─────────────────┘
```

### Why Both?

| Scenario | Solution |
|----------|----------|
| User logs workout, then navigates to Analytics | localStorage (event missed) |
| User has both visible (future split view) | Event bus (real-time) |
| User refreshes Analytics page | localStorage (events lost on refresh) |

---

## 9. Development Workflow

### Running All MFEs

You need **4 terminals**:

```bash
# Terminal 1: Workout MFE (port 3001)
npm run build -w apps/workout-mfe && npm run preview -w apps/workout-mfe

# Terminal 2: Food MFE (port 3002)
npm run build -w apps/food-mfe && npm run preview -w apps/food-mfe

# Terminal 3: Analytics MFE (port 3003)
npm run build -w apps/analytics-mfe && npm run preview -w apps/analytics-mfe

# Terminal 4: Shell (port 3000)
npm run dev -w apps/shell
```

### Why Build + Preview for MFEs?

```
VITE DEV MODE:
├── Serves raw source files
├── No bundling
├── remoteEntry.js doesn't exist!
└── Module Federation FAILS

VITE BUILD + PREVIEW:
├── Bundles the code
├── Creates remoteEntry.js ✅
└── Module Federation WORKS
```

### Development Scenarios

**Working on Shell:**
```bash
npm run dev -w apps/shell
# Fast HMR for shell changes
```

**Working on MFE standalone:**
```bash
npm run dev -w apps/workout-mfe
# Open localhost:3001 directly
# Fast HMR for MFE changes
```

**Testing MFE in Shell:**
```bash
# Rebuild MFE
npm run build -w apps/workout-mfe && npm run preview -w apps/workout-mfe
# Refresh Shell
```

---

## 10. Common Commands

### Installation
```bash
npm install                        # All workspaces
npm install <pkg> -w apps/shell   # Specific workspace
```

### Development
```bash
npm run dev -w apps/shell
npm run dev -w apps/workout-mfe
```

### Building
```bash
npm run build                      # All workspaces
npm run build -w apps/workout-mfe  # Specific workspace
npm run preview -w apps/shell      # Serve built files
```

### Troubleshooting
```bash
# Nuclear option - clear everything
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules apps/*/dist
rm -rf packages/*/node_modules
npm install
```

---

## 11. Common Gotchas

### 1. JSON.parse Loses Date Types

```typescript
// ❌ Wrong - timestamp is now a string
const workouts = JSON.parse(localStorage.getItem('workouts'));
workout.timestamp.toLocaleTimeString(); // ERROR!

// ✅ Correct - convert back to Date
const workouts = JSON.parse(saved).map(w => ({
  ...w,
  timestamp: new Date(w.timestamp),
}));
```

### 2. Events Are Fire-and-Forget

```typescript
// If Analytics MFE isn't mounted, event is LOST!
emit(Events.WORKOUT_LOGGED, data);

// Solution: Always persist important data
localStorage.setItem('fitlog-workouts', JSON.stringify(workouts));
emit(Events.WORKOUT_LOGGED, data);
```

### 3. Always Cleanup Event Listeners

```typescript
useEffect(() => {
  const cleanup = on(Events.WORKOUT_LOGGED, handler);
  return cleanup; // ← Memory leak if you forget!
}, []);
```

### 4. ESLint 9 Requires Flat Config

Old `.eslintrc` files don't work. Must use `eslint.config.js`.

---

## 12. Glossary

| Term | Definition |
|------|------------|
| **MFE** | Micro Frontend - independent frontend application |
| **Shell** | Host application that loads MFEs |
| **Remote** | An MFE that exposes modules |
| **Host** | Application that consumes remotes (Shell) |
| **Module Federation** | Runtime module loading between apps |
| **remoteEntry.js** | Manifest file describing exposed modules |
| **Monorepo** | Single repository with multiple projects |
| **Workspace** | npm feature for managing multiple packages |
| **Event Bus** | Pattern for decoupled communication |

---

## Summary

You've learned:

1. **What MFE is** - Independent apps working together
2. **Why MFE** - Scalability, team autonomy, independent deployments
3. **Project structure** - Monorepo with apps/ and packages/
4. **Every file** - What it does and why
5. **Module Federation** - How runtime loading works
6. **State management** - Minimal global, local to MFEs
7. **Shared packages** - UI, icons, utils
8. **Cross-MFE communication** - Event bus + localStorage
9. **Development workflow** - Build+preview for MFEs, dev for Shell
10. **Common gotchas** - Date parsing, event cleanup, ESLint 9

**Happy coding!** 🚀