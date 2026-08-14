import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import Button from './ui/button';
import Modal from './ui/modal';
import Text from './ui/text';

type LogoutModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function LogoutModal({ open, onClose }: LogoutModalProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const confirm = async () => {
    await logout();
    onClose();
    navigate('/login');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Leave LearnHub?"
      size="sm"
      icon={<LogOut size={28} strokeWidth={1.75} />}
      footer={
        <>
          <Button className="w-full" onClick={() => void confirm()}>
            Log out
          </Button>
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Stay signed in
          </Button>
        </>
      }
    >
      <Text muted>
        You will be signed out on this device. Your courses and progress stay saved to your account.
      </Text>
    </Modal>
  );
}
