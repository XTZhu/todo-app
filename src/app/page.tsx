'use client'

import { useState, useCallback, useEffect } from 'react'
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { DragEndEvent } from '@dnd-kit/core'
import { toast, Toaster } from 'sonner'
import { useTodos, useFilteredTodos } from '@/lib/use-todos'
import type { FilterStatus, FilterCategory, SortBy } from '@/types/todo'
import TodoForm from '@/components/todo-form'
import TodoFilter from '@/components/todo-filter'
import SortableTodoItem from '@/components/sortable-todo-item'
import HCaptchaAuth from '@/components/hcaptcha-auth'
import { Skeleton } from '@/components/ui/skeleton'

const features = [
  { icon: '☁', label: '匿名云同步' },
  { icon: '⚡', label: '离线优先' },
  { icon: '↻', label: '三态切换' },
  { icon: '⠿', label: '拖拽排序' },
  { icon: '✎', label: '行内编辑' },
  { icon: '⌨', label: '键盘操作' },
]

export default function Home() {
  const { todos, hydrated, syncing, error, clearError, needsCaptcha, onCaptchaVerified, addTodo, updateTodo, deleteTodo, toggleStatus, reorderTodos } = useTodos()
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all')
  const [sortBy, setSortBy] = useState<SortBy>('createdAt')

  const filtered = useFilteredTodos(todos, filterStatus, filterCategory, sortBy)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  const handleDragStart = useCallback(() => {
    document.body.style.cursor = 'grabbing'
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    document.body.style.cursor = ''
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorderTodos(String(active.id), String(over.id))
    }
  }, [reorderTodos])

  useEffect(() => {
    if (error) {
      toast.error(error, { onDismiss: clearError, onAutoClose: clearError })
    }
  }, [error, clearError])

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-2xl p-4">
        <div className="mb-6 flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
        <div className="mb-4 flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-32 w-full rounded-lg" />
        <div className="mt-4"><Skeleton className="h-9 w-64" /></div>
        <div className="mt-3 space-y-2">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </main>
    )
  }

  const filteredIds = filtered.map((t) => t.id)

  return (
    <main className="mx-auto max-w-2xl p-4">
      <Toaster richColors position="bottom-right" />

      {/* Hero / Feature Intro */}
      <header className="mb-6 rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-accent/20 text-lg">
            ♤
          </span>
          <div>
            <h1 className="text-xl font-bold text-foreground">TODO 应用</h1>
            <p className="text-xs text-muted-foreground">
              简约优雅 · 离线优先 · 匿名云同步
            </p>
          </div>
          {syncing && (
            <span className="inline-block h-2 w-2 rounded-full bg-accent animate-pulse" title="同步中..." />
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {features.map((f) => (
            <span
              key={f.label}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              <span aria-hidden>{f.icon}</span>
              {f.label}
            </span>
          ))}
        </div>
      </header>

      {needsCaptcha && (
        <HCaptchaAuth
          siteKey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ''}
          onVerify={onCaptchaVerified}
        />
      )}

      <TodoForm onAdd={addTodo} />

      <div className="mt-4">
        <TodoFilter
          filterStatus={filterStatus}
          filterCategory={filterCategory}
          sortBy={sortBy}
          onFilterStatusChange={setFilterStatus}
          onFilterCategoryChange={setFilterCategory}
          onSortByChange={setSortBy}
        />
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        共 {filtered.length} 个任务
        {filtered.length !== todos.length && ` (筛选自 ${todos.length} 个)`}
      </p>

      <div className="mt-3 space-y-2" data-testid="todo-list">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {todos.length === 0 ? '暂无任务，快去添加一个吧！' : '没有匹配的任务'}
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={filteredIds} strategy={verticalListSortingStrategy}>
              {filtered.map((todo, index) => (
                <div key={todo.id} style={{ animationDelay: `${index * 40}ms` }}>
                  <SortableTodoItem
                    todo={todo}
                    onToggle={toggleStatus}
                    onDelete={deleteTodo}
                    onUpdate={updateTodo}
                  />
                </div>
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </main>
  )
}
