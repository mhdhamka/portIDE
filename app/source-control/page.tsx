'use client';

import React, { useState, useEffect } from 'react';
import styles from './SourceControlPage.module.css';
import { 
  VscGitCommit, 
  VscGitMerge, 
  VscCheck, 
  VscCloudUpload, 
  VscFileCode, 
  VscSync,
  VscLoading,
  VscAdd,
  VscRemove,
  VscArchive,
  VscClose,
  VscCheckAll
} from 'react-icons/vsc';

interface Commit {
  id: string;
  message: string;
  date: string;
  author: string;
}

interface Branch {
  name: string;
  description: string;
  active: boolean;
  commits: Commit[];
}

interface GitFile {
  id: string;
  name: string;
  status: 'M' | 'U';
  staged: boolean;
  oldCode: string;
  newCode: string;
}

const GITHUB_USERNAME = 'mhdhamka'; 
const REPOSITORY_NAME = 'mhdhamka.github.io';

const FALLBACK_COMMITS: Commit[] = [
  { id: 'a1b2c3d', message: 'chore: finalize Next.js 14 architecture & layouts', date: '2 days ago', author: 'Mohd Hamka' },
  { id: 'e4f5g6h', message: 'feat: add terminal telemetry and LeetCode API proxy', date: '4 days ago', author: 'Mohd Hamka' },
];

