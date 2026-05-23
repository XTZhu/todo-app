import type { SupabaseClient } from '@supabase/supabase-js'
import type { Todo } from '@/types/todo'

// Lazy reference set by supabase.ts after client init
let _client: SupabaseClient | null = null
export function setSupabaseClient(c: SupabaseClient | null) { _client = c }
function getClient(): SupabaseClient | null { return _client }

function dbToTodo(row: Record<string, unknown>): Todo {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? '',
    priority: row.priority as Todo['priority'],
    status: row.status as Todo['status'],
    category: row.category as Todo['category'],
    dueDate: (row.due_date as string | null) ?? null,
    createdAt: row.created_at as string,
  }
}

export async function fetchTodos(userId: string): Promise<Todo[]> {
  const client = getClient()
  if (!client) throw new Error('Supabase not configured')

  const { data, error } = await client
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(dbToTodo)
}

export async function createTodoInDb(userId: string, todo: Todo): Promise<void> {
  const client = getClient()
  if (!client) throw new Error('Supabase not configured')

  const { error } = await client.from('tasks').insert({
    id: todo.id,
    user_id: userId,
    title: todo.title,
    description: todo.description,
    priority: todo.priority,
    status: todo.status,
    category: todo.category,
    due_date: todo.dueDate,
    created_at: todo.createdAt,
    sort_order: 0,
  })
  if (error) throw error
}

export async function updateTodoInDb(
  userId: string,
  id: string,
  patch: Partial<Omit<Todo, 'id' | 'createdAt'>>
): Promise<void> {
  const client = getClient()
  if (!client) throw new Error('Supabase not configured')

  const dbPatch: Record<string, unknown> = {}
  if (patch.title !== undefined) dbPatch.title = patch.title
  if (patch.description !== undefined) dbPatch.description = patch.description
  if (patch.priority !== undefined) dbPatch.priority = patch.priority
  if (patch.status !== undefined) dbPatch.status = patch.status
  if (patch.category !== undefined) dbPatch.category = patch.category
  if (patch.dueDate !== undefined) dbPatch.due_date = patch.dueDate

  const { error } = await client
    .from('tasks')
    .update(dbPatch)
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw error
}

export async function deleteTodoFromDb(userId: string, id: string): Promise<void> {
  const client = getClient()
  if (!client) throw new Error('Supabase not configured')

  const { error } = await client
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw error
}

export async function reorderTodosInDb(userId: string, orderedIds: string[]): Promise<void> {
  const client = getClient()
  if (!client) throw new Error('Supabase not configured')

  const updates = orderedIds.map((id, index) => ({
    id,
    user_id: userId,
    sort_order: index,
  }))

  const { error } = await client.from('tasks').upsert(updates, {
    onConflict: 'id',
    ignoreDuplicates: false,
  })
  if (error) throw error
}
