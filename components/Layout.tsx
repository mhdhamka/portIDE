'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import Titlebar from '@/components/Titlebar';
import Sidebar from '@/components/Sidebar';
import Explorer from '@/components/Explorer';
import SearchSidebar from '@/components/SearchSidebar';
import AiCopilotSidebar from '@/components/AiCopilotSidebar';
import Bottombar from '@/components/Bottombar';
import Tabsbar from '@/components/Tabsbar';
import Terminal from '@/components/Terminal';
import CommandPalette from '@/components/CommandPalette';
import { TabsProvider } from '@/context/TabsContext';

import styles from '@/styles/Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

export type SidebarView = 'explorer' | 'search' | 'extensions';

const Layout = ({ children }: LayoutProps) => {
  const pathname = usePathname();
  const router = useRouter();
  
  // Unified Sidebar View & Panel States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<SidebarView>('explorer');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [chordKey, setChordKey] = useState<string | null>(null);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const toggleSearch = useCallback(() => {
    setIsSearchOpen(prev => {
      const next = !prev;
      if (next) {
        if (!isSidebarOpen) setIsSidebarOpen(true);
        setActiveView('search');
        if (isCopilotOpen) setIsCopilotOpen(false);
      } else {
        setActiveView('explorer');
      }
      return next;
    });
  }, [isSidebarOpen, isCopilotOpen]);

  const toggleSourceControl = useCallback(() => {
    router.push('/source-control');
  }, [router]);

  const toggleCopilot = useCallback(() => {
    setIsCopilotOpen(prev => {
      const next = !prev;
      if (next && isSearchOpen) {
        setIsSearchOpen(false);
      }
      return next;
    });
  }, [isSearchOpen]);

  const toggleTerminal = useCallback(() => {
    setIsTerminalOpen(prev => !prev);
  }, []);

  const openCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(true);
  }, []);

  const closeCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(false);
  }, []);

  useEffect(() => {
    const main = document.getElementById('main-editor');
    if (main) {
      main.scrollTop = 0;
    }
  }, [pathname]);

  useEffect(() => {
    const navigationRoutes: Record<string, string> = {
      'h': '/',
      'a': '/config',
      'p': '/workspace',
      'r': '/changelog',
      'c': '/endpoint',
      'g': '/github',
      's': '/settings',
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCommandPaletteOpen) return;

      // Ctrl+B to toggle Sidebar
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      // Ctrl+Shift+F to toggle Search Panel
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleSearch();
        return;
      }

      // Ctrl+Shift+G to open Source Control view
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        router.push('/source-control');
        return;
      }

      // Ctrl+` to toggle Terminal
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        toggleTerminal();
        return;
      }

      // Ctrl+Shift+P to open Command Palette
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        openCommandPalette();
        return;
      }

      const key = e.key.toLowerCase();

      if (chordKey === 'g' && navigationRoutes[key]) {
        e.preventDefault();
        router.push(navigationRoutes[key]);
        setChordKey(null);
        setIsSearchOpen(false);
        return;
      }

      if (chordKey === 'k' && key === 't') {
        e.preventDefault();
        openCommandPalette();
        setChordKey(null);
        return;
      }

      if ((key === 'g' || key === 'k') && !(e.target instanceof Element && e.target.closest('input, textarea'))) {
        e.preventDefault();
        setChordKey(key);
        setTimeout(() => setChordKey(null), 2000);
        return;
      }

      if (chordKey && key !== chordKey) {
        setChordKey(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar, toggleSearch, toggleTerminal, openCommandPalette, chordKey, router, isCommandPaletteOpen]);

  return (
    <TabsProvider>
      <div className={styles.layout}>
        <Titlebar 
          onOpenCommandPalette={openCommandPalette} 
          onToggleSidebar={toggleSidebar}
          onTogglePanel={toggleTerminal}
        />
        <div className={styles.main}>
          {isSidebarOpen && (
            <>
              <Sidebar 
                onToggleSearch={toggleSearch} 
                isSearchOpen={isSearchOpen}
                onToggleCopilot={toggleCopilot}
                isCopilotOpen={isCopilotOpen}
                onToggleSourceControl={toggleSourceControl}
              />
              {activeView === 'search' && isSearchOpen ? <SearchSidebar /> : <Explorer />}
            </>
          )}
          <div className={styles.editorContainer}>
            <Tabsbar />
            <div className={styles.editorWithTerminal}>
              <main id="main-editor" className={styles.content}>
                {children}
              </main>
              {isTerminalOpen && <Terminal onToggle={toggleTerminal} />}
            </div>
          </div>
          {isCopilotOpen && <AiCopilotSidebar onClose={() => setIsCopilotOpen(false)} />}
        </div>
        <Bottombar 
          onTerminalToggle={toggleTerminal} 
          isTerminalOpen={isTerminalOpen} 
          onCopilotToggle={toggleCopilot}
          isCopilotOpen={isCopilotOpen}
        />
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={closeCommandPalette}
          onToggleTerminal={toggleTerminal}
          isTerminalOpen={isTerminalOpen}
          onToggleCopilot={toggleCopilot}
          isCopilotOpen={isCopilotOpen}
        />
      </div>
    </TabsProvider>
  );
};

export default Layout;