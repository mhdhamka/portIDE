'use client';

import React, { useState } from 'react';
import styles from '@/styles/ApiTester.module.css';
import { VscGlobe, VscSend, VscCheck } from 'react-icons/vsc';

const MOCK_ENDPOINTS: Record<string, any> = {
  '/api/developer': { 
    name: 'Mohd Hamka', 
    degree: 'B.Sc. Computer Science - UNIMAS', 
    focus: ['Software Engineering', 'Cybersecurity', 'UX Design'],
    location: 'Kuching, Sarawak, Malaysia',
    status: 'Ready for Opportunities' 
  },
  '/api/projects/price-checker': { 
    system: 'Price-Checker-System', 
    stack: ['PHP', 'Dompdf', 'PhpSpreadsheet', 'MySQL'], 
    status: 'Active Release' 
  }
};

export default function ApiTester() {
  const [endpoint, setEndpoint] = useState('/api/developer');
  const [response, setResponse] = useState(MOCK_ENDPOINTS['/api/developer']);
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    setLoading(true);
    setTimeout(() => {
      setResponse(MOCK_ENDPOINTS[endpoint] || { error: '404 Not Found' });
      setLoading(false);
    }, 300);
  };

  return (
    <div className={styles.testerWrapper}>
      <div className={styles.testerHeader}>
        <div className={styles.titleGroup}>
          <VscGlobe size={16} color="#58a6ff" />
          <span>HTTP_API_CLIENT.rest</span>
        </div>
      </div>

      <div className={styles.requestBar}>
        <span className={styles.methodBadge}>GET</span>
        <select 
          value={endpoint} 
          onChange={(e) => setEndpoint(e.target.value)}
          className={styles.endpointSelect}
        >
          <option value="/api/developer">/api/developer</option>
          <option value="/api/projects/price-checker">/api/projects/price-checker</option>
        </select>
        <button onClick={handleSend} className={styles.sendBtn} disabled={loading}>
          <VscSend size={14} /> {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      <div className={styles.responsePane}>
        <div className={styles.responseHeader}>
          <span>Response Body (JSON)</span>
          <span className={styles.statusTag}><VscCheck size={12} color="#3fb950" /> 200 OK</span>
        </div>
        <pre className={styles.jsonOutput}>
          {JSON.stringify(response, null, 2)}
        </pre>
      </div>
    </div>
  );
}