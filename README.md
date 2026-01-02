# FitLog 🏋️

A production-grade fitness tracking app built with **Micro Frontend architecture** — demonstrating MFE patterns, design tokens, web components, TDD, and modern frontend practices.

## 🎯 What is This?

FitLog is a learning project that implements real-world MFE architecture patterns used by companies like Amazon, IKEA, and Spotify. It's designed to be a reference for developers wanting to understand how to build scalable frontend applications.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        SHELL                            │
│              (Host App - Port 3000)                     │
│         Routing • Auth • Theme • Navigation             │
├─────────────────────────────────────────────────────────┤
│                  MODULE FEDERATION                       │
├───────────────┬───────────────┬─────────────────────────┤
│  Workout MFE  │   Food MFE    │    Analytics MFE        │
│  (Port 3001)  │  (Port 3002)  │     (Port 3003)         │
└───────────────┴───────────────┴─────────────────────────┘
          │               │               │
          └───────────────┴───────────────┘
                          │
              ┌───────────┴───────────┐
              │   SHARED PACKAGES     │
              │  @fitlog/ui           │
              │  @fitlog/icons        │
              │  @fitlog/utils        │
              └───────────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 |
| Build Tool | Vite 7 |
| Module Federation | @originjs/vite-plugin-federation |
| State Management | Redux Toolkit (Shell only) |
| Routing | React Router v6 |
| Language | TypeScript |
| Monorepo | npm workspaces |

## 📁 Project Structure

```
fitlog/
├── apps/
│   ├── shell/              # Host application
│   ├── workout-mfe/        # Workout micro frontend
│   ├── food-mfe/           # Food tracking micro frontend
│   └── analytics-mfe/      # Analytics dashboard micro frontend
├── packages/
│   ├── ui/                 # Shared UI components
│   ├── icons/              # Shared icon components
│   └── utils/              # Shared utilities (event bus, formatters)
├── docs/                   # Documentation
└── package.json            # Workspace configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/vmvenkatesh78/fitlog.git
cd fitlog

# Install dependencies
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

### Why Build + Preview for MFEs?

Vite's dev mode doesn't generate `remoteEntry.js` (required for Module Federation). MFEs must be built first, then served via preview mode.

### Standalone MFE Development

For faster iteration on a single MFE:

```bash
npm run dev -w apps/workout-mfe
# Open http://localhost:3001
```

## 📦 Shared Packages

### @fitlog/ui

Reusable UI components:

```tsx
import { Button, Card, Input } from '@fitlog/ui';

<Button variant="primary" size="lg">Click me</Button>
<Card><p>Content</p></Card>
<Input label="Email" error="Invalid email" />
```

### @fitlog/icons

SVG icons as React components:

```tsx
import { Dumbbell, Apple, ChartBar } from '@fitlog/icons';

<Dumbbell size={24} />
```

### @fitlog/utils

Utilities for cross-MFE communication and formatting:

```tsx
import { emit, on, Events, formatDate, formatCalories } from '@fitlog/utils';

// Event bus - cross-MFE communication
emit(Events.WORKOUT_LOGGED, { exercise: 'Squat', sets: 3 });

on(Events.WORKOUT_LOGGED, (data) => {
  console.log('Workout logged:', data);
});

// Formatters
formatDate(new Date());     // "Dec 31, 2025"
formatCalories(1500);       // "1,500 cal"
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](docs/Architecture.md) | System design and how everything fits together |
| [DECISIONS.md](docs/Decisions.md) | Architecture Decision Records (ADRs) |
| [COMPLETE_GUIDE.md](docs/CompleteGuide.md) | Beginner-friendly guide to every file |
| [LEARNING_JOURNEY.md](docs/LearningJourney.md) | Questions, problems, and solutions |
| [COMMUNICATION.md](docs/Communication.md) | Cross-MFE communication patterns |

## 🗺️ Roadmap

### Completed ✅

- [x] Monorepo setup with npm workspaces
- [x] Shell app with routing and Redux
- [x] Shared packages (ui, icons, utils)
- [x] Workout MFE with Module Federation
- [x] Food MFE
- [x] Analytics MFE
- [x] Cross-MFE event communication
- [x] localStorage persistence
- [x] ESLint 9 configuration

### In Progress 🚧

- [ ] Design Tokens integration
- [ ] More workout features
- [ ] Food logging functionality

### Planned 📋

- [ ] Web Components exploration
- [ ] TDD implementation
- [ ] Performance optimization
- [ ] Deployment to Vercel

## 🔑 Key Achievement

> "A workout logged in one MFE updates analytics in another MFE without shared state."

This proves:
- Loose coupling between MFEs
- No shared Redux abuse
- Real-world MFE interaction pattern

## 🤝 Contributing

This is a learning project, but suggestions and improvements are welcome!

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ as part of a 12-week frontend architecture learning journey.