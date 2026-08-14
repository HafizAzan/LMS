import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import Label from './label';
import Text from './text';

export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  name?: string;
  icon?: ReactNode;
};

export default function Select({
  label,
  error,
  options,
  placeholder,
  value = '',
  onChange,
  className,
  name,
  icon,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const items = placeholder ? [{ value: '', label: placeholder }, ...options] : options;
  const selected = items.find((item) => item.value === value) || items[0];

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className={cn('flex w-full flex-col gap-base', className)}>
      {label ? <Label>{label}</Label> : null}
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <div className="relative" ref={ref}>
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={menuId}
          className={cn(
            'flex h-12 w-full items-center gap-sm rounded-xl border bg-surface-container-lowest px-md text-left text-label transition-all duration-200',
            open
              ? 'border-primary shadow-[0_0_0_3px_rgba(67,67,213,0.12)]'
              : 'border-outline-variant hover:border-primary/40',
            error ? 'border-error' : undefined,
          )}
          onClick={() => setOpen((current) => !current)}
        >
          {icon ? <span className="text-primary">{icon}</span> : null}
          <span className={cn('min-w-0 flex-1 truncate', value ? 'text-on-surface' : 'text-on-surface-variant')}>
            {selected?.label || placeholder}
          </span>
          <ChevronDown
            size={18}
            className={cn(
              'shrink-0 text-outline transition-transform duration-200',
              open ? 'rotate-180' : undefined,
            )}
          />
        </button>
        {open ? (
          <div
            id={menuId}
            role="listbox"
            className="absolute left-0 top-[calc(100%+8px)] z-50 w-max min-w-full overflow-hidden rounded-2xl border border-outline-variant/80 bg-surface-container-lowest p-xs shadow-[0_18px_50px_rgba(18,28,40,0.14)]"
          >
            {items.map((option) => {
              const active = option.value === value;
              return (
                <button
                  key={option.value || 'all'}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={cn(
                    'flex w-full items-center justify-between gap-sm rounded-xl px-md py-sm text-left text-label transition-colors duration-150',
                    active
                      ? 'bg-primary-fixed font-semibold text-primary'
                      : 'text-on-surface hover:bg-surface-container-low',
                  )}
                  onClick={() => {
                    onChange?.(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                  {active ? <Check size={16} strokeWidth={2.4} /> : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      {error ? <Text tone="error">{error}</Text> : null}
    </div>
  );
}
