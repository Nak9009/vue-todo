# Lesson 4: End-to-End Testing with Playwright

**Where we left off:** an async API layer with loading/error states, optimistic updates, and a unit test suite that mocks the API layer.

**What’s new in this lesson:** `create-vue` scaffolded Playwright back in Lesson 1’s setup wizard, but — like the router in Lesson 2 — we’ve never used it. Unit tests (what we’ve written so far) test the store’s logic in isolation, with the API mocked out. **End-to-end (E2E) tests** do the opposite: a real browser, the real app, the real (mock) API, clicking through actual UI — catching integration bugs that unit tests structurally can’t see (a broken route, a component that never got wired up, a CSS class that hides a button).

**What you’ll learn:**
- What E2E tests catch that unit tests don’t, and why you want both
- Playwright locators (`getByRole`, `getByPlaceholder`, `getByText`) and auto-waiting
- Handling optimistic UI updates in Playwright (`toHaveAttribute` auto-waiting for server IDs)
- Testing a full user flow across two routes
- Testing persistence across a page reload
- Deliberately forcing your app’s error state for a test, using a test-only hook

**Prerequisites:** Lesson 3 complete — async store, loading/error UI, and `npx vitest run` passing.

---

## Step 1 — Confirm your Playwright setup

If you picked **End-to-End Testing → Playwright** in `create-vue`’s wizard, you already have:

```
e2e/
  vue.spec.ts        # a default example test
playwright.config.ts
```

Open `playwright.config.ts` and check the `webServer` and `use` configuration — `create-vue` configures Playwright to boot the dev server automatically on port `5173`. Make sure `headless: true` is set in the `use` options so tests run silently without stealing window focus:

`*playwright.config.ts*`

```ts
export default defineConfig({
  use: {
    baseURL: process.env.CI ? 'http://localhost:4173' : 'http://localhost:5173',
    trace: 'on-first-retry',
    headless: true,
  },
  // ...
})
```

If Playwright wasn’t installed, add it now:

```bash
npm init playwright@latest
```

Delete the example `e2e/vue.spec.ts` — we’ll replace it with our own tests.

---

## Step 2 — Make the app testable and complete the detail edit flow

A few small additions make our app testable and ensure detail text edits persist properly through our API layer.

1. **Add `updateTodoText` to Pinia store**:

`*src/features/todos/store.ts*` — add an action to persist text changes:

```ts
async function updateTodoText(id: string, text: string) {
  const todo = todos.value.find((t) => t.id === id)
  if (!todo) return

  const previous = todo.text
  todo.text = text // optimistic

  try {
    await todosApi.update(id, { text })
  } catch (err) {
    todo.text = previous // rollback
    error.value = err instanceof Error ? err.message : 'Failed to update todo'
  }
}
```

Make sure `updateTodoText` is included in the store's return object.

2. **Update the detail view to use `updateTodoText` and add input placeholder**:

`*src/features/todos/views/TodoDetailView.vue*` — update `saveText` and `<Input>`:

```ts
function saveText() {
  if (!todo.value) return
  const trimmed = draftText.value.trim()
  if (trimmed && trimmed !== todo.value.text) {
    store.updateTodoText(todo.value.id, trimmed)
  }
}
```

```html
<Input v-model="draftText" placeholder="Todo text" @blur="saveText" @keyup.enter="saveText" />
```

3. **Add accessible aria-label to checkboxes**:

`*src/features/todos/components/TodoItem.vue*`:

```html
<Checkbox
  :model-value="props.todo.done"
  :aria-label="`Mark '${props.todo.text}' as done`"
  @update:model-value="store.toggleTodo(props.todo.id)"
/>
```

---

## Step 3 — Test the core flow: add, toggle, delete

`*e2e/todos.spec.ts*`

```tsx
import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('force-api-failure', 'false')
  })
  await page.goto('/')
})

test('adds a todo', async ({ page }) => {
  await page.getByPlaceholder('What needs doing?').fill('Buy milk')
  await page.getByRole('button', { name: 'Add' }).click()

  await expect(page.getByText('Buy milk')).toBeVisible()
})

test('toggles a todo as done', async ({ page }) => {
  await page.getByPlaceholder('What needs doing?').fill('Buy milk')
  await page.getByRole('button', { name: 'Add' }).click()

  const checkbox = page.getByRole('checkbox', { name: "Mark 'Buy milk' as done" })
  await checkbox.click()

  await expect(checkbox).toBeChecked()
  await expect(page.getByText('Buy milk')).toHaveClass(/line-through/)
})

test('deletes a todo', async ({ page }) => {
  await page.getByPlaceholder('What needs doing?').fill('Buy milk')
  await page.getByRole('button', { name: 'Add' }).click()
  await expect(page.getByText('Buy milk')).toBeVisible()

  await page.getByRole('listitem').filter({ hasText: 'Buy milk' }).getByRole('button', { name: 'Delete' }).click()

  await expect(page.getByText('Buy milk')).toBeHidden()
})
```

