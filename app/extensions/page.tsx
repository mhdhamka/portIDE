'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  VscExtensions, 
  VscSearch, 
  VscStarFull, 
  VscCloudDownload, 
  VscCheck, 
  VscFileCode,
  VscJson,
  VscFile,
  VscBell,
  VscTerminal,
  VscLock,
  VscLayoutSidebarLeft,
  VscCode
} from 'react-icons/vsc';
import { useTabs } from '@/context/TabsContext';
import styles from '@/styles/Extensions.module.css';

interface WorkspaceExtension {
  id: string;
  filename: string;
  path: string;
  icon: string;
  reactIcon: React.ReactNode;
  name: string;
  publisher: string;
  description: string;
  version: string;
  category: string;
  installed: boolean;
  requiresSecurity?: boolean;
}

const fileExtensions: WorkspaceExtension[] = [
  {
    id: 'ext-overview',
    filename: 'overview.jsx',
    path: '/',
    icon: '/logos/next_icon.svg',
    reactIcon: <VscFileCode size={22} style={{ color: '#00d8ff' }} />,
    name: 'Overview & Profile Module',
    publisher: 'portIDE',
    description: 'Core profile component containing software engineering background, bio, and main entry point.',
    version: '2.5.0',
    category: 'Frontend',
    installed: true,
  },
  {
    id: 'ext-config',
    filename: 'developer.config.php',
    path: '/config',
    icon: '/logos/laravel_icon.svg',
    reactIcon: <VscFileCode size={22} style={{ color: '#ff2d20' }} />,
    name: 'Developer Configuration & Backend Core',
    publisher: 'portIDE',
    description: 'Runtime environment settings, stack definitions, and backend architecture specs.',
    version: '3.0.1',
    category: 'Backend',
    installed: true,
    requiresSecurity: true,
  },
  {
    id: 'ext-endpoint',
    filename: 'endpoint.js',
    path: '/endpoint',
    icon: '/logos/js_icon.svg',
    reactIcon: <VscFileCode size={22} style={{ color: '#f7df1e' }} />,
    name: 'API Dispatch & Contact Handler',
    publisher: 'portIDE',
    description: 'Secure communication route handlers, social connection payloads, and endpoints.',
    version: '1.2.0',
    category: 'API / Network',
    installed: true,
  },
  {
    id: 'ext-workspace',
    filename: 'workspace.tsx',
    path: '/workspace',
    icon: '/logos/react_icon.svg',
    reactIcon: <VscFileCode size={22} style={{ color: '#61dafb' }} />,
    name: 'Interactive Code Sandbox & Projects',
    publisher: 'portIDE',
    description: 'Featured projects workbench and live code preview components.',
    version: '2.1.4',
    category: 'Workspace',
    installed: false,
  },
  {
    id: 'ext-changelog',
    filename: 'changelog.json',
    path: '/changelog',
    icon: '/logos/json_icon.svg',
    reactIcon: <VscJson size={22} style={{ color: '#cbcb41' }} />,
    name: 'Certifications & Articles Changelog',
    publisher: 'portIDE',
    description: 'Interactive version schema, live script compilation, AI agents, PR review, API inspection, package dependencies, and Git commit graph tracking.',
    version: '2.5.0',
    category: 'Docs',
    installed: false,
  },
  {
    id: 'ext-github',
    filename: 'github.md',
    path: '/github',
    icon: '/logos/markdown_icon.svg',
    reactIcon: <VscFile size={22} style={{ color: '#58a6ff' }} />,
    name: 'GitHub Repository Sync & Markdown',
    publisher: 'portIDE',
    description: 'Live repository metrics, commit histories, and Markdown documentation reader.',
    version: '2.0.2',
    category: 'Git',
    installed: true,
    requiresSecurity: true,
  },
];

