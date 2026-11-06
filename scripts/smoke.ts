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

const x = format('# T\n\n' + '很长的一段中文内容。'.repeat(30), 'x')
console.log('\nX THREAD posts:', format(x.content, 'x').content.split('\n\n---\n\n').length)
