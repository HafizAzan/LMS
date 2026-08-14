import LegalPage from '../components/legal-page';
import Text from '../components/ui/text';

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="August 15, 2026">
      <Text muted>
        LearnHub collects the account details you provide at registration (name, email, and role) so we can
        create your profile, enroll you in courses, and issue certificates.
      </Text>
      <Text muted>
        Course progress, quiz scores, and payment records are stored to operate the learning platform. We do
        not sell personal data. Stripe processes paid enrollments; we only keep the enrollment outcome and
        amount.
      </Text>
      <Text muted>
        You can request account deletion by contacting support. We retain records only as long as needed to
        provide the service or meet legal obligations.
      </Text>
    </LegalPage>
  );
}
