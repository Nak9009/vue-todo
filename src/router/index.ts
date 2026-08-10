import { createRouter, createWebHistory } from 'vue-router'
import TodoListView from '@/features/todos/views/TodoListView.vue'
import TodoDetailView from '@/features/todos/views/TodoDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: TodoListView,
    },
    {
      path: '/todos/:id',
      name: 'todo-detail',
      component: TodoDetailView,
    },
  ],
})

export default router
