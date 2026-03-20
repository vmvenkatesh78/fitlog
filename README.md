# FitLog

A fitness tracking app built with **Micro Frontend architecture** — three independent modules (workout logging, food tracking, analytics) that communicate through events and share a design-token-driven UI system.

## The Problem

Fitness tracking is fragmented — workouts in one app, food in another, progress analytics nowhere. FitLog solves this with a single app where three independent modules share data through events and a common design system. The architecture demonstrates how teams scale frontend development independently: each module can be developed, tested, and deployed without touching the others.

**Live:** [fitlog-shell.vercel.app](https://fitlog-shell.vercel.app)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        SHELL                            │
│              (Host App - Port 3000)                     │
│     Routing · Auth · Theme · Navigation · Dashboard     │
├─────────────────────────────────────────────────────────┤
│                  MODULE FEDERATION                       │
├───────────────┬───────────────┬─────────────────────────┤
│  Workout MFE  │   Food MFE    │    Analytics MFE        │
│  (Port 3001)  │  (Port 3002)  │     (Port 3003)         │
│               │               │                         │
│  Log sets,    │  Log meals,   │  Daily/weekly stats,    │
│  reps, cals   │  macros       │  CSS bar chart          │
└───────────────┴───────────────┴─────────────────────────┘
          │               │               │
          └───────────────┴───────────────┘
                          │
              ┌───────────┴───────────────┐
              │     SHARED PACKAGES       │
              │  @fitlog/ui   @fitlog/api  │
              │  @fitlog/icons             │
              │  @fitlog/utils             │
              └───────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 |
| Build Tool | Vite 7 |
| Module Federation | @originjs/vite-plugin-federation |
| State Management | Redux Toolkit (Shell global), useState (MFE local) |
| Routing | React Router v6 |
| Language | TypeScript (strict mode) |
| Styling | CSS Custom Properties (design tokens) |
| Monorepo | npm workspaces |
| CI | GitHub Actions (lint + build) |

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+

### Installation

```bash
git clone https://github.com/vmvenkatesh78/fitlog.git
cd fitlog
npm install
```

### Development

You need **4 terminals** to run the full MFE setup:

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

Open http://localhost:3000

MFEs require `build + preview` because Vite's dev mode doesn't generate `remoteEntry.js` (required for Module Federation). For faster iteration on a single MFE, run it standalone: `npm run dev -w apps/workout-mfe`.

## Project Structure

```
fitlog/
├── apps/
│   ├── shell/              # Host — routing, auth, theme, dashboard
│   ├── workout-mfe/        # Workout logging (sets, reps, calories)
│   ├── food-mfe/           # Food tracking (meals, calories, macros)
│   └── analytics-mfe/      # Analytics dashboard (stats, weekly chart)
├── packages/
│   ├── ui/                 # Shared UI components + design tokens
│   ├── icons/              # SVG icon components
│   ├── utils/              # Event bus + formatters
│   └── api/                # Typed localStorage abstraction
├── docs/                   # Architecture, decisions, guides
└── package.json            # Workspace configuration
```

## Shared Packages

### @fitlog/ui

Design-token-driven UI components:

```tsx
import { Button, Card, CardHeader, CardBody, Input, ErrorBoundary } from '@fitlog/ui';
```

All components use CSS custom properties defined in `tokens.css`. Light and dark themes switch via `data-theme="dark"` on the root element.

### @fitlog/api

Typed localStorage abstraction — centralizes data access, handles serialization errors, provides domain types:

```tsx
import { getWorkouts, saveWorkout, getMeals, saveMeal, getDailySummary } from '@fitlog/api';
import type { Workout, Meal, DailySummary } from '@fitlog/api';
```

### @fitlog/utils

Cross-MFE event bus (DOM CustomEvents) and formatters:

```tsx
import { emit, on, Events, formatCalories, formatRelativeTime } from '@fitlog/utils';

emit(Events.WORKOUT_LOGGED, { exercise: 'Squat', sets: 3 });

on(Events.WORKOUT_LOGGED, (data) => {
  // Analytics MFE updates in real-time
});
```

### @fitlog/icons

SVG icons as React components:

```tsx
import { Dumbbell, Apple, ChartBar } from '@fitlog/icons';
```

## Cross-MFE Communication

Two patterns combined:

- **Event bus** — real-time updates when both MFEs are mounted (workout logged → analytics count updates)
- **localStorage via @fitlog/api** — persistence across navigation (data survives page transitions)

Each MFE owns its domain data. No shared Redux between MFEs. Shell Redux holds only global concerns (auth, user, theme preferences).

## Design Decisions

All architectural decisions are documented as ADRs in [docs/decisions.md](docs/decisions.md):

- ADR-001: Monorepo vs polyrepo
- ADR-002: Build tool selection (Vite)
- ADR-003: State management strategy
- ADR-004: Cross-MFE communication (event bus + localStorage)
- ADR-005: Shared packages structure
- ADR-006: Module Federation plugin
- ADR-007: Styling approach (CSS custom properties)
- ADR-008: Development workflow
- ADR-009: Cross-MFE data persistence
- ADR-010: ESLint 9 configuration
- ADR-011: Form field design

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/Architecture.md) | System design and how everything fits together |
| [Decisions](docs/decisions.md) | Architecture Decision Records |
| [Communication](docs/Communication.md) | Cross-MFE event bus patterns |
| [Complete Guide](docs/CompleteGuide.md) | Beginner-friendly walkthrough |
| [Learning Journey](docs/LearningJourney.md) | Problems encountered and solutions |

## Key Patterns Demonstrated

- **Micro Frontend architecture** with Module Federation runtime loading
- **Event-driven communication** between independent modules (no shared state abuse)
- **Design tokens** as CSS custom properties with light/dark theme support
- **Monorepo with npm workspaces** — shared packages, single dependency tree
- **ErrorBoundary wrapping** for resilient remote MFE loading
- **Typed data access layer** centralizing localStorage with error handling
- **Four-state async pattern** — loading, error, empty, success states in every view

## License

MIT License — see [LICENSE](LICENSE) for details.
