import Link from 'next/link';
import { LogoIcon } from '@/components/icons/LogoIcon';

export function Header() {
  return (
    <header className="py-4 px-4 sm:px-6 shadow-md bg-card">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <LogoIcon className="h-8 w-8 sm:h-10 sm:w-10" />
          <h1 className="font-orbitron uppercase tracking-wider text-xl sm:text-2xl font-bold">
            HegGeo
          </h1>
        </Link>
        {/* Future navigation items can go here */}
      </div>
    </header>
  );
}
