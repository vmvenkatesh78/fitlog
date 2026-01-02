# FitLog Architecture Decision Records (ADRs)

This document contains all architectural decisions made during the development of FitLog, along with the context, options considered, and rationale for each decision.

---

## Table of Contents

1. [ADR-001: Monorepo vs Polyrepo](#adr-001-monorepo-vs-polyrepo)
2. [ADR-002: Build Tool Selection](#adr-002-build-tool-selection)
3. [ADR-003: State Management Strategy](#adr-003-state-management-strategy)
4. [ADR-004: Cross-MFE Communication](#adr-004-cross-mfe-communication)
5. [ADR-005: Shared Packages Structure](#adr-005-shared-packages-structure)
6. [ADR-006: Module Federation Plugin](#adr-006-module-federation-plugin)
7. [ADR-007: Styling Approach](#adr-007-styling-approach)
8. [ADR-008: Development Workflow](#adr-008-development-workflow)
9. [ADR-009: Cross-MFE Data Persistence](#adr-009-cross-mfe-data-persistence)
10. [ADR-010: ESLint 9 Configuration](#adr-010-eslint-9-configuration)
11. [ADR-011: Form Field Design](#adr-011-form-field-design)

---

## ADR-001: Monorepo vs Polyrepo

### Status
**Accepted** - December 31, 2025

### Context
Building a Micro Frontend application requires deciding how to organize code repositories. The two main approaches are:
1. **Monorepo** - All MFEs in one repository
2. **Polyrepo** - Each MFE in its own repository

### Decision
Use a **monorepo with npm workspaces** for FitLog.

### Options Considered

#### Option A: Monorepo with npm workspaces ✅ CHOSEN
```
fitlog/
├── apps/shell/
├── apps/workout-mfe/
├── apps/food-mfe/
└── packages/ui/
```

**Pros:**
- Easier code sharing via workspace packages
- Single PR for cross-MFE changes
- Simplified dependency management
- Atomic commits across MFEs
- Better for small-medium teams (< 50 devs)
- Can split to polyrepo later if needed

**Cons:**
- All code visible to everyone
- Repository grows over time
- Single CI runs for all changes (mitigated with path filters)

#### Option B: Polyrepo
```
github.com/vmvenkatesh78/fitlog-shell
github.com/vmvenkatesh78/fitlog-workout
github.com/vmvenkatesh78/fitlog-ui
```

**Pros:**
- True team independence
- Separate CI/CD pipelines
- Clear ownership boundaries
- Better for large organizations (50+ devs)

**Cons:**
- Harder to share code (must publish to npm)
- Cross-MFE changes require multiple PRs
- Version synchronization challenges
- More complex initial setup

### Consequences
- Fast iteration during development
- Easy to share @fitlog/ui, @fitlog/icons across MFEs
- May need to migrate to polyrepo for larger teams in future
- All CI jobs run on any change (mitigated with path filters)

### References
- [Monorepo vs Polyrepo](https://monorepo.tools/)
- [npm Workspaces Documentation](https://docs.npmjs.com/cli/v7/using-npm/workspaces)

---

## ADR-002: Build Tool Selection

### Status
**Accepted** - December 31, 2025

### Context
Need to choose a build tool that supports:
- Fast development experience
- Module Federation for MFE architecture
- TypeScript support
- Modern JavaScript features

### Decision
Use **Vite 7** with `@originjs/vite-plugin-federation`.

### Options Considered

#### Option A: Vite ✅ CHOSEN
**Pros:**
- Extremely fast dev server (native ESM)
- Fast builds with Rollup
- Great TypeScript support
- Growing ecosystem
- Simple configuration

**Cons:**
- Module Federation plugin is community-maintained
- Dev mode doesn't support Module Federation (need build + preview)

#### Option B: Webpack 5
**Pros:**
- Native Module Federation support
- Mature ecosystem
- Better MFE dev experience

**Cons:**
- Slower dev server
- Complex configuration
- Larger bundle sizes by default

#### Option C: Rspack
**Pros:**
- Webpack-compatible, faster
- Native Module Federation

**Cons:**
- Newer, less mature
- Smaller community

### Consequences
- Fast development experience for single apps
- Need to use `build + preview` for MFE development
- May need workarounds for complex MFE scenarios

### Note
The limitation of Vite dev mode not supporting Module Federation was discovered during development. The workaround (build + preview for MFEs) is acceptable for learning purposes.

---

## ADR-003: State Management Strategy

### Status
**Accepted** - December 31, 2025

### Context
MFE applications need clear state management boundaries:
1. What state lives in Shell vs MFEs?
2. What library/pattern to use?
3. How to avoid tight coupling?

### Decision
- **Global State (Shell):** Redux Toolkit - only auth, user, preferences
- **Local State (MFEs):** useState/useReducer for feature state
- Keep global state minimal to maintain MFE independence

### Options Considered

#### Option A: Minimal Global State ✅ CHOSEN
```typescript
// Shell Redux - ONLY these concerns
{
  auth: { isLoggedIn, token },
  user: { id, name, email },
  preferences: { theme, units }
}

// MFE Local State
const [workouts, setWorkouts] = useState([]);
```

**Pros:**
- MFEs stay independent
- Clear boundaries
- Easy to extract MFE to separate repo later
- Simple mental model

**Cons:**
- Can't easily share feature state
- Some data duplication possible

#### Option B: Redux Shared Across All MFEs
```typescript
// Single Redux store with all feature state
{
  auth: {...},
  user: {...},
  workouts: {...},    // Workout MFE state
  meals: {...},       // Food MFE state
  analytics: {...}    // Analytics MFE state
}
```

**Pros:**
- Easy state sharing
- Single source of truth

**Cons:**
- Tight coupling between MFEs
- Hard to deploy MFEs independently
- Hard to extract MFE later

#### Option C: No Shared State Library
**Pros:**
- Maximum independence

**Cons:**
- Hard to share user/auth info
- Each MFE needs its own auth logic

### Consequences
- MFEs remain truly independent
- Must use event bus for cross-MFE data sharing
- Global state changes affect all MFEs (acceptable for auth/user/prefs)

---

## ADR-004: Cross-MFE Communication

### Status
**Accepted** - December 31, 2025

### Context
MFEs need to communicate:
- Workout MFE logs a workout → Analytics MFE updates chart
- User changes theme → All MFEs update

Need a simple, decoupled communication mechanism.

### Decision
Use **DOM CustomEvents** wrapped in simple helper functions.

```typescript
// @fitlog/utils/eventBus.ts
export const emit = (event, data) => {
  window.dispatchEvent(new CustomEvent(event, { detail: data }));
};

export const on = (event, callback) => {
  const handler = (e) => callback(e.detail);
  window.addEventListener(event, handler);
  return () => window.removeEventListener(event, handler);
};
```

### Options Considered

#### Option A: DOM CustomEvents ✅ CHOSEN
**Pros:**
- Zero dependencies
- Built into browser
- Simple to debug (DevTools)
- Easy to understand
- No learning curve

**Cons:**
- No TypeScript types for events (manual typing needed)
- Must manually clean up listeners
- No event replay/history

#### Option B: RxJS
**Pros:**
- Powerful operators
- TypeScript support
- Event replay possible

**Cons:**
- Learning curve
- Extra dependency (~40KB)
- Overkill for simple events

#### Option C: Custom Event Bus Library
**Pros:**
- Can add TypeScript types
- Abstraction layer

**Cons:**
- Extra code to maintain
- Still needs similar implementation

### Consequences
- Simple, dependency-free communication
- Must manually type events
- Must clean up listeners in useEffect
- Can upgrade to more complex solution later if needed

### Example Usage
```typescript
// Workout MFE
emit('workout:logged', { exercise: 'Squat', sets: 3 });

// Analytics MFE
useEffect(() => {
  const cleanup = on('workout:logged', updateChart);
  return cleanup;
}, []);
```

---

## ADR-005: Shared Packages Structure

### Status
**Accepted** - December 31, 2025

### Context
MFEs need to share:
- UI components (buttons, cards)
- Icons
- Utility functions

Need to organize shared code effectively.

### Decision
Create three workspace packages:
- `@fitlog/ui` - UI components
- `@fitlog/icons` - Icon components  
- `@fitlog/utils` - Utilities

### Package Boundaries

#### @fitlog/ui
**Includes:**
- Presentational components (Button, Card, Input)
- Component CSS
- TypeScript types

**Excludes:**
- Business logic
- API calls
- State management

#### @fitlog/icons
**Includes:**
- Icon components as React components
- Size prop for consistency

**Excludes:**
- SVG files (converted to components)
- Icon fonts

#### @fitlog/utils
**Includes:**
- Event bus helpers
- Formatters (date, number)
- Constants

**Excludes:**
- React components
- Styling

### Options Considered

#### Option A: Workspace Packages ✅ CHOSEN
**Pros:**
- Simple imports: `import { Button } from '@fitlog/ui'`
- No npm publish needed
- Atomic updates across packages
- TypeScript works automatically

**Cons:**
- Can't use outside this repo
- Must be careful about circular dependencies

#### Option B: Publish to npm
**Pros:**
- Can use anywhere
- Proper versioning

**Cons:**
- Extra publish step
- Version management overhead
- Slower iteration

### Consequences
- Clean, consistent imports
- Single source of truth for UI
- Easy to refactor
- Prepares for Design Tokens integration later

---

## ADR-006: Module Federation Plugin

### Status
**Accepted** - December 31, 2025

### Context
Need Module Federation support for Vite to enable runtime loading of MFEs.

### Decision
Use `@originjs/vite-plugin-federation`.

### Options Considered

#### Option A: @originjs/vite-plugin-federation ✅ CHOSEN
**Pros:**
- Most mature Vite MFE plugin
- Active maintenance
- Good documentation
- Works with Vite 7

**Cons:**
- Dev mode doesn't generate remoteEntry.js
- Must use build + preview workflow

#### Option B: vite-plugin-federation (different package)
**Pros:**
- Alternative implementation

**Cons:**
- Less mature
- Fewer features

#### Option C: Switch to Webpack
**Pros:**
- Native Module Federation
- Better dev experience

**Cons:**
- Lose Vite's speed benefits
- Complete build tool change

### Consequences
- Must use `build + preview` for MFE development
- Dev experience is slightly slower for MFE changes
- MFE standalone dev still works with `dev` mode

### Workaround Documented
```bash
# MFE development workflow
npm run build -w apps/workout-mfe && npm run preview -w apps/workout-mfe
npm run dev -w apps/shell
```

---

## ADR-007: Styling Approach

### Status
**Accepted** - December 31, 2025

### Context
Need consistent styling across Shell and MFEs.

### Decision
- Use **plain CSS** for now
- Plan **Design Tokens** for future
- Each component has its own CSS file

### Options Considered

#### Option A: Plain CSS ✅ CHOSEN (for now)
**Pros:**
- Zero runtime overhead
- No build complexity
- Easy to understand
- Works everywhere

**Cons:**
- No scoping (must be careful with class names)
- No dynamic theming

#### Option B: CSS Modules
**Pros:**
- Automatic scoping
- No class name conflicts

**Cons:**
- Slightly more complex imports
- Can complicate MFE sharing

#### Option C: Tailwind CSS
**Pros:**
- Rapid development
- Consistent design system

**Cons:**
- Must configure in each MFE
- Learning curve
- Large CSS output

#### Option D: CSS-in-JS (styled-components, emotion)
**Pros:**
- Dynamic styling
- Scoped styles

**Cons:**
- Runtime overhead
- Bundle size increase
- Can cause issues with Module Federation

### Future Plan
Implement Design Tokens (Week 5-6 of roadmap):
```javascript
// Future design tokens
const tokens = {
  colors: {
    primary: '#1a365d',
    secondary: '#e2e8f0',
  },
  spacing: {
    sm: '0.5rem',
    md: '1rem',
  }
};
```

---

## ADR-008: Development Workflow

### Status
**Accepted** - December 31, 2025

### Context
Need efficient development workflow for:
1. Working on Shell
2. Working on MFEs
3. Testing MFE integration

### Decision
Use different workflows for different scenarios:

#### Shell Development (with MFE integration)
```bash
# Terminal 1: MFE built and served
npm run build -w apps/workout-mfe && npm run preview -w apps/workout-mfe

# Terminal 2: Shell in dev mode
npm run dev -w apps/shell
```

#### MFE Standalone Development
```bash
# Fast iteration on MFE features
npm run dev -w apps/workout-mfe
# Open localhost:3001 directly
```

#### Full Integration Test
```bash
# Build everything
npm run build

# Preview shell
npm run preview -w apps/shell
```

### Why This Workflow?

| Scenario | Need | Solution |
|----------|------|----------|
| Shell changes | Fast HMR | Shell in dev mode |
| MFE changes in isolation | Fast HMR | MFE in dev mode |
| MFE changes with Shell | Module Federation | MFE build + preview |

### Consequences
- Slightly slower for MFE integration testing
- Fast for isolated development
- Clear separation of concerns

### Consequences
- Slightly slower for MFE integration testing
- Fast for isolated development
- Clear separation of concerns

---

## ADR-009: Cross-MFE Data Persistence

### Status
**Accepted** - January 1, 2026

### Context
MFEs need to share data (e.g., Workout MFE → Analytics MFE), but:
- Events are fire-and-forget (lost if no listener)
- MFEs mount/unmount independently
- Page refresh loses all in-memory state

### Decision
Use **Event Bus + localStorage** together:
- localStorage for persistence across navigation
- Event bus for real-time updates when both MFEs are mounted

### Options Considered

#### Option A: Event Bus Only
**Pros:** Simple, no persistence layer
**Cons:** Events lost when target MFE not mounted

#### Option B: localStorage Only
**Pros:** Data persists
**Cons:** No real-time updates, must poll or refresh

#### Option C: Event Bus + localStorage ✅ CHOSEN
**Pros:** Best of both worlds
**Cons:** Slightly more code

#### Option D: Shared Redux Store
**Pros:** Reactive, automatic updates
**Cons:** Tight coupling, defeats MFE independence

### Consequences
- Workout MFE saves to localStorage AND emits event
- Analytics MFE reads localStorage on mount AND listens for events
- Data survives navigation and page refresh
- Real-time updates work when both MFEs visible

### Example Implementation
```typescript
// Workout MFE - Save
const updated = [newWorkout, ...workouts];
localStorage.setItem('fitlog-workouts', JSON.stringify(updated));
emit(Events.WORKOUT_LOGGED, newWorkout);

// Analytics MFE - Load + Listen
const [count, setCount] = useState(() => {
  const saved = localStorage.getItem('fitlog-workouts');
  return saved ? JSON.parse(saved).length : 0;
});

useEffect(() => {
  const cleanup = on(Events.WORKOUT_LOGGED, () => {
    setCount(prev => prev + 1);
  });
  return cleanup;
}, []);
```

---

## ADR-010: ESLint 9 Configuration

### Status
**Accepted** - January 1, 2026

### Context
ESLint 9 removed support for `.eslintrc.*` files. Our CI failed with:
```
ESLint couldn't find an eslint.config.js file
```

### Decision
Create `eslint.config.js` using ESLint 9's flat config format.

### Key Changes
```javascript
// Old way (.eslintrc.js) - NO LONGER WORKS
module.exports = {
  extends: ['plugin:react/recommended'],
  rules: { ... }
};

// New way (eslint.config.js) - REQUIRED
export default [
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      globals: {
        window: 'readonly',
        localStorage: 'readonly',
        CustomEvent: 'readonly',
      },
    },
    rules: { ... }
  }
];
```

### Consequences
- CI passes with ESLint 9
- Must manually specify globals (window, document, etc.)
- Plugins configured differently than before

---

## Decision Log Summary

| ADR | Decision | Date |
|-----|----------|------|
| 001 | Monorepo with npm workspaces | Dec 31, 2025 |
| 002 | Vite 7 as build tool | Dec 31, 2025 |
| 003 | Minimal global state (auth, user, prefs only) | Dec 31, 2025 |
| 004 | DOM CustomEvents for cross-MFE communication | Dec 31, 2025 |
| 005 | Three shared packages (ui, icons, utils) | Dec 31, 2025 |
| 006 | @originjs/vite-plugin-federation | Dec 31, 2025 |
| 007 | Plain CSS, Design Tokens planned | Dec 31, 2025 |
| 008 | Build + preview for MFE integration | Dec 31, 2025 |
| 009 | Event Bus + localStorage for persistence | Jan 1, 2026 |
| 010 | ESLint 9 flat config | Jan 1, 2026 |
| 011 | Remove user-unknown fields from forms | Jan 1, 2026 |

---

## Template for Future ADRs

```markdown
## ADR-XXX: [Title]

### Status
[Proposed | Accepted | Deprecated | Superseded]

### Context
What is the issue we're addressing?

### Decision
What is the change we're making?

### Options Considered
1. **Option A** - Description
   - Pros: ...
   - Cons: ...

### Consequences
What are the results of this decision?

### References
Links to relevant resources
```

---

## Decision Log Summary

| ADR | Decision | Date |
|-----|----------|------|
| 001 | Monorepo with npm workspaces | Dec 31, 2025 |
| 002 | Vite 7 as build tool | Dec 31, 2025 |
| 003 | Minimal global state (auth, user, prefs only) | Dec 31, 2025 |
| 004 | DOM CustomEvents for cross-MFE communication | Dec 31, 2025 |
| 005 | Three shared packages (ui, icons, utils) | Dec 31, 2025 |
| 006 | @originjs/vite-plugin-federation | Dec 31, 2025 |
| 007 | Plain CSS, Design Tokens planned | Dec 31, 2025 |
| 008 | Build + preview for MFE integration | Dec 31, 2025 |
| 009 | Cross-MFE Data Persistence | Jan 1, 2026 |
| 010 | ESLint 9 Configuration | Dec 31, 2026 |