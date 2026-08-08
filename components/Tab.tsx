'use client';

import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { VscClose } from 'react-icons/vsc';

import styles from '@/styles/Tab.module.css';

interface TabProps {
  icon: string;
  filename: string;
  path: string;
}

const Tab = ({ icon, filename, path }: TabProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = pathname === path;

  const handleTabClick = () => {
    router.push(path);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stops the click from triggering handleTabClick
    e.preventDefault();
    
    // If you are closing the active tab, you can redirect home or handle closing logic here
    if (isActive) {
      router.push('/');
    } else {
      console.log(`Closed tab: ${filename}`);
    }
  };

  return (
    <div 
      onClick={handleTabClick}
      className={`${styles.tab} ${isActive ? styles.active : ''}`}
    >
      <div className={styles.tabContent}>
        <Image src={icon} alt={filename} height={16} width={16} className={styles.icon} />
        <p className={styles.filename}>{filename}</p>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={handleClose}
          title="Close tab"
        >
          <VscClose size={14} />
        </button>
      </div>
    </div>
  );
};

export default Tab;