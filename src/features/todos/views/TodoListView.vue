<script setup lang="ts">
import { onMounted } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import TodoInput from '../components/TodoInput.vue'
import TodoList from '../components/TodoList.vue'
import { useTodoStore } from '../store'

const store = useTodoStore()

onMounted(() => {
  store.fetchTodos()
})
</script>

<template>
  <main class="min-h-screen bg-background flex items-start justify-center pt-16 px-4">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle>Todo</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <Alert v-if="store.status === 'error'" variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{{ store.error }}</AlertDescription>
          <Button size="sm" variant="outline" class="mt-2" @click="store.fetchTodos()">
            Retry
          </Button>
        </Alert>

        <div v-else-if="store.status === 'loading'" class="space-y-2">
          <Skeleton class="h-8 w-full" />
          <Skeleton class="h-8 w-full" />
          <Skeleton class="h-8 w-2/3" />
        </div>

        <template v-else>
          <TodoInput />
          <TodoList />
        </template>
      </CardContent>
    </Card>
  </main>
</template>
