# TODO 应用（基础层）

全栈基础层 TODO 任务管理应用，展示 React 组件设计、状态管理、数据持久化能力。

## 功能

- 任务 CRUD（创建、编辑、删除、切换状态）
- 优先级（高/中/低）、分类（个人/工作/学习）、截止日期
- 筛选与排序（按状态、分类、优先级、时间）
- 键盘快捷键：Ctrl+Enter 新建，Delete 删除
- localStorage 数据持久化
- 暗色/亮色主题

## 技术栈

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- Vitest + React Testing Library（19 个测试）

## 本地运行

```bash
npm install
npm run dev        # 启动开发服务器 http://localhost:3000
npm test           # 运行测试
npm run build      # 构建生产版本
```
