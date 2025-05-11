
"use client";

import type { Theme } from '@/lib/types';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sun, Moon, Contrast } from 'lucide-react'; // Added Contrast icon

export function ThemeSwitcher() {
  const { setTheme, theme, isMounted } = useTheme();

  if (!isMounted) {
    // Render a placeholder or null during SSR/before hydration to prevent mismatch
    // For simplicity, just rendering a disabled button placeholder.
    return (
      <Button variant="outline" size="icon" disabled className="h-9 w-9">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="mr-2 h-4 w-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="mr-2 h-4 w-4" /> },
    { value: 'hc-light', label: 'High Contrast Light', icon: <Contrast className="mr-2 h-4 w-4" /> },
    { value: 'hc-dark', label: 'High Contrast Dark', icon: <Contrast className="mr-2 h-4 w-4" /> },
  ];

  const currentThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="h-[1.2rem] w-[1.2rem]" />;
      case 'dark': return <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 scale-100 transition-all dark:rotate-0 dark:scale-100" />;
      case 'hc-light': return <Contrast className="h-[1.2rem] w-[1.2rem]" />;
      case 'hc-dark': return <Contrast className="h-[1.2rem] w-[1.2rem]" />;
      default: return <Sun className="h-[1.2rem] w-[1.2rem]" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          {currentThemeIcon()}
          <span className="sr-only">Toggle theme ({theme})</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((item) => (
          <DropdownMenuItem key={item.value} onClick={() => setTheme(item.value)} aria-selected={theme === item.value}>
            {item.icon}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
