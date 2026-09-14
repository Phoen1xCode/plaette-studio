const paths = {
  arrow: "M4 12h16m-6-6 6 6-6 6",
  copy: "M9 9h11v11H9zM15 9V4H4v11h5",
  download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
  sun: "M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  moon: "M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z",
  check: "m5 12 4 4L19 6",
  code: "m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18",
  sliders: "M4 7h8m4 0h4M4 17h3m4 0h9M12 4v6M7 14v6",
  link: "M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2",
  plus: "M12 4v16M4 12h16",
} as const;

export default function Icon({
  name,
  size = 18,
}: {
  name: keyof typeof paths;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
