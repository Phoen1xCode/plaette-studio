import { Check, Copy } from "lucide-react";
import { readableText, type Palette } from "@/lib/palette";

interface PaletteStripProps {
  colors: Palette;
  title: string;
  compact?: boolean;
  selected?: number;
  onSelect: (index: number) => void;
  onCopy: (color: string) => void;
  copied: string;
}

export default function PaletteStrip({
  colors,
  title,
  compact = false,
  selected,
  onSelect,
  onCopy,
  copied,
}: PaletteStripProps) {
  return (
    <div className={`palette-strip ${compact ? "compact" : ""}`}>
      {colors.map((color, index) => (
        <button
          key={index}
          type="button"
          className={`swatch ${selected === index ? "selected" : ""}`}
          style={{ backgroundColor: color, color: readableText(color) }}
          aria-label={`Copy ${title} ${index + 1}: ${color}`}
          onFocus={() => onSelect(index)}
          onMouseEnter={() => onSelect(index)}
          onClick={() => {
            onSelect(index);
            onCopy(color);
          }}
        >
          <span className="swatch-level">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className={`swatch-copy ${copied === color ? "copied" : ""}`}>
            <Copy size={16} strokeWidth={1.7} className="icon-copy" />
            <Check size={16} strokeWidth={1.7} className="icon-check" />
          </span>
          <span className="swatch-hex">{color}</span>
        </button>
      ))}
    </div>
  );
}
