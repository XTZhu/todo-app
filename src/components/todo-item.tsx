'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { Todo } from '@/types/todo'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const priorityLabels = { high: '高', medium: '中', low: '低' }
const statusLabels: Record<string, string> = { todo: '未开始', 'in-progress': '进行中', done: '已完成' }
const categoryLabels: Record<string, string> = { personal: '个人', work: '工作', learning: '学习' }

const priorityBadgeVariant: Record<string, 'priority_high' | 'priority_medium' | 'priority_low'> = {
  high: 'priority_high',
  medium: 'priority_medium',
  low: 'priority_low',
}

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
    <Card
      className={cn(
        'transition-all duration-200 animate-fade-up',
        todo.status === 'done' && 'opacity-60'
      )}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      data-testid={`todo-item-${todo.id}`}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 shrink-0 cursor-grab text-muted-foreground/40 hover:text-muted-foreground select-none"
            data-testid="drag-handle"
            aria-hidden
          >
            ⠿
          </span>

          <button
            onClick={() => onToggle(todo.id)}
            className={cn(
              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all cursor-pointer',
              todo.status === 'done'
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : 'border-muted-foreground/30 hover:border-primary'
            )}
            aria-label={todo.status === 'done' ? '标记未完成' : '标记完成'}
            data-testid="todo-toggle"
          >
            {todo.status === 'done' && <span className="text-xs">✓</span>}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant={priorityBadgeVariant[todo.priority]}>{priorityLabels[todo.priority]}</Badge>
              <Badge variant="outline">{categoryLabels[todo.category]}</Badge>
              {editing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={commitEdit}
                  className="w-full rounded border border-primary bg-background px-1 py-0.5 text-sm font-medium text-foreground outline-none"
                  data-testid="todo-edit-input"
                />
              ) : (
                <h3
                  className={cn(
                    'truncate text-sm font-medium cursor-pointer hover:text-primary transition-colors',
                    todo.status === 'done' && 'line-through text-muted-foreground'
                  )}
                  onDoubleClick={startEditing}
                  data-testid="todo-title"
                  title="双击编辑"
                >
                  {todo.title}
                </h3>
              )}
            </div>
            {todo.description && (
              <p className="mt-1 text-xs text-muted-foreground">{todo.description}</p>
            )}
            <div className="mt-1 flex flex-wrap gap-1 text-xs text-muted-foreground/70">
              <span>{statusLabels[todo.status]}</span>
              {todo.dueDate && (
                <span data-testid="todo-due-date">
                  截止: {new Date(todo.dueDate).toLocaleDateString('zh-CN')}
                </span>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(todo.id)}
            aria-label="删除任务"
            data-testid="todo-delete"
            className="text-muted-foreground/50 hover:text-destructive shrink-0"
          >
            ✕
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
