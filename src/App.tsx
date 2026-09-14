import { useMemo, useRef, useState } from "react";
import { Button, Switch } from "tdesign-react";
import {
  ColorInputError,
  generateTheme,
  normalizeColor,
  type ColorMode,
} from "@/lib/palette";
import PaletteStrip from "@/components/PaletteStrip";
import ColorDetails from "@/components/ColorDetails";
import ComponentPreview from "@/components/ComponentPreview";
import ExportDialog from "@/components/ExportDialog";
import Icon from "@/components/Icon";
import SegmentedControl from "@/components/SegmentedControl";

const presets = [
  { name: "腾讯蓝", color: "#0052D9" },
  { name: "鸢尾紫", color: "#7C3AED" },
  { name: "珊瑚红", color: "#F04452" },
  { name: "翡翠绿", color: "#008A68" },
  { name: "明黄", color: "#FFFF00" },
  { name: "霓虹绿", color: "#00FF00" },
  { name: "极浅粉", color: "#FFF1F5" },
  { name: "极深蓝", color: "#080B18" },
  { name: "中性灰", color: "#808080" },
  { name: "纯黑", color: "#000000" },
  { name: "纯白", color: "#FFFFFF" },
  { name: "电光蓝", color: "#0000FF" },
];

export default function App() {
  const [primary, setPrimary] = useState("#0052D9");
  const [input, setInput] = useState(primary);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<ColorMode>("light");
  const [neutral, setNeutral] = useState(true);
  const [selected, setSelected] = useState(5);
  const [family, setFamily] = useState<"brand" | "neutral">("brand");
  const [exportOpen, setExportOpen] = useState(false);
  const [copied, setCopied] = useState("");
  const [notice, setNotice] = useState("");
  const noticeVersion = useRef(0);
  const theme = useMemo(() => generateTheme(primary), [primary]);
  const colors = mode === "light" ? theme.light : theme.dark;
  const neutrals = mode === "light" ? theme.neutralLight : theme.neutralDark;

  const notify = (message: string) => {
    setNotice(message);
    const version = ++noticeVersion.current;
    window.setTimeout(() => {
      if (version === noticeVersion.current) {
        setNotice("");
        setCopied("");
      }
    }, 3000);
  };
  const updateColor = (value: string, normalize = false) => {
    setInput(value);
    try {
      const color = normalizeColor(value);
      setPrimary(color);
      setError("");
      if (normalize) setInput(color);
    } catch (reason) {
      setError(
        reason instanceof ColorInputError
          ? reason.message
          : "暂时无法解析此颜色，请换一个色值。",
      );
    }
  };
  const copy = async (text: string, label = text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      notify(`已复制 ${label}`);
    } catch {
      notify("剪贴板不可用，请在导出窗口选中代码复制，或下载文件。");
      setExportOpen(true);
    }
  };

  return (
    <>
      <a className="skip-link" href="#studio">
        跳到调色工作台
      </a>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="色谱首页">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <strong>色谱</strong>
          <span className="brand-divider" />
          <span>PALETTE STUDIO</span>
        </a>
        <nav aria-label="主导航">
          <a className="active" href="#studio">
            调色工作台
          </a>
          <a href="#method">算法手记</a>
          <a
            className="source-link"
            href="https://tdesign.gtimg.com/docs/summer-of-code-2026/tdesign-task.html#task-one"
            target="_blank"
            rel="noreferrer"
          >
            Task 01 <Icon name="arrow" size={15} />
          </a>
        </nav>
      </header>
      <main id="top">
        <section className="hero">
          <div>
            <div className="hero-kicker">
              <span />
              TDESIGN × SUMMER OF CODE 2026
            </div>
            <h1>
              一个主色，<span>自成一谱。</span>
            </h1>
            <p>
              从一瞬灵感，到完整色彩系统。
              <br className="mobile-break" />
              探索每一阶恰到好处的深浅。
            </p>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-label">
              A LITTLE COLOR. A LOT OF POSSIBILITY.
            </div>
            <div className="art-bars">
              {theme.light.map((color, index) => (
                <i
                  key={index}
                  style={{
                    background: color,
                    height: `${52 + Math.sin((index / 9) * Math.PI) * 66}px`,
                  }}
                />
              ))}
            </div>
            <div className="art-footer">
              <span>01 - 10</span>
              <span>BUILT ON PERCEPTION ↗</span>
            </div>
          </div>
        </section>
        <section className="studio" id="studio" aria-label="调色工作台">
          <aside className="controls">
            <div className="panel-label">
              <Icon name="sliders" size={16} />
              调色工作台<span>01</span>
            </div>
            <label className="field-label" htmlFor="primary-color">
              从你的主色开始
            </label>
            <div className={`color-input-group ${error ? "invalid" : ""}`}>
              <div
                className="color-picker-wrap"
                style={{ backgroundColor: primary }}
              >
                <input
                  type="color"
                  aria-label="拾取主色"
                  value={primary}
                  onChange={(event) => updateColor(event.target.value, true)}
                />
                <Icon name="plus" size={18} />
              </div>
              <input
                id="primary-color"
                type="text"
                value={input}
                onChange={(event) => updateColor(event.target.value)}
                onBlur={() => {
                  if (!error) setInput(primary);
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "color-error" : "color-hint"}
                autoComplete="off"
                spellCheck={false}
                maxLength={160}
              />
            </div>
            {error ? (
              <p id="color-error" className="input-error" role="alert">
                {error}
              </p>
            ) : (
              <p id="color-hint" className="input-hint">
                支持 HEX / RGB / HSL / OKLCH
              </p>
            )}
            <div className="preset-heading">
              <span>试试这些灵感</span>
              <span>含极端色</span>
            </div>
            <div className="presets">
              {presets.map((preset) => (
                <button
                  type="button"
                  className={`preset ${primary === preset.color ? "chosen" : ""}`}
                  key={preset.color}
                  title={`${preset.name} ${preset.color}`}
                  aria-label={`使用${preset.name} ${preset.color}`}
                  aria-pressed={primary === preset.color}
                  onClick={() => updateColor(preset.color, true)}
                >
                  <span style={{ backgroundColor: preset.color }} />
                  {primary === preset.color && <i aria-hidden="true" />}
                </button>
              ))}
            </div>
            <div className="control-divider" />
            <div className="field-label">展示模式</div>
            <SegmentedControl
              className="mode-control"
              label="展示模式"
              value={mode}
              onChange={setMode}
              options={[
                {
                  value: "light",
                  label: (
                    <>
                      <Icon name="sun" size={16} />
                      浅色
                    </>
                  ),
                },
                {
                  value: "dark",
                  label: (
                    <>
                      <Icon name="moon" size={16} />
                      深色
                    </>
                  ),
                },
              ]}
            />
            <div className="neutral-control">
              <div>
                <strong id="neutral-label">关联中性色</strong>
                <span>让背景与文字同样和谐</span>
              </div>
              <Switch
                size="small"
                value={neutral}
                aria-checked={neutral}
                aria-labelledby="neutral-label"
                onChange={(value) => {
                  setNeutral(Boolean(value));
                  if (!value) setFamily("brand");
                }}
              />
            </div>
            <div className="engine-note">
              <span className="tiny-dot" />
              <span>全部计算在你的浏览器内完成</span>
            </div>
          </aside>
          <div className="palette-area" data-mode={mode}>
            <div className="palette-heading">
              <div>
                <span className="eyebrow">YOUR COLOR SYSTEM</span>
                <h2>
                  主色色阶<span>10 SHADES</span>
                </h2>
              </div>
              <Button
                variant="outline"
                className="export-trigger"
                onClick={() => setExportOpen(true)}
              >
                <Icon name="download" size={16} />
                导出色阶
              </Button>
            </div>
            <div className="scale-caption">
              <span>浅色背景</span>
              <span>交互与强调</span>
              <span>深色文字</span>
            </div>
            <PaletteStrip
              colors={colors}
              title="主色色阶"
              selected={family === "brand" ? selected : undefined}
              onSelect={(index) => {
                setFamily("brand");
                setSelected(index);
              }}
              onCopy={(color) => void copy(color)}
              copied={copied}
            />
            <div className="palette-footnote">
              <span>
                <Icon name="copy" size={13} />
                点击色块复制 HEX · 悬停或聚焦查看参数
              </span>
              <span>{mode === "light" ? "LIGHT" : "DARK"} / sRGB</span>
            </div>
            {neutral && (
              <div className="neutral-palette">
                <div className="neutral-heading">
                  <h3>关联中性色</h3>
                  <span>一点主色，让灰阶更有温度</span>
                </div>
                <PaletteStrip
                  colors={neutrals}
                  title="中性色阶"
                  compact
                  selected={family === "neutral" ? selected : undefined}
                  onSelect={(index) => {
                    setFamily("neutral");
                    setSelected(index);
                  }}
                  onCopy={(color) => void copy(color)}
                  copied={copied}
                />
              </div>
            )}
            <ColorDetails
              colors={family === "neutral" ? neutrals : colors}
              selected={selected}
            />
          </div>
        </section>
        <div className="under-studio">
          <span>
            <Icon name="check" size={14} />
            10 级有序色阶
          </span>
          <span>
            <Icon name="check" size={14} />
            感知距离采样
          </span>
          <span>
            <Icon name="check" size={14} />
            sRGB 色域映射
          </span>
          <a href="#method">
            为什么主色不一定在色阶里？
            <Icon name="arrow" size={14} />
          </a>
        </div>
        <ComponentPreview theme={theme} mode={mode} notify={notify} />
        <section
          className="method-section"
          id="method"
          aria-labelledby="method-title"
        >
          <div className="method-intro">
            <span className="eyebrow">THE THINKING BEHIND</span>
            <h2 id="method-title">
              好色阶，
              <br />
              不止于等分。
            </h2>
            <p>保留颜色的性格，也照顾人眼的感受。</p>
            <span className="method-tag">
              <Icon name="code" size={14} />
              独立 TypeScript 算法
            </span>
          </div>
          <div className="method-notes">
            <article>
              <span>01</span>
              <div>
                <h3>用感知，衡量深浅</h3>
                <p>
                  在 OKLCH 中保持色相，以平滑的彩度曲线构建路径，再按 OKLab
                  感知距离取十个点，让相邻颜色的变化更接近。
                </p>
              </div>
            </article>
            <article>
              <span>02</span>
              <div>
                <h3>让鲜艳，留在色域里</h3>
                <p>
                  超出 sRGB
                  的颜色仅收敛彩度，尽量保留明度与色相。浅端保留可辨识的色意，深端避免直接混黑带来的失真。
                </p>
              </div>
            </article>
            <article>
              <span>03</span>
              <div>
                <h3>为极端颜色，留出空间</h3>
                <p>
                  主色决定色相与彩度，不强制占据某一级。黑白生成完整无彩灰阶；近黑、近白保留克制的染色。深色方案调整亮度范围并适度降低彩度，原始主色始终保留。
                </p>
              </div>
            </article>
          </div>
        </section>
        <footer className="site-footer">
          <span>
            <strong>色谱</strong> · 把色彩变成秩序
          </span>
          <span>Task 01 · TDesign React · OKLCH</span>
          <a
            href="https://tdesign.gtimg.com/docs/summer-of-code-2026/tdesign-task.html#task-one"
            target="_blank"
            rel="noreferrer"
          >
            查看任务原文
            <Icon name="arrow" size={14} />
          </a>
        </footer>
      </main>
      <ExportDialog
        theme={theme}
        visible={exportOpen}
        close={() => setExportOpen(false)}
        copy={(text, label) => void copy(text, label)}
        notify={notify}
      />
      <div
        className={`toast ${notice ? "visible" : ""}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {notice && (
          <>
            <Icon name="check" size={17} />
            {notice}
          </>
        )}
      </div>
    </>
  );
}
