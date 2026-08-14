import { Menu, Search } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context.tsx';
import NotificationMenu from '../notification-menu.tsx';
import ProfileMenu from '../profile-menu.tsx';
import Button from '../ui/button.tsx';
import IconButton from '../ui/icon-button.tsx';
import Input from '../ui/input.tsx';
import Logo from './logo.tsx';

type HeaderProps = {
  onMenu: () => void;
};

export default function Header({ onMenu }: HeaderProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/courses?search=${encodeURIComponent(value)}` : '/courses');
  };

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-outline-variant bg-surface-container-lowest px-md py-md md:px-xl">
      <div className="flex min-h-12 items-center justify-between gap-md">
        <div className="flex min-w-0 flex-1 items-center gap-md">
          <IconButton label="Open menu" className="lg:hidden" onClick={onMenu}>
            <Menu size={20} />
          </IconButton>
          <div className="lg:hidden">
            <Logo />
          </div>
          <form onSubmit={handleSearch} className="hidden max-w-md flex-1 md:block">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search courses..."
              aria-label="Search courses"
              icon={<Search size={18} />}
              size="sm"
              className="rounded-full"
            />
          </form>
        </div>
        <div className="flex items-center gap-sm">
          {isAuthenticated ? (
            <>
              <NotificationMenu />
              <ProfileMenu />
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" to="/login">
                Sign In
              </Button>
              <Button size="sm" to="/register">
                Join LearnHub
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
