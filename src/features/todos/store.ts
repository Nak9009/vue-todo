import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { todosApi } from './api'
import type { Todo, TodoFilter } from './types'

export const useTodoStore = defineStore('todos', () => {
  const todos = ref<Todo[]>([])
  const filter = ref<TodoFilter>('all')
  const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
  const error = ref<string | null>(null)

  const filteredTodos = computed(() => {
    if (filter.value === 'active') return todos.value.filter((t) => !t.done)
    if (filter.value === 'completed') return todos.value.filter((t) => t.done)
    return todos.value
  })

  const remainingCount = computed(() => todos.value.filter((t) => !t.done).length)

  async function fetchTodos() {
    status.value = 'loading'
    error.value = null
    try {
      todos.value = await todosApi.list()
      status.value = 'success'
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Something went wrong'
      status.value = 'error'
    }
  }

  async function addTodo(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return

    // Optimistic: show it immediately, using a temporary id.
    const tempId = `temp-${crypto.randomUUID()}`
    const optimisticTodo: Todo = { id: tempId, text: trimmed, done: false, createdAt: Date.now() }
    todos.value.push(optimisticTodo)

    try {
      const saved = await todosApi.create(trimmed)
      const index = todos.value.findIndex((t) => t.id === tempId)
      if (index !== -1) todos.value[index] = saved
    } catch (err) {
      // Roll back the optimistic entry.
      todos.value = todos.value.filter((t) => t.id !== tempId)
      error.value = err instanceof Error ? err.message : 'Failed to add todo'
    }
  }

  async function toggleTodo(id: string) {
    const todo = todos.value.find((t) => t.id === id)
    if (!todo) return

    const previous = todo.done
    todo.done = !todo.done // optimistic

    try {
      await todosApi.update(id, { done: todo.done })
    } catch (err) {
      todo.done = previous // rollback
      error.value = err instanceof Error ? err.message : 'Failed to update todo'
    }
  }

  async function removeTodo(id: string) {
    const index = todos.value.findIndex((t) => t.id === id)
    if (index === -1) return

    const [removed] = todos.value.splice(index, 1) // optimistic

    try {
      await todosApi.remove(id)
    } catch (err) {
      todos.value.splice(index, 0, removed!) // rollback
      error.value = err instanceof Error ? err.message : 'Failed to delete todo'
    }
  }

  function setFilter(value: TodoFilter) {
    filter.value = value
  }

  async function clearCompleted() {
    const completed = todos.value.filter((t) => t.done)
    for (const todo of completed) {
      await removeTodo(todo.id)
    }
  }

  return {
    todos,
    filter,
    status,
    error,
    filteredTodos,
    remainingCount,
    fetchTodos,
    addTodo,
    toggleTodo,
    removeTodo,
    setFilter,
    clearCompleted,
  }
})
