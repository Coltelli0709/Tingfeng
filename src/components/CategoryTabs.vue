<template>
  <div class="category-tabs">
    <button
      v-for="cat in categories"
      :key="cat"
      class="category-tabs__btn"
      :class="{ 'category-tabs__btn--active': cat === active }"
      @click="$emit('select', cat)"
    >
      {{ cat }}
      <span class="category-tabs__count">{{ countMap[cat] || 0 }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  categories: string[]
  active: string
  countMap: Record<string, number>
}>()

defineEmits<{
  select: [category: string]
}>()
</script>

<style scoped>
.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 24px;
}

.category-tabs__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  font-family: var(--font-sans);
  font-size: 0.85rem;
  color: var(--gray-600);
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-tabs__btn:hover {
  color: var(--blue-700);
  border-color: var(--blue-500);
  background: var(--blue-50);
}

.category-tabs__btn--active {
  color: var(--white);
  background: var(--blue-700);
  border-color: var(--blue-700);
}

.category-tabs__btn--active:hover {
  color: var(--white);
  background: var(--accent-hover);
  border-color: var(--accent-hover);
}

.category-tabs__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 100px;
  background: rgba(0, 0, 0, 0.08);
  color: inherit;
}

.category-tabs__btn--active .category-tabs__count {
  background: rgba(255, 255, 255, 0.2);
}
</style>
