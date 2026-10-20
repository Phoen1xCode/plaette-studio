import { useState } from "react";

const NAV_ITEMS = [
  { label: "Studio", href: "#studio" },
  { label: "Preview", href: "#preview" },
  { label: "Method", href: "#method" },
] as const;

export default function SiteHeader() {
  const [active, setActive] = useState<string>("#studio");

  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Palette Studio home">
        <span className="brand-mark" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <strong>Palette</strong>
        <span className="brand-divider" />
        <span>STUDIO</span>
      </a>
      <nav aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={active === item.href ? "active" : undefined}
            aria-current={active === item.href ? "location" : undefined}
            onClick={() => setActive(item.href)}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
