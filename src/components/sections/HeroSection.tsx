import type { Palette } from "@/lib/palette";

export default function HeroSection({ colors }: { colors: Palette }) {
  return (
    <section className="hero">
      <div>
        <div className="hero-kicker">
          <span />
          TDesign x TencentOpenSource 2026
        </div>
        <h1>
          One key color, <span>a full scale.</span>
        </h1>
        <p>
          From a spark of inspiration to a complete color system.{" "}
          <br className="mobile-break" />
          Explore every shade at just the right depth.
        </p>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="art-label">A LITTLE COLOR. A LOT OF POSSIBILITY.</div>
        <div className="art-bars">
          {colors.map((color, index) => (
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
          <span>BUILT ON PERCEPTION </span>
        </div>
      </div>
    </section>
  );
}
