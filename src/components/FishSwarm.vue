<template>
  <canvas ref="canvasRef" class="fish-swarm" aria-hidden="true" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

/* ================================================
   FishSwarm.vue — 鱼群背景动画

   等腰三角形鱼，不同顶角弧度代表不同种类，
   蓝色深浅表现远近，行为模拟 Boids 同向/极化算法。
   ================================================ */

interface Fish {
  x: number
  y: number
  vx: number
  vy: number
  apexAngle: number  // 顶角（弧度），决定鱼的体型
  depth: number      // 0–1，影响透明度与尺寸
  size: number       // 基础体长
}

const canvasRef = ref<HTMLCanvasElement>()
let animId = 0
let fishList: Fish[] = []
const FISH_COUNT = 35
const PERCEPTION = 80  // 邻居感知半径

// 三种顶角弧度（度→弧度），对应三个"种类"
const ANGLE_POOL = [
  { min: 20, max: 30 },   // 细长型
  { min: 40, max: 55 },   // 中型
  { min: 70, max: 90 },   // 圆润型
]

function initFish(w: number, h: number): Fish[] {
  const list: Fish[] = []
  for (let i = 0; i < FISH_COUNT; i++) {
    const type = ANGLE_POOL[i % ANGLE_POOL.length]
    const angleDeg = type.min + Math.random() * (type.max - type.min)
    const depth = 0.1 + Math.random() * 0.9

    list.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      apexAngle: (angleDeg * Math.PI) / 180,
      depth,
      size: 6 + depth * 8,
    })
  }
  return list
}

function updateFish(list: Fish[], w: number, h: number) {
  for (const f of list) {
    /* ---- 同向/极化（Alignment）---- */
    let avgVx = 0
    let avgVy = 0
    let count = 0

    for (const other of list) {
      if (other === f) continue
      const dx = other.x - f.x
      const dy = other.y - f.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < PERCEPTION) {
        avgVx += other.vx
        avgVy += other.vy
        count++
      }
    }

    if (count > 0) {
      avgVx /= count
      avgVy /= count
      f.vx += (avgVx - f.vx) * 0.015
      f.vy += (avgVy - f.vy) * 0.015
    }

    /* 随机扰动 */
    f.vx += (Math.random() - 0.5) * 0.02
    f.vy += (Math.random() - 0.5) * 0.02

    /* 限速 */
    const maxSpeed = 0.6 + (1 - f.depth) * 0.3
    const speed = Math.sqrt(f.vx * f.vx + f.vy * f.vy)
    if (speed > maxSpeed) {
      f.vx = (f.vx / speed) * maxSpeed
      f.vy = (f.vy / speed) * maxSpeed
    }
    if (speed < 0.15) {
      f.vx += (Math.random() - 0.5) * 0.1
      f.vy += (Math.random() - 0.5) * 0.1
    }

    /* 移动 */
    f.x += f.vx
    f.y += f.vy

    /* 边界环绕 */
    const margin = 30
    if (f.x < -margin) f.x = w + margin
    if (f.x > w + margin) f.x = -margin
    if (f.y < -margin) f.y = h + margin
    if (f.y > h + margin) f.y = -margin
  }
}

function drawFish(ctx: CanvasRenderingContext2D, f: Fish) {
  const angle = Math.atan2(f.vy, f.vx)
  const halfApex = f.apexAngle / 2
  const bodyLen = f.size * 2.2
  const halfBase = bodyLen * Math.tan(halfApex)

  /* 等腰三角形三个顶点 */
  const tipX = f.x + bodyLen * Math.cos(angle)
  const tipY = f.y + bodyLen * Math.sin(angle)
  const baseLx = f.x + halfBase * Math.cos(angle + Math.PI / 2)
  const baseLy = f.y + halfBase * Math.sin(angle + Math.PI / 2)
  const baseRx = f.x + halfBase * Math.cos(angle - Math.PI / 2)
  const baseRy = f.y + halfBase * Math.sin(angle - Math.PI / 2)

  ctx.beginPath()
  ctx.moveTo(tipX, tipY)
  ctx.lineTo(baseLx, baseLy)
  ctx.lineTo(baseRx, baseRy)
  ctx.closePath()

  // 深度控制透明度和颜色：近→亮蓝，远→深蓝偏灰
  const alpha = 0.035 + f.depth * 0.15
  // 远近色调偏移：近 #60a5fa，中 #2563eb，远 #1e3a5f
  const lightness = 40 + f.depth * 30 // HSL lightness 40–70
  ctx.fillStyle = `hsla(217, 85%, ${lightness}%, ${alpha})`
  ctx.fill()
}

function startLoop(ctx: CanvasRenderingContext2D) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) return

  let running = true

  function loop() {
    if (!running) return
    const w = window.innerWidth
    const h = window.innerHeight
    ctx.clearRect(0, 0, w, h)
    updateFish(fishList, w, h)
    for (const f of fishList) {
      drawFish(ctx, f)
    }
    animId = requestAnimationFrame(loop)
  }

  animId = requestAnimationFrame(loop)

  return () => {
    running = false
    cancelAnimationFrame(animId)
  }
}

let resizeHandler: (() => void) | null = null
let stopLoop: (() => void) | null = null

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  function resize() {
    const dpr = window.devicePixelRatio || 1
    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // 窗口缩放时重新初始化鱼的位置
    fishList = initFish(w, h)
    ctx.clearRect(0, 0, w, h)
  }

  resize()
  stopLoop = startLoop(ctx)

  resizeHandler = () => {
    const w = window.innerWidth
    const h = window.innerHeight
    const dpr = window.devicePixelRatio || 1
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  window.addEventListener('resize', resizeHandler)
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  stopLoop?.()
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
})
</script>

<style scoped>
.fish-swarm {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 0;
  pointer-events: none;
  display: block;
}
</style>
