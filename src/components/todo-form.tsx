'use client'

import { useState, useCallback } from 'react'
import type { Priority, Category } from '@/types/todo'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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

  const selectClass =
    "warm-select h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm text-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 cursor-pointer"

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="rounded-xl bg-card p-4 shadow-[var(--shadow-card)]"
      data-testid="todo-form"
    >
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="新任务标题...  (Ctrl+Enter 添加)"
        data-testid="todo-input"
        autoFocus
      />
      <Input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="描述（可选）"
        className="mt-2"
        data-testid="todo-description-input"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className={selectClass}
          data-testid="priority-select"
          aria-label="优先级"
        >
          <option value="high">高优先级</option>
          <option value="medium">中优先级</option>
          <option value="low">低优先级</option>
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className={selectClass}
          data-testid="category-select"
          aria-label="分类"
        >
          <option value="personal">个人</option>
          <option value="work">工作</option>
          <option value="learning">学习</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={selectClass}
          data-testid="due-date-input"
          aria-label="截止日期"
        />
        <Button type="submit" disabled={!title.trim()} data-testid="add-button" size="sm">
          添加
        </Button>
      </div>
    </form>
  )
}
