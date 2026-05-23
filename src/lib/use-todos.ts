'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { Todo, Priority, Status, Category, FilterStatus, FilterCategory, SortBy } from '@/types/todo'
import { getOrCreateAnonymousUser, isCloudEnabled } from './supabase'
import { fetchTodos, createTodoInDb, updateTodoInDb, deleteTodoFromDb, reorderTodosInDb } from './supabase-api'

const STORAGE_KEY = 'todo-app-data'

function loadFromLocalStorage(): Todo[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToLocalStorage(todos: Todo[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

function generateId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
  }
}

function isOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const userIdRef = useRef<string | null>(null)
  const cloudEnabledRef = useRef(false)
  const offlineQueueRef = useRef<Array<() => Promise<void>>>([])

  const clearError = useCallback(() => setError(null), [])

  // Initialize: try cloud, fallback to localStorage
  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        if (!isOnline() || !isCloudEnabled()) {
          setTodos(loadFromLocalStorage())
          setHydrated(true)
          return
        }

        const user = await getOrCreateAnonymousUser()
        if (cancelled) return

        if (user) {
          userIdRef.current = user.id
          cloudEnabledRef.current = true
          const remote = await fetchTodos(user.id)
          if (cancelled) return
          setTodos(remote)
          // Sync local to cloud
          saveToLocalStorage(remote)
        } else {
          // No Supabase config — use localStorage
          setTodos(loadFromLocalStorage())
        }
      } catch (err) {
        console.error('Failed to load from cloud, using local:', err)
        setTodos(loadFromLocalStorage())
      } finally {
        if (!cancelled) setHydrated(true)
      }
    }

    init()

    // Flush offline queue when back online
    const flushQueue = async () => {
      const queue = offlineQueueRef.current
      offlineQueueRef.current = []
      for (const action of queue) {
        try { await action() } catch { /* retry next time */ }
      }
    }
    window.addEventListener('online', flushQueue)
    return () => {
      cancelled = true
      window.removeEventListener('online', flushQueue)
    }
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

      setTodos((prev) => [todo, ...prev])
      saveToLocalStorage([todo, ...(hydrated ? [] : [])]) // placeholder, real save below

      const userId = userIdRef.current
      if (!userId || !cloudEnabledRef.current || !isOnline()) {
        offlineQueueRef.current.push(async () => {
          if (!userIdRef.current) return
          await createTodoInDb(userIdRef.current, todo)
        })
        return
      }

      setSyncing(true)
      createTodoInDb(userId, todo)
        .then(() => {
          const current = loadFromLocalStorage()
          saveToLocalStorage([todo, ...current])
        })
        .catch((err) => {
          setError(`添加失败: ${err.message}`)
          setTodos((prev) => prev.filter((t) => t.id !== todo.id))
        })
        .finally(() => setSyncing(false))
    },
    [hydrated]
  )

  const updateTodo = useCallback(
    (id: string, patch: Partial<Omit<Todo, 'id' | 'createdAt'>>) => {
      setTodos((prev) => {
        const next = prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
        saveToLocalStorage(next)
        return next
      })

      const userId = userIdRef.current
      if (!userId || !cloudEnabledRef.current || !isOnline()) {
        offlineQueueRef.current.push(async () => {
          if (!userIdRef.current) return
          await updateTodoInDb(userIdRef.current, id, patch)
        })
        return
      }

      setSyncing(true)
      updateTodoInDb(userId, id, patch)
        .catch((err) => setError(`更新失败: ${err.message}`))
        .finally(() => setSyncing(false))
    },
    []
  )

  const deleteTodo = useCallback((id: string) => {
    const deletedTodo = todos.find((t) => t.id === id)

    setTodos((prev) => {
      const next = prev.filter((t) => t.id !== id)
      saveToLocalStorage(next)
      return next
    })

    const userId = userIdRef.current
    if (!userId || !cloudEnabledRef.current || !isOnline()) {
      offlineQueueRef.current.push(async () => {
        if (!userIdRef.current) return
        await deleteTodoFromDb(userIdRef.current, id)
      })
      return
    }

    setSyncing(true)
    deleteTodoFromDb(userId, id)
      .catch((err) => {
        setError(`删除失败: ${err.message}`)
        if (deletedTodo) {
          setTodos((prev) => [...prev, deletedTodo])
        }
      })
      .finally(() => setSyncing(false))
  }, [todos])

  const toggleStatus = useCallback((id: string) => {
    setTodos((prev) => {
      const next = prev.map((t) => {
        if (t.id !== id) return t
        const nextStatus: Status = t.status === 'done' ? 'todo' : t.status === 'todo' ? 'in-progress' : 'done'
        return { ...t, status: nextStatus }
      })
      saveToLocalStorage(next)
      return next
    })

    const userId = userIdRef.current
    if (!userId || !cloudEnabledRef.current) return

    const todo = todos.find((t) => t.id === id)
    if (!todo) return
    const nextStatus: Status = todo.status === 'done' ? 'todo' : todo.status === 'todo' ? 'in-progress' : 'done'

    if (!isOnline()) {
      offlineQueueRef.current.push(async () => {
        if (!userIdRef.current) return
        await updateTodoInDb(userIdRef.current, id, { status: nextStatus })
      })
      return
    }

    updateTodoInDb(userId, id, { status: nextStatus }).catch(() => {})
  }, [todos])

  const reorderTodos = useCallback((activeId: string, overId: string) => {
    setTodos((prev) => {
      const oldIndex = prev.findIndex((t) => t.id === activeId)
      const newIndex = prev.findIndex((t) => t.id === overId)
      if (oldIndex === -1 || newIndex === -1) return prev
      const next = [...prev]
      const [moved] = next.splice(oldIndex, 1)
      next.splice(newIndex, 0, moved)
      saveToLocalStorage(next)
      return next
    })

    const userId = userIdRef.current
    if (!userId || !cloudEnabledRef.current || !isOnline()) return

    setTodos((current) => {
      const orderedIds = current.map((t) => t.id)
      reorderTodosInDb(userId, orderedIds).catch(() => {})
      return current
    })
  }, [])

  return { todos, hydrated, syncing, error, clearError, addTodo, updateTodo, deleteTodo, toggleStatus, reorderTodos }
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
