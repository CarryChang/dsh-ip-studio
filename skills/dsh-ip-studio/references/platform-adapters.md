# 发布 adapter 契约（外部、用户自持）

`dsh-ip-studio` 技能只做到「成稿 + 排版产物」。真正把草稿推入平台（建草稿 / 发布 / 上传图床 / 传封面）
由**用户自己安装的脚本**完成，本技能不含凭据、不含安装脚本、不发起网络请求。这样切分是为满足供应链
评审门槛（零 postinstall、凭据分离、操作可审计）。

## 数据流

1. 作者按 `references/methodology.md` 产出 `xxx_ip.md`（认知差骨架），可先 `ip-studio.mjs outline` 起稿。
2. `ip-studio.mjs review` 跑红线与排版终检，`publishable: true` 才继续。
3. `ip-studio.mjs format` 得到平台产物（公众号为内联样式 HTML），返回 `{ content, images, notes }`。
4. adapter 脚本读取 HTML，完成本地图片上传、封面上传、建草稿、回读核验。

## adapter 需要补齐的事（技能故意没做）

- **真实图片宽高**：`format` 生成的 `<img class="rich_pages wxw-img" data-ratio="0" data-w="0" data-type>`
  里 ratio/w 是占位 0；上传拿到 `?from=appmsg` 图链后，用图片真实尺寸回填 `data-ratio`（高÷宽）与 `data-w`。
  缺 `class` 或宽高为 0 会让公众号编辑器里图片不可见（"API 说 N 张、人看到 0 张"）。
- **表格转图**：微信不渲染 `<table>`；`review` 会以 `markdown-table` blocker 报出，
  adapter 前用任意 `md → PNG` 渲染器（如 Pillow + 中文字体）把表转成图再贴。
- **凭据**：见下。

## 主题色（brand）

`format --brand` 接受内联 JSON 或一个 JSON 文件路径，字段与仓库根的 `config/publish.example.json` 的 `brand` 对齐：

```json
{ "name": "实用AI", "accent": "#4F46E5", "accentSoft": "#EEF2FF", "text": "#1F2329", "muted": "#8A8F99" }
```

省略时用上表的默认调色；只需覆盖想改的键。

## 凭据与配置（安全）

- 把真实 `appid`/`secret` 放在本技能目录**之外**的用户文件里，用环境变量或 `--config` 传给 adapter 脚本；
  **绝不**把密钥提交进技能目录、日志或对话，运行期 token 缓存放用户目录。
- IP 白名单：微信接口要求服务器出口 IP 在后台白名单内；`40164` 是 IP 不在白名单，
  `40125` 是 AppSecret 失效，需更新外部配置并删除 token 缓存后重试。
- 账号限制：个人未认证订阅号 `freepublish/submit` 必返 `48001`，只能建草稿，最终发布手动点；每日限群发 1 篇。

## 可选 Python 依赖（国内加速）

抽 PDF 原图与表格转图会用到可选的 Python 库（`pymupdf`、`Pillow`）；**技能本身零依赖**，这些只由 adapter / 绘图脚本需要。
国内装 PyPI 建议走清华镜像，避免大包长时间下载：

```sh
python -m pip install -i https://pypi.tuna.tsinghua.edu.cn/simple pymupdf pillow
```

- 先探测再装：`python -c "import pymupdf"` 成功就跳过 pip 步骤。
