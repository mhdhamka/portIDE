'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  VscGithub, 
  VscMail, 
  VscGitBranch, 
  VscGitCommit, 
  VscSync,
  VscCheckAll,
  VscCopy,
  VscFileCode,
  VscTerminal,
  VscHistory,
  VscClose,
  VscDatabase
} from 'react-icons/vsc';

import styles from '@/styles/Config.module.css';

interface PackageItem {
  name: string;
  desc: string;
}

export default function DeveloperConfigPage() {
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [appEnv, setAppEnv] = useState('production');
  const [debugMode, setDebugMode] = useState(false);
  const [activeFormat, setActiveFormat] = useState('php'); // 'php' | 'json' | 'yaml'
  
  // Terminal state
  const [terminalLogs, setTerminalLogs] = useState<Array<{ type: string; text: string }>>([
    { type: 'info', text: 'portIDE v2.5 kernel initialized.' },
    { type: 'success', text: 'Ready. Type or click actions below to test configuration.' }
  ]);
  const [isValidating, setIsValidating] = useState(false);

  // Git Diff Drawer state
  const [showDiffDrawer, setShowDiffDrawer] = useState(false);

  // Interactive Package Inspector Modal / State
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);

  // Interactive Eloquent ORM Query Builder State
  const [ormQuery, setOrmQuery] = useState("Developer::where('stack', 'Laravel')->first()");
  const [ormResult, setOrmResult] = useState('{\n  "status": 200,\n  "data": {\n    "name": "Mohd Hamka",\n    "degree": "Software Engineering @ UNIMAS",\n    "status": "Available for Hire"\n  }\n}');

  // Formatted Snippets with index signature
  const snippets: Record<string, string> = {
    php: `<?php
return [
    'app_env' => '${appEnv}',
    'debug' => ${debugMode ? 'true' : 'false'},
    'developer' => 'Mohd Hamka',
    'role' => 'Full-Stack Developer & Cybersecurity Enthusiast',
    'stack' => ['TypeScript', 'React', 'Node.js', 'Laravel']
];`,
    json: `{
  "app_env": "${appEnv}",
  "debug": ${debugMode},
  "developer": "Mohd Hamka",
  "role": "Full-Stack Developer & Cybersecurity Enthusiast",
  "stack": ["TypeScript", "React", "Node.js", "Laravel"]
}`,
    yaml: `app:
  env: ${appEnv}
  debug: ${debugMode}
  developer: Mohd Hamka
  role: Full-Stack Developer & Cybersecurity Enthusiast
  stack:
    - TypeScript
    - React
    - Node.js
    - Laravel`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeFormat]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setTerminalLogs(prev => [...prev, { type: 'success', text: 'Synced with origin/main successfully.' }]);
    }, 1200);
  };

  const runConfigCache = () => {
    setIsValidating(true);
    setTerminalLogs(prev => [...prev, { type: 'cmd', text: 'php artisan config:cache' }]);
    
    setTimeout(() => {
      setTerminalLogs(prev => [
        ...prev, 
        { type: 'info', text: 'Compiling configuration files...' },
        { type: 'success', text: '[OK] developer.config.php cached successfully!' }
      ]);
      setIsValidating(false);
    }, 800);
  };

  const runArtisanCommand = (cmd: string) => {
    setTerminalLogs(prev => [...prev, { type: 'cmd', text: cmd }]);
    setTimeout(() => {
      let output = '[OK] Command executed successfully.';
      if (cmd === 'php artisan route:list') output = 'GET|HEAD / | /config | /projects | /endpoint';
      if (cmd === 'php artisan db:seed') output = 'Database seeding completed: Software Engineer graduate data loaded.';
      if (cmd === 'composer update') output = 'All packages up to date. 0 vulnerabilities found.';
      
      setTerminalLogs(prev => [...prev, { type: 'success', text: output }]);
    }, 600);
  };

  const handleQuerySelect = (query: string, result: string) => {
    setOrmQuery(query);
    setOrmResult(result);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        
        {/* VS Code & Git Top Telemetry Bar */}
        <div className={styles.ideTopBar}>
          <div className={styles.workspaceBreadcrumb}>
            <span className={styles.folderRoot}>portIDE</span>
            <span className={styles.separator}>/</span>
            <span className={styles.folderSub}>config</span>
            <span className={styles.separator}>/</span>
            <span className={styles.activeFile}>developer.config.{activeFormat === 'php' ? 'php' : activeFormat}</span>
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

        {/* Header Section */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.avatar}>
              <VscFileCode size={32} />
            </div>
            <div className={styles.headerText}>
              <h1 className={styles.name}>Mohd Hamka</h1>
              <p className={styles.role}>Full-Stack Developer | AI & Cybersecurity Enthusiast</p>
              <div className={styles.location}>
                <span className={styles.dot} />
                Kuching, Sarawak, Malaysia
              </div>
            </div>
          </div>
          
          <div className={styles.headerActions}>
            <a 
              href="https://github.com/mhdhamka" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.iconButton}
              title="GitHub Profile"
            >
              <VscGithub size={20} />
            </a>
            <Link href="/endpoint" className={styles.iconButton} title="Direct Contact">
              <VscMail size={20} />
            </Link>
          </div>
        </header>

        {/* INTERACTIVE CONFIG SANDBOX WIDGET */}
        <div className={styles.codeWidgetContainer}>
          <div className={styles.codeWidgetHeader}>
            <div className={styles.widgetTitleGroup}>
              <span className={styles.dotRed} />
              <span className={styles.dotYellow} />
              <span className={styles.dotGreen} />
              <span className={styles.widgetTitle}>Live Runtime Configuration Sandbox</span>
            </div>
            
            <div className={styles.widgetActions}>
              <button 
                onClick={() => setShowDiffDrawer(true)} 
                className={styles.commitTagButton}
                title="View Git Commit History & Diff"
              >
                <VscGitCommit size={12} /> 4b92c81 <VscHistory size={12} style={{marginLeft: 4}} />
              </button>
              <button 
                onClick={handleCopy}
                className={styles.copyButton}
                title="Copy configuration snippet"
              >
                {copied ? <VscCheckAll size={14} color="#3fb950" /> : <VscCopy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Controls Bar: Format Switcher & Flags */}
          <div className={styles.configControlsBar}>
            <div className={styles.formatSwitchers}>
              <span className={styles.controlsLabel}>Format:</span>
              {['php', 'json', 'yaml'].map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setActiveFormat(fmt)}
                  className={`${styles.formatBtn} ${activeFormat === fmt ? styles.activeFormatBtn : ''}`}
                >
                  .{fmt}
                </button>
              ))}
            </div>

            <div className={styles.interactiveFlags}>
              <button onClick={() => setAppEnv(p => p === 'production' ? 'staging' : 'production')} className={styles.configToggleBtn}>
                ENV: <span className={styles.highlightVal}>{appEnv}</span>
              </button>
              <button onClick={() => setDebugMode(!debugMode)} className={styles.configToggleBtn}>
                DEBUG: <span className={styles.highlightVal}>{debugMode ? 'true' : 'false'}</span>
              </button>
              <button onClick={runConfigCache} disabled={isValidating} className={styles.artisanBtn}>
                <VscTerminal size={12} /> php artisan cache
              </button>
            </div>
          </div>

          {/* Code Viewer Body */}
          <AnimatePresence mode="wait">
            <motion.pre 
              key={activeFormat}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.codeBlock}
            >
              <code>{snippets[activeFormat]}</code>
            </motion.pre>
          </AnimatePresence>

          {/* Collapsible Integrated Terminal Output Drawer */}
          <div className={styles.terminalDrawer}>
            <div className={styles.terminalHeader}>
              <VscTerminal size={13} />
              <span>portIDE Integrated Terminal (Bash / Artisan)</span>
              <div className={styles.terminalQuickActions}>
                <button onClick={() => runArtisanCommand('php artisan route:list')}>route:list</button>
                <button onClick={() => runArtisanCommand('php artisan db:seed')}>db:seed</button>
                <button onClick={() => runArtisanCommand('composer update')}>composer update</button>
              </div>
            </div>
            <div className={styles.terminalBody}>
              {terminalLogs.map((log, index) => (
                <div key={index} className={`${styles.terminalLine} ${styles[log.type]}`}>
                  {log.type === 'cmd' ? '$ ' : '> '}{log.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Git Diff Drawer Modal / Overlay */}
        {showDiffDrawer && (
          <div className={styles.modalOverlay} onClick={() => setShowDiffDrawer(false)}>
            <div className={styles.diffModal} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Git Commit Diff — Commit 4b92c81</h3>
                <button onClick={() => setShowDiffDrawer(false)} className={styles.closeBtn}>
                  <VscClose size={16} />
                </button>
              </div>
              <div className={styles.diffBody}>
                <p className={styles.commitMsg}><strong>Author:</strong> Mohd Hamka &lt;mhdhamka@github.com&gt;</p>
                <p className={styles.commitMsg}><strong>Message:</strong> feat: configure robust security & system parameters</p>
                <div className={styles.diffBlock}>
                  <div className={styles.diffRemoved}>- 'security_clearance' =&gt; 'Standard'</div>
                  <div className={styles.diffAdded}>+ 'security_clearance' =&gt; 'Cybersecurity Certified'</div>
                  <div className={styles.diffAdded}>+ 'framework_mastery' =&gt; ['Laravel', 'React', 'Next.js']</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Sections */}
        <div className={styles.content}>
          {/* Section 01: System Overview (Markdown Style) */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNumber}>01</span>
              <h2 className={styles.sectionTitle}>System Overview (README.md)</h2>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.markdownBox}>
                <div className={styles.mdHeader}>
                  <span>📄 README.md — Professional Summary</span>
                </div>
                <p className={styles.paragraph}>
                  # Software Engineer Graduate (UNIMAS)
                  <br /><br />
                  Passionate about crafting high-performance web applications and secure architectures across modern full-stack environments. Focused on building robust backend systems and clean, responsive user interfaces.
                </p>
              </div>
            </div>
          </section>

          {/* Section 02: Interactive Package Dependencies (Tech Stack) */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNumber}>02</span>
              <h2 className={styles.sectionTitle}>Dependencies & Stack Packages</h2>
            </div>
            <div className={styles.sectionBody}>
              <p className={styles.subHint}>// Click any package dependency to inspect system telemetry</p>
              <div className={styles.skillsGrid}>
                <div className={styles.skillCategory} onClick={() => setSelectedPackage({name: 'Laravel v10.0', desc: 'Backend architecture framework utilized for robust routing, middleware pipelines, and MVC scalability.'})}>
                  <h4 className={styles.skillTitle}>backend-core (v2.5)</h4>
                  <div className={styles.skillTags}>
                    <span className={styles.skillTag}>laravel ^10.0</span>
                    <span className={styles.skillTag}>php ^8.2</span>
                    <span className={styles.skillTag}>node.js ^20.x</span>
                    <span className={styles.skillTag}>typescript ^5.0</span>
                  </div>
                </div>
                
                <div className={styles.skillCategory} onClick={() => setSelectedPackage({name: 'React / Next.js', desc: 'Modern frontend framework used for high-performance responsive web applications and server-side rendering.'})}>
                  <h4 className={styles.skillTitle}>frontend-tools (v18.2)</h4>
                  <div className={styles.skillTags}>
                    <span className={styles.skillTag}>react ^18.2</span>
                    <span className={styles.skillTag}>next.js ^14.2</span>
                    <span className={styles.skillTag}>git/github</span>
                    <span className={styles.skillTag}>cybersecurity-sec</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 03: Eloquent ORM Query Builder Sandbox */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNumber}>03</span>
              <h2 className={styles.sectionTitle}>Eloquent ORM Query Console</h2>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.ormBox}>
                <div className={styles.ormHeader}>
                  <VscDatabase size={14} />
                  <span>Database Query Builder</span>
                </div>
                <div className={styles.ormButtons}>
                  <button onClick={() => handleQuerySelect("Developer::where('stack', 'Laravel')->first()", '{\n  "status": 200,\n  "data": {\n    "name": "Mohd Hamka",\n    "focus": "Backend & Security"\n  }\n}')}>
                    getDeveloper()
                  </button>
                  <button onClick={() => handleQuerySelect("Certifications::active()->get()", '[\n  "Cybersecurity Certified",\n  "Google Data Analytics",\n  "UX Design"\n]')}>
                    getCertifications()
                  </button>
                </div>
                <div className={styles.ormCodeBox}>
                  <code>{ormQuery}</code>
                </div>
                <pre className={styles.ormResultBox}>
                  <code>{ormResult}</code>
                </pre>
              </div>
            </div>
          </section>

          {/* Section 04: System Constants (Beyond Code) */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNumber}>04</span>
              <h2 className={styles.sectionTitle}>System Constants (Beyond Code)</h2>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.constantsBox}>
                <span className={styles.constKey}>const</span> <span className={styles.constName}>INTERESTS</span> = [<br/>
                &nbsp;&nbsp;<span className={styles.constStr}>&quot;Continuous Learning&quot;</span>,<br/>
                &nbsp;&nbsp;<span className={styles.constStr}>&quot;Secure System Architectures&quot;</span>,<br/>
                &nbsp;&nbsp;<span className={styles.constStr}>&quot;Clean Code Workflows&quot;</span><br/>
                ];
              </div>
            </div>
          </section>
        </div>

        {/* Package Inspector Modal */}
        {selectedPackage && (
          <div className={styles.modalOverlay} onClick={() => setSelectedPackage(null)}>
            <div className={styles.diffModal} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Package Inspector: {selectedPackage.name}</h3>
                <button onClick={() => setSelectedPackage(null)} className={styles.closeBtn}>
                  <VscClose size={16} />
                </button>
              </div>
              <div className={styles.diffBody}>
                <p className={styles.paragraph}>{selectedPackage.desc}</p>
                <div className={styles.diffBlock}>
                  <div className={styles.diffAdded}>+ Status: Verified & Integrated in Production</div>
                  <div className={styles.diffAdded}>+ Compatibility: Fully Optimized</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className={styles.footer}>
          <Link href="/workspace" className={styles.githubGreenButton}>
            <span>Explore my code projects</span>
            <span className={styles.arrow}>→</span>
          </Link>
        </footer>
      </div>
    </div>
  );
}