<template>
  <canvas ref="canvasRef" class="fish-swarm" aria-hidden="true" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

/* ================================================
   FishSwarm.vue — 深海生灵背景动画

   四种生物：小丑鱼（群游）、蝠鲼（滑翔）、
   水母（浮游）、鲨鱼（独行）
   蓝色主调 | 触壁转弯
   ================================================ */

type CreatureType = 'clownfish' | 'manta' | 'jellyfish' | 'shark'

interface BaseCreature {
  type: CreatureType
  x: number
  y: number
  vx: number
  vy: number
  depth: number     // 0–1，控制透明度和尺寸
  size: number      // 基础尺寸
  phase: number     // 动画相位（用于波动/游动）
}

type Creature = BaseCreature

const canvasRef = ref<HTMLCanvasElement>()
let animId = 0
let creatures: Creature[] = []
let time = 0

const SHARK_COUNT = 1
const MANTA_COUNT = 2
const JELLY_COUNT = 4
const CLOWNFISH_COUNT = 20

// ========== 初始化 ==========
function initAll(w: number, h: number): Creature[] {
  const list: Creature[] = []
  const r = () => Math.random()

  for (let i = 0; i < CLOWNFISH_COUNT; i++) {
    const depth = 0.15 + r() * 0.85
    list.push({
      type: 'clownfish',
      x: r() * w, y: r() * h,
      vx: (r() - 0.5) * 0.5, vy: (r() - 0.5) * 0.5,
      depth,
      size: 5 + depth * 7,
      phase: r() * Math.PI * 2,
    })
  }

  for (let i = 0; i < MANTA_COUNT; i++) {
    const depth = 0.2 + r() * 0.6
    list.push({
      type: 'manta',
      x: r() * w, y: r() * h,
      vx: (r() - 0.5) * 0.2, vy: (r() - 0.5) * 0.15,
      depth,
      size: 14 + depth * 12,
      phase: r() * Math.PI * 2,
    })
  }

  for (let i = 0; i < JELLY_COUNT; i++) {
    const depth = 0.15 + r() * 0.7
    list.push({
      type: 'jellyfish',
      x: r() * w, y: r() * h,
      vx: (r() - 0.5) * 0.08, vy: (r() - 0.5) * 0.08,
      depth,
      size: 10 + depth * 12,
      phase: r() * Math.PI * 2,
    })
  }

  for (let i = 0; i < SHARK_COUNT; i++) {
    const depth = 0.3 + r() * 0.5
    list.push({
      type: 'shark',
      x: r() * w, y: r() * h,
      vx: (r() - 0.5) * 0.4, vy: (r() - 0.5) * 0.3,
      depth,
      size: 22 + depth * 18,
      phase: r() * Math.PI * 2,
    })
  }

  return list
}

// ========== 运动更新 ==========
const EDGE = 80

function edgeForce(p: number, limit: number, strength: number): number {
  if (p < EDGE) return strength * (1 - p / EDGE + 0.05)
  if (p > limit - EDGE) return -strength * (1 - (limit - p) / EDGE + 0.05)
  return 0
}
function hardClamp(v: number, limit: number): number {
  if (v < -20) return -19
  if (v > limit + 20) return limit + 19
  return v
}

