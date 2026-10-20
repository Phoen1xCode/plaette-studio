import { Moon, Plus, SlidersHorizontal, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ColorMode, HexColor } from "@/lib/palette";
import { COLOR_PRESETS } from "@/lib/presets";

interface StudioControlsProps {
  primary: HexColor;
  input: string;
  error: string;
  mode: ColorMode;
  neutral: boolean;
  onColorChange: (value: string, normalize?: boolean) => void;
  onModeChange: (mode: ColorMode) => void;
  onNeutralChange: (value: boolean) => void;
}

export default function StudioControls({
  primary,
  input,
  error,
  mode,
  neutral,
  onColorChange,
  onModeChange,
  onNeutralChange,
}: StudioControlsProps) {
  return (
    <aside className="controls">
      <div className="panel-label">
        <SlidersHorizontal size={16} strokeWidth={1.7} />
        Studio Controls
      </div>
      <label className="field-label" htmlFor="primary-color">
        Start with your key color
      </label>
      <div className={`color-input-group ${error ? "invalid" : ""}`}>
        <div className="color-picker-wrap" style={{ backgroundColor: primary }}>
          <input
            type="color"
            aria-label="Pick the key color"
            value={primary}
            onChange={(event) => onColorChange(event.target.value, true)}
          />
          <Plus size={18} strokeWidth={2} />
        </div>
        <input
          id="primary-color"
          type="text"
          value={input}
          onChange={(event) => onColorChange(event.target.value)}
          onBlur={() => {
            if (!error) onColorChange(primary, true);
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "color-error" : "color-hint"}
          autoComplete="off"
          spellCheck={false}
          maxLength={160}
        />
      </div>
      {error ? (
        <p id="color-error" className="input-error" role="alert">
          {error}
        </p>
      ) : (
        <p id="color-hint" className="input-hint">
          Supports HEX / RGB / HSL / OKLCH
        </p>
      )}
      <div className="preset-heading">
        <span>Try these sparks</span>
      </div>
      <div className="presets">
        {COLOR_PRESETS.map((preset) => (
          <button
            type="button"
            className={`preset ${primary === preset.color ? "chosen" : ""}`}
            key={preset.color}
            title={`${preset.name} ${preset.color}`}
            aria-label={`Use ${preset.name} ${preset.color}`}
            aria-pressed={primary === preset.color}
            onClick={() => onColorChange(preset.color, true)}
          >
            <span style={{ backgroundColor: preset.color }} />
            {primary === preset.color && <i aria-hidden="true" />}
          </button>
        ))}
      </div>
      <div className="control-divider" />
      <div className="field-label">Display mode</div>
      <ToggleGroup
        className="mode-control"
        aria-label="Display mode"
        value={[mode]}
        onValueChange={(next) => {
          const nextMode = next[0] as ColorMode | undefined;
          // Mode is mandatory: ignore deselecting the last option.
          if (nextMode) onModeChange(nextMode);
        }}
      >
        <ToggleGroupItem value="light">
          <Sun size={16} strokeWidth={1.7} />
          Light
        </ToggleGroupItem>
        <ToggleGroupItem value="dark">
          <Moon size={16} strokeWidth={1.7} />
          Dark
        </ToggleGroupItem>
      </ToggleGroup>
      <div className="neutral-control">
        <div>
          <strong id="neutral-label">Linked neutrals</strong>
          <span>Keep backgrounds and text in harmony</span>
        </div>
        <Switch
          checked={neutral}
          aria-labelledby="neutral-label"
          onCheckedChange={onNeutralChange}
        />
      </div>
    </aside>
  );
}
