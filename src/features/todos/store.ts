import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from './composables/useLocalStorage'
import type { Todo, TodoFilter } from './types'

export const useTodoStore = defineStore('todos', () => {
  const todos = useLocalStorage<Todo[]>('todos', [])
  const filter = useLocalStorage<TodoFilter>('todos-filter', 'all')

  const filteredTodos = computed(() => {
    if (filter.value === 'active') return todos.value.filter((t) => !t.done)
    if (filter.value === 'completed') return todos.value.filter((t) => t.done)
    return todos.value
  })

  const remainingCount = computed(() => todos.value.filter((t) => !t.done).length)

  function addTodo(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return

    todos.value.push({
      id: crypto.randomUUID(),
      text: trimmed,
      done: false,
      createdAt: Date.now(),
    })
  }

  function toggleTodo(id: string) {
    const todo = todos.value.find((t) => t.id === id)
    if (todo) todo.done = !todo.done
  }

  function removeTodo(id: string) {
    todos.value = todos.value.filter((t) => t.id !== id)
  }

  function setFilter(value: TodoFilter) {
    filter.value = value
  }

  function clearCompleted() {
    todos.value = todos.value.filter((t) => !t.done)
  }

  return {
    todos,
    filter,
    filteredTodos,
    remainingCount,
    addTodo,
    toggleTodo,
    removeTodo,
    setFilter,
    clearCompleted,
  }
})
