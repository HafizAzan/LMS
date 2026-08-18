type ProgressBarProps = {
  percent: number;
  label?: boolean;
};

export default function ProgressBar({ percent, label = true }: ProgressBarProps) {
  const value = Math.max(0, Math.min(100, Number(percent) || 0));
  return (
    <div className="flex items-center gap-sm">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-container-high">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary-container transition-[width] duration-700 ease-premium"
          style={{ width: `${value}%` }}
        />
      </div>
      {label ? <span className="min-w-[2.5rem] text-label text-on-surface-variant">{value}%</span> : null}
    </div>
  );
}
