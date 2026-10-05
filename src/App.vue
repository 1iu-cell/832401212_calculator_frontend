<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import CalculatorPad from './components/CalculatorPad.vue'
import DisplayPanel from './components/DisplayPanel.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import {
  calculateExpression,
  clearAllHistory,
  deleteHistoryRecord,
  fetchHistory,
} from './api/calcApi'

// ---------- 计算器状态 ----------
const expression = ref('') // 内部使用 * 和 /，展示时换成 × 和 ÷
const result = ref(null)   // 只保存后端返回的结果
const error = ref('')      // 后端返回的错误信息或网络错误
const calculating = ref(false)

const displayExpression = computed(() =>
  expression.value.replace(/\*/g, '×').replace(/\//g, '÷'),
)

// ---------- 历史记录状态 ----------
const PAGE_SIZE = 10
const historyItems = ref([])
const historyTotal = ref(0)
const historyPage = ref(1)
const historyLoading = ref(false)
const historyError = ref('')
const keyword = ref('')

// ---------- 主题（仅 UI 偏好，与计算无关） ----------
const isDark = ref(localStorage.getItem('theme') === 'dark')
function toggleTheme() {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  document.documentElement.dataset.theme = isDark.value ? 'dark' : 'light'
}

// ---------- 计算器交互 ----------
function append(token) {
  error.value = ''
  if (expression.value.length >= 200) {
    error.value = '表达式过长'
    return
  }
  expression.value += token
}

function backspace() {
  error.value = ''
  expression.value = expression.value.slice(0, -1)
}

function clear() {
  expression.value = ''
  result.value = null
  error.value = ''
}

async function equals() {
  if (calculating.value) return
  const expr = expression.value.trim()
  if (!expr) return
  // 输入辅助：结尾是运算符或左括号时先提示，不发送请求
  if (/[+\-*/(]$/.test(expr)) {
    error.value = '表达式不完整，请补全后计算'
    return
  }
  calculating.value = true
  error.value = ''
  try {
    // 关键：只把表达式发给后端，结果完全由后端计算并返回
    const data = await calculateExpression(expr)
    result.value = data.result
    await refreshHistory() // 计算成功后刷新历史列表
  } catch (err) {
    result.value = null
    error.value = err.message || '计算失败'
  } finally {
    calculating.value = false
  }
}

// ---------- 历史记录交互 ----------
async function refreshHistory() {
  historyLoading.value = true
  historyError.value = ''
  historyPage.value = 1
  try {
    const data = await fetchHistory({ page: 1, size: PAGE_SIZE, q: keyword.value })
    historyItems.value = data.items
    historyTotal.value = data.total
  } catch (err) {
    historyError.value = err.message
  } finally {
    historyLoading.value = false
  }
}

async function loadMore() {
  const nextPage = historyPage.value + 1
  historyLoading.value = true
  historyError.value = ''
  try {
    const data = await fetchHistory({
      page: nextPage,
      size: PAGE_SIZE,
      q: keyword.value,
    })
    historyItems.value.push(...data.items)
    historyTotal.value = data.total
    historyPage.value = nextPage
  } catch (err) {
    historyError.value = err.message
  } finally {
    historyLoading.value = false
  }
}

async function removeRecord(item) {
  if (!window.confirm(`确定删除记录 “${item.expression} = ${item.result}” 吗？`)) return
  historyError.value = ''
  try {
    await deleteHistoryRecord(item.id)
    await reloadCurrentPage() // 删除后按数据库最新状态刷新当前页
  } catch (err) {
    historyError.value = err.message
  }
}

async function reloadCurrentPage() {
  historyLoading.value = true
  try {
    let page = historyPage.value
    let data = await fetchHistory({ page, size: PAGE_SIZE, q: keyword.value })
    // 当前页被删空且不是第一页时回退一页
    while (page > 1 && data.items.length === 0) {
      page -= 1
      data = await fetchHistory({ page, size: PAGE_SIZE, q: keyword.value })
    }
    historyItems.value = data.items
    historyTotal.value = data.total
    historyPage.value = page
  } catch (err) {
    historyError.value = err.message
  } finally {
    historyLoading.value = false
  }
}

async function clearAll() {
  if (!window.confirm('确定清空所有计算历史吗？此操作不可恢复。')) return
  historyError.value = ''
  try {
    await clearAllHistory()
    historyItems.value = []
    historyTotal.value = 0
    historyPage.value = 1
  } catch (err) {
    historyError.value = err.message
  }
}

// ---------- 键盘支持（扩展功能） ----------
function onKeydown(event) {
  const target = event.target
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    return // 在搜索框里输入时不触发快捷键
  }
  const key = event.key
  if (/^[0-9.]$/.test(key)) {
    append(key)
    event.preventDefault()
  } else if (['+', '-', '*', '/'].includes(key)) {
    append(key)
    event.preventDefault()
  } else if (key === '(' || key === ')') {
    append(key)
    event.preventDefault()
  } else if (key === 'Enter') {
    equals()
    event.preventDefault()
  } else if (key === 'Backspace') {
    backspace()
    event.preventDefault()
  } else if (key === 'Escape') {
    clear()
    event.preventDefault()
  }
}

// ---------- 生命周期 ----------
onMounted(() => {
  document.documentElement.dataset.theme = isDark.value ? 'dark' : 'light'
  window.addEventListener('keydown', onKeydown)
  refreshHistory()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="page">
    <header class="app-header">
      <div class="app-title">
        <h1>计算器</h1>
        <span class="badge">前后端分离 · Vue 3 + FastAPI + SQLite</span>
      </div>
      <button class="theme-toggle" type="button" @click="toggleTheme">
        {{ isDark ? '☀️ 浅色模式' : '🌙 深色模式' }}
      </button>
    </header>

    <main class="layout">
      <section class="calculator-card">
        <DisplayPanel
          :expression="displayExpression"
          :result="result"
          :error="error"
          :loading="calculating"
        />
        <CalculatorPad
          :disabled="calculating"
          @append="append"
          @backspace="backspace"
          @clear="clear"
          @equals="equals"
        />
      </section>

      <HistoryPanel
        v-model="keyword"
        :items="historyItems"
        :total="historyTotal"
        :page="historyPage"
        :loading="historyLoading"
        :error="historyError"
        @search="refreshHistory"
        @refresh="refreshHistory"
        @load-more="loadMore"
        @delete="removeRecord"
        @clear-all="clearAll"
      />
    </main>

    <footer class="app-footer">
      <p>
        前端只负责交互与展示：点击「=」时把<span class="mono">表达式</span>发送到后端，
        由后端完成<span class="mono">解析与计算</span>，结果和错误信息都来自后端 API。
        停止后端服务后，本页面仍可操作界面，但无法得到新的计算结果。
      </p>
    </footer>
  </div>
</template>