**Why no manual `waitFor`/`sleep` calls anywhere?** Playwright’s locators auto-retry — `expect(...).toBeVisible()` and `toBeHidden()` poll until true (or time out), so they naturally ride out simulated latency without explicit sleep calls.

---

## Step 4 — Test persistence across a reload

When adding a todo with optimistic updates, the item appears in the DOM immediately with a temporary ID (`temp-...`). The backend API takes 400ms to assign a permanent server ID and save it to `localStorage`.

To test reloading reliably, we auto-wait until the `href` on the link updates from `temp-` to the permanent server ID before calling `page.reload()`:

```tsx
test('todos persist after reload', async ({ page }) => {
  await page.getByPlaceholder('What needs doing?').fill('Buy milk')
  await page.getByRole('button', { name: 'Add' }).click()
  
  // Auto-wait for optimistic temp ID to be replaced by permanent server ID
  const link = page.getByRole('link', { name: 'Buy milk' })
  await expect(link).toHaveAttribute('href', /\/todos\/(?!temp-)/)

  await page.reload()

  await expect(page.getByText('Buy milk')).toBeVisible()
})
```

---

## Step 5 — Test the routing flow: list → detail → edit → back

```tsx
test('edits a todo from the detail view', async ({ page }) => {
  await page.getByPlaceholder('What needs doing?').fill('Original text')
  await page.getByRole('button', { name: 'Add' }).click()
  
  // Auto-wait for optimistic temp ID to be replaced by permanent server ID
  const link = page.getByRole('link', { name: 'Original text' })
  await expect(link).toHaveAttribute('href', /\/todos\/(?!temp-)/)

  await link.click()
  await expect(page).toHaveURL(/\/todos\/.+/)

  const detailInput = page.getByPlaceholder('Todo text')
  await detailInput.fill('Updated text')
  await detailInput.blur()

  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByText('Updated text')).toBeVisible()
})

test('shows a not-found message for a bad todo id', async ({ page }) => {
  await page.goto('/todos/does-not-exist')

  await expect(page.getByText(/doesn't exist/)).toBeVisible()
})
```

---

## Step 6 — Force the error state, on purpose

The store’s API layer fails randomly ~15% of the time by design (from Lesson 3). For deterministic tests, we set `force-api-failure` to `'false'` in `beforeEach`, and flip it to `'true'` on command when testing failure recovery:

`*src/features/todos/api.ts*` — update `maybeFail`:

```tsx
function maybeFail() {
  const force = sessionStorage.getItem('force-api-failure')
  if (force === 'true') {
    throw new Error('Network request failed. Please try again.')
  }
  if (force === 'false') {
    return
  }
  if (Math.random() < SIMULATED_FAILURE_RATE) {
    throw new Error('Network request failed. Please try again.')
  }
}
```

Now write the failure and recovery test in `e2e/todos.spec.ts`:

```tsx
test('shows an error state and recovers via retry', async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('force-api-failure', 'true')
  })
  await page.goto('/')

  await expect(page.getByText('Something went wrong')).toBeVisible()

  // Turn off forced failure, then click Retry
  await page.evaluate(() => {
    sessionStorage.setItem('force-api-failure', 'false')
  })
  await page.getByRole('button', { name: 'Retry' }).click()

  await expect(page.getByText('Something went wrong')).toBeHidden()
})
```

Run all tests:

```bash
npx playwright test
```

All 21 test targets (7 tests × 3 browsers) should pass cleanly!

---

## Step 7 — Look at the HTML report

Playwright generates a report automatically on failure (and can generate one always):

```bash
npx playwright show-report
```

---

## Recap

You added:
- A `playwright.config.ts`-driven E2E suite running headless across Chromium, WebKit, and Firefox.
- Robust handling of optimistic UI state with `toHaveAttribute` auto-waiting.
- Full test coverage for CRUD actions, page reloads, routing, and error states.
- Persisted text editing via `store.updateTodoText`.

## Exercises

1. **Test the “Clear completed” button** — add a todo, mark it done, click “Clear completed,” assert it’s gone while an untouched active todo remains.
2. **Visual regression** — use `expect(page).toHaveScreenshot()` on the list view to catch unintended visual changes.
3. **CI integration** — add a GitHub Actions workflow that runs `npx playwright install --with-deps && npx playwright test` on every pull request.