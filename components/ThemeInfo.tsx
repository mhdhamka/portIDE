'use client';

import Image from 'next/image';
import { VscCheck, VscVerifiedFilled } from 'react-icons/vsc';
import styles from '@/styles/ThemeInfo.module.css';

interface ThemeInfoProps {
  icon: string;
  name: string;
  publisher: string;
  theme: string;
  isActive: boolean;
  onSelect: (theme: string) => void;
}

const ThemeInfo = ({ icon, name, publisher, theme, isActive, onSelect }: ThemeInfoProps) => {
  return (
    <button 
      className={`${styles.card} ${isActive ? styles.active : ''}`}
      onClick={() => onSelect(theme)}
    >
      <div className={styles.preview}>
        <Image
          src={icon}
          alt={name}
          height={38}
          width={38}
          className={styles.icon}
        />
        {isActive && (
          <div className={styles.check}>
            <VscCheck size={13} />
          </div>
        )}
      </div>
      
      <div className={styles.info}>
        <div className={styles.titleRow}>
          <h3 className={styles.name}>{name}</h3>
          {publisher === 'GitHub' || publisher === 'Microsoft' ? (
            <span className={styles.verifiedTag} title="Official Publisher">
              <VscVerifiedFilled size={12} color="var(--accent-color)" />
            </span>
          ) : null}
        </div>
        <p className={styles.publisher}>Publisher: <span>{publisher}</span></p>
      </div>

      <div className={styles.actionIndicator}>
        <span className={styles.statusText}>{isActive ? 'Active Theme' : 'Install / Apply'}</span>
      </div>
    </button>
  );
};

export default ThemeInfo;