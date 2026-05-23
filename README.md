# TODO 应用

日常任务管理工具，干净的暖纸风格界面，支持 Supabase 匿名云存储。

## 功能

- 任务 CRUD（创建、双击编辑、删除、三态切换）
- 优先级（高/中/低）、分类（个人/工作/学习）、截止日期
- 拖拽排序（@dnd-kit）
- 筛选与排序（状态/分类/时间/优先级）
- 键盘快捷键（Ctrl+Enter 新建，Delete 删除）
- Supabase 匿名云存储 + localStorage 离线降级
- 暗色/亮色主题自动切换

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16 + React 19 + TypeScript |
| UI | shadcn/ui (Radix + Tailwind) with warm paper theme |
| 字体 | Lora + Noto Serif SC |
| 拖拽 | @dnd-kit/core + @dnd-kit/sortable |
| 云存储 | Supabase（匿名认证 + RLS） |
| 通知 | sonner toast |
| 测试 | Vitest + React Testing Library（25 个） |

## 本地运行

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # 25 个测试
npm run build      # 生产构建
```

## 启用云存储（可选）

1. 在 [supabase.com](https://supabase.com) 创建项目
2. 在 SQL Editor 执行迁移脚本（见 `supabase/` 目录）
3. 在 Authentication → Settings 启用 **Anonymous Sign-Ins**
4. 创建 `.env.local`：
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
5. 重启开发服务器，应用自动切换为云存储模式

不配置 `.env.local` 时，应用使用 localStorage 本地存储，功能完全正常。
