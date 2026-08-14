import { BookOpen, LayoutDashboard, LifeBuoy, LogOut, Shield, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/auth-context';
import LogoutModal from './logout-modal';
import Avatar from './ui/avatar';
import Dropdown, { DropdownHeader, DropdownItem } from './ui/dropdown';
import Text from './ui/text';

export default function ProfileMenu() {
  const { user } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  if (!user) return null;

  const home = user.role === 'instructor' ? '/instructor' : '/my-learning';

  return (
    <>
      <Dropdown
        width="w-72"
        trigger={
          <button type="button" aria-label="Account menu" className="rounded-full">
            <Avatar name={user.name} src={user.avatar} />
          </button>
        }
      >
        <DropdownHeader>
          <Text className="font-semibold">{user.name}</Text>
          <Text muted size="caption">
            {user.email}
          </Text>
          <Text muted size="caption" className="capitalize">
            {user.role}
          </Text>
        </DropdownHeader>
        <DropdownItem to={home} icon={user.role === 'instructor' ? <LayoutDashboard size={16} /> : <BookOpen size={16} />}>
          {user.role === 'instructor' ? 'Dashboard' : 'My learning'}
        </DropdownItem>
        <DropdownItem to="/courses" icon={<UserRound size={16} />}>
          Browse courses
        </DropdownItem>
        <DropdownItem to="/privacy" icon={<Shield size={16} />}>
          Privacy
        </DropdownItem>
        <DropdownItem to="/contact" icon={<LifeBuoy size={16} />}>
          Contact support
        </DropdownItem>
        <DropdownItem danger onClick={() => setConfirmOpen(true)} icon={<LogOut size={16} />}>
          Log out
        </DropdownItem>
      </Dropdown>
      <LogoutModal open={confirmOpen} onClose={() => setConfirmOpen(false)} />
    </>
  );
}
