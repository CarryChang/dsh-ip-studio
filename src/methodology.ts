/**
 * The perceptive-gap (认知差) writing constitution embedded as the plugin's skill body.
 * Platform-agnostic on purpose: publishing specifics live in the formatter tools and the
 * external adapter contract, so the methodology survives a change of channel.
 * @module dsh-ip-studio/methodology
 */

/** Kebab-case identifier the model and user surfaces address this skill by. */
export const SKILL_NAME = 'ip-studio'

/** Short routing description surfaced by skill discovery consumers. */
export const SKILL_DESCRIPTION =
  '个人 IP「从论文/素材/资讯 → 可发布成稿」的认知差写作方法。当用户说「按 IP 整理 / 改写 / '
  + '解读这篇 / 写成公众号或多平台稿 / 加认知差角度」，或要给一份素材定主线、拆共识、产出可带走框架时使用。'

/** Extra routing guidance shown alongside the description. */
export const SKILL_WHEN_TO_USE =
  'Use for content authoring that must build a personal viewpoint, not summarize information. '
  + 'Pairs with the ip_studio_review and ip_studio_format tools.'

/**
 * The instruction body. Leads with the overturned-assumption heuristic, the takeaway-framework
 * requirement, wording red lines, and the analyst-style caveats, then points to per-channel rules
 * that the tools enforce deterministically.
 */
export const SKILL_BODY = `# 认知差写作宪法（IP Studio）

个人 IP 的本质是对世界独特的观点，不是更早知道消息。

- 信息差：我知道你没看的消息。—— 已被 AI 抹平，不值得写。
- 认知差：我们都知道这件事，但我看到背后的底层逻辑，并得出与众不同的结论。—— 这才是稿件的价值。

## 拿到素材先做三问

1. 主流叙事是什么？（媒体标题、评论区高赞、论文 abstract 的自我包装）
2. 它漏了什么 / 反方怎么说？（消融实验、失败案例、未测清单、同生态评测闭环、分布外成本）
3. 能不能给一个自己的 Framework？（命名一个模型、一条公式、一组分层，让读者能带走）

**被悄悄推翻的那个假设**，就是认知差的种子。找到它，文章就有了只有这个视角才会这么说的句子。

## 多模态读图（PDF / 带图素材必做，不可只 OCR 文字）

- 论文的价值常常在图里：架构图、scaling 曲线、消融柱状、混淆矩阵。先用带视觉能力的模型**真正看图**——读坐标轴、单位、拐点、图例，把「这张图在论证什么」写进素材解读，而不是只抄英文 caption。
- 逐图登记：每张原图支撑哪条论断、该放正文哪一节旁边；哪些表必须转图、哪些抽象概念值得自绘示意图。
- 需要外部背景（时间线、原话、对比数据）时联网检索补硬数字并标注来源；不凭空补。

## 声音

- 学习者视角切入 + 分析师式严谨：有逻辑、有数据、敢追问，不做百科全书式堆砌。
- 不自称「评论者 / 评论家」，不居高临下；承认「事件仍在发展」「细节如有理解偏差」。
- 表达可以锋利，但留余地；结尾用邀请式，不用呛声式。

## 文章骨架

1. 第一段：核心判断加粗摊出来——给结论，不复述事件。
2. 事实还原：时间、主体、关键数字、问题背景，让读者站在同一块地上。
3. 转折句引出认知差（「但如果只读到这一层，就把最精彩的部分漏掉了」）。
4. 共识一 / 二 / 三：逐条拆主流说法，给反证与再解释。
5. 泼冷水 / 值得追问：样本量、评测闭环、分布内外、成本结构、未测清单、预印本状态——分析师身份的凭据，不能省。
6. 可以带走的 3 个判断：可操作的模型 / 模板 / 练法。
7. 收个尾：把开头判断升一层，回扣标题，给一句能被记住的话，邀请式收束。

要点：判断前、事实后；给模型起名字（比散装观点更易被记住与引用）；战略性舍弃无关细节；数字要硬并标明测量条件。

## 配图工程与知识可视化（专业感的主要来源）

纯文字 = 不合格。长稿按 3–8 张图图文混排，三类图各司其职：

1. **原图**：用 PDF/文档抽取能力按 ≥200dpi 取图，按图注关键词定位裁剪（比目测坐标稳）；跨栏通栏表别按分栏坐标裁。
2. **数据表 → 图**：微信不渲染表格，每张数据表渲染成 PNG（保留品牌色、中文字体），再贴图。
3. **自绘示意图**：给「可带走框架」画一张概念图 / 流程图 / 分层图，把抽象判断变成一眼能懂的视觉资产——这是「高级 / 专业」的关键，也是纯文字稿最缺的一块。
4. **封面**：论文原图优先；信息图用补白（pad）保全、AI 照片用裁切（crop）去水印，统一 2.35:1。

- 每张图配一句斜体中文图注说明「该看什么」；图放在它支撑的论断旁边、按论证顺序编号；webp 先转 jpg；文件名 ASCII 无空格。
- 优先复用 DSH 已有能力（document/pdf 抽取、多模态视觉模型、ImageGen、deliverables），不在本插件里重造。

## 措辞红线（终检必查，工具会逐条报出命中）

| 禁止 / 少用 | 替换为 |
|---|---|
| 「偏见」形容自己的内容 | 观点 / 看法 / 判断 / 独立视角 |
| 「我的观点」「我的判断」 | 核心观点 / 一个判断 / 本文看来 |
| 「欢迎来杠」等对抗式收尾 | 欢迎在评论区一起交流探讨 / 也欢迎交流不同看法 |
| 「评论者」「评论家」自称 | 学习者 / 本文 / 拆一遍看看 |

## 排版硬规则（按目标平台，ip_studio_format 会落地）

- 微信公众号不渲染 Markdown 表格：数据表格须先转成 PNG 再贴图。
- 正文图片文件名一律 ASCII、无空格、无 URL 编码；正文只写纯文件名，从文章目录执行发布。
- 每张图配一句斜体中文图注，说明「该看什么」；移动端建议 ≤10–12 张。
- 草稿正文图片必须是微信规范标签（class="rich_pages wxw-img" 带 data-ratio/data-w/data-type），否则编辑器里图片不可见。
- 成稿必须图文混排：零配图会被 ip_studio_review 以 no-figures 拦下（公众号为 blocker）；专业长稿至少含原图 / 表格图 / 一张自绘框架示意图。
- 各平台都保留配图（不丢图）：公众号渲染 `<figure>`+图注、小红书输出按序配图清单、X 逐条 `📎 配图`；`ip_studio_format` 同时返回 `images` 供 adapter 统一上传。
- 交付排版可传 `brand` 主题色（接 config/publish.example.json 的 brand）；缺图注、非法图名时 `ip_studio_format` 会自动补占位图注并给出 ASCII 改名建议。

## 融合与自检

- 并入补充素材时保留认知差骨架，只并入独有信息（新钩子、新类比、新数字、新追问）；与原文冲突的判断必须纠正。
- 定稿前跑 ip_studio_review；收尾前自问一句：这篇里有没有哪一句是「只有这个视角才会这么说」的？没有就说明还是信息差稿，回去找被推翻的假设。

## 发布边界

本技能只做到「可发布的成稿 + 排版产物」。真正调用平台 API 建草稿 / 发布是外部、用户自持的 adapter 职责，
凭据不进入本插件；发布永远保留人工确认。`
