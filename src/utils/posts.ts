/**
 * posts.ts — 博客文章数据层
 *
 * 职责：
 * 1. 通过 Vite import.meta.glob 自动扫描 src/content/posts/ 下的所有 .md 文件
 * 2. 解析 YAML frontmatter（标题、日期、分类、封面、描述、标签）
 * 3. 暴露导出接口给 Vue 组件调用
 */

export interface PostMeta {
  slug: string
  title: string
  date: string
  category: string
  cover?: string
  description: string
  tags: string[]
}

export interface PostWithContent extends PostMeta {
  content: string
}

/* ===== Frontmatter 解析（无外部依赖） ===== */

function parseFrontmatter(raw: string): {
  data: Record<string, string | string[]>
  content: string
} {
  const data: Record<string, string | string[]> = {}
  let content = raw

  // 兼容 \n（Unix）和 \r\n（Windows）换行
  const normalized = raw.replace(/\r\n/g, '\n')
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (match) {
    content = match[2].trim()
    const lines = match[1].split('\n')
    for (const line of lines) {
      const sep = line.indexOf(':')
      if (sep === -1) continue
      const key = line.slice(0, sep).trim()
      let val: string | string[] = line.slice(sep + 1).trim()

      // 处理数组: [a, b, c]
      if (val.startsWith('[') && val.endsWith(']')) {
        val = val
          .slice(1, -1)
          .split(',')
          .map((v) => v.trim().replace(/^['"]|['"]$/g, ''))
      } else {
        val = val.replace(/^['"]|['"]$/g, '')
      }
      data[key] = val
    }
  }

  return { data, content }
}

/* ===== Slug 抽取 ===== */

function slugFromPath(path: string): string {
  // path 示例: ./hello-world.md 或 /src/content/posts/hello-world.md
  const parts = path.replace(/\\/g, '/').split('/')
  const file = parts[parts.length - 1]
  return file.replace(/\.md$/i, '')
}

/* ===== 全局文章索引 ===== */

/**
 * 自动扫描 posts 目录中的所有 .md 文件（以 raw 方式导入）
 * Vite 编译时将其内联为字符串。
 *
 * 注意：import.meta.glob 中的路径必须是字面量，不能用变量！
 */
const rawModules: Record<string, string> = import.meta.glob(
  '/src/content/posts/*.md',
  { eager: true, query: '?raw', import: 'default' },
) as Record<string, string>

/** 所有解析后的文章（含内容） */
export const allPosts: PostWithContent[] = Object.entries(rawModules)
  .map(([path, raw]) => {
    const { data, content } = parseFrontmatter(raw as string)
    return {
      slug: slugFromPath(path),
      title: (data.title as string) || slugFromPath(path),
      date: (data.date as string) || '',
      category: (data.category as string) || '未分类',
      cover: data.cover as string | undefined,
      description: (data.description as string) || '',
      tags: (Array.isArray(data.tags) ? data.tags : []) as string[],
      content,
    }
  })
  .sort((a, b) => b.date.localeCompare(a.date))

/** 所有文章分类列表 */
export const allCategories: string[] = (() => {
  const set = new Set<string>()
  for (const p of allPosts) {
    if (p.category) set.add(p.category)
  }
  return ['全部', ...Array.from(set)]
})()

/** 按分类筛选 */
export function getPostsByCategory(category: string): PostWithContent[] {
  if (category === '全部' || !category) return allPosts
  return allPosts.filter((p) => p.category === category)
}

/** 通过 slug 获取某篇文章 */
export function getPostBySlug(slug: string): PostWithContent | undefined {
  return allPosts.find((p) => p.slug === slug)
}
