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
│               │   (planned)   │      (planned)          │
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
│   ├── food-mfe/           # Food tracking (planned)
│   └── analytics-mfe/      # Analytics dashboard (planned)
├── packages/
│   ├── ui/                 # Shared UI components
│   ├── icons/              # Shared icon components
│   └── utils/              # Shared utilities
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

You need **two terminals** to run the full MFE setup:

**Terminal 1 - Workout MFE (build + preview):**
```bash
npm run build -w apps/workout-mfe && npm run preview -w apps/workout-mfe
```

**Terminal 2 - Shell (dev mode):**
```bash
npm run dev -w apps/shell
```

Open http://localhost:3000

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
import { emit, on, formatDate, formatCalories } from '@fitlog/utils';

// Event bus
emit('workout:logged', { exercise: 'Squat', sets: 3 });
on('workout:logged', (data) => console.log(data));

// Formatters
formatDate(new Date());     // "Dec 31, 2024"
formatCalories(1500);       // "1,500 cal"
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](docs/Architecture.md) | System design and how everything fits together |
| [DECISIONS.md](docs/Decisionss.md) | Architecture Decision Records (ADRs) |
| [COMPLETE_GUIDE.md](docs/CompleteGuide.md) | Beginner-friendly guide to every file |
| [LEARNING_JOURNEY.md](docs/LearningJourney.md) | Questions, problems, and solutions |
| [MFE Communication.md](docs/Communication.md) | Explains MFE communication |

## 🗺️ Roadmap

- [x] Monorepo setup with npm workspaces
- [x] Shell app with routing and Redux
- [x] Shared packages (ui, icons, utils)
- [x] Workout MFE with Module Federation
- [ ] Food MFE
- [ ] Analytics MFE
- [ ] Cross-MFE event communication
- [ ] Design Tokens integration
- [ ] Web Components
- [ ] TDD implementation
- [ ] Performance optimization

## 🤝 Contributing

This is a learning project, but suggestions and improvements are welcome!

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ as part of a 12-week frontend architecture learning journey.