'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
// @ts-ignore
import { GitHubCalendar } from 'react-github-calendar';
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
  VscSync,
  VscChevronDown
} from 'react-icons/vsc';

import ProjectCard from '@/components/WorkspaceCard';
import styles from '@/styles/Workspace.module.css';
import KanbanBoard from '@/components/KanbanBoard';

function getLanguageColor(language: string): string {
  if (!language) return '#8b949e';

  // Official GitHub Linguist color map with normalized lowercase keys
  const githubColors: Record<string, string> = {
    javascript: '#f7df1e',
    typescript: '#3178c6',
    python: '#3572A5',
    html: '#e34c26',
    css: '#563d7c',
    java: '#b07219',
    c: '#555555',
    'c++': '#f34b7d',
    'c#': '#178600',
    php: '#4F5D95',
    go: '#00ADD8',
    rust: '#dea584',
    ruby: '#701516',
    swift: '#ffac45',
    kotlin: '#A97BFF',
    dart: '#00B4AB',
    shell: '#89e051',
    vue: '#41b883',
    svelte: '#ff3e00',
    jupyter: '#DA5B0B',
  };

  const normalized = language.toLowerCase();
  if (githubColors[normalized]) {
    return githubColors[normalized];
  }

  // Fallback hash for any custom or unique tags
  let hash = 0;
  for (let i = 0; i < language.length; i++) {
    hash = language.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

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
  
  // Helper function to generate real-time timestamps
  const getTimestamp = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    `[${getTimestamp()}] [Turbopack] Initializing Next.js 16 App Router...`,
    `[${getTimestamp()}] [portIDE] Workspace loaded successfully for mhdhamka.`,
    `[${getTimestamp()}] [Git] Repository sync status: up to date with origin/main.`,
    `[${getTimestamp()}] [Copilot] AI Assistant models indexed and ready.`
  ]);
  const [showTerminal, setShowTerminal] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // GitHub Modal & Copy States
  const [activeModalRepo, setActiveModalRepo] = useState<any | null>(null);
  const [repoContents, setRepoContents] = useState<any[]>([]);
  const [packageJsonDeps, setPackageJsonDeps] = useState<Record<string, string> | null>(null);
  const [loadingContents, setLoadingContents] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  
  const [selectedFile, setSelectedFile] = useState<{ name: string; path: string; rawLines: string[] } | null>(null);
  const [visibleLinesCount, setVisibleLinesCount] = useState<number>(50);
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

  const terminalBodyRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setTerminalLogs((prev) => [...prev, `[${getTimestamp()}] ${msg}`]);
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
            if (lcJson && (lcJson.totalSolved !== undefined || lcJson.solved !== undefined)) {
              setLeetcodeData(lcJson);
              addLog(`LeetCode synced successfully.`);
            } else {
              setLeetcodeData({ totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0 });
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
          clean = clean.replace(/```[\s\S]*?```/g, '').replace(/`.*?`/g, '');
          clean = clean.replace(/#{1,6}\s+/g, '').replace(/<[^>]*>/g, '').replace(/---|\*\*\*|___/g, '');
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
                const smartSummary = summarizeReadme(decodedContent);
                if (smartSummary && smartSummary !== 'No description provided.') {
                  description = smartSummary;
                }
              }
            } catch (err) {
              // Fallback to description
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
        setSelectedFile({ name: item.name, path: item.path, rawLines: ['// Loading source file contents...'] });
        setVisibleLinesCount(50);
        
        const res = await fetch(`https://api.github.com/repos/${username}/${activeModalRepo.title}/contents/${item.path}`, {
          headers: { Accept: 'application/vnd.github.v3+json' }
        });
        if (!res.ok) throw new Error('Failed to fetch file content');
        
        const fileData = await res.json();
        const decodedContent = decodeURIComponent(escape(atob(fileData.content.replace(/\n/g, ''))));
        const lines = decodedContent.split('\n');

        setSelectedFile({
          name: item.name,
          path: item.path,
          rawLines: lines
        });
        addLog(`Loaded file preview for: ${item.path} (${lines.length} lines)`);
      } catch (err) {
        setSelectedFile({
          name: item.name,
          path: item.path,
          rawLines: ['// Error loading file content or binary file format.']
        });
      } finally {
        setFileLoading(false);
      }
    }
  };

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

    return Object.keys(counts).map((lang) => ({
      name: lang,
      percentage: total > 0 ? Math.round((counts[lang] / total) * 100) : 0,
      color: getLanguageColor(lang), 
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
        if (sortBy === 'stars') return b.stars - a.stars;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [projects, searchQuery, selectedTag, sortBy]);

  const totalStars = useMemo(() => projects.reduce((acc, curr) => acc + (curr.stars || 0), 0), [projects]);

  const commandsList = useMemo(() => [
    {
      id: 'sort-stars',
      label: 'View: Sort repositories by Star Count',
      keyBadge: 'Stars',
      action: () => { setSortBy('stars'); addLog('Sorted projects by Star Count'); }
    },
    {
      id: 'sort-updated',
      label: 'View: Sort repositories by Last Updated',
      keyBadge: 'Recent',
      action: () => { setSortBy('updated'); addLog('Sorted projects by Last Updated'); }
    },
    {
      id: 'toggle-layout',
      label: `View: Switch layout (Current: ${viewMode})`,
      keyBadge: 'Layout',
      action: () => { setViewMode(viewMode === 'grid' ? 'timeline' : 'grid'); addLog('Toggled view layout'); }
    },
    {
      id: 'reset-filters',
      label: 'Filter: Clear active search query and tag filters',
      keyBadge: 'Reset',
      action: () => { setSearchQuery(''); setSelectedTag('All'); addLog('Reset all filters'); }
    }
  ], [viewMode]);

  const filteredCommands = useMemo(() => {
    if (!commandInput.trim()) return commandsList;
    return commandsList.filter(cmd => cmd.label.toLowerCase().includes(commandInput.toLowerCase()));
  }, [commandsList, commandInput]);

  return (
    <div className={styles.page}>
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

        <div className={styles.developerStatsGrid}>
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

        <section className={styles.section}>
          <h2 className={styles.sectionSubTitle}>Contribution Activity</h2>
          <div className={styles.contributions}>
            <GitHubCalendar
              username={process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'mhdhamka'}
              showColorLegend={false}
              showMonthLabels={true}
              colorScheme="dark"
              theme={{
                dark: ['#161B22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                light: ['#161B22', '#0e4429', '#006d32', '#26a641', '#39d353'],
              }}
              style={{ width: '100%' }}
            />
          </div>
        </section>

        <div className={styles.container}>
          <KanbanBoard />
        </div>

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

        {/* Dynamic Plugin-Based Command Palette Modal */}
        {isCommandPaletteOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsCommandPaletteOpen(false)}>
            <div className={styles.paletteModalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.paletteHeader}>
                <VscTerminal size={16} color="#58a6ff" />
                <input 
                  ref={cmdInputRef}
                  type="text"
                  placeholder="Type a command or filter actions..."
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  className={styles.paletteInput}
                />
              </div>
              <div className={styles.paletteCommandList}>
                {filteredCommands.length > 0 ? (
                  filteredCommands.map((cmd) => (
                    <div 
                      key={cmd.id}
                      className={styles.paletteCommandItem} 
                      onClick={() => { cmd.action(); setIsCommandPaletteOpen(false); }}
                    >
                      <span>{cmd.label}</span>
                      <span className={styles.cmdKey}>{cmd.keyBadge}</span>
                    </div>
                  ))
                ) : (
                  <div className={styles.paletteCommandItem} style={{ color: '#8b949e', justifyContent: 'center' }}>
                    <span>No matching commands found.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* GitHub-style File Explorer & Interactive Preview Modal */}
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

              {/* Split Pane Layout */}
              <div className={styles.modalSplitView}>
                <div className={styles.fileExplorerBox}>
                  <div className={styles.fileExplorerHeader}>
                    <span>{currentPath ? `/${currentPath}` : 'Root'}</span>
                    <span>Type</span>
                  </div>

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

                {/* Right Side: Scrollable Code Snippet with Dynamic Pagination Load-More */}
                <div className={styles.codePreviewPane}>
                  <div className={styles.previewHeader}>
                    <div className={styles.previewTab}>
                      <VscCode size={14} color="#58a6ff" />
                      <span>{selectedFile ? `${selectedFile.path} (${selectedFile.rawLines.length} lines)` : 'Select a file to preview'}</span>
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
                        <span>Fetching file content stream...</span>
                      </div>
                    ) : selectedFile ? (
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <pre className={styles.codeSnippetPre} style={{ flex: 1, overflowY: 'auto' }}>
                          <code>{selectedFile.rawLines.slice(0, visibleLinesCount).join('\n')}</code>
                        </pre>
                        {visibleLinesCount < selectedFile.rawLines.length && (
                          <div style={{ padding: '8px 12px', background: '#161b22', borderTop: '1px solid #30363d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: '#8b949e' }}>
                              Showing {Math.min(visibleLinesCount, selectedFile.rawLines.length)} of {selectedFile.rawLines.length} lines
                            </span>
                            <button
                              onClick={() => setVisibleLinesCount(prev => prev + 50)}
                              style={{ background: '#21262d', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '4px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <VscChevronDown size={13} /> Load 50 More Lines
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={styles.emptyPreviewState}>
                        <VscCode size={36} color="#30363d" />
                        <p>Click any file from the left repository tree to inspect source code.</p>
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