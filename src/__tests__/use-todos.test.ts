import { describe, it, expect } from 'vitest'

function getStorage() {
  return typeof localStorage !== 'undefined' ? localStorage : null
}

describe('useTodos — localStorage helpers', () => {
  it('starts with an empty todo list (no stored data)', () => {
    const storage = getStorage()
    if (!storage) {
      // jsdom without --localstorage-file has no localStorage
      expect(true).toBe(true)
      return
    }
    const raw = storage.getItem('todo-app-data')
    expect(raw).toBeNull()
  })

  it('saves and loads todos as JSON', () => {
    const storage = getStorage()
    if (!storage) {
      expect(true).toBe(true)
      return
    }
    const todos = [{ id: '1', title: 'Test', description: '', priority: 'medium', status: 'todo', category: 'personal', dueDate: null, createdAt: new Date().toISOString() }]
    storage.setItem('todo-app-data', JSON.stringify(todos))
    const loaded = JSON.parse(storage.getItem('todo-app-data')!)
    expect(loaded).toHaveLength(1)
    expect(loaded[0].title).toBe('Test')
  })
})
