# 前端代码规范（codestyle.md）

> 规范来源：
>
> 1. **Vue 3 官方风格指南**（Official Style Guide，优先级 A/B 规则全部采用）
>    <https://vuejs.org/style-guide/>
> 2. **Airbnb JavaScript Style Guide**
>    <https://github.com/airbnb/javascript>
> 3. **Google JavaScript Style Guide**（文件头注释与命名部分参考）
>    <https://google.github.io/styleguide/jsguide.html>

本文件是以上主流规范在本项目中的落地约定，团队协作与个人提交均按此执行。

## 1. 缩进、引号与分号

- 缩进使用 **2 个空格**，禁止 Tab。
- 字符串统一使用**单引号**；模板字符串使用反引号。
- 语句结尾**必须加分号**。
- 行宽建议不超过 100 字符。

## 2. 命名

- 变量 / 函数 / 方法：`camelCase`（如 `fetchHistory`、`displayExpression`）。
- 组件文件与组件名：`PascalCase`（如 `HistoryPanel.vue`）；模板中使用 `kebab-case`（`<history-panel>`）或 `PascalCase` 均可，项目中统一用 `PascalCase`。
- 常量：`UPPER_SNAKE_CASE`（如 `BASE_URL`、`PAGE_SIZE`）。
- 事件名（`emit`）：`kebab-case`（如 `@load-more`、`@clear-all`），符合 Vue 官方风格指南。
- 布尔变量以 `is`/`has` 开头（如 `isDark`、`hasMore`）。

## 3. 组件组织

- 使用 **Composition API + `<script setup>`**，按“状态 → 计算属性 → 方法 → 生命周期”分区书写，分区间空一行并加注释。
- 组件职责单一：展示类组件（`DisplayPanel`）只接收 props；交互类组件通过 `emit` 把动作交给父组件处理。
- props 必须声明类型与默认值：

```js
defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})
```

## 4. 模板规范

- 属性一行不超过两个；超过就换行并保持缩进对齐。
- `v-for` 必须配合唯一 `:key`。
- 用户可见的文案不硬编码在模板深处，尽量集中在组件内。
- 交互按钮写 `type="button"`，避免表单提交副作用。

## 5. 样式规范

- 使用 CSS 变量管理主题色（`--bg`、`--primary` 等），禁止在组件里写死颜色散值。
- 类名使用 `kebab-case`（如 `history-card`、`display-result`）。
- 全局样式集中在 `src/styles/main.css`，组件内不写 `<style>`（除非确有必要）。

## 6. 网络请求规范

- 所有后端交互**必须**走 `src/api/calcApi.js` 的封装函数，组件中禁止直接写 `fetch` 和 URL。
- 请求函数返回后端 JSON 数据；非 2xx 或网络错误统一抛出带友好 `message` 的 `Error`。
- 后端返回的表达式在展示前统一把 `*`/`/` 转换为 `×`/`÷`（`formatExpression`）。

## 7. 前后端分离铁律

- 前端**不得**实现任何数学计算：不调用 `eval`，不写表达式解析器，结果只能来自后端 API。
- 历史记录只能来自后端数据库，禁止用 localStorage 等前端存储充当历史（主题偏好等 UI 设置除外）。

## 8. 注释

- 文件头用注释说明模块职责；关键交互（如“只发送表达式给后端”）处加注释解释**为什么**。
- 魔法数字必须提取为具名常量（如 `PAGE_SIZE`）。

## 9. 提交信息

- 使用祈使句：`feat: add history panel`、`fix: handle backend down message`。
- 一次提交只做一件事。
