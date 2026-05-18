<template>
  <div
    class="room-object"
    :class="{ 'room-object--interactable': to }"
    :style="objectStyle"
    :data-room-object="objectId"
    :title="tooltip"
    @click="handleClick"
    @mouseenter="handleHover(true)"
    @mouseleave="handleHover(false)"
  >
    <img
      v-if="imageSrc"
      :src="imageSrc"
      :alt="alt || objectId"
      class="room-object__image"
      draggable="false"
    />
    <div v-if="$slots.default" class="room-object__overlay">
      <slot />
    </div>
    <div v-if="label" class="room-object__label">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  /** 物件唯一标识 */
  objectId: string
  /** 物件图片路径 */
  imageSrc?: string
  /** 无障碍 alt 文本 */
  alt?: string
  /** 路由跳转目标 */
  to?: string
  /** 悬停提示 */
  tooltip?: string
  /** CSS 定位信息：left, top, width (百分比) */
  position?: { left: string; top: string; width: string }
  /** 物件的 z-index 层级 */
  zIndex?: number
  /** 物件下方的小字标签 */
  label?: string
}>()

const router = useRouter()
const isHovered = ref(false)

const objectStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.position) {
    style.left = props.position.left
    style.top = props.position.top
    style.width = props.position.width
  }
  if (props.zIndex !== undefined) {
    style.zIndex = String(props.zIndex)
  }
  return style
})

const handleClick = () => {
  if (props.to) {
    router.push(props.to)
  }
}

const handleHover = (hover: boolean) => {
  isHovered.value = hover
}
</script>

<style scoped>
.room-object {
  position: absolute;
  cursor: default;
  transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              filter 0.35s ease;
  transform-origin: center bottom;
  user-select: none;
  -webkit-user-select: none;
}

.room-object--interactable {
  cursor: pointer;
}

.room-object--interactable:hover {
  transform: scale(1.08);
  filter: brightness(1.1) drop-shadow(0 2px 8px rgba(45, 74, 34, 0.35));
}

.room-object--interactable:active {
  transform: scale(0.97);
}

.room-object__image {
  width: 100%;
  height: auto;
  display: block;
  pointer-events: none;
}

.room-object__overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.room-object__label {
  position: absolute;
  bottom: -22px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'FangSong', '仿宋', 'STFangsong', serif;
  font-size: clamp(10px, 1.2vw, 14px);
  color: #5a6b4a;
  white-space: nowrap;
  opacity: 0.75;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
}
</style>
