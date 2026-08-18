import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
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
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const items = placeholder ? [{ value: '', label: placeholder }, ...options] : options;
  const selected = items.find((item) => item.value === value) || items[0];

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (wrapRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
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

  useLayoutEffect(() => {
    if (!open) return;

    const place = () => {
      const trigger = buttonRef.current;
      const menu = menuRef.current;
      if (!trigger || !menu) return;

      const rect = trigger.getBoundingClientRect();
      const gap = 8;
      const maxHeight = Math.min(288, window.innerHeight - 16);
      const spaceBelow = window.innerHeight - rect.bottom - gap;
      const spaceAbove = rect.top - gap;
      const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;

      menu.style.position = 'fixed';
      menu.style.left = `${rect.left}px`;
      menu.style.width = `${Math.max(rect.width, 180)}px`;
      menu.style.zIndex = '80';
      menu.style.maxHeight = `${openUp ? Math.min(maxHeight, spaceAbove) : Math.min(maxHeight, spaceBelow)}px`;

      if (openUp) {
        menu.style.top = 'auto';
        menu.style.bottom = `${window.innerHeight - rect.top + gap}px`;
      } else {
        menu.style.bottom = 'auto';
        menu.style.top = `${rect.bottom + gap}px`;
      }
    };

    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, items.length]);

  return (
    <div className={cn('flex w-full flex-col gap-base', className)} ref={wrapRef}>
      {label ? <Label>{label}</Label> : null}
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <div className="relative">
        <button
          ref={buttonRef}
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
        {open
          ? createPortal(
              <div
                ref={menuRef}
                id={menuId}
                role="listbox"
                className="overflow-y-auto rounded-2xl border border-outline-variant/80 bg-surface-container-lowest p-xs shadow-lift animate-scale-in"
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
              </div>,
              document.body,
            )
          : null}
      </div>
      {error ? <Text tone="error">{error}</Text> : null}
    </div>
  );
}
