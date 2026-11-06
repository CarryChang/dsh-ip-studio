import { reviewDraft, asPlatform } from '../src/review.ts'
import { format } from '../src/formatters.ts'

const draft = `# 测题最准的模型，为什么只解决了 69.5% 的 agent 任务

**核心判断：把「测题能力」当成「任务能力」，是这一轮评测悄悄推翻的假设。**

这是我观点。下面是证据。

| 模型 | 测题 | 任务 |
|---|---|---|
| A | 92 | 69.5 |

![图1](Figure 1.png)

欢迎来杠。
`

const report = reviewDraft(draft, asPlatform('wechat'))
console.log('publishable:', report.publishable)
console.log('chineseChars:', report.chineseChars, 'images:', report.imageCount, 'titleLen:', report.titleLength)
for (const f of report.findings) console.log(` - [${f.severity}] ${f.rule} @${f.lines.join(',') || '-'}: ${f.message}`)

const wechat = format('# 标题\n\n正文**加粗**与 ![图](fig1.png)\n\n> 引用', 'wechat')
console.log('\nWECHAT:\n', wechat.content)
console.log('notes:', wechat.notes)

// Professional sample: figure grouped with its caption, ordered list, hr, inline code.
const rich = [
  '# 测题最准的模型，为何只解决了 69.5% 的 agent 任务',
  '',
  '**核心判断：把测题能力当成任务能力，是被默默推翻的假设。**',
  '',
  '![架构图](fig1.png)',
  '',
  '*图 1：该看两条曲线的分叉点——测题与任务能力的落差。*',
  '',
  '## 可以带走的框架',
  '',
  '1. 拆解能力',
  '2. 验证能力',
  '',
  '用 `attention选择三层范式` 建模。',
  '',
  '---',
  '',
  '追问：样本量仅 360 条。',
].join('\n')
console.log('\nRICH WECHAT (figure+caption group / ol / hr / code):\n', format(rich, 'wechat').content)
const richReview = reviewDraft(rich, 'wechat')
console.log('RICH rules:', richReview.findings.map(f => f.rule).join(', ') || '(none)', '| publishable:', richReview.publishable)

// Cross-platform figure preservation + images list.
const xhs = format(rich, 'xiaohongshu')
const xth = format(rich, 'x')
console.log('XHS has 配图 list:', xhs.content.includes('【配图'), '| images:', JSON.stringify(xhs.images))
console.log('X has media post:', xth.content.includes('📎 配图 fig1.png'), '| images:', JSON.stringify(xth.images))

// Theme injection + auto placeholder caption + ASCII rename fix.
const broken = '# 测试：带判断的标题\n\n![没有图注的图](Figure 1.png)\n\n## 小节\n\n一段正文，讲一个框架模型。'
const wb = format(broken, 'wechat', { accent: '#FF0000', name: '某品牌' })
console.log('THEME accent #FF0000 applied:', wb.content.includes('#FF0000'))
console.log('PLACEHOLDER caption injected:', wb.content.includes('图注待补'))
console.log('RENAME fix:', wb.notes.some(n => n.includes('重命名为')), '| CAPTION fix:', wb.notes.some(n => n.includes('缺图注')))

const x = format('# T\n\n' + '很长的一段中文内容。'.repeat(30), 'x')
console.log('\nX THREAD posts:', format(x.content, 'x').content.split('\n\n---\n\n').length)

// Text-only long-form draft must be blocked for WeChat by no-figures.
const textOnly = '# 一个只有文字的稿子\n\n' + '正文没有任何图片，纯文字论述。'.repeat(120)
const r2 = reviewDraft(textOnly, 'wechat')
console.log('\nTEXT-ONLY publishable(wechat):', r2.publishable, '| rules:', r2.findings.map(f => f.rule).join(', '))

// All three figures at the top with a long text tail -> figures-clustered warn; WeChat body wrapped in <section>.
const clustered = '# 标题\n\n![a](f1.png)\n\n![b](f2.png)\n\n![c](f3.png)\n\n' + Array.from({ length: 40 }, () => '后段正文一段。').join('\n\n')
console.log('CLUSTERED rules:', reviewDraft(clustered, 'wechat').findings.map(f => f.rule).join(', '))
console.log('WECHAT wrapped in <section>:', format(clustered, 'wechat').content.startsWith('<section'))
