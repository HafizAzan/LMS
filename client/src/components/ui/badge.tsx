import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type BadgeProps = {
  children: ReactNode;
  tone?: 'primary' | 'accent' | 'neutral';
  className?: string;
};

export default function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  const tones = {
    primary: 'bg-primary-fixed text-on-primary-fixed-variant',
    accent: 'bg-secondary-fixed text-on-secondary-container',
    neutral: 'bg-surface-container text-on-surface-variant',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-sm py-xs text-caption uppercase tracking-wide',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
