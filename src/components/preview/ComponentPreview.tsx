import { useState, type CSSProperties } from "react";
import { ArrowRight, Check, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { contrastRatio, type ColorMode, type ColorTheme } from "@/lib/palette";
import { createPreviewTokens, previewVariables } from "@/lib/theme";

const DEFAULT_NAME = "Brand Refresh Program";
const TASK_LABELS = [
  "Define the brand color and its scale",
  "Verify the light and dark experience",
  "Export the theme and hand it off",
];

type TaskView = "all" | "todo";

interface ComponentPreviewProps {
  theme: ColorTheme;
  mode: ColorMode;
  notify: (text: string) => void;
}

export default function ComponentPreview({
  theme,
  mode,
  notify,
}: ComponentPreviewProps) {
  const [name, setName] = useState(DEFAULT_NAME);
  const [sync, setSync] = useState(true);
  const [frozenTheme, setFrozenTheme] = useState(theme);
  const [tasks, setTasks] = useState([true, true, false]);
  const [view, setView] = useState<TaskView>("all");
  const previewTheme = sync ? theme : frozenTheme;
  const tokens = createPreviewTokens(previewTheme, mode);
  const completed = tasks.filter(Boolean).length;
  const style = {
    ...previewVariables(previewTheme, mode),
    "--preview-bg": tokens.background,
    "--preview-surface": tokens.surface,
    "--preview-text": tokens.text,
    "--preview-muted": tokens.muted,
    "--preview-border": tokens.border,
    "--preview-accent": tokens.accent,
    "--preview-subtle": tokens.subtle,
  } as CSSProperties;

  const reset = () => {
    setName(DEFAULT_NAME);
    setSync(true);
    setTasks([true, true, false]);
    setView("all");
    notify("Preview settings reset");
  };

  return (
    <section
      className="preview-section"
      id="preview"
      aria-labelledby="preview-title"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">IN CONTEXT</span>
          <h2 id="preview-title">See the colors in a real interface.</h2>
        </div>
      </div>
      <div className="preview-frame" style={style} data-preview-mode={mode}>
        <div className="preview-toolbar">
          <div className="window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <span>workspace / brand-project</span>
          <span className="preview-mode">
            {mode === "light" ? "Light" : "Dark"}
          </span>
        </div>
        <div className="preview-content">
          <div className="project-card">
            <div className="project-heading">
              <div className="project-icon">
                <SlidersHorizontal size={24} strokeWidth={1.7} />
              </div>
              <div>
                <span className="eyebrow">DESIGN WORKSPACE</span>
                <h3>{name.trim() || "Untitled project"}</h3>
              </div>
              <Badge className="preview-badge">In progress</Badge>
            </div>
            <p className="preview-description">
              Turn inspiration into a system, so every handoff stays traceable.
            </p>
            <div className="progress-label">
              <span>Project progress</span>
              <strong>{completed} / 3 done</strong>
            </div>
            <Progress
              value={Math.round((completed / 3) * 100)}
              aria-label="Project progress"
            >
              <ProgressTrack className="preview-progress-track">
                <ProgressIndicator className="preview-progress-indicator" />
              </ProgressTrack>
            </Progress>
            <ToggleGroup
              className="task-filter"
              aria-label="Task filter"
              value={[view]}
              onValueChange={(next) => {
                const nextView = next[0] as TaskView | undefined;
                if (nextView) setView(nextView);
              }}
            >
              <ToggleGroupItem value="all">All tasks</ToggleGroupItem>
              <ToggleGroupItem value="todo">To do</ToggleGroupItem>
            </ToggleGroup>
            <div className="task-list">
              {TASK_LABELS.map(
                (label, index) =>
                  (view === "all" || !tasks[index]) && (
                    <div className="task-row" key={label}>
                      <label className="task-label">
                        <Checkbox
                          checked={tasks[index]}
                          onCheckedChange={(checked) =>
                            setTasks((old) =>
                              old.map((task, i) =>
                                i === index ? Boolean(checked) : task,
                              ),
                            )
                          }
                        />
                        <span>{label}</span>
                      </label>
                      <span className="task-index">0{index + 1}</span>
                    </div>
                  ),
              )}
              {view === "todo" && completed === 3 && (
                <p className="all-done">
                  <Check size={18} strokeWidth={1.7} />
                  All tasks complete
                </p>
              )}
            </div>
            <div className="project-footer">
              <div
                className="avatar-stack"
                role="img"
                aria-label="Three project members"
              >
                <span>L</span>
                <span>C</span>
                <span>Z</span>
              </div>
              <span>Creating the next possibility together</span>
            </div>
          </div>
          <div className="settings-card">
            <h3>Project settings</h3>
            <p className="preview-description">
              Try the interactions and watch every color state.
            </p>
            <label className="preview-field">
              Project name
              <Input
                className="preview-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={32}
                placeholder="Give the project a name"
              />
            </label>
            <div className="sync-setting">
              <div>
                <strong id="sync-label">Sync theme colors</strong>
                <small>Keep the team on one visual language</small>
              </div>
              <Switch
                checked={sync}
                onCheckedChange={(checked) => {
                  if (!checked) setFrozenTheme(theme);
                  setSync(checked);
                }}
                aria-labelledby="sync-label"
              />
            </div>
            <div className="preview-notice">
              <Check size={18} strokeWidth={1.7} />
              <div>
                <strong>
                  {sync ? "Theme linked in real time" : "Auto-sync paused"}
                </strong>
                <span>
                  Brand color <code>{tokens.accent}</code>
                </span>
              </div>
            </div>
            <div className="preview-actions">
              <Button
                className="preview-button"
                onClick={() =>
                  notify(
                    `Saved preview settings for "${name.trim() || "Untitled project"}"`,
                  )
                }
              >
                Save settings
                <ArrowRight size={16} strokeWidth={1.7} />
              </Button>
              <Button
                variant="outline"
                className="preview-button"
                onClick={reset}
              >
                Reset
              </Button>
              <Button variant="outline" className="preview-button" disabled>
                Archived
              </Button>
            </div>
            <p className="preview-contrast">
              <Check size={14} strokeWidth={1.7} />
              Brand / container contrast{" "}
              {contrastRatio(tokens.accent, tokens.surface).toFixed(2)}:1 · AA
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
