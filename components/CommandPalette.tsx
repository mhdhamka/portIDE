'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  VscSymbolColor, 
  VscTerminal, 
  VscGoToFile, 
  VscColorMode, 
  VscArrowLeft,
  VscCopilot
} from 'react-icons/vsc';
import { MdNavigateNext } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

import { THEMES } from '@/lib/themes';
import { useTabs } from '@/context/TabsContext';
import styles from '@/styles/CommandPalette.module.css';

interface Command {
  id: string;
  label: string;
  category: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleTerminal: () => void;
  isTerminalOpen: boolean;
  onToggleCopilot?: () => void;
  isCopilotOpen?: boolean;
}

const CommandPalette = ({ isOpen, onClose, onToggleTerminal, isTerminalOpen, onToggleCopilot, isCopilotOpen }: CommandPaletteProps) => {
  const router = useRouter();
  const { openTab } = useTabs();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const getCommands = useCallback((): Command[] => {
    return [
      {
        id: 'file-overview',
        label: 'overview.jsx',
        category: 'Workspace Files',
        shortcut: 'G H',
        icon: <Image src="/logos/next_icon.svg" alt="overview" width={16} height={16} />,
        action: () => {
          openTab({ icon: '/logos/next_icon.svg', filename: 'overview.jsx', path: '/' });
          router.push('/');
        },
      },
      {
        id: 'file-config',
        label: 'developer.config.php',
        category: 'Workspace Files',
        shortcut: 'G A',
        icon: <Image src="/logos/laravel_icon.svg" alt="config" width={16} height={16} />,
        action: () => {
          openTab({ icon: '/logos/laravel_icon.svg', filename: 'developer.config.php', path: '/config' });
          router.push('/config');
        },
      },
      {
        id: 'file-endpoint',
        label: 'endpoint.js',
        category: 'Workspace Files',
        shortcut: 'G C',
        icon: <Image src="/logos/js_icon.svg" alt="endpoint" width={16} height={16} />,
        action: () => {
          openTab({ icon: '/logos/js_icon.svg', filename: 'endpoint.js', path: '/endpoint' });
          router.push('/endpoint');
        },
      },
      {
        id: 'file-workspace',
        label: 'workspace.tsx',
        category: 'Workspace Files',
        shortcut: 'G P',
        icon: <Image src="/logos/react_icon.svg" alt="workspace" width={16} height={16} />,
        action: () => {
          openTab({ icon: '/logos/react_icon.svg', filename: 'workspace.tsx', path: '/workspace' });
          router.push('/workspace');
        },
      },
      {
        id: 'file-changelog',
        label: 'changelog.json',
        category: 'Workspace Files',
        shortcut: 'G R',
        icon: <Image src="/logos/json_icon.svg" alt="changelog" width={16} height={16} />,
        action: () => {
          openTab({ icon: '/logos/json_icon.svg', filename: 'changelog.json', path: '/changelog' });
          router.push('/changelog');
        },
      },
      {
        id: 'file-github',
        label: 'github.md',
        category: 'Workspace Files',
        shortcut: 'G G',
        icon: <Image src="/logos/github_icon.svg" alt="github" width={16} height={16} />,
        action: () => {
          openTab({ icon: '/logos/github_icon.svg', filename: 'github.md', path: '/github' });
          router.push('/github');
        },
      },
      {
        id: 'toggle-copilot',
        label: isCopilotOpen ? 'Close AI Copilot Assistant' : 'Open AI Copilot Assistant',
        category: 'Artificial Intelligence',
        shortcut: 'Ctrl+Shift+I',
        icon: <VscCopilot size={16} color="#06b6d4" />,
        action: () => {
          if (onToggleCopilot) onToggleCopilot();
        },
      },
      {
        id: 'toggle-terminal',
        label: isTerminalOpen ? 'Close Terminal' : 'Open Terminal',
        category: 'Terminal',
        shortcut: 'Ctrl+`',
        icon: <VscTerminal size={16} />,
        action: onToggleTerminal,
      },
      {
        id: 'change-theme',
        label: 'Change Color Theme',
        category: 'Preferences',
        shortcut: 'K T',
        icon: <VscSymbolColor size={16} />,
        action: () => {
          setShowThemePicker(true);
          setSearchQuery('');
        },
      },
    ];
  }, [router, openTab, onToggleTerminal, isTerminalOpen, onToggleCopilot, isCopilotOpen]);

  const commands = getCommands();

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredThemes = THEMES.filter((theme) =>
    theme.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = useCallback(
    (index: number) => {
      if (showThemePicker) {
        if (index < filteredThemes.length) {
          const theme = filteredThemes[index];
          document.documentElement.setAttribute('data-theme', theme.theme);
          localStorage.setItem('theme', theme.theme);
          onClose();
        }
      } else {
        if (index < filteredCommands.length) {
          filteredCommands[index].action();
          if (filteredCommands[index].id !== 'change-theme') {
            onClose();
          }
        }
      }
    },
    [filteredCommands, filteredThemes, onClose, showThemePicker]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        if (showThemePicker) {
          setShowThemePicker(false);
          setSearchQuery('');
          setSelectedIndex(0);
        } else {
          onClose();
        }
        return;
      }

      const items = showThemePicker ? filteredThemes : filteredCommands;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % items.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSelect(selectedIndex);
      }
    },
    [isOpen, onClose, filteredCommands, filteredThemes, selectedIndex, handleSelect, showThemePicker]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSearchQuery('');
      setSelectedIndex(0);
      setShowThemePicker(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, showThemePicker]);

  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className={styles.overlay} onClick={onClose}>
        <motion.div 
          className={styles.container} 
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.inputWrapper}>
            {showThemePicker ? (
              <button 
                className={styles.backButton}
                onClick={() => {
                  setShowThemePicker(false);
                  setSearchQuery('');
                }}
                title="Back to Files"
              >
                <VscArrowLeft size={16} />
              </button>
            ) : (
              <VscGoToFile size={20} className={styles.inputIcon} />
            )}
            
            {showThemePicker && <span className={styles.breadcrumbBadge}>Preferences</span>}

            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={showThemePicker ? 'Search color themes...' : 'Search files, AI Copilot, or commands...'}
              className={styles.input}
              spellCheck={false}
              autoComplete="off"
            />
            
            {searchQuery && (
              <button
                className={styles.clearButton}
                onClick={() => {
                  setSearchQuery('');
                  inputRef.current?.focus();
                }}
              >
                ×
              </button>
            )}
          </div>

          <div className={styles.results} ref={listRef}>
            {showThemePicker ? (
              filteredThemes.length === 0 ? (
                <div className={styles.noResults}>No matching themes found</div>
              ) : (
                <>
                  <div className={styles.category}>Select Color Theme</div>
                  {filteredThemes.map((theme, index) => (
                    <div
                      key={theme.theme}
                      className={`${styles.item} ${selectedIndex === index ? styles.selected : ''}`}
                      onClick={() => handleSelect(index)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className={styles.itemIcon}>
                        <VscColorMode size={16} />
                      </div>
                      <div className={styles.itemContent}>
                        <span className={styles.itemLabel}>{theme.name}</span>
                        <span className={styles.itemDescription}>Published by {theme.publisher}</span>
                      </div>
                    </div>
                  ))}
                </>
              )
            ) : filteredCommands.length === 0 ? (
              <div className={styles.noResults}>No matching files or commands found</div>
            ) : (
              (() => {
                let lastCategory = '';
                let itemIndex = 0;
                return filteredCommands.map((cmd) => {
                  const showCategory = cmd.category !== lastCategory;
                  lastCategory = cmd.category;
                  const currentIndex = itemIndex++;
                  return (
                    <div key={cmd.id}>
                      {showCategory && (
                        <div className={styles.category}>{cmd.category}</div>
                      )}
                      <div
                        className={`${styles.item} ${selectedIndex === currentIndex ? styles.selected : ''}`}
                        onClick={() => handleSelect(currentIndex)}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                      >
                        <div className={styles.itemIcon}>{cmd.icon}</div>
                        <div className={styles.itemContent}>
                          <span className={styles.itemLabel}>{cmd.label}</span>
                        </div>
                        {cmd.shortcut && (
                          <div className={styles.shortcut}>
                            {cmd.id === 'change-theme' ? (
                              <MdNavigateNext size={16} />
                            ) : (
                              cmd.shortcut.split(' ').map((key, i) => (
                                <span key={i} className={styles.key}>
                                  {key}
                                </span>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()
            )}
          </div>

          <div className={styles.footer}>
            <div className={styles.footerItem}>
              <span className={styles.key}>↑</span> <span className={styles.key}>↓</span> navigate
            </div>
            <div className={styles.footerItem}>
              <span className={styles.key}>↵</span> select action
            </div>
            <div className={styles.footerItem}>
              <span className={styles.key}>esc</span> close
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommandPalette;