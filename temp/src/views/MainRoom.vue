<template>
  <div class="room-container">
    <!-- 竹屋全景底图 -->
    <img
      src="/images/room_full_bg.webp"
      alt="竹屋内景"
      class="room-background"
    />

    <!-- 互动物件层 -->
    <div class="room-objects-layer">
      <!-- 竹简架上层 — 公开项目 -->
      <RoomObject
        object-id="shelf-up"
        alt="竹简架上层 · 公开项目"
        image-src="/images/objects/shelf_up.png"
        tooltip="查阅竹简 · 公开项目"
        :position="{ left: '7%', top: '22%', width: '22%' }"
        :z-index="3"
        to="/projects"
        label="竹简架"
      />

      <!-- 竹简架下层 — 私有仓库（常闭，仅显示刻痕数字） -->
      <div
        class="room-object shelf-down"
        :style="{
          left: '8%',
          top: '52%',
          width: '20%',
          zIndex: 2,
        }"
      >
        <img
          src="/images/objects/shelf_down.png"
          alt="竹简架下层 · 私有仓库"
          class="room-object__image"
          draggable="false"
        />
        <!-- 门板刻痕数字 -->
        <div class="shelf-down__carving">
          <GithubDisplay />
        </div>
        <div class="shelf-down__seal">常闭</div>
      </div>

      <!-- 纸质日记本 — 博客入口 -->
      <RoomObject
        object-id="diary"
        alt="线装日记本 · 博客"
        image-src="/images/objects/diary.png"
        tooltip="翻开日记 · 阅读博客"
        :position="{ left: '38%', top: '54%', width: '15%' }"
        :z-index="4"
        to="/blog"
        label="日记"
      />

      <!-- 毛笔（装饰，悬在日记本旁） -->
      <div
        class="brush-decoration"
        :style="{
          left: '52%',
          top: '50%',
          width: '7%',
          zIndex: 5,
        }"
      >
        <img
          src="/images/objects/brush.png"
          alt="毛笔"
          class="room-object__image"
          draggable="false"
        />
      </div>

      <!-- 素雅银镜 — 游戏入口 -->
      <RoomObject
        object-id="mirror"
        alt="素雅银镜 · 镜中世界"
        image-src="/images/objects/mirror.png"
        tooltip="照镜 · 进入镜中世界"
        :position="{ left: '65%', top: '24%', width: '16%' }"
        :z-index="3"
        to="/game"
        label="银镜"
      />

      <!-- 镜面流动银雾（CSS 动画） -->
      <div
        class="mirror-mist"
        :style="{
          left: '67.5%',
          top: '28%',
          width: '11%',
          height: '20%',
          zIndex: 4,
        }"
        aria-hidden="true"
      />
    </div>

    <!-- 竹屋标题（角落） -->
    <div class="room-title">
      <h1 class="room-title__main">竹 屋</h1>
      <p class="room-title__sub">Bamboo House</p>
    </div>

    <!-- 底部提示 -->
    <div class="room-hint">
      <span>点击屋内陈设以探索</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import RoomObject from '@/components/RoomObject.vue'
import GithubDisplay from '@/components/GithubDisplay.vue'
</script>

<style scoped>
/* ===== 竹简架下层门板 ===== */
.shelf-down {
  position: absolute;
  cursor: default;
}

.shelf-down__carving {
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.shelf-down__seal {
  position: absolute;
  bottom: 12%;
  right: 15%;
  font-family: 'FangSong', '仿宋', 'STFangsong', serif;
  font-size: clamp(9px, 1vw, 12px);
  color: #6b5a3a;
  opacity: 0.5;
  letter-spacing: 0.3em;
  transform: rotate(-8deg);
}

/* ===== 毛笔装饰 ===== */
.brush-decoration {
  position: absolute;
  pointer-events: none;
  transform: rotate(15deg);
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.15));
}

/* ===== 镜面银雾 ===== */
.mirror-mist {
  position: absolute;
  background: radial-gradient(
    ellipse at center,
    rgba(192, 192, 192, 0.15) 0%,
    rgba(192, 192, 192, 0.06) 40%,
    transparent 70%
  );
  border-radius: 50%;
  animation: mist-flow 4s ease-in-out infinite alternate;
  pointer-events: none;
}

@keyframes mist-flow {
  0% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
  100% {
    opacity: 0.3;
    transform: scale(0.98);
  }
}

/* ===== 竹屋标题 ===== */
.room-title {
  position: absolute;
  top: clamp(16px, 3vw, 32px);
  left: clamp(16px, 3vw, 32px);
  z-index: 10;
  pointer-events: none;
}

.room-title__main {
  font-family: 'FangSong', '仿宋', 'STFangsong', serif;
  font-size: clamp(24px, 3.5vw, 40px);
  font-weight: normal;
  color: #3a4a2a;
  margin: 0;
  letter-spacing: 0.3em;
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.4);
}

.room-title__sub {
  font-family: 'FangSong', '仿宋', 'STFangsong', serif;
  font-size: clamp(10px, 1.2vw, 14px);
  color: #5a6b4a;
  margin: 4px 0 0;
  opacity: 0.7;
  letter-spacing: 0.15em;
}

/* ===== 底部提示 ===== */
.room-hint {
  position: absolute;
  bottom: clamp(20px, 3vw, 40px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  font-family: 'FangSong', '仿宋', 'STFangsong', serif;
  font-size: clamp(11px, 1.2vw, 14px);
  color: #5a6b4a;
  opacity: 0.6;
  letter-spacing: 0.1em;
  animation: hint-pulse 3s ease-in-out infinite;
  pointer-events: none;
}

@keyframes hint-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.75; }
}
</style>
