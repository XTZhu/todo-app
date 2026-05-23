import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoFilter from '@/components/todo-filter'

function setup() {
  const onFilterStatusChange = vi.fn()
  const onFilterCategoryChange = vi.fn()
  const onSortByChange = vi.fn()
  const utils = render(
    <TodoFilter
      filterStatus="all"
      filterCategory="all"
      sortBy="createdAt"
      onFilterStatusChange={onFilterStatusChange}
      onFilterCategoryChange={onFilterCategoryChange}
      onSortByChange={onSortByChange}
    />
  )
  return { ...utils, onFilterStatusChange, onFilterCategoryChange, onSortByChange }
}

describe('TodoFilter', () => {
  it('renders all three select controls', () => {
    setup()
    expect(screen.getByTestId('filter-status')).toBeInTheDocument()
    expect(screen.getByTestId('filter-category')).toBeInTheDocument()
    expect(screen.getByTestId('sort-by')).toBeInTheDocument()
  })

  it('calls onFilterStatusChange when status filter changes', async () => {
    const user = userEvent.setup()
    const { onFilterStatusChange } = setup()
    await user.selectOptions(screen.getByTestId('filter-status'), 'done')
    expect(onFilterStatusChange).toHaveBeenCalledWith('done')
  })

  it('calls onFilterCategoryChange when category filter changes', async () => {
    const user = userEvent.setup()
    const { onFilterCategoryChange } = setup()
    await user.selectOptions(screen.getByTestId('filter-category'), 'work')
    expect(onFilterCategoryChange).toHaveBeenCalledWith('work')
  })

  it('calls onSortByChange when sort order changes', async () => {
    const user = userEvent.setup()
    const { onSortByChange } = setup()
    await user.selectOptions(screen.getByTestId('sort-by'), 'priority')
    expect(onSortByChange).toHaveBeenCalledWith('priority')
  })
})
