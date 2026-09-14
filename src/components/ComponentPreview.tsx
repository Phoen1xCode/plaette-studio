import { useState, type CSSProperties } from "react";
import { Button, Checkbox, Input, Progress, Switch, Tag } from "tdesign-react";
import { contrastRatio, type ColorMode, type ColorTheme } from "@/lib/palette";
import { createPreviewTokens, tdesignVariables } from "@/lib/theme";
import Icon from "@/components/Icon";
import SegmentedControl from "@/components/SegmentedControl";

interface Props {
  theme: ColorTheme;
  mode: ColorMode;
  notify: (text: string) => void;
}

export default function ComponentPreview({ theme, mode, notify }: Props) {
  const [name, setName] = useState("品牌焕新计划");
  const [sync, setSync] = useState(true);
  const [frozenTheme, setFrozenTheme] = useState(theme);
  const [tasks, setTasks] = useState([true, true, false]);
  const [view, setView] = useState("全部");
  const previewTheme = sync ? theme : frozenTheme;
  const tokens = createPreviewTokens(previewTheme, mode);
  const completed = tasks.filter(Boolean).length;
  const labels = [
    "定义品牌主色与色阶",
    "验证浅色与深色体验",
    "导出主题，交付开发",
  ];
  const style = {
    ...tdesignVariables(previewTheme, mode),
    "--preview-bg": tokens.background,
    "--preview-surface": tokens.surface,
    "--preview-text": tokens.text,
    "--preview-muted": tokens.muted,
    "--preview-border": tokens.border,
    "--preview-accent": tokens.accent,
    "--preview-subtle": tokens.subtle,
  } as CSSProperties;

  return (
    <section
      className="preview-section"
      id="preview"
      aria-labelledby="preview-title"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">IN CONTEXT</span>
          <h2 id="preview-title">让颜色，进入真实界面。</h2>
        </div>
        <span className="component-caption">
          <span className="tiny-dot" />
          实时 TDesign React 组件
        </span>
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
                <Icon name="sliders" size={24} />
              </div>
              <div>
                <span className="eyebrow">DESIGN WORKSPACE</span>
                <h3>{name.trim() || "未命名项目"}</h3>
              </div>
              <Tag theme="primary" variant="light">
                进行中
              </Tag>
            </div>
            <p className="preview-description">
              把灵感整理成系统，让每一次交付都有迹可循。
            </p>
            <div className="progress-label">
              <span>项目进度</span>
              <strong>{completed} / 3 已完成</strong>
            </div>
            <Progress
              percentage={Math.round((completed / 3) * 100)}
              color={tokens.accent}
              trackColor={tokens.border}
              label={false}
            />
            <SegmentedControl
              label="任务筛选"
              value={view}
              onChange={setView}
              size="small"
              options={[
                { value: "全部", label: "全部任务" },
                { value: "待完成", label: "待完成" },
              ]}
            />
            <div className="task-list">
              {labels.map(
                (label, index) =>
                  (view === "全部" || !tasks[index]) && (
                    <div className="task-row" key={label}>
                      <Checkbox
                        checked={tasks[index]}
                        onChange={(checked) =>
                          setTasks((old) =>
                            old.map((task, i) =>
                              i === index ? Boolean(checked) : task,
                            ),
                          )
                        }
                      >
                        {label}
                      </Checkbox>
                      <span className="task-index">0{index + 1}</span>
                    </div>
                  ),
              )}
              {view === "待完成" && completed === 3 && (
                <p className="all-done">
                  <Icon name="check" />
                  所有任务已完成
                </p>
              )}
            </div>
            <div className="project-footer">
              <div
                className="avatar-stack"
                role="img"
                aria-label="三位项目成员"
              >
                <span>林</span>
                <span>陈</span>
                <span>周</span>
              </div>
              <span>一起创造下一种可能</span>
            </div>
          </div>
          <div className="settings-card">
            <h3>项目设置</h3>
            <p className="preview-description">
              试试交互，观察颜色的每一种状态。
            </p>
            <label className="preview-field">
              项目名称
              <Input
                value={name}
                onChange={setName}
                maxlength={32}
                placeholder="给项目起个名字"
              />
            </label>
            <div className="sync-setting">
              <div>
                <strong id="sync-label">同步主题颜色</strong>
                <small>让团队保持相同的视觉语言</small>
              </div>
              <Switch
                value={sync}
                aria-checked={sync}
                onChange={(value) => {
                  if (!value) setFrozenTheme(theme);
                  setSync(Boolean(value));
                }}
                aria-labelledby="sync-label"
              />
            </div>
            <div className="preview-notice">
              <Icon name="check" />
              <div>
                <strong>{sync ? "主题已实时关联" : "自动同步已暂停"}</strong>
                <span>
                  品牌色 <code>{tokens.accent}</code>
                </span>
              </div>
            </div>
            <div className="preview-actions">
              <Button
                theme="primary"
                onClick={() =>
                  notify(`已保存「${name.trim() || "未命名项目"}」的预览设置`)
                }
              >
                保存设置
                <Icon name="arrow" size={16} />
              </Button>
              <Button
                theme="default"
                variant="outline"
                onClick={() => {
                  setName("品牌焕新计划");
                  setSync(true);
                  setTasks([true, true, false]);
                  setView("全部");
                  notify("预览设置已重置");
                }}
              >
                重置
              </Button>
              <Button theme="default" disabled>
                已归档
              </Button>
            </div>
            <p className="preview-contrast">
              <Icon name="check" size={14} />
              品牌色 / 容器对比度{" "}
              {contrastRatio(tokens.accent, tokens.surface).toFixed(2)}:1 · AA
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
