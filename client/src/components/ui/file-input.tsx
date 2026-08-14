import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import Label from './label';
import Text from './text';

type FileInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function FileInput({ id, label, error, className, ...props }: FileInputProps) {
  const inputId = id || props.name;
  return (
    <div className="flex w-full flex-col gap-base">
      {label ? <Label htmlFor={inputId}>{label}</Label> : null}
      <input
        id={inputId}
        type="file"
        className={cn(
          'w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-sm py-sm text-sm file:mr-sm file:rounded-lg file:border-0 file:bg-primary file:px-sm file:py-xs file:text-caption file:text-on-primary',
          error && 'border-error',
          className,
        )}
        {...props}
      />
      {error ? <Text tone="error">{error}</Text> : null}
    </div>
  );
}
