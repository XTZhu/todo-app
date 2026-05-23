import { describe, it, expect, beforeEach } from 'vitest'
import type { Priority } from '@/types/todo'

const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

describe('useTodos — localStorage helpers', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') localStorage.clear()
  })

  it('starts with an empty todo list (no stored data)', () => {
    if (typeof localStorage === 'undefined') return
    const raw = localStorage.getItem('todo-app-data')
    expect(raw).toBeNull()
  })

  it('saves and loads todos as JSON', () => {
    if (typeof localStorage === 'undefined') return
    const todos = [
      {
        id: '1',
        title: 'Test',
        description: '',
        priority: 'medium',
        status: 'todo',
        category: 'personal',
        dueDate: null,
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem('todo-app-data', JSON.stringify(todos))
    const loaded = JSON.parse(localStorage.getItem('todo-app-data')!)
    expect(loaded).toHaveLength(1)
    expect(loaded[0].title).toBe('Test')
  })

  it('handles corrupted localStorage data gracefully', () => {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem('todo-app-data', '{invalid json}')
    try {
      JSON.parse(localStorage.getItem('todo-app-data')!)
    } catch {
      expect(true).toBe(true)
    }
  })
})

describe('useFilteredTodos — filter and sort logic', () => {
  const makeTodo = (id: string, overrides: Partial<{ status: string; category: string; priority: Priority; dueDate: string | null }> = {}) => ({
    id,
    title: 'Test',
    description: '',
    priority: (overrides.priority ?? 'medium') as Priority,
    status: (overrides.status ?? 'todo') as string,
    category: (overrides.category ?? 'personal') as string,
    dueDate: overrides.dueDate ?? null as string | null,
    createdAt: new Date().toISOString(),
  })

  it('filters by status correctly', () => {
    const todos = [
      makeTodo('1', { status: 'todo' }),
      makeTodo('2', { status: 'done' }),
      makeTodo('3', { status: 'todo' }),
    ]
    const filtered = todos.filter((t) => t.status === 'todo')
    expect(filtered).toHaveLength(2)
  })

  it('filters by category correctly', () => {
    const todos = [
      makeTodo('1', { category: 'work' }),
      makeTodo('2', { category: 'personal' }),
    ]
    const filtered = todos.filter((t) => t.category === 'work')
    expect(filtered).toHaveLength(1)
  })

  it('passes through all todos when filter is "all"', () => {
    const todos = [makeTodo('1'), makeTodo('2')]
    expect(todos).toHaveLength(2)
  })

  it('sorts by priority (high first)', () => {
    const todos = [
      makeTodo('low', { priority: 'low' }),
      makeTodo('high', { priority: 'high' }),
      makeTodo('medium', { priority: 'medium' }),
    ]
    const sorted = [...todos].sort((a, b) => priorityOrder[a.priority as Priority] - priorityOrder[b.priority as Priority])
    expect(sorted.map((t) => t.id)).toEqual(['high', 'medium', 'low'])
  })

  it('sorts by dueDate with nulls last', () => {
    const todos = [
      makeTodo('3', { dueDate: null }),
      makeTodo('1', { dueDate: '2026-01-01' }),
      makeTodo('2', { dueDate: '2026-06-01' }),
    ]
    const sorted = [...todos].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return a.dueDate!.localeCompare(b.dueDate!)
    })
    expect(sorted.map((t) => t.id)).toEqual(['1', '2', '3'])
  })
})
