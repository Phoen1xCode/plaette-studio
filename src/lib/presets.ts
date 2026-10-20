export interface ColorPreset {
  name: string;
  color: string;
}

/** Inspiration presets, including extreme colors to stress the algorithm. */
export const COLOR_PRESETS: ColorPreset[] = [
  { name: "Tencent Blue", color: "#0052D9" },
  { name: "Iris Purple", color: "#7C3AED" },
  { name: "Coral Red", color: "#F04452" },
  { name: "Emerald Green", color: "#008A68" },
  { name: "Bright Yellow", color: "#FFFF00" },
  { name: "Neon Green", color: "#00FF00" },
  { name: "Faint Pink", color: "#FFF1F5" },
  { name: "Deep Navy", color: "#080B18" },
  { name: "Neutral Gray", color: "#808080" },
  { name: "Pure Black", color: "#000000" },
  { name: "Pure White", color: "#FFFFFF" },
  { name: "Electric Blue", color: "#0000FF" },
];
