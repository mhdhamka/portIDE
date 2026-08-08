'use client';

import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { VscClose } from 'react-icons/vsc';
import { useTabs } from '@/context/TabsContext';
import styles from '@/styles/Tabsbar.module.css';

const Tabsbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { tabs, closeTab } = useTabs();

  const handleCloseTab = (e: React.MouseEvent, pathToRemove: string) => {
    e.stopPropagation();
    e.preventDefault();

    const targetIndex = tabs.findIndex(tab => tab.path === pathToRemove);
    closeTab(pathToRemove);

    if (pathname === pathToRemove) {
      const remainingTabs = tabs.filter(tab => tab.path !== pathToRemove);
      if (remainingTabs.length > 0) {
        const nextIndex = targetIndex > 0 ? targetIndex - 1 : 0;
        router.push(remainingTabs[nextIndex].path);
      } else {
        router.push('/');
      }
    }
  };

  if (tabs.length === 0) {
    return (
      <div className={styles.tabsContainer}>
        <div className={styles.tabs} style={{ padding: '4px 12px', fontSize: '12px', color: '#8b949e', fontFamily: 'monospace' }}>
          No open editors
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabs}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          return (
            <div
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className={`${styles.tabWrapper} ${isActive ? styles.activeTabWrapper : ''}`}
            >
              <div className={styles.tabContent}>
                <Image src={tab.icon} alt={tab.filename} width={16} height={16} className={styles.tabIcon} />
                <span className={styles.tabFilename}>{tab.filename}</span>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={(e) => handleCloseTab(e, tab.path)}
                  title="Close tab"
                >
                  <VscClose size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tabsbar;