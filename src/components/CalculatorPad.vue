<script setup>
// 计算器按键区。× 和 ÷ 只是显示符号，实际发给后端的表达式使用 * 和 /。
defineProps({
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['append', 'backspace', 'clear', 'equals'])

const buttons = [
  { label: 'C', action: 'clear', cls: 'danger' },
  { label: '(', action: 'append', value: '(' },
  { label: ')', action: 'append', value: ')' },
  { label: '⌫', action: 'backspace', cls: 'func' },
  { label: '7', action: 'append', value: '7' },
  { label: '8', action: 'append', value: '8' },
  { label: '9', action: 'append', value: '9' },
  { label: '÷', action: 'append', value: '/', cls: 'op' },
  { label: '4', action: 'append', value: '4' },
  { label: '5', action: 'append', value: '5' },
  { label: '6', action: 'append', value: '6' },
  { label: '×', action: 'append', value: '*', cls: 'op' },
  { label: '1', action: 'append', value: '1' },
  { label: '2', action: 'append', value: '2' },
  { label: '3', action: 'append', value: '3' },
  { label: '−', action: 'append', value: '-', cls: 'op' },
  { label: '0', action: 'append', value: '0' },
  { label: '.', action: 'append', value: '.' },
  { label: '=', action: 'equals', cls: 'equals' },
  { label: '+', action: 'append', value: '+', cls: 'op' },
]

function onClick(button) {
  if (button.action === 'append') {
    emit('append', button.value)
  } else {
    emit(button.action)
  }
}
</script>

<template>
  <div class="pad">
    <button
      v-for="button in buttons"
      :key="button.label + (button.value || '')"
      type="button"
      class="pad-btn"
      :class="[button.cls, { 'is-disabled': disabled }]"
      :disabled="disabled"
      @click="onClick(button)"
    >
      {{ button.label }}
    </button>
  </div>
</template>
