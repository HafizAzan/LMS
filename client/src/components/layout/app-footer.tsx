import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Compass,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  PlusCircle,
  Shield,
  Trophy,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/auth-context.tsx';
import Text from '../ui/text.tsx';
import Logo from './logo.tsx';

type FooterLink = {
  to: string;
  label: string;
  icon: LucideIcon;
};

const learnLinks: FooterLink[] = [
  { to: '/courses', label: 'Explore courses', icon: Compass },
  { to: '/my-learning', label: 'My learning', icon: BookOpen },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

const instructorLinks: FooterLink[] = [
  { to: '/instructor', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/instructor/courses', label: 'My courses', icon: BookOpen },
  { to: '/instructor/courses/new', label: 'Create a course', icon: PlusCircle },
];

const supportLinks: FooterLink[] = [
  { to: '/contact', label: 'Contact support', icon: Mail },
  { to: '/privacy', label: 'Privacy policy', icon: Shield },
  { to: '/terms', label: 'Terms of service', icon: LifeBuoy },
];

export default function Footer() {
  const { user } = useAuth();
  const year = new Date().getFullYear();
  const platform = user?.role === 'instructor' ? instructorLinks : learnLinks;

  return (
    <footer className="mt-auto shrink-0 border-t border-outline-variant bg-surface-container-lowest">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-xl px-md py-xxl md:px-xl">
        <div className="grid gap-xl sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div className="max-w-sm space-y-md">
            <Logo />
            <Text muted>
              Courses, progress, and certificates — a focused place to learn and
              teach.
            </Text>
          </div>
          <FooterColumn
            title={user?.role === 'instructor' ? 'Teach' : 'Learn'}
            links={platform}
          />
          <FooterColumn title="Support" links={supportLinks} />
        </div>
        <Text muted size="caption">
          © {year} LearnHub. All rights reserved. Built for students and instructors.
        </Text>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <p className="mb-md font-display text-label tracking-wide text-on-surface">
        {title}
      </p>
      <ul className="space-y-sm">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className="inline-flex items-center gap-sm text-sm text-on-surface-variant transition-colors duration-200 hover:text-primary"
              >
                <Icon size={16} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
