import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import Label from './label';
import Text from './text';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export default function Textarea({ id, label, error, className, ...props }: TextareaProps) {
  const areaId = id || props.name;
  return (
    <div className="flex w-full flex-col gap-base">
      {label ? <Label htmlFor={areaId}>{label}</Label> : null}
      <textarea
        id={areaId}
        className={cn('input-field min-h-28 h-auto py-sm', error && 'border-error', className)}
        {...props}
      />
      {error ? <Text tone="error">{error}</Text> : null}
    </div>
  );
}
