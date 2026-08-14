import { cn } from '../../lib/cn';

type AvatarProps = {
  name?: string;
  src?: string;
  className?: string;
};

export default function Avatar({ name = '', src, className }: AvatarProps) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={cn('h-10 w-10 rounded-full border border-outline-variant object-cover', className)}
      />
    );
  }

  return (
    <span
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed text-label font-semibold text-primary',
        className,
      )}
    >
      {initials || 'LH'}
    </span>
  );
}
