import type { Metadata } from 'next';

import Layout from '@/components/Layout';

import '@/styles/globals.css';
import '@/styles/themes.css';

export const metadata: Metadata = {
  title: {
    default: 'portIDE | Interactive Portfolio',
    template: 'Mohd Hamka | %s',
  },
  description:
    "Mohd Hamka is a full-stack developer and cybersecurity enthusiast building high-performance web applications and secure architectures.",
  keywords: [
    'Mohd Hamka',
    'mdhamka',
    'web developer portfolio',
    'full stack developer',
    'cybersecurity engineer',
    'portIDE',
    'Next.js portfolio',
  ],
  openGraph: {
    title: "Mohd Hamka's Portfolio - portIDE",
    description:
      "An immersive developer portfolio emulating a fully functional VS Code environment.",
    url: 'https://mhdhamka.github.io',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

const themeScript = `
  (function() {
    const theme = localStorage.getItem('theme');
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}