'use client';

import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value?: string;
  language?: string;
  readOnly?: boolean;
  onChange?: (value: string | undefined) => void;
}

export default function CodeEditor({ 
  value = '// Welcome to portIDE\nconst developer = "Mohd Hamka";', 
  language = 'typescript',
  readOnly = false,
  onChange 
}: CodeEditorProps) {
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <Editor
        height="100%"
        language={language}
        theme="vs-dark" // Matches your VS Code dark layout perfectly!
        value={value}
        options={{
          readOnly: readOnly,
          minimap: { enabled: true },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', Consolas, 'Courier New', monospace",
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
        onChange={onChange}
      />
    </div>
  );
}