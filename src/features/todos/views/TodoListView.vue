<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import TodoInput from '../components/TodoInput.vue'
import TodoList from '../components/TodoList.vue'
</script>

<template>
  <main class="min-h-screen bg-background flex items-start justify-center pt-16 px-4">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle>Todo</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <TodoInput />
        <TodoList />
      </CardContent>
    </Card>
  </main>
</template>
