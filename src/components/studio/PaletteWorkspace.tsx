import { Download } from "lucide-react";
import ColorDetails from "./ColorDetails";
import PaletteStrip from "./PaletteStrip";
import { Button } from "@/components/ui/button";
import type { PaletteFamily } from "@/hooks/usePaletteStudio";
import type { ColorMode, Palette } from "@/lib/palette";

interface PaletteWorkspaceProps {
  colors: Palette;
  neutrals: Palette;
  mode: ColorMode;
  neutral: boolean;
  family: PaletteFamily;
  selected: number;
  copied: string;
  onSelect: (family: PaletteFamily, index: number) => void;
  onCopy: (color: string) => void;
  onExport: () => void;
}

export default function PaletteWorkspace({
  colors,
  neutrals,
  mode,
  neutral,
  family,
  selected,
  copied,
  onSelect,
  onCopy,
  onExport,
}: PaletteWorkspaceProps) {
  return (
    <div className="palette-area" data-mode={mode}>
      <div className="palette-heading">
        <div>
          <span className="eyebrow">YOUR COLOR SYSTEM</span>
          <h2>
            Brand scale<span>10 SHADES</span>
          </h2>
        </div>
        <Button variant="outline" className="export-trigger" onClick={onExport}>
          <Download size={16} strokeWidth={1.7} />
          Export scale
        </Button>
      </div>
      <div className="scale-caption">
        <span>Light surfaces</span>
        <span>Interaction &amp; accents</span>
        <span>Dark text</span>
      </div>
      <PaletteStrip
        colors={colors}
        title="brand shade"
        selected={family === "brand" ? selected : undefined}
        onSelect={(index) => onSelect("brand", index)}
        onCopy={onCopy}
        copied={copied}
      />
      <div className="palette-footnote">
        <span>{mode === "light" ? "LIGHT" : "DARK"} / sRGB</span>
      </div>
      {neutral && (
        <div className="neutral-palette">
          <div className="neutral-heading">
            <h3>Linked neutrals</h3>
            <span>A touch of brand keeps grays warm</span>
          </div>
          <PaletteStrip
            colors={neutrals}
            title="neutral shade"
            compact
            selected={family === "neutral" ? selected : undefined}
            onSelect={(index) => onSelect("neutral", index)}
            onCopy={onCopy}
            copied={copied}
          />
        </div>
      )}
      <ColorDetails
        colors={family === "neutral" ? neutrals : colors}
        selected={selected}
      />
    </div>
  );
}
