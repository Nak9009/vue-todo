<script setup lang="ts">
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { useTodoStore } from '../store'
import type { Todo } from '../types'

const props = defineProps<{ todo: Todo }>()
const store = useTodoStore()
</script>

<template>
  <li class="flex items-center gap-3 py-2 border-b last:border-0">
    <Checkbox
      :model-value="props.todo.done"
      @update:model-value="store.toggleTodo(props.todo.id)"
    />
    <span class="flex-1 text-sm" :class="{ 'line-through text-muted-foreground': props.todo.done }">
      {{ props.todo.text }}
    </span>
    <Button variant="ghost" size="sm" @click="store.removeTodo(props.todo.id)"> Delete </Button>
  </li>
</template>
