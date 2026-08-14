import { Link } from 'react-router-dom';

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-base">
      <img src="/learnhub-logo.png" alt="" className="h-8 w-8 rounded object-contain" />
      {compact ? null : (
        <span className="font-display text-title text-primary tracking-tight">LearnHub</span>
      )}
    </Link>
  );
}
