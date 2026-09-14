# 色谱 · Palette Studio

一个主色，生成十级有序色阶。将 Task-1 的调色工作台迁入 `plaette-studio`，保留目标项目的 React 19、TypeScript 6、Vite 8、React Compiler、Bun、Oxlint 与 Oxfmt；补充 TDesign React、Culori、字体和测试工具。全部色彩计算在浏览器本地完成。

本项目只实现 [TDesign 犀牛鸟 2026 Task 1「当一次“调色大师”」](https://tdesign.gtimg.com/docs/summer-of-code-2026/tdesign-task.html#task-one)。任务原文要求：提供可运行的 TypeScript 十级主色阶生成函数及体验 UI，重点评估自然过渡、深浅端表现和极端主色；同时实现深色与关联中性色两个可选增强。

[桌面界面](docs/screenshots/desktop-light.png) · [深色预览](docs/screenshots/desktop-dark.png) · [手机界面](docs/screenshots/mobile-light.png) · [手机深色预览](docs/screenshots/mobile-dark.png)

## 本地启动

使用 Node.js 22.12+（`.nvmrc` 为 22）和 Bun 1.3.14+。依赖以 `bun.lock` 锁定，CI 使用 Bun 1.3.14。请在 `plaette-studio` 目录运行：

```bash
bun install --frozen-lockfile
bun run dev
```

打开终端显示的本地地址，默认是 **http://localhost:5173**。端口占用时 Vite 会显示另一个端口。

```bash
bun run check       # Oxlint + Oxfmt + 131 项算法/导出测试 + TypeScript + 生产构建
bun run preview     # 预览 dist，默认 http://localhost:4173
```

## 路径别名

`@/` 指向 `src/`，可用于应用代码和 Vitest 测试：

```tsx
import PaletteStrip from "@/components/PaletteStrip";
import { generateTheme } from "@/lib/palette";
```

映射统一定义在 `tsconfig.app.json` 的 `compilerOptions.paths`，Vite 和 Vitest 通过原生 `resolve.tsconfigPaths` 读取，编辑器、开发服务器、构建与测试使用同一配置。独立色彩模块内部和直接运行的脚本保留相对路径，便于单独复用。

## 迁移约定

- 保留目标项目已有依赖的版本范围、`vite.config.ts` 中的 React Compiler、拆分的 TypeScript 配置及 `dev/build/lint/fmt/fmt:check/preview` 命令。
- 补充 `culori`、`tdesign-react`、Manrope / DM Sans 字体，以及 `@types/culori`、Vitest、axe-core；TDesign 自带的图标依赖由 Bun 自动安装。
- 应用入口加载 `src/styles.css` 及其分模块样式，未使用的模板样式及其 CSS 变量已清理。
- 源目录保留；源码、测试、算法说明和必要静态资源迁入目标。CI 与部署配置统一使用 Bun，ESLint、Prettier、npm 锁文件、构建输出和交付压缩包不迁入。

## 怎么使用

1. 输入 HEX、RGB、HSL、OKLCH 或 CSS 命名色，也可以点击颜色选择器、选择 12 组预设。合法输入立即生效；输入未完成或不合法时保留上一次有效结果并提示原因。
2. 点击任意色块复制 HEX。悬停或键盘聚焦色块可查看明度、彩度、色相、黑白文字对比度和明度曲线。浅色、深色都按 **1 最浅、10 最深** 排列。
3. 切换展示模式，启用或收起关联中性色。在真实 TDesign 组件中编辑项目名、切换任务、观察进度、操作开关、按钮和输入框。
4. 点击「导出色阶」，复制或下载 CSS / JSON。两种格式始终包含四套色阶，不受当前视图或中性色显示开关影响。

项目卡片是用于评价颜色的本地交互样例。「保存设置」确认当前内存中的预览状态；没有后端，刷新后恢复默认值。关闭「同步主题颜色」会冻结预览的配色，重新开启后跟随当前主色。

常用开发命令：

```bash
bun run test:watch   # 监听算法测试
bun run fmt          # 使用目标项目的 Oxfmt 格式化
bun run report       # 从当前算法重建色阶图和数值报告
```

算法测试请使用 `bun run test`，执行项目配置的 Vitest；`bun test` 是 Bun 自带的测试运行器。

## 独立 TypeScript API

核心模块是 [`src/lib/palette.ts`](src/lib/palette.ts)，只依赖 `culori` 的解析与底层空间转换，**不导入 React，不访问 DOM、网络或存储**。采样路径、彩度分布、色域映射与边界策略均在本项目中实现，没有调用现成的色阶生成器。

```ts
import {
  generatePalette,
  generateTheme,
  normalizeColor,
  contrastRatio,
  ColorInputError,
} from "./src/lib/palette";

// readonly 十元素元组，每个元素都是大写的 #RRGGBB。
const shades = generatePalette("#0052D9");
const dark = generatePalette("hsl(220 100% 43%)", { mode: "dark" });
const neutral = generatePalette("#0052D9", { neutral: true });
const neutralDark = generatePalette("#0052D9", { mode: "dark", neutral: true });

// { source, light, dark, neutralLight, neutralDark }
const theme = generateTheme("rgb(0 82 217)");
const ratio = contrastRatio(shades[5], "#FFFFFF");

try {
  normalizeColor("transparent");
} catch (error) {
  if (error instanceof ColorInputError) console.log(error.message);
}
```

复用时复制 `src/lib/palette.ts` 并安装 `culori`；TypeScript 项目同时安装开发依赖 `@types/culori`。生成 CSS/TDesign 变量时再复制纯 TypeScript 的 `src/lib/theme.ts`。

| 输入与输出约定  | 行为                                                                                    |
| --------------- | --------------------------------------------------------------------------------------- |
| 不透明 CSS 颜色 | 支持 Culori 可解析的 HEX、RGB、HSL、OKLCH、命名色等；额外支持省略 `#` 的 3/6 位 HEX     |
| 透明色          | 拒绝 alpha 不等于 1 的颜色，避免猜测合成背景；全不透明的 HEX8 / RGBA 可用               |
| 广色域颜色      | 接受 `color(display-p3 …)` 等可解析格式，先映射到 sRGB；`source` 是归一化后的 sRGB 色值 |
| 上下文颜色      | 拒绝 `currentColor`、`var()`、渐变、空输入和无法解析的表达式                            |
| 原始主色        | 不保证与某一级精确相等；独立保存在 `theme.source`，UI 输入区始终可见                    |

## 算法与取舍

完整推导、参数与边界策略见 [算法说明](docs/algorithm.md)。实现可以概括为：

1. 将输入归一化到 sRGB，再转为 OKLCH。固定种子色相，灰色的微小数值彩度归零。
2. 用 `sin(πL)^0.8` 构建连续彩度包络。主色决定彩度强度，近黑、近白输入的放大倍数受限，避免细微染色被放大成荧光色。
3. 在每个明度上二分搜索 sRGB 可用的最大彩度。只缩减超出色域的彩度，不直接裁切 RGB 通道。
4. 构建 193 点的连续路径，累计 OKLab 距离，按累计路径长度均分成九段，再求十个颜色。最终转换为 8 位 HEX，并基于实际输出验证顺序和步距。

| 模式             | OKLCH 明度范围 | 彩度策略                             |
| ---------------- | -------------- | ------------------------------------ |
| 浅色品牌色       | 0.975 → 0.20   | 由输入彩度与平滑包络决定             |
| 深色品牌色       | 0.90 → 0.16    | 包络强度为浅色的 82%，减少亮端刺眼感 |
| 关联中性色       | 跟随对应模式   | 使用同一色相，峰值彩度不超过 0.022   |
| 灰色、纯黑、纯白 | 跟随对应模式   | 彩度为零，生成完整灰阶               |

**为什么不强制保留主色？** 如果把白色、黑色或高明度黄强行放在第 6 级，剩余色阶会拥挤或出现突变。本实现优先保证完整明度范围与感知过渡，原始输入作为种子独立保留。需要品牌法定精确色的项目应单独保留 `source` 为品牌资产色，不应假设第 6 级就是输入值。

OKLab 是近似感知空间，等路径长度不等于所有显示器、背景下都同样均匀；路径转折和 HEX 量化也会带来差异。固定黄色相在低明度会自然呈现橄榄/赭黄感，无法在保持黄色相的同时生成发光的深黄。浅粉的深端保持低彩度，不会被强行变成鲜艳红色。深色方案是独立生成的起点，不保证任意两个色块之间都满足无障碍要求。

## TDesign 主题与导出

[`src/lib/theme.ts`](src/lib/theme.ts) 从生成的色阶选取语义角色：品牌色、Hover、Active、背景、容器、文字与边框。选择品牌色时同时检查容器和染色背景的 **WCAG 2.x 4.5:1** 对比度，并为按钮选择黑色或白色文字。深色模式因此通常选用更浅的品牌色，而不是机械反转数组。

```ts
import {
  createPreviewTokens,
  exportTheme,
  tdesignVariables,
} from "./src/lib/theme";

const tokens = createPreviewTokens(theme, "dark");
const variables = tdesignVariables(theme, "dark");
const css = exportTheme(theme, "css");
const json = exportTheme(theme, "json");
```

CSS 包含 `:root` 浅色变量和 `[data-theme="dark"]` 深色变量：

```tsx
import "tdesign-react/es/style/index.css";
import "./theme.css"; // 导出的 CSS 放在 TDesign 样式之后

<div data-theme="dark">
  <Button theme="primary">创建项目</Button>
</div>;
```

`--brand-1…10`、`--neutral-1…10` 与 `--td-brand-color-1…10` 都由浅到深；交互组件应优先使用 `--td-brand-color` 等语义变量。导出覆盖本项目预览所需的品牌、背景和文字角色，并非 TDesign 所有组件/语义色的完整主题包。Success/Warning/Error 等独立状态色没有重新生成；移植到包含这些状态的完整产品时需要单独评估，包括 `--td-text-color-anti` 在状态按钮上的对比度。

## 验证与可视化记录

| 检查                                       | 方式                                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------ |
| 数量、有效 HEX、唯一性、明度排序           | 20 组代表色的四种模式，外加 125 点 RGB 网格的浅/深色检查                             |
| 感知平滑性、灰阶、色相、近黑近白、色域边界 | Vitest 数值断言；相邻 OKLab 距离最大/最小比小于 1.4                                  |
| 组件对比度与导出完整性                     | 在量化后的实际 HEX 上验证品牌/文字/状态色，对照 CSS 与 JSON                          |
| 真实浏览器交互与响应式                     | Ego Browser + axe-core；详见 [验收记录及复跑方法](docs/verification.md)              |
| 视觉评价                                   | [13 组输入的浅/深色对照图](docs/palettes.svg)、[数值数据](docs/palette-metrics.json) |

```bash
bun run test
bun run report          # 重建色阶对照图与数值记录
bun run fmt:check
```

图中的 26 套代表色阶最大相邻步距比为 **1.144**。这是选定样本的实际结果，不是对所有颜色观感的数学保证。浏览器截图与交互验收结果保存在 `test-results/`，不进入版本控制；重要验收结论整理在文档中。

## 部署到 Vercel

项目是纯静态 Vite 应用，无服务端、环境变量、数据库或密钥。`vercel.json` 已显式设置：

| 配置项           | 值                                                          |
| ---------------- | ----------------------------------------------------------- |
| Framework Preset | **Vite**                                                    |
| Build Command    | **`bun run build`**                                         |
| Output Directory | **`dist`**                                                  |
| Install Command  | `bun install --frozen-lockfile`（也可使用 Vercel 自动检测） |
| Node.js          | 22.x                                                        |

1. 在 GitHub 创建仓库，将本目录的源文件、文档和 `bun.lock` 推送到仓库；不要上传 `node_modules`、`dist` 或 `.vercel`。
2. 在 [Vercel 新建项目](https://vercel.com/new)中选择 **Import Git Repository**，连接 GitHub 并选中真实仓库。
3. 若本项目处在仓库子目录，设置正确的 **Root Directory**。核对上表的 Vite、构建命令、输出目录及 Node 版本。
4. 点击 **Deploy**。部署成功后，用 Vercel 实际分配的地址检查输入、复制、深色和文件下载；以后推送会触发自动部署，PR 可获得 Preview Deployment。

迁移包含适配 Bun 的 Vercel 配置和部署说明，未执行线上部署。发布时使用目标仓库的真实地址；部署后以 Vercel 返回的地址验收。

## 文件结构

```text
src/
  lib/palette.ts             独立色阶引擎、解析与对比度
  lib/theme.ts               语义主题与 CSS / JSON 导出
  lib/palette.test.ts        算法和导出测试
  components/               色阶、详情、交互预览、导出弹窗、键盘组件
  App.tsx                   工作台状态与页面
  styles/                   按页面职责划分的样式
scripts/
  palette-report.mjs         可重建的视觉/数值报告
  run-browser-check.mjs      Ego Browser 测试入口
  browser-check.mjs          真实浏览器验收脚本
docs/                       算法、验收记录、色阶对照图
.github/workflows/ci.yml     安装、静态检查、测试与构建
vercel.json                 Vite 部署配置
```

## Task 1 最终对照清单

| 任务要求                       | 交付                                                                       |
| ------------------------------ | -------------------------------------------------------------------------- |
| TypeScript 函数输入任意主色    | `generatePalette(primary, options)`；明确输入校验和透明/广色域策略         |
| 恰好十级，由浅到深             | 十元素元组；四种模式均保证相同排序约定，测试覆盖                           |
| 过渡自然，无突然断层           | 自定义 OKLCH 彩度路径 + OKLab 等弧长采样；视觉与数值评价                   |
| 深色不无意发灰、浅色不过度漂白 | 保持色相、保留受色域约束的彩度、限制极端输入放大；固定端点与参数说明       |
| 黑、白、灰及极端主色合理       | 完整无彩灰阶、近黑近白克制染色、高饱和色域映射                             |
| 可运行体验界面代码             | React/TypeScript/Vite 完整源码，TDesign 组件预览，可输入、拾色、复制、导出 |
| 可选：深色模式                 | 独立明度范围与彩度强度，深色组件语义映射                                   |
| 可选：关联中性色阶             | 同色相低彩度中性色，含浅/深两套                                            |
| 工程与交付                     | Bun 锁文件、测试、CI、算法/运行/部署文档、Vercel 配置与验证限制            |

下一步：运行 `bun run dev`，点击「明黄」并切换「深色」，查看极端主色的浅深色表现。
