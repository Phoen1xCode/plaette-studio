/** Browser-independent color engine. No DOM, React, storage, or network access. */
import { converter, formatHex, parse, type Oklch, type Rgb } from "culori";

export type HexColor = `#${string}`;
export type Palette = readonly [
  HexColor,
  HexColor,
  HexColor,
  HexColor,
  HexColor,
  HexColor,
  HexColor,
  HexColor,
  HexColor,
  HexColor,
];
export type ColorMode = "light" | "dark";
export interface PaletteOptions {
  mode?: ColorMode;
  neutral?: boolean;
}
export interface ColorTheme {
  source: HexColor;
  light: Palette;
  dark: Palette;
  neutralLight: Palette;
  neutralDark: Palette;
}

const toRgb = converter("rgb");
const toOklch = converter("oklch");
const toOklab = converter("oklab");
const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
const POINTS = 192;
const ACHROMATIC_EPSILON = 0.0001;

export class ColorInputError extends Error {
  constructor(
    message = "请输入有效的不透明颜色，如 #0052D9、rgb(0 82 217) 或 oklch(50% 0.2 260)。",
  ) {
    super(message);
    this.name = "ColorInputError";
  }
}

function inGamut(rgb: Rgb): boolean {
  return [rgb.r, rgb.g, rgb.b].every(
    (v) => Number.isFinite(v) && v >= -1e-7 && v <= 1 + 1e-7,
  );
}

/** Find the sRGB boundary along a constant-lightness, constant-hue ray. */
export function maxChroma(lightness: number, hue: number): number {
  if (lightness <= 0 || lightness >= 1) return 0;
  let low = 0;
  let high = 0.4;
  for (let iteration = 0; iteration < 22; iteration++) {
    const middle = (low + high) / 2;
    if (inGamut(toRgb({ mode: "oklch", l: lightness, c: middle, h: hue })))
      low = middle;
    else high = middle;
  }
  return low;
}

function serialize(color: Oklch): HexColor {
  const rgb = toRgb(color);
  // Only numerical roundoff remains after chroma mapping, not channel clipping.
  return formatHex({
    ...rgb,
    r: clamp(rgb.r),
    g: clamp(rgb.g),
    b: clamp(rgb.b),
  }).toUpperCase() as HexColor;
}

/** CSS Color 4 syntax supported by Culori. Alpha needs an explicit background. */
export function normalizeColor(input: string): HexColor {
  if (typeof input !== "string" || !input.trim() || input.length > 160)
    throw new ColorInputError();
  const text = input.trim();
  const parsed = parse(
    /^[\da-f]{3}$|^[\da-f]{6}$/i.test(text) ? `#${text}` : text,
  );
  if (!parsed) throw new ColorInputError();
  const rgb = toRgb(parsed);
  if (![rgb.r, rgb.g, rgb.b, rgb.alpha ?? 1].every(Number.isFinite))
    throw new ColorInputError();
  if ((rgb.alpha ?? 1) !== 1)
    throw new ColorInputError(
      "暂不接受透明色。请先在目标背景上合成，再输入不透明颜色。",
    );
  const lch = toOklch(rgb);
  if (!Number.isFinite(lch.l) || !Number.isFinite(lch.c))
    throw new ColorInputError();
  const l = clamp(lch.l);
  const h = lch.h ?? 0;
  return serialize({
    mode: "oklch",
    l,
    h,
    c: Math.min(Math.max(0, lch.c), maxChroma(l, h)),
  });
}

export function colorCoordinates(color: string) {
  const lch = toOklch(normalizeColor(color))!;
  return {
    l: lch.l,
    c: lch.c,
    h: lch.c < ACHROMATIC_EPSILON ? 0 : (lch.h ?? 0),
  };
}

export function perceptualDistance(a: string, b: string): number {
  const first = toOklab(a)!;
  const second = toOklab(b)!;
  return Math.hypot(first.l - second.l, first.a - second.a, first.b - second.b);
}

/**
 * Exactly ten sRGB HEX colors, always light to dark (including dark mode).
 * The seed defines hue and chroma character, not a compulsory output stop.
 * Sample equal OKLab arc lengths along a gamut-mapped OKLCH curve.
 */
export function generatePalette(
  primary: string,
  options: PaletteOptions = {},
): Palette {
  const { l: seedL, c: seedC, h } = colorCoordinates(primary);
  const isGray = seedC < ACHROMATIC_EPSILON;
  const dark = options.mode === "dark";
  const high = dark ? 0.9 : 0.975;
  const low = dark ? 0.16 : 0.2;
  // The floor bounds chroma amplification for almost-white/black seeds.
  const seedEnvelope = Math.max(0.35, Math.sin(Math.PI * seedL)) ** 0.8;
  const peak = isGray
    ? 0
    : options.neutral
      ? Math.min(0.022, seedC * 0.12)
      : Math.min(0.4, seedC / seedEnvelope) * (dark ? 0.82 : 1);

  function point(t: number): Oklch {
    const l = high + (low - high) * t;
    const desired = peak * Math.sin(Math.PI * l) ** 0.8;
    const c = isGray ? 0 : Math.min(desired, maxChroma(l, h));
    return { mode: "oklch", l, c, h };
  }

  // Fixed hue makes the OKLab distance exactly hypot(ΔL, ΔC).
  const curve = Array.from({ length: POINTS + 1 }, (_, index) =>
    point(index / POINTS),
  );
  const lengths = [0];
  for (let i = 1; i <= POINTS; i++) {
    const previous = curve[i - 1]!;
    const current = curve[i]!;
    lengths.push(
      lengths[i - 1]! +
        Math.hypot(current.l - previous.l, current.c - previous.c),
    );
  }
  const total = lengths[POINTS]!;
  let cursor = 1;
  return Array.from({ length: 10 }, (_, index) => {
    if (index === 0) return serialize(curve[0]!);
    if (index === 9) return serialize(curve[POINTS]!);
    const target = (index / 9) * total;
    while (cursor < POINTS && lengths[cursor]! < target) cursor++;
    const fraction =
      (target - lengths[cursor - 1]!) /
      (lengths[cursor]! - lengths[cursor - 1]!);
    // Re-evaluate the curve at the interpolated location to remain in gamut.
    return serialize(point((cursor - 1 + fraction) / POINTS));
  }) as unknown as Palette;
}

export function generateTheme(primary: string): ColorTheme {
  const source = normalizeColor(primary);
  return {
    source,
    light: generatePalette(source),
    dark: generatePalette(source, { mode: "dark" }),
    neutralLight: generatePalette(source, { neutral: true }),
    neutralDark: generatePalette(source, { mode: "dark", neutral: true }),
  };
}

function luminance(color: string): number {
  const { r, g, b } = toRgb(color)!;
  const linear = (channel: number) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/** WCAG 2.x relative-luminance contrast, distinct from OKLab distance. */
export function contrastRatio(foreground: string, background: string): number {
  const a = luminance(normalizeColor(foreground));
  const b = luminance(normalizeColor(background));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function readableText(background: string): HexColor {
  return contrastRatio("#FFFFFF", background) >=
    contrastRatio("#000000", background)
    ? "#FFFFFF"
    : "#000000";
}
