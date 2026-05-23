# hCaptcha Integration for Supabase Bot & Abuse Protection

## Context

Supabase 项目已启用 Bot and Abuse Protection，采用 hCaptcha 验证。所有 Supabase Auth 端点（包括匿名登录的 `/signup`）现在都需要 `captchaToken`。当前项目的匿名登录流程在 `getOrCreateAnonymousUser()` 中直接调用 `signInAnonymously()` 不带 captchaToken，这会导致登录失败。

本项目使用纯客户端 Supabase 集成（`@supabase/supabase-js`），无 `@supabase/ssr`，无服务端鉴权。

## 实现方案

### 核心思路

- 首次访问时先尝试读取已有 session（`getSession()`，无需 captcha）
- 若无已有 session，展示 hCaptcha 组件
- 用户完成验证后，用 token 调用 `signInAnonymously({ options: { captchaToken } })`
- 后续访问直接从持久化的 session 恢复，无需再次验证

### 修改文件清单

#### 1. `package.json` — 添加依赖
- 安装 `@hcaptcha/react-hcaptcha`

#### 2. `.env.local` + `.env.local.example` — 添加环境变量
- 新增 `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`

#### 3. `src/lib/supabase.ts` — 支持 captchaToken
- 添加 `captchaToken?: string` 参数到 `getOrCreateAnonymousUser()`
- 将 captchaToken 传入 `signInAnonymously({ options: { captchaToken } })`
- 移除 `clientInitialized` 的提前返回逻辑（改为基于 `_client` 是否已存在来判断是否复用客户端），允许无 session 时用 captcha 重试

#### 4. `src/lib/use-todos.ts` — 验证码流程状态管理
- 新增状态:
  - `needsCaptcha: boolean` — 是否需要展示验证码（云启用 + 在线 + 无用户 + 无已保存 session）
  - `captchaVerified: boolean` + 对应的 trigger ref
- 初始化逻辑调整:
  1. 先尝试 `getOrCreateAnonymousUser()` 不带 captcha（检查已有 session）
  2. 若无 session 返回 → 设置 `needsCaptcha = true`
  3. 用户完成验证码后 → 用 token 调用 `getOrCreateAnonymousUser(captchaToken)`
- 导出 `needsCaptcha` 和 `onCaptchaVerified(token: string)` 供页面组件使用

#### 5. `src/app/page.tsx` — 渲染验证码 UI
- 从 `useTodos()` 解构 `needsCaptcha` 和 `onCaptchaVerified`
- 当 `needsCaptcha` 为 true 时，在加载骨架屏/animation 位置渲染 `HCaptchaAuth` 组件

#### 6. 新建 `src/components/hcaptcha-auth.tsx` — 验证码组件
- 封装 `@hcaptcha/react-hcaptcha` 的 HCaptcha 组件
- Props: `siteKey: string`, `onVerify: (token: string) => void`
- 显示简洁的居中卡片，包含 hCaptcha 小组件和提示文字
- 使用 `useRef<HCaptcha>` 管理实例

### 流程图

```
用户打开页面
    ↓
检查网络 + 云配置
    ↓ 是
创建 Supabase 客户端 → getSession()
    ↓
  session 存在?
  ├── 是 → 直接获取 todos（无需验证码）
  └── 否 → needsCaptcha = true
              ↓
         展示 hCaptcha 组件
              ↓
         用户完成验证
              ↓
         signInAnonymously({ captchaToken })
              ↓
         获取 todos 并持久化 session
```

### 环境变量

用户需提供 hCaptcha site key（从 Supabase 仪表板 Auth > Bot and Abuse Protection 获取，或直接从 hCaptcha.com 获取）。需添加到 `.env.local`:

```
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your-hcaptcha-site-key
```

## 验证方式

1. `npm run dev` 启动应用
2. 清除浏览器 localStorage 和 IndexedDB（清除 Supabase session）
3. 刷新页面 — 应看到 hCaptcha 验证码组件
4. 完成验证码 — 应成功登录并加载 todos
5. 再次刷新 — 应从 session 恢复，无需验证码
6. 运行 `npm test` 确保现有测试通过
