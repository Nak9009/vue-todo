<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { useTodoStore } from '../store'

const route = useRoute()
const router = useRouter()
const store = useTodoStore()

const todo = computed(() => store.todos.find((t) => t.id === route.params.id))

// Local editable copy, so typing doesn't write to the store on every keystroke.
const draftText = ref(todo.value?.text ?? '')
watch(todo, (value) => {
  draftText.value = value?.text ?? ''
})

function saveText() {
  if (!todo.value) return
  const trimmed = draftText.value.trim()
  if (trimmed) todo.value.text = trimmed
}

function handleDelete() {
  if (!todo.value) return
  store.removeTodo(todo.value.id)
  router.push('/')
}
</script>

<template>
  <main class="min-h-screen bg-background flex items-start justify-center pt-16 px-4">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle>Todo detail</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <template v-if="todo">
          <div class="flex items-center gap-3">
            <Checkbox :model-value="todo.done" @update:model-value="store.toggleTodo(todo!.id)" />
            <span class="text-sm text-muted-foreground">
              {{ todo.done ? 'Completed' : 'Active' }}
            </span>
          </div>

          <Input v-model="draftText" @blur="saveText" @keyup.enter="saveText" />

          <div class="flex justify-between">
            <Button variant="outline" @click="router.push('/')">Back</Button>
            <Button variant="destructive" @click="handleDelete">Delete</Button>
          </div>
        </template>

        <template v-else>
          <p class="text-sm text-muted-foreground">
            This todo doesn't exist — it may have been deleted.
          </p>
          <Button variant="outline" @click="router.push('/')">Back to list</Button>
        </template>
      </CardContent>
    </Card>
  </main>
</template>
