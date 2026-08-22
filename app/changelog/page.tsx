'use client';

import { useState } from 'react';
import { 
  VscRepoForked, 
  VscCheck, 
  VscCopy, 
  VscPlay, 
  VscFileCode, 
  VscSparkle,
  VscPass,
  VscJson,
  VscDebugConsole,
  VscServer,
  VscTools,
  VscGitPullRequest,
  VscPackage,
  VscListTree,
  VscGlobe
} from 'react-icons/vsc';
import styles from '@/styles/ChangeLog.module.css';

interface Snippet {
  id: string;
  title: string;
  filename: string;
  path: string;
  icon: string;
  language: string;
  code: string;
  output: string;
}

interface CommitNode {
  hash: string;
  message: string;
  time: string;
}

export default function ChangelogPage() {
  const [ideMode, setIdeMode] = useState<'codespaces' | 'cursor' | 'jetbrains'>('cursor');
  const [activeTab, setActiveTab] = useState<'json' | 'snippets' | 'pr' | 'api' | 'dependencies' | 'gitgraph'>('json');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  // Cursor Composer AI State
  const [composerPrompt, setComposerPrompt] = useState('');
  const [composerLogs, setComposerLogs] = useState<string[]>([
    'Cursor Composer Agent initialized. Ready to refactor multiple files simultaneously.'
  ]);
  const [isComposerActive, setIsComposerActive] = useState(false);

  // API Client State
  const [apiEndpoint, setApiEndpoint] = useState('/api/v2/telemetry');
  const [apiResponse, setApiResponse] = useState('{\n  "status": 200,\n  "message": "Connected to portIDE Edge Server",\n  "uptime": "99.98%"\n}');

  // PR Review State
  const [prStatus, setPrStatus] = useState<'open' | 'approved' | 'merged'>('open');

  // Dynamic Git Commits State
  const [gitCommits, setGitCommits] = useState<CommitNode[]>([
    { hash: '7f38a92', message: 'feat: streamlined active file tabs and removed unused modules', time: '1m ago' },
    { hash: '4b21e81', message: 'refactor: modernized terminal panel with resizable drag handle', time: '1h ago' },
    { hash: '9e12c41', message: 'init: portIDE interactive workspace engine setup', time: '3h ago' }
  ]);

  // Code Snippets Collection excluding endpoint.js and github.md
  const [snippets] = useState<Snippet[]>([
    {
      id: 'snippet-1',
      title: 'overview.jsx',
      filename: 'overview.jsx',
      path: '/',
      icon: '/logos/next_icon.svg',
      language: 'javascript',
      code: `const usePortIde = () => {
  const workspace = "portIDE v2.5";
  const developer = "mdhamka";
  return \`Initialized \${workspace} for \${developer}\`;
};

console.log(usePortIde());`,
      output: 'Initialized portIDE v2.5 for mdhamka'
    },
    {
      id: 'snippet-2',
      title: 'developer.config.php',
      filename: 'developer.config.php',
      path: '/config',
      icon: '/logos/laravel_icon.svg',
      language: 'php',
      code: `<?php
// Developer configuration module
$config = [
  "env" => "production",
  "developer" => "mdhamka",
  "engine" => "JetBrains PSI"
];
echo json_encode($config);`,
      output: '{"env":"production","developer":"mdhamka","engine":"JetBrains PSI"}'
    },
    {
      id: 'snippet-4',
      title: 'workspace.tsx',
      filename: 'workspace.tsx',
      path: '/workspace',
      icon: '/logos/react_icon.svg',
      language: 'typescript',
      code: `const setThemeMode = (mode) => {
  document.documentElement.setAttribute('data-theme', mode);
  return \`Theme successfully updated to: \${mode}\`;
};

console.log(setThemeMode('github-dark'));`,
      output: 'Theme successfully updated to: github-dark'
    },
    {
      id: 'snippet-5',
      title: 'changelog.json',
      filename: 'changelog.json',
      path: '/changelog',
      icon: '/logos/json_icon.svg',
      language: 'json',
      code: `// Workspace Version Schema Configuration
const changelogConfig = {
  version: "2.5.0",
  status: "active",
  author: "mdhamka"
};
console.log(changelogConfig.version);`,
      output: '2.5.0'
    }
  ]);

  const [selectedSnippetId, setSelectedSnippetId] = useState<string>('snippet-5'); // Default to changelog.json
  const [editableCode, setEditableCode] = useState<string>(snippets[3].code);
  const [consoleOutput, setConsoleOutput] = useState<string>(snippets[3].output);

  const selectedSnippet = snippets.find(s => s.id === selectedSnippetId) || snippets[3];

  const rawJsonData = JSON.stringify({
    name: "portIDE-changelog",
    version: "2.5.0",
    author: "mdhamka",
    activeFile: selectedSnippet.filename,
    routePath: selectedSnippet.path,
    activeSandbox: {
      lineCount: editableCode.split('\n').length,
      characterCount: editableCode.length,
      lastCompiledOutput: consoleOutput
    },
    ideEngine: ideMode === 'cursor' ? 'Cursor AI-Native Engine' : ideMode === 'jetbrains' ? 'JetBrains PSI Semantic Engine' : 'GitHub Codespaces Cloud',
    dependencies: { "next": "^15.0.0", "react": "^19.0.0" }
  }, null, 2);

  const handleSelectSnippet = (snippet: Snippet) => {
    setSelectedSnippetId(snippet.id);
    setEditableCode(snippet.code);
    setConsoleOutput(snippet.output);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setConsoleOutput('Compiling and executing script...');
    setTimeout(() => {
      try {
        if (editableCode.includes('console.log') || editableCode.includes('echo')) {
          const match = editableCode.match(/console\.log\((.*?)\);?/s) || editableCode.match(/echo\s+(.*?);?/s);
          if (match && match[1]) {
            let evaluated = match[1].trim();
            if (evaluated.startsWith('`') || evaluated.startsWith("'") || evaluated.startsWith('"')) {
              evaluated = evaluated.slice(1, -1);
            }
            setConsoleOutput(evaluated);
          } else {
            setConsoleOutput('Script executed successfully with 0 errors.');
          }
        } else {
          setConsoleOutput('Compiled successfully. No console output returned.');
        }
      } catch (err: any) {
        setConsoleOutput(`Runtime Error: ${err.message}`);
      }
      setIsRunning(false);
    }, 400);
  };

  const handleRunComposerAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerPrompt.trim()) return;
    setIsComposerActive(true);
    const promptText = composerPrompt.toLowerCase();
    setComposerLogs(prev => [...prev, `> User Prompt: "${composerPrompt}"`]);
    
    setTimeout(() => {
      let newCode = editableCode;
      let newOutput = consoleOutput;

      if (promptText.includes('simplify') || promptText.includes('clean')) {
        newCode = `// Refactored by Cursor AI Agent (Simplified)\nconst activeModule = () => "Optimized execution for mdhamka";\n\nconsole.log(activeModule());`;
        newOutput = 'Optimized execution for mdhamka';
      } else if (promptText.includes('improve') || promptText.includes('optimize')) {
        newCode = `// Refactored by Cursor AI Agent (Secured)\nconst activeModule = () => {\n  return "[SECURE] Workspace active for mdhamka";\n};\n\nconsole.log(activeModule());`;
        newOutput = '[SECURE] Workspace active for mdhamka';
      } else {
        newCode = editableCode + `\n\n// AI Agent Edit: ${composerPrompt}\nconsole.log("[AI Agent] Sync verified.");`;
        newOutput = consoleOutput + '\n[AI Agent] Sync verified.';
      }

      setEditableCode(newCode);
      setConsoleOutput(newOutput);

      const randomHash = Math.random().toString(16).substring(2, 9);
      setGitCommits(prev => [
        { hash: randomHash, message: `ai(composer): refactored ${selectedSnippet.filename}`, time: 'Just now' },
        ...prev
      ]);

      setComposerLogs(prev => [
        ...prev,
        `[Cursor AI Agent] Analyzing AST nodes for ${selectedSnippet.filename}...`,
        `[Composer] Successfully modified file and recorded commit (${randomHash}).`,
        `✨ Changes applied live.`
      ]);
      setIsComposerActive(false);
      setComposerPrompt('');
    }, 1000);
  };

  const handleSendApiRequest = (endpoint: string) => {
    setApiEndpoint(endpoint);
    if (endpoint.includes('telemetry')) {
      setApiResponse(`{\n  "status": 200,\n  "activeFile": "${selectedSnippet.filename}",\n  "routePath": "${selectedSnippet.path}",\n  "codeLengthBytes": ${editableCode.length},\n  "uptime": "99.98%"\n}`);
    } else {
      setApiResponse('[\n  { "tag": "v2.5.0", "status": "active" }\n]');
    }
  };

  const handleCopyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        
        {/* Aligned VS Code Tab Breadcrumb Bar */}
        <div className={styles.ideTopBar}>
          <div className={styles.workspaceBreadcrumb}>
            <span className={styles.folderRoot}>portIDE</span>
            <span className={styles.separator}>/</span>
            <span className={styles.folderSub}>workspace</span>
            <span className={styles.separator}>/</span>
            <span className={styles.activeFile}>{selectedSnippet.filename}</span>
          </div>
          
          <div className={styles.gitMetaBadge}>
            <VscPass size={13} style={{ color: '#3fb950' }} />
            <span style={{ color: '#8b949e', fontSize: '11px' }}>
              {ideMode === 'cursor' ? 'Cursor AI-Native Active' : ideMode === 'jetbrains' ? 'JetBrains PSI Engine Active' : 'Codespaces Cloud Active'}
            </span>
            <span className={styles.dividerDot}>•</span>
            <VscRepoForked size={13} className={styles.branchIcon} />
            <span className={styles.branchName}>main</span>
          </div>
        </div>

        {/* Header Section */}
        <header className={styles.header}>
          <div className={styles.headerMain}>
            <div className={styles.iconWrapper}>
              <VscJson className={styles.icon} size={24} />
            </div>
            
            <div className={styles.headerContent}>
              <div className={styles.headerTop}>
                <h1 className={styles.title}>changelog.json & Multi-IDE Studio</h1>
              </div>
              <p className={styles.subtitle}>
                Interactive version schema and multi-engine IDE workspace featuring live script compilation, AI composer agents, and simulated cloud telemetry.
              </p>
            </div>
          </div>

          {/* IDE Engine Switcher Bar */}
          <div style={{ display: 'flex', gap: '8px', background: '#161b22', padding: '6px', borderRadius: '8px', border: '1px solid #30363d', width: 'fit-content' }}>
            <button
              onClick={() => setIdeMode('cursor')}
              style={{
                background: ideMode === 'cursor' ? '#58a6ff' : 'transparent',
                color: ideMode === 'cursor' ? '#0d1117' : '#8b949e',
                border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <VscSparkle size={13} />
              <span>Cursor AI</span>
            </button>
            <button
              onClick={() => setIdeMode('jetbrains')}
              style={{
                background: ideMode === 'jetbrains' ? '#f7df1e' : 'transparent',
                color: ideMode === 'jetbrains' ? '#0d1117' : '#8b949e',
                border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <VscTools size={13} />
              <span>JetBrains IDEA</span>
            </button>
            <button
              onClick={() => setIdeMode('codespaces')}
              style={{
                background: ideMode === 'codespaces' ? '#238636' : 'transparent',
                color: ideMode === 'codespaces' ? '#ffffff' : '#8b949e',
                border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <VscServer size={13} />
              <span>Codespaces</span>
            </button>
          </div>

          {/* Hub Navigation Tabs */}
          <div className={styles.masterTabsContainer}>
            <button onClick={() => setActiveTab('json')} className={`${styles.masterTabBtn} ${activeTab === 'json' ? styles.activeMasterTab : ''}`}>
              <VscJson size={14} /><span>changelog.json</span>
            </button>
            <button onClick={() => setActiveTab('snippets')} className={`${styles.masterTabBtn} ${activeTab === 'snippets' ? styles.activeMasterTab : ''}`}>
              <VscFileCode size={14} /><span>Playground</span>
            </button>
            <button onClick={() => setActiveTab('pr')} className={`${styles.masterTabBtn} ${activeTab === 'pr' ? styles.activeMasterTab : ''}`}>
              <VscGitPullRequest size={14} /><span>PR Review</span>
            </button>
            <button onClick={() => setActiveTab('api')} className={`${styles.masterTabBtn} ${activeTab === 'api' ? styles.activeMasterTab : ''}`}>
              <VscGlobe size={14} /><span>API Inspector</span>
            </button>
            <button onClick={() => setActiveTab('dependencies')} className={`${styles.masterTabBtn} ${activeTab === 'dependencies' ? styles.activeMasterTab : ''}`}>
              <VscPackage size={14} /><span>Dependencies</span>
            </button>
            <button onClick={() => setActiveTab('gitgraph')} className={`${styles.masterTabBtn} ${activeTab === 'gitgraph' ? styles.activeMasterTab : ''}`}>
              <VscListTree size={14} /><span>Git Graph</span>
            </button>
          </div>
        </header>

        {/* Conditional Tab Views */}
        {activeTab === 'json' ? (
          <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', overflow: 'hidden', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#161b22', padding: '8px 14px', borderBottom: '1px solid #30363d' }}>
              <div style={{ fontSize: '12px', color: '#c9d1d9' }}>changelog.json ({ideMode} config)</div>
              <button 
                onClick={() => handleCopyCode('raw-json', rawJsonData)}
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#c9d1d9', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {copiedId === 'raw-json' ? <VscCheck size={12} color="#3fb950" /> : <VscCopy size={12} />}
                <span>{copiedId === 'raw-json' ? 'Copied JSON' : 'Copy Schema'}</span>
              </button>
            </div>
            <pre style={{ padding: '16px', margin: 0, color: '#a5d6ff', fontFamily: 'monospace', fontSize: '12.5px', overflowX: 'auto' }}>
              <code>{rawJsonData}</code>
            </pre>
          </div>
        ) : activeTab === 'pr' ? (
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '20px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e6edf3', fontWeight: 600 }}>
                <VscGitPullRequest size={18} color="#3fb950" />
                <span>PR #42: Refactoring {selectedSnippet.filename} ({selectedSnippet.path})</span>
              </div>
              <span style={{ 
                background: prStatus === 'merged' ? 'rgba(137, 87, 229, 0.15)' : prStatus === 'approved' ? 'rgba(63, 185, 80, 0.15)' : 'rgba(210, 153, 34, 0.15)',
                color: prStatus === 'merged' ? '#8957e5' : prStatus === 'approved' ? '#3fb950' : '#d29922',
                padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, border: '1px solid currentColor'
              }}>
                {prStatus.toUpperCase()}
              </span>
            </div>
            <p style={{ color: '#8b949e', fontSize: '13px', marginBottom: '16px' }}>
              Active File: <strong>{selectedSnippet.filename}</strong> • Route: <code>{selectedSnippet.path}</code> • Length: <strong>{editableCode.length} bytes</strong>
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setPrStatus('approved')} style={{ background: '#238636', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
                Approve Changes
              </button>
              <button onClick={() => setPrStatus('merged')} style={{ background: '#8957e5', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
                Merge Pull Request
              </button>
            </div>
          </div>
        ) : activeTab === 'api' ? (
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '20px', marginTop: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#e6edf3', marginBottom: '12px' }}>Interactive API Endpoints Inspector</div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button onClick={() => handleSendApiRequest('/api/v2/telemetry')} style={{ background: apiEndpoint === '/api/v2/telemetry' ? '#1f6feb' : '#21262d', color: '#fff', border: '1px solid #30363d', padding: '5px 10px', borderRadius: '4px', fontSize: '11.5px', cursor: 'pointer' }}>GET /api/v2/telemetry</button>
            </div>
            <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', padding: '14px', fontFamily: 'monospace', fontSize: '12.5px', color: '#7ee787', whiteSpace: 'pre-wrap' }}>
              {apiResponse}
            </div>
          </div>
        ) : activeTab === 'dependencies' ? (
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '20px', marginTop: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#e6edf3', marginBottom: '12px' }}>Workspace Package Dependencies</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#0d1117', padding: '10px 14px', borderRadius: '6px', border: '1px solid #30363d', fontSize: '12.5px', fontFamily: 'monospace' }}>
                <span style={{ color: '#58a6ff' }}>next</span>
                <span style={{ color: '#3fb950' }}>^15.0.0 (Secure • 0 Vulnerabilities)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#0d1117', padding: '10px 14px', borderRadius: '6px', border: '1px solid #30363d', fontSize: '12.5px', fontFamily: 'monospace' }}>
                <span style={{ color: '#58a6ff' }}>react</span>
                <span style={{ color: '#3fb950' }}>^19.0.0 (Secure • 0 Vulnerabilities)</span>
              </div>
            </div>
          </div>
        ) : activeTab === 'gitgraph' ? (
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '20px', marginTop: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#e6edf3', marginBottom: '12px' }}>Git Branch Commit Graph</div>
            <div style={{ fontFamily: 'monospace', fontSize: '12px', background: '#0d1117', padding: '16px', borderRadius: '6px', border: '1px solid #30363d', color: '#c9d1d9', lineHeight: '1.8' }}>
              {gitCommits.map((commit, idx) => (
                <div key={idx}>
                  * <span style={{ color: '#58a6ff' }}>{commit.hash}</span> {idx === 0 ? <strong style={{ color: '#3fb950' }}>(HEAD -&gt; main)</strong> : ''} {commit.message} <span style={{ color: '#8b949e' }}>({commit.time})</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Playground Tab */
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', marginTop: '16px' }}>
            
            {/* Left Sidebar: Snippet Collection with SVG Icons (No Close Buttons) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#8b949e', textTransform: 'uppercase', padding: '10px 12px 6px 12px', letterSpacing: '0.5px' }}>
                  Open Editors
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', background: '#0d1117' }}>
                  {snippets.map((snip) => {
                    const isActive = selectedSnippetId === snip.id;
                    return (
                      <button
                        key={snip.id}
                        onClick={() => handleSelectSnippet(snip)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          background: isActive ? '#161b22' : 'transparent',
                          border: 'none',
                          borderTop: isActive ? '2px solid #58a6ff' : '2px solid transparent',
                          borderBottom: isActive ? '1px solid #161b22' : '1px solid #21262d',
                          color: isActive ? '#e6edf3' : '#8b949e',
                          fontSize: '12px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontFamily: 'ui-monospace, monospace',
                          transition: 'all 0.1s ease',
                          width: '100%'
                        }}
                      >
                        <img src={snip.icon} alt={snip.filename} width={14} height={14} style={{ objectFit: 'contain' }} />
                        <span style={{ fontWeight: isActive ? 600 : 400 }}>{snip.filename}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cursor AI Composer Multi-file Agent Box */}
              {ideMode === 'cursor' && (
                <div style={{ background: 'linear-gradient(135deg, rgba(88,166,255,0.08), rgba(126,231,135,0.04))', border: '1px solid rgba(88,166,255,0.3)', borderRadius: '6px', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#58a6ff', marginBottom: '8px' }}>
                    <VscSparkle size={14} />
                    <span>Cursor Composer (Ctrl+I)</span>
                  </div>
                  <form onSubmit={handleRunComposerAgent} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder={`Ask AI agent to refactor ${selectedSnippet.filename}...`}
                      value={composerPrompt}
                      onChange={(e) => setComposerPrompt(e.target.value)}
                      style={{ background: '#0d1117', border: '1px solid #30363d', color: '#e6edf3', padding: '6px 8px', borderRadius: '4px', fontSize: '11.5px', outline: 'none' }}
                    />
                    <button
                      type="submit"
                      disabled={isComposerActive}
                      style={{ background: '#58a6ff', border: 'none', color: '#0d1117', fontWeight: 600, padding: '5px', borderRadius: '4px', fontSize: '11.5px', cursor: 'pointer' }}
                    >
                      {isComposerActive ? 'Agent Executing...' : 'Generate Multi-file Edit'}
                    </button>
                  </form>
                  {composerLogs.length > 0 && (
                    <div style={{ marginTop: '8px', background: '#0d1117', padding: '6px', borderRadius: '4px', fontSize: '10.5px', fontFamily: 'monospace', color: '#7ee787', maxHeight: '100px', overflowY: 'auto' }}>
                      {composerLogs.map((log, i) => <div key={i}>{log}</div>)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Main Area: Editor + Compiler Output */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Code Editor Window */}
              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#161b22', padding: '8px 14px', borderBottom: '1px solid #30363d' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#c9d1d9' }}>
                    <img src={selectedSnippet.icon} alt="" width={14} height={14} style={{ objectFit: 'contain' }} />
                    <span>Active File: {selectedSnippet.filename} ({ideMode.toUpperCase()})</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleCopyCode(selectedSnippetId, editableCode)}
                      style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#c9d1d9', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      {copiedId === selectedSnippetId ? <VscCheck size={12} color="#3fb950" /> : <VscCopy size={12} />}
                      <span>{copiedId === selectedSnippetId ? 'Copied' : 'Copy Code'}</span>
                    </button>
                    <button 
                      onClick={handleRunCode}
                      disabled={isRunning}
                      style={{ background: ideMode === 'jetbrains' ? '#f7df1e' : '#238636', border: 'none', color: ideMode === 'jetbrains' ? '#0d1117' : '#ffffff', padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <VscPlay size={12} />
                      <span>{isRunning ? 'Compiling...' : 'Run Script'}</span>
                    </button>
                  </div>
                </div>

                <textarea
                  value={editableCode}
                  onChange={(e) => setEditableCode(e.target.value)}
                  rows={10}
                  spellCheck={false}
                  style={{
                    width: '100%', background: 'transparent', border: 'none', outline: 'none',
                    color: '#e6edf3', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    fontSize: '13px', padding: '14px', resize: 'vertical', lineHeight: '1.5'
                  }}
                />
              </div>

              {/* Console Output Terminal */}
              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#161b22', padding: '8px 14px', borderBottom: '1px solid #30363d', fontSize: '12px', color: '#c9d1d9' }}>
                  <VscDebugConsole size={14} color="#3fb950" />
                  <span>Compiler & Diagnostics Output</span>
                </div>
                <div style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: '12px', color: '#7ee787', whiteSpace: 'pre-wrap' }}>
                  {consoleOutput}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}