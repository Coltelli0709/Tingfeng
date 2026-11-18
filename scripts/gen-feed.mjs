/**
 * gen-feed.mjs — 生成 RSS 2.0 订阅源
 *
 * 数据源：blog/{版块}/{文章}.md（与 src/utils/posts.ts 同一套约定）
 * 输出：public/feed.xml（vite dev 直接可访问，build 时原样拷进 dist）
 *
 * 用法：npm run feed（predev / prebuild 会自动执行）
 */

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import MarkdownIt from 'markdown-it'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BLOG_DIR = path.join(ROOT, 'blog')
const OUT_FILE = path.join(ROOT, 'public', 'feed.xml')

/** 站点信息：换域名、改简介只动这里 */
const SITE = {
  url: 'https://llitecol.icu',
  title: '听风 · Coltelli的一隅自留地',
  description: '案牍劳形知何寿，听风时候便合眸。',
  language: 'zh-CN',
  /** feed 最多收录多少篇（全站最新在前） */
  maxItems: 30,
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
})

/* ===== frontmatter ===== */

function parseFrontmatter(raw) {
  const normalized = raw.replace(/\r\n/g, '\n')
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  const data = {}

  if (!match) return { data, content: raw }

  for (const line of match[1].split('\n')) {
    const sep = line.indexOf(':')
    if (sep === -1) continue

    const key = line.slice(0, sep).trim()
    if (!key) continue

    let val = line.slice(sep + 1).trim()
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val
        .slice(1, -1)
        .split(',')
        .map((v) => v.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean)
    } else {
      val = val.replace(/^['"]|['"]$/g, '')
    }
    data[key] = val
  }

  return { data, content: match[2].trim() }
}

/* ===== 文章收集 ===== */

async function listMarkdown(dir) {
  const files = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await listMarkdown(full)))
    else if (entry.isFile() && /\.md$/i.test(entry.name)) files.push(full)
  }
  return files
}

async function loadPosts() {
  const files = await listMarkdown(BLOG_DIR)
  const posts = []

  for (const file of files) {
    const raw = await readFile(file, 'utf8')
    const { data, content } = parseFrontmatter(raw)

    const rel = path.relative(BLOG_DIR, file).replace(/\\/g, '/')
    const parts = rel.split('/')
    const slug = parts[parts.length - 1].replace(/\.md$/i, '')
    const section = parts.length >= 2 ? parts[parts.length - 2] : ''

    // 约定：frontmatter 写 draft: true 的文章不进 feed
    if (data.draft === 'true' || data.draft === true) continue

    // 与 src/utils/posts.ts 保持一致：title 非字符串时回退成文件名
    const title =
      typeof data.title === 'string' && data.title.trim()
        ? data.title.trim()
        : slug

    posts.push({
      slug,
      section,
      title,
      date: typeof data.date === 'string' ? data.date.trim() : '',
      category:
        typeof data.category === 'string' && data.category.trim()
          ? data.category.trim()
          : section,
      description:
        typeof data.description === 'string' ? data.description.trim() : '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      content,
    })
  }

  // 最新在前；没有日期的排在最后
  return posts.sort((a, b) => b.date.localeCompare(a.date))
}

/* ===== 工具 ===== */

function xmlEscape(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** 正文里的站内绝对路径（/images/a.jpg）补成完整 URL，阅读器才显示得出来 */
function absolutizeUrls(html) {
  return html.replace(
    /\b(src|href)="(\/(?!\/)[^"]*)"/g,
    (_, attr, url) => `${attr}="${SITE.url}${url}"`,
  )
}

function cdata(html) {
  // CDATA 里不能出现 ]]>，拆开拼接
  return `<![CDATA[${html.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`
}

/** frontmatter 没写 description 时，从正文里截一段纯文本 */
function plainSummary(markdown, limit = 140) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<\/?[a-zA-Z][^>]*>/g, ' ')
    .replace(/[#>*_`~|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return text.length > limit ? `${text.slice(0, limit)}…` : text
}

/** yyyy-mm-dd → RFC 822（北京时间当天零点） */
function rfc822(dateStr) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr || '')
  if (!m) return ''
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00+08:00`)
  return Number.isNaN(d.getTime()) ? '' : d.toUTCString()
}

function postUrl(post) {
  return `${SITE.url}/blog/${encodeURIComponent(post.slug)}`
}

/* ===== 生成 XML ===== */

async function generateFeedXml() {
  const posts = (await loadPosts()).slice(0, SITE.maxItems)
  const lastBuild = rfc822(posts[0]?.date ?? '') || new Date().toUTCString()

  const lines = []
  lines.push('<?xml version="1.0" encoding="UTF-8"?>')
  lines.push(
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">',
  )
  lines.push('  <channel>')
  lines.push(`    <title>${xmlEscape(SITE.title)}</title>`)
  lines.push(`    <link>${SITE.url}/</link>`)
  lines.push(`    <description>${xmlEscape(SITE.description)}</description>`)
  lines.push(`    <language>${SITE.language}</language>`)
  lines.push(`    <generator>听风 / gen-feed.mjs</generator>`)
  lines.push(`    <lastBuildDate>${lastBuild}</lastBuildDate>`)
  lines.push(
    `    <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml" />`,
  )

  for (const post of posts) {
    const url = postUrl(post)
    const pubDate = rfc822(post.date)
    const summary =
      post.description || plainSummary(post.content) || post.title
    const html = absolutizeUrls(md.render(post.content))

    lines.push('    <item>')
    lines.push(`      <title>${xmlEscape(post.title)}</title>`)
    lines.push(`      <link>${url}</link>`)
    lines.push(`      <guid isPermaLink="true">${url}</guid>`)
    if (pubDate) lines.push(`      <pubDate>${pubDate}</pubDate>`)
    if (post.category) {
      lines.push(`      <category>${xmlEscape(post.category)}</category>`)
    }
    for (const tag of post.tags) {
      lines.push(`      <category>${xmlEscape(tag)}</category>`)
    }
    lines.push(`      <description>${xmlEscape(summary)}</description>`)
    lines.push(`      <content:encoded>${cdata(html)}</content:encoded>`)
    lines.push('    </item>')
  }

  lines.push('  </channel>')
  lines.push('</rss>')
  lines.push('')

  return { xml: lines.join('\n'), count: posts.length }
}

async function main() {
  const { xml, count } = await generateFeedXml()
  await mkdir(path.dirname(OUT_FILE), { recursive: true })
  await writeFile(OUT_FILE, xml, 'utf8')
  console.log(
    `[feed] ${path.relative(ROOT, OUT_FILE)} · ${count} 篇 · ${(Buffer.byteLength(xml) / 1024).toFixed(1)} KB`,
  )
}

main().catch((err) => {
  console.error('[feed] 生成失败：', err)
  process.exitCode = 1
})
