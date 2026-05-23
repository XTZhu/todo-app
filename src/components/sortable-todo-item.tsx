'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Todo } from '@/types/todo'
import TodoItem from './todo-item'

interface Props {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, patch: Partial<Omit<Todo, 'id' | 'createdAt'>>) => void
}

export default function SortableTodoItem({ todo, onToggle, onDelete, onUpdate }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TodoItem
        todo={todo}
        onToggle={onToggle}
        onDelete={onDelete}
        onUpdate={onUpdate}
      />
    </div>
  )
}
