import { CodeXml } from "lucide-react";

const NOTES = [
  {
    title: "Measure depth by perception",
    body: "Hold the hue in OKLCH, build a path with a smooth chroma curve, then sample ten points by OKLab perceptual distance so neighboring steps change evenly.",
  },
  {
    title: "Keep vibrancy inside the gamut",
    body: "Colors beyond sRGB only converge in chroma, preserving lightness and hue as much as possible. The light end keeps a recognizable tint, and the dark end avoids the distortion of mixing straight toward black.",
  },
  {
    title: "Make room for extreme colors",
    body: "The source color sets hue and chroma character without claiming a fixed stop. Black and white generate full achromatic gray scales; near-black and near-white keep a restrained tint. The dark scheme adjusts the lightness range and trims chroma, while the original source color is always preserved.",
  },
];

export default function MethodSection() {
  return (
    <section
      className="method-section"
      id="method"
      aria-labelledby="method-title"
    >
      <div className="method-intro">
        <span className="eyebrow">THE THINKING BEHIND</span>
        <h2 id="method-title">
          A good scale,
          <br />
          beyond equal steps.
        </h2>
        <p>
          Keep each color's character while respecting how the eye perceives it.
        </p>
        <span className="method-tag">
          <CodeXml size={14} strokeWidth={1.7} />
          Standalone TypeScript engine
        </span>
      </div>
      <div className="method-notes">
        {NOTES.map((note, index) => (
          <article key={note.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h3>{note.title}</h3>
              <p>{note.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
