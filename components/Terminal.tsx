'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  VscClose, 
  VscSplitHorizontal, 
  VscTrash, 
  VscChevronDown, 
  VscAdd,
  VscTerminal
} from 'react-icons/vsc';

import { THEME_KEYS } from '@/lib/themes';
import styles from '@/styles/Terminal.module.css';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success';
  content: string;
}

interface TerminalInstance {
  id: number;
  name: string;
  shell: string;
  lines: TerminalLine[];
  history: string[];
  historyIndex: number;
}

const availableCommands = [
  'help', 'about', 'skills', 'projects', 'contact', 
  'theme', 'themes', 'clear', 'date', 'whoami', 'ls', 'pwd', 
  'echo', 'neofetch', 'hire', 'git status', 'git log', 'git branch', 'github'
];

const commands: Record<string, () => string[]> = {
  help: () => [
    'Available portIDE & Git Commands:',
    '  help       - Show this help message',
    '  about      - Professional bio & background',
    '  skills     - Technical stack & certifications',
    '  projects   - View featured software & web applications',
    '  contact    - Get in touch / social links',
    '  git status - View current git repository status',
    '  git log    - View recent commit history',
    '  git branch - List active branch information',
    '  github     - Open GitHub repository info',
    '  neofetch   - Display system & developer overview',
    '  theme      - Change workspace theme (usage: theme <name>)',
    '  themes     - List available IDE color themes',
    '  hire       - Send an interview or hiring inquiry',
    '  clear      - Wipe terminal screen',
    '  date       - Show current system date & time',
    '  whoami     - Print current user session info',
    '  ls         - List virtual workspace directory contents',
    '  pwd        - Print working directory path',
  ],
  about: () => [
    "Hi, I'm Mohd Hamka!",
    'Software Engineering graduate with strong skills in full-stack web development, microservices architecture, and system design.',
  ],
  skills: () => [
    'Professional Tech Stack & Certifications:',
    '  Backend & API: PHP (Laravel), Python (FastAPI), Node.js, REST APIs',
    '  Frontend:     JavaScript, React, Next.js, Bootstrap, Tailwind CSS, Zustand',
    '  Databases:    MySQL, MariaDB, PostgreSQL, SQL, System Integration',
  ],
  projects: () => [
    'Featured Projects:',
    '  1. Price Checker System based on Student Budget (Lead Developer, 2024)',
    '  2. Ultimate Athletic Gym Management System (Head Developer & Support)',
    '  3. Arngren E-commerce System (Project Manager & Full-Stack Developer)',
  ],
  contact: () => [
    'Contact Information:',
    '  Email:    m.hamka017@gmail.com',
    '  GitHub:   github.com/mhdhamka',
  ],
  'git status': () => [
    'On branch main',
    'Your branch is up to date with \'origin/main\'.',
    '',
    'Changes not staged for commit:',
    '    modified:   src/components/Explorer.tsx',
    '    modified:   src/components/Terminal.tsx',
  ],
  'git log': () => [
    'commit 7f38a92 (HEAD -> main, origin/main)',
    'Author: Mohd Hamka <m.hamka017@gmail.com>',
    '    feat: split terminal split-screen grid layout added',
  ],
  'git branch': () => ['* main', '  feature/split-terminal'],
  github: () => ['GitHub Repository: https://github.com/mhdhamka'],
  neofetch: () => [
    '        /\\        visitor@portIDE',
    '       /  \\       ---------------',
    '      /\\   \\      OS: portIDE Web OS x86_64',
    '     /      \\     Role: Software Engineer',
  ],
  themes: () => ['Available Workspace Themes:', ...THEME_KEYS],
  date: () => [new Date().toString()],
  whoami: () => ['visitor@portIDE-workspace'],
  ls: () => ['src/', 'public/', 'styles/', 'package.json', 'README.md'],
  pwd: () => ['/home/visitor/portIDE-workspace'],
};

interface TerminalProps {
  onToggle: () => void;
}

