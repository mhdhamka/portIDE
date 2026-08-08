'use client';

import Image from 'next/image';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { VscChevronRight, VscEllipsis, VscClose } from 'react-icons/vsc';
import { motion, AnimatePresence } from 'framer-motion';
import { useTabs } from '@/context/TabsContext';

import styles from '@/styles/Explorer.module.css';

const explorerItems = [
  { name: 'overview.jsx', path: '/', icon: '/logos/next_icon.svg' },
  { name: 'developer.config.php', path: '/config', icon: '/logos/laravel_icon.svg' },
  { name: 'endpoint.js', path: '/endpoint', icon: '/logos/js_icon.svg' },
  { name: 'workspace.tsx', path: '/workspace', icon: '/logos/react_icon.svg' },
  { name: 'changelog.json', path: '/changelog', icon: '/logos/json_icon.svg' },
  { name: 'github.md', path: '/github', icon: '/logos/github_icon.svg' },
];

const Explorer = () => {
  // Collapsible section states matching VS Code look
  const [openEditorsOpen, setOpenEditorsOpen] = useState(true);
  const [vscodeFolderOpen, setVscodeFolderOpen] = useState(true);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { tabs, openTab, closeTab } = useTabs();

  const handleFileClick = (e: React.MouseEvent, path: string, name: string, icon: string) => {
    e.preventDefault();
    openTab({ icon, filename: name, path });
    router.push(path);
  };

  return (
    <aside className={styles.explorer}>
      {/* Explorer Header */}
      <div className={styles.titleContainer}>
        <span className={styles.title}>Explorer</span>
        <VscEllipsis className={styles.headerActionIcon} title="More Actions" />
      </div>

      <div className={styles.treeContainer}>
        
        {/* --- 1. OPEN EDITORS SECTION --- */}
        <div 
          className={styles.heading} 
          onClick={() => setOpenEditorsOpen(!openEditorsOpen)}
        >
          <VscChevronRight
            className={styles.chevron}
            style={openEditorsOpen ? { transform: 'rotate(90deg)' } : {}}
          />
          <span className={styles.folderName}>OPEN EDITORS</span>
        </div>

        <AnimatePresence>
          {openEditorsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div className={styles.files}>
                {tabs.map((tab) => {
                  const isActive = pathname === tab.path;
                  return (
                    <div 
                      key={tab.path} 
                      className={styles.linkWrapper}
                      onClick={(e) => handleFileClick(e, tab.path, tab.filename, tab.icon)}
                    >
                      <div className={`${styles.file} ${isActive ? styles.activeFile : ''}`}>
                        <div className={styles.iconWrapper}>
                          <Image src={tab.icon} alt={tab.filename} height={15} width={15} />
                        </div>
                        <span className={styles.fileName}>{tab.filename}</span>
                        <button 
                          className={styles.closeTabBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            closeTab(tab.path);
                          }}
                        >
                          <VscClose size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* --- 2. VSCODE / PORTFOLIO FOLDER SECTION --- */}
        <div 
          className={styles.heading} 
          onClick={() => setVscodeFolderOpen(!vscodeFolderOpen)}
          style={{ marginTop: '4px' }}
        >
          <VscChevronRight
            className={styles.chevron}
            style={vscodeFolderOpen ? { transform: 'rotate(90deg)' } : {}}
          />
          <span className={styles.folderName}>VSCODE</span>
        </div>

        <AnimatePresence>
          {vscodeFolderOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div className={styles.files}>
                {explorerItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <div 
                      key={item.name} 
                      className={styles.linkWrapper}
                      onClick={(e) => handleFileClick(e, item.path, item.name, item.icon)}
                    >
                      <div className={`${styles.file} ${isActive ? styles.activeFile : ''}`}>
                        <div className={styles.iconWrapper}>
                          <Image src={item.icon} alt={item.name} height={15} width={15} />
                        </div>
                        <span className={styles.fileName}>{item.name}</span>
                        {isActive && <span className={styles.activeIndicator} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* --- 3. OUTLINE SECTION --- */}
        <div 
          className={styles.heading} 
          onClick={() => setOutlineOpen(!outlineOpen)}
          style={{ marginTop: '4px' }}
        >
          <VscChevronRight
            className={styles.chevron}
            style={outlineOpen ? { transform: 'rotate(90deg)' } : {}}
          />
          <span className={styles.folderName}>OUTLINE</span>
        </div>

        <AnimatePresence>
          {outlineOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div className={styles.emptySection}>No symbols found</div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* --- 4. TIMELINE SECTION --- */}
        <div 
          className={styles.heading} 
          onClick={() => setTimelineOpen(!timelineOpen)}
          style={{ marginTop: '4px' }}
        >
          <VscChevronRight
            className={styles.chevron}
            style={timelineOpen ? { transform: 'rotate(90deg)' } : {}}
          />
          <span className={styles.folderName}>TIMELINE</span>
        </div>

        <AnimatePresence>
          {timelineOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div className={styles.emptySection}>Git history timeline active</div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </aside>
  );
};

export default Explorer;