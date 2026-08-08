'use client';

import React, { useState } from 'react';
import styles from '@/styles/DebuggerWidget.module.css';
import { VscDebugAlt, VscDebugStepOver, VscDebugRestart, VscCircleFilled } from 'react-icons/vsc';

const telemetryData = { status: "Online", verified: true };

const CODE_STEPS = [
  { line: 1, code: 'async function initializePortIDEWorkspace() {', vars: { state: 'booting' } },
  { line: 2, code: '  const profile = await loadDeveloperProfile("Mohd Hamka");', vars: { name: 'Mohd Hamka', degree: 'B.Sc Software Engineer (UNIMAS)' } },
  { line: 3, code: '  const repos = await fetchUserRepositories("mhdhamka");', vars: { activeRepos: 14, primaryLanguage: 'TypeScript' } },
  { line: 4, code: '  const telemetry = { status: "Online", verified: true };', vars: { telemetry: telemetryData, runtime: 'Next.js 15' } },
  { line: 5, code: '  return { profile, repos, telemetry, ready: true };', vars: { execution: 'success', status: 'Workspace Rendered' } },
];

export default function DebuggerWidget() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNextStep = () => {
    setCurrentStep((prev) => (prev + 1) % CODE_STEPS.length);
  };

  const handleReset = () => {
    setCurrentStep(0);
  };

  return (
    <div className={styles.debuggerWrapper}>
      <div className={styles.debuggerHeader}>
        <div className={styles.titleGroup}>
          <VscDebugAlt size={16} color="#d29922" />
          <span>DEBUGGER_SESSION.ts</span>
        </div>
        <div className={styles.toolbar}>
          <button onClick={handleNextStep} className={styles.toolBtn} title="Step Over">
            <VscDebugStepOver size={14} /> Step
          </button>
          <button onClick={handleReset} className={styles.toolBtn} title="Restart">
            <VscDebugRestart size={14} /> Restart
          </button>
        </div>
      </div>

      <div className={styles.debuggerBody}>
        {/* Code Viewport */}
        <div className={styles.codePane}>
          {CODE_STEPS.map((step, idx) => (
            <div 
              key={step.line} 
              className={`${styles.codeRow} ${idx === currentStep ? styles.activeRow : ''}`}
            >
              <span className={styles.lineNo}>{step.line}</span>
              <span className={styles.breakpoint}>
                {idx === currentStep && <VscCircleFilled size={10} color="#f85149" />}
              </span>
              <code className={styles.codeText}>{step.code}</code>
            </div>
          ))}
        </div>

        {/* Variables Inspector Pane */}
        <div className={styles.inspectorPane}>
          <div className={styles.inspectorTitle}>LOCAL SCOPE VARIABLES</div>
          <div className={styles.variableList}>
            {Object.entries(CODE_STEPS[currentStep].vars).map(([key, val]) => (
              <div key={key} className={styles.varItem}>
                <span className={styles.varKey}>{key}:</span>
                <span className={styles.varVal}>{JSON.stringify(val, null, 2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}