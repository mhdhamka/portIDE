'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  VscSearch, 
  VscChevronRight, 
  VscCaseSensitive, 
  VscWholeWord, 
  VscRegex,
  VscRepo,
  VscGitCommit,
  VscGitPullRequest,
  VscFilter
} from 'react-icons/vsc';
import { useTabs } from '@/context/TabsContext';
import { portfolioFiles, PortfolioFile } from '@/lib/portfolioContent';
import styles from '@/styles/Search.module.css';

const quickTags = ['All', 'react', 'security', 'backend', 'certs'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [activeFilter, setActiveFilter] = useState<'all' | 'code' | 'commit' | 'pr'>('all');
  
  const router = useRouter();
  const { openTab } = useTabs();
  const githubUsername = process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'mhdhamka';

  // Filter content dynamically from the shared content library
  const filteredResults = portfolioFiles
    .map(item => {
      const matchingLines = item.content.filter(m =>
        m.text.toLowerCase().includes(query.toLowerCase())
      );
      return { ...item, matches: matchingLines };
    })
    .filter(item => {
      if (item.matches.length === 0) return false;
      if (activeFilter !== 'all' && item.type !== activeFilter) return false;
      if (selectedTag !== 'All' && !item.tags.includes(selectedTag.toLowerCase())) return false;
      return true;
    });

  const totalMatchesCount = filteredResults.reduce(
    (acc, curr) => acc + curr.matches.length,
    0
  );

  const handleResultClick = (item: PortfolioFile) => {
    openTab({ icon: item.icon, filename: item.filename, path: item.path });
    router.push(item.path);
  };

  return (
    <div className={styles.searchContainer}>
      {/* Header with Tag Pills */}
      <div className={styles.ghHeader}>
        <div className={styles.ghTitleGroup}>
          <VscRepo size={16} className={styles.ghRepoIcon} />
          <span className={styles.ghRepoOwner}>{githubUsername}</span>
          <span className={styles.ghSlash}>/</span>
          <span className={styles.ghRepoName}>portIDE / global-search</span>
        </div>
        
        <div className={styles.quickTagsContainer}>
          <VscFilter size={12} className={styles.filterIcon} />
          {quickTags.map(tag => (
            <button
              key={tag}
              className={`${styles.tagPill} ${selectedTag === tag ? styles.activeTagPill : ''}`}
              onClick={() => setSelectedTag(tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className={styles.inputWrapper}>
        <div className={styles.searchBoxContainer}>
          <VscSearch size={14} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search code, commits, or PRs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.searchInput}
            autoFocus
          />
          <div className={styles.searchOptions}>
            <button title="Match Case"><VscCaseSensitive size={14} /></button>
            <button title="Match Whole Word"><VscWholeWord size={14} /></button>
            <button title="Use Regular Expression"><VscRegex size={14} /></button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className={styles.filterTabs}>
          <button 
            className={`${styles.filterTab} ${activeFilter === 'all' ? styles.activeFilter : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Results
          </button>
          <button 
            className={`${styles.filterTab} ${activeFilter === 'code' ? styles.activeFilter : ''}`}
            onClick={() => setActiveFilter('code')}
          >
            Code
          </button>
          <button 
            className={`${styles.filterTab} ${activeFilter === 'commit' ? styles.activeFilter : ''}`}
            onClick={() => setActiveFilter('commit')}
          >
            Commits
          </button>
          <button 
            className={`${styles.filterTab} ${activeFilter === 'pr' ? styles.activeFilter : ''}`}
            onClick={() => setActiveFilter('pr')}
          >
            Pull Requests
          </button>
        </div>

        <p className={styles.resultCount}>
          {query || selectedTag !== 'All' ? `${totalMatchesCount} results found (filtered)` : 'Type or click a tag to filter workspace'}
        </p>
      </div>

      {/* Results List */}
      <div className={styles.resultsList}>
        {filteredResults.length === 0 ? (
          <div className={styles.noResults}>No matches found for your current filter/query</div>
        ) : (
          filteredResults.map((item) => (
            <div key={item.path} className={styles.fileGroup}>
              <div 
                className={styles.fileHeader}
                onClick={() => handleResultClick(item)}
              >
                <div className={styles.fileHeaderLeft}>
                  {item.type === 'commit' ? (
                    <VscGitCommit size={14} className={styles.commitIcon} />
                  ) : item.type === 'pr' ? (
                    <VscGitPullRequest size={14} className={styles.prIcon} />
                  ) : (
                    <VscChevronRight size={14} className={styles.fileChevron} />
                  )}
                  <span className={styles.repoTag}>{item.repo}</span>
                  <span className={styles.fileName}>/ {item.filename}</span>
                </div>
                <span className={styles.matchBadge}>{item.matches.length}</span>
              </div>

              <div className={styles.matchesContainer}>
                {item.matches.map((match, idx) => (
                  <div
                    key={idx}
                    className={styles.matchItem}
                    onClick={() => handleResultClick(item)}
                  >
                    <span className={styles.lineNumber}>{match.line}</span>
                    <span className={styles.matchText}>
                      {match.text.split(new RegExp(`(${query})`, 'gi')).map((part, i) =>
                        part.toLowerCase() === query.toLowerCase() ? (
                          <mark key={i} className={styles.highlight}>{part}</mark>
                        ) : (
                          part
                        )
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}