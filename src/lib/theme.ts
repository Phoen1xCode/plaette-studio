import {
  contrastRatio,
  readableText,
  type ColorMode,
  type ColorTheme,
  type HexColor,
  type Palette,
} from "./palette";

export interface PreviewTokens {
  accent: HexColor;
  accentText: HexColor;
  background: HexColor;
  surface: HexColor;
  text: HexColor;
  muted: HexColor;
  border: HexColor;
  subtle: HexColor;
  hover: HexColor;
  active: HexColor;
}

/** Pick from generated shades, preserving >=4.5:1 text on the actual surface. */
export function createPreviewTokens(
  theme: ColorTheme,
  mode: ColorMode,
): PreviewTokens {
  const dark = mode === "dark";
  const colors = dark ? theme.dark : theme.light;
  const neutrals = dark ? theme.neutralDark : theme.neutralLight;
  const surface = dark ? neutrals[8] : "#FFFFFF";
  const subtle = dark ? colors[9] : colors[0];
  const candidates = colors.filter(
    (color) =>
      contrastRatio(color, surface) >= 4.5 &&
      contrastRatio(color, subtle) >= 4.5,
  );
  const accent = candidates.reduce(
    (best, color) =>
      Math.abs(colors.indexOf(color) - 5) < Math.abs(colors.indexOf(best) - 5)
        ? color
        : best,
    candidates[0] ?? (dark ? colors[0] : colors[9]),
  );
  const index = colors.indexOf(accent);
  const neighbor = (offset: number) => {
    const shade = colors[Math.min(9, Math.max(0, index + offset))]!;
    return contrastRatio(shade, surface) >= 4.5 &&
      contrastRatio(readableText(accent), shade) >= 4.5
      ? shade
      : accent;
  };
  return {
    accent,
    accentText: readableText(accent),
    surface,
    background: dark ? neutrals[9] : neutrals[0],
    text: dark ? neutrals[0] : neutrals[9],
    muted: dark ? neutrals[2] : neutrals[6],
    border: dark ? neutrals[6] : neutrals[2],
    subtle,
    hover: neighbor(dark ? -1 : 1),
    active: neighbor(dark ? -2 : 2),
  };
}

/** shadcn/ui theme variables so the live preview adopts the generated theme. */
export function previewVariables(
  theme: ColorTheme,
  mode: ColorMode,
): Record<string, string> {
  const tokens = createPreviewTokens(theme, mode);
  return {
    "--background": tokens.background,
    "--foreground": tokens.text,
    "--card": tokens.surface,
    "--card-foreground": tokens.text,
    "--popover": tokens.surface,
    "--popover-foreground": tokens.text,
    "--primary": tokens.accent,
    "--primary-foreground": tokens.accentText,
    "--secondary": tokens.subtle,
    "--secondary-foreground": tokens.accent,
    "--muted": tokens.background,
    "--muted-foreground": tokens.muted,
    "--accent": tokens.subtle,
    "--accent-foreground": tokens.accent,
    "--border": tokens.border,
    "--input": tokens.border,
    "--ring": tokens.accent,
  };
}

function paletteVariables(name: string, colors: Palette) {
  return colors
    .map((hex, index) => `  --${name}-${index + 1}: ${hex};`)
    .join("\n");
}

export function exportTheme(theme: ColorTheme, format: "css" | "json"): string {
  if (format === "json")
    return JSON.stringify(
      {
        version: 1,
        colorSpace: "srgb",
        order: "light-to-dark",
        ...theme,
        tokens: {
          light: createPreviewTokens(theme, "light"),
          dark: createPreviewTokens(theme, "dark"),
        },
      },
      null,
      2,
    );
  const block = (mode: ColorMode) => {
    const variables = previewVariables(theme, mode);
    const brand = mode === "light" ? theme.light : theme.dark;
    const neutral = mode === "light" ? theme.neutralLight : theme.neutralDark;
    return `${mode === "light" ? ":root" : '[data-theme="dark"]'} {\n${paletteVariables("brand", brand)}\n${paletteVariables("neutral", neutral)}\n${Object.entries(
      variables,
    )
      .map(([key, value]) => `  ${key}: ${value};`)
      .join("\n")}\n}`;
  };
  return `/* Palette Studio | ${theme.source} | sRGB | 1 = light, 10 = dark */\n${block("light")}\n\n${block("dark")}\n`;
}
