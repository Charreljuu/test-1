# AGENTS.md

Vite + React 19 城市名猜谜应用（纯 JS/JSX，无 TypeScript）。数据存于 Cloudflare D1，由 Cloudflare Worker（`worker/` 目录）提供 `GET /api/cities?q=<城市名>` 查询 API，前端 `src/api/cities.js` fetch 调用并将结果标记在 SVG 世界地图上。前端部署到 GitHub Pages。

## 命令

- `pnpm dev` — 开发服务器。包管理器是 pnpm（见 pnpm-lock.yaml）。
- `pnpm build` — 构建到 `dist/`。
- `pnpm deploy` — `gh-pages -d dist` 推送到 GitHub Pages（远程仓库：`Charreljuu/test-1`，线上地址 `charreljuu.github.io/test-1/`）。
- `pnpm db:sql` — 从 `public/cities.json` 生成 `d1/import.sql`（见下方数据管道）。
- `pnpm db:init` — 首次在 D1 上建表（`worker/migrations/0001_init.sql`）。
- `pnpm db:deploy` — 把 `d1/import.sql` 的数据导入 D1。
- `pnpm worker:dev` / `pnpm worker:deploy` — 本地开发 / 发布 Worker API。
- 没有测试套件。`pnpm lint` 是占位脚本（eslint 未安装，也没有 eslint 配置）——不要依赖它。

## 数据管道（最容易出错的关键部分）

1. `private/cities.json` 是数据源（包含中文字段 `name_cn` / `country_cn` / `admin_cn`）。已被 git 忽略。
2. `pnpm db:sql`：`scripts/json2sql.cjs` 读取 `private/cities.json`，生成 `d1/import.sql`（INSERT 语句，`d1/` 被 git 忽略，不提交）。
3. 首次部署：`pnpm db:init` 建表，然后 `pnpm db:deploy` 导入数据，最后 `pnpm worker:deploy`。
4. 数据变更后：重复步骤 1 并执行 `pnpm db:deploy`（数据直接覆盖式导入，若需清空可先 `wrangler d1 execute cities-db --remote --command "DELETE FROM cities"`）。

## 注意事项

- `scripts/`、`private/`、`d1/` 整个被 git 忽略——对它们的修改无法提交。`scripts/json_translate.py` 中硬编码了 DeepSeek API 密钥（目前只因被忽略才安全；切勿把它移动到被跟踪的路径）。
- `worker/wrangler.toml` 中的 `database_id` 需由 `wrangler d1 create cities-db`（或 `--config worker/wrangler.toml`）生成后手动填入；`wrangler login` 需要用户 Cloudflare 账号授权，无法代办。
- 前端 API 地址：`src/api/cities.js` 读取 `import.meta.env.VITE_API_URL`，未设置时 fallback 为写死的生产 Worker URL（`https://cities-api.2835773971.workers.dev`）。本地联调时 `VITE_API_URL=http://localhost:8787` 跑 `pnpm dev`。
- vite.config.js 设置了 `base: "/test-1/"`——必须与 GitHub Pages 仓库名保持一致；不要随意修改。
- `@` 别名指向 `src/`（在 vite.config.js 和 jsconfig.json 中都有定义）——始终使用 `@/` 导入。
- 数据库表结构（见 `worker/migrations/0001_init.sql`）：`cities(id, city, city_ascii, lat, lon, admin_name, population, name_cn, country_cn, admin_cn)`，索引在 `city`、`country_cn`、`population` 上。Worker 在 `worker/src/index.js` 中通过 `city` / `city_ascii` / `name_cn` 配合 `COLLATE NOCASE` 查询，LIMIT 50。
- `package.json` 中 `pnpm.onlyBuiltDependencies` 允许了 esbuild / workerd 的构建脚本（wrangler 运行所需）；新增原生依赖时按需补充。
