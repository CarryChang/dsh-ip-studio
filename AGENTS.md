# dsh-ip-studio 协作守则

面向在本插件里改东西的 agent。只写会被反复违反、且有具体代价的规则；风格偏好不进来。

## 插件是确定性工具 + 方法论技能，不是发布器

- 新能力优先落在 `ip_studio_review`（红线/排版终检）与 `ip_studio_format`（多平台排版）两个**纯本地、可预测**的工具上，
  或落在 `src/methodology.ts` 的写作宪法。**不要**在本插件里加联网、调用平台 API、上传图床的逻辑——那是外部 adapter 的职责。
- 发布永远停在「可发布的成稿 + 排版产物」，最终发布由用户在草稿箱手动点（个人订阅号 API 也不能直发）。

## 凭据与安全是准入条件，不是加分项

- 插件目录**绝不**出现真实密钥。凭据只在 `config/publish.example.json` 留模板，真实值放用户本机外部文件。
- 零 postinstall / install 脚本、零外部二进制下载。新增依赖前先在 CHANGELOG 说明为什么必需。

## 安装/发布前必须先生成 lib/

- profile 加载的是构建产物 `lib/index.js`；只改 `src/*.ts` 不编译会报 `failed to import ... lib/index.js`、`1 entry did not activate`。
- 提交或打包前跑 `pnpm install && pnpm run build`（等价 `tsc -p tsconfig.json`）产出 `lib/`。
- `prepack` 会在 `npm pack`/`publish` 前自动重建，勿绕过。
- 本仓库独立构建用 `tsconfig.json`（从 node_modules 解析 `@deepseek-ai/*`，需先 `pnpm install`）。
  在 harness monorepo 内临时开发时，可临时建一份 `extends: ../../tsconfig.base.json` 的源码平面 check 配置验证，不必入库。

## defineTool / cordis 契约的既坑点（改动时守住）

- 可选参数**省略** `required`，不要写 `required: false`（`ParameterPropertySpec` 只接受 `required?: true`）。
- 工具 `output` 必须同时有 `schema` 与 `render`；对象 schema 需显式 `additionalProperties`，故当前工具返回 JSON **字符串**（`schema:{type:'string'}`）。
- 注册走 `ctx.effect(() => ctx.tools/skills.register(...))`；`ctx.skills` 的类型需要 `import type {} from '@deepseek-ai/dsh-skill'` 拉入声明合并。
- 本仓库严格模式开启 `noUncheckedIndexedAccess`：数组下标与正则捕获组返回 `T | undefined`，取值处显式 `?? ''`。

## 写作红线（改 review 的规则集时同步）

`src/methodology.ts` 的宪法、`src/review.ts` 的 `BANNED` 词表、`SKILL.md` 三处必须一致：改一处即改三处。
