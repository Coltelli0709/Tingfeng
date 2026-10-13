/** 文章目录（TOC）相关工具 */

export interface TocHeading {
  level: number
  text: string
  id: string
}

/**
 * 依据标题文本生成锚点 id。
 * 保留中英文与数字，空白转连字符；同名标题自动追加 -1 / -2 … 保证唯一。
 * used 为跨标题去重用的计数器。
 */
export function slugifyHeading(text: string, used: Record<string, number>): string {
  let base = text
    .toLowerCase()
    .replace(/[*_`~]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w一-龥-]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

  if (!base) base = 'section'

  const n = used[base] ?? 0
  used[base] = n + 1
  return n === 0 ? base : `${base}-${n}`
}
