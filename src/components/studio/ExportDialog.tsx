import { useState } from "react";
import { Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ColorTheme } from "@/lib/palette";
import { exportTheme } from "@/lib/theme";

type ExportFormat = "css" | "json";

interface ExportDialogProps {
  theme: ColorTheme;
  open: boolean;
  onClose: () => void;
  copy: (text: string, label: string) => void;
  notify: (text: string) => void;
}

export default function ExportDialog({
  theme,
  open,
  onClose,
  copy,
  notify,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("css");
  const text = exportTheme(theme, format);

  const download = () => {
    const blob = new Blob([text], {
      type: format === "json" ? "application/json" : "text/css",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `palette-${theme.source.slice(1).toLowerCase()}.${format}`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify(`${format.toUpperCase()} file downloaded`);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="export-dialog" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="export-title">
            Take these colors with you
          </DialogTitle>
        </DialogHeader>
        <p className="export-description">
          Includes light, dark, and linked neutral scales, plus the shadcn/ui
          semantic variables used in the preview. Every scale runs light to
          dark.
        </p>
        <ToggleGroup
          className="export-format"
          aria-label="Export format"
          value={[format]}
          onValueChange={(next) => {
            const nextFormat = next[0] as ExportFormat | undefined;
            if (nextFormat) setFormat(nextFormat);
          }}
        >
          <ToggleGroupItem value="css">CSS variables</ToggleGroupItem>
          <ToggleGroupItem value="json">JSON data</ToggleGroupItem>
        </ToggleGroup>
        <label className="export-code-label" htmlFor="export-code">
          {format === "css" ? "theme.css" : "theme.json"} · {theme.source}
        </label>
        <textarea
          id="export-code"
          className="export-code"
          readOnly
          value={text}
          spellCheck={false}
        />
        <p className="export-help">
          Load the CSS after your shadcn/ui theme variables; set
          data-theme="dark" on a container to switch to dark mode.
        </p>
        <DialogFooter className="export-actions">
          <Button
            variant="outline"
            className="export-button"
            onClick={download}
          >
            <Download size={16} strokeWidth={1.7} />
            Download file
          </Button>
          <Button
            className="export-button"
            onClick={() => copy(text, `${format.toUpperCase()} theme code`)}
          >
            <Copy size={16} strokeWidth={1.7} />
            Copy code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
