
import type { Metadata } from 'next';
import { Inter, Orbitron } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const orbitronFont = Orbitron({ 
  variable: '--font-orbitron',
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
});

export const metadata: Metadata = {
  title: 'HegGeo',
  description: 'Drop time-limited Geos and share your location.',
  icons: {
    icon: '/favicon.ico',
  },
};

// Function to safely stringify for dangerouslySetInnerHTML
const safelySetInnerHTML = (scriptContent: string) => {
  return { __html: scriptContent.replace(/</g, '\\u003c') };
};

const ThemeInitializationScript = () => (
  <script
    dangerouslySetInnerHTML={safelySetInnerHTML(`
      (function() {
        const THEME_STORAGE_KEY = 'heggeo-theme';
        function getInitialTheme() {
          try {
            const persistedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
            if (persistedTheme && ["light", "dark", "hc-light", "hc-dark"].includes(persistedTheme)) {
              return persistedTheme;
            }
          } catch (e) { /* localStorage may be disabled or inaccessible */ }
          
          // Fallback to system preference if enabled, otherwise 'light'
          // const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          // if (systemPrefersDark) return 'dark';

          return 'light'; // Default theme
        }
        const theme = getInitialTheme();
        const root = document.documentElement;
        root.classList.remove('light', 'dark', 'hc-light', 'hc-dark'); // Clear any existing
        if (theme !== 'light') { // 'light' is default, no class needed unless specific styles depend on .light
            root.classList.add(theme);
        }
        // console.log('Initial theme applied by script:', theme);
      })();
    `)}
  />
);


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeInitializationScript />
        {/* The favicon.ico file should be placed in the 'public' folder */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body 
        className={`${inter.variable} ${orbitronFont.variable} antialiased`}
        suppressHydrationWarning // Added to mitigate browser extension issues
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

