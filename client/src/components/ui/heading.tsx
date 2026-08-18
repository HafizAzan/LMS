import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: 'h1' | 'h2' | 'h3';
  size?: 'display' | 'headline' | 'title' | 'subtitle';
  children: ReactNode;
};

const sizes = {
  display: 'text-[2rem] leading-tight md:text-display',
  headline: 'text-[1.75rem] leading-tight md:text-headline',
  title: 'text-xl leading-snug md:text-title',
  subtitle: 'text-lg font-semibold leading-snug',
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
