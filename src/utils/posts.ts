/**
 * posts.ts — 博客文章数据层
 *
 * 数据源：code/post/{分类}/{文章名}.md
 * 专栏名称即文件夹名称，文章路径自动决定 category
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

/* ===== Frontmatter 解析 ===== */

function parseFrontmatter(raw: string): {
  data: Record<string, string | string[]>
  content: string
} {
  const data: Record<string, string | string[]> = {}
  const normalized = raw.replace(/\r\n/g, '\n')
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)

  if (!match) return { data, content: raw }

  const lines = match[1].split('\n')
  for (const line of lines) {
    const sep = line.indexOf(':')
    if (sep === -1) continue
    const key = line.slice(0, sep).trim()
    let val: string | string[] = line.slice(sep + 1).trim()

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

  return { data, content: match[2].trim() }
}

/* ===== 路径解析 ===== */

/**
 * 从路径中提取分类和 slug
 * post/技术/xxx.md  →  category="技术",  slug="xxx"
 */
function parsePath(path: string): { category: string; slug: string } {
  const parts = path.replace(/\\/g, '/').replace(/^\/+/, '').split('/')
  // parts: ["post", "技术", "xxx.md"]
  const fileName = parts[parts.length - 1]
  const slug = fileName.replace(/\.md$/i, '')
  const category = parts.length >= 2 ? parts[parts.length - 2] : '未分类'
  return { category, slug }
}

/* ===== 全局文章索引 ===== */

const rawModules: Record<string, string> = import.meta.glob(
  '/post/**/*.md',
  { eager: true, query: '?raw', import: 'default' },
) as Record<string, string>

/** 所有解析后的文章（按日期降序） */
export const allPosts: PostWithContent[] = Object.entries(rawModules)
  .map(([path, raw]) => {
    const { category, slug } = parsePath(path)
    const { data, content } = parseFrontmatter(raw as string)
    return {
      slug,
      title: (data.title as string) || slug,
      date: (data.date as string) || '',
      category,
      cover: data.cover as string | undefined,
      description: (data.description as string) || '',
      tags: (Array.isArray(data.tags) ? data.tags : []) as string[],
      content,
    }
  })
  .sort((a, b) => b.date.localeCompare(a.date))

/** 所有专栏（文件夹）名称 */
export const allCategories: string[] = (() => {
  const set = new Set<string>()
  for (const p of allPosts) {
    if (p.category) set.add(p.category)
  }
  return ['全部', ...Array.from(set)]
})()

/** 按专栏筛选 */
export function getPostsByCategory(category: string): PostWithContent[] {
  if (category === '全部' || !category) return allPosts
  return allPosts.filter((p) => p.category === category)
}

/** 通过 slug 获取单篇文章 */
export function getPostBySlug(slug: string): PostWithContent | undefined {
  return allPosts.find((p) => p.slug === slug)
}

/* ===== 时间筛选 ===== */

/**
 * 按起止日期筛选（含起止日，YYMMDD 格式）
 * 例：filterByDateRange(allPosts, '250101', '250531')
 *     只保留 date 在 2025-01-01 ~ 2025-05-31 之间的文章
 */
export function filterByDateRange(
  posts: PostWithContent[],
  start: string,  // YYMMDD
  end: string,    // YYMMDD
): PostWithContent[] {
  const s = yymmddToIso(start)
  const e = yymmddToIso(end)
  if (!s || !e) return posts
  return posts.filter((p) => p.date >= s && p.date <= e)
}

/** YYMMDD → YYYY-MM-DD，无效返回 null */
function yymmddToIso(yymmdd: string): string | null {
  const m = yymmdd.match(/^(\d{2})(\d{2})(\d{2})$/)
  if (!m) return null
  const yy = parseInt(m[1])
  const mm = m[2]
  const dd = m[3]
  const yyyy = yy >= 50 ? 1900 + yy : 2000 + yy
  return `${yyyy}-${mm}-${dd}`
}
