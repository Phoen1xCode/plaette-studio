import {
  colorCoordinates,
  contrastRatio,
  perceptualDistance,
  type Palette,
} from "@/lib/palette";

interface ColorDetailsProps {
  colors: Palette;
  selected: number;
}

export default function ColorDetails({ colors, selected }: ColorDetailsProps) {
  const color = colors[selected]!;
  const coords = colorCoordinates(color);
  const lightContrast = contrastRatio("#FFFFFF", color);
  const darkContrast = contrastRatio("#000000", color);
  const points = colors
    .map(
      (hex, index) => `${12 + index * 30},${78 - colorCoordinates(hex).l * 66}`,
    )
    .join(" ");
  const distances = colors
    .slice(1)
    .map((hex, index) => perceptualDistance(colors[index]!, hex));
  const smoothness = Math.max(...distances) / Math.min(...distances);

  return (
    <div className="details-grid">
      <div className="color-detail">
        <span className="detail-dot" style={{ backgroundColor: color }} />
        <div>
          <span className="eyebrow">
            Current shade · {String(selected + 1).padStart(2, "0")}
          </span>
          <strong className="mono">{color}</strong>
        </div>
        <dl>
          <div>
            <dt>L Lightness</dt>
            <dd>{(coords.l * 100).toFixed(1)}%</dd>
          </div>
          <div>
            <dt>C Chroma</dt>
            <dd>{coords.c.toFixed(3)}</dd>
          </div>
          <div>
            <dt>H Hue</dt>
            <dd>{coords.c < 0.0001 ? "No hue" : `${coords.h.toFixed(1)}°`}</dd>
          </div>
        </dl>
      </div>
      <div className="contrast-detail">
        <span className="eyebrow">Text contrast · WCAG AA ≥ 4.5</span>
        <div className="contrast-items">
          {[
            { text: "#FFFFFF", label: "White text", value: lightContrast },
            { text: "#000000", label: "Black text", value: darkContrast },
          ].map((item) => (
            <div className="contrast-item" key={item.label}>
              <span
                className="aa-sample"
                style={{ backgroundColor: color, color: item.text }}
                aria-hidden="true"
              >
                Aa
              </span>
              <div>
                <strong>{item.value.toFixed(2)}:1</strong>
                <small>
                  {item.label} · {item.value >= 4.5 ? "AA pass" : "Below AA"}
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="curve-detail">
        <span className="eyebrow">
          Perceptual lightness curve{" "}
          <span className="curve-ratio">
            Step ratio {smoothness.toFixed(2)}
          </span>
        </span>
        <svg
          viewBox="0 0 294 86"
          role="img"
          aria-label="Lightness decreases from left to right across the ten shades"
        >
          <path
            d="M12 78H282M12 45H282M12 12H282"
            stroke="currentColor"
            opacity=".12"
            strokeDasharray="3 4"
          />
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          {colors.map((hex, index) => (
            <circle
              key={index}
              cx={12 + index * 30}
              cy={78 - colorCoordinates(hex).l * 66}
              r={index === selected ? 4.5 : 2.5}
              fill="currentColor"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
