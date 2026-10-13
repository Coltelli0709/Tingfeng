<template>
  <div class="markdown-body" v-html="rendered" />
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import MarkdownIt from 'markdown-it'
import { slugifyHeading, type TocHeading } from '@/utils/toc'

const props = defineProps<{
  content: string
}>()

/* 渲染完成后把标题清单抛给父组件（Post.vue）用于生成目录 */
const emit = defineEmits<{
  headings: [items: TocHeading[]]
}>()

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
})

const result = computed<{ html: string; headings: TocHeading[] }>(() => {
  const src = props.content
  if (!src) {
    return {
      html: '<p style="color: var(--gray-400)">（空内容）</p>',
      headings: [],
    }
  }

  const env = {}
  const tokens = md.parse(src, env)
  const used: Record<string, number> = {}
  const headings: TocHeading[] = []

  // 给每个标题写入 id，并同步收集目录项
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (t.type !== 'heading_open') continue
    const level = Number(t.tag.slice(1))
    const inline = tokens[i + 1]
    const rawText = (inline?.content ?? '').trim()
    const id = slugifyHeading(rawText, used)
    t.attrSet('id', id)
    headings.push({ level, text: rawText.replace(/[*_`~]/g, ''), id })
  }

  return { html: md.renderer.render(tokens, md.options, env), headings }
})

const rendered = computed(() => result.value.html)

onMounted(() => emit('headings', result.value.headings))

watch(
  () => result.value.headings,
  (h) => emit('headings', h),
)
</script>

<style scoped>
/* ===== Markdown 渲染样式（蓝白主题） ===== */
.markdown-body {
  font-family: var(--font-serif);
  font-size: 1.05rem;
  line-height: 1.9;
  color: var(--gray-800);
  word-wrap: break-word;
}

.markdown-body :deep(h1) {
  font-family: var(--font-sans);
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 1.5em 0 0.5em;
  padding-bottom: 0.3em;
  border-bottom: 2px solid var(--blue-100);
}

/* 目录跳转时给粘性导航栏留出空间 */
.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4) {
  scroll-margin-top: 84px;
}

.markdown-body :deep(h2) {
  font-family: var(--font-sans);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--gray-900);
  margin: 1.4em 0 0.4em;
  padding-bottom: 0.2em;
  border-bottom: 1px solid var(--border);
}

.markdown-body :deep(h3) {
  font-family: var(--font-sans);
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--gray-800);
  margin: 1.3em 0 0.4em;
}

.markdown-body :deep(p) {
  margin: 0.8em 0;
}

.markdown-body :deep(a) {
  color: var(--blue-700);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}

.markdown-body :deep(a:hover) {
  border-bottom-color: var(--blue-700);
}

.markdown-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-sm);
  margin: 1.5em auto;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.markdown-body :deep(blockquote) {
  margin: 1.2em 0;
  padding: 0.8em 1.2em;
  border-left: 4px solid var(--blue-500);
  background: var(--blue-50);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  color: var(--gray-600);
}

.markdown-body :deep(blockquote p) {
  margin: 0.3em 0;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 1.5em;
  margin: 0.6em 0;
}

.markdown-body :deep(li) {
  margin: 0.3em 0;
}

.markdown-body :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.88em;
  padding: 2px 6px;
  background: var(--blue-50);
  border: 1px solid var(--blue-100);
  border-radius: 4px;
  color: var(--blue-800);
}

.markdown-body :deep(pre) {
  margin: 1.2em 0;
  padding: 1em 1.2em;
  background: var(--gray-900);
  border-radius: var(--radius-sm);
  overflow-x: auto;
  position: relative;
}

.markdown-body :deep(pre code) {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  padding: 0;
  background: transparent;
  border: none;
  color: #e2e8f0;
}

.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid var(--border);
  margin: 2em 0;
}

.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
  font-size: 0.9rem;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  padding: 10px 14px;
  border: 1px solid var(--border);
  text-align: left;
}

.markdown-body :deep(th) {
  background: var(--gray-100);
  font-weight: 600;
  color: var(--gray-800);
}

.markdown-body :deep(tr:nth-child(even)) {
  background: var(--gray-50);
}
</style>
