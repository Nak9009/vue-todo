<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTodoStore } from '../store'

const store = useTodoStore()
const text = ref('')

function handleSubmit() {
  store.addTodo(text.value)
  text.value = ''
}
</script>

<template>
  <form class="flex gap-2" @submit.prevent="handleSubmit">
    <Input v-model="text" placeholder="What needs doing?" />
    <Button type="submit">Add</Button>
  </form>
</template>
