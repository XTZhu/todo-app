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
        'group transition-all duration-200 animate-fade-up',
        todo.status === 'done' && 'opacity-50'
      )}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      data-testid={`todo-item-${todo.id}`}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          {/* Drag handle — visible on hover */}
          <span
            className="mt-0.5 shrink-0 cursor-grab text-muted-foreground/25 group-hover:text-muted-foreground/50 transition-colors select-none"
            data-testid="drag-handle"
            aria-hidden
          >
            ⠿
          </span>

          {/* Status toggle */}
          <button
            onClick={() => onToggle(todo.id)}
            className={cn(
              'mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 cursor-pointer',
              todo.status === 'done'
                ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-600'
                : todo.status === 'in-progress'
                  ? 'border-amber-500/60 bg-amber-500/10 text-amber-600'
                  : 'border-muted-foreground/25 hover:border-accent/60'
            )}
            aria-label={todo.status === 'done' ? '标记未完成' : '标记完成'}
            data-testid="todo-toggle"
          >
            {todo.status === 'done' && <span className="text-[10px] leading-none">✓</span>}
            {todo.status === 'in-progress' && <span className="text-[10px] leading-none font-bold">—</span>}
          </button>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant={priorityBadgeVariant[todo.priority]} className="shrink-0">
                {priorityLabels[todo.priority]}
              </Badge>
              <Badge variant="outline" className="shrink-0">
                {categoryLabels[todo.category]}
              </Badge>
              {editing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={commitEdit}
                  className="min-w-0 flex-1 rounded-md border-0 bg-secondary/50 px-1.5 py-0.5 text-sm font-medium text-foreground outline-none ring-1 ring-inset ring-accent/40"
                  data-testid="todo-edit-input"
                />
              ) : (
                <h3
                  className={cn(
                    'truncate text-sm font-medium cursor-pointer transition-colors duration-150',
                    'hover:text-accent',
                    todo.status === 'done' && 'line-through text-muted-foreground/60'
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
              <p className="mt-1 text-xs text-muted-foreground/80 leading-relaxed">
                {todo.description}
              </p>
            )}
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground/60">
              <span className={cn(
                todo.status === 'done' && 'text-emerald-600/70',
                todo.status === 'in-progress' && 'text-amber-600/70'
              )}>
                {statusLabels[todo.status]}
              </span>
              {todo.dueDate && (
                <span data-testid="todo-due-date">
                  截止: {new Date(todo.dueDate).toLocaleDateString('zh-CN')}
                </span>
              )}
            </div>
          </div>

          {/* Delete */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(todo.id)}
            aria-label="删除任务"
            data-testid="todo-delete"
            className="h-7 w-7 shrink-0 text-muted-foreground/30 hover:text-destructive/70 opacity-0 group-hover:opacity-100 transition-all duration-150"
          >
            ✕
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
