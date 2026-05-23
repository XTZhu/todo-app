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

const features = ['匿名云同步', '离线优先', '三态切换', '拖拽排序', '行内编辑', '键盘操作']

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
      <main className="mx-auto max-w-xl px-4 py-8">
        <div className="mb-8 space-y-3">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-56" />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="mt-4"><Skeleton className="h-8 w-56" /></div>
        <div className="mt-3 space-y-2">
          <Skeleton className="h-[72px] w-full rounded-xl" />
          <Skeleton className="h-[72px] w-full rounded-xl" />
          <Skeleton className="h-[72px] w-full rounded-xl" />
        </div>
      </main>
    )
  }

  const filteredIds = filtered.map((t) => t.id)

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <Toaster richColors position="bottom-right" />

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            TODO
          </h1>
          {syncing && (
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" title="同步中..." />
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground/70">
          简约优雅 · 离线优先 · 匿名云同步
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {features.map((f) => (
            <span
              key={f}
              className="inline-flex rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground/70"
            >
              {f}
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

      <div className="mt-5">
        <TodoFilter
          filterStatus={filterStatus}
          filterCategory={filterCategory}
          sortBy={sortBy}
          onFilterStatusChange={setFilterStatus}
          onFilterCategoryChange={setFilterCategory}
          onSortByChange={setSortBy}
        />
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground/50">
        {filtered.length} 个任务
        {filtered.length !== todos.length && ` / 共 ${todos.length} 个`}
      </p>

      <div className="mt-3 space-y-2" data-testid="todo-list">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground/50">
              {todos.length === 0 ? '还没有任务，添加一个吧' : '没有匹配的任务'}
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={filteredIds} strategy={verticalListSortingStrategy}>
              {filtered.map((todo, index) => (
                <div key={todo.id} style={{ animationDelay: `${index * 50}ms` }}>
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
