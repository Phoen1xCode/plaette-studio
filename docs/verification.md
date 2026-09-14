# 验证说明

本页说明如何检查算法、导出与界面交互。自动化断言对应当前源码，测试结果以本地运行输出为准。

## 算法与构建检查

安装依赖后，在项目根目录运行：

```bash
bun run check
```

该命令执行静态检查、格式检查、Vitest 测试、类型检查和生产构建，无需浏览器插件。算法与导出测试位于 [`src/lib/palette.test.ts`](../src/lib/palette.test.ts)，覆盖以下范围：

| 范围       | 检查内容                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------- |
| 颜色输入   | 等价写法、非法值、透明色、广色域归一化                                                    |
| 色阶结构   | 20 组代表色的四种模式，以及 125 点 RGB 网格的浅 / 深模式；检查数量、HEX、唯一性和明度排序 |
| 色彩表现   | 相邻步距比小于 1.4、灰阶、色相、近黑近白彩度与色域边界                                    |
| 主题与导出 | 实际 HEX 的文字 / 品牌状态对比度、四套色阶及 CSS / JSON 内容                              |

## 代表色阶报告

运行以下命令，可根据当前算法重建 [13 组输入的浅深色对照图](palettes.svg) 和[数值报告](palette-metrics.json)：

```bash
bun run report
```

报告包含高饱和黄、绿、蓝，极浅粉、极深蓝，以及黑白灰。SVG 和 JSON 均由脚本生成，请勿手工编辑；耗时字段仅反映生成报告时的本机表现。

## 浏览器交互检查

[`scripts/browser-check.mjs`](../scripts/browser-check.mjs) 通过 Ego Browser CLI 运行，需先安装并连接 Ego Browser / Ego Lite。该工具仅用于浏览器验收，运行和构建应用不需要它。

先在一个终端启动开发服务：

```bash
bun run dev --host 127.0.0.1 --port 5173 --strictPort
```

保持服务运行，在另一个终端执行：

```bash
bun run test:browser
```

测试生产构建时，将服务替换为 `bun run preview --host 127.0.0.1 --port 4173 --strictPort`，并设置测试地址：

```bash
PALETTE_TEST_URL=http://127.0.0.1:4173 bun run test:browser
```

脚本覆盖输入错误与恢复、浅深模式、中性色开关、复制与下载、组件交互、键盘与弹窗焦点，以及 320 / 390 / 768 / 1440 px 视口布局。结果、截图和下载文件写入 `test-results/`，每次运行替换同名产物。

无障碍检查使用 axe-core 的 WCAG 2 A / AA 和 WCAG 2.1 AA 规则，仅排除用于演示对比度差异的 `.aa-sample` 字样，其余标签和操作控件参与检查。脚本基于 Chromium 与模拟视口，不覆盖真实读屏软件、Safari、Firefox 或真机体验。

## 界面截图

仓库保留桌面与手机在两种模式下的展示截图，方便对照界面：

| 视口 | 浅色                                      | 深色                                     |
| ---- | ----------------------------------------- | ---------------------------------------- |
| 桌面 | [查看截图](screenshots/desktop-light.png) | [查看截图](screenshots/desktop-dark.png) |
| 手机 | [查看截图](screenshots/mobile-light.png)  | [查看截图](screenshots/mobile-dark.png)  |
