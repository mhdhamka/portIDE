'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VscLayoutSidebarLeft, VscLayoutPanel, VscSearch } from 'react-icons/vsc';
import { useTabs } from '@/context/TabsContext';
import styles from '@/styles/Titlebar.module.css';

interface TitlebarProps {
  onOpenCommandPalette?: () => void;
  onToggleSidebar?: () => void;
  onTogglePanel?: () => void;
  onToggleTerminal?: () => void;
}

const Titlebar = ({ onOpenCommandPalette, onToggleSidebar, onTogglePanel, onToggleTerminal }: TitlebarProps) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { openTab } = useTabs();

  // Global Keyboard listener for Ctrl+Shift+P (Command Palette)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (onOpenCommandPalette) onOpenCommandPalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenCommandPalette]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (menuName: string) => {
    setActiveDropdown(activeDropdown === menuName ? null : menuName);
  };

  const handleFileAction = (filename: string, path: string, icon: string) => {
    setActiveDropdown(null);
    openTab({ icon, filename, path });
    router.push(path);
  };

  const menuConfig: Record<string, Array<{ label: string; shortcut: string; filename?: string; path?: string; icon?: string; action?: () => void }>> = {
    File: [
      { label: 'Open overview.jsx', shortcut: 'Ctrl+1', filename: 'overview.jsx', path: '/', icon: '/logos/next_icon.svg' },
      { label: 'Open developer.config.php', shortcut: 'Ctrl+2', filename: 'developer.config.php', path: '/config', icon: '/logos/laravel_icon.svg' },
      { label: 'Open endpoint.js', shortcut: 'Ctrl+3', filename: 'endpoint.js', path: '/endpoint', icon: '/logos/js_icon.svg' },
      { label: 'Open workspace.tsx', shortcut: 'Ctrl+4', filename: 'workspace.tsx', path: '/workspace', icon: '/logos/react_icon.svg' },
    ],
    Edit: [
      { label: 'Undo', shortcut: 'Ctrl+Z', action: () => alert('Undo action triggered!') },
      { label: 'Redo', shortcut: 'Ctrl+Y', action: () => alert('Redo action triggered!') },
    ],
    View: [
      { label: 'Command Palette...', shortcut: 'Ctrl+Shift+P', action: () => { if (onOpenCommandPalette) onOpenCommandPalette(); } },
      { label: 'Open changelog.json', shortcut: 'Ctrl+5', filename: 'changelog.json', path: '/changelog', icon: '/logos/json_icon.svg' },
      { label: 'Open github.md', shortcut: 'Ctrl+6', filename: 'github.md', path: '/github', icon: '/logos/github_icon.svg' },
    ],
    Go: [
      { label: 'Go to Workspace', shortcut: 'Ctrl+P', filename: 'workspace.tsx', path: '/workspace', icon: '/logos/react_icon.svg' },
      { label: 'Go to About Config', shortcut: 'Ctrl+G', filename: 'developer.config.php', path: '/config', icon: '/logos/laravel_icon.svg' },
    ],
    Run: [
      { label: 'Start Debugging Portfolio', shortcut: 'F5', action: () => alert('Portfolio build is running smoothly under Turbopack!') },
    ],
    Terminal: [
      { 
        label: 'New Integrated Terminal', 
        shortcut: 'Ctrl+`', 
        action: () => {
          if (onToggleTerminal) {
            onToggleTerminal();
          } else if (onTogglePanel) {
            onTogglePanel();
          }
        } 
      },
    ],
    Help: [
      { label: 'Welcome / Overview', shortcut: '', filename: 'overview.jsx', path: '/', icon: '/logos/next_icon.svg' },
      { label: 'GitHub Repository', shortcut: '', action: () => window.open('https://github.com/mhdhamka', '_blank') },
    ]
  };

  const menuItems = Object.keys(menuConfig);

  return (
    <section className={styles.titlebar} ref={menuRef}>
      <div className={styles.leftSection}>
        <Image
          src="/logos/vscode_icon.svg"
          alt="VSCode Icon"
          height={16}
          width={16}
          className={styles.icon}
        />
        <div className={styles.items}>
          {menuItems.map((item) => (
            <div key={item} className={styles.menuWrapper}>
              <p
                onClick={() => handleMenuClick(item)}
                className={`${styles.menuItem} ${activeDropdown === item ? styles.activeMenu : ''}`}
              >
                {item}
              </p>

              {activeDropdown === item && (
                <div className={styles.dropdownMenu}>
                  {menuConfig[item].map((subItem, idx) => (
                    <div 
                      key={idx} 
                      className={styles.dropdownItem} 
                      onClick={() => {
                        setActiveDropdown(null);
                        if (subItem.path && subItem.filename && subItem.icon) {
                          handleFileAction(subItem.filename, subItem.path, subItem.icon);
                        } else if (subItem.action) {
                          subItem.action();
                        }
                      }}
                    >
                      <span>{subItem.label}</span> 
                      {subItem.shortcut && <span className={styles.shortcut}>{subItem.shortcut}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Center Layout Toggles & Quick Search Bar matching VS Code header */}
      <div className={styles.centerSection}>
        <div className={styles.layoutToggles}>
          <button title="Toggle Primary Side Bar (Ctrl+B)" onClick={onToggleSidebar} className={styles.layoutBtn}>
            <VscLayoutSidebarLeft size={15} />
          </button>
          <button title="Toggle Panel (Ctrl+`)" onClick={onTogglePanel} className={styles.layoutBtn}>
            <VscLayoutPanel size={15} />
          </button>
        </div>

        <div 
          className={styles.searchBarContainer} 
          onClick={() => { if (onOpenCommandPalette) onOpenCommandPalette(); }}
          title="Open Command Palette (Ctrl+Shift+P)"
        >
          <VscSearch size={13} className={styles.searchIcon} />
          <span className={styles.searchPlaceholder}>portIDE - Type or press Ctrl+Shift+P</span>
        </div>
      </div>

      <div className={styles.windowButtons}>
        <span className={styles.minimize} title="Minimize" onClick={() => alert('Window minimized!')} />
        <span className={styles.maximize} title="Maximize" onClick={() => alert('Fullscreen toggled!')} />
        <span className={styles.close} title="Close" onClick={() => alert("Can't close portfolio! You're stuck here admiring the code 😉")} />
      </div>
    </section>
  );
};

export default Titlebar;