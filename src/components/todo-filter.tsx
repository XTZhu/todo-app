'use client'

import type { FilterStatus, FilterCategory, SortBy } from '@/types/todo'

interface Props {
  filterStatus: FilterStatus
  filterCategory: FilterCategory
  sortBy: SortBy
  onFilterStatusChange: (s: FilterStatus) => void
  onFilterCategoryChange: (c: FilterCategory) => void
  onSortByChange: (s: SortBy) => void
}

export default function TodoFilter({
  filterStatus,
  filterCategory,
  sortBy,
  onFilterStatusChange,
  onFilterCategoryChange,
  onSortByChange,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2" data-testid="todo-filter">
      <select
        value={filterStatus}
        onChange={(e) => onFilterStatusChange(e.target.value as FilterStatus)}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        aria-label="按状态筛选"
        data-testid="filter-status"
      >
        <option value="all">全部状态</option>
        <option value="todo">未开始</option>
        <option value="in-progress">进行中</option>
        <option value="done">已完成</option>
      </select>

      <select
        value={filterCategory}
        onChange={(e) => onFilterCategoryChange(e.target.value as FilterCategory)}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        aria-label="按分类筛选"
        data-testid="filter-category"
      >
        <option value="all">全部分类</option>
        <option value="personal">个人</option>
        <option value="work">工作</option>
        <option value="learning">学习</option>
      </select>

      <select
        value={sortBy}
        onChange={(e) => onSortByChange(e.target.value as SortBy)}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        aria-label="排序方式"
        data-testid="sort-by"
      >
        <option value="createdAt">按创建时间</option>
        <option value="priority">按优先级</option>
        <option value="dueDate">按截止日期</option>
      </select>
    </div>
  )
}
