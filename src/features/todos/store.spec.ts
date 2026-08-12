// oxlint-disable vitest/require-mock-type-parameters
import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTodoStore } from './store'
import { todosApi } from './api'
import type { Todo } from './types'

vi.mock('./api', () => ({
  todosApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return { id: '1', text: 'Test', done: false, createdAt: Date.now(), ...overrides }
}

describe('todo store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetches todos and sets status to success', async () => {
    vi.mocked(todosApi.list).mockResolvedValue([makeTodo()])
    const store = useTodoStore()

    await store.fetchTodos()

    expect(store.status).toBe('success')
    expect(store.todos).toHaveLength(1)
  })

  it('sets status to error when fetch fails', async () => {
    vi.mocked(todosApi.list).mockRejectedValue(new Error('boom'))
    const store = useTodoStore()

    await store.fetchTodos()

    expect(store.status).toBe('error')
    expect(store.error).toBe('boom')
  })

  it('adds a todo optimistically, then reconciles with the server response', async () => {
    const saved = makeTodo({ id: 'server-id', text: 'Learn Vue' })
    vi.mocked(todosApi.create).mockResolvedValue(saved)
    const store = useTodoStore()

    const promise = store.addTodo('Learn Vue')
    expect(store.todos).toHaveLength(1) // optimistic entry already present
    expect(store.todos[0]!.id).toMatch(/^temp-/)

    await promise
    expect(store.todos).toHaveLength(1)
    expect(store.todos[0]!.id).toBe('server-id')
  })

  it('rolls back an optimistic add if the server call fails', async () => {
    vi.mocked(todosApi.create).mockRejectedValue(new Error('failed'))
    const store = useTodoStore()

    await store.addTodo('Learn Vue')

    expect(store.todos).toHaveLength(0)
    expect(store.error).toBe('failed')
  })

  it('rolls back a toggle if the server call fails', async () => {
    vi.mocked(todosApi.list).mockResolvedValue([makeTodo({ done: false })])
    vi.mocked(todosApi.update).mockRejectedValue(new Error('failed'))
    const store = useTodoStore()
    await store.fetchTodos()

    await store.toggleTodo('1')

    expect(store.todos![0]!.done).toBe(false) // rolled back
  })
})