const Terminal = ({ onToggle }: TerminalProps) => {
  const [terminals, setTerminals] = useState<TerminalInstance[]>([
    {
      id: 1,
      name: 'bash',
      shell: 'bash',
      lines: [
        { type: 'output', content: 'Microsoft Windows [Version 10.0.26200.8875]' },
        { type: 'output', content: 'Welcome to portIDE terminal v2.5.0. Type "help" for commands.' },
        { type: 'output', content: '' },
      ],
      history: [],
      historyIndex: -1,
    }
  ]);
  
  // Track multiple visible panes for split view
  const [splitPaneIds, setSplitPaneIds] = useState<number[]>([1]);
  const [activePaneId, setActivePaneId] = useState<number>(1);
  
  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [activeTab, setActiveTab] = useState<'problems' | 'output' | 'debug' | 'terminal' | 'ports'>('terminal');
  const [isShellMenuOpen, setIsShellMenuOpen] = useState(false);

  // Resizable state
  const [height, setHeight] = useState(260);
  const [isDragging, setIsDragging] = useState(false);

  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const terminalScrollRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    inputRefs.current[activePaneId]?.focus();
  }, [activePaneId, splitPaneIds]);

  useEffect(() => {
    splitPaneIds.forEach(id => {
      const el = terminalScrollRefs.current[id];
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, [terminals, splitPaneIds]);

  // Drag resize handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight >= 120 && newHeight <= window.innerHeight * 0.75) {
        setHeight(newHeight);
      }
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const processCommand = (inputStr: string, term: TerminalInstance) => {
    const trimmed = inputStr.trim();
    const newLines = [...term.lines, { type: 'input' as const, content: `guest@portIDE:~$ ${trimmed}` }];

    if (!trimmed) return newLines;

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    const fullCmd = trimmed.toLowerCase();

    if (cmd === 'clear') return [];

    if (cmd === 'theme' && args[0]) {
      const targetTheme = args[0].toLowerCase();
      if ((THEME_KEYS as string[]).includes(targetTheme)) {
        document.documentElement.setAttribute('data-theme', targetTheme);
        localStorage.setItem('theme', targetTheme);
        newLines.push({ type: 'success', content: `Success: Theme switched to "${targetTheme}".` });
      } else {
        newLines.push({ type: 'error', content: `Error: Unknown theme "${targetTheme}".` });
      }
      return newLines;
    }

    if (commands[fullCmd]) {
      commands[fullCmd]().forEach(line => newLines.push({ type: 'output', content: line }));
    } else if (commands[cmd]) {
      commands[cmd]().forEach(line => newLines.push({ type: 'output', content: line }));
    } else {
      newLines.push({ type: 'error', content: `zsh: command not found: ${trimmed}. Type "help" for commands.` });
    }

    return newLines;
  };

  const handleSubmit = (e: React.FormEvent, termId: number) => {
    e.preventDefault();
    const currentInput = inputs[termId] || '';
    const trimmed = currentInput.trim();

    setTerminals(prev => prev.map(t => {
      if (t.id === termId) {
        const updatedLines = processCommand(currentInput, t);
        const updatedHistory = trimmed ? [...t.history, trimmed] : t.history;
        return { ...t, lines: updatedLines, history: updatedHistory, historyIndex: -1 };
      }
      return t;
    }));

    setInputs(prev => ({ ...prev, [termId]: '' }));
  };

  const addNewTerminal = (shellType: string = 'bash') => {
    const newId = Date.now();
    const newTerm: TerminalInstance = {
      id: newId,
      name: `${shellType} (${terminals.length + 1})`,
      shell: shellType,
      lines: [
        { type: 'output', content: `Spawned new ${shellType} session.` },
        { type: 'output', content: 'Type "help" for commands.' },
        { type: 'output', content: '' },
      ],
      history: [],
      historyIndex: -1,
    };
    setTerminals(prev => [...prev, newTerm]);
    setSplitPaneIds([newId]); // Switch main view to new terminal tab
    setActivePaneId(newId);
    setIsShellMenuOpen(false);
  };

  const splitTerminal = () => {
    // Spawns a split view pane right next to current ones (VS Code style split)
    const newId = Date.now();
    const currentActiveTerm = terminals.find(t => t.id === activePaneId);
    const shellType = currentActiveTerm?.shell || 'bash';

    const newTerm: TerminalInstance = {
      id: newId,
      name: `${shellType} (split)`,
      shell: shellType,
      lines: [
        { type: 'output', content: `Split terminal session active.` },
        { type: 'output', content: '' },
      ],
      history: [],
      historyIndex: -1,
    };

    setTerminals(prev => [...prev, newTerm]);
    setSplitPaneIds(prev => [...prev, newId]); // Add to split view grid!
    setActivePaneId(newId);
  };

  const closePane = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (splitPaneIds.length === 1) {
      onToggle();
      return;
    }
    const remainingPanes = splitPaneIds.filter(paneId => paneId !== id);
    setSplitPaneIds(remainingPanes);
    setActivePaneId(remainingPanes[remainingPanes.length - 1]);
  };

  return (
    <div className={styles.terminalContainer} style={{ height: `${height}px` }}>
      <div 
        className={styles.resizeHandle} 
        onMouseDown={() => setIsDragging(true)}
        title="Drag to resize terminal"
      />

      {/* Header controls */}
      <div className={styles.panelHeader}>
        <div className={styles.panelTabs}>
          <button className={`${styles.panelTab} ${activeTab === 'problems' ? styles.activeTab : ''}`} onClick={() => setActiveTab('problems')}>
            PROBLEMS <span className={styles.badgeCount}>0</span>
          </button>
          <button className={`${styles.panelTab} ${activeTab === 'output' ? styles.activeTab : ''}`} onClick={() => setActiveTab('output')}>
            OUTPUT
          </button>
          <button className={`${styles.panelTab} ${activeTab === 'debug' ? styles.activeTab : ''}`} onClick={() => setActiveTab('debug')}>
            DEBUG CONSOLE
          </button>
          <button className={`${styles.panelTab} ${activeTab === 'terminal' ? styles.activeTab : ''}`} onClick={() => setActiveTab('terminal')}>
            TERMINAL
          </button>
          <button className={`${styles.panelTab} ${activeTab === 'ports' ? styles.activeTab : ''}`} onClick={() => setActiveTab('ports')}>
            PORTS
          </button>
        </div>

        <div className={styles.headerRightControls}>
          <div className={styles.shellSelectorContainer}>
            <div className={styles.shellSelector} onClick={() => setIsShellMenuOpen(prev => !prev)}>
              <span>💻 bash</span>
              <VscChevronDown size={12} />
            </div>

            {isShellMenuOpen && (
              <div className={styles.shellDropdownMenu}>
                <div className={styles.dropdownHeader}>Select Profile</div>
                <div onClick={() => addNewTerminal('bash')} className={styles.dropdownItem}>bash</div>
                <div onClick={() => addNewTerminal('zsh')} className={styles.dropdownItem}>zsh</div>
                <div onClick={() => addNewTerminal('pwsh')} className={styles.dropdownItem}>PowerShell</div>
              </div>
            )}
          </div>

          <button className={styles.headerBtn} onClick={() => addNewTerminal('bash')} title="New Terminal (+)">
            <VscAdd size={13} />
          </button>
          
          {/* Split Terminal button now splits screen side-by-side! */}
          <button className={styles.headerBtn} onClick={splitTerminal} title="Split Terminal">
            <VscSplitHorizontal size={13} />
          </button>

          <button className={styles.headerBtn} onClick={() => {
            setTerminals(prev => prev.map(t => t.id === activePaneId ? { ...t, lines: [] } : t));
          }} title="Clear">
            <VscTrash size={13} />
          </button>

          <button className={styles.headerBtn} onClick={onToggle} title="Close">
            <VscClose size={14} />
          </button>
        </div>
      </div>

      {/* Dynamic Multi-Pane Split Grid Body */}
      <div className={styles.splitGridContainer}>
        {activeTab === 'terminal' && splitPaneIds.map((paneId, idx) => {
          const term = terminals.find(t => t.id === paneId);
          if (!term) return null;
          const isPaneActive = activePaneId === paneId;

          return (
            <div 
              key={paneId} 
              className={`${styles.splitPane} ${isPaneActive ? styles.activeSplitPane : ''}`}
              onClick={() => setActivePaneId(paneId)}
            >
              <div className={styles.paneStatusBar}>
                <span className={styles.paneTitle}><VscTerminal size={12} /> {term.name}</span>
                <button className={styles.closePaneBtn} onClick={(e) => closePane(paneId, e)}>
                  <VscClose size={12} />
                </button>
              </div>

              <div className={styles.body} ref={el => { terminalScrollRefs.current[paneId] = el; }}>
                {term.lines.map((line, lIdx) => (
                  <div key={lIdx} className={`${styles.line} ${line.type === 'error' ? styles.error : line.type === 'success' ? styles.success : line.type === 'input' ? styles.inputLineText : ''}`}>
                    {line.content}
                  </div>
                ))}
                <form onSubmit={e => handleSubmit(e, paneId)} className={styles.inputForm}>
                  <span className={styles.prompt}>guest@portIDE:~$</span>
                  <input
                    ref={el => { inputRefs.current[paneId] = el; }}
                    type="text"
                    value={inputs[paneId] || ''}
                    onChange={e => setInputs(prev => ({ ...prev, [paneId]: e.target.value }))}
                    className={styles.input}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </form>
              </div>
            </div>
          );
        })}

        {activeTab !== 'terminal' && (
          <div className={styles.body} style={{ width: '100%' }}>
            {activeTab === 'problems' && <div className={styles.tabContentMessage}>No problems detected. 🎉</div>}
            {activeTab === 'output' && <div className={styles.tabContentMessage}>[Turbopack] Build successful.</div>}
            {activeTab === 'debug' && <div className={styles.tabContentMessage}>Debugger inactive.</div>}
            {activeTab === 'ports' && <div className={styles.tabContentMessage}>Port 3000 running Next.js.</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Terminal;