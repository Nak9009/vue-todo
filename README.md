# Vue Todo App — Tutorial Project

A hands-on tutorial project for learning **Vue 3** fundamentals through building a fully-featured Todo application. This project is designed for students who want to understand modern Vue 3 patterns in a real-world context.

## 🎯 What You'll Learn

- **Vue 3 Composition API** — `ref`, `computed`, `watch`, and `<script setup>`
- **Pinia** — Modern state management for Vue apps
- **Vue Router** — Client-side routing basics
- **Composables** — Reusable logic with custom composable functions (e.g. `useLocalStorage`)
- **TypeScript** — Typed props, store state, and component interfaces
- **Component Design** — Feature-based folder structure and UI component reuse
- **Unit Testing** — Writing tests with Vitest and Vue Test Utils
- **Code Quality** — Formatting with Prettier, linting with ESLint + OxLint, and Git hooks via Husky

---

## 🗂️ Project Structure

```
src/
├── features/
│   └── todos/
│       ├── components/       # TodoInput, TodoList, etc.
│       ├── composables/      # useLocalStorage.ts
│       ├── store.ts          # Pinia store (state + actions)
│       ├── store.spec.ts     # Unit tests for the store
│       └── types.ts          # Todo & TodoFilter TypeScript types
├── components/
│   └── ui/                   # Reusable UI components (Button, Card, Input…)
├── __tests__/                # App-level tests
├── test/
│   └── setup.ts              # Vitest global setup (localStorage mock)
├── App.vue                   # Root component
└── main.ts                   # App entry point
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `^22.18.0` or `>=24.12.0`
- **npm** (comes with Node.js)

### 1. Install Dependencies

```sh
npm install
```

### 2. Start the Development Server

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The page reloads automatically as you edit files.

---

## 🧪 Running Tests

### Unit Tests (Vitest)

```sh
npm run test:unit
```

Tests are located in `src/features/todos/store.spec.ts` and `src/__tests__/App.spec.ts`. They cover:
- Adding and ignoring empty todos
- Toggling a todo's done state
- Filtering by `all` / `active` / `completed`
- App component mounting

### End-to-End Tests (Playwright)

```sh
# Install browsers (first time only)
npx playwright install

# Run all e2e tests
npm run test:e2e

# Run only in Chromium
npm run test:e2e -- --project=chromium

# Run a specific test file
npm run test:e2e -- tests/example.spec.ts

# Debug mode
npm run test:e2e -- --debug
```

---

## 🔑 Key Concepts Explained

### Pinia Store (`store.ts`)

The todo store holds all app state and logic in one place:

```ts
// src/features/todos/store.ts
export const useTodoStore = defineStore('todos', () => {
  const todos = useLocalStorage<Todo[]>('todos', [])  // persisted state
  const filter = useLocalStorage<TodoFilter>('todos-filter', 'all')

  const filteredTodos = computed(() => { /* ... */ })

  function addTodo(text: string) { /* ... */ }
  function toggleTodo(id: string) { /* ... */ }

  return { todos, filter, filteredTodos, addTodo, toggleTodo, /* ... */ }
})
```

> **Student tip:** Notice the store uses a *setup function* style (not the options object style). This closely mirrors the Composition API you use in components.

### Custom Composable (`useLocalStorage.ts`)

A composable is a plain function that encapsulates reactive logic and can be reused across the app:

```ts
// src/features/todos/composables/useLocalStorage.ts
export function useLocalStorage<T>(key: string, initialValue: T): Ref<T> {
  const stored = localStorage.getItem(key)
  const data = ref<T>(stored ? JSON.parse(stored) : initialValue) as Ref<T>

  watch(data, (value) => {
    localStorage.setItem(key, JSON.stringify(value))
  }, { deep: true })

  return data
}
```

> **Student tip:** This is the same pattern used by the popular VueUse library. Understanding this shows you how composables replace Vue 2 mixins.

### TypeScript Types (`types.ts`)

```ts
export interface Todo {
  id: string
  text: string
  done: boolean
  createdAt: number
}

export type TodoFilter = 'all' | 'active' | 'completed'
```

> **Student tip:** Defining types separately keeps your store and components clean and makes refactoring safe.

---

## 🛠️ Other Commands

| Command | Description |
|---|---|
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint + OxLint and auto-fix |
| `npm run format` | Format source files with Prettier |

---

## 🧰 Recommended IDE Setup

- **Editor:** [VS Code](https://code.visualstudio.com/)
- **Extension:** [Vue (Official / Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) — disable Vetur if installed
- **Browser Extension:** [Vue DevTools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) for Chrome/Edge/Brave

---

## 📚 Further Reading

- [Vue 3 Docs](https://vuejs.org/guide/introduction.html)
- [Pinia Docs](https://pinia.vuejs.org/)
- [Vue Router Docs](https://router.vuejs.org/)
- [Vitest Docs](https://vitest.dev/)
- [Vue Test Utils Docs](https://test-utils.vuejs.org/)
- [Vite Configuration Reference](https://vite.dev/config/)
