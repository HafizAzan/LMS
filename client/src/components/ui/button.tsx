import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
} as const;

const sizes = {
  sm: '!h-10 px-sm text-caption',
  md: 'h-12',
  lg: '!h-14 px-lg',
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  to?: string;
  children?: ReactNode;
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  to,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(variants[variant], sizes[size], className);

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
