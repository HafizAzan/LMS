import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: 'h1' | 'h2' | 'h3';
  size?: 'display' | 'headline' | 'title';
  children: ReactNode;
};

const sizes = {
  display: 'text-display',
  headline: 'text-headline',
  title: 'text-title',
} as const;

export default function Heading({
  as: Tag = 'h1',
  size = 'headline',
  className,
  children,
  ...props
}: HeadingProps) {
  return (
    <Tag className={cn('font-display text-on-surface tracking-tight', sizes[size], className)} {...props}>
      {children}
    </Tag>
  );
}
