'use client'

import { useState, useCallback } from 'react'
import type { Priority, Category } from '@/types/todo'

interface Props {
  onAdd: (title: string, description: string, priority: Priority, category: Category, dueDate: string | null) => void
}

export default function TodoForm({ onAdd }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [category, setCategory] = useState<Category>('personal')
  const [dueDate, setDueDate] = useState('')

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!title.trim()) return
      onAdd(title.trim(), description.trim(), priority, category, dueDate || null)
      setTitle('')
      setDescription('')
      setPriority('medium')
      setCategory('personal')
      setDueDate('')
    },
    [title, description, priority, category, dueDate, onAdd]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        handleSubmit(e)
      }
    },
    [handleSubmit]
  )

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      data-testid="todo-form"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="输入任务标题... (Ctrl+Enter 添加)"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        data-testid="todo-input"
        autoFocus
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="任务描述（可选）"
        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        data-testid="todo-description-input"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          data-testid="priority-select"
          aria-label="优先级"
        >
          <option value="high">🔴 高优先级</option>
          <option value="medium">🟡 中优先级</option>
          <option value="low">🟢 低优先级</option>
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          data-testid="category-select"
          aria-label="分类"
        >
          <option value="personal">👤 个人</option>
          <option value="work">💼 工作</option>
          <option value="learning">📚 学习</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          data-testid="due-date-input"
          aria-label="截止日期"
        />
        <button
          type="submit"
          disabled={!title.trim()}
          className="rounded-md bg-blue-600 px-4 py-1 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          data-testid="add-button"
        >
          添加任务
        </button>
      </div>
    </form>
  )
}
