/* Run through ego-browser nodejs. See docs/verification.md for the command. */
/* global taskSpace, settings */
const fs = await import("node:fs/promises");
const path = await import("node:path");
const { default: assert } = await import("node:assert/strict");
const root = settings.root;
const url = settings.url;
const reuse = Boolean(settings.spaceId);
const task = await taskSpace(
  reuse ? Number(settings.spaceId) : "Palette Studio browser verification",
);
const page = task.page(settings.page ?? "p1");
const out = path.join(root, "test-results");
await fs.mkdir(out, { recursive: true });
const checks = [];
const record = (name) => {
  checks.push(name);
  console.log(`PASS ${name}`);
};
const settle = () =>
  page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      document
        .getAnimations()
        .map((animation) => animation.finished.catch(() => {})),
    );
  });
const shades = () =>
  page.evaluate(() =>
    [
      ...document.querySelectorAll(".palette-strip:not(.compact) .swatch-hex"),
    ].map((el) => el.textContent),
  );
const mode = () =>
  page.evaluate(() => document.querySelector(".palette-area").dataset.mode);
const selectMode = async (value) => {
  if ((await mode()) !== value)
    await page.click(
      `.mode-control label:nth-child(${value === "light" ? 1 : 2})`,
    );
  await settle();
};
const audit = async (label) => {
  await settle();
  const failures = await page.evaluate(async () => {
    // Aa specimens intentionally demonstrate both passing and failing contrast.
    // Their explanatory labels and numeric results remain included in the audit.
    const result = await window.axe.run(
      { exclude: [[".aa-sample"]] },
      {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      },
    );
    return result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        failure: n.failureSummary,
      })),
    }));
  });
  assert.deepEqual(failures, [], label);
  record(`axe WCAG A/AA: ${label}`);
};

await page.cdp("Page.addScriptToEvaluateOnNewDocument", {
  source: `
  window.__paletteErrors = [];
  addEventListener('error', event => window.__paletteErrors.push(event.message));
  addEventListener('unhandledrejection', event => window.__paletteErrors.push(String(event.reason)));
  const originalError = console.error;
  console.error = (...args) => { window.__paletteErrors.push(args.map(String).join(' ')); originalError(...args); };
`,
});
await page.goto(url);
await page.waitForSelector("#primary-color");
await page.cdp("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 1000,
  deviceScaleFactor: 1,
  mobile: false,
});
console.log(await page.snapshot());
await page.evaluate(
  await fs.readFile(
    path.join(root, "node_modules/axe-core/axe.min.js"),
    "utf8",
  ),
);
const initial = await shades();
assert.equal(initial.length, 10);
assert.equal(new Set(initial).size, 10);
record("initial render has ten unique shades");

await page.fill("#primary-color", "not-a-color");
await page.waitForSelector("#color-error");
assert.deepEqual(await shades(), initial);
assert.equal(
  await page.evaluate(() =>
    document.querySelector("#primary-color").getAttribute("aria-invalid"),
  ),
  "true",
);
await page.fill("#primary-color", "rgba(0,0,0,.5)");
assert.match(
  await page.evaluate(() => document.querySelector("#color-error").textContent),
  /透明/,
);
await page.fill("#primary-color", "hsl(0 100% 50%)");
await page.waitForFunction(() => !document.querySelector("#color-error"));
assert.notDeepEqual(await shades(), initial);
record(
  "invalid/transparent inputs retain last valid palette; CSS HSL recovers live",
);

await page.evaluate(() => {
  const input = document.querySelector('input[type="color"]');
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(
    input,
    "#ff6600",
  );
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
});
await page.waitForFunction(
  () => document.querySelector("#primary-color").value === "#FF6600",
);
record(
  "native color input change handler updates palette (OS picker chrome is not automated)",
);

