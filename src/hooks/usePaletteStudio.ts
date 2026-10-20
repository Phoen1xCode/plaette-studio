import { useMemo, useRef, useState } from "react";
import { toast } from "@/components/ui/toast";
import {
  ColorInputError,
  generateTheme,
  normalizeColor,
  type ColorMode,
  type HexColor,
} from "@/lib/palette";

export type PaletteFamily = "brand" | "neutral";

/** Owns all palette-studio state: color input, derived theme, selection, and toasts. */
export function usePaletteStudio() {
  const [primary, setPrimary] = useState<HexColor>("#0052D9");
  const [input, setInput] = useState<string>(primary);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<ColorMode>("light");
  const [neutral, setNeutral] = useState(true);
  const [selected, setSelected] = useState(5);
  const [family, setFamily] = useState<PaletteFamily>("brand");
  const [exportOpen, setExportOpen] = useState(false);
  const [copied, setCopied] = useState("");
  const copiedVersion = useRef(0);

  const theme = useMemo(() => generateTheme(primary), [primary]);
  const colors = mode === "light" ? theme.light : theme.dark;
  const neutrals = mode === "light" ? theme.neutralLight : theme.neutralDark;

  const notify = (message: string, type: "success" | "error" = "success") => {
    toast.add({ title: message, type });
  };

  const updateColor = (value: string, normalize = false) => {
    setInput(value);
    try {
      const color = normalizeColor(value);
      setPrimary(color);
      setError("");
      if (normalize) setInput(color);
    } catch (reason) {
      setError(
        reason instanceof ColorInputError
          ? reason.message
          : "Can't parse this color yet. Try another value.",
      );
    }
  };

  const changeNeutral = (value: boolean) => {
    setNeutral(value);
    if (!value) setFamily("brand");
  };

  const selectShade = (nextFamily: PaletteFamily, index: number) => {
    setFamily(nextFamily);
    setSelected(index);
  };

  const copy = async (text: string, label = text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      notify(`Copied ${label}`);
      // Reset the swatch check icon once the toast has faded.
      const version = ++copiedVersion.current;
      window.setTimeout(() => {
        if (version === copiedVersion.current) setCopied("");
      }, 3000);
    } catch {
      notify(
        "Clipboard unavailable. Select the code in the export window to copy it, or download the file.",
        "error",
      );
      setExportOpen(true);
    }
  };

  return {
    primary,
    input,
    error,
    mode,
    neutral,
    selected,
    family,
    exportOpen,
    copied,
    theme,
    colors,
    neutrals,
    setMode,
    setExportOpen,
    updateColor,
    changeNeutral,
    selectShade,
    copy,
    notify,
  };
}
