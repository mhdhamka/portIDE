'use client';

import { useState } from 'react';
import { VscRepoForked, VscSync } from 'react-icons/vsc';
import EndpointCode from '@/components/EndpointCode';
import styles from '@/styles/Endpoint.module.css';

export default function ContactPage() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1200);
  };

  return (
    <div className={styles.layout}>
      
      {/* VS Code & Git Top Telemetry Bar */}
      <div className={styles.ideTopBar}>
        <div className={styles.workspaceBreadcrumb}>
          <span className={styles.folderRoot}>portIDE</span>
          <span className={styles.separator}>/</span>
          <span className={styles.folderSub}>api</span>
          <span className={styles.separator}>/</span>
          <span className={styles.activeFile}>endpoint.js</span>
        </div>
        
        <div className={styles.gitMetaBadge}>
          <VscRepoForked size={13} className={styles.branchIcon} />
          <span className={styles.branchName}>main</span>
          <span className={styles.dividerDot}>•</span>
          <button 
            onClick={handleSync} 
            className={`${styles.syncButton} ${isSyncing ? styles.syncing : ''}`}
            title="Sync with GitHub Repository"
          >
            <VscSync size={13} className={isSyncing ? styles.spin : ''} />
            <span>origin/main</span>
          </button>
        </div>
      </div>

      <h1 className={styles.pageTitle}>API Dispatch & Contacts</h1>
      <p className={styles.pageSubtitle}>
        Execute a secure communication request or inspect connection channels via live environment endpoints.
      </p>

      <div className={styles.container}>
        <div className={styles.contactContainer}>
          <EndpointCode />
        </div>
      </div>
    </div>
  );
}