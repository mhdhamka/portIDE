export interface ThemeInfo {
  name: string;
  theme: string;
  icon: string;
  publisher: string;
}

export const THEMES: ThemeInfo[] = [
  {
    name: 'GitHub Dark',
    theme: 'github-dark',
    icon: '/themes/github.png',
    publisher: 'GitHub',
  },
  {
    name: 'GitHub Dark Dimmed',
    theme: 'github-dark-dimmed',
    icon: '/themes/github.png',
    publisher: 'GitHub',
  },
  {
    name: 'GitHub Light Default',
    theme: 'github-light',
    icon: '/themes/github.png',
    publisher: 'GitHub',
  },
  {
    name: 'Default Dark Modern',
    theme: 'default-dark-modern',
    icon: '/themes/vscode.png',
    publisher: 'Microsoft',
  },
  {
    name: 'Default Light Modern',
    theme: 'default-light-modern',
    icon: '/themes/vscode.png',
    publisher: 'Microsoft',
  },
  {
    name: 'Monokai Pro',
    theme: 'monokai-pro',
    icon: '/themes/monokai.png',
    publisher: 'Monokai',
  },
  {
    name: 'Solarized Dark',
    theme: 'solarized-dark',
    icon: '/themes/solarized.png',
    publisher: 'GitHub',
  },
  {
    name: 'Dracula',
    theme: 'dracula',
    icon: '/themes/dracula.png',
    publisher: 'Dracula Theme',
  },
  {
    name: 'Ayu Dark',
    theme: 'ayu-dark',
    icon: '/themes/ayu.png',
    publisher: 'teabyii',
  },
  {
    name: 'Ayu Mirage',
    theme: 'ayu-mirage',
    icon: '/themes/ayu.png',
    publisher: 'teabyii',
  },
  {
    name: 'Nord',
    theme: 'nord',
    icon: '/themes/nord.png',
    publisher: 'arcticicestudio',
  },
  {
    name: 'Night Owl',
    theme: 'night-owl',
    icon: '/themes/night-owl.png',
    publisher: 'sarah.drasner',
  },
];

export const THEME_KEYS = THEMES.map(t => t.theme) as [string, ...string[]];
