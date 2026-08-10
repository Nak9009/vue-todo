import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useTodoStore } from './store'

describe('todo store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('adds a todo', () => {
    const store = useTodoStore()
    store.addTodo('Learn Vue')
    expect(store.todos).toHaveLength(1)
    expect(store.todos[0]!.text).toBe('Learn Vue')
    expect(store.todos[0]!.done).toBe(false)
  })

  it('ignores empty or whitespace-only text', () => {
    const store = useTodoStore()
    store.addTodo('   ')
    expect(store.todos).toHaveLength(0)
  })

  it('toggles a todo', () => {
    const store = useTodoStore()
    store.addTodo('Learn Vue')
    const id = store.todos[0]!.id
    store.toggleTodo(id)
    expect(store.todos[0]!.done).toBe(true)
  })

  it('filters by active/completed', () => {
    const store = useTodoStore()
    store.addTodo('A')
    store.addTodo('B')
    store.toggleTodo(store.todos[0]!.id)

    store.setFilter('completed')
    expect(store.filteredTodos).toHaveLength(1)

    store.setFilter('active')
    expect(store.filteredTodos).toHaveLength(1)

    store.setFilter('all')
    expect(store.filteredTodos).toHaveLength(2)
  })
})
