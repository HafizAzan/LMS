import type { ReactNode } from 'react';
import Heading from './ui/heading';
import Text from './ui/text';

type LegalPageProps = {
  title: string;
  updated: string;
  children: ReactNode;
};

export default function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <article className="mx-auto max-w-3xl space-y-lg">
      <div>
        <Heading size="headline">{title}</Heading>
        <Text muted className="mt-sm">
          Last updated {updated}
        </Text>
      </div>
      <div className="space-y-md">{children}</div>
    </article>
  );
}
