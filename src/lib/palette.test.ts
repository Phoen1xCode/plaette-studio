import { describe, expect, it } from "vitest";
import { converter } from "culori";
import {
  ColorInputError,
  colorCoordinates,
  contrastRatio,
  generatePalette,
  generateTheme,
  maxChroma,
  normalizeColor,
  perceptualDistance,
  readableText,
} from "@/lib/palette";
import {
  createPreviewTokens,
  exportTheme,
  tdesignVariables,
} from "@/lib/theme";

const representative = [
  "#0052D9",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#00FFFF",
  "#FF00FF",
  "#7C3AED",
  "#008A68",
  "#F04452",
  "#FFF1F5",
  "#080B18",
  "#FEFEFE",
  "#010101",
  "#808080",
  "#000000",
  "#FFFFFF",
  "#FFFFFE",
  "#010002",
  "#FFE0A1",
];
const rgb = converter("rgb");
const oklab = converter("oklab");

describe("input contract", () => {
  it.each([
    ["#abc", "#AABBCC"],
    ["  0052d9 ", "#0052D9"],
    ["red", "#FF0000"],
    ["rgb(0 82 217)", "#0052D9"],
    ["hsl(0 100% 50%)", "#FF0000"],
    ["#0052d9ff", "#0052D9"],
    ["rgba(0, 82, 217, 1)", "#0052D9"],
  ])("normalizes %s to %s", (input, expected) =>
    expect(normalizeColor(input)).toBe(expected),
  );

  it.each([
    "",
    "   ",
    "#12",
    "#GGGGGG",
    "no-such-color",
    "var(--color)",
    "currentColor",
    "transparent",
    "#1234",
    "rgba(0,0,0,.9)",
    "linear-gradient(red, blue)",
    "rgb(NaN 0 0)",
    "x".repeat(161),
  ])("rejects unsupported or ambiguous input: %s", (input) => {
    expect(() => generatePalette(input)).toThrow(ColorInputError);
  });

  it("supports OKLCH and maps wide-gamut input to sRGB before generation", () => {
    for (const input of ["oklch(65% 0.4 30)", "color(display-p3 1 0 0)"]) {
      expect(normalizeColor(input)).toMatch(/^#[0-9A-F]{6}$/);
      expect(generatePalette(input)).toHaveLength(10);
    }
  });

  it("rejects non-string JavaScript input with a useful typed error", () => {
    expect(() => generatePalette(null as unknown as string)).toThrow(
      ColorInputError,
    );
  });
});

describe.each(representative)("%s palette", (seed) => {
  it.each([
    { mode: "light" as const },
    { mode: "dark" as const },
    { mode: "light" as const, neutral: true },
    { mode: "dark" as const, neutral: true },
  ])(
    "has ten distinct, strictly ordered, perceptually spaced shades: %o",
    (options) => {
      const shades = generatePalette(seed, options);
      expect(shades).toHaveLength(10);
      expect(new Set(shades).size).toBe(10);
      const distances: number[] = [];
      shades.forEach((hex, index) => {
        expect(hex).toMatch(/^#[0-9A-F]{6}$/);
        const value = rgb(hex)!;
        expect(
          [value.r, value.g, value.b].every(
            (channel) =>
              Number.isFinite(channel) && channel >= 0 && channel <= 1,
          ),
        ).toBe(true);
        expect(contrastRatio(readableText(hex), hex)).toBeGreaterThanOrEqual(
          4.5,
        );
        if (index > 0) {
          const previous = shades[index - 1]!;
          const deltaL = oklab(previous)!.l - oklab(hex)!.l;
          expect(deltaL).toBeGreaterThan(0.025);
          distances.push(perceptualDistance(previous, hex));
        }
      });
      // Quantized, straight-line distances approximate equal curve arc lengths.
      expect(Math.max(...distances) / Math.min(...distances)).toBeLessThan(1.4);
      expect(oklab(shades[0])!.l - oklab(shades[9])!.l).toBeGreaterThan(0.7);
    },
  );

  it("keeps preview text and brand states readable on their actual backgrounds", () => {
    const theme = generateTheme(seed);
    for (const mode of ["light", "dark"] as const) {
      const tokens = createPreviewTokens(theme, mode);
      expect(
        contrastRatio(tokens.accent, tokens.surface),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(tokens.accentText, tokens.accent),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(tokens.accentText, tokens.hover),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(tokens.accentText, tokens.active),
      ).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(tokens.text, tokens.surface)).toBeGreaterThanOrEqual(
        4.5,
      );
      expect(
        contrastRatio(tokens.muted, tokens.surface),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(tokens.accent, tokens.subtle),
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("color strategy", () => {
  it("keeps exact achromatic inputs achromatic, with black and white yielding a useful full range", () => {
    for (const seed of ["#000000", "#FFFFFF", "#808080"]) {
      for (const color of generatePalette(seed)) {
        const value = rgb(color)!;
        expect(value.r).toBe(value.g);
        expect(value.g).toBe(value.b);
      }
    }
    expect(generatePalette("#000000")).toEqual(generatePalette("#FFFFFF"));
  });

  it("does not turn barely tinted near-white or near-black inputs into saturated colors", () => {
    for (const seed of ["#FFFFFE", "#010002", "#FFF1F5"]) {
      expect(
        Math.max(
          ...generatePalette(seed).map((color) => colorCoordinates(color).c),
        ),
      ).toBeLessThan(0.065);
    }
  });

  it("keeps meaningful hue and gently harmonizes neutrals", () => {
    for (const seed of representative.slice(0, 10)) {
      const source = colorCoordinates(seed);
      for (const color of generatePalette(seed)) {
        const target = colorCoordinates(color);
        if (target.c > 0.025) {
          const difference = Math.abs(source.h - target.h);
          expect(Math.min(difference, 360 - difference)).toBeLessThan(4);
        }
      }
      const neutral = generatePalette(seed, { neutral: true });
      expect(
        Math.max(...neutral.map((color) => colorCoordinates(color).c)),
      ).toBeLessThan(0.025);
    }
  });

  it("gamut boundary is in sRGB and a meaningful increase crosses it", () => {
    for (const h of [0, 30, 90, 140, 200, 265, 310]) {
      const c = maxChroma(0.6, h);
      const inside = rgb({ mode: "oklch", l: 0.6, c: c - 1e-6, h });
      const outside = rgb({ mode: "oklch", l: 0.6, c: c + 1e-4, h });
      expect(
        [inside.r, inside.g, inside.b].every((v) => v >= 0 && v <= 1),
      ).toBe(true);
      expect(
        [outside.r, outside.g, outside.b].some((v) => v < 0 || v > 1),
      ).toBe(true);
    }
  });

  it("checks ordering and smoothness across a deterministic 125-color RGB cube", () => {
    const channels = ["00", "40", "80", "BF", "FF"];
    for (const r of channels)
      for (const g of channels)
        for (const b of channels) {
          for (const mode of ["light", "dark"] as const) {
            const shades = generatePalette(`#${r}${g}${b}`, { mode });
            const distances = shades.slice(1).map((shade, index) => {
              expect(oklab(shades[index]!)!.l).toBeGreaterThan(oklab(shade)!.l);
              return perceptualDistance(shades[index]!, shade);
            });
            expect(
              Math.max(...distances) / Math.min(...distances),
            ).toBeLessThan(1.4);
          }
        }
  });

  it("is deterministic, independent, and supplies a genuinely different dark palette", () => {
    const original = generatePalette("#0052D9");
    const dark = generatePalette("#0052D9", { mode: "dark" });
    expect(original).toEqual(generatePalette("rgb(0 82 217)"));
    expect(original).not.toBe(generatePalette("#0052D9"));
    expect(dark).not.toEqual([...original].reverse());
    expect(colorCoordinates(dark[0]).l).toBeLessThan(
      colorCoordinates(original[0]).l,
    );
    expect(colorCoordinates(dark[9]).l).toBeLessThan(
      colorCoordinates(original[9]).l,
    );
  });

  it("uses WCAG relative luminance, with black/white contrast equal to 21:1", () => {
    expect(contrastRatio("#000", "#fff")).toBeCloseTo(21, 4);
    expect(contrastRatio("#0052d9", "#0052d9")).toBeCloseTo(1, 4);
  });
});

describe("portable exports", () => {
  it("exports all four palettes and the actual preview tokens to JSON", () => {
    const theme = generateTheme("#0052D9");
    const data = JSON.parse(exportTheme(theme, "json"));
    expect(data.order).toBe("light-to-dark");
    for (const key of ["light", "dark", "neutralLight", "neutralDark"] as const)
      expect(data[key]).toEqual(theme[key]);
    expect(data.tokens.dark).toEqual(createPreviewTokens(theme, "dark"));
  });

  it("exports valid complete CSS declarations for light and dark mode", () => {
    const theme = generateTheme("#FFFF00");
    const css = exportTheme(theme, "css");
    expect(css).toContain(":root {");
    expect(css).toContain('[data-theme="dark"] {');
    for (const mode of ["light", "dark"] as const) {
      for (const [key, value] of Object.entries(
        tdesignVariables(theme, mode),
      )) {
        expect(css).toContain(`${key}: ${value};`);
      }
    }
    expect(css.match(/--brand-\d+:/g)).toHaveLength(20);
    expect(css.match(/--neutral-\d+:/g)).toHaveLength(20);
    expect(css).not.toMatch(/NaN|undefined/);
  });
});
