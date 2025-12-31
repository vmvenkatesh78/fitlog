# FitLog: Complete Beginner's Guide

## A Comprehensive Guide to Understanding Every Aspect of This Project

**Author:** Venkatesh Mukundan  
**Date:** December 31, 2024  
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
8. [Development Workflow](#8-development-workflow)
9. [Common Commands](#9-common-commands)
10. [Glossary](#10-glossary)

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
├── node_modules/                # Installed dependencies (auto-generated)
├── docs/                        # Documentation
├── package.json                 # Root configuration
├── package-lock.json            # Locked dependency versions
├── README.md                    # Project description
├── LICENSE                      # MIT license
└── .gitignore                   # Files Git should ignore
```

### Why This Structure?

This is a **monorepo** - multiple projects in one repository.

```
MONOREPO BENEFITS:
├── One place for all code
├── Easy to share code between apps
├── Single pull request for cross-app changes
├── Consistent tooling and configuration
└── Easier to onboard new developers
```

### The `apps/` Folder

```
apps/
├── shell/                       # The "host" application
├── workout-mfe/                 # Workout micro frontend
├── food-mfe/                    # Food micro frontend (planned)
└── analytics-mfe/               # Analytics micro frontend (planned)
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
├── utils/                       # Utility functions
└── api/                         # API client (planned)
```

**Think of it like:**
- `ui/` = The mall's interior design elements (same benches, signs everywhere)
- `icons/` = Standard icons used by all stores
- `utils/` = Shared facilities (electricity, plumbing)

---

## 4. Every File Explained

### Root Files

#### `package.json` (Root)
```json
{
  "name": "fitlog",
  "version": "1.0.0",
  "private": true,                    // Don't publish to npm
  "workspaces": [                     // npm workspaces magic!
    "apps/*",                         // All folders in apps/
    "packages/*"                      // All folders in packages/
  ],
  "scripts": {
    "dev": "echo 'Use: npm run dev -w apps/shell'",
    "build": "npm run build --workspaces --if-present",
    "lint": "npm run lint --workspaces --if-present",
    "test": "npm run test --workspaces --if-present"
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

#### `.gitignore`
```
# Dependencies
node_modules/

# Build outputs
dist/

# Environment files
.env
.env.local

# Editor files
.vscode/
.idea/

# OS files
.DS_Store

# Test coverage
coverage/

# Logs
*.log
```

**Why ignore these?**
- `node_modules/` - Can be regenerated with `npm install`
- `dist/` - Can be regenerated with `npm run build`
- `.env` - Contains secrets, shouldn't be in Git
- `.DS_Store` - macOS system files, useless

---

### Shell Application Files

#### `apps/shell/package.json`
```json
{
  "name": "@fitlog/shell",            // Scoped package name
  "version": "1.0.0",
  "private": true,
  "type": "module",                   // Use ES modules
  "scripts": {
    "dev": "vite --port 3000",        // Start dev server
    "build": "vite build",            // Create production build
    "preview": "vite preview --port 3000"  // Serve built files
  },
  "dependencies": {
    "react": "^18.2.0",               // React library
    "react-dom": "^18.2.0",           // React DOM renderer
    "react-router-dom": "^6.20.0",    // Routing library
    "@reduxjs/toolkit": "^2.0.0",     // State management
    "react-redux": "^9.0.0"           // React-Redux bindings
  },
  "devDependencies": {
    "@types/react": "^18.2.0",        // TypeScript types
    "@vitejs/plugin-react": "^4.2.0", // Vite React plugin
    "@originjs/vite-plugin-federation": "^1.3.5",  // Module Federation!
    "typescript": "^5.3.0",
    "vite": "^7.0.0"
  }
}
```

**What's the difference between `dependencies` and `devDependencies`?**
- `dependencies` - Needed at runtime (in the browser)
- `devDependencies` - Only needed during development/build

#### `apps/shell/vite.config.ts`
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),                          // Enable React support
    federation({
      name: 'shell',                  // This app's name
      remotes: {                      // Remote MFEs to load
        workout: 'http://localhost:3001/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom', 'react-router-dom'],  // Share these!
    }),
  ],
  build: {
    modulePreload: false,
    target: 'esnext',                 // Use modern JavaScript
    minify: false,                    // Don't minify (easier debugging)
    cssCodeSplit: false,
  },
});
```

**What does `shared` do?**

Without `shared`:
```
Shell loads React (500KB)
Workout loads React (500KB)
Total: 1MB of React!
```

With `shared`:
```
Shell loads React (500KB)
Workout reuses Shell's React
Total: 500KB of React!
```

#### `apps/shell/src/main.tsx`
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';        // Redux wrapper
import { BrowserRouter } from 'react-router-dom';  // Routing wrapper
import { store } from './store';
import App from './App';
import './index.css';

// Find the <div id="root"> in index.html
// Render our React app inside it
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>                           {/* Extra checks in dev */}
    <Provider store={store}>                   {/* Redux available everywhere */}
      <BrowserRouter>                          {/* Routing available everywhere */}
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
```

**Why all these wrappers?**

Each wrapper provides context that components below can access:
- `Provider` → Components can use `useSelector`, `useDispatch`
- `BrowserRouter` → Components can use `useNavigate`, `useLocation`

#### `apps/shell/src/App.tsx`
```typescript
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import Header from './components/Header';

// MAGIC: This loads the Workout app from a different server!
const WorkoutApp = React.lazy(() => import('workout/App'));

function App() {
  const preferences = useSelector((state: RootState) => state.preferences);

  return (
    <div className={`app theme-${preferences.theme}`}>
      <Header />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/workout/*"               {/* /workout and anything after */}
            element={
              <Suspense fallback={<div>Loading Workout...</div>}>
                <WorkoutApp />              {/* Loaded from port 3001! */}
              </Suspense>
            }
          />
          <Route path="/food/*" element={<div>Food MFE coming soon</div>} />
          <Route path="/analytics/*" element={<div>Analytics MFE coming soon</div>} />
        </Routes>
      </main>
    </div>
  );
}
```

**What is `React.lazy`?**

Normal import:
```typescript
import WorkoutApp from 'workout/App';  // Loads immediately
```

Lazy import:
```typescript
const WorkoutApp = React.lazy(() => import('workout/App'));  // Loads when needed
```

With lazy loading, the Workout code only downloads when you visit `/workout`.

**What is `Suspense`?**

While lazy component is loading, show the `fallback`:
```typescript
<Suspense fallback={<div>Loading...</div>}>
  <WorkoutApp />  {/* Shows "Loading..." until WorkoutApp is ready */}
</Suspense>
```

#### `apps/shell/src/store/index.ts`
```typescript
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Auth slice - handles login state
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isLoggedIn: true,           // For now, always logged in
    token: 'fake-token',
  },
  reducers: {
    login: (state) => { state.isLoggedIn = true; },
    logout: (state) => { state.isLoggedIn = false; state.token = ''; },
  },
});

// User slice - user profile info
const userSlice = createSlice({
  name: 'user',
  initialState: {
    id: '1',
    name: 'Venkatesh',
    email: 'venkatesh@example.com',
  },
  reducers: {
    setUser: (state, action: PayloadAction<{ name: string; email: string }>) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
    },
  },
});

// Preferences slice - app settings
const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: {
    theme: 'light' as 'light' | 'dark',
    units: 'metric' as 'metric' | 'imperial',
  },
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setUnits: (state, action: PayloadAction<'metric' | 'imperial'>) => {
      state.units = action.payload;
    },
  },
});

// Create the store with all slices
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    user: userSlice.reducer,
    preferences: preferencesSlice.reducer,
  },
});

// Export actions for components to use
export const { login, logout } = authSlice.actions;
export const { setUser } = userSlice.actions;
export const { toggleTheme, setUnits } = preferencesSlice.actions;

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**Why only these three things in global state?**

```
GLOBAL (Shell Redux):          LOCAL (MFE State):
├── auth (who's logged in)     ├── workouts list
├── user (profile info)        ├── selected exercise
└── preferences (theme)        └── form inputs

Why? MFEs should be INDEPENDENT.
If Workout stores its state in Shell, it becomes DEPENDENT.
```

#### `apps/shell/src/remotes.d.ts`
```typescript
// Tell TypeScript about remote modules
declare module 'workout/App' {
  const App: React.ComponentType;
  export default App;
}
```

**Why is this needed?**

TypeScript doesn't know `workout/App` exists - it's loaded at runtime!
This file says "trust me, this module exists and exports a React component."

---

### Workout MFE Files

#### `apps/workout-mfe/vite.config.ts`
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'workout',                    // This remote's name
      filename: 'remoteEntry.js',         // THE KEY FILE!
      exposes: {                          // What we're sharing
        './App': './src/App.tsx',         // Expose App component
      },
      shared: ['react', 'react-dom', 'react-router-dom'],
    }),
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
  server: {
    port: 3001,                           // Different port!
    cors: true,                           // Allow cross-origin requests
  },
  preview: {
    port: 3001,
    cors: true,
  },
});
```

**What is `remoteEntry.js`?**

This is the "manifest" file that tells the Shell:
- What modules are available
- Where to find the actual code
- What dependencies are needed

```
Shell: "Hey workout, what do you have?"
remoteEntry.js: "I have ./App at this location..."
Shell: "Great, give me ./App"
remoteEntry.js: "Here's the code!"
```

#### `apps/workout-mfe/src/main.tsx`
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// This runs when MFE is loaded STANDALONE (localhost:3001)
// NOT when loaded in Shell (Shell provides its own BrowserRouter)
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>            {/* MFE needs its own router for standalone */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

**Why does main.tsx have BrowserRouter but App.tsx doesn't?**

```
STANDALONE MODE (localhost:3001):
main.tsx runs → provides BrowserRouter → App works ✓

IN SHELL (localhost:3000/workout):
Shell's main.tsx runs → provides BrowserRouter → imports App.tsx (not main.tsx)
App.tsx has no BrowserRouter → uses Shell's → works ✓
```

#### `apps/workout-mfe/src/App.tsx`
```typescript
import { Routes, Route } from 'react-router-dom';
import { Button, Card, CardHeader, CardBody } from '@fitlog/ui';
import { Dumbbell, Plus } from '@fitlog/icons';

function WorkoutApp() {
  return (
    <div className="workout-app">
      <Routes>                             {/* Routes WITHIN the MFE */}
        <Route path="/" element={<WorkoutList />} />
        <Route path="/new" element={<NewWorkout />} />
      </Routes>
    </div>
  );
}

function WorkoutList() {
  return (
    <div className="workout-list">
      <div className="workout-header">
        <h2><Dumbbell size={24} /> My Workouts</h2>
        <Button variant="primary">
          <Plus size={18} />
          New Workout
        </Button>
      </div>
      
      <div className="workout-cards">
        <Card>
          <CardHeader>
            <strong>Morning Strength</strong>
          </CardHeader>
          <CardBody>
            <p>Squats, Bench Press, Deadlift</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default WorkoutApp;  // This is what Shell imports!
```

---

### Shared Packages

#### `packages/ui/package.json`
```json
{
  "name": "@fitlog/ui",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "src/index.ts",            // Entry point
  "types": "src/index.ts",           // TypeScript types location
  "peerDependencies": {
    "react": "^18.2.0",              // Expects React to exist
    "react-dom": "^18.2.0"
  }
}
```

**What are `peerDependencies`?**

Regular dependency: "I'll bring my own React"
Peer dependency: "I expect YOU to have React already"

This prevents duplicate React installations.

#### `packages/ui/src/components/Button/Button.tsx`
```typescript
import React from 'react';
import './Button.css';

// Define props interface for TypeScript
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

// The component
export function Button({ 
  variant = 'primary',    // Default value
  size = 'md',            // Default value
  children, 
  className = '',
  ...props                // Spread remaining props (onClick, disabled, etc.)
}: ButtonProps) {
  return (
    <button 
      className={`btn btn-${variant} btn-${size} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

#### `packages/utils/src/eventBus.ts`
```typescript
// Simple event bus for cross-MFE communication
// Uses browser's built-in CustomEvent - no library needed!

type EventCallback<T = unknown> = (data: T) => void;

// Emit an event
export function emit<T = unknown>(event: string, data?: T): void {
  window.dispatchEvent(new CustomEvent(event, { detail: data }));
}

// Listen to an event
export function on<T = unknown>(event: string, callback: EventCallback<T>): () => void {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<T>;
    callback(customEvent.detail);
  };
  
  window.addEventListener(event, handler);
  
  // Return cleanup function
  return () => window.removeEventListener(event, handler);
}

// Predefined event names
export const Events = {
  WORKOUT_LOGGED: 'workout:logged',
  MEAL_LOGGED: 'meal:logged',
} as const;
```

**How to use:**

```typescript
// Workout MFE - when workout is saved
import { emit, Events } from '@fitlog/utils';
emit(Events.WORKOUT_LOGGED, { exercise: 'Squat', sets: 3 });

// Analytics MFE - listening for workouts
import { on, Events } from '@fitlog/utils';
useEffect(() => {
  const cleanup = on(Events.WORKOUT_LOGGED, (data) => {
    console.log('New workout!', data);
    updateChart(data);
  });
  return cleanup;  // Clean up when component unmounts
}, []);
```

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
│  │  "Where is workout/App?"                               │ │
│  │         │                                              │ │
│  │         ▼                                              │ │
│  │  Check vite.config.ts remotes:                         │ │
│  │  workout: 'http://localhost:3001/assets/remoteEntry.js'│ │
│  │         │                                              │ │
│  └─────────┼──────────────────────────────────────────────┘ │
│            │                                                 │
│            ▼ HTTP Request                                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  localhost:3001 (Workout MFE)                           ││
│  │                                                         ││
│  │  /assets/remoteEntry.js                                 ││
│  │  "I expose ./App from ./src/App.tsx"                    ││
│  │  "Here's the code..."                                   ││
│  └─────────────────────────────────────────────────────────┘│
│            │                                                 │
│            ▼                                                │
│  Shell receives component code                              │
│  React renders it                                           │
│  User sees Workout page!                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. State Management Explained

### The Philosophy

```
RULE: Keep global state MINIMAL

GLOBAL (Redux in Shell):
├── auth      → Is user logged in? What's their token?
├── user      → Who is the user? Name, email?
└── preferences → Theme (light/dark), units (kg/lbs)

LOCAL (useState in MFEs):
├── workouts   → List of workouts in Workout MFE
├── meals      → List of meals in Food MFE
├── chartData  → Chart data in Analytics MFE
└── formInputs → Form state in any MFE
```

### Why This Split?

**If everything is in Redux:**
```typescript
// Shell Redux with ALL state
{
  auth: {...},
  user: {...},
  preferences: {...},
  workouts: [...],    // Workout MFE data
  meals: [...],       // Food MFE data
  analytics: {...},   // Analytics MFE data
}

// PROBLEMS:
// 1. Workout MFE is now DEPENDENT on Shell
// 2. Can't extract Workout to separate repo
// 3. Shell needs to know about Workout's data structure
// 4. Tight coupling!
```

**With our approach:**
```typescript
// Shell Redux - minimal
{
  auth: {...},
  user: {...},
  preferences: {...}
}

// Workout MFE - manages its own
const [workouts, setWorkouts] = useState([]);

// BENEFITS:
// 1. Workout MFE is INDEPENDENT
// 2. Can extract to separate repo easily
// 3. Shell doesn't care about workout data
// 4. Loose coupling!
```

---

## 7. Shared Packages Deep Dive

### Why Shared Packages?

Without shared packages:
```typescript
// Shell
const Button = ({ children }) => <button>{children}</button>;

// Workout MFE
const Button = ({ children }) => <button>{children}</button>;  // Duplicate!

// Food MFE
const Button = ({ children }) => <button>{children}</button>;  // Duplicate!

// Different styles, behaviors, bugs!
```

With shared packages:
```typescript
// Every MFE
import { Button } from '@fitlog/ui';

// Same component everywhere!
// Fix once, fixed everywhere!
```

### Package: @fitlog/ui

**Purpose:** Reusable UI components

**Components:**
- `Button` - Clickable button with variants
- `Card` - Container with optional header/footer
- `Input` - Form input with label and error

**Usage:**
```typescript
import { Button, Card, Input } from '@fitlog/ui';

<Button variant="primary" size="lg">Click me</Button>
<Card padding="md"><p>Content</p></Card>
<Input label="Email" error="Invalid email" />
```

### Package: @fitlog/icons

**Purpose:** SVG icons as React components

**Icons:**
- `Dumbbell` - Workout icon
- `Apple` - Food icon
- `ChartBar` - Analytics icon
- `User` - Profile icon
- `Settings` - Settings icon
- `Plus`, `Check`, `X` - Common actions

**Usage:**
```typescript
import { Dumbbell, Plus } from '@fitlog/icons';

<Dumbbell size={24} />
<Plus size={18} className="text-white" />
```

### Package: @fitlog/utils

**Purpose:** Shared utility functions

**Features:**
- `emit()` / `on()` - Cross-MFE event communication
- `formatDate()` - Date formatting
- `formatCalories()` - Number formatting
- `formatWeight()` - Weight with units

**Usage:**
```typescript
import { emit, on, formatDate, formatCalories } from '@fitlog/utils';

// Events
emit('workout:logged', { exercise: 'Squat' });
const cleanup = on('workout:logged', (data) => console.log(data));

// Formatters
formatDate(new Date());        // "Dec 31, 2024"
formatCalories(1500);          // "1,500 cal"
formatWeight(70, 'metric');    // "70.0 kg"
formatWeight(70, 'imperial');  // "154.3 lbs"
```

---

## 8. Development Workflow

### Starting the Project

```bash
# 1. Clone the repository
git clone https://github.com/vmvenkatesh78/fitlog.git
cd fitlog

# 2. Install ALL dependencies (root + all workspaces)
npm install

# 3. Start development
# Terminal 1: Build & preview MFE
npm run build -w apps/workout-mfe && npm run preview -w apps/workout-mfe

# Terminal 2: Start Shell
npm run dev -w apps/shell

# 4. Open browser
# http://localhost:3000
```

### Why Two Terminals?

```
VITE DEV MODE:
├── Serves raw source files
├── Super fast HMR
├── BUT... no remoteEntry.js!
└── Module Federation fails

VITE BUILD + PREVIEW:
├── Creates bundled files
├── Generates remoteEntry.js ✓
├── Slower to update
└── Module Federation works!
```

So we:
- Build + preview MFEs (need remoteEntry.js)
- Dev mode for Shell (fast HMR for shell changes)

### Development Scenarios

**Working on Shell UI:**
```bash
# Only need to change Terminal 2
npm run dev -w apps/shell
# Make changes, see instant updates!
```

**Working on MFE (standalone):**
```bash
# Fastest for MFE-only changes
npm run dev -w apps/workout-mfe
# Open localhost:3001 directly
```

**Testing MFE in Shell:**
```bash
# Terminal 1: Rebuild MFE
npm run build -w apps/workout-mfe && npm run preview -w apps/workout-mfe

# Terminal 2: Shell already running
# Refresh browser to see MFE changes
```

---

## 9. Common Commands

### Installation

```bash
npm install                        # Install all dependencies
npm install <pkg> -w apps/shell   # Add package to specific workspace
```

### Development

```bash
npm run dev -w apps/shell          # Start shell dev server
npm run dev -w apps/workout-mfe    # Start workout MFE standalone
```

### Building

```bash
npm run build                      # Build all workspaces
npm run build -w apps/shell        # Build specific workspace
npm run preview -w apps/shell      # Serve built files
```

### Git

```bash
git add .
git commit -m "feat: add workout list"
git push origin dev
```

### Troubleshooting

```bash
# Clear everything and reinstall
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules apps/*/dist
rm -rf packages/*/node_modules
npm install
```

---

## 10. Glossary

| Term | Definition |
|------|------------|
| **MFE** | Micro Frontend - independent frontend application |
| **Shell** | Host application that loads MFEs |
| **Remote** | An MFE that exposes modules |
| **Host** | Application that consumes remotes (Shell) |
| **Module Federation** | Webpack/Vite feature for runtime module loading |
| **remoteEntry.js** | Manifest file describing what a remote exposes |
| **Monorepo** | Single repository containing multiple projects |
| **Workspace** | npm feature to manage multiple packages in one repo |
| **Shared Dependencies** | Libraries loaded once and reused across MFEs |
| **Lazy Loading** | Loading code only when needed |
| **HMR** | Hot Module Replacement - update without refresh |
| **Event Bus** | Pattern for decoupled communication |
| **Peer Dependencies** | Dependencies expected to be provided by consumer |

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
8. **Development workflow** - Build+preview for MFEs, dev for Shell

This foundation prepares you for:
- Building more MFEs (Food, Analytics)
- Adding Design Tokens
- Implementing TDD
- Understanding large-scale frontend architecture

**Happy coding!** 🚀