export default function ExtensionsPage() {
  const [query, setQuery] = useState('');
  const [extensions, setExtensions] = useState<WorkspaceExtension[]>(fileExtensions);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '> portIDE extension kernel v2.5 initialized.',
    '> ready. select or install modules to mount runtime files.'
  ]);

  const router = useRouter();
  const { openTab } = useTabs();

  const addLog = (text: string) => {
    setTerminalLogs(prev => [...prev.slice(-5), `> ${text}`]);
  };

  const handleAction = (ext: WorkspaceExtension, actionType: 'open' | 'split' | 'inspect') => {
    setExtensions(prev =>
      prev.map(item => item.id === ext.id ? { ...item, installed: true } : item)
    );

    if (actionType === 'open') {
      openTab({ icon: ext.icon, filename: ext.filename, path: ext.path });
      router.push(ext.path);
      setToastMessage(`Loaded '${ext.filename}' into active workspace.`);
      addLog(`mounted module ${ext.filename} -> route ${ext.path}`);
    } else if (actionType === 'split') {
      openTab({ icon: ext.icon, filename: ext.filename, path: ext.path });
      setToastMessage(`Opened '${ext.filename}' in split view preview.`);
      addLog(`split-view buffer allocated for ${ext.filename}`);
    } else if (actionType === 'inspect') {
      setToastMessage(`Inspecting secure metadata & telemetry for ${ext.name}.`);
      addLog(`telemetry dump requested for ${ext.filename} [CLEARANCE: SECURE]`);
    }

    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredExtensions = extensions.filter(ext =>
    ext.name.toLowerCase().includes(query.toLowerCase()) ||
    ext.filename.toLowerCase().includes(query.toLowerCase()) ||
    ext.description.toLowerCase().includes(query.toLowerCase())
  );

  const activeCount = extensions.filter(e => e.installed).length;

  return (
    <div className={styles.container}>
      {toastMessage && (
        <div className={styles.vscodeToast}>
          <VscBell size={14} className={styles.toastIcon} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <VscExtensions size={16} className={styles.headerIcon} />
          <span>portIDE / workspace-extensions</span>
        </div>
        <div className={styles.activeBadge}>
          Active Modules: <strong>{activeCount} / {extensions.length}</strong>
        </div>
      </div>

      <div className={styles.searchWrapper}>
        <div className={styles.searchBox}>
          <VscSearch size={14} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search workspace modules and certified toolsets..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.searchInput}
            autoFocus
          />
        </div>
        <p className={styles.subtitle}>Manage workspace capabilities with split-view and inspection controls</p>
      </div>

      <div className={styles.list}>
        {filteredExtensions.length === 0 ? (
          <div className={styles.noResults}>No modules found matching &quot;{query}&quot;</div>
        ) : (
          filteredExtensions.map(ext => (
            <div key={ext.id} className={styles.card}>
              <div className={styles.cardIconWrapper}>
                {ext.reactIcon}
              </div>

              <div className={styles.cardDetails}>
                <div className={styles.cardTopRow}>
                  <div className={styles.titleFlex}>
                    <h3 className={styles.cardTitle}>{ext.name}</h3>
                    {ext.requiresSecurity && (
                      <span className={styles.securityBadge} title="Requires Cybersecurity Clearance">
                        <VscLock size={10} /> Secure
                      </span>
                    )}
                  </div>
                  <span className={styles.categoryTag}>{ext.filename}</span>
                </div>
                
                <p className={styles.publisher}>
                  {ext.publisher} • v{ext.version} • [{ext.category}]
                </p>
                
                <p className={styles.cardDesc}>{ext.description}</p>

                <div className={styles.cardFooter}>
                  <div className={styles.metaInfo}>
                    <span className={styles.downloads}>
                      <VscCloudDownload size={12} /> Workspace Module
                    </span>
                    <span className={styles.rating}>
                      <VscStarFull size={12} style={{ color: '#e3b341' }} /> 5.0
                    </span>
                  </div>

                  <div className={styles.actionButtonGroup}>
                    <button 
                      className={styles.actionBtn}
                      onClick={() => handleAction(ext, 'inspect')}
                      title="Inspect Source"
                    >
                      <VscCode size={13} />
                    </button>
                    <button 
                      className={styles.actionBtn}
                      onClick={() => handleAction(ext, 'split')}
                      title="Open in Split View"
                    >
                      <VscLayoutSidebarLeft size={13} />
                    </button>
                    <button 
                      className={`${styles.installBtn} ${ext.installed ? styles.installedBtn : ''}`}
                      onClick={() => handleAction(ext, 'open')}
                    >
                      {ext.installed ? (
                        <>
                          <VscCheck size={14} /> Open Tab
                        </>
                      ) : (
                        'Load & Open'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.terminalContainer}>
        <div className={styles.terminalHeader}>
          <VscTerminal size={14} />
          <span>portIDE Extension Kernel Log</span>
        </div>
        <div className={styles.terminalBody}>
          {terminalLogs.map((log, index) => (
            <div key={index} className={styles.terminalLine}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}