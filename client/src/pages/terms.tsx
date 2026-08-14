import LegalPage from '../components/legal-page';
import Text from '../components/ui/text';

export default function Terms() {
  return (
    <LegalPage title="Terms of Service" updated="August 15, 2026">
      <Text muted>
        By creating a LearnHub account you agree to use the platform for lawful learning and teaching. Course
        content belongs to its instructors. Students receive a personal license to access enrolled material.
      </Text>
      <Text muted>
        Paid courses are billed through Stripe. Refunds follow the payment provider and instructor policy.
        LearnHub may suspend accounts that abuse the service, share login credentials, or upload infringing
        content.
      </Text>
      <Text muted>
        The platform is provided as-is. We work to keep it available, but we do not guarantee uninterrupted
        access.
      </Text>
    </LegalPage>
  );
}
