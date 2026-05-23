'use client'

import { useState, useCallback } from 'react'
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { DragEndEvent } from '@dnd-kit/core'
import { useTodos, useFilteredTodos } from '@/lib/use-todos'
import type { FilterStatus, FilterCategory, SortBy } from '@/types/todo'
import TodoForm from '@/components/todo-form'
import TodoFilter from '@/components/todo-filter'
import SortableTodoItem from '@/components/sortable-todo-item'

export default function Home() {
  const { todos, hydrated, addTodo, updateTodo, deleteTodo, toggleStatus, reorderTodos } = useTodos()
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

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-2xl p-4">
        <div className="mt-20 text-center text-gray-400">加载中...</div>
      </main>
    )
  }

  const filteredIds = filtered.map((t) => t.id)

  return (
    <main className="mx-auto max-w-2xl p-4">
      <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">TODO 任务管理</h1>

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

      <p className="mt-2 text-xs text-gray-400">
        共 {filtered.length} 个任务
        {filtered.length !== todos.length && ` (筛选自 ${todos.length} 个)`}
      </p>

      <div className="mt-3 space-y-2" data-testid="todo-list">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">暂无任务，快去添加一个吧！</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={filteredIds} strategy={verticalListSortingStrategy}>
              {filtered.map((todo) => (
                <SortableTodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleStatus}
                  onDelete={deleteTodo}
                  onUpdate={updateTodo}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </main>
  )
}
