'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { Todo } from '@/types/todo'

const priorityLabels = { high: '🔴', medium: '🟡', low: '🟢' }
const statusLabels: Record<string, string> = { todo: '未开始', 'in-progress': '进行中', done: '✅ 已完成' }
const categoryLabels: Record<string, string> = { personal: '👤', work: '💼', learning: '📚' }

interface Props {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, patch: Partial<Omit<Todo, 'id' | 'createdAt'>>) => void
}

export default function TodoItem({ todo, onToggle, onDelete, onUpdate }: Props) {
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  useEffect(() => {
    setEditTitle(todo.title)
  }, [todo.title])

  const startEditing = useCallback(() => {
    setEditing(true)
    setEditTitle(todo.title)
  }, [todo.title])

  const commitEdit = useCallback(() => {
    if (editTitle.trim() && editTitle.trim() !== todo.title) {
      onUpdate(todo.id, { title: editTitle.trim() })
    }
    setEditing(false)
  }, [editTitle, todo.id, todo.title, onUpdate])

  const cancelEdit = useCallback(() => {
    setEditTitle(todo.title)
    setEditing(false)
  }, [todo.title])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (editing) {
        if (e.key === 'Enter') {
          e.preventDefault()
          commitEdit()
        } else if (e.key === 'Escape') {
          e.preventDefault()
          cancelEdit()
        }
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        onDelete(todo.id)
      }
    },
    [editing, commitEdit, cancelEdit, todo.id, onDelete]
  )

  return (
    <div
      className={`rounded-lg border p-3 shadow-sm transition-colors focus-within:ring-2 focus-within:ring-blue-500 ${
        todo.status === 'done'
          ? 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
      }`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      data-testid={`todo-item-${todo.id}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 cursor-grab text-gray-300 hover:text-gray-500 dark:text-gray-600" data-testid="drag-handle" aria-hidden>
          ⠿
        </span>

        <button
          onClick={() => onToggle(todo.id)}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
            todo.status === 'done'
              ? 'border-green-500 bg-green-500 text-white'
              : 'border-gray-300 hover:border-blue-400 dark:border-gray-600'
          }`}
          aria-label={todo.status === 'done' ? '标记未完成' : '标记完成'}
          data-testid="todo-toggle"
        >
          {todo.status === 'done' && <span className="text-xs">✓</span>}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs" title={todo.priority}>
              {priorityLabels[todo.priority]}
            </span>
            <span className="text-xs" title={todo.category}>
              {categoryLabels[todo.category]}
            </span>
            {editing ? (
              <input
                ref={inputRef}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={commitEdit}
                className="w-full rounded border border-blue-400 px-1 py-0.5 text-sm font-medium text-gray-900 outline-none dark:bg-gray-700 dark:text-white"
                data-testid="todo-edit-input"
              />
            ) : (
              <h3
                className={`truncate text-sm font-medium cursor-pointer hover:text-blue-500 ${
                  todo.status === 'done' ? 'text-gray-400 line-through dark:text-gray-500' : 'text-gray-900 dark:text-white'
                }`}
                onDoubleClick={startEditing}
                data-testid="todo-title"
                title="双击编辑"
              >
                {todo.title}
              </h3>
            )}
          </div>
          {todo.description && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{todo.description}</p>
          )}
          <div className="mt-1 flex flex-wrap gap-1 text-xs text-gray-400 dark:text-gray-500">
            <span>{statusLabels[todo.status]}</span>
            {todo.dueDate && (
              <span data-testid="todo-due-date">
                截止: {new Date(todo.dueDate).toLocaleDateString('zh-CN')}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onDelete(todo.id)}
          className="shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
          aria-label="删除任务"
          data-testid="todo-delete"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
