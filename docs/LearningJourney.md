# FitLog: The Learning Journey

## A Detailed Record of Building This Project - Questions Asked, Problems Faced, Solutions Found

**Author:** Venkatesh Mukundan  
**Date:** December 31, 2024  
**Purpose:** Document the actual learning process, including confusion, mistakes, and "aha" moments

---

## Table of Contents

1. [The Beginning - Why This Project?](#1-the-beginning---why-this-project)
2. [Day 1 Journey - Step by Step](#2-day-1-journey---step-by-step)
3. [Questions Asked During Development](#3-questions-asked-during-development)
4. [Problems We Encountered](#4-problems-we-encountered)
5. [Key Learning Moments](#5-key-learning-moments)
6. [Things That Confused Me](#6-things-that-confused-me)
7. [Decisions and Their Reasoning](#7-decisions-and-their-reasoning)

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

## 3. Questions Asked During Development

### Architecture Questions

| Question | Answer |
|----------|--------|
| "Should name be catchy?" | Yes, short memorable names are better |
| "Monorepo or polyrepo for Workhall?" | Monorepo is fine for 25 devs |
| "How does deployment work with monorepo?" | Path-based CI triggers separate deploys |
| "Is this true MFE?" | Not yet - we needed Module Federation working |

### Code Questions

| Question | Answer |
|----------|--------|
| "Why is Settings icon imported but unused?" | Good catch! Either remove or use it |
| "Do I change main.tsx every time when developing?" | No, main.tsx is for standalone, App.tsx is exposed |
| "Why do we need remotes.d.ts?" | TypeScript doesn't know runtime modules exist |

### Problem-Solving Questions

| Question | Answer |
|----------|--------|
| "Why isn't theme toggle working?" | State stored but not applied to UI |
| "Why can't Shell find workout/App?" | remoteEntry.js only exists after build |
| "I don't want guess solutions, explain the actual problem" | Vite dev mode doesn't bundle = no remoteEntry.js |

---

## 4. Problems We Encountered

### Problem 1: Vulnerability Warnings

**Issue:**
```
2 moderate severity vulnerabilities
```

**Cause:** esbuild vulnerability in Vite 5/6

**Solution:** Updated to Vite 7
```json
"vite": "^7.0.0"
```

**Verification:**
```bash
npm audit
# 0 vulnerabilities
```

---

### Problem 2: Router Context Error

**Error:**
```
useRoutes() may be used only in the context of a <Router> component
```

**Cause:** Workout MFE's App.tsx uses Routes, but no BrowserRouter wraps it.

**Solution:** Add BrowserRouter in main.tsx (standalone entry):
```typescript
// main.tsx
<BrowserRouter>
  <App />
</BrowserRouter>
```

---

### Problem 3: Module Federation Import Error

**Error:**
```
Failed to resolve import "workout/App"
```

**Cause:** Vite dev mode doesn't create remoteEntry.js

**Solution:** Use build + preview for MFEs:
```bash
npm run build -w apps/workout-mfe && npm run preview -w apps/workout-mfe
```

---

### Problem 4: Active Nav Link Not Styled

**Issue:** Clicking navigation links worked but didn't show which page you're on.

**Solution:** Added active state using useLocation:
```typescript
const location = useLocation();
const isActive = (path) => location.pathname.startsWith(path);

<Link className={isActive('/workout') ? 'active' : ''}>
```

And CSS:
```css
.header-nav a.active {
  background: rgba(255, 255, 255, 0.2);
}
```

---

### Problem 5: Alignment Issues with Icons

**Issue:** Icons in header not aligned with text.

**Solution:** Flexbox alignment:
```css
.header-nav a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
```

---

## 5. Key Learning Moments

### Learning 1: Module Federation is a RUNTIME Feature

```
TRADITIONAL IMPORTS:
import Button from './Button';
// Bundled at BUILD time
// Button code is in your bundle

MODULE FEDERATION:
import('workout/App');
// Loaded at RUNTIME
// Code fetched from different server!
```

This is why remoteEntry.js is crucial - it's the "manifest" that tells the host what's available and where to find it.

---

### Learning 2: State Should Affect UI

Having state is pointless if nothing changes:

```typescript
// WRONG: State exists but UI doesn't react
const [theme, setTheme] = useState('light');
// No className based on theme...

// RIGHT: State changes UI
<div className={`theme-${theme}`}>
```

---

### Learning 3: Dev vs Production Workflows Differ

```
DEVELOPMENT:
├── Shell: dev mode (fast HMR)
├── MFEs: build + preview (need remoteEntry.js)
└── Two terminals required

PRODUCTION:
├── Everything built
├── Deployed to CDN/Vercel
└── remoteEntry.js URLs point to production
```

---

### Learning 4: Shared Dependencies Are Critical

Without shared:
```
Shell: Loads React (500KB)
Workout: Loads React (500KB)
Total: 1MB

With shared:
Shell: Loads React (500KB)
Workout: Reuses Shell's React
Total: 500KB
```

The `shared` array in vite.config.ts prevents duplicate loading.

---

### Learning 5: Monorepo ≠ Monolithic Deployment

```
MONOREPO:
├── Single repository
├── Shared code is easy
├── Atomic commits
└── BUT...

DEPLOYMENT:
├── Each app deploys separately
├── Path-based CI triggers
├── Independent scaling
└── NOT monolithic!
```

---

## 6. Things That Confused Me

### Confusion 1: Why BrowserRouter in main.tsx but not App.tsx?

**Initial thought:** "Won't there be two routers?"

**Reality:**
- `main.tsx` runs ONLY when loading MFE standalone
- When Shell loads MFE, it imports `App.tsx` directly
- Shell already has BrowserRouter
- So no double router!

---

### Confusion 2: Why build + preview instead of dev?

**Initial thought:** "Dev mode should work, something is broken."

**Reality:** It's not broken - it's a fundamental limitation:
- Dev mode serves raw files (no bundling)
- Module Federation needs bundled output
- remoteEntry.js is a BUILD artifact

---

### Confusion 3: What exactly is remoteEntry.js?

**Initial thought:** "It's the MFE code."

**Reality:** It's a manifest file that says:
```javascript
// Simplified concept
{
  "./App": {
    importPath: "./src/App.tsx",
    dependencies: ["react", "react-dom"],
    loadFunction: () => import("./actual-app-code.js")
  }
}
```

The actual code is in separate chunks.

---

### Confusion 4: Why @fitlog/ui instead of just 'ui'?

**Initial thought:** "Just 'ui' is simpler."

**Reality:** Scoped packages (@fitlog/ui):
- Namespace prevents conflicts
- Clear ownership
- Same pattern as @angular/, @babel/, @types/
- Professional convention

---

## 7. Decisions and Their Reasoning

### Decision: Use Plain CSS (Not Tailwind/CSS-in-JS)

**Reasoning:**
- Zero runtime overhead
- No complex build setup
- Easy to understand
- Design Tokens planned for Week 5-6

**Trade-off accepted:** Manual class naming, no automatic scoping.

---

### Decision: Minimal Redux (Only 3 Slices)

**Reasoning:**
- MFEs should be independent
- Local state for features
- Global state for truly global things (auth, user, prefs)

**Trade-off accepted:** Can't easily share feature state.

---

### Decision: DOM Events for Communication

**Reasoning:**
- Zero dependencies
- Built into browser
- Simple to understand
- Can add complexity later if needed

**Trade-off accepted:** Manual TypeScript types, cleanup needed.

---

### Decision: Vite over Webpack

**Reasoning:**
- Much faster dev server
- Simpler configuration
- Modern defaults
- Good enough MFE support

**Trade-off accepted:** Build+preview workflow for MFE development.

---

## Summary: What We Built Today

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
✅ Documentation
```

## What's Next

```
Week 1 remaining:
├── Food MFE
├── Analytics MFE
├── Event bus communication between MFEs
└── More workout features

Week 2+:
├── Design Tokens
├── Web Components
├── TDD
├── MCP
└── Lighthouse optimization
```

---

## Final Thoughts

The biggest lesson from Day 1: **Understanding WHY is more important than making it work.**

When Module Federation failed, we could have just searched for a fix. Instead, we understood:
1. How Vite dev mode works (no bundling)
2. What remoteEntry.js is (manifest file)
3. Why build is required (creates the manifest)

This understanding will help when:
- Debugging production issues
- Explaining to teammates
- Making architecture decisions

**Keep asking questions. Keep understanding why.**

🚀 Happy learning!