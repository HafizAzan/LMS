import { Link } from 'react-router-dom';

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex min-w-0 items-center gap-base">
      <img src="/learnhub-logo.png" alt="" className="h-8 w-8 shrink-0 rounded-lg object-contain" />
      {compact ? null : (
        <span className="truncate font-display text-lg font-semibold tracking-tight text-primary">
          LearnHub
        </span>
      )}
    </Link>
  );
}