for (const name of [
  "腾讯蓝 #0052D9",
  "明黄 #FFFF00",
  "霓虹绿 #00FF00",
  "极浅粉 #FFF1F5",
  "极深蓝 #080B18",
  "纯黑 #000000",
  "纯白 #FFFFFF",
]) {
  await page.click(`button[aria-label="使用${name}"]`);
  for (const value of ["light", "dark"]) {
    await selectMode(value);
    assert.equal(new Set(await shades()).size, 10);
    await audit(`${name} / ${value}`);
  }
}
await page.click('button[aria-label="使用腾讯蓝 #0052D9"]');
await selectMode("light");
await page.focus(".mode-control label:first-child");
await page.keyboard.press("ArrowRight");
assert.equal(await mode(), "dark");
await page.keyboard.press("ArrowLeft");
assert.equal(await mode(), "light");
record("radio arrow keys switch modes and move focus");

await page.click('button[aria-labelledby="neutral-label"]');
assert.equal(
  await page.evaluate(
    () => document.querySelectorAll(".compact .swatch").length,
  ),
  0,
);
await page.click('button[aria-labelledby="neutral-label"]');
assert.equal(
  await page.evaluate(
    () => document.querySelectorAll(".compact .swatch").length,
  ),
  10,
);
record("neutral palette visibility toggles");

await page.evaluate(() => {
  const write = navigator.clipboard.writeText.bind(navigator.clipboard);
  window.__paletteClipboard = [];
  window.__paletteRealWrite = write;
  navigator.clipboard.writeText = async (text) => {
    await write(text);
    window.__paletteClipboard.push(text);
  };
});
await page.click(".palette-strip:not(.compact) .swatch:nth-child(4)");
await page.waitForFunction(() => window.__paletteClipboard.length === 1);
assert.equal(
  await page.evaluate(() => window.__paletteClipboard[0]),
  (await shades())[3],
);
record("swatch copy resolves the real Clipboard API with the exact HEX");

await page.fill('input[placeholder="给项目起个名字"]', "可访问的品牌项目");
assert.equal(
  await page.evaluate(
    () => document.querySelector(".project-heading h3").textContent,
  ),
  "可访问的品牌项目",
);
await page.click('text="导出主题，交付开发"');
assert.match(
  await page.evaluate(
    () => document.querySelector(".progress-label").textContent,
  ),
  /3 \/ 3/,
);
await page.click('text="待完成"');
assert.equal(
  await page.evaluate(() => document.querySelectorAll(".task-row").length),
  0,
);
await page.click('text="重置"');
assert.match(
  await page.evaluate(
    () => document.querySelector(".progress-label").textContent,
  ),
  /2 \/ 3/,
);
await page.click('button[aria-labelledby="sync-label"]');
const pausedAccent = await page.evaluate(
  () => document.querySelector(".preview-notice code").textContent,
);
await page.click('button[aria-label="使用明黄 #FFFF00"]');
assert.equal(
  await page.evaluate(
    () => document.querySelector(".preview-notice code").textContent,
  ),
  pausedAccent,
);
await page.click('button[aria-labelledby="sync-label"]');
assert.notEqual(
  await page.evaluate(
    () => document.querySelector(".preview-notice code").textContent,
  ),
  pausedAccent,
);
await page.click('text="保存设置"');
await page.waitForFunction(() =>
  document.querySelector('[role="status"]').textContent.includes("已保存"),
);
record(
  "project name, checkbox progress, filters, reset, save and theme-sync controls work",
);

await page.click('text="导出色阶"');
await page.waitForFunction(
  () => document.activeElement.className === "dialog-close",
);
await audit("export dialog");
assert.equal(
  await page.evaluate(() => document.getElementById("root").inert),
  true,
);
await page.keyboard.press("Shift+Tab");
assert.equal(
  await page.evaluate(() => document.activeElement.textContent),
  "复制代码",
);
await page.keyboard.press("Tab");
assert.equal(
  await page.evaluate(() => document.activeElement.className),
  "dialog-close",
);
await page.click('text="JSON 数据"');
const exported = await page.evaluate(
  () => document.querySelector("#export-code").value,
);
const json = JSON.parse(exported);
assert.equal(json.source, "#FFFF00");
for (const key of ["light", "dark", "neutralLight", "neutralDark"])
  assert.equal(json[key].length, 10);