function updateClownfish(f: Creature, list: Creature[], w: number, h: number) {
  const SEP = 25, ALIGN = 80, COH = 130
  let av = 0, avx = 0, avy = 0
  let ccx = 0, ccy = 0, cc = 0

  for (const o of list) {
    if (o === f || o.type !== 'clownfish') continue
    const dx = o.x - f.x, dy = o.y - f.y
    const d = Math.sqrt(dx * dx + dy * dy)
    if (d < SEP && d > 0) {
      f.vx += (dx / d) * 0.055 * (1 - d / SEP)
      f.vy += (dy / d) * 0.055 * (1 - d / SEP)
    }
    if (d < ALIGN) { avx += o.vx; avy += o.vy; av++ }
    if (d < COH) { ccx += o.x; ccy += o.y; cc++ }
  }

  if (av > 0) { avx /= av; avy /= av;
    f.vx += (avx - f.vx) * 0.018; f.vy += (avy - f.vy) * 0.018 }
  if (cc > 0 && cc <= 15) { ccx /= cc; ccy /= cc;
    f.vx += (ccx - f.x) * 0.004; f.vy += (ccy - f.y) * 0.004 }
  if (cc > 15) { ccx /= cc; ccy /= cc;
    f.vx += (ccx - f.x) * 0.002; f.vy += (ccy - f.y) * 0.002 }

  f.vx += (Math.random() - 0.5) * 0.02
  f.vy += (Math.random() - 0.5) * 0.02
  f.vx += edgeForce(f.x, w, 0.3); f.vy += edgeForce(f.y, h, 0.3)

  const ms = 0.55 + (1 - f.depth) * 0.25
  const sp = Math.sqrt(f.vx * f.vx + f.vy * f.vy)
  if (sp > ms) { f.vx = (f.vx / sp) * ms; f.vy = (f.vy / sp) * ms }
  if (sp < 0.15) { f.vx = (f.vx / Math.max(sp, 0.01)) * 0.15
    f.vy = (f.vy / Math.max(sp, 0.01)) * 0.15 }

  f.x += f.vx; f.y += f.vy
  f.x = hardClamp(f.x, w); f.y = hardClamp(f.y, h)
  f.phase += 0.03
}

function updateManta(f: Creature, w: number, h: number) {
  // 缓慢滑翔，大弧度转向
  f.vx += (Math.random() - 0.5) * 0.012
  f.vy += (Math.random() - 0.5) * 0.012
  f.vx += edgeForce(f.x, w, 0.25); f.vy += edgeForce(f.y, h, 0.25)

  const ms = 0.3 + (1 - f.depth) * 0.15
  const sp = Math.sqrt(f.vx * f.vx + f.vy * f.vy)
  if (sp > ms) { f.vx = (f.vx / sp) * ms; f.vy = (f.vy / sp) * ms }
  if (sp < 0.06) { f.vx = (f.vx / Math.max(sp, 0.01)) * 0.06
    f.vy = (f.vy / Math.max(sp, 0.01)) * 0.06 }

  f.x += f.vx; f.y += f.vy
  f.x = hardClamp(f.x, w); f.y = hardClamp(f.y, h)
  f.phase += 0.025
}

function updateJellyfish(f: Creature, w: number, h: number) {
  // 上下浮动为主，微弱水平漂移
  const bob = Math.sin(time * 0.015 + f.phase) * 0.08
  f.vy += bob * 0.01
  f.vx += (Math.random() - 0.5) * 0.006
  f.vx += edgeForce(f.x, w, 0.2)
  f.vy += edgeForce(f.y, h, 0.15)

  const ms = 0.15 + (1 - f.depth) * 0.1
  const sp = Math.sqrt(f.vx * f.vx + f.vy * f.vy)
  if (sp > ms) { f.vx = (f.vx / sp) * ms; f.vy = (f.vy / sp) * ms }

  f.x += f.vx; f.y += f.vy
  f.x = hardClamp(f.x, w); f.y = hardClamp(f.y, h)
  f.phase += 0.02
}

function updateShark(f: Creature, w: number, h: number) {
  // 快速直行，偶尔偏转方向
  f.vx += (Math.random() - 0.5) * 0.025
  f.vy += (Math.random() - 0.5) * 0.025
  f.vx += edgeForce(f.x, w, 0.4); f.vy += edgeForce(f.y, h, 0.35)

  const ms = 0.7 + (1 - f.depth) * 0.2
  const sp = Math.sqrt(f.vx * f.vx + f.vy * f.vy)
  if (sp > ms) { f.vx = (f.vx / sp) * ms; f.vy = (f.vy / sp) * ms }
  if (sp < 0.25) { f.vx = (f.vx / Math.max(sp, 0.01)) * 0.25
    f.vy = (f.vy / Math.max(sp, 0.01)) * 0.25 }

  f.x += f.vx; f.y += f.vy
  f.x = hardClamp(f.x, w); f.y = hardClamp(f.y, h)
  f.phase += 0.04
}

// ========== 绘制 ==========

