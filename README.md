# 832401212_calculator_frontend

前后端分离计算器系统的**前端**项目：提供计算器界面、按键与键盘交互、结果显示、错误提示以及计算历史的展示与管理。**前端不做任何数学计算**，只把表达式发送给后端 API，并展示后端返回的结果。

## 技术栈

| 组件 | 技术 | 说明 |
| ---- | ---- | ---- |
| 框架 | Vue 3（Composition API + `<script setup>`） | 响应式 UI |
| 构建工具 | Vite 6 | 开发服务器（含 `/api` 代理）与生产构建 |
| 样式 | 原生 CSS（CSS 变量） | 无 UI 框架依赖，自带深色/浅色主题 |
| 网络请求 | 原生 `fetch` 封装 | 统一错误处理，集中管理 API 地址 |

- 运行环境：Node.js 18+（开发时使用 Node 24），包管理器 pnpm / npm 均可

## 目录结构

```
832401212_calculator_frontend/
├── index.html                  # HTML 入口
├── vite.config.js              # Vite 配置（/api 代理、端口）
├── package.json
└── src/
    ├── main.js                 # 应用入口
    ├── App.vue                 # 根组件：状态管理与页面布局
    ├── api/
    │   └── calcApi.js          # 后端 API 封装（唯一的网络请求出口）
    ├── components/
    │   ├── DisplayPanel.vue    # 显示区：表达式 / 结果 / 错误 / 状态
    │   ├── CalculatorPad.vue   # 按键区：数字、运算符、括号等
    │   └── HistoryPanel.vue    # 历史面板：查询 / 删除 / 清空 / 搜索 / 分页
    └── styles/
        └── main.css            # 全局样式与主题变量
```

## 安装与启动

```bash
# 1. 安装依赖（pnpm 或 npm 二选一）
pnpm install        # 或 npm install

# 2. 启动开发服务器（默认 http://127.0.0.1:5173）
pnpm dev            # 或 npm run dev

# 3. 生产构建（输出到 dist/）
pnpm build          # 或 npm run build

# 4. 本地预览构建产物
pnpm preview        # 或 npm run preview
```

> **先启动后端**（见后端仓库 README），再启动前端，页面才能完成计算与历史加载。

## 与后端连接

开发环境下无需任何配置：Vite 会把前端发出的 `/api/*` 请求自动代理到 `http://127.0.0.1:8000`（见 `vite.config.js`）。

生产部署时二选一：

1. **反向代理（推荐）**：由 Nginx 等把 `/api` 转发到后端服务，前端保持相对路径即可；
2. **直接指定后端地址**：构建时设置环境变量
   `VITE_API_BASE_URL=https://your-backend.example.com`（此时需在后端用 `CORS_ORIGINS` 放行前端域名）。

所有请求统一封装在 `src/api/calcApi.js`，组件不直接接触网络细节。

## 功能清单

基础要求：

- 四则运算按钮输入（`×` `÷` 显示符号，发送给后端时转换为 `*` `/`）
- 复合表达式：优先级、括号、一元正负号、小数
- 结果显示与后端错误信息展示
- 计算历史：从后端数据库读取、刷新页面后仍然存在
- 删除单条历史记录（删除后按数据库最新状态刷新）
- 后端不可用时明确提示，且**不会**在本地算出结果

扩展功能：

- ⌨ 键盘输入（数字/运算符/括号、回车计算、退格、Esc 清空）
- 🌙 深色 / 浅色主题切换（仅 UI 偏好，保存在 localStorage）
- 🔍 历史记录按表达式搜索
- 📄 历史记录分页（“加载更多”）
- 🗑 一键清空全部历史

## 部署提示

- `pnpm build` 后把 `dist/` 目录部署到任意静态托管（GitHub Pages、Vercel、Netlify、Nginx 等）。
- 使用 GitHub Pages 时注意设置 `VITE_API_BASE_URL`，并把后端 `CORS_ORIGINS` 设为页面域名（GitHub Pages 的 `*.github.io`）。
