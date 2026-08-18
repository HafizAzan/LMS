import {
  BarChart3,
  BookOpen,
  Compass,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/auth-context';
import { cn } from '../../lib/cn';
import LogoutModal from '../logout-modal';
import IconButton from '../ui/icon-button';
import Logo from './logo';

type NavItem = {
  to: string;
  label: string;
  icon: typeof Compass;
};

const studentLinks: NavItem[] = [
  { to: '/courses', label: 'Explore', icon: Compass },
  { to: '/my-learning', label: 'My Learning', icon: BookOpen },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

const instructorLinks: NavItem[] = [
  { to: '/instructor', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/instructor/courses', label: 'My Courses', icon: BookOpen },
  { to: '/instructor/courses/new', label: 'Create Course', icon: PlusCircle },
  { to: '/instructor/students', label: 'Students', icon: Users },
  { to: '/instructor/analytics', label: 'Analytics', icon: BarChart3 },
];

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const links = user?.role === 'instructor' ? instructorLinks : studentLinks;

  return (
    <>
      <button
        type="button"
        className={cn(
          'fixed inset-0 z-40 bg-on-surface/35 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-label="Close menu"
        onClick={onClose}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-svh w-[272px] shrink-0 flex-col border-r border-outline-variant/70 bg-surface-container-lowest/95 px-sm py-lg shadow-soft backdrop-blur-xl transition-transform duration-300 ease-premium lg:static lg:translate-x-0 lg:shadow-none',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="mb-lg flex items-center justify-between px-sm">
          <div className="min-w-0">
            <Logo />
            <p className="mt-xs px-base text-caption text-on-surface-variant">
              {user?.role === 'instructor' ? 'Instructor Portal' : 'Student Portal'}
            </p>
          </div>
          <IconButton label="Close" className="lg:hidden" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        <nav className="flex min-h-0 flex-1 flex-col gap-xs overflow-y-auto px-xs">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'relative flex items-center gap-sm rounded-xl px-md py-sm text-label text-on-surface-variant transition-all duration-200 ease-premium hover:bg-surface-container-high hover:text-primary',
                    isActive && 'bg-primary/10 font-semibold text-primary shadow-[inset_3px_0_0_0_#4343d5]',
                  )
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        {user ? (
          <button
            type="button"
            className="mt-md flex items-center gap-sm rounded-xl px-md py-sm text-label text-on-surface-variant transition-colors duration-200 hover:bg-surface-container-high hover:text-primary"
            onClick={() => setConfirmOpen(true)}
          >
            <LogOut size={18} />
            Log out
          </button>
        ) : null}
      </aside>
      <LogoutModal open={confirmOpen} onClose={() => setConfirmOpen(false)} />
    </>
  );
}
