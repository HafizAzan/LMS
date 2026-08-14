import type { LabelHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  children: ReactNode;
};

export default function Label({ className, children, ...props }: LabelProps) {
  return (
    <label className={cn('text-label text-on-surface', className)} {...props}>
      {children}
    </label>
  );
}
