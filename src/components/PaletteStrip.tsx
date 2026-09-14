import { readableText, type Palette } from "@/lib/palette";
import Icon from "@/components/Icon";

interface Props {
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
}: Props) {
  return (
    <div className={`palette-strip ${compact ? "compact" : ""}`}>
      {colors.map((color, index) => (
        <button
          key={index}
          type="button"
          className={`swatch ${selected === index ? "selected" : ""}`}
          style={{ backgroundColor: color, color: readableText(color) }}
          aria-label={`复制${title} ${index + 1}：${color}`}
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
          <span className="swatch-copy">
            <Icon name={copied === color ? "check" : "copy"} size={16} />
          </span>
          <span className="swatch-hex">{color}</span>
        </button>
      ))}
    </div>
  );
}
