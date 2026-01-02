# FitLog: The Learning Journey

## A Detailed Record of Building This Project - Questions Asked, Problems Faced, Solutions Found

**Author:** Venkatesh Mukundan  
**Started:** December 31, 2025  
**Purpose:** Document the actual learning process, including confusion, mistakes, and "aha" moments

---

## Table of Contents

1. [The Beginning - Why This Project?](#1-the-beginning---why-this-project)
2. [Day 1 Journey - Step by Step](#2-day-1-journey---step-by-step)
3. [Day 2 Journey - MFE Communication](#3-day-2-journey---mfe-communication)
4. [Questions Asked During Development](#4-questions-asked-during-development)
5. [Problems We Encountered](#5-problems-we-encountered)
6. [Key Learning Moments](#6-key-learning-moments)
7. [Things That Confused Me](#7-things-that-confused-me)
8. [Decisions and Their Reasoning](#8-decisions-and-their-reasoning)

---

## 1. The Beginning - Why This Project?

### Context

Before FitLog, we spent several days learning MFE theory:
- 20 sections of MFE concepts
- Creating Workhall migration documents
- Understanding the "why" before the "how"

### The Real Motivation

At Workhall, we have:
- 25 developers
- Single monolithic Angular application
- 7.76 second page loads in development
- 1,715 HTTP requests per page load
- Painful merge conflicts

FitLog is a **safe learning environment** to practice MFE patterns before proposing changes at work.

### Learning Roadmap

```
Week 1-4:  Fitness Tracker (MFE) ← We are HERE
Week 5-6:  Design Tokens
Week 7-8:  Web Components
Week 9-10: TDD
Week 11:   MCP
Week 12:   Lighthouse & Performance
```

---

## 2. Day 1 Journey - Step by Step

### Step 1: Repository Creation

**What we did:**
1. Created GitHub repo named `fitlog`
2. Added README, .gitignore (Node), MIT License

**Question I asked:** "Should the name be catchy?"

**Answer:** Yes, `fitlog` is short, memorable, easy to type. Better than `fitness-tracker-mfe-learning-project`.

**Question I asked:** "The description says MFE learning, but we're doing more than that right?"

**Answer:** Correct! Updated description to:
> "Production-grade frontend fitness app — MFE architecture, design tokens, web components, TDD, and modern practices."

---

### Step 2: Monorepo vs Polyrepo Decision

**Question I asked:** "Even with monorepo, won't the entire thing get pushed? How would deployment be separate for each MFE?"

This was a great question! The answer:

```
CODE:      One repo (monorepo)
DEPLOY:    Separate deployments per MFE

These are INDEPENDENT concerns!
```

Using path-based CI/CD:
```yaml
# deploy-workout.yml
on:
  push:
    paths:
      - 'apps/workout-mfe/**'
```

When only `apps/workout-mfe/` changes, only that workflow triggers.

**Follow-up question:** "At Workhall, wouldn't we use multi-repo since different teams own different MFEs?"

**Answer:** Not necessarily! Even with 25 devs, monorepo with path filters works well. Multi-repo adds complexity:
- Must publish shared packages to npm
- Cross-MFE changes need multiple PRs
- Version synchronization is hard

Recommendation: Start monorepo, split ONLY if you feel the pain.

---

### Step 3: Setting Up the Shell

**What we created:**
```
apps/shell/
├── src/
│   ├── components/Header.tsx
│   ├── store/index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── vite.config.ts
├── tsconfig.json
└── package.json
```

**The First Run:**
```bash
npm run dev -w apps/shell
```

**It worked!** Basic shell running on localhost:3000.

---

### Step 4: Creating Shared Packages

**Question I asked:** "I don't want icons and components hardcoded. Can we have separate libraries like @fitlog/ui and @fitlog/icons from the start?"

**Answer:** "Love this thinking! That's the proper way to do it."

This led to creating:
- `@fitlog/ui` - Button, Card, Input components
- `@fitlog/icons` - Dumbbell, Apple, ChartBar, etc.
- `@fitlog/utils` - Event bus, formatters

**Question about folder structure:** "Is this correct?"
```
packages/icons/
├── Apple.tsx
├── ChartBar.tsx
└── index.ts
```

**Answer:** Not quite! Should be:
```
packages/icons/
├── package.json
└── src/
    ├── index.ts
    └── icons/
        ├── Apple.tsx
        └── ChartBar.tsx
```

The `src/` folder separates source from config.

---

### Step 5: Using Shared Packages in Shell

After creating packages, we updated the Shell to use them:

```typescript
// Before
<Link to="/workout">Workout</Link>

// After
import { Dumbbell } from '@fitlog/icons';
<Link to="/workout"><Dumbbell size={18} /> Workout</Link>
```

**Question I asked:** "Settings icon is imported but not used anywhere."

Good catch! We either:
- Remove unused import (cleaner)
- Add settings button (functional)

We chose to add a theme toggle button using the Settings icon.

---

### Step 6: Theme Toggle Not Working

**Problem:** Clicking settings icon did nothing visible.

**Why:** We were storing theme in Redux but not APPLYING it to the UI.

**Fix:** Added theme class to App:
```typescript
<div className={`app theme-${preferences.theme}`}>
```

And CSS for dark theme:
```css
.theme-dark {
  background: #1a1a2e;
  color: #eaeaea;
}
```

**Learning:** State is useless if it doesn't affect the UI!

---

### Step 7: Creating the Workout MFE

**What we created:**
```
apps/workout-mfe/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── vite.config.ts (DIFFERENT from Shell!)
├── tsconfig.json
└── package.json
```

**Key difference in vite.config.ts:**

Shell (Host):
```typescript
federation({
  name: 'shell',
  remotes: {
    workout: 'http://localhost:3001/assets/remoteEntry.js',
  },
})
```

Workout (Remote):
```typescript
federation({
  name: 'workout',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/App.tsx',
  },
})
```

---

### Step 8: First MFE Error - Router Context

**Error when running Workout MFE standalone:**
```
useRoutes() may be used only in the context of a <Router> component
```

**Question I asked:** "Do I need to change main.tsx every time when developing?"

**Answer:** No! The pattern is:
- `main.tsx` - Has BrowserRouter for standalone development
- `App.tsx` - No Router, gets it from Shell or main.tsx

```typescript
// main.tsx (standalone entry)
<BrowserRouter>
  <App />
</BrowserRouter>

// App.tsx (exposed to Shell)
// No BrowserRouter - Shell provides it
```

When Shell imports `workout/App`, it imports `App.tsx`, not `main.tsx`.

---

### Step 9: Module Federation Not Working

**The Big Problem:**
```
Failed to resolve import "workout/App" from "src/App.tsx"
```

**What we tried:**
1. Checked vite.config.ts - looked correct
2. Checked remotes.d.ts - looked correct
3. Both servers running - yes

**The Real Problem:**

Vite dev mode doesn't create `remoteEntry.js`. It only exists after build!

```
VITE DEV MODE:
├── Serves raw source files
├── No bundling happens
├── remoteEntry.js doesn't exist!
└── Module Federation CANNOT work

VITE BUILD + PREVIEW:
├── Bundles the code
├── Creates remoteEntry.js ✅
└── Module Federation works!
```

**Question I asked:** "I don't want guess solutions. Help me understand the actual problem because I am learning."

This was the right approach! Instead of just fixing it, we understood WHY it happens.

**Solution:**
```bash
# Terminal 1: Build + Preview (creates remoteEntry.js)
npm run build -w apps/workout-mfe && npm run preview -w apps/workout-mfe

# Terminal 2: Dev mode for Shell
npm run dev -w apps/shell
```

---

### Step 10: Understanding the Commands

**Question I asked:** "Explain the commands we used."

**Terminal 1:**
```bash
npm run build -w apps/workout-mfe && npm run preview -w apps/workout-mfe
```

| Part | Meaning |
|------|---------|
| `npm run build` | Run build script |
| `-w apps/workout-mfe` | In workout-mfe workspace |
| `&&` | If success, then... |
| `npm run preview` | Serve the built files |

**Result:**
```
dist/
├── assets/
│   ├── remoteEntry.js  ← Module Federation needs this!
│   └── index-xxx.js
└── index.html
```

**Terminal 2:**
```bash
npm run dev -w apps/shell
```

Shell runs in dev mode. When you visit `/workout`:
1. Shell calls `import('workout/App')`
2. Browser fetches `http://localhost:3001/assets/remoteEntry.js`
3. Gets the actual component code
4. Renders it!

---

## 3. Day 2 Journey - MFE Communication

### The Focus

Day 2 was about **depth over breadth**. Instead of spinning up empty MFEs, we focused on proving one real interaction:

> "A workout logged in one MFE updates analytics in another MFE without shared state."

---

### Step 1: Food MFE

**What we did:**
- Created Food MFE on port 3002
- Minimal UI with calorie display placeholder
- Integrated with Shell via Module Federation

**No questions here** - we had the pattern from Workout MFE.

---

### Step 2: Analytics MFE

**What we did:**
- Created Analytics MFE on port 3003
- Added workout counter that reads from localStorage
- Set up event listener for real-time updates

**Key code:**
```typescript
// Listen for events from Workout MFE
useEffect(() => {
  const cleanup = on(Events.WORKOUT_LOGGED, () => {
    setWorkoutCount((prev) => prev + 1);
  });
  return cleanup;
}, []);
```

---

### Step 3: Cross-MFE Communication (THE REAL WIN)

**Question I asked:** "I added a workout and it works but analytics is not updated?"

**The Problem:**
Events are fire-and-forget. When you:
1. Go to `/workout` → Analytics unmounts
2. Log workout → Event emits
3. Go to `/analytics` → Analytics mounts fresh (missed the event!)

**The Solution:** Persist to localStorage + event bus for real-time.

```typescript
// Workout MFE - Save to localStorage
localStorage.setItem('fitlog-workouts', JSON.stringify(workouts));

// Analytics MFE - Read on mount
const saved = localStorage.getItem('fitlog-workouts');
const count = saved ? JSON.parse(saved).length : 0;
```

**Learning:** Events alone aren't enough. You need persistence for data that survives navigation.

---

### Step 4: localStorage Timestamp Bug

**Error:** `workout.timestamp.toLocaleTimeString is not a function`

**What happened:**
- Saved workout to localStorage with `timestamp: new Date()`
- JSON.stringify converts Date to string
- JSON.parse returns string, not Date object
- `.toLocaleTimeString()` fails on string

**Fix:**
```typescript
// Convert timestamps back to Date objects when loading
const workouts = JSON.parse(saved).map((w) => ({
  ...w,
  timestamp: new Date(w.timestamp),
}));
```

**Learning:** JSON doesn't preserve types. Always convert dates after parsing.

---

### Step 5: ESLint Setup

**Problem:** CI failed - ESLint 9 needs flat config.

**Error:** `ESLint couldn't find an eslint.config.js file`

**Fix:** Created `eslint.config.js` with:
- TypeScript parser
- React hooks plugin
- DOM globals (window, localStorage, CustomEvent, etc.)

**Learning:** ESLint 9 changed config format completely. Old `.eslintrc` doesn't work.

---

### Step 6: Calories Field Question

**Question I asked:** "Why calories when adding a workout?"

**My realization:** Users don't know how many calories they burned. This should be calculated or fetched from an API, not manually entered.

**Decision:** Removed calories from form for now. Can add smart calculation later.

---

## 4. Questions Asked During Development

### Day 1 Questions

| Question | Answer |
|----------|--------|
| "Should name be catchy?" | Yes, short memorable names are better |
| "Monorepo or polyrepo for Workhall?" | Monorepo is fine for 25 devs |
| "How does deployment work with monorepo?" | Path-based CI triggers separate deploys |
| "Is this true MFE?" | Not yet - we needed Module Federation working |
| "Why is Settings icon imported but unused?" | Good catch! Either remove or use it |
| "Do I change main.tsx every time when developing?" | No, main.tsx is for standalone, App.tsx is exposed |
| "Why do we need remotes.d.ts?" | TypeScript doesn't know runtime modules exist |
| "Why isn't theme toggle working?" | State stored but not applied to UI |
| "Why can't Shell find workout/App?" | remoteEntry.js only exists after build |
| "I don't want guess solutions, explain the actual problem" | Vite dev mode doesn't bundle = no remoteEntry.js |

### Day 2 Questions

| Question | Answer |
|----------|--------|
| "Analytics not updating after workout?" | Events are fire-and-forget, need localStorage |
| "Why calories in workout form?" | Removed - users don't know this |
| "Timestamp error on reload?" | JSON.parse returns strings, convert to Date |
| "ESLint failing in CI?" | ESLint 9 needs new flat config format |

---

## 5. Problems We Encountered

### Day 1 Problems

#### Problem 1: Vulnerability Warnings

**Issue:**
```
2 moderate severity vulnerabilities
```

**Cause:** esbuild vulnerability in Vite 5/6

**Solution:** Updated to Vite 7
```json
"vite": "^7.0.0"
```

---

#### Problem 2: Router Context Error

**Error:**
```
useRoutes() may be used only in the context of a <Router> component
```

**Cause:** Workout MFE's App.tsx uses Routes, but no BrowserRouter wraps it.

**Solution:** Add BrowserRouter in main.tsx (standalone entry).

---

#### Problem 3: Module Federation Import Error

**Error:**
```
Failed to resolve import "workout/App"
```

**Cause:** Vite dev mode doesn't create remoteEntry.js

**Solution:** Use build + preview for MFEs.

---

#### Problem 4: Active Nav Link Not Styled

**Issue:** Clicking navigation links worked but didn't show which page you're on.

**Solution:** Added active state using useLocation.

---

### Day 2 Problems

#### Problem 5: Events Lost Between MFEs

**Issue:** Logging workout, then navigating to Analytics showed 0 workouts.

**Cause:** Events fire-and-forget; Analytics wasn't mounted when event fired.

**Solution:** Combine event bus (real-time) + localStorage (persistence).

---

#### Problem 6: localStorage Timestamp Error

**Error:** `workout.timestamp.toLocaleTimeString is not a function`

**Cause:** JSON.stringify converts Date to string; JSON.parse doesn't convert back.

**Solution:** Convert timestamps after parsing:
```typescript
timestamp: new Date(w.timestamp)
```

---

#### Problem 7: ESLint 9 CI Failure

**Error:** `ESLint couldn't find an eslint.config.js file`

**Cause:** ESLint 9 requires new flat config format.

**Solution:** Created `eslint.config.js` with proper globals.

---

## 6. Key Learning Moments

### Learning 1: Module Federation is a RUNTIME Feature

```
TRADITIONAL IMPORTS:
import Button from './Button';
// Bundled at BUILD time

MODULE FEDERATION:
import('workout/App');
// Loaded at RUNTIME from different server!
```

---

### Learning 2: State Should Affect UI

Having state is pointless if nothing changes visually.

---

### Learning 3: Dev vs Production Workflows Differ

```
DEVELOPMENT:
├── Shell: dev mode (fast HMR)
├── MFEs: build + preview (need remoteEntry.js)

PRODUCTION:
├── Everything built
├── remoteEntry.js URLs point to production CDN
```

---

### Learning 4: Events + Persistence = Robust Communication

```
Event Bus alone:     Events lost if listener not mounted
localStorage alone:  No real-time updates
Both together:       Data persists AND real-time works
```

---

### Learning 5: JSON Loses Types

```typescript
// Date becomes string after JSON round-trip
JSON.parse(JSON.stringify(new Date())) // "2026-01-01T..."

// Must convert back manually
new Date(parsed.timestamp)
```

---

## 7. Things That Confused Me

### Confusion 1: Why BrowserRouter in main.tsx but not App.tsx?

**Reality:** main.tsx only runs standalone; Shell provides router when loading App.tsx.

---

### Confusion 2: Why build + preview instead of dev?

**Reality:** Vite dev mode doesn't bundle = no remoteEntry.js = Module Federation fails.

---

### Confusion 3: Why events didn't update Analytics?

**Reality:** Events are instant; if no one's listening, they're lost forever.

---

## 8. Decisions and Their Reasoning

### Decision: Use Plain CSS

**Reasoning:** Zero runtime overhead, simple, Design Tokens planned for Week 5-6.

---

### Decision: Minimal Redux (Only 3 Slices)

**Reasoning:** MFEs should be independent; local state for features.

---

### Decision: DOM Events for Communication

**Reasoning:** Zero dependencies, built into browser, simple to understand.

---

### Decision: Event Bus + localStorage

**Reasoning:** Events for real-time, localStorage for persistence across navigation.

---

### Decision: Remove Calories from Form

**Reasoning:** Users don't know calories burned; calculate or fetch later.

---

## Summary

### Day 1 Built
```
✅ GitHub repo with proper structure
✅ Monorepo with npm workspaces
✅ CI/CD (security, dependabot)
✅ Shell app with routing, Redux, theme toggle
✅ @fitlog/ui (Button, Card, Input)
✅ @fitlog/icons (8 icons)
✅ @fitlog/utils (eventBus, formatters)
✅ Workout MFE
✅ Module Federation working!
```

### Day 2 Built
```
✅ Food MFE (port 3002)
✅ Analytics MFE (port 3003)
✅ Cross-MFE event communication
✅ localStorage persistence
✅ Workout form with logging
✅ ESLint 9 configuration
✅ COMMUNICATION.md documentation
```

### The Key Achievement

> "A workout logged in one MFE updates analytics in another MFE without shared state."

---

## Final Thoughts

The biggest lessons:

1. **Events alone aren't enough - add persistence**
2. **JSON loses types - always convert dates**

**Keep asking questions. Keep understanding why.**

🚀 Happy learning!