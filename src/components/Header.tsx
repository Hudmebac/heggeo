
"use client";

import Link from 'next/link';
import { useState } from 'react';
import { LogoIcon } from '@/components/icons/LogoIcon';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Button } from '@/components/ui/button';
import { HelpCircle, Settings, LifeBuoy } from 'lucide-react';
import { HowToModal } from '@/components/HowToModal';
import { SOSSetupModal } from '@/components/SOSSetupModal';
import { SOSButton } from '@/components/SOSButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export function Header() {
  const [isHowToModalOpen, setIsHowToModalOpen] = useState(false);
  const [isSOSSetupModalOpen, setIsSOSSetupModalOpen] = useState(false);

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
          <div className="flex items-center gap-2 sm:gap-3">
            <SOSButton onNeedsSetup={() => setIsSOSSetupModalOpen(true)} />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9" aria-label="Open settings and help menu">
                  <Settings className="h-[1.2rem] w-[1.2rem]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsSOSSetupModalOpen(true)}>
                  <LifeBuoy className="mr-2 h-4 w-4" />
                  <span>Configure SOS</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsHowToModalOpen(true)}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>How-to Guide</span>
                </DropdownMenuItem>
                 <DropdownMenuSeparator />
                 <DropdownMenuLabel>Theme</DropdownMenuLabel>
                 <ThemeSwitcher /> {/* ThemeSwitcher itself renders DropdownMenuItems now */}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Removed direct ThemeSwitcher and HelpButton as they are in Dropdown */}
          </div>
        </div>
      </header>
      <HowToModal isOpen={isHowToModalOpen} onOpenChange={setIsHowToModalOpen} />
      <SOSSetupModal isOpen={isSOSSetupModalOpen} onOpenChange={setIsSOSSetupModalOpen} />
    </>
  );
}

