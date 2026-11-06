# 发布 adapter 契约（外部、用户自持）

`dsh-ip-studio` 只做到「成稿 + 排版产物」。真正把草稿推入平台（建草稿 / 发布 / 上传图床 / 传封面）
由**用户自己安装的脚本**完成，本插件不含凭据、不含安装脚本、不发起网络请求。这样切分是为满足供应链
评审门槛（零 postinstall、凭据分离、操作可审计）。

## 数据流

1. 作者用 `ip-studio` 技能产出 `xxx_ip.md`（认知差骨架）。
2. `ip_studio_review` 跑红线与排版终检，`publishable: true` 才继续。
3. `ip_studio_format` 得到平台产物（公众号为内联样式 HTML）。
4. adapter 脚本读取 HTML，完成本地图片上传、封面上传、建草稿、回读核验。

## adapter 需要补齐的事（插件故意没做）

- **真实图片宽高**：`ip_studio_format` 生成的 `<img class="rich_pages wxw-img" data-ratio="0" data-w="0" data-type>`
  里 ratio/w 是占位 0；上传拿到 `?from=appmsg` 图链后，用图片真实尺寸回填 `data-ratio`（高÷宽）与 `data-w`。
  缺 `class` 或宽高为 0 会让公众号编辑器里图片不可见（"API 说 N 张、人看到 0 张"）。
- **表格转图**：微信不渲染 `<table>`；`ip_studio_review` 会以 `markdown-table` blocker 报出，
  adapter 前用任意 `md → PNG` 渲染器（如 Pillow + 中文字体）把表转成图再贴。
- **凭据**：见下。

## 安装配图用的可选 Python 依赖（国内加速）

抽 PDF 原图与表格转图会用到可选的 Python 库（`pymupdf`、`Pillow`）；**插件本身零依赖**，这些只由 adapter / 绘图脚本需要。
国内装 PyPI 建议走清华镜像，避免大包（pymupdf 带原生二进制、约 20 MB）长时间下载：

```sh
python -m pip install -i https://pypi.tuna.tsinghua.edu.cn/simple pymupdf pillow
# 或持久化配置镜像，之后所有 pip 安装都走它：
python -m pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

- 已配好镜像时，安装日志会显示 `Looking in indexes: https://pypi.tuna.tsinghua.edu.cn/simple`，无需再手动加 `-i`。
- 先探测再装，避免每次启动重复下载：`python -c "import pymupdf"` 成功就跳过 pip 步骤。
- 优先用系统里已带这些库的解释器（本仓库作者用的是 workbuddy 托管 python），能直接省掉安装。

## 凭据与配置（安全）

- 复制 `config/publish.example.json` 到本插件目录**之外**，填入真实 `appid`/`secret`，
  设 `DSH_IP_STUDIO_PUBLISH_CONFIG` 指向它，或作为 `--config` 传给 adapter 脚本。
- **绝不**把密钥提交进本插件目录、日志或对话；`.token_cache` 之类运行期文件放用户目录。
- IP 白名单：微信接口要求服务器出口 IP 在后台白名单内；`40164` 是 IP 不在白名单，
  `40125` 是 AppSecret 失效，需更新外部配置并删除 token 缓存后重试。
- 账号限制：个人未认证订阅号 `freepublish/submit` 必返 `48001`，只能建草稿，最终发布手动点；每日限群发 1 篇。

## 复用 write2media 的现成脚本（可选）

本插件不重复实现发布逻辑。已跑通的 `useflai-publisher/scripts/publish.py`（排版 + 图片上传 +
建草稿 + 核验 + 删/改草稿）可直接当 adapter；只需把其中的真实凭据从脚本目录移到外部配置文件，
并用 `ip_studio_format` 的 HTML 作为输入替换旧的手写排版步骤。
