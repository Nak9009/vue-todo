import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import TodoDetailView from './TodoDetailView.vue'
import TodoListView from './TodoListView.vue'
import { useTodoStore } from '../store'

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'todos', component: TodoListView },
      { path: '/todos/:id', name: 'todo-detail', component: TodoDetailView },
    ],
  })
}

describe('TodoDetailView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('shows the todo matching the route param', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useTodoStore()
    store.addTodo('Learn Vue Router')
    const id = store.todos[0]?.id

    const router = createTestRouter()
    router.push(`/todos/${id}`)
    await router.isReady()

    const wrapper = mount(TodoDetailView, {
      global: { plugins: [router, pinia] },
    })

    expect(wrapper.text()).toContain('Learn Vue Router')
  })

  it('shows a not-found message for a bad id', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const router = createTestRouter()
    router.push('/todos/does-not-exist')
    await router.isReady()

    const wrapper = mount(TodoDetailView, {
      global: { plugins: [router, pinia] },
    })

    expect(wrapper.text()).toContain("doesn't exist")
  })
})
