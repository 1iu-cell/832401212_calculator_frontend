<script setup>
// 计算历史面板：展示后端数据库中的历史记录，支持搜索、分页、删除与清空。
defineProps({
  items: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  page: { type: Number, default: 1 },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  keyword: { type: String, default: '' },
})

const emit = defineEmits([
  'update:keyword',
  'search',
  'refresh',
  'load-more',
  'delete',
  'clear-all',
])

function formatExpression(expression) {
  return expression.replace(/\*/g, '×').replace(/\//g, '÷')
}
</script>

<template>
  <section class="history-card">
    <header class="history-header">
      <h2>计算历史</h2>
      <span class="history-source">数据来自后端数据库</span>
    </header>

    <div class="history-tools">
      <input
        :value="keyword"
        type="text"
        placeholder="搜索表达式，回车确认…"
        @input="emit('update:keyword', $event.target.value)"
        @keyup.enter="emit('search')"
      />
      <button type="button" class="tool-btn" @click="emit('search')">搜索</button>
      <button type="button" class="tool-btn" title="刷新" @click="emit('refresh')">⟳ 刷新</button>
      <button type="button" class="tool-btn danger" @click="emit('clear-all')">清空历史</button>
    </div>

    <p class="history-total">共 {{ total }} 条记录</p>

    <div v-if="error" class="history-error">⚠ {{ error }}</div>

    <ul class="history-list">
      <li v-for="item in items" :key="item.id" class="history-item">
        <div class="history-row">
          <span class="history-expr">{{ formatExpression(item.expression) }}</span>
          <span class="history-eq">=</span>
          <span class="history-result">{{ item.result }}</span>
        </div>
        <div class="history-meta">
          <span class="history-time">#{{ item.id }} · {{ item.created_at }}</span>
          <button
            type="button"
            class="delete-btn"
            title="删除这条记录"
            @click="emit('delete', item)"
          >
            删除
          </button>
        </div>
      </li>
      <li v-if="!loading && items.length === 0" class="history-empty">
        暂无计算历史，先做一次计算吧～
      </li>
    </ul>

    <footer class="history-footer">
      <button
        v-if="items.length < total"
        type="button"
        class="tool-btn"
        :disabled="loading"
        @click="emit('load-more')"
      >
        {{ loading ? '加载中…' : '加载更多' }}
      </button>
    </footer>
  </section>
</template>
