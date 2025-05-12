
"use client";

import type { Theme } from '@/lib/types';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import {
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'; // Only DropdownMenuItem needed if used within another menu
import { Sun, Moon, Contrast, Settings } from 'lucide-react'; // Added Settings for a potential combined button

// This component now assumes it's part of an existing DropdownMenu.
// If it needs to be a standalone button that opens its own dropdown,
// the DropdownMenu, DropdownMenuTrigger, DropdownMenuContent structure
// would need to be here. For integration into Header's Dropdown, this is fine.

export function ThemeSwitcher() {
  const { setTheme, theme, isMounted } = useTheme();

  // When not mounted, perhaps render nothing or placeholders if these are direct menu items.
  // If they are part of a dropdown, the dropdown will handle its own trigger visibility.
  if (!isMounted) {
    // Placeholder items if needed, or the parent DropdownMenu handles the trigger state
    return (
      <>
        <DropdownMenuItem disabled>
          <Sun className="mr-2 h-4 w-4" /> Loading...
        </DropdownMenuItem>
      </>
    );
  }

  const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="mr-2 h-4 w-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="mr-2 h-4 w-4" /> },
    { value: 'hc-light', label: 'High Contrast Light', icon: <Contrast className="mr-2 h-4 w-4" /> },
    { value: 'hc-dark', label: 'High Contrast Dark', icon: <Contrast className="mr-2 h-4 w-4" /> },
  ];

  // No longer needs its own DropdownMenuTrigger or DropdownMenuContent
  // Renders DropdownMenuItems directly
  return (
    <>
      {themes.map((item) => (
        <DropdownMenuItem key={item.value} onClick={() => setTheme(item.value)} aria-selected={theme === item.value}>
          {item.icon}
          {item.label}
          {theme === item.value && <span className="ml-auto text-xs">(Active)</span>}
        </DropdownMenuItem>
      ))}
    </>
  );
}
