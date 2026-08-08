'use client';

import Image from 'next/image';
import { VscRepo, VscLinkExternal, VscStarEmpty, VscGitMerge } from 'react-icons/vsc';

import { Project } from '@/types';
import styles from '@/styles/WorkspaceCard.module.css';

interface ProjectCardProps {
  project: Project & {
    image?: string;
    tags?: string[];
    url?: string;
    link?: string;
    logo?: string;
    stars?: number;
    forks?: number;
  };
  index: number;
}

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const externalUrl = project.link || project.url;

  return (
    <div className={styles.card}>
      {/* VS Code Line Number */}
      <div className={styles.number}>
        <span>{String(index + 1).padStart(2, '0')}</span>
      </div>

      {/* GitHub Style Repository Box Container */}
      <div className={styles.repoContainer}>
        {/* Optional Custom Preview Image / Banner */}
        {project.image && (
          <div className={styles.imagePreviewWrapper}>
            <Image
              src={project.image}
              alt={`${project.title} preview`}
              fill
              className={styles.projectImage}
              sizes="(max-width: 768px) 100vw, 600px"
            />
          </div>
        )}

        <div className={styles.content}>
          <div className={styles.main}>
            <div className={styles.header}>
              <div className={styles.repoTitleGroup}>
                <VscRepo size={16} className={styles.repoIcon} />
                <h3 className={styles.title}>{project.title}</h3>
              </div>

              {/* GitHub Star/Fork metrics mock or real data */}
              <div className={styles.repoStats}>
                <span className={styles.statItem}>
                  <VscStarEmpty size={13} /> {project.stars || '12'}
                </span>
                <span className={styles.statItem}>
                  <VscGitMerge size={13} /> {project.forks || '4'}
                </span>
              </div>
            </div>
            
            <p className={styles.description}>{project.description}</p>

            {/* Tech Stack Pills / Tags (GitHub Topics Style) */}
            {project.tags && project.tags.length > 0 && (
              <div className={styles.tagsContainer}>
                {project.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className={styles.tagPill}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className={styles.actionFooter}>
            <span className={styles.workspaceIndicator}>public repository</span>
            
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
              onClick={(e) => e.stopPropagation()}
            >
              <span>View Code</span>
              <VscLinkExternal size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;