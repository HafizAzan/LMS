import { cn } from '../../lib/cn';

export type TabOption = {
  id: string;
  label: string;
};

type TabsProps = {
  tabs: TabOption[];
  value: string;
  onChange: (id: string) => void;
};

export default function Tabs({ tabs, value, onChange }: TabsProps) {
  return (
    <div className="flex gap-lg overflow-x-auto border-b border-outline-variant/70">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={cn(
            'relative shrink-0 pb-sm capitalize transition-colors duration-200',
            value === tab.id
              ? 'font-semibold text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary'
              : 'text-on-surface-variant hover:text-on-surface',
          )}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
