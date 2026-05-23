import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoItem from '@/components/todo-item'
import type { Todo } from '@/types/todo'

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: '1',
    title: 'Test Task',
    description: 'A test description',
    priority: 'high',
    status: 'todo',
    category: 'work',
    dueDate: '2026-06-01',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

function setup(todo: Todo) {
  const onToggle = vi.fn()
  const onDelete = vi.fn()
  const onUpdate = vi.fn()
  const utils = render(<TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} onUpdate={onUpdate} />)
  return { ...utils, onToggle, onDelete, onUpdate }
}

describe('TodoItem', () => {
  it('renders the task title and description', () => {
    setup(makeTodo())
    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('A test description')).toBeInTheDocument()
  })

  it('renders due date when present', () => {
    setup(makeTodo({ dueDate: '2026-06-01' }))
    expect(screen.getByTestId('todo-due-date')).toHaveTextContent('2026/6/1')
  })

  it('does not render description when empty', () => {
    setup(makeTodo({ description: '' }))
    expect(screen.queryByText('A test description')).not.toBeInTheDocument()
  })

  it('calls onToggle when checkbox is clicked', async () => {
    const user = userEvent.setup()
    const todo = makeTodo()
    const { onToggle } = setup(todo)
    await user.click(screen.getByTestId('todo-toggle'))
    expect(onToggle).toHaveBeenCalledWith(todo.id)
  })

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()
    const todo = makeTodo()
    const { onDelete } = setup(todo)
    await user.click(screen.getByTestId('todo-delete'))
    expect(onDelete).toHaveBeenCalledWith(todo.id)
  })

  it('applies line-through style when todo is done', () => {
    setup(makeTodo({ status: 'done' }))
    const title = screen.getByTestId('todo-title')
    expect(title.className).toContain('line-through')
  })
})
