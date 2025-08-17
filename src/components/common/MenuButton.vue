<script setup lang="ts">
defineProps<{
  active?: boolean
  disabled?: boolean
}>()
</script>

<template>
  <div class="button" :class="{ active, disabled }"><slot></slot></div>
</template>

<style scoped>
.button {
  cursor: pointer;
  background-color: #fafafa;
  border: 1px solid #ccc;
  padding: 0px 4px;
  border-radius: 4px;
  margin-right: 4px;
  display: inline-block;
  pointer-events: auto;
}

.button:hover {
  background-color: #eee;
}

.active {
  background-color: #fff6ba;
  border-color: #aaa;
}

.active:hover {
  background-color: #e5ddaa;
}

.disabled {
  background-color: #f0f0f0;
  border-color: #ddd;
  color: #aaa;
  pointer-events: none;
}
</style>
