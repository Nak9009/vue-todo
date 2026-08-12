import { beforeEach, describe, expect, it, vi } from 'vitest'

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi!.fn().mockReturnValue({
    matches,
    addEventListener: vi!.fn(),
  }) as unknown as typeof window.matchMedia
}

describe('useTheme', () => {
  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('defaults to system and applies dark if the OS prefers dark', async () => {
    mockMatchMedia(true)
    const { useTheme } = await import('./useTheme')
    const { theme } = useTheme()

    expect(theme.value).toBe('system')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('setTheme persists to localStorage and toggles the dark class', async () => {
    mockMatchMedia(false)
    const { useTheme } = await import('./useTheme')
    const { setTheme } = useTheme()

    setTheme('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    setTheme('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('cycleTheme moves light → dark → system → light', async () => {
    mockMatchMedia(false)
    const { useTheme } = await import('./useTheme')
    const { theme, setTheme, cycleTheme } = useTheme()

    setTheme('light')
    cycleTheme()
    expect(theme.value).toBe('dark')
    cycleTheme()
    expect(theme.value).toBe('system')
    cycleTheme()
    expect(theme.value).toBe('light')
  })
})
