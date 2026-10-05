<script setup>
// 计算器显示区：表达式、结果（来自后端）、错误提示、加载状态
defineProps({
  expression: { type: String, default: '' },
  result: { type: [Number, String], default: null },
  error: { type: String, default: '' },
  loading: { type: Boolean, default: false },
})
</script>

<template>
  <div class="display" :class="{ 'display-error-state': error }">
    <div class="display-expression" aria-live="polite">
      {{ expression || '\u00A0' }}
    </div>
    <div v-if="result !== null && !error" class="display-result" aria-live="polite">
      = {{ result }}
    </div>
    <div v-if="error" class="display-error" aria-live="assertive">
      ⚠ {{ error }}
    </div>
    <div class="display-status">
      <span v-if="loading" class="spinner" aria-hidden="true"></span>
      <span v-else-if="result !== null && !error" class="ok-tip">✓ 结果由后端计算并返回</span>
      <span v-else>输入表达式后点击 = 或按回车</span>
    </div>
  </div>
</template>
