'use client';

import { useState } from 'react';
import { 
  VscBell, 
  VscCheck, 
  VscError, 
  VscWarning, 
  VscSourceControl, 
  VscTerminal,
  VscSync,
  VscCopilot
} from 'react-icons/vsc';
import { SiNextdotjs } from 'react-icons/si';

import styles from '@/styles/Bottombar.module.css';

interface BottombarProps {
  onTerminalToggle: () => void;
  isTerminalOpen: boolean;
  onCopilotToggle?: () => void;
  isCopilotOpen?: boolean;
}

const Bottombar = ({ onTerminalToggle, isTerminalOpen, onCopilotToggle, isCopilotOpen }: BottombarProps) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <footer className={styles.bottomBar}>
      {/* Interactive Floating Notification Toast */}
      {toastMessage && (
        <div className={styles.bottomToast}>
          <VscBell size={13} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className={styles.container}>
        <a
          href="https://github.com/mhdhamka"
          target="_blank"
          rel="noreferrer noopener"
          className={styles.section}
          title="Git Repository (main)"
        >
          <VscSourceControl className={styles.icon} />
          <span className={styles.text}>main</span>
          <span className={styles.syncBadge}><VscSync size={10} /></span>
        </a>
        
        <div 
          className={styles.section} 
          onClick={() => triggerNotification('Diagnostics: 0 Errors, 0 Warnings found in workspace.')}
          title="Problems Summary"
        >
          <VscError className={`${styles.icon} ${styles.errorIcon}`} />
          <span className={styles.errorText}>0</span>
          <VscWarning className={`${styles.icon} ${styles.warningIcon}`} style={{ marginLeft: '6px' }} />
          <span className={styles.warningText}>0</span>
        </div>
      </div>

      <div className={styles.container}>
        {/* AI Copilot Status Item */}
        <div
          className={`${styles.section} ${isCopilotOpen ? styles.active : ''}`}
          onClick={onCopilotToggle}
          title="Toggle AI Copilot Assistant (Ctrl+Shift+I)"
        >
          <VscCopilot className={styles.icon} style={{ color: '#06b6d4' }} />
          <span className={styles.text}>AI Copilot</span>
          <span className={styles.livePulse} />
        </div>

        <div
          className={`${styles.section} ${isTerminalOpen ? styles.active : ''}`}
          onClick={onTerminalToggle}
          title="Toggle Terminal (Ctrl+`)"
        >
          <VscTerminal className={styles.icon} />
          <span className={styles.text}>portIDE : bash</span>
        </div>

        <div 
          className={styles.section}
          onClick={() => triggerNotification('Turbopack compiler running • Fast Refresh enabled')}
          title="Next.js App Router Runtime"
        >
          <SiNextdotjs className={`${styles.icon} ${styles.nextIcon}`} />
          <span className={styles.text}>Next.js 16</span>
          <span className={styles.livePulse} />
        </div>

        <div 
          className={styles.section}
          onClick={() => triggerNotification('Code Formatter: Prettier active with standard config.')}
          title="Formatter status"
        >
          <VscCheck className={`${styles.icon} ${styles.checkIcon}`} />
          <span className={styles.text}>Prettier</span>
        </div>

        <div 
          className={`${styles.section} ${styles.bellSection}`}
          onClick={() => triggerNotification('No new notifications. Workspace clean.')}
          title="Notifications"
        >
          <VscBell className={styles.icon} />
          <span className={styles.notificationDot} />
        </div>
      </div>
    </footer>
  );
};

export default Bottombar;