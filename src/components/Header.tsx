
"use client";

import Link from 'next/link';
import { useState } from 'react';
import { LogoIcon } from '@/components/icons/LogoIcon';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { HowToModal } from '@/components/HowToModal';

export function Header() {
  const [isHowToModalOpen, setIsHowToModalOpen] = useState(false);

  return (
    <>
      <header className="py-4 px-4 sm:px-6 shadow-md bg-card">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <LogoIcon className="h-8 w-8 sm:h-10 sm:w-10" />
            <h1 className="font-orbitron uppercase tracking-wider text-xl sm:text-2xl font-bold">
              HegGeo
            </h1>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setIsHowToModalOpen(true)}
              className="h-9 w-9"
              aria-label="Open how-to guide"
            >
              <HelpCircle className="h-[1.2rem] w-[1.2rem]" />
            </Button>
            <ThemeSwitcher />
            {/* Future navigation items can go here */}
          </div>
        </div>
      </header>
      <HowToModal isOpen={isHowToModalOpen} onOpenChange={setIsHowToModalOpen} />
    </>
  );
}