export default function SourceControlPage() {
  const [branches, setBranches] = useState<Branch[]>([
    {
      name: 'main',
      description: 'Live production commit feed fetched directly from your repository branch.',
      active: true,
      commits: FALLBACK_COMMITS
    }
  ]);

  // Enhanced features state
  const [files, setFiles] = useState<GitFile[]>([
    { 
      id: '1', 
      name: 'SourceControlPage.module.css', 
      status: 'M', 
      staged: false, 
      oldCode: '.scSidebar {\n  background: #181818;\n  width: 280px;\n}', 
      newCode: '.scSidebar {\n  background: #141414;\n  width: 300px;\n  border-right: 1px solid #333;\n}' 
    },
    { 
      id: '2', 
      name: 'page.tsx', 
      status: 'U', 
      staged: false, 
      oldCode: '// No previous file content', 
      newCode: "export default function Page() {\n  return <div>Interactive Workspace</div>;\n}" 
    }
  ]);

  const [stashes, setStashes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [selectedFileForDiff, setSelectedFileForDiff] = useState<GitFile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showNewBranchModal, setShowNewBranchModal] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch commits for a specific branch via ?sha= parameter
  const fetchCommitsForBranch = async (branchName: string) => {
    try {
      setLoading(true);
      const res = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPOSITORY_NAME}/commits?sha=${branchName}&per_page=10`);
      if (!res.ok) throw new Error(`Branch ${branchName} not found or rate-limited`);
      const commitData = await res.json();
      
      const liveCommits: Commit[] = commitData.map((item: any) => ({
        id: item.sha.substring(0, 7),
        message: item.commit.message,
        date: new Date(item.commit.author.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        author: item.commit.author.name || GITHUB_USERNAME,
      }));

      setBranches(prev => prev.map(b => b.name === branchName ? { ...b, commits: liveCommits } : b));
    } catch (err) {
      console.error(`Error fetching commits for ${branchName}:`, err);
      showToast(`Using fallback commits for ${branchName}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all remote repository branches dynamically
  const fetchGitHubBranches = async () => {
    try {
      setSyncing(true);
      const res = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPOSITORY_NAME}/branches`);
      if (!res.ok) throw new Error('Failed to fetch repository branches');
      const branchData = await res.json();
      
      const fetchedBranches: Branch[] = branchData.map((b: any, index: number) => ({
        name: b.name,
        description: b.name === 'main' 
          ? 'Live production commit feed fetched directly from your repository branch.' 
          : `Active remote focus branch: ${b.name}`,
        active: index === 0,
        commits: []
      }));

      if (fetchedBranches.length > 0) {
        setBranches(fetchedBranches);
        await fetchCommitsForBranch(fetchedBranches[0].name);
      }
      showToast('Successfully synchronized branches from GitHub');
    } catch (err) {
      console.error('Error fetching branches, using fallback:', err);
      showToast('GitHub rate-limit hit. Using fallback view.');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchGitHubBranches();
  }, []);

  const activeBranch = branches.find(b => b.active) || branches[0];

  const handleCheckout = async (branchName: string) => {
    setBranches(branches.map(b => ({ ...b, active: b.name === branchName })));
    showToast(`Switched to branch '${branchName}'`);
    await fetchCommitsForBranch(branchName);
  };

  const handleToggleStage = (id: string) => {
    setFiles(files.map(f => f.id === id ? { ...f, staged: !f.staged } : f));
  };

  const handleStageAll = () => {
    setFiles(files.map(f => ({ ...f, staged: true })));
  };

  const handleCommit = (e: React.FormEvent) => {
    e.preventDefault();
    const stagedFiles = files.filter(f => f.staged);
    if (!commitMessage.trim() || stagedFiles.length === 0) {
      showToast('Please stage changes and enter a commit message.');
      return;
    }

    const newCommit: Commit = {
      id: Math.random().toString(36).substring(2, 9),
      message: commitMessage.trim(),
      date: 'Just now',
      author: 'Mohd Hamka',
    };

    setBranches(branches.map(b => b.name === activeBranch.name ? { ...b, commits: [newCommit, ...b.commits] } : b));
    setFiles(files.filter(f => !f.staged));
    setCommitMessage('');
    showToast(`Committed ${stagedFiles.length} file(s) successfully!`);
  };

  const handleStash = () => {
    if (!commitMessage.trim()) return;
    setStashes([commitMessage.trim(), ...stashes]);
    setCommitMessage('');
    showToast('Changes stashed successfully.');
  };

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    const formattedName = newBranchName.trim().toLowerCase().replace(/\s+/g, '-');
    if (branches.some(b => b.name === formattedName)) return;

    setBranches([
      ...branches.map(b => ({ ...b, active: false })),
      { name: formattedName, description: `Custom sandbox branch created by user.`, active: true, commits: FALLBACK_COMMITS }
    ]);
    setNewBranchName('');
    setShowNewBranchModal(false);
    showToast(`Created and checked out new branch '${formattedName}'`);
  };

  const stagedFiles = files.filter(f => f.staged);
  const unstagedFiles = files.filter(f => !f.staged);

  return (
    <div className={styles.workspaceContainer}>
      {toastMessage && (
        <div className={styles.toastNotification}>
          <VscCheck size={14} color="#3fb950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {selectedFileForDiff && (
        <div className={styles.diffModalOverlay} onClick={() => setSelectedFileForDiff(null)}>
          <div className={styles.diffModalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.diffHeader}>
              <span>DIFF: {selectedFileForDiff.name}</span>
              <button className={styles.closeBtn} onClick={() => setSelectedFileForDiff(null)}>
                <VscClose size={16} />
              </button>
            </div>
            <div className={styles.diffSplit}>
              <div className={styles.diffPane}>
                <div className={styles.paneTitle}>Original (HEAD)</div>
                <pre>{selectedFileForDiff.oldCode}</pre>
              </div>
              <div className={styles.diffPane}>
                <div className={styles.paneTitle}>Modified (Working Tree)</div>
                <pre>{selectedFileForDiff.newCode}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNewBranchModal && (
        <div className={styles.diffModalOverlay} onClick={() => setShowNewBranchModal(false)}>
          <div className={styles.branchModalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.diffHeader}>
              <span>Create New Branch</span>
              <button className={styles.closeBtn} onClick={() => setShowNewBranchModal(false)}>
                <VscClose size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateBranch} style={{ padding: '16px' }}>
              <input 
                type="text" 
                placeholder="branch-name (e.g., feature/analytics)" 
                value={newBranchName}
                onChange={e => setNewBranchName(e.target.value)}
                className={styles.commitInput}
                autoFocus
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button type="submit" className={styles.commitBtn}>Create Branch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.scSidebar}>
        <div className={styles.sidebarHeader}>
          <span>SOURCE CONTROL</span>
          <div className={styles.headerIcons}>
            <button onClick={fetchGitHubBranches} className={styles.iconButton} title="Sync Repository">
              <VscSync size={14} className={syncing ? styles.spinning : ''} />
            </button>
            <button onClick={handleStageAll} className={styles.iconButton} title="Stage All Changes">
              <VscCheckAll size={14} />
            </button>
            <button onClick={handleStash} className={styles.iconButton} title="Stash Changes">
              <VscArchive size={14} />
            </button>
          </div>
        </div>

        <form onSubmit={handleCommit} className={styles.commitBoxWrapper}>
          <input 
            type="text" 
            placeholder={`Message (${activeBranch.name})...`}
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            className={styles.commitInput}
          />
          <button type="submit" className={styles.commitBtn}>Commit Staged</button>
        </form>

        {stagedFiles.length > 0 && (
          <>
            <div className={styles.sectionTitle}>STAGED CHANGES ({stagedFiles.length})</div>
            <div className={styles.changesList}>
              {stagedFiles.map(file => (
                <div key={file.id} className={styles.changeItem} onClick={() => setSelectedFileForDiff(file)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                    <VscFileCode size={13} color="#3fb950" />
                    <span className={styles.fileName}>{file.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className={styles.changeTagM}>{file.status}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleToggleStage(file.id); }} className={styles.actionIcon}>
                      <VscRemove size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className={styles.sectionTitle}>CHANGES ({unstagedFiles.length})</div>
        <div className={styles.changesList}>
          {unstagedFiles.length === 0 ? (
            <div style={{ padding: '8px 12px', fontSize: '11px', color: '#888' }}>No unstaged changes</div>
          ) : (
            unstagedFiles.map(file => (
              <div key={file.id} className={styles.changeItem} onClick={() => setSelectedFileForDiff(file)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                  <VscFileCode size={13} color={file.status === 'M' ? '#d29922' : '#3fb950'} />
                  <span className={styles.fileName}>{file.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className={file.status === 'M' ? styles.changeTagM : styles.changeTagU}>{file.status}</span>
                  <button onClick={(e) => { e.stopPropagation(); handleToggleStage(file.id); }} className={styles.actionIcon}>
                    <VscAdd size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {stashes.length > 0 && (
          <>
            <div className={styles.sectionTitle}>STASHES ({stashes.length})</div>
            <div className={styles.changesList}>
              {stashes.map((stash, idx) => (
                <div key={idx} className={styles.changeItem}>
                  <span className={styles.fileName}>stash@{idx}: {stash}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <div className={styles.branchHeaderRow}>
          <div className={styles.sectionTitle} style={{ margin: 0 }}>BRANCHES</div>
          <button onClick={() => setShowNewBranchModal(true)} className={styles.iconButton} title="Create Branch">
            <VscAdd size={14} />
          </button>
        </div>
        <div className={styles.branchList}>
          {branches.map(branch => (
            <div 
              key={branch.name} 
              className={`${styles.branchItem} ${branch.active ? styles.activeBranch : ''}`}
              onClick={() => handleCheckout(branch.name)}
            >
              <div className={styles.branchInfo}>
                <VscGitMerge size={14} color={branch.active ? '#58a6ff' : '#8b949e'} />
                <span className={styles.branchName}>{branch.name}</span>
              </div>
              {branch.active && <VscCheck size={14} color="#58a6ff" />}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.contentHeader}>
          <div className={styles.activeBranchMeta}>
            <div className={styles.metaTop}>
              <h2>Branch: <span className={styles.highlight}>{activeBranch.name}</span></h2>
              <button onClick={() => fetchCommitsForBranch(activeBranch.name)} className={styles.pushBtn}>
                <VscCloudUpload size={14} /> {syncing ? 'Fetching...' : 'Sync Repository'}
              </button>
            </div>
            <p>{activeBranch.description}</p>
          </div>
        </div>

        <div className={styles.graphContainer}>
          <div className={styles.graphHeader}>
            <VscGitCommit size={16} color="#58a6ff" />
            <span>COMMIT HISTORY GRAPH ({activeBranch.commits.length} commits)</span>
          </div>

          <div className={styles.timeline}>
            {loading ? (
              <div className={styles.loadingState}>
                <VscLoading size={24} className={styles.spinning} />
                <span>Querying live repository commits for {activeBranch.name}...</span>
              </div>
            ) : activeBranch.commits.length === 0 ? (
              <div className={styles.loadingState}>
                <span>No commits found for this branch.</span>
              </div>
            ) : (
              activeBranch.commits.map((commit, index) => (
                <div key={commit.id + index} className={styles.timelineItem}>
                  <div className={styles.nodeColumn}>
                    <div className={styles.nodeDot}>
                      <div className={styles.nodePulse} />
                    </div>
                    {index !== activeBranch.commits.length - 1 && <div className={styles.nodeLine} />}
                  </div>
                  <div className={styles.commitCard}>
                    <div className={styles.commitTop}>
                      <span className={styles.commitMsg}>{commit.message}</span>
                      <span className={styles.commitHash}>{commit.id}</span>
                    </div>
                    <div className={styles.commitMeta}>
                      <span>👤 {commit.author}</span>
                      <span>🕒 {commit.date}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}