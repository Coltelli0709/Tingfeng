<template>
  <canvas ref="canvasRef" class="fish-swarm" aria-hidden="true" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

/* ================================================
   FishSwarm.vue — 鱼群背景动画

   等腰三角形鱼 | 不同顶角弧度 = 不同种类
   蓝色深浅表现远近 | 同种鱼群游 | 触壁转弯
   ================================================ */

interface Fish {
  species: number   // 0 / 1 / 2，对应三种体型
  x: number
  y: number
  vx: number
  vy: number
  apexAngle: number // 顶角（弧度）
  depth: number     // 0–1，控制透明度和尺寸
  size: number
}

const canvasRef = ref<HTMLCanvasElement>()
let animId = 0
let fishList: Fish[] = []

const FISH_COUNT = 35

// 三个物种的顶角范围（度）
const ANGLE_POOL = [
  { min: 20, max: 30 },   // 物种 0：细长型
  { min: 40, max: 55 },   // 物种 1：中型
  { min: 70, max: 90 },   // 物种 2：圆润型
]

// ---- 初始化 ----
function initFish(w: number, h: number): Fish[] {
  const list: Fish[] = []
  // 均匀分配物种，每群约 10–12 条
  for (let i = 0; i < FISH_COUNT; i++) {
    const species = i % 3
    const type = ANGLE_POOL[species]
    const angleDeg = type.min + Math.random() * (type.max - type.min)
    const depth = 0.15 + Math.random() * 0.85

    list.push({
      species,
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

// ---- Boids 更新 ----
function updateFish(list: Fish[], w: number, h: number) {
  const SEP_RADIUS = 28       // 分离半径（任何鱼靠近就躲）
  const ALIGN_RADIUS = 90     // 同向感知半径
  const COHESION_RADIUS = 130 // 凝聚感知半径
  const EDGE_MARGIN = 80      // 边缘回避触发距离

  for (const f of list) {
    let alignVx = 0, alignVy = 0
    let alignCount = 0
    let cohCx = 0, cohCy = 0
    let cohCount = 0

    /* ---- 遍历其他鱼 ---- */
    for (const other of list) {
      if (other === f) continue
      const dx = other.x - f.x
      const dy = other.y - f.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      // ① 分离：任何鱼靠太近就推开
      if (dist < SEP_RADIUS && dist > 0) {
        f.vx += (dx / dist) * 0.06 * (1 - dist / SEP_RADIUS)
        f.vy += (dy / dist) * 0.06 * (1 - dist / SEP_RADIUS)
      }

      // ② 同向：同种鱼权重 1.0，异种仅 0.1
      if (dist < ALIGN_RADIUS) {
        const weight = other.species === f.species ? 1.0 : 0.1
        alignVx += other.vx * weight
        alignVy += other.vy * weight
        alignCount += weight
      }

      // ③ 凝聚：仅同种鱼拉拢（自然形成群组）
      if (other.species === f.species && dist < COHESION_RADIUS) {
        cohCx += other.x
        cohCy += other.y
        cohCount++
      }
    }

    // 应用同向力
    if (alignCount > 0) {
      alignVx /= alignCount
      alignVy /= alignCount
      f.vx += (alignVx - f.vx) * 0.018
      f.vy += (alignVy - f.vy) * 0.018
    }

    // 应用凝聚力——朝着同种鱼群中心
    if (cohCount > 0 && cohCount <= 20) {
      cohCx /= cohCount
      cohCy /= cohCount
      f.vx += (cohCx - f.x) * 0.004
      f.vy += (cohCy - f.y) * 0.004
    }

    // 如果群太大（>20），稍微减弱凝聚力，让群自然分裂
    if (cohCount > 20) {
      cohCx /= cohCount
      cohCy /= cohCount
      f.vx += (cohCx - f.x) * 0.002
      f.vy += (cohCy - f.y) * 0.002
    }

    /* ---- 边缘回避（提前转弯，不穿墙）---- */
    if (f.x < EDGE_MARGIN) {
      f.vx += 0.35 * (1 - f.x / EDGE_MARGIN + 0.1)
    }
    if (f.x > w - EDGE_MARGIN) {
      f.vx -= 0.35 * (1 - (w - f.x) / EDGE_MARGIN + 0.1)
    }
    if (f.y < EDGE_MARGIN) {
      f.vy += 0.35 * (1 - f.y / EDGE_MARGIN + 0.1)
    }
    if (f.y > h - EDGE_MARGIN) {
      f.vy -= 0.35 * (1 - (h - f.y) / EDGE_MARGIN + 0.1)
    }

    // 硬边界兜底（万一冲出，温和拉回）
    if (f.x < -20) { f.x = -19; f.vx *= -0.3 }
    if (f.x > w + 20) { f.x = w + 19; f.vx *= -0.3 }
    if (f.y < -20) { f.y = -19; f.vy *= -0.3 }
    if (f.y > h + 20) { f.y = h + 19; f.vy *= -0.3 }

    /* ---- 随机扰动 ---- */
    f.vx += (Math.random() - 0.5) * 0.02
    f.vy += (Math.random() - 0.5) * 0.02

    /* ---- 限速 ---- */
    const maxSpeed = 0.6 + (1 - f.depth) * 0.25
    const minSpeed = 0.2
    const speed = Math.sqrt(f.vx * f.vx + f.vy * f.vy)
    if (speed > maxSpeed) {
      f.vx = (f.vx / speed) * maxSpeed
      f.vy = (f.vy / speed) * maxSpeed
    }
    if (speed < minSpeed) {
      f.vx = (f.vx / Math.max(speed, 0.01)) * minSpeed
      f.vy = (f.vy / Math.max(speed, 0.01)) * minSpeed
    }

    /* ---- 移动 ---- */
    f.x += f.vx
    f.y += f.vy
  }
}

// ---- 绘制 ----
function drawFish(ctx: CanvasRenderingContext2D, f: Fish) {
  const angle = Math.atan2(f.vy, f.vx)
  const bl = f.size * 2.2          // body length
  const hl = bl / 2                // half length

  // 顶角 → 体宽：角度越大越圆润
  const ratio = 0.25 + (f.apexAngle / Math.PI) * 0.35
  const bw = bl * ratio            // body max width

  ctx.save()
  ctx.translate(f.x, f.y)
  ctx.rotate(angle)

  ctx.beginPath()
  // 鱼头（尖端）
  ctx.moveTo(hl, 0)

  // 上轮廓：从鱼头 → 鱼身最宽处 → 尾部收缩
  ctx.bezierCurveTo(
    hl * 0.35, -bw * 0.45,
    -hl * 0.05, -bw * 0.65,
    -hl * 0.55, -bw * 0.2,
  )

  // 上尾鳍（分叉）
  ctx.lineTo(-hl * 0.85, -bw * 0.55)
  // 尾叉缺口
  ctx.lineTo(-hl * 0.6, 0)
  // 下尾鳍
  ctx.lineTo(-hl * 0.85, bw * 0.55)
  // 尾部回到身体
  ctx.lineTo(-hl * 0.55, bw * 0.2)

  // 下轮廓：从尾部 → 鱼身最宽处 → 鱼头
  ctx.bezierCurveTo(
    -hl * 0.05, bw * 0.65,
    hl * 0.35, bw * 0.45,
    hl, 0,
  )

  ctx.closePath()

  const alpha = 0.03 + f.depth * 0.16
  const lightness = 38 + f.depth * 32
  ctx.fillStyle = `hsla(217, 85%, ${lightness}%, ${alpha})`
  ctx.fill()

  ctx.restore()
}

// ---- 循环 ----
function startLoop(ctx: CanvasRenderingContext2D) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  let running = true

  function loop() {
    if (!running) return
    const w = window.innerWidth
    const h = window.innerHeight
    ctx.clearRect(0, 0, w, h)
    updateFish(fishList, w, h)
    for (const f of fishList) drawFish(ctx, f)
    animId = requestAnimationFrame(loop)
  }

  animId = requestAnimationFrame(loop)
  return () => { running = false; cancelAnimationFrame(animId) }
}

// ---- 生命周期 ----
let resizeHandler: (() => void) | null = null
let stopLoop: (() => void) | null = null

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  function resize() {
    const w = window.innerWidth
    const h = window.innerHeight
    const dpr = window.devicePixelRatio || 1
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    fishList = initFish(w, h)
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
