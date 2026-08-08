export interface PortfolioFile {
  filename: string;
  path: string;
  icon: string;
  repo: string;
  type: 'code' | 'commit' | 'pr';
  tags: string[];
  content: { line: number; text: string }[];
}

export const portfolioFiles: PortfolioFile[] = [
  {
    filename: 'overview.jsx',
    path: '/',
    icon: '/logos/next_icon.svg',
    repo: 'mhdhamka/portfolio-ide',
    type: 'code',
    tags: ['react', 'next.js', 'security', 'fullstack'],
    content: [
      { line: 1, text: 'Full-Stack Developer & Cybersecurity Enthusiast (Available for Hire)' },
      { line: 2, text: 'Specialized in TypeScript, React, Node.js, and modern web architectures' },
    ],
  },
  {
    filename: 'developer.config.php',
    path: '/config',
    icon: '/logos/laravel_icon.svg',
    repo: 'mhdhamka/backend-core',
    type: 'code',
    tags: ['backend', 'security', 'laravel', 'config'],
    content: [
      { line: 1, text: 'Mohd Hamka — Backend Architecture & Security (Kuching, Sarawak)' },
      { line: 2, text: "<?php return ['developer' => 'Mohd Hamka', 'stack' => ['TypeScript', 'Laravel']];" },
    ],
  },
  {
    filename: 'workspace.tsx',
    path: '/workspace',
    icon: '/logos/react_icon.svg',
    repo: 'mhdhamka/portIDE',
    type: 'code',
    tags: ['react', 'fullstack'],
    content: [
      { line: 1, text: 'Featured Projects: portIDE Portfolio & Fullstack Applications' },
    ],
  },
  {
    filename: 'changelog.json',
    path: '/changelog',
    icon: '/logos/json_icon.svg',
    repo: 'mhdhamka/docs',
    type: 'commit',
    tags: ['certs', 'analytics'],
    content: [
      { line: 1, text: 'feat: added Google Data Analytics, Cybersecurity & UX certifications' },
    ],
  },
  {
    filename: 'endpoint.js',
    path: '/endpoint',
    icon: '/logos/js_icon.svg',
    repo: 'mhdhamka/api-service',
    type: 'pr',
    tags: ['contact', 'api', 'security'],
    content: [
      { line: 1, text: "export async function GET() { return Response.json({ email: 'mhdhamka@gmail.com', status: 'SECURE' }); }" },
      { line: 2, text: 'PR #404: Open for engineering opportunities & collaborations' },
    ],
  },
];