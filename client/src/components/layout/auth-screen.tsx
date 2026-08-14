import type { ReactNode } from 'react';
import AuthIllustration from '../layout/auth-illustration';
import Logo from '../layout/logo';

export default function AuthScreen({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <div className="relative flex h-full min-h-0 w-full flex-col overflow-y-auto bg-surface lg:w-1/2">
        <header className="absolute left-0 top-0 z-10 p-lg md:p-10">
          <Logo />
        </header>
        <div className="flex flex-1 items-center justify-center px-md py-20">{children}</div>
      </div>
      <AuthIllustration />
    </div>
  );
}
