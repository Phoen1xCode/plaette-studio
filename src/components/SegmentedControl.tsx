import {
  useId,
  useLayoutEffect,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Radio } from "tdesign-react";

interface Props<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (value: T) => void;
  className?: string;
  size?: "small" | "medium";
}

/** TDesign appearance, with roving focus and the standard radio keyboard model. */
export default function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
  size,
}: Props<T>) {
  const root = useRef<HTMLDivElement>(null);
  const name = useId();
  useLayoutEffect(() => {
    // Move TDesign's tab stop from the label to its native radio input.
    root.current
      ?.querySelectorAll<HTMLInputElement>('input[type="radio"]')
      .forEach((input) => {
        input.tabIndex = input.value === value ? 0 : -1;
      });
  }, [value]);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = options.findIndex((option) => option.value === value);
    let next: number;
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      next = (index + 1) % options.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = (index + options.length - 1) % options.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = options.length - 1;
    else return;
    event.preventDefault();
    event.stopPropagation();
    onChange(options[next]!.value);
    event.currentTarget
      .querySelectorAll<HTMLInputElement>('input[type="radio"]')
      [next]?.focus();
  };
  return (
    <div
      ref={root}
      className={className}
      role="radiogroup"
      aria-label={label}
      onKeyDownCapture={onKeyDown}
    >
      <Radio.Group
        variant="default-filled"
        className={className}
        size={size}
        value={value}
        onChange={(next) => onChange(next as T)}
      >
        {options.map((option) => (
          <Radio.Button
            key={option.value}
            name={name}
            value={option.value}
            {...{ tabIndex: -1 }}
          >
            {option.label}
          </Radio.Button>
        ))}
      </Radio.Group>
    </div>
  );
}
