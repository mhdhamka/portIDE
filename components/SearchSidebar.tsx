'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  VscCaseSensitive, 
  VscWholeWord, 
  VscRegex, 
  VscRefresh, 
  VscClearAll, 
  VscNewFile, 
  VscCollapseAll, 
  VscChevronDown, 
  VscChevronRight,
  VscSparkle
} from 'react-icons/vsc';
import { useTabs } from '@/context/TabsContext';
import styles from '@/styles/SearchSidebar.module.css';

interface SearchableFile {
  file: string;
  path: string;
  route: string;
  icon: string;
  content: string[];
}

export default function SearchSidebar() {
  const router = useRouter();
  const { openTab } = useTabs();
  const [query, setQuery] = useState('portIDE');
  const [matchCase, setMatchCase] = useState(false);
  const [collapsedFiles, setCollapsedFiles] = useState<Record<string, boolean>>({});

  // Searchable files aligned precisely with your project's tabbar file collection
  const searchableFiles: SearchableFile[] = [
    {
      file: 'overview.jsx',
      path: '/',
      route: '/',
      icon: '/logos/next_icon.svg',
      content: [
        'const usePortIde = () => {',
        '  const workspace = "portIDE v2.5 with portIDE search";',
        '  const developer = "mdhamka";',
        '  return `Initialized ${workspace} for ${developer}`;',
        '};'
      ]
    },
    {
      file: 'developer.config.php',
      path: '/config',
      route: '/config',
      icon: '/logos/laravel_icon.svg',
      content: [
        '<?php',
        '// Developer configuration module under portIDE search engine',
        '$config = [',
        '  "env" => "production",',
        '  "developer" => "mdhamka",',
        '  "engine" => "Laravel & portIDE search"',
        '];'
      ]
    },
    {
      file: 'endpoint.js',
      path: '/endpoint',
      route: '/endpoint',
      icon: '/logos/js_icon.svg',
      content: [
        'async function fetchSystemTelemetry() {',
        '  const status = { server: "Vercel Edge", engine: "portIDE search", secure: true };',
        '  return status;',
        '}'
      ]
    },
    {
      file: 'workspace.tsx',
      path: '/workspace',
      route: '/workspace',
      icon: '/logos/react_icon.svg',
      content: [
        'const setThemeMode = (mode) => {',
        '  document.documentElement.setAttribute(\'data-theme\', mode);',
        '  return `portIDE search theme successfully updated to: ${mode}`;',
        '};'
      ]
    },
    {
      file: 'changelog.json',
      path: '/changelog',
      route: '/changelog',
      icon: '/logos/json_icon.svg',
      content: [
        '{',
        '  "name": "portIDE-changelog",',
        '  "version": "2.5.0",',
        '  "engine": "portIDE search",',
        '  "author": "mdhamka"',
        '}'
      ]
    },
    {
      file: 'github.md',
      path: '/github',
      route: '/github',
      icon: '/logos/github_icon.svg',
      content: [
        '# portIDE — VS Code-Powered Next.js Portfolio',
        'Built using Next.js 16, portIDE search, and CSS Modules.',
        'Developed & maintained by mdhamka.'
      ]
    }
  ];

  // Dynamically filter matches based on query and case sensitivity
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const results: { file: string; path: string; route: string; icon: string; matches: { snippet: string; count: number }[] }[] = [];

    searchableFiles.forEach(fileObj => {
      const matches: { snippet: string; count: number }[] = [];
      let totalFileMatches = 0;

      fileObj.content.forEach(line => {
        const targetLine = matchCase ? line : line.toLowerCase();
        const targetQuery = matchCase ? query : query.toLowerCase();

        if (targetLine.includes(targetQuery)) {
          const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), matchCase ? 'g' : 'gi');
          const count = (line.match(regex) || []).length;
          totalFileMatches += count;
          matches.push({ snippet: line.trim(), count });
        }
      });

      if (matches.length > 0) {
        results.push({
          file: fileObj.file,
          path: fileObj.path,
          route: fileObj.route,
          icon: fileObj.icon,
          matches
        });
      }
    });

    return results;
  }, [query, matchCase]);

  const totalMatchesCount = useMemo(() => {
    return searchResults.reduce((acc, curr) => acc + curr.matches.reduce((mAcc, m) => mAcc + m.count, 0), 0);
  }, [searchResults]);

  const toggleCollapse = (file: string) => {
    setCollapsedFiles(prev => ({ ...prev, [file]: !prev[file] }));
  };

  const handleSelectMatch = (route: string, filename: string, icon: string) => {
    openTab({ icon, filename, path: route });
    router.push(route);
  };

  return (
    <div className={styles.searchSidebar}>
      
      {/* Header */}
      <div className={styles.searchHeader}>
        <span>Search</span>
        <div className={styles.headerIcons}>
          <VscRefresh title="Refresh" size={14} onClick={() => setQuery(query)} />
          <VscClearAll title="Clear Search" size={14} onClick={() => setQuery('')} />
          <VscNewFile title="New Search" size={14} />
          <VscCollapseAll title="Collapse All" size={14} onClick={() => setCollapsedFiles({})} />
        </div>
      </div>

      {/* Input Box Area */}
      <div className={styles.searchBoxArea}>
        <div className={styles.inputWrapper}>
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files..."
            className={styles.searchInput}
          />
          <div className={styles.inputIcons}>
            <VscCaseSensitive 
              title="Match Case" 
              size={14} 
              className={`${styles.toggleIcon} ${matchCase ? styles.activeToggle : ''}`}
              onClick={() => setMatchCase(!matchCase)} 
            />
            <VscWholeWord title="Match Whole Word" size={14} className={styles.toggleIcon} />
            <VscRegex title="Use Regular Expression" size={14} className={styles.toggleIcon} />
          </div>
        </div>

        {/* Action helper bar */}
        <div className={styles.searchStatsBar}>
          <span className={styles.statsCount}>{totalMatchesCount} results in {searchResults.length} files</span>
          <div className={styles.statsActions}>
            <button className={styles.actionButton} title="Open all results in editor">
              Open all
            </button>
            <button 
              className={styles.aiActionButton} 
              onClick={() => alert('AI Search Agent: All tabbar files indexed successfully under portIDE search.')}
              title="Search with AI"
            >
              <VscSparkle size={11} /> AI Search
            </button>
          </div>
        </div>
      </div>

      {/* Search Results Tree */}
      <div className={styles.resultsContainer}>
        {query.trim() === '' ? (
          <div className={styles.emptyState}>Type to search across tabbar files...</div>
        ) : searchResults.length === 0 ? (
          <div className={styles.emptyState}>No results found for &quot;{query}&quot;</div>
        ) : (
          searchResults.map((item, idx) => {
            const isCollapsed = collapsedFiles[item.file];
            const fileTotalCount = item.matches.reduce((acc, m) => acc + m.count, 0);

            return (
              <div key={idx} className={styles.fileGroup}>
                
                {/* File Header */}
                <div 
                  className={styles.fileHeader}
                  onClick={() => toggleCollapse(item.file)}
                >
                  {isCollapsed ? <VscChevronRight size={12} color="#858585" /> : <VscChevronDown size={12} color="#858585" />}
                  <img src={item.icon} alt="" width={14} height={14} style={{ objectFit: 'contain' }} />
                  <span className={styles.fileName}>{item.file}</span>
                  <span className={styles.filePath}>{item.path}</span>
                  <span className={styles.matchBadge}>{fileTotalCount}</span>
                </div>

                {/* Match Snippets */}
                {!isCollapsed && (
                  <div className={styles.snippetsList}>
                    {item.matches.map((match, mIdx) => (
                      <div 
                        key={mIdx} 
                        className={styles.snippetItem}
                        onClick={() => handleSelectMatch(item.route, item.file, item.icon)}
                      >
                        {match.snippet}
                      </div>
                    ))}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}