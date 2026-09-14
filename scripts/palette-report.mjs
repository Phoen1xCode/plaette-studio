import fs from "node:fs/promises";
import { performance } from "node:perf_hooks";
import {
  generateTheme,
  colorCoordinates,
  perceptualDistance,
  readableText,
} from "../src/lib/palette.ts";

const samples = [
  ["腾讯蓝", "#0052D9"],
  ["珊瑚红", "#F04452"],
  ["鸢尾紫", "#7C3AED"],
  ["翡翠绿", "#008A68"],
  ["高饱和黄", "#FFFF00"],
  ["高饱和绿", "#00FF00"],
  ["高饱和蓝", "#0000FF"],
  ["洋红", "#FF00FF"],
  ["极浅粉", "#FFF1F5"],
  ["极深蓝", "#080B18"],
  ["灰", "#808080"],
  ["黑", "#000000"],
  ["白", "#FFFFFF"],
];
const rows = [];
const metrics = [];
const timings = [];
for (const [name, source] of samples) {
  const start = performance.now();
  const theme = generateTheme(source);
  timings.push(performance.now() - start);
  for (const mode of ["light", "dark"]) {
    const colors = theme[mode];
    const steps = colors
      .slice(1)
      .map((color, index) => perceptualDistance(colors[index], color));
    metrics.push({
      name,
      source,
      mode,
      colors,
      lightness: colors.map((color) => +colorCoordinates(color).l.toFixed(4)),
      minStep: +Math.min(...steps).toFixed(4),
      maxStep: +Math.max(...steps).toFixed(4),
      stepRatio: +(Math.max(...steps) / Math.min(...steps)).toFixed(4),
    });
    const y = 105 + rows.length * 80;
    rows.push(`<g>
      <rect x="20" y="${y - 5}" width="1160" height="75" rx="8" fill="${mode === "light" ? "#ffffff" : "#161c28"}"/>
      <text x="36" y="${y + 22}" fill="${mode === "light" ? "#243047" : "#eef3ff"}" font-size="12">${name} / ${mode}</text>
      <text x="36" y="${y + 44}" fill="${mode === "light" ? "#526177" : "#b8c7dc"}" font-size="11">${source}</text>
      ${colors.map((color, index) => `<rect x="${192 + index * 97}" y="${y + 3}" width="92" height="53" rx="5" fill="${color}"/><text x="${201 + index * 97}" y="${y + 35}" font-size="11" fill="${readableText(color)}">${color}</text>`).join("")}
    </g>`);
  }
}
await fs.mkdir("docs", { recursive: true });
await fs.writeFile(
  "docs/palettes.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${130 + rows.length * 80}" viewBox="0 0 1200 ${130 + rows.length * 80}"><rect width="100%" height="100%" fill="#f0f3f8"/><g font-family="system-ui,sans-serif"><text x="36" y="43" fill="#1d2635" font-size="25" font-weight="600">色谱 / Representative palette review</text><text x="36" y="71" fill="#526177" font-size="12">13 seeds · light + dark · 10 shades in light-to-dark order · sRGB</text>${rows.join("")}</g></svg>\n`,
);
await fs.writeFile(
  "docs/palette-metrics.json",
  JSON.stringify(
    {
      algorithm:
        "OKLCH fixed hue, gamut chroma boundary, equal OKLab arc-length sampling",
      runtime: process.versions.bun
        ? `Bun ${process.versions.bun}`
        : `Node.js ${process.version}`,
      generatedOn: new Date().toISOString(),
      timingsMs: {
        median: +timings
          .toSorted((a, b) => a - b)
          [Math.floor(timings.length / 2)].toFixed(2),
        max: +Math.max(...timings).toFixed(2),
      },
      palettes: metrics,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Wrote docs/palettes.svg and docs/palette-metrics.json (${metrics.length} palettes).`,
);
