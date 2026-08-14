import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type TextProps = HTMLAttributes<HTMLParagraphElement> & {
  as?: 'p' | 'span';
  muted?: boolean;
  tone?: 'default' | 'muted' | 'error';
  size?: 'sm' | 'md' | 'lg' | 'caption';
  children: ReactNode;
};

const sizes = {
  caption: 'text-caption',
  sm: 'text-sm',
  md: 'text-body',
  lg: 'text-body-lg',
} as const;

export default function Text({
  as: Tag = 'p',
  muted,
  tone = 'default',
  size = 'md',
  className,
  children,
  ...props
}: TextProps) {
  const color =
    tone === 'error'
      ? 'text-error'
      : muted || tone === 'muted'
        ? 'text-on-surface-variant'
        : 'text-on-surface';

  return (
    <Tag className={cn(sizes[size], color, className)} {...props}>
      {children}
    </Tag>
  );
}
