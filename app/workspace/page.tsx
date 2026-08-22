'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import GitHubCalendar from 'react-github-calendar';
import { 
  VscFolderOpened, 
  VscGithub, 
  VscLinkExternal, 
  VscSearch, 
  VscListTree,
  VscTable,
  VscLoading,
  VscArrowSwap,
  VscRepo,
  VscPerson,
  VscStarEmpty,
  VscRepoForked,
  VscFile,
  VscFolder,
  VscGitCommit,
  VscClose,
  VscCopy,
  VscCheck,
  VscHistory,
  VscPackage,
  VscTerminal,
  VscDebugConsole,
  VscCode,  
  VscSync
} from 'react-icons/vsc';

import ProjectCard from '@/components/WorkspaceCard';
import styles from '@/styles/Workspace.module.css';
import KanbanBoard from '@/components/KanbanBoard';
import DebuggerWidget from '@/components/DebuggerWidget';
import ApiTester from '@/components/ApiTester';

const projectImages: Record<string, string> = {
  "pcs": "/images/github/Price-Checker-System.png",
  "sandbox": "/images/github/DevSandBox.png",
  "smart": "/images/github/SmartHealth-System.png",
  "tree": "/images/github/Tree-Pacific-Database-System.png",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [githubUser, setGithubUser] = useState<any>(null);
  const [leetcodeData, setLeetcodeData] = useState<any>(null);
  const [recentCommits, setRecentCommits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
  const [sortBy, setSortBy] = useState<'updated' | 'stars'>('updated');
  
  // VS Code Workspace States
  const [openTabs, setOpenTabs] = useState<any[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[12:00:01 AM] [Turbopack] Initializing Next.js 16 App Router...',
    '[12:00:02 AM] [portIDE] Workspace loaded successfully for mhdhamka.',
    '[12:00:02 AM] [Git] Repository sync status: up to date with origin/main.',
    '[12:00:03 AM] [Copilot] AI Assistant models indexed and ready.'
  ]);
  const [showTerminal, setShowTerminal] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // GitHub Modal & Copy States
  const [activeModalRepo, setActiveModalRepo] = useState<any | null>(null);
  const [repoContents, setRepoContents] = useState<any[]>([]);
  const [packageJsonDeps, setPackageJsonDeps] = useState<Record<string, string> | null>(null);
  const [loadingContents, setLoadingContents] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ name: string; path: string; content: string } | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const cmdInputRef = useRef<HTMLInputElement>(null);

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1200);
  };

  const getGitHubHeaders = () => {
  const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  return {
    Accept: 'application/vnd.github.v3+json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

  // 1. Change your ref name to target the terminal body container:
  const terminalBodyRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setTerminalLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        setTimeout(() => cmdInputRef.current?.focus(), 50);
        addLog('Opened VS Code Command Palette.');
      }
      if (((e.metaKey || e.ctrlKey) && e.key === 'k') || e.key === '/') {
        if (!isCommandPaletteOpen) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
      if (e.key === 'Escape') {
        setActiveModalRepo(null);
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    async function fetchDeveloperData() {
      try {
        const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'mhdhamka';
        const leetcodeUsername = process.env.NEXT_PUBLIC_LEETCODE_USERNAME || 'mhdhamka';
        
        addLog(`Connecting to GitHub API for @${username}...`);
        
        // 1. GitHub User Profile
        const userRes = await fetch(`https://api.github.com/users/${username}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          setGithubUser(userData);
          addLog(`User profile loaded: ${userData.public_repos} public repos.`);
        }

        // 2. LeetCode Stats API
        try {
          addLog(`Fetching LeetCode problem stats via internal API proxy...`);
          const lcRes = await fetch('/api/leetcode');
          if (lcRes.ok) {
            const lcJson = await lcRes.json();
            addLog(`LeetCode synced successfully: ${lcJson.totalSolved} total problems solved.`); 
            
            if (lcJson && (lcJson.totalSolved !== undefined || lcJson.solved !== undefined)) {
              setLeetcodeData(lcJson);
              addLog(`LeetCode synced successfully.`);
            } else {
              setLeetcodeData({ totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0 });
              addLog(`LeetCode profile format unrecognized.`);
            }
          }
        } catch (lcErr) {
          console.warn('LeetCode fetch failed:', lcErr);
          setLeetcodeData({ totalSolved: 'Offline', easySolved: 0, mediumSolved: 0, hardSolved: 0 });
        }

        // Helper function to smartly summarize and clean README markdown
        const summarizeReadme = (markdown: string): string => {
          if (!markdown) return 'No description provided.';

          let clean = markdown.replace(/\[?!\[.*?\]\(.*?\)\]\(.*?\)/g, '');
          clean = clean.replace(/!\[.*?\]\(.*?\)/g, '');

          clean = clean.replace(/```[\s\S]*?```/g, '');
          clean = clean.replace(/`.*?`/g, '');

          clean = clean.replace(/#{1,6}\s+/g, '');
          clean = clean.replace(/<[^>]*>/g, '');
          clean = clean.replace(/---|\*\*\*|___/g, '');

          clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

          const paragraphs = clean
            .split('\n')
            .map(p => p.trim())
            .filter(p => p.length > 20 && !p.startsWith('http') && !p.toLowerCase().includes('license'));

          const summarySource = paragraphs.length > 0 ? paragraphs[0] : clean;

          if (summarySource.length > 170) {
            const truncated = summarySource.substring(0, 170);
            const lastSpace = truncated.lastIndexOf(' ');
            return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
          }

          return summarySource || 'No description provided.';
        };

        // 3. Repositories & Smart README Summarization
        const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`, {
          headers: getGitHubHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch repositories');
        const data = await res.json();

        const formattedRepos = await Promise.all(
          data.map(async (repo: any) => {
            let description = repo.description || 'No description provided.';

            try {
              const readmeRes = await fetch(`https://api.github.com/repos/${username}/${repo.name}/readme`, {
                headers: getGitHubHeaders()
              });

              if (readmeRes.ok) {
                const readmeData = await readmeRes.json();
                const decodedContent = atob(readmeData.content.replace(/\n/g, ''));
                
                // Apply the smart summarizer
                const smartSummary = summarizeReadme(decodedContent);
                if (smartSummary && smartSummary !== 'No description provided.') {
                  description = smartSummary;
                }
              }
            } catch (err) {
              // Fallback to standard repo description if README is missing or fails
            }

            return {
              id: repo.id,
              title: repo.name,
              slug: repo.name,
              description: description,
              url: repo.html_url,
              link: repo.html_url,
              cloneUrl: repo.clone_url,
              tags: [repo.language, ...(repo.topics || [])].filter(Boolean),
              stars: repo.stargazers_count,
              forks: repo.forks_count,
              updatedAt: repo.updated_at,
              language: repo.language,
              image: projectImages[repo.name] || undefined, 
            };
          })
        );

        setProjects(formattedRepos);
        addLog(`Successfully indexed and summarized ${formattedRepos.length} repositories.`);

        if (formattedRepos.length > 0) {
          setOpenTabs([formattedRepos[0]]);
          setActiveTabId(formattedRepos[0].slug);
        }

        // 4. Commit Stream
        const eventsRes = await fetch(`https://api.github.com/users/${username}/events/public?per_page=5`);
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          const pushEvents = eventsData
            .filter((ev: any) => ev.type === 'PushEvent')
            .map((ev: any) => ({
              id: ev.id,
              repo: ev.repo.name,
              message: ev.payload.commits?.[0]?.message || 'Pushed commits',
              date: ev.created_at,
              url: `https://github.com/${ev.repo.name}`
            }));
          setRecentCommits(pushEvents);
        }
      } catch (error) {
        console.error('Error loading developer data:', error);
        addLog(`Error: Failed to fetch API telemetry.`);
      } finally {
        setLoading(false);
      }
    }

    fetchDeveloperData();
  }, []);

  const handleOpenRepoModal = async (project: any) => {
    setActiveModalRepo(project);
    setLoadingContents(true);
    setPackageJsonDeps(null);
    setSelectedFile(null);
    setCurrentPath('');
    addLog(`Inspecting repository contents: ${project.title}`);

    if (!openTabs.some((t) => t.slug === project.slug)) {
      setOpenTabs((prev) => [...prev, project]);
    }
    setActiveTabId(project.slug);

    try {
      const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'mhdhamka';
      const res = await fetch(`https://api.github.com/repos/${username}/${project.title}/contents`, {
        headers: getGitHubHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch contents');
      const data = await res.json();
      setRepoContents(data);

      const pkgFile = data.find((file: any) => file.name === 'package.json' || file.name === 'composer.json');
      if (pkgFile) {
        const rawRes = await fetch(pkgFile.download_url);
        if (rawRes.ok) {
          const pkgData = await rawRes.json();
          setPackageJsonDeps(pkgData.dependencies || pkgData.require || null);
          addLog(`Detected dependency manifest in ${project.title}`);
        }
      }
    } catch (err) {
      console.error('Error fetching contents:', err);
      setRepoContents([]);
    } finally {
      setLoadingContents(false);
    }
  };

  // Handle clicking items in the explorer (Drills down into directories or peeks files)
  const handleItemClick = async (item: any) => {
    const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'mhdhamka';

    if (item.type === 'dir') {
      try {
        setLoadingContents(true);
        const res = await fetch(`https://api.github.com/repos/${username}/${activeModalRepo.title}/contents/${item.path}`, {
          headers: getGitHubHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch subfolder');
        const data = await res.json();
        
        setRepoContents(data);
        setCurrentPath(item.path);
        addLog(`Opened folder: ${item.path}`);
      } catch (err) {
        console.error('Error fetching subfolder:', err);
      } finally {
        setLoadingContents(false);
      }
    } else {
      try {
        setFileLoading(true);
        setSelectedFile({ name: item.name, path: item.path, content: '// Loading snippet preview...' });
        
        const res = await fetch(`https://api.github.com/repos/${username}/${activeModalRepo.title}/contents/${item.path}`, {
          headers: { Accept: 'application/vnd.github.v3+json' }
        });
        if (!res.ok) throw new Error('Failed to fetch file content');
        
        const fileData = await res.json();
        // UTF-8 safe decode preventing encoding character glitches
        const decodedContent = decodeURIComponent(escape(atob(fileData.content.replace(/\n/g, ''))));
        const lines = decodedContent.split('\n');
        const snippet = lines.slice(0, 35).join('\n');
        const isTruncated = lines.length > 35;

        setSelectedFile({
          name: item.name,
          path: item.path,
          content: isTruncated ? `${snippet}\n\n// ... [Snippet truncated for preview] ...` : snippet
        });
        addLog(`Loaded preview for: ${item.path}`);
      } catch (err) {
        setSelectedFile({
          name: item.name,
          path: item.path,
          content: '// Error loading file content or binary file.'
        });
      } finally {
        setFileLoading(false);
      }
    }
  };

  // Handle navigating back up parent directories
  const handleGoBack = async () => {
    if (!currentPath) return;
    
    const pathSegments = currentPath.split('/');
    pathSegments.pop();
    const parentPath = pathSegments.join('/');

    const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'mhdhamka';
    setLoadingContents(true);

    try {
      const res = await fetch(`https://api.github.com/repos/${username}/${activeModalRepo.title}/contents/${parentPath}`, {
        headers: { Accept: 'application/vnd.github.v3+json' }
      });
      if (!res.ok) throw new Error('Failed to fetch parent directory');
      const data = await res.json();

      setRepoContents(data);
      setCurrentPath(parentPath);
      addLog(`Navigated back to: ${parentPath || 'root'}`);
    } catch (err) {
      console.error('Error navigating back:', err);
    } finally {
      setLoadingContents(false);
    }
  };

  const handleCloseTab = (e: React.MouseEvent, slug: string) => {
    e.stopPropagation();
    const newTabs = openTabs.filter((t) => t.slug !== slug);
    setOpenTabs(newTabs);
    if (activeTabId === slug && newTabs.length > 0) {
      setActiveTabId(newTabs[newTabs.length - 1].slug);
    }
  };

  const handleCopyCloneUrl = (e: React.MouseEvent, cloneUrl: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cloneUrl);
    setCopiedUrl(cloneUrl);
    setTimeout(() => setCopiedUrl(null), 2000);
    addLog(`Copied clone URL to clipboard.`);
  };

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    projects.forEach((p: any) => {
      p.tags?.forEach((t: string) => tagsSet.add(t));
    });
    return ['All', ...Array.from(tagsSet)];
  }, [projects]);

  const languageStats = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    projects.forEach((p) => {
      if (p.language) {
        counts[p.language] = (counts[p.language] || 0) + 1;
        total += 1;
      }
    });

    const langColors: Record<string, string> = {
      TypeScript: '#3178c6',
      JavaScript: '#f1e05a',
      PHP: '#4F5D95',
      Python: '#3572A5',
      HTML: '#e34c26',
      CSS: '#563d7c',
    };

    return Object.keys(counts).map((lang) => ({
      name: lang,
      percentage: total > 0 ? Math.round((counts[lang] / total) * 100) : 0,
      color: langColors[lang] || '#8b949e',
    }));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects
      .filter((project: any) => {
        const matchesSearch = 
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesTag = selectedTag === 'All' || project.tags?.includes(selectedTag);

        return matchesSearch && matchesTag;
      })
      .sort((a, b) => {
        if (sortBy === 'stars') {
          return b.stars - a.stars;
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [projects, searchQuery, selectedTag, sortBy]);

  const totalStars = useMemo(() => projects.reduce((acc, curr) => acc + (curr.stars || 0), 0), [projects]);
  const totalForks = useMemo(() => projects.reduce((acc, curr) => acc + (curr.forks || 0), 0), [projects]);

  return (
    <div className={styles.page}>

      {/* VS Code & Git Top Telemetry Bar for workspace.tsx */}
      <div className={styles.ideTopBar}>
        <div className={styles.workspaceBreadcrumb}>
          <span className={styles.folderRoot}>portIDE</span>
          <span className={styles.separator}>/</span>
          <span className={styles.folderSub}>workspace</span>
          <span className={styles.separator}>/</span>
          <span className={styles.activeFile}>workspace.tsx</span>
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
      
      {/* VS Code Split-Pane Editor Tabs Bar */}
      {openTabs.length > 0 && (
        <div className={styles.editorTabBar}>
          <div className={styles.tabsContainer}>
            {openTabs.map((tab) => (
              <div 
                key={tab.slug}
                onClick={() => handleOpenRepoModal(tab)}
                className={`${styles.editorTab} ${activeTabId === tab.slug ? styles.activeEditorTab : ''}`}
              >
                <VscFolder size={13} color="#79c0ff" />
                <span>{tab.title}</span>
                <button className={styles.tabCloseBtn} onClick={(e) => handleCloseTab(e, tab.slug)}>
                  <VscClose size={12} />
                </button>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setIsCommandPaletteOpen(true)}
            className={styles.paletteTriggerBtn}
            title="Open Command Palette (Cmd+Shift+P)"
          >
            <span>Command Palette</span>
            <span className={styles.cmdBadge}>⌘P</span>
          </button>
        </div>
      )}

      <div className={styles.container}>
        
        {/* GitHub Profile Card Header */}
        {githubUser && (
          <header className={styles.githubProfileHeader}>
            <div className={styles.profile}>
              <Image
                src={githubUser.avatar_url}
                className={styles.avatar}
                alt={githubUser.login}
                width={70}
                height={70}
                priority
              />
              <div className={styles.profileInfo}>
                <h1 className={styles.name}>{githubUser.name || githubUser.login}</h1>
                <span className={styles.handle}>@{githubUser.login}</span>
              </div>
            </div>

            <a 
              href={githubUser.html_url}
              target="_blank"
              rel="noreferrer"
              className={styles.profileLink}
            >
              <VscGithub size={18} />
              <span>View Profile</span>
              <VscLinkExternal size={14} />
            </a>
          </header>
        )}

        {/* Dual Stats Grid (GitHub + LeetCode) */}
        <div className={styles.developerStatsGrid}>
          {/* GitHub Stats Cards */}
          <div className={styles.statsSubGroup}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><VscRepo size={20} /></div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{githubUser?.public_repos || projects.length}</span>
                <span className={styles.statLabel}>Repositories</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><VscStarEmpty size={20} /></div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{totalStars}</span>
                <span className={styles.statLabel}>Total Stars</span>
              </div>
            </div>
          </div>

          {/* LeetCode Stats Card Widget */}
          <div className={styles.leetCodeCard}>
            <div className={styles.leetCodeHeader}>
              <div className={styles.lcTitleGroup}>
                <VscCode size={18} color="#f79f1b" />
                <span>LeetCode Problem Solving</span>
              </div>
              <span className={styles.lcTotalBadge}>
                {leetcodeData ? `${leetcodeData.totalSolved} Solved` : 'Syncing...'}
              </span>
            </div>
            {leetcodeData ? (
              <div className={styles.lcBreakdown}>
                <div className={styles.lcItem}>
                  <span className={styles.lcLevel}>Easy</span>
                  <span className={styles.lcCount}>{leetcodeData.easySolved}</span>
                </div>
                <div className={styles.lcItem}>
                  <span className={styles.lcLevel}>Medium</span>
                  <span className={styles.lcCount}>{leetcodeData.mediumSolved}</span>
                </div>
                <div className={styles.lcItem}>
                  <span className={styles.lcLevel}>Hard</span>
                  <span className={styles.lcCount}>{leetcodeData.hardSolved}</span>
                </div>
              </div>
            ) : (
              <div className={styles.lcLoading}>Loading algorithm telemetry...</div>
            )}
          </div>
        </div>

        {/* Live Commit Feed / Activity Stream */}
        {recentCommits.length > 0 && (
          <div className={styles.activityTicker}>
            <div className={styles.tickerHeader}>
              <VscHistory size={15} color="#58a6ff" />
              <span>Live Commit Activity Stream</span>
            </div>
            <div className={styles.tickerList}>
              {recentCommits.slice(0, 3).map((commit) => (
                <a key={commit.id} href={commit.url} target="_blank" rel="noreferrer" className={styles.tickerItem}>
                  <VscGitCommit size={13} color="#3fb950" />
                  <span className={styles.tickerRepo}>{commit.repo.split('/')[1]}:</span>
                  <span className={styles.tickerMsg}>{commit.message}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Contribution Heatmap Activity Graph */}
        <section className={styles.section}>
          <h2 className={styles.sectionSubTitle}>Contribution Activity</h2>
          <div className={styles.contributions}>
            <GitHubCalendar
              username={process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'mhdhamka'}
              hideColorLegend
              hideMonthLabels={false}
              colorScheme="dark"
              theme={{
                dark: ['#161B22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                light: ['#161B22', '#0e4429', '#006d32', '#26a641', '#39d353'],
              }}
              style={{ width: '100%' }}
            />
          </div>
        </section>

         {/* Kanban, Debugger, & API Interactive session */}
          <div className={styles.container}>
            {/* Add the Kanban Tracker Component */}
            <KanbanBoard />
            <DebuggerWidget />
            <ApiTester />
          </div>

        {/* Repositories Section Header & Controls */}
        <section className={styles.section}>
          <div className={styles.headerTop}>
            <div className={styles.iconWrapper}>
              <VscFolderOpened className={styles.icon} size={24} />
            </div>
            <div className={styles.meta}>
              <span className={styles.count}>
                {loading ? 'Syncing with GitHub...' : `${filteredProjects.length} Filtered Repos`}
              </span>
            </div>
            
            <div className={styles.controlsGroup}>
              <button 
                onClick={() => {
                  const nextSort = sortBy === 'updated' ? 'stars' : 'updated';
                  setSortBy(nextSort);
                  addLog(`Sorted projects by ${nextSort === 'stars' ? 'Star Count' : 'Last Updated'}`);
                }}
                className={styles.sortBtn}
                title={`Sorting by: ${sortBy === 'updated' ? 'Last Updated' : 'Star Count'}`}
              >
                <VscArrowSwap size={14} />
                <span>{sortBy === 'updated' ? 'Recent' : 'Starred'}</span>
              </button>

              <div className={styles.viewToggle}>
                <button 
                  onClick={() => setViewMode('timeline')} 
                  className={`${styles.toggleBtn} ${viewMode === 'timeline' ? styles.activeToggle : ''}`}
                  title="Timeline View"
                >
                  <VscListTree size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('grid')} 
                  className={`${styles.toggleBtn} ${viewMode === 'grid' ? styles.activeToggle : ''}`}
                  title="Grid View"
                >
                  <VscTable size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className={styles.headerContent}>
            <h2 className={styles.title}>Live Repositories</h2>
            <p className={styles.subtitle}>
              Click any repository card to open it in an editor tab.
            </p>
          </div>

          {/* GitHub Language Breakdown Bar */}
          {!loading && languageStats.length > 0 && (
            <div className={styles.langBarContainer}>
              <div className={styles.langBar}>
                {languageStats.map((lang) => (
                  <div 
                    key={lang.name}
                    className={styles.langSegment}
                    style={{ width: `${lang.percentage}%`, background: lang.color }}
                    title={`${lang.name}: ${lang.percentage}%`}
                  />
                ))}
              </div>
              <div className={styles.langLegend}>
                {languageStats.map((lang) => (
                  <span key={lang.name} className={styles.langItem}>
                    <span className={styles.langDot} style={{ background: lang.color }} />
                    {lang.name} {lang.percentage}%
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <VscSearch size={16} className={styles.searchIcon} />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search live repositories... (Press '/' to focus)" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              <span className={styles.kbdShortcut}>⌘K</span>
            </div>

            <div className={styles.filterScroll}>
              {allTags.slice(0, 6).map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTag(tag);
                    addLog(`Applied filter tag: ${tag}`);
                  }}
                  className={`${styles.filterPill} ${selectedTag === tag ? styles.activePill : ''}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        {loading ? (
          <div className={styles.emptyState} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            <VscLoading className={styles.spinner} size={20} />
            <span>Fetching repositories from GitHub API...</span>
          </div>
        ) : (
          <div className={viewMode === 'timeline' ? styles.timeline : styles.gridContainer}>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project: any, index: number) => (
                <div key={project.slug} style={{ position: 'relative' }}>
                  <div onClick={() => handleOpenRepoModal(project)} style={{ cursor: 'pointer' }}>
                    <ProjectCard 
                      project={project}
                      index={index + 1}
                    />
                  </div>
                  <button 
                    onClick={(e) => handleCopyCloneUrl(e, project.cloneUrl)}
                    className={styles.quickCopyBtn}
                    title="Copy Git Clone URL"
                  >
                    {copiedUrl === project.cloneUrl ? <VscCheck size={14} color="#3fb950" /> : <VscCopy size={14} />}
                    <span>{copiedUrl === project.cloneUrl ? 'Copied!' : 'Clone'}</span>
                  </button>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>// No live repositories found matching your filter criteria.</p>
              </div>
            )}
          </div>
        )}

        {/* VS Code Command Palette Modal */}
        {isCommandPaletteOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsCommandPaletteOpen(false)}>
            <div className={styles.paletteModalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.paletteHeader}>
                <VscTerminal size={16} color="#58a6ff" />
                <input 
                  ref={cmdInputRef}
                  type="text"
                  placeholder="Type a command (e.g., 'sort stars', 'view grid')..."
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  className={styles.paletteInput}
                />
              </div>
              <div className={styles.paletteCommandList}>
                <div 
                  className={styles.paletteCommandItem} 
                  onClick={() => { setSortBy('stars'); setIsCommandPaletteOpen(false); addLog('Sorted by Stars'); }}
                >
                  <span>View: Sort repositories by Star Count</span>
                  <span className={styles.cmdKey}>Stars</span>
                </div>
                <div 
                  className={styles.paletteCommandItem} 
                  onClick={() => { setSortBy('updated'); setIsCommandPaletteOpen(false); addLog('Sorted by Recent'); }}
                >
                  <span>View: Sort repositories by Last Updated</span>
                  <span className={styles.cmdKey}>Recent</span>
                </div>
                <div 
                  className={styles.paletteCommandItem} 
                  onClick={() => { setViewMode(viewMode === 'grid' ? 'timeline' : 'grid'); setIsCommandPaletteOpen(false); }}
                >
                  <span>View: Toggle Grid / Timeline layout</span>
                  <span className={styles.cmdKey}>Layout</span>
                </div>
                <div 
                  className={styles.paletteCommandItem} 
                  onClick={() => { setSearchQuery(''); setSelectedTag('All'); setIsCommandPaletteOpen(false); addLog('Reset all filters'); }}
                >
                  <span>Filter: Clear search query and tags</span>
                  <span className={styles.cmdKey}>Reset</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GitHub-style File Explorer & Dependency Modal */}
        {activeModalRepo && (
          <div className={styles.modalOverlay} onClick={() => setActiveModalRepo(null)}>
            <div className={styles.modalContentWide} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <div className={styles.modalTitleWrapper}>
                  <VscRepo size={18} className={styles.modalRepoIcon} />
                  <span className={styles.modalOwner}>{githubUser?.login || 'mhdhamka'}</span>
                  <span className={styles.modalSlash}>/</span>
                  <span className={styles.modalRepoName}>{activeModalRepo.title}</span>
                  <span className={styles.modalBadge}>Public Workspace</span>
                </div>
                <button className={styles.closeBtn} onClick={() => setActiveModalRepo(null)}>
                  <VscClose size={18} />
                </button>
              </div>

              <div className={styles.modalRepoInfoBar}>
                <div className={styles.commitMeta}>
                  <VscGitCommit size={14} />
                  <span>Latest synced release snapshot • Click folders to navigate, files to preview</span>
                </div>
                <a href={activeModalRepo.url} target="_blank" rel="noreferrer" className={styles.modalGitLink}>
                  <VscGithub size={14} /> View on GitHub <VscLinkExternal size={12} />
                </a>
              </div>

              {packageJsonDeps && (
                <div className={styles.dependencyBox}>
                  <div className={styles.depHeader}>
                    <VscPackage size={14} color="#58a6ff" />
                    <span>Detected Stack Dependencies / Packages</span>
                  </div>
                  <div className={styles.depTags}>
                    {Object.keys(packageJsonDeps).slice(0, 6).map((dep) => (
                      <span key={dep} className={styles.depTag}>{dep}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Split Pane Layout: File Tree + Code Snippet Previewer */}
              <div className={styles.modalSplitView}>
                {/* Left Side: File Explorer Tree */}
                <div className={styles.fileExplorerBox}>
                  <div className={styles.fileExplorerHeader}>
                    <span>{currentPath ? `/${currentPath}` : 'Root'}</span>
                    <span>Type</span>
                  </div>

                  {/* Go Back / Parent Directory Button */}
                  {currentPath && (
                    <div className={styles.fileItem} onClick={handleGoBack}>
                      <span className={styles.fileName}>
                        <VscFolder size={15} color="#79c0ff" />
                        <span className={styles.fileLinkText}>.. (Back)</span>
                      </span>
                      <span className={styles.fileTypeTag}>DIR</span>
                    </div>
                  )}

                  {loadingContents ? (
                    <div className={styles.modalLoading}>
                      <VscLoading className={styles.spinner} size={18} />
                      <span>Fetching repository tree...</span>
                    </div>
                  ) : repoContents.length > 0 ? (
                    <div className={styles.fileList}>
                      {repoContents.map((item: any) => (
                        <div 
                          key={item.sha || item.name} 
                          className={`${styles.fileItem} ${selectedFile?.path === item.path ? styles.activeFileItem : ''}`}
                          onClick={() => handleItemClick(item)}
                        >
                          <span className={styles.fileName}>
                            {item.type === 'dir' ? <VscFolder size={15} color="#79c0ff" /> : <VscFile size={15} color="#8b949e" />}
                            <span className={styles.fileLinkText}>{item.name}</span>
                          </span>
                          <span className={styles.fileTypeTag}>{item.type.toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.modalLoading}>
                      <span>Directory is empty.</span>
                    </div>
                  )}
                </div>

                {/* Right Side: Code Snippet / AI Summary Preview Pane */}
                <div className={styles.codePreviewPane}>
                  <div className={styles.previewHeader}>
                    <div className={styles.previewTab}>
                      <VscCode size={14} color="#58a6ff" />
                      <span>{selectedFile ? selectedFile.path : 'Select a file to peek snippet'}</span>
                    </div>
                    {selectedFile && (
                      <a href={`https://github.com/${githubUser?.login || 'mhdhamka'}/${activeModalRepo.title}/blob/main/${selectedFile.path}`} target="_blank" rel="noreferrer" className={styles.rawFileLink}>
                        Full File <VscLinkExternal size={11} />
                      </a>
                    )}
                  </div>
                  <div className={styles.previewBody}>
                    {fileLoading ? (
                      <div className={styles.modalLoading}>
                        <VscLoading className={styles.spinner} size={18} />
                        <span>Fetching and parsing file snippet...</span>
                      </div>
                    ) : selectedFile ? (
                      <pre className={styles.codeSnippetPre}>
                        <code>{selectedFile.content}</code>
                      </pre>
                    ) : (
                      <div className={styles.emptyPreviewState}>
                        <VscCode size={36} color="#30363d" />
                        <p>Click any file from the left repository tree to instantly view its source code snippet and summary.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        <footer className={styles.footer}>
          <div className={styles.footerLine} />
          <a 
            href={githubUser?.html_url || "https://github.com/mhdhamka?tab=repositories"}
            target="_blank"
            rel="noreferrer"
            className={styles.footerLink}
          >
            <VscGithub size={18} />
            <span>Explore all repositories on GitHub</span>
            <VscLinkExternal size={14} />
          </a>
        </footer>

      </div>

      {/* VS Code Bottom Terminal Console Bar */}
        <div className={`${styles.terminalConsole} ${isFullscreen ? styles.isFullscreen : ''}`}>
          <div className={styles.terminalBarHeader}>
            <div className={styles.terminalTitleGroup} onClick={() => setShowTerminal(!showTerminal)}>
              <VscDebugConsole size={14} color="#58a6ff" />
              <span className={styles.breadcrumbPath}>portIDE</span>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.breadcrumbCurrent}>workspace</span>
              <span className={styles.breadcrumbDivider}>•</span>
              <span className={styles.telemetryLabel}>OUTPUT / TERMINAL TELEMETRY</span>
            </div>
            <div className={styles.terminalActions}>
              <button 
                className={styles.actionBtn} 
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Restore size" : "Maximize terminal"}
              >
                {isFullscreen ? '❐' : '□'}
              </button>
              <span className={styles.toggleTerminalText} onClick={() => setShowTerminal(!showTerminal)}>
                {showTerminal ? '▼ Hide' : '▲ Show'}
              </span>
            </div>
          </div>
          {showTerminal && (
            <div ref={terminalBodyRef} className={styles.terminalBody}>
              {terminalLogs.map((log, index) => (
                <div key={index} className={styles.terminalLine}>{log}</div>
              ))}
            </div>
          )}
        </div>

    </div>
  );
}