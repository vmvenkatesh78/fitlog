# FitLog: Cross-MFE Communication

## Overview

This document explains how Micro Frontends communicate in FitLog without tight coupling.

---

## The Problem

MFEs are independent applications, but they need to share information:

- Workout MFE logs a workout → Analytics MFE updates count
- User changes theme → All MFEs reflect the change

**Challenge:** How do we communicate WITHOUT creating dependencies?

---

## Our Solution: Event Bus + localStorage
```
┌─────────────────┐         Event Bus         ┌─────────────────┐
│   Workout MFE   │ ──── workout:logged ────► │  Analytics MFE  │
│                 │                           │                 │
│  localStorage ◄─┼───────────────────────────┼─► localStorage  │
└─────────────────┘                           └─────────────────┘
```

### Two Patterns Combined

1. **Event Bus** - Real-time updates (when both MFEs are mounted)
2. **localStorage** - Persistence (data survives navigation)

---

## Implementation

### Event Bus (@fitlog/utils)
```typescript
// Emit an event
import { emit, Events } from '@fitlog/utils';

emit(Events.WORKOUT_LOGGED, {
  exercise: 'Squats',
  sets: 3,
  reps: 10,
});

// Listen to an event
import { on, Events } from '@fitlog/utils';

useEffect(() => {
  const cleanup = on(Events.WORKOUT_LOGGED, (data) => {
    console.log('Workout logged:', data);
  });
  return cleanup; // Always cleanup!
}, []);
```

### localStorage for Persistence
```typescript
// Workout MFE - Save
const updatedWorkouts = [newWorkout, ...workouts];
localStorage.setItem('fitlog-workouts', JSON.stringify(updatedWorkouts));

// Analytics MFE - Load
const saved = localStorage.getItem('fitlog-workouts');
const count = saved ? JSON.parse(saved).length : 0;
```

---

## Why Not Shared Redux?

| Approach | Problem |
|----------|---------|
| Shared Redux store | MFEs become tightly coupled |
| | Can't deploy independently |
| | Shell becomes a bottleneck |
| | Hard to extract MFE later |

| Our Approach | Benefit |
|--------------|---------|
| Event Bus | Loose coupling |
| localStorage | Data persists |
| Each MFE owns its state | True independence |

---

## Event Naming Convention
```typescript
// Pattern: domain:action
Events = {
  WORKOUT_LOGGED: 'workout:logged',
  WORKOUT_DELETED: 'workout:deleted',
  MEAL_LOGGED: 'meal:logged',
  MEAL_DELETED: 'meal:deleted',
  USER_UPDATED: 'user:updated',
  THEME_CHANGED: 'theme:changed',
}
```

**Why this pattern?**
- Clear ownership (workout:* belongs to Workout MFE)
- Easy to filter/debug
- Self-documenting

---

## Gotchas & Lessons Learned

### 1. Events are Fire-and-Forget
```
❌ User on /workout → logs workout → goes to /analytics
   Analytics wasn't mounted, missed the event!

✅ Solution: Persist to localStorage, read on mount
```

### 2. localStorage Returns Strings
```typescript
// ❌ Wrong - timestamp is a string after JSON.parse
const workouts = JSON.parse(saved);
workout.timestamp.toLocaleTimeString(); // ERROR!

// ✅ Correct - convert back to Date
const workouts = JSON.parse(saved).map(w => ({
  ...w,
  timestamp: new Date(w.timestamp),
}));
```

### 3. Always Cleanup Event Listeners
```typescript
useEffect(() => {
  const cleanup = on(Events.WORKOUT_LOGGED, handler);
  return cleanup; // ← Important!
}, []);
```

---

## When to Use What

| Scenario | Use |
|----------|-----|
| Real-time update (both MFEs visible) | Event Bus |
| Data must persist across navigation | localStorage |
| User preferences (theme, units) | Redux (Shell) |
| Feature-specific state | useState/useReducer (MFE) |

---

## Trade-offs

### What We Gain
- True MFE independence
- Simple mental model
- Easy to debug (browser DevTools)
- No external dependencies

### What We Accept
- Manual event typing (no automatic TypeScript)
- Must remember to persist important data
- Events lost if no listener mounted

---

## Future Improvements

1. **Typed Events** - Create TypeScript interfaces for event payloads
2. **Event Replay** - Store recent events for late subscribers
3. **Backend Sync** - Replace localStorage with API calls

---

## Summary

> "A workout logged in one MFE updates analytics in another MFE without shared state."

This is achieved through:
1. **Loose coupling** - Event bus, not direct imports
2. **Persistence** - localStorage for data survival
3. **Clear boundaries** - Each MFE owns its domain