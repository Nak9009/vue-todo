import type { Todo } from './types'

const STORAGE_KEY = 'todos'
const SIMULATED_LATENCY_MS = 400
const SIMULATED_FAILURE_RATE = 0.15

function readFromStorage(): Todo[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : []
}

function writeToStorage(todos: Todo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function maybeFail() {
  const force = sessionStorage.getItem('force-api-failure')
  if (force === 'true') {
    throw new Error('Network request failed. Please try again.')
  }
  if (force === 'false') {
    return
  }
  if (Math.random() < SIMULATED_FAILURE_RATE) {
    throw new Error('Network request failed. Please try again.')
  }
}

export const todosApi = {
  async list(): Promise<Todo[]> {
    await delay(SIMULATED_LATENCY_MS)
    maybeFail()
    return readFromStorage()
  },

  async create(text: string): Promise<Todo> {
    await delay(SIMULATED_LATENCY_MS)
    maybeFail()

    const todo: Todo = {
      id: crypto.randomUUID(),
      text,
      done: false,
      createdAt: Date.now(),
    }
    const todos = readFromStorage()
    todos.push(todo)
    writeToStorage(todos)
    return todo
  },

  async update(id: string, changes: Partial<Pick<Todo, 'text' | 'done'>>): Promise<Todo> {
    await delay(SIMULATED_LATENCY_MS)
    maybeFail()

    const todos = readFromStorage()
    const todo = todos.find((t) => t.id === id)
    if (!todo) throw new Error('Todo not found')
    Object.assign(todo, changes)
    writeToStorage(todos)
    return todo
  },

  async remove(id: string): Promise<void> {
    await delay(SIMULATED_LATENCY_MS)
    maybeFail()

    writeToStorage(readFromStorage().filter((t) => t.id !== id))
  },
}
