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
    <div className="flex gap-lg border-b border-outline-variant">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={cn(
            'pb-sm capitalize',
            value === tab.id
              ? 'border-b-2 border-primary font-semibold text-primary'
              : 'text-on-surface-variant',
          )}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
