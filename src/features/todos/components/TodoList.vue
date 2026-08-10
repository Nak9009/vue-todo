<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useTodoStore } from '../store'
import TodoItem from './TodoItem.vue'
import type { TodoFilter } from '../types'

const store = useTodoStore()

const filters: { label: string; value: TodoFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
]
</script>

<template>
  <div class="space-y-4">
    <ul v-if="store.filteredTodos.length">
      <TodoItem v-for="todo in store.filteredTodos" :key="todo.id" :todo="todo" />
    </ul>
    <p v-else class="text-sm text-muted-foreground py-4 text-center">Nothing here yet.</p>

    <div class="flex items-center justify-between text-sm">
      <span class="text-muted-foreground">{{ store.remainingCount }} left</span>

      <div class="flex gap-1">
        <Button
          v-for="f in filters"
          :key="f.value"
          size="sm"
          :variant="store.filter === f.value ? 'secondary' : 'ghost'"
          @click="store.setFilter(f.value)"
        >
          {{ f.label }}
        </Button>
      </div>

      <Button variant="ghost" size="sm" @click="store.clearCompleted()"> Clear completed </Button>
    </div>
  </div>
</template>
