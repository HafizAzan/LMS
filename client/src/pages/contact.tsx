import { useState, type FormEvent } from 'react';
import Button from '../components/ui/button';
import Heading from '../components/ui/heading';
import Input from '../components/ui/input';
import Modal from '../components/ui/modal';
import Text from '../components/ui/text';
import Textarea from '../components/ui/textarea';

export default function Contact() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setOpen(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="mx-auto max-w-xl space-y-lg">
      <div>
        <Heading size="headline">Contact Support</Heading>
        <Text muted className="mt-sm">
          Questions about courses, billing, or your account? Send us a message.
        </Text>
      </div>
      <form className="space-y-md" onSubmit={handleSubmit}>
        <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} required />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Textarea
          label="Message"
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
        />
        <Button type="submit">Send message</Button>
      </form>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Message sent"
        footer={
          <Button size="sm" onClick={() => setOpen(false)}>
            Close
          </Button>
        }
      >
        <Text>
          Thanks for reaching out. Our support team will reply to your email as soon as possible.
        </Text>
      </Modal>
    </div>
  );
}
