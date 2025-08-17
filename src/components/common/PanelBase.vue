<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="panel-base">
    <div class="title">{{ title }}</div>
    <div class="content"><slot></slot></div>
  </div>
</template>

<style scoped>
.panel-base {
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  font-size: 0.8rem;
}

.title {
  background-color: #ccc;
  color: #333;
  font-weight: 700;
  padding: 0px 4px;
  position: sticky;
  top: 0;
}

.content {
  padding: 2px 4px;
}
</style>
