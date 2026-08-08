'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  VscAccount,
  VscSettings,
  VscJson,
  VscCode,
  VscFiles,
  VscSourceControl,
  VscSearch,
  VscExtensions,
  VscCopilot,
  VscSync,
  VscGithubAlt,
  VscServer,
} from 'react-icons/vsc';
import { useTabs } from '@/context/TabsContext';

import styles from '@/styles/Sidebar.module.css';

const fileMapping: Record<string, { filename: string; icon: string }> = {
  '/': { filename: 'overview.jsx', icon: '/logos/next_icon.svg' },
  '/config': { filename: 'developer.config.php', icon: '/logos/laravel_icon.svg' },
  '/endpoint': { filename: 'endpoint.js', icon: '/logos/js_icon.svg' },
  '/workspace': { filename: 'workspace.tsx', icon: '/logos/react_icon.svg' },
  '/changelog': { filename: 'changelog.json', icon: '/logos/json_icon.svg' },
  '/github': { filename: 'github.md', icon: '/logos/github_icon.svg' },
  '/source-control': { filename: 'git.scm', icon: '/logos/json_icon.svg' },
  '/settings': { filename: 'settings.json', icon: '/logos/json_icon.svg' },
  '/chat': { filename: 'copilot.ai', icon: '/logos/json_icon.svg' },
};

interface SidebarProps {
  onToggleSearch?: () => void;
  isSearchOpen?: boolean;
  onToggleCopilot?: () => void;
  isCopilotOpen?: boolean;
  onToggleSourceControl?: () => void;
  isSourceControlOpen?: boolean;
}

const Sidebar = ({ 
  onToggleSearch, 
  isSearchOpen, 
  onToggleCopilot, 
  isCopilotOpen,
  onToggleSourceControl,
  isSourceControlOpen 
}: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { openTab } = useTabs();

  // Dynamic state for badges
  const [badges, setBadges] = useState<Record<string, string | null>>({
    '/source-control': '1', 
    '/endpoint': '3',        
  });

  const sidebarTopItems = [
    { Icon: VscFiles, path: '/', label: 'Explorer' },
    { Icon: VscSearch, path: '/search', label: 'Search (Ctrl+Shift+F)', badge: null, isSearchAction: true },
    { Icon: VscSourceControl, path: '/source-control', label: 'Source Control', badge: badges['/source-control'], isScmAction: true }, 
    { Icon: VscCode, path: '/workspace', label: 'workspace.tsx', badge: null },
    { Icon: VscJson, path: '/changelog', label: 'changelog.json', badge: null },
    { Icon: VscServer, path: '/endpoint', label: 'endpoint.js', badge: badges['/endpoint'] },
    { Icon: VscExtensions, path: '/extensions', label: 'Extensions', badge: '1' },
    { Icon: VscGithubAlt, path: '/github', label: 'github.md', badge: null },
    { Icon: VscCopilot, path: '/chat', label: 'AI Copilot', badge: null, isCopilotAction: true },    
  ];

  const sidebarBottomItems = [
    { Icon: VscAccount, path: '/config', label: 'developer.config.php', badge: null },
    { Icon: VscSync, path: '/sync', label: 'Accounts & Sync', badge: null },
    { Icon: VscSettings, path: '/settings', label: 'Settings', badge: null },
  ];

  const handleNavClick = (
    e: React.MouseEvent, 
    path: string, 
    isSearchAction?: boolean, 
    isCopilotAction?: boolean,
    isScmAction?: boolean
  ) => {
    e.preventDefault();
    
    if (isSearchAction) {
      if (onToggleSearch) {
        onToggleSearch();
      }
      return;
    }

    if (isCopilotAction) {
      if (onToggleCopilot) {
        onToggleCopilot();
      }
      return;
    }

    if (isScmAction) {
      if (onToggleSourceControl) {
        onToggleSourceControl();
      } else {
        router.push(path);
      }
      return;
    }

    if (path === '/sync') {
      alert('Sync & Accounts session active: Portfolio settings synchronized with cloud.');
      return;
    }

    if (badges[path]) {
      setBadges(prev => ({ ...prev, [path]: null }));
    }

    if (fileMapping[path]) {
      openTab({
        icon: fileMapping[path].icon,
        filename: fileMapping[path].filename,
        path: path,
      });
    }
    router.push(path);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarTop}>
        {sidebarTopItems.map(({ Icon, path, label, badge, isSearchAction, isCopilotAction, isScmAction }) => {
          const isActive = 
            (isSearchAction && isSearchOpen) || 
            (isCopilotAction && isCopilotOpen) || 
            (isScmAction && (isSourceControlOpen || pathname === path)) ||
            pathname === path;

          return (
            <div 
              key={path} 
              title={label} 
              className={styles.navLink}
              onClick={(e) => handleNavClick(e, path, isSearchAction, isCopilotAction, isScmAction)}
              style={{ cursor: 'pointer' }}
            >
              <div className={`${styles.iconContainer} ${isActive ? styles.active : ''}`}>
                <Icon
                  size={20}
                  className={`${styles.icon} ${isActive ? styles.iconActive : ''}`}
                />
                {badge && <span className={styles.badge}>{badge}</span>}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className={styles.sidebarBottom}>
        {sidebarBottomItems.map(({ Icon, path, label, badge }) => {
          const isActive = pathname === path;
          return (
            <div 
              key={path} 
              title={label} 
              className={styles.navLink}
              onClick={(e) => handleNavClick(e, path)}
              style={{ cursor: 'pointer' }}
            >
              <div className={`${styles.iconContainer} ${isActive ? styles.active : ''}`}>
                <Icon
                  size={20}
                  className={`${styles.icon} ${isActive ? styles.iconActive : ''}`}
                />
                {badge && <span className={styles.badge}>{badge}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;