function drawClownfish(ctx: CanvasRenderingContext2D, f: Creature) {
  const a = Math.atan2(f.vy, f.vx)
  const bl = f.size * 2.2, hl = bl / 2
  const bw = bl * 0.38
  const tailWag = Math.sin(time * 0.04 + f.phase) * 0.06

  ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(a)

  // 身体 —— 圆浑的卵形
  ctx.beginPath()
  ctx.moveTo(hl * 0.9, 0)
  ctx.bezierCurveTo(hl * 0.4, -bw * 0.7, -hl * 0.2, -bw * 0.8, -hl * 0.6, -bw * 0.25)
  ctx.lineTo(-hl * (0.7 + tailWag), -bw * 0.45)
  ctx.lineTo(-hl * 0.5, 0)
  ctx.lineTo(-hl * (0.7 - tailWag), bw * 0.45)
  ctx.lineTo(-hl * 0.6, bw * 0.25)
  ctx.bezierCurveTo(-hl * 0.2, bw * 0.8, hl * 0.4, bw * 0.7, hl * 0.9, 0)
  ctx.closePath()
  ctx.fill()

  // 背鳍（小圆弧）
  ctx.beginPath()
  ctx.moveTo(hl * 0.1, -bw * 0.65)
  ctx.quadraticCurveTo(hl * 0.1, -bw * 0.9, -hl * 0.15, -bw * 0.7)
  ctx.fill()

  ctx.restore()
}

function drawManta(ctx: CanvasRenderingContext2D, f: Creature) {
  const a = Math.atan2(f.vy, f.vx)
  const bl = f.size * 2.5, hl = bl / 2
  const wingSpan = bl * 1.4
  const wingFlap = Math.sin(time * 0.02 + f.phase) * 0.12

  ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(a)

  // 身体——菱形宽体
  ctx.beginPath()
  ctx.moveTo(hl * 0.5, 0)                        // 头
  ctx.bezierCurveTo(hl * 0.1, -wingSpan * (0.45 + wingFlap),
    -hl * 0.3, -wingSpan * (0.4 + wingFlap),
    -hl * 0.4, -wingSpan * (0.1 + wingFlap * 0.5))  // 左翼尖
  ctx.bezierCurveTo(-hl * 0.3, -wingSpan * 0.05,
    -hl * 0.2, -wingSpan * 0.02,
    -hl * 0.6, 0)                                 // 尾基
  // 右翼
  ctx.bezierCurveTo(-hl * 0.2, wingSpan * 0.02,
    -hl * 0.3, wingSpan * 0.05,
    -hl * 0.4, wingSpan * (0.1 + wingFlap * 0.5))
  ctx.bezierCurveTo(-hl * 0.3, wingSpan * (0.4 + wingFlap),
    hl * 0.1, wingSpan * (0.45 + wingFlap),
    hl * 0.5, 0)
  ctx.closePath()
  ctx.fill()

  // 尾巴（细线）
  ctx.beginPath()
  ctx.moveTo(-hl * 0.6, 0)
  ctx.lineTo(-hl * 1.3, wingSpan * 0.02)
  ctx.strokeStyle = ctx.fillStyle
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.restore()
}

function drawJellyfish(ctx: CanvasRenderingContext2D, f: Creature) {
  const a = Math.atan2(f.vy, f.vx)
  const bl = f.size * 2, hl = bl / 2
  const bw = bl * 0.8
  const pulse = 0.85 + Math.sin(time * 0.015 + f.phase) * 0.15  // 呼吸缩放
  const r = bw * 0.5 * pulse

  ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(a)

  // 伞盖（半圆 + 底部收口）
  ctx.beginPath()
  ctx.arc(0, -r * 0.15, r, Math.PI, 0, false)
  ctx.quadraticCurveTo(r * 0.2, r * 0.2, 0, r * 0.25)
  ctx.quadraticCurveTo(-r * 0.2, r * 0.2, -r, -r * 0.15)
  ctx.closePath()
  ctx.fill()

  // 触须（3–4 条波浪线）
  const tenAlpha = 0.03 + f.depth * 0.12
  const tenLight = 38 + f.depth * 32
  ctx.strokeStyle = `hsla(217, 85%, ${tenLight}%, ${tenAlpha})`
  ctx.lineWidth = 0.8
  for (let i = -1; i <= 1; i += 0.66) {
    ctx.beginPath()
    const wx = i * r * 0.55
    const len = r * (0.8 + Math.sin(f.phase + i) * 0.3)
    ctx.moveTo(wx, r * 0.2)
    const segments = 5
    for (let s = 0; s <= segments; s++) {
      const t = s / segments
      const sy = r * 0.2 + t * len
      const sway = Math.sin(time * 0.02 + f.phase + t * 2 + i * 1.5) * r * 0.12
      ctx.lineTo(wx + sway, sy)
    }
    ctx.stroke()
  }

  ctx.restore()
}

