import { ref, watch } from 'vue'

type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'theme'

const theme = ref<Theme>((localStorage.getItem(STORAGE_KEY) as Theme) || 'system')

function systemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(value: Theme) {
  const isDark = value === 'dark' || (value === 'system' && systemPrefersDark())
  document.documentElement.classList.toggle('dark', isDark)
}

applyTheme(theme.value)

watch(theme, (value) => {
  localStorage.setItem(STORAGE_KEY, value)
  applyTheme(value)
})

// Keep in sync if the OS theme changes while "system" is selected.
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (theme.value === 'system') applyTheme('system')
})

export function useTheme() {
  function setTheme(value: Theme) {
    theme.value = value
  }

  function cycleTheme() {
    const order: Theme[] = ['light', 'dark', 'system']
    const next = order[(order.indexOf(theme.value) + 1) % order.length]
    setTheme(next!)
  }

  return { theme, setTheme, cycleTheme }
}
