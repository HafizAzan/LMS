import { useState } from 'react';
import { Bell } from 'lucide-react';
import Dropdown, { DropdownEmpty, DropdownHeader, DropdownItem } from './ui/dropdown';
import IconButton from './ui/icon-button';
import Text from './ui/text';

const initialItems = [
  {
    id: '1',
    title: 'Welcome to LearnHub',
    body: 'Start by exploring a course in the catalog.',
    unread: true,
  },
  {
    id: '2',
    title: 'Keep learning',
    body: 'Your progress is saved automatically after each lesson.',
    unread: true,
  },
];

export default function NotificationMenu() {
  const [items, setItems] = useState(initialItems);
  const unread = items.some((item) => item.unread);

  return (
    <Dropdown
      trigger={
        <IconButton label="Notifications">
          <Bell size={20} />
          {unread ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error" /> : null}
        </IconButton>
      }
    >
      <DropdownHeader>
        <div className="flex items-center justify-between">
          <Text size="sm" className="font-semibold">
            Notifications
          </Text>
          {unread ? (
            <button
              type="button"
              className="text-caption text-primary"
              onClick={() => setItems((prev) => prev.map((item) => ({ ...item, unread: false })))}
            >
              Mark all read
            </button>
          ) : null}
        </div>
      </DropdownHeader>
      {items.length ? (
        items.map((item) => (
          <DropdownItem
            key={item.id}
            onClick={() =>
              setItems((prev) => prev.map((row) => (row.id === item.id ? { ...row, unread: false } : row)))
            }
          >
            <span>
              <span className="block font-medium">{item.title}</span>
              <span className="block text-caption text-on-surface-variant">{item.body}</span>
            </span>
          </DropdownItem>
        ))
      ) : (
        <DropdownEmpty>No notifications yet.</DropdownEmpty>
      )}
    </Dropdown>
  );
}
