import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';
import Heading from './heading';
import IconButton from './icon-button';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  icon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
};

const sizes = {
  sm: 'max-w-[400px]',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  icon,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-md">
      <button
        type="button"
        className="absolute inset-0 bg-[#121c28]/45 backdrop-blur-[6px]"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          'relative z-10 max-h-[calc(100dvh-2rem)] w-full overflow-y-auto rounded-2xl border border-white/70 bg-surface-container-lowest shadow-lift animate-scale-in',
          sizes[size],
        )}
      >
        <div className="absolute right-sm top-sm">
          <IconButton label="Close" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        <div className={cn('px-xl pb-lg pt-10', icon ? 'pt-8 text-center' : undefined)}>
          {icon ? (
            <div className="mb-lg flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-fixed text-primary shadow-lift">
                {icon}
              </div>
            </div>
          ) : null}
          <Heading as="h2" size="title" id="modal-title" className={icon ? 'text-center' : undefined}>
            {title}
          </Heading>
          <div className={cn('mt-sm', icon ? 'mx-auto max-w-sm' : undefined)}>{children}</div>
        </div>
        {footer ? (
          <div className={cn('px-xl pb-xl', icon ? 'flex flex-col gap-sm' : 'flex justify-end gap-sm')}>
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
