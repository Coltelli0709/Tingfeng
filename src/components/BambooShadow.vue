<template>
  <div class="bamboo" aria-hidden="true">
    <svg
      class="bamboo__svg"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <!-- 墨色渐变：叶尖淡、叶根浓 -->
        <linearGradient id="ink-leaf" x1="0" y1="0" x2="1" y2="0.35">
          <stop offset="0" stop-color="#5d7286" stop-opacity="0.45" />
          <stop offset="0.55" stop-color="#5d7286" stop-opacity="0.2" />
          <stop offset="1" stop-color="#5d7286" stop-opacity="0.04" />
        </linearGradient>

        <!-- 水墨晕染 -->
        <radialGradient id="ink-wash">
          <stop offset="0" stop-color="#5d7286" stop-opacity="0.18" />
          <stop offset="0.6" stop-color="#5d7286" stop-opacity="0.07" />
          <stop offset="1" stop-color="#5d7286" stop-opacity="0" />
        </radialGradient>

        <filter id="ink-soft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <filter id="ink-wash-blur" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="16" />
        </filter>

        <!-- 一片竹叶 -->
        <path
          id="bamboo-leaf"
          d="M0 0 C 15 -8, 33 -12, 48 -7 C 34 3, 14 7, 0 0 Z"
        />

        <!-- 叶簇：不同角度让竹叶有疏密 -->
        <g id="leaf-fan-a">
          <use href="#bamboo-leaf" transform="rotate(-62) scale(1.05)" />
          <use href="#bamboo-leaf" transform="rotate(-42) scale(1.18)" />
          <use href="#bamboo-leaf" transform="rotate(-22) scale(0.98)" />
          <use href="#bamboo-leaf" transform="rotate(-78) scale(0.85)" />
        </g>
        <g id="leaf-fan-b">
          <use href="#bamboo-leaf" transform="rotate(-34) scale(1.1)" />
          <use href="#bamboo-leaf" transform="rotate(-10) scale(0.94)" />
          <use href="#bamboo-leaf" transform="rotate(-56) scale(0.88)" />
          <use href="#bamboo-leaf" transform="rotate(8) scale(0.8)" />
        </g>
        <g id="leaf-fan-c">
          <use href="#bamboo-leaf" transform="rotate(18) scale(1.02)" />
          <use href="#bamboo-leaf" transform="rotate(40) scale(1.14)" />
          <use href="#bamboo-leaf" transform="rotate(62) scale(0.9)" />
          <use href="#bamboo-leaf" transform="rotate(2) scale(0.84)" />
        </g>

        <g id="bamboo-cluster">
          <!-- 背景墨晕 -->
          <ellipse
            cx="128"
            cy="420"
            rx="110"
            ry="230"
            fill="url(#ink-wash)"
            filter="url(#ink-wash-blur)"
          />
          <ellipse
            cx="225"
            cy="220"
            rx="80"
            ry="150"
            fill="url(#ink-wash)"
            opacity="0.7"
            filter="url(#ink-wash-blur)"
          />
          <ellipse
            cx="60"
            cy="560"
            rx="70"
            ry="120"
            fill="url(#ink-wash)"
            opacity="0.5"
            filter="url(#ink-wash-blur)"
          />

          <!-- 后景竹竿（虚） -->
          <g opacity="0.42" filter="url(#ink-soft)">
            <path
              d="M250 700 C 242 570, 256 450, 248 330 C 243 230, 252 120, 248 10"
              fill="none"
              stroke="#5d7286"
              stroke-width="9"
              stroke-linecap="round"
              opacity="0.14"
            />
            <path
              d="M250 700 C 242 570, 256 450, 248 330 C 243 230, 252 120, 248 10"
              fill="none"
              stroke="#5d7286"
              stroke-width="1.1"
              opacity="0.22"
            />
            <use
              href="#leaf-fan-a"
              transform="translate(248 200) rotate(10) scale(1.05)"
              fill="url(#ink-leaf)"
            />
          </g>

          <!-- 后景叶 -->
          <g opacity="0.4" filter="url(#ink-soft)">
            <use
              href="#leaf-fan-c"
              transform="translate(30 380) scale(-1 1) scale(1.15)"
              fill="url(#ink-leaf)"
            />
            <use
              href="#leaf-fan-b"
              transform="translate(240 280) rotate(18) scale(1.15)"
              fill="url(#ink-leaf)"
            />
          </g>

          <!-- 主竿一 -->
          <g fill="none" stroke="#5d7286" stroke-linecap="round">
            <path
              d="M84 700 C 74 560, 94 420, 82 280 C 74 160, 88 70, 82 0"
              stroke-width="11"
              opacity="0.09"
            />
            <path
              d="M84 700 C 74 560, 94 420, 82 280 C 74 160, 88 70, 82 0"
              stroke-width="1.6"
              opacity="0.3"
            />
            <path d="M73 610 C 78 605, 86 605, 91 610" stroke-width="2.4" opacity="0.3" />
            <path d="M76 520 C 81 515, 89 515, 94 520" stroke-width="2.2" opacity="0.28" />
            <path d="M79 430 C 84 425, 92 425, 97 430" stroke-width="2.4" opacity="0.3" />
            <path d="M79 340 C 84 335, 92 335, 97 340" stroke-width="2.2" opacity="0.28" />
            <path d="M73 250 C 78 245, 86 245, 91 250" stroke-width="2.4" opacity="0.3" />
            <path d="M71 160 C 76 155, 84 155, 89 160" stroke-width="2.2" opacity="0.28" />
            <path d="M76 70 C 81 65, 89 65, 94 70" stroke-width="2.4" opacity="0.3" />
          </g>

          <!-- 主竿二 -->
          <g fill="none" stroke="#5d7286" stroke-linecap="round">
            <path
              d="M176 700 C 166 570, 188 440, 176 300 C 168 190, 182 100, 176 40"
              stroke-width="10"
              opacity="0.075"
            />
            <path
              d="M176 700 C 166 570, 188 440, 176 300 C 168 190, 182 100, 176 40"
              stroke-width="1.4"
              opacity="0.26"
            />
            <path d="M168 620 C 173 615, 181 615, 186 620" stroke-width="2.2" opacity="0.26" />
            <path d="M171 530 C 176 525, 184 525, 189 530" stroke-width="2" opacity="0.24" />
            <path d="M173 440 C 178 435, 186 435, 191 440" stroke-width="2.2" opacity="0.26" />
            <path d="M168 350 C 173 345, 181 345, 186 350" stroke-width="2" opacity="0.24" />
            <path d="M170 260 C 175 255, 183 255, 188 260" stroke-width="2.2" opacity="0.26" />
            <path d="M176 170 C 181 165, 189 165, 194 170" stroke-width="2" opacity="0.24" />
            <path d="M172 90 C 177 85, 185 85, 190 90" stroke-width="2.2" opacity="0.26" />
          </g>

          <!-- 竹枝：先铺一层淡墨，再压一根细线 -->
          <g fill="none" stroke="#5d7286" stroke-linecap="round">
            <g opacity="0.6">
              <path d="M86 340 C 125 328, 158 302, 190 268" stroke-width="5" opacity="0.08" />
              <path d="M190 268 C 216 254, 240 232, 258 205" stroke-width="4.5" opacity="0.08" />
              <path d="M178 440 C 210 428, 240 405, 264 375" stroke-width="4.5" opacity="0.07" />
              <path d="M82 540 C 52 522, 32 496, 18 462" stroke-width="4.5" opacity="0.07" />
              <path d="M176 200 C 200 190, 222 172, 238 150" stroke-width="4" opacity="0.07" />
            </g>
            <path d="M86 340 C 125 328, 158 302, 190 268" stroke-width="1.5" opacity="0.28" />
            <path d="M190 268 C 216 254, 240 232, 258 205" stroke-width="1.2" opacity="0.25" />
            <path d="M178 440 C 210 428, 240 405, 264 375" stroke-width="1.4" opacity="0.26" />
            <path d="M82 540 C 52 522, 32 496, 18 462" stroke-width="1.3" opacity="0.24" />
            <path d="M176 200 C 200 190, 222 172, 238 150" stroke-width="1.2" opacity="0.24" />
          </g>

          <!-- 中景叶 -->
          <g fill="url(#ink-leaf)">
            <use href="#leaf-fan-a" transform="translate(258 205)" opacity="0.95" />
            <use href="#leaf-fan-b" transform="translate(264 375)" opacity="0.9" />
            <use href="#leaf-fan-c" transform="translate(18 462) scale(-1 1)" opacity="0.85" />
            <use href="#leaf-fan-b" transform="translate(238 150)" opacity="0.85" />
            <use
              href="#leaf-fan-a"
              transform="translate(176 40) rotate(-12) scale(0.8)"
              opacity="0.8"
            />
            <use
              href="#leaf-fan-c"
              transform="translate(96 500) rotate(-15) scale(0.7)"
              opacity="0.6"
            />
          </g>

          <!-- 前景叶：更实、更清晰 -->
          <g fill="url(#ink-leaf)">
            <use
              href="#leaf-fan-b"
              transform="translate(190 268) rotate(-20) scale(0.7)"
              opacity="0.65"
            />
            <use
              href="#leaf-fan-a"
              transform="translate(264 375) rotate(8) scale(0.72)"
              opacity="0.6"
            />
            <use
              href="#leaf-fan-c"
              transform="translate(18 462) rotate(25) scale(-0.72 0.72)"
              opacity="0.55"
            />
          </g>

          <!-- 墨点 -->
          <g fill="#5d7286" opacity="0.18">
            <circle cx="206" cy="500" r="2.2" />
            <circle cx="84" cy="585" r="1.4" />
            <circle cx="232" cy="430" r="1.1" />
            <circle cx="142" cy="655" r="1.8" />
            <circle cx="58" cy="470" r="1.2" />
          </g>
        </g>
      </defs>

      <use href="#bamboo-cluster" transform="translate(-30, 230)" />
      <use href="#bamboo-cluster" transform="translate(1470, 20) scale(-1, 1)" />
    </svg>
  </div>
</template>

<style scoped>
.bamboo {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  opacity: 0.72;
  pointer-events: none;
  mix-blend-mode: multiply;
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    #000 8%,
    #000 90%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    #000 8%,
    #000 90%,
    transparent 100%
  );
}

.bamboo__svg {
  display: block;
  width: 100%;
  height: 100%;
}

@media (max-width: 1200px) {
  .bamboo {
    opacity: 0.5;
  }
}

@media (max-width: 900px) {
  .bamboo {
    display: none;
  }
}
</style>
