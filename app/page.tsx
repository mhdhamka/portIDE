'use client';

import { useState, JSX } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  VscArrowRight, 
  VscGithub, 
  VscMail, 
  VscCode, 
  VscTerminal, 
  VscCheck, 
  VscLayers,
  VscShield,
  VscCopy,
  VscCheckAll,
  VscGitBranch,
  VscGitCommit,
  VscSync,
  VscFileCode,
  VscJson
} from 'react-icons/vsc';

import styles from '@/styles/Overview.module.css';

interface WorkspaceFile {
  icon: JSX.Element;
  language: string;
  commit: string;
  message: string;
  code: string;
}

// Interactive workspace files mapping with explicit index typing
const workspaceFiles: Record<string, WorkspaceFile> = {
  'overview.jsx': {
    icon: <VscFileCode size={14} color="#61afef" />,
    language: 'javascript',
    commit: '7f38b29',
    message: 'feat: initialize portIDE core layout',
    code: `// portIDE Environment v2.5 - Active Workspace
import React from 'react';

export default function WorkspaceApp() {
  return {
    name: "portIDE",
    tagline: "Visual Studio Code Next.js Portfolio Workspace",
    author: "Mohd Hamka",
    stack: ["TypeScript", "React", "Node.js", "Laravel"],
    status: "Ready for deployment & collaboration"
  };
}`
  },
  'developer.config.php': {
    icon: <VscFileCode size={14} color="#ff2d20" />,
    language: 'php',
    commit: '3a19e81',
    message: 'config: update Laravel backend routing',
    code: `<?php
return [
    'env' => env('APP_ENV', 'production'),
    'app' => 'portIDE',
    'developer' => 'Mohd Hamka',
    'specialization' => ['Backend Architecture', 'Security'],
    'database' => 'PostgreSQL / MySQL'
];`
  },
  'endpoint.js': {
    icon: <VscFileCode size={14} color="#f7df1e" />,
    language: 'javascript',
    commit: '9c44d12',
    message: 'fix: optimize middleware authentication pipeline',
    code: `// Express / Next.js API Route Handler
export async function GET(request) {
  return Response.json({
    status: 'SECURE',
    project: 'portIDE',
    author: 'mdhamka',
    clearance: 'Cybersecurity Certified'
  });
}`
  },
  'changelog.json': {
    icon: <VscJson size={14} color="#cbcb41" />,
    language: 'json',
    commit: '5e88f03',
    message: 'docs: append version 2.5 changelog metrics',
    code: `{
  "name": "portIDE",
  "version": "2.5.0",
  "build": "stable",
  "features": [
    "VS Code Layout Engine",
    "Interactive Git Repository Sync",
    "Live Code Preview Sandbox"
  ]
}`
  }
};

export default function OverviewPage() {
  const [activeFile, setActiveFile] = useState('overview.jsx');
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const currentFile = workspaceFiles[activeFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1200);
  };

  return (
    <div className={styles.page}>
      <motion.div 
        className={styles.container}
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className={styles.content}>
          
          {/* 1. VS Code & Git Top Telemetry Bar */}
          <div className={styles.ideTopBar}>
            <div className={styles.workspaceBreadcrumb}>
              <span className={styles.folderRoot}>portIDE</span>
              <span className={styles.separator}>/</span>
              <span className={styles.folderSub}>workspace</span>
              <span className={styles.separator}>/</span>
              <span className={styles.activeFile}>{activeFile}</span>
            </div>
            
            <div className={styles.gitMetaBadge}>
              <VscGitBranch size={13} className={styles.branchIcon} />
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

          {/* 2. Header & Badges */}
          <div className={styles.header}>
            <div className={styles.iconWrapper}>
              <VscCode size={26} className={styles.codeIcon} />
              <span className={styles.pulseRing} />
            </div>
            <div className={styles.badgeContainer}>
              <div className={styles.statusBadge}>
                <VscCheck size={13} className={styles.statusCheck} />
                <span>v2.5.0-stable</span>
              </div>
              <div className={styles.techPill}>
                <VscShield size={12} />
                <span>Build Passing</span>
              </div>
            </div>
          </div>

          <div className={styles.intro}>
            <motion.p 
              className={styles.greeting}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              &ldquo;Code is like humor. When you have to explain it, it’s bad.&rdquo;
            </motion.p>
            
            <h1 className={styles.name}>portIDE</h1>
            
            <div className={styles.roleContainer}>
              <VscTerminal size={16} className={styles.terminalIcon} />
              <p className={styles.role}>Visual Studio Code Next.js Interactive Portfolio Workspace</p>
            </div>
            
            <div className={styles.divider} />
            
            {/* INTERACTIVE CODE SANDBOX & FILE TABS WIDGET */}
            <div className={styles.codeWidgetContainer}>
              {/* VS Code Tab Bar */}
              <div className={styles.fileTabsBar}>
                {Object.keys(workspaceFiles).map((filename) => (
                  <button
                    key={filename}
                    onClick={() => setActiveFile(filename)}
                    className={`${styles.fileTab} ${activeFile === filename ? styles.activeTab : ''}`}
                  >
                    {workspaceFiles[filename].icon}
                    <span>{filename}</span>
                  </button>
                ))}
              </div>

              {/* Code Editor Toolbar */}
              <div className={styles.codeWidgetHeader}>
                <div className={styles.widgetTitleGroup}>
                  <VscGitCommit size={14} color="#8b949e" />
                  <span className={styles.commitMessage}>{currentFile.message}</span>
                  <span className={styles.commitTag}>({currentFile.commit})</span>
                </div>
                
                <div className={styles.widgetActions}>
                  <button 
                    onClick={handleCopy}
                    className={styles.copyButton}
                    title="Copy code snippet"
                  >
                    {copied ? <VscCheckAll size={14} color="#3fb950" /> : <VscCopy size={14} />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Code Editor Body with smooth transition */}
              <AnimatePresence mode="wait">
                <motion.pre 
                  key={activeFile}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className={styles.codeBlock}
                >
                  <code>{currentFile.code}</code>
                </motion.pre>
              </AnimatePresence>
            </div>

            <p className={styles.description}>
              Crafting clean, high-performance web applications and secure digital architectures. 
              Developed by <span className={styles.highlightText}>Mohd Hamka</span>, specializing in <span className={styles.highlightText}>TypeScript</span>, <span className={styles.highlightText}>React</span>, <span className={styles.highlightText}>Node.js</span>, and modern full-stack workflows.
            </p>
          </div>

          {/* Action Buttons */}
          <div className={styles.actions}>
            <Link href="/workspace" className={styles.primaryAction}>
              <span>Explore workspace.tsx</span>
              <VscArrowRight size={18} className={styles.actionArrow} />
            </Link>
            
            <Link href="/config" className={styles.secondaryAction}>
              <VscLayers size={16} />
              <span>Inspect developer.config.php</span>
            </Link>
          </div>

          {/* Footer Telemetry Links */}
          <div className={styles.links}>
            <a 
              href="https://github.com/mhdhamka" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.link}
            >
              <VscGithub size={15} />
              <span>GitHub Profile</span>
            </a>
            
            <span className={styles.linkSeparator}>•</span>
            
            <Link href="/endpoint" className={styles.link}>
              <VscMail size={15} />
              <span>API Dispatch (endpoint.js)</span>
            </Link>
          </div>

        </div>
      </motion.div>
    </div>
  );
}