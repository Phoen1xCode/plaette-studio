import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Button, Dialog } from "tdesign-react";
import { type ColorTheme } from "@/lib/palette";
import { exportTheme } from "@/lib/theme";
import Icon from "@/components/Icon";
import SegmentedControl from "@/components/SegmentedControl";

interface Props {
  theme: ColorTheme;
  visible: boolean;
  close: () => void;
  copy: (text: string, label: string) => void;
  notify: (text: string) => void;
}

export default function ExportDialog({
  theme,
  visible,
  close,
  copy,
  notify,
}: Props) {
  const [format, setFormat] = useState<"css" | "json">("css");
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!visible) return;
    // TDesign portals the dialog to body, outside this application root.
    const root = document.getElementById("root")!;
    const previous = root.inert;
    root.inert = true;
    return () => {
      root.inert = previous;
    };
  }, [visible]);
  const trapFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const targets = [
      ...event.currentTarget.querySelectorAll<HTMLElement>(
        'button:not([disabled]), textarea, [tabindex="0"]',
      ),
    ].filter((element) => getComputedStyle(element).display !== "none");
    const first = targets[0];
    const last = targets.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };
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
    notify(`${format.toUpperCase()} 文件已下载`);
  };
  return (
    <Dialog
      visible={visible}
      header={<span id="export-title">把这份色彩带走</span>}
      onClose={close}
      placement="center"
      width="min(720px, calc(100vw - 32px))"
      closeOnOverlayClick
      closeOnEscKeydown
      destroyOnClose
      {...{
        role: "dialog",
        "aria-modal": true,
        "aria-labelledby": "export-title",
        onKeyDown: trapFocus,
      }}
      closeBtn={
        <button
          className="dialog-close"
          type="button"
          aria-label="关闭导出窗口"
        >
          ×
        </button>
      }
      onBeforeOpen={() => {
        opener.current = document.activeElement as HTMLElement;
      }}
      onOpened={() =>
        document.querySelector<HTMLButtonElement>(".dialog-close")?.focus()
      }
      onClosed={() => opener.current?.focus()}
      footer={
        <div className="export-actions">
          <Button variant="outline" onClick={download}>
            <Icon name="download" />
            下载文件
          </Button>
          <Button
            theme="primary"
            onClick={() => copy(text, `${format.toUpperCase()} 主题代码`)}
          >
            <Icon name="copy" />
            复制代码
          </Button>
        </div>
      }
    >
      <p className="export-description">
        包含浅色、深色、关联中性色，以及预览中使用的 TDesign
        语义变量。所有色阶均按由浅到深排序。
      </p>
      <SegmentedControl
        label="导出格式"
        value={format}
        onChange={setFormat}
        options={[
          { value: "css", label: "CSS 变量" },
          { value: "json", label: "JSON 数据" },
        ]}
      />
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
        CSS 放在 TDesign 样式之后引入；为主题容器设置 data-theme="dark"
        即可切换深色。
      </p>
    </Dialog>
  );
}
