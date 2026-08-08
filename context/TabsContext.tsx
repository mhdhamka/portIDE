'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface TabItem {
  icon: string;
  filename: string;
  path: string;
}

interface TabsContextType {
  tabs: TabItem[];
  openTab: (tab: TabItem) => void;
  closeTab: (pathToRemove: string) => void;
}

const initialTabs: TabItem[] = [
  { icon: '/logos/next_icon.svg', filename: 'overview.jsx', path: '/' },
  { icon: '/logos/laravel_icon.svg', filename: 'developer.config.php', path: '/config' },
  { icon: '/logos/js_icon.svg', filename: 'endpoint.js', path: '/endpoint' },
  { icon: '/logos/react_icon.svg', filename: 'workspace.tsx', path: '/workspace' },
  { icon: '/logos/json_icon.svg', filename: 'changelog.json', path: '/changelog' },
  { icon: '/logos/github_icon.svg', filename: 'github.md', path: '/github' },
];

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const TabsProvider = ({ children }: { children: ReactNode }) => {
  const [tabs, setTabs] = useState<TabItem[]>(initialTabs);

  const openTab = (newTab: TabItem) => {
    setTabs(prev => {
      const exists = prev.some(t => t.path === newTab.path);
      if (exists) return prev;
      return [...prev, newTab];
    });
  };

  const closeTab = (pathToRemove: string) => {
    setTabs(prev => prev.filter(t => t.path !== pathToRemove));
  };

  return (
    <TabsContext.Provider value={{ tabs, openTab, closeTab }}>
      {children}
    </TabsContext.Provider>
  );
};

export const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabs must be used within a TabsProvider');
  }
  return context;
};