<script setup lang="ts">
import { Sun, Moon, Monitor } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/composables/useTheme'

const { theme, setTheme } = useTheme()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" size="icon" aria-label="Toggle theme">
        <Sun v-if="theme === 'light'" class="size-4" />
        <Moon v-else-if="theme === 'dark'" class="size-4" />
        <Monitor v-else class="size-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @click="setTheme('light')">Light</DropdownMenuItem>
      <DropdownMenuItem @click="setTheme('dark')">Dark</DropdownMenuItem>
      <DropdownMenuItem @click="setTheme('system')">System</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
