/**
 * friends.ts — 友链数据层
 *
 * 数据源：code/friends.md
 * 在 friends.md 中以「## 名字」开启一条友链，其后跟 url / avatar / desc 字段。
 * 新增友链只需往该 .md 文件末尾追一段，无需改代码。
 */

export interface Friend {
  name: string
  url: string
  avatar?: string
  desc?: string
}

// 项目根目录下的 md（Vite root = code/），取其中的 friends.md
const rootMdModules = import.meta.glob('/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

export const friends: Friend[] = parseFriends(rootMdModules['/friends.md'] ?? '')

function parseFriends(raw: string): Friend[] {
  if (!raw) return []

  const list: Friend[] = []
  let cur: Friend | null = null
  let inComment = false

  const lines = raw.replace(/^﻿/, '').replace(/\r\n/g, '\n').split('\n')

  for (const line of lines) {
    // 跳过 HTML 注释块（文件顶部的使用说明就是注释）
    if (inComment) {
      if (line.includes('-->')) inComment = false
      continue
    }
    if (line.includes('<!--')) {
      if (!line.includes('-->')) inComment = true
      continue
    }

    // 一条友链的开始：## 名字
    const head = line.match(/^##\s+(.+?)\s*$/)
    if (head) {
      cur = { name: head[1].trim(), url: '' }
      list.push(cur)
      continue
    }
    if (!cur) continue

    // 字段行：key: value（中英文冒号均可）
    const kv = line.match(/^\s*([A-Za-z_]+)\s*[:：]\s*(.*?)\s*$/)
    if (!kv) continue

    const key = kv[1].toLowerCase()
    const val = kv[2].replace(/^['"]|['"]$/g, '').trim()

    if (key === 'url' || key === 'link' || key === 'href') cur.url = normalizeUrl(val)
    else if (key === 'avatar' || key === 'img' || key === 'image' || key === 'icon') cur.avatar = normalizeAvatar(val)
    else if (key === 'desc' || key === 'description' || key === 'intro') cur.desc = val
  }

  return list.filter((f) => f.name && f.url)
}

/** 补全协议：没写 http(s):// 时自动加 https://，否则浏览器会当成站内相对路径 */
function normalizeUrl(raw: string): string {
  const u = raw.trim()
  if (!u) return ''
  if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return u // 已有协议（http: / https: / mailto: …）
  if (u.startsWith('//')) return `https:${u}` // 协议相对
  return `https://${u}`
}

/** 头像：站内相对路径（/images/…）与 data: 保持原样，其余按 URL 补协议 */
function normalizeAvatar(raw: string): string {
  const u = raw.trim()
  if (!u) return ''
  if (u.startsWith('/') || u.startsWith('./') || u.startsWith('../') || u.startsWith('data:')) return u
  return normalizeUrl(u)
}
