'use client';

import { useState } from 'react';
import { VscCopy, VscCheckAll, VscTerminal, VscSend } from 'react-icons/vsc';
import styles from '@/styles/EndpointCode.module.css';

interface EndpointItem {
  key: string;
  label: string;
  val: string;
  type: string;
}

const contactEndpoints: EndpointItem[] = [
  { key: 'website', label: 'portIDE.site', val: 'https://mhdhamka.dev', type: 'GET' },
  { key: 'email', label: 'mhdhamka@gmail.com', val: 'mailto:m.hamka017@gmail.com', type: 'POST' },
  { key: 'github', label: 'mhdhamka', val: 'https://github.com/mhdhamka', type: 'GET' },
  { key: 'linkedin', label: 'Mohd Hamka', val: 'https://www.linkedin.com/mdhamka', type: 'GET' },
];

export default function EndpointCode() {
  const [copied, setCopied] = useState(false);
  const [responseLog, setResponseLog] = useState('// Click any endpoint handler above to test connection payload');
  const [activeReq, setActiveReq] = useState<string | null>(null);

  const rawCodeSnippet = `// Express / Next.js Secured API Dispatcher
export async function GET(request) {
  return Response.json({
    status: 200,
    author: "Mohd Hamka",
    clearance: "Cybersecurity Certified",
    endpoints: 5
  });
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(rawCodeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const simulateRequest = (item: EndpointItem) => {
    setActiveReq(item.key);
    setResponseLog(`Executing ${item.type} ${item.val} ...`);
    setTimeout(() => {
      setResponseLog(`{\n  "status": 200,\n  "channel": "${item.key}",\n  "target": "${item.val}",\n  "timestamp": "${new Date().toISOString()}",\n  "secure_handshake": true\n}`);
    }, 500);
  };

  return (
    <div className={styles.codeWrapper}>
      <div className={styles.codeToolbar}>
        <div className={styles.toolbarTitle}>
          <VscTerminal size={14} />
          <span>endpoint.js — Route Handler</span>
        </div>
        <button onClick={handleCopy} className={styles.copyBtn}>
          {copied ? <VscCheckAll size={14} color="#3fb950" /> : <VscCopy size={14} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <div className={styles.code}>
        <p className={styles.line}>
          <span className={styles.className}>export async function</span> <span className={styles.funcName}>GET</span>(request) &#123;
        </p>
        <p className={styles.line}>
          &nbsp;&nbsp;&nbsp;<span className={styles.keyword}>const</span> socials = &#123;
        </p>
        
        {contactEndpoints.map((item, index) => (
          <p className={styles.line} key={index}>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{item.key}:{' '}
            <button 
              onClick={() => simulateRequest(item)}
              className={`${styles.endpointBtn} ${activeReq === item.key ? styles.activeEndpoint : ''}`}
            >
              <VscSend size={11} /> &quot;{item.label}&quot;
            </button>
            <a href={item.val} target="_blank" rel="noopener noreferrer" className={styles.externalLink} title="Open Direct Link">
              ↗
            </a>
            ,
          </p>
        ))}

        <p className={styles.line}>&nbsp;&nbsp;&nbsp;&#125;;</p>
        <p className={styles.line}>
          &nbsp;&nbsp;&nbsp;<span className={styles.keyword}>return</span> Response.<span className={styles.funcName}>json</span>(socials);
        </p>
        <p className={styles.line}>&#125;</p>

        {/* Live Terminal Response Output Window */}
        <div className={styles.responseTerminal}>
          <div className={styles.terminalHeader}>Response Payload Console:</div>
          <pre className={styles.terminalOutput}><code>{responseLog}</code></pre>
        </div>
      </div>
    </div>
  );
}