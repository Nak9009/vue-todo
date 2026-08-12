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

  await page
    .getByRole('listitem')
    .filter({ hasText: 'Buy milk' })
    .getByRole('button', { name: 'Delete' })
    .click()

  await expect(page.getByText('Buy milk')).toBeHidden()
})

test('todos persist after reload', async ({ page }) => {
  await page.getByPlaceholder('What needs doing?').fill('Buy milk')
  await page.getByRole('button', { name: 'Add' }).click()

  // Auto-wait for optimistic temp ID to be replaced by permanent server ID in href
  const link = page.getByRole('link', { name: 'Buy milk' })
  await expect(link).toHaveAttribute('href', /\/todos\/(?!temp-)/)

  await page.reload()

  await expect(page.getByText('Buy milk')).toBeVisible()
})

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

test('shows an error state and recovers via retry', async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('force-api-failure', 'true')
  })
  await page.goto('/')

  await expect(page.getByText('Something went wrong')).toBeVisible()

  // Turn off the forced failure, then use the Retry button.
  await page.evaluate(() => {
    sessionStorage.setItem('force-api-failure', 'false')
  })
  await page.getByRole('button', { name: 'Retry' }).click()

  await expect(page.getByText('Something went wrong')).toBeHidden()
})
