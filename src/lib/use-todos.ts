'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Todo, Priority, Status, Category, FilterStatus, FilterCategory, SortBy } from '@/types/todo'

const STORAGE_KEY = 'todo-app-data'

function loadTodos(): Todo[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveTodos(todos: Todo[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setTodos(loadTodos())
    setHydrated(true)
  }, [])

  const addTodo = useCallback(
    (title: string, description = '', priority: Priority = 'medium', category: Category = 'personal', dueDate: string | null = null) => {
      const todo: Todo = {
        id: generateId(),
        title,
        description,
        priority,
        status: 'todo',
        category,
        dueDate,
        createdAt: new Date().toISOString(),
      }
      setTodos((prev) => {
        const next = [todo, ...prev]
        saveTodos(next)
        return next
      })
    },
    []
  )

  const updateTodo = useCallback(
    (id: string, patch: Partial<Omit<Todo, 'id' | 'createdAt'>>) => {
      setTodos((prev) => {
        const next = prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
        saveTodos(next)
        return next
      })
    },
    []
  )

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => {
      const next = prev.filter((t) => t.id !== id)
      saveTodos(next)
      return next
    })
  }, [])

  const reorderTodos = useCallback((activeId: string, overId: string) => {
    setTodos((prev) => {
      const oldIndex = prev.findIndex((t) => t.id === activeId)
      const newIndex = prev.findIndex((t) => t.id === overId)
      if (oldIndex === -1 || newIndex === -1) return prev
      const next = [...prev]
      const [moved] = next.splice(oldIndex, 1)
      next.splice(newIndex, 0, moved)
      saveTodos(next)
      return next
    })
  }, [])

  const toggleStatus = useCallback((id: string) => {
    setTodos((prev) => {
      const next = prev.map((t) => {
        if (t.id !== id) return t
        const nextStatus: Status = t.status === 'done' ? 'todo' : t.status === 'todo' ? 'in-progress' : 'done'
        return { ...t, status: nextStatus }
      })
      saveTodos(next)
      return next
    })
  }, [])

  return { todos, hydrated, addTodo, updateTodo, deleteTodo, toggleStatus, reorderTodos }
}

export function useFilteredTodos(
  todos: Todo[],
  filterStatus: FilterStatus,
  filterCategory: FilterCategory,
  sortBy: SortBy
) {
  return useMemo(() => {
    let filtered = todos

    if (filterStatus !== 'all') {
      filtered = filtered.filter((t) => t.status === filterStatus)
    }
    if (filterCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === filterCategory)
    }

    const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 }
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        case 'dueDate': {
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return a.dueDate.localeCompare(b.dueDate)
        }
        case 'createdAt':
          return b.createdAt.localeCompare(a.createdAt)
        default:
          return 0
      }
    })
  }, [todos, filterStatus, filterCategory, sortBy])
}
