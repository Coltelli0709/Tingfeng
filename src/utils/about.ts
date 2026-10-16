/**
 * about.ts — 「关于我 / About me」数据层
 *
 * 数据源：code/about.md
 * 直接改 .md 里的字段即可，无需动组件。
 */

export interface About {
  name: string
  bio?: string
  github?: string      // 用户名（@ 会被去掉）
  githubUrl?: string   // 完整链接
  email?: string
}

// 项目根目录下的 md（Vite root = code/），取其中的 about.md
const rootMdModules = import.meta.glob('/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

export const about: About = parseAbout(rootMdModules['/about.md'] ?? '')

function parseAbout(raw: string): About {
  const data: About = { name: '' }
  if (!raw) return data

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

    // 字段行：key: value（中英文冒号均可）
    const kv = line.match(/^\s*([A-Za-z_]+)\s*[:：]\s*(.*?)\s*$/)
    if (!kv) continue

    const key = kv[1].toLowerCase()
    const val = kv[2].replace(/^['"]|['"]$/g, '').trim()
    if (!val) continue

    if (key === 'name') data.name = val
    else if (key === 'bio' || key === 'intro' || key === 'description') data.bio = val
    else if (key === 'github' || key === 'gh') {
      const user = val.replace(/^@/, '')
      data.github = user
      data.githubUrl = /^https?:/i.test(val) ? val : `https://github.com/${user}`
    } else if (key === 'email' || key === 'mail') {
      data.email = val
    }
  }

  return data
}
