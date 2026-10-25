<template>
  <div class="bamboo" aria-hidden="true">
    <svg
      class="bamboo__svg"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <g
          id="bamboo-cluster"
          fill="none"
          stroke="currentColor"
          stroke-width="1.1"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <!-- 主竿 -->
          <path d="M78 680 C 70 566, 84 452, 76 338 C 69 240, 80 120, 76 0" />
          <path d="M71 600 C 75 596, 81 596, 85 600" />
          <path d="M74 510 C 78 506, 84 506, 88 510" />
          <path d="M70 420 C 74 416, 80 416, 84 420" />
          <path d="M73 330 C 77 326, 83 326, 87 330" />
          <path d="M71 240 C 75 236, 81 236, 85 240" />
          <path d="M75 150 C 79 146, 85 146, 89 150" />
          <path d="M74 60 C 78 56, 84 56, 88 60" />

          <!-- 第二根竿 -->
          <path d="M168 680 C 160 580, 174 480, 166 380 C 160 300, 170 200, 166 110" />
          <path d="M160 600 C 164 596, 170 596, 174 600" />
          <path d="M162 510 C 166 506, 172 506, 176 510" />
          <path d="M159 420 C 163 416, 169 416, 173 420" />
          <path d="M162 330 C 166 326, 172 326, 176 330" />
          <path d="M161 240 C 165 236, 171 236, 175 240" />
          <path d="M164 150 C 168 146, 174 146, 178 150" />

          <!-- 竹枝 -->
          <path d="M78 330 C 112 314, 140 288, 166 252" />
          <path d="M166 252 C 190 240, 214 224, 234 200" />
          <path d="M166 420 C 198 408, 228 388, 254 360" />
          <path d="M76 500 C 48 482, 28 456, 20 420" />
          <path d="M166 330 C 194 322, 220 306, 242 282" />

          <!-- 竹叶 -->
          <path d="M234 200 C 240 178, 258 162, 274 164 C 264 184, 248 198, 234 200 Z" />
          <path d="M254 360 C 258 338, 276 322, 292 326 C 282 346, 268 358, 254 360 Z" />
          <path d="M20 420 C 8 404, 2 384, 8 366 C 22 382, 30 404, 20 420 Z" />
          <path d="M242 282 C 252 264, 272 252, 288 258 C 276 274, 258 284, 242 282 Z" />
          <path d="M166 252 C 168 232, 182 214, 198 212 C 194 232, 180 248, 166 252 Z" />
          <path d="M76 420 C 58 410, 44 392, 44 374 C 62 380, 76 398, 76 420 Z" />
        </g>
      </defs>

      <use href="#bamboo-cluster" transform="translate(-20, 250)" />
      <use href="#bamboo-cluster" transform="translate(1460, 10) scale(-1, 1)" />
    </svg>
  </div>
</template>

<style scoped>
.bamboo {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  color: #64748b;
  opacity: 0.22;
  pointer-events: none;
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    #000 10%,
    #000 88%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    #000 10%,
    #000 88%,
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
    opacity: 0.14;
  }
}

@media (max-width: 900px) {
  .bamboo {
    display: none;
  }
}
</style>
