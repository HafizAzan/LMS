import { BookOpen, GraduationCap, Sparkles, TrendingUp } from 'lucide-react';
import Heading from '../ui/heading';
import Text from '../ui/text';

export default function AuthIllustration() {
  return (
    <div className="relative hidden h-full min-h-0 overflow-hidden bg-surface-container-low lg:block lg:w-1/2">
      <div className="absolute -left-16 top-20 h-72 w-72 animate-float rounded-full bg-primary/10" />
      <div className="absolute -right-10 bottom-24 h-80 w-80 rounded-full bg-secondary-container/30" />
      <div className="absolute left-1/3 top-1/4 h-40 w-40 rounded-full bg-primary-fixed/80" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-10 px-16">
        <div className="grid grid-cols-2 gap-5">
          <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-surface-container-lowest text-primary shadow-lift">
            <GraduationCap size={44} strokeWidth={1.5} />
          </div>
          <div className="mt-8 flex h-28 w-28 animate-float items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lift">
            <BookOpen size={44} strokeWidth={1.5} />
          </div>
          <div className="-mt-4 flex h-28 w-28 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container shadow-lift">
            <TrendingUp size={44} strokeWidth={1.5} />
          </div>
          <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-surface-container-lowest text-primary shadow-lift">
            <Sparkles size={44} strokeWidth={1.5} />
          </div>
        </div>
        <div className="max-w-sm text-center">
          <Heading as="h2" size="title">
            Learn with focus
          </Heading>
          <Text muted className="mt-sm">
            Courses, progress, and certificates — built for serious learners.
          </Text>
        </div>
      </div>
    </div>
  );
}
