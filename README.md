# TODO 应用

> 简约优雅的任务管理工具 — 暖纸主题、离线优先、匿名云同步。

## 特色

- **暖纸主题** — Lora + Noto Serif SC 衬线字体，暖色调配色，明暗自动切换
- **匿名云同步** — 基于 Supabase 匿名认证，无需注册即可跨设备同步，hCaptcha 防滥用保护
- **离线优先** — 无网络或未配置云存储时自动降级为 localStorage，功能完全正常
- **三态切换** — 未开始 → 进行中 → 已完成，每态独立视觉反馈（空心 / 琥珀 — / 绿色 ✓）
- **拖拽排序** — 基于 @dnd-kit，支持鼠标和触屏拖拽调整任务顺序
- **行内编辑** — 双击标题即可编辑，Enter 确认 / Esc 取消
- **筛选排序** — 按状态、分类、优先级、截止日期多维度筛选与排序
- **键盘操作** — Ctrl+Enter 新建任务，Delete 删除，Tab 导航

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16 + React 19 + TypeScript |
| UI | shadcn/ui (Radix + Tailwind) warm paper theme |
| 字体 | Lora + Noto Serif SC |
| 拖拽 | @dnd-kit/core + @dnd-kit/sortable |
| 云存储 | Supabase（匿名认证 + RLS） |
| 安全 | hCaptcha 人机验证 |
| 通知 | sonner toast |
| 测试 | Vitest + React Testing Library（25 个） |

## 本地运行

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # 25 个测试
npm run build      # 生产构建
```

## 启用云存储

应用默认使用 localStorage 本地存储。如需跨设备同步，按以下步骤配置 Supabase：

1. 在 [supabase.com](https://supabase.com) 创建项目
2. 在 SQL Editor 执行迁移脚本创建 `tasks` 表
3. 在 Authentication → Settings 启用 **Anonymous Sign-Ins**
4. （推荐）在 Authentication → Bot and Abuse Protection 启用 **hCaptcha** 防护
5. 创建 `.env.local`：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your-hcaptcha-site-key
```

6. 重启开发服务器，应用自动切换为云存储模式

不配置 `.env.local` 时，应用使用 localStorage 本地存储，所有功能正常可用。
