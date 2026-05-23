export type Priority = 'high' | 'medium' | 'low'
export type Status = 'todo' | 'in-progress' | 'done'
export type Category = 'work' | 'personal' | 'learning'

export interface Todo {
  id: string
  title: string
  description: string
  priority: Priority
  status: Status
  category: Category
  dueDate: string | null
  createdAt: string
}

export type FilterStatus = Status | 'all'
export type FilterCategory = Category | 'all'
export type SortBy = 'priority' | 'dueDate' | 'createdAt'
