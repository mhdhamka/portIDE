import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const portfolioContext = `
      You are the official AI Copilot for portIDE: The Interactive Developer Workspace, built by Mohd Hamka Izzuddin.
      Hamka is a Full-Stack Software Engineer and Cybersecurity Enthusiast based in Kuching, Sarawak, Malaysia, with a Computer Science degree from UNIMAS.
      Your role is to guide users in using the platform and exploring Hamka's profile across the core workspace files:
      1. overview.jsx: Profile overview, bio, and main entry point.
      2. developer.config.php: Runtime environment configurations and tech stack settings.
      3. endpoint.js: API dispatch handlers and direct contact links.
      4. workspace.tsx: Interactive code sandbox, Kanban board, debugger, and API tester.
      5. changelog.json: Version schema, features, and logs.
      6. github.md: Live repository synchronization and markdown documentation.
      Keep answers concise, developer-focused, helpful, and friendly.
    `;

    let reply = "I can help you navigate portIDE and explore Hamka's work! Try asking about specific files or platform features.";
    const lower = prompt.toLowerCase();

    if (lower.includes('background') || lower.includes('about') || lower.includes('who') || lower.includes('hamka')) {
      reply = "Hamka is a Full-Stack Software Engineer and Cybersecurity Enthusiast with a Computer Science degree from UNIMAS. You can check his full bio in overview.jsx or developer.config.php!";
    } else if (lower.includes('file') || lower.includes('workspace') || lower.includes('navigate') || lower.includes('tab') || lower.includes('how')) {
      reply = "portIDE features 6 core workspace files: overview.jsx (profile), developer.config.php (config/stack), endpoint.js (API/contacts), workspace.tsx (sandbox & Kanban), changelog.json (versions), and github.md (repo sync). Click any file in the sidebar or tab bar to open and interact with it!";
    } else if (lower.includes('project') || lower.includes('sandbox') || lower.includes('kanban') || lower.includes('debugger')) {
      reply = "Head over to workspace.tsx to test out the interactive Kanban board, code debugger widget, and live API tester!";
    } else if (lower.includes('tech stack') || lower.includes('skills') || lower.includes('stack')) {
      reply = "Hamka's core stack includes Next.js, React, TypeScript, PHP/Laravel, and Node.js, with strong foundations in cybersecurity and system architecture (fully inspectable in developer.config.php).";
    } else if (lower.includes('contact') || lower.includes('email') || lower.includes('hire')) {
      reply = "You can view Hamka's contact details instantly by opening endpoint.js or checking his GitHub profile (mhdhamka via github.md).";
    }

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json({ reply: "Sorry, I hit a temporary rate limit. Feel free to explore the code tabs directly!" }, { status: 500 });
  }
}