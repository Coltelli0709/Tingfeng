/**
 * textStats.ts — 文章字数统计
 *
 * 口径：中文字符（含假名）× 1 + 英文/数字单词 × 1。
 * 统计前会剥掉 Markdown 语法，不把代码块、图片地址、链接 URL 计入字数。
 */

/** 去除 Markdown 标记，只留下正文文本 */
function stripMarkdown(source: string): string {
  return source
    .replace(/<!--[\s\S]*?-->/g, ' ') // HTML 注释
    .replace(/^\s*(```|~~~)[\s\S]*?^\s*\1\s*$/gm, ' ') // 围栏代码块
    .replace(/`[^`\n]*`/g, ' ') // 行内代码
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // 图片
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 链接保留文字
    .replace(/<[^>]+>/g, ' ') // HTML 标签
    .replace(/^\s{0,3}#{1,6}\s+/gm, ' ') // 标题井号
    .replace(/^\s{0,3}>\s?/gm, ' ') // 引用符号
    .replace(/^\s*([-*+]|\d+\.)\s+/gm, ' ') // 列表符号
    .replace(/https?:\/\/\S+/g, ' ') // 裸链接
    .replace(/[*_~]+/g, ' ') // 强调/删除线标记
}

/** 统计中日韩字符：假名 U+3040–30FF、CJK 扩展 A U+3400–4DBF、基本区 U+4E00–9FFF、兼容区 U+F900–FAFF */
function countCJK(text: string): number {
  let count = 0
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0
    if (
      (cp >= 0x3040 && cp <= 0x30ff) ||
      (cp >= 0x3400 && cp <= 0x4dbf) ||
      (cp >= 0x4e00 && cp <= 0x9fff) ||
      (cp >= 0xf900 && cp <= 0xfaff)
    ) {
      count++
    }
  }
  return count
}

/** 英文/数字单词（保留 don't 这类撇号词） */
const WORD_RE = /[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g

/** 统计一段 Markdown 正文的字数 */
export function countWords(source: string): number {
  if (!source) return 0
  const text = stripMarkdown(source)
  const words = text.match(WORD_RE)?.length ?? 0
  return countCJK(text) + words
}

/** 格式化展示：「1,234 字」 */
export function formatWordCount(count: number): string {
  return `${Math.max(0, Math.round(count)).toLocaleString('en-US')} 字`
}
