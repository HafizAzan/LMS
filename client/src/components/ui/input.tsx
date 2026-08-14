import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import Label from './label';
import Text from './text';

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  size?: 'sm' | 'md';
};

export default function Input({
  id,
  label,
  error,
  hint,
  icon,
  size = 'md',
  className,
  ...props
}: InputProps) {
  const inputId = id || props.name;
  return (
    <div className="flex w-full flex-col gap-base">
      {label ? <Label htmlFor={inputId}>{label}</Label> : null}
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-sm top-1/2 -translate-y-1/2 text-outline">
            {icon}
          </span>
        ) : null}
        <input
          id={inputId}
          className={cn(
            'input-field',
            size === 'sm' && '!h-10 text-sm',
            icon ? 'pl-xl' : undefined,
            error ? 'border-error focus:ring-error' : undefined,
            className,
          )}
          aria-invalid={error ? true : undefined}
          {...props}
        />
      </div>
      {error ? <Text tone="error">{error}</Text> : null}
      {!error && hint ? <Text muted>{hint}</Text> : null}
    </div>
  );
}
