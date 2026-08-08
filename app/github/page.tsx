'use client';

import { useState } from 'react';
import { 
  VscGitBranch, 
  VscStarEmpty, 
  VscRepoForked, 
  VscLinkExternal, 
  VscGithub,
  VscBook,
  VscCode,
  VscTerminal,
  VscLayers,
  VscCheck,
  VscCopy,
  VscSparkle,
  VscSourceControl,
  VscKanban,
  VscFlame,
  VscPreview
} from 'react-icons/vsc';
import styles from '@/styles/GithubPage.module.css';

export default function GithubPage() {
  const [copied, setCopied] = useState(false);

  const handleCopyInstall = () => {
    navigator.clipboard.writeText('git clone https://github.com/mhdhamka/portIDE.git && cd portIDE && npm install');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        
        {/* Readme File Header Bar */}
        <div className={styles.readmeHeaderBar}>
          <div className={styles.readmeFileTitle}>
            <VscBook size={15} color="#58a6ff" />
            <span>portIDE / github.md</span>
          </div>
          <div className={styles.readmeBadges}>
            <span className={styles.badgeItem}>v2.5.0-stable</span>
            <span className={styles.badgeItem} style={{ color: '#3fb950', borderColor: 'rgba(63, 185, 80, 0.3)' }}>Build Passing</span>
          </div>
        </div>

        {/* README Markdown Body with Preview Pane Layout */}
        <div className={styles.readmeLayoutContainer}>
          
          <div className={styles.readmeBody}>
            
            <div className={styles.mdTitleSection}>
              <h1 className={styles.mdHeading}>🚀 portIDE v2.5 — Interactive Workspace Portfolio</h1>
              <p className={styles.mdSubtitle}>
                An immersive developer portfolio built with Next.js 16 and Turbopack, emulating a full VS Code and multi-IDE workspace.
              </p>
            </div>

            {/* Quick Clone / Install Box */}
            <div className={styles.installBox}>
              <div className={styles.installHeader}>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#8b949e' }}>terminal — bash</span>
                <button onClick={handleCopyInstall} className={styles.copyInstallBtn}>
                  {copied ? <VscCheck size={13} color="#3fb950" /> : <VscCopy size={13} />}
                  <span>{copied ? 'Copied' : 'Clone Repo'}</span>
                </button>
              </div>
              <pre className={styles.installPre}>
                <code>git clone https://github.com/mhdhamka/portIDE.git && cd portIDE && npm install</code>
              </pre>
            </div>

            {/* Key Features Section (Condensed) */}
            <div className={styles.mdSection}>
              <h3 className={styles.mdSubHeading}><VscCode size={16} /> Key Workspace & Studio Features</h3>
              <ul className={styles.featureList}>
                <li><strong>VS Code Layout Engine:</strong> Interactive sidebar explorer, active tabs management, command palette (<code style={{ fontSize: '11px' }}>Ctrl+Shift+P</code>), and custom themes.</li>
                <li><strong>Multi-IDE Switcher:</strong> Instantly toggle between Cursor AI, JetBrains IDEA, and GitHub Codespaces environments.</li>
                <li><strong>Interactive Code Playground:</strong> Live script editing, compiler output diagnostics, and terminal execution.</li>
                <li><strong>AI-Native Composer (Ctrl+I):</strong> Real-time code refactoring and execution step logging driven by custom user prompts.</li>
                <li><strong>Live Git Source Control:</strong> Automated commit graphing, branch management, file staging, and GitHub synchronization.</li>
                <li><strong>Developer Analytics:</strong> Integrated LeetCode statistics, Kanban sprint boards, and dynamic changelog tracking.</li>
              </ul>
            </div>

            {/* Tech Stack Grid */}
            <div className={styles.mdSection}>
              <h3 className={styles.mdSubHeading}><VscLayers size={16} /> Built With Modern Tech Stack</h3>
              <div className={styles.techGrid}>
                <div className={styles.techCard}>
                  <span className={styles.techName}>Next.js 16 / App Router</span>
                  <span className={styles.techRole}>Client/Server Hybrid Architecture</span>
                </div>
                <div className={styles.techCard}>
                  <span className={styles.techName}>Turbopack</span>
                  <span className={styles.techRole}>Lightning-fast Bundler & Compiler</span>
                </div>
                <div className={styles.techCard}>
                  <span className={styles.techName}>CSS Modules</span>
                  <span className={styles.techRole}>Scoped Styling & Dark Mode Theme</span>
                </div>
                <div className={styles.techCard}>
                  <span className={styles.techName}>GitHub REST API</span>
                  <span className={styles.techRole}>Automated Releases & Commits Stream</span>
                </div>
              </div>
            </div>

            {/* Author / Footer CTA */}
            <div className={styles.authorBox}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <VscGithub size={20} color="#e6edf3" />
                <div>
                  <strong style={{ color: '#e6edf3', display: 'block', fontSize: '13px' }}>Developed & maintained by mdhamka</strong>
                  <span style={{ fontSize: '12px', color: '#8b949e' }}>Full-Stack Developer</span>
                </div>
              </div>
              <a 
                href="https://github.com/mhdhamka/portIDE" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.repoLinkBtn}
              >
                <VscGithub size={14} />
                <span>Star Repository</span>
                <VscLinkExternal size={12} />
              </a>
            </div>

          </div>

          {/* Right Side: Code Snippet / AI Summary Preview Pane */}
          <div className={styles.previewPane}>
            <div className={styles.previewHeader}>
              <VscPreview size={14} color="#58a6ff" />
              <span>Live Code Snippet / AI Summary</span>
            </div>
            <div className={styles.previewContent}>
              <p className={styles.previewLabel}>// Workspace Telemetry Preview</p>
              <pre className={styles.previewCode}>
                <code>{`const workspace = {
  author: "mdhamka",
  framework: "Next.js 16",
  bundler: "Turbopack",
  status: "Operational"
};`}</code>
              </pre>
              <div className={styles.aiSummarySnippet}>
                <VscSparkle size={13} color="#f7df1e" />
                <span>AI Insight: Code velocity is operating at optimal levels with zero production blockages.</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}