await page.click('text="复制代码"');
await page.waitForFunction(() => window.__paletteClipboard.length === 2);
assert.equal(await page.evaluate(() => window.__paletteClipboard[1]), exported);
const jsonDownload = page.waitForEvent("download");
await page.click('text="下载文件"');
const jsonFile = await jsonDownload;
await jsonFile.saveAs(path.join(out, "palette-ffff00.json"));
assert.deepEqual(
  JSON.parse(await fs.readFile(path.join(out, "palette-ffff00.json"), "utf8")),
  json,
);
await page.click('text="CSS 变量"');
const cssDownload = page.waitForEvent("download");
await page.click('text="下载文件"');
await (await cssDownload).saveAs(path.join(out, "palette-ffff00.css"));
const css = await fs.readFile(path.join(out, "palette-ffff00.css"), "utf8");
assert.match(css, /\[data-theme="dark"\]/);
assert.match(css, /--td-bg-color-specialcomponent:/);
await page.keyboard.press("Escape");
await page.waitForFunction(
  () =>
    !document.getElementById("root").inert &&
    document.activeElement.classList.contains("export-trigger"),
);
record(
  "dialog focus trap, Escape return, JSON/CSS downloads and exported-code clipboard",
);

await page.evaluate(() => {
  navigator.clipboard.writeText = async () => {
    throw new DOMException("Blocked for test", "NotAllowedError");
  };
});
await page.click(".palette-strip:not(.compact) .swatch:first-child");
await page.waitForSelector('[role="dialog"]');
assert.match(
  await page.evaluate(
    () => document.querySelector('[role="status"]').textContent,
  ),
  /剪贴板不可用/,
);
await page.click('button[aria-label="关闭导出窗口"]');
await page.waitForFunction(() => !document.getElementById("root").inert);
await page.evaluate(() => {
  navigator.clipboard.writeText = window.__paletteRealWrite;
});
record("blocked clipboard offers selectable code and downloadable files");
await page.waitForFunction(() => !document.querySelector(".toast.visible"));

await page.click('button[aria-label="使用腾讯蓝 #0052D9"]');
for (const width of [1440, 768, 390, 320]) {
  await page.cdp("Emulation.setDeviceMetricsOverride", {
    width,
    height: 960,
    deviceScaleFactor: 1,
    mobile: width < 640,
  });
  for (const value of ["light", "dark"]) {
    await selectMode(value);
    const layout = await page.evaluate(() => ({
      width: innerWidth,
      client: document.documentElement.clientWidth,
      body: document.documentElement.scrollWidth,
      modeRows: [...document.querySelectorAll(".mode-control label")].map(
        (el) => Math.round(el.getBoundingClientRect().top),
      ),
    }));
    // scrollWidth > clientWidth means a real horizontal scrollbar; innerWidth varies
    // with the OS scrollbar style (overlay vs classic), so never compare against it.
    assert.ok(
      layout.body <= layout.client,
      `No horizontal overflow at ${width}/${value}: scrollWidth ${layout.body} > clientWidth ${layout.client}`,
    );
    assert.equal(
      new Set(layout.modeRows).size,
      1,
      "Mode choices remain on the same row",
    );
    if (width === 390 || width === 1440) {
      await audit(`${width}px / ${value}`);
      await page.evaluate(() => window.scrollTo(0, 0));
      await settle();
      await page.screenshot({
        path: path.join(out, `${width}-${value}.png`),
        fullPage: true,
      });
    }
  }
}
record("320/390/768/1440px layouts have no horizontal overflow in either mode");
assert.deepEqual(await page.evaluate(() => window.__paletteErrors), []);
record("no browser errors or unhandled rejections");
await page.cdp("Emulation.clearDeviceMetricsOverride");
await selectMode("light");
await page.evaluate(() => window.scrollTo(0, 0));
await fs.writeFile(
  path.join(out, "browser-results.json"),
  JSON.stringify(
    {
      url,
      verifiedOn: new Date().toISOString(),
      browser: await page.evaluate(() => navigator.userAgent),
      excluded: ".aa-sample: intentionally demonstrates failed contrast",
      checks,
    },
    null,
    2,
  ),
);
if (!reuse) await task.finish({ keep: [] });
console.log(`${checks.length} browser checks passed. Artifacts: ${out}`);
