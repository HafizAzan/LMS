import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: 'div' | 'article' | 'section';
  hover?: boolean;
  padding?: boolean;
  children?: ReactNode;
};

export default function Card({
  as: Tag = 'div',
  hover,
  padding = true,
  className,
  ...props
}: CardProps) {
  return (
    <Tag className={cn('card min-w-0', padding && 'p-lg', hover && 'card-hover', className)} {...props} />
  );
}