function drawShark(ctx: CanvasRenderingContext2D, f: Creature) {
  const a = Math.atan2(f.vy, f.vx)
  const bl = f.size * 2.5, hl = bl / 2
  const bw = bl * 0.22        // 窄身
  const tailWag = Math.sin(time * 0.025 + f.phase) * 0.08

  ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(a)

  // 身体—— torpedo 流线型
  ctx.beginPath()
  ctx.moveTo(hl, 0)            // 鼻尖
  ctx.bezierCurveTo(hl * 0.6, -bw * 0.5, hl * 0.1, -bw * 0.85,
    -hl * 0.3, -bw * 0.7)     // 上轮廓到尾
  // 尾鳍上叶
  ctx.lineTo(-hl * 0.7, -bw * 1.1 - tailWag * bw)
  ctx.lineTo(-hl * 0.55, -bw * 0.3)
  // 尾鳍下叶
  ctx.lineTo(-hl * 0.7, bw * 1.1 + tailWag * bw)
  ctx.lineTo(-hl * 0.3, bw * 0.7)  // 回到尾基
  // 下轮廓回鼻尖
  ctx.bezierCurveTo(hl * 0.1, bw * 0.85, hl * 0.6, bw * 0.5, hl, 0)
  ctx.closePath()
  ctx.fill()

  // 背鳍 (大三角)
  ctx.beginPath()
  ctx.moveTo(hl * 0.1, -bw * 0.7)
  ctx.lineTo(-hl * 0.05, -bw * 1.3)
  ctx.lineTo(-hl * 0.2, -bw * 0.6)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}

const DRAWS: Record<CreatureType, (ctx: CanvasRenderingContext2D, f: Creature) => void> = {
  clownfish: drawClownfish,
  manta: drawManta,
  jellyfish: drawJellyfish,
  shark: drawShark,
}

// ========== 主循环 ==========
function updateAll(list: Creature[], w: number, h: number) {
  for (const c of list) {
    switch (c.type) {
      case 'clownfish': updateClownfish(c, list, w, h); break
      case 'manta': updateManta(c, w, h); break
      case 'jellyfish': updateJellyfish(c, w, h); break
      case 'shark': updateShark(c, w, h); break
    }
  }
}

function drawAll(ctx: CanvasRenderingContext2D, list: Creature[]) {
  for (const c of list) {
    const alphaVal = 0.03 + c.depth * 0.16
    const lightness = 38 + c.depth * 32
    ctx.fillStyle = `hsla(217, 85%, ${lightness}%, ${alphaVal})`
    DRAWS[c.type](ctx, c)
  }
}

function startLoop(ctx: CanvasRenderingContext2D) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  let running = true

  function loop() {
    if (!running) return
    time++
    const w = window.innerWidth, h = window.innerHeight
    ctx.clearRect(0, 0, w, h)
    updateAll(creatures, w, h)
    drawAll(ctx, creatures)
    animId = requestAnimationFrame(loop)
  }

  animId = requestAnimationFrame(loop)
  return () => { running = false; cancelAnimationFrame(animId) }
}

// ========== 生命周期 ==========
let resizeHandler: (() => void) | null = null
let stopLoop: (() => void) | null = null

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  function resize() {
    const w = window.innerWidth, h = window.innerHeight
    const dpr = window.devicePixelRatio || 1
    canvas.width = w * dpr; canvas.height = h * dpr
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    creatures = initAll(w, h)
  }

  resize()
  stopLoop = startLoop(ctx)

  resizeHandler = () => {
    const w = window.innerWidth, h = window.innerHeight
    const dpr = window.devicePixelRatio || 1
    canvas.width = w * dpr; canvas.height = h * dpr
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  window.addEventListener('resize', resizeHandler)
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  stopLoop?.()
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
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
