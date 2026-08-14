import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';

type DropdownProps = {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  width?: string;
};

export default function Dropdown({
  trigger,
  children,
  align = 'right',
  width = 'w-80',
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {trigger}
      </div>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className={cn(
            'absolute top-full z-50 mt-base overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest py-xs shadow-lift',
            width,
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          <div onClick={() => setOpen(false)}>{children}</div>
        </div>
      ) : null}
    </div>
  );
}

type ItemProps = {
  children: ReactNode;
  icon?: ReactNode;
  to?: string;
  onClick?: () => void;
  danger?: boolean;
};

export function DropdownItem({ children, icon, to, onClick, danger }: ItemProps) {
  const classes = cn(
    'flex w-full items-center gap-sm px-md py-sm text-left text-label transition-colors duration-200 hover:bg-surface-container-low',
    danger ? 'text-error' : 'text-on-surface',
  );

  if (to) {
    return (
      <Link to={to} role="menuitem" className={classes} onClick={onClick}>
        {icon}
        {children}
      </Link>
    );
  }

  return (
    <button type="button" role="menuitem" className={classes} onClick={onClick}>
      {icon}
      {children}
    </button>
  );
}

export function DropdownHeader({ children }: { children: ReactNode }) {
  return <div className="border-b border-outline-variant px-md py-sm">{children}</div>;
}

export function DropdownEmpty({ children }: { children: ReactNode }) {
  return <p className="px-md py-lg text-center text-sm text-on-surface-variant">{children}</p>;
}
