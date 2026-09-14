import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "tdesign-react/es/style/index.css";
import "@fontsource-variable/manrope";
import "@fontsource-variable/dm-sans";
import App from "@/App.tsx";
import "@/styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
