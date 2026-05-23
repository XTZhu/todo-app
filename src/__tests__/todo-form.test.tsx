import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoForm from '@/components/todo-form'

function setup() {
  const onAdd = vi.fn()
  const utils = render(<TodoForm onAdd={onAdd} />)
  const input = screen.getByTestId('todo-input') as HTMLInputElement
  const addButton = screen.getByTestId('add-button') as HTMLButtonElement
  return { ...utils, onAdd, input, addButton }
}

describe('TodoForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the form with all inputs', () => {
    setup()
    expect(screen.getByTestId('todo-input')).toBeInTheDocument()
    expect(screen.getByTestId('todo-description-input')).toBeInTheDocument()
    expect(screen.getByTestId('priority-select')).toBeInTheDocument()
    expect(screen.getByTestId('category-select')).toBeInTheDocument()
    expect(screen.getByTestId('due-date-input')).toBeInTheDocument()
    expect(screen.getByTestId('add-button')).toBeInTheDocument()
  })

  it('disables the add button when title is empty', () => {
    setup()
    expect(screen.getByTestId('add-button')).toBeDisabled()
  })

  it('enables the add button when title has text', async () => {
    const user = userEvent.setup()
    const { input, addButton } = setup()
    await user.type(input, 'New Task')
    expect(addButton).not.toBeDisabled()
  })

  it('calls onAdd with correct arguments on submit', async () => {
    const user = userEvent.setup()
    const { onAdd, input } = setup()
    await user.type(input, 'Learn Vitest')
    await user.click(screen.getByTestId('add-button'))
    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(onAdd).toHaveBeenCalledWith('Learn Vitest', '', 'medium', 'personal', null)
  })

  it('calls onAdd on Ctrl+Enter', async () => {
    const user = userEvent.setup()
    const { onAdd, input } = setup()
    await user.type(input, 'Keyboard Task')
    await user.keyboard('{Control>}{Enter}{/Control}')
    expect(onAdd).toHaveBeenCalledTimes(1)
  })

  it('clears the title after successful add', async () => {
    const user = userEvent.setup()
    const { input } = setup()
    await user.type(input, 'Clear Me')
    await user.click(screen.getByTestId('add-button'))
    expect(input.value).toBe('')
  })

  it('does not call onAdd when title is only whitespace', async () => {
    const user = userEvent.setup()
    const { onAdd, input } = setup()
    await user.type(input, '   ')
    await user.click(screen.getByTestId('add-button'))
    expect(onAdd).not.toHaveBeenCalled()
  })
})
