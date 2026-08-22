'use client';

import { useState, useRef, useEffect } from 'react';
import { VscSend, VscClose, VscEdit, VscCopilot, VscCheck, VscCopy } from 'react-icons/vsc';
import styles from '@/styles/AiCopilotSidebar.module.css';

interface Message {
  sender: 'user' | 'copilot';
  text: string;
}

interface AiCopilotSidebarProps {
  onClose: () => void;
}

export default function AiCopilotSidebar({ onClose }: AiCopilotSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'copilot', text: "Hi! I'm your portIDE Copilot. I can guide you through the workspace files (overview.jsx, developer.config.php, workspace.tsx, etc.) and Hamka's developer profile. What would you like to explore?" }
  ]);
  const [input, setInput] = useState('');
  const [msgCount, setMsgCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || msgCount <= 0 || loading) return;

    const userMessage: Message = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setMsgCount(prev => prev - 1);
    setLoading(true);

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query }),
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { sender: 'copilot', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        sender: 'copilot', 
        text: "I'm running locally! Explore files like overview.jsx and workspace.tsx to test out the IDE features." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className={styles.copilotPanel}>
      {/* Header */}
      <div className={styles.panelHeader}>
        <div className={styles.headerTitle}>
          <VscCopilot color="#06b6d4" size={18} />
          <span>PORTIDE&apos;S AI ASSISTANT</span>
        </div>
        <div className={styles.headerActions}>
          <VscEdit 
            title="New Chat" 
            size={14} 
            onClick={() => { 
              setMessages([{ sender: 'copilot', text: "Chat reset! How can I help you navigate portIDE?" }]); 
              setMsgCount(3); 
            }} 
            style={{ cursor: 'pointer' }} 
          />
          <VscClose title="Close" size={16} onClick={onClose} style={{ cursor: 'pointer' }} />
        </div>
      </div>

      {/* Workspace Tag */}
      <div className={styles.workspaceTag}>
        <span>WORKSPACE</span>
        <span className={styles.badge}>• portIDE • mhdhamka</span>
      </div>

      {/* Quick Prompts Chips */}
      {messages.length === 1 && (
        <div className={styles.quickPrompts}>
          <button onClick={() => handleSendMessage("How do I navigate portIDE and its files?")}>
            <span></span> How do I navigate portIDE?
          </button>
          <button onClick={() => handleSendMessage("Tell me about Hamka's background.")}>
            <span></span> Tell me about Hamka?
          </button>
          <button onClick={() => handleSendMessage("What can I do in workspace.tsx?")}>
            <span></span> What is in workspace.tsx?
          </button>
          <button onClick={() => handleSendMessage("How can I contact Hamka?")}>
            <span></span> How can I contact him?
          </button>
        </div>
      )}

      {/* Chat Messages Log */}
      <div className={styles.chatLogs} ref={chatScrollRef}>
        {messages.map((m, idx) => (
          <div key={idx} className={`${styles.messageRow} ${m.sender === 'user' ? styles.userRow : styles.copilotRow}`}>
            {m.sender === 'copilot' && (
              <div className={styles.avatar}>
                <VscCopilot size={14} color="#06b6d4" />
              </div>
            )}
            <div className={styles.bubbleWrapper}>
              <div className={styles.bubble}>
                {m.text}
              </div>
              {m.sender === 'copilot' && (
                <button 
                  className={styles.copyBtn} 
                  onClick={() => handleCopyText(m.text, idx)}
                  title="Copy response"
                >
                  {copiedIndex === idx ? <VscCheck size={12} color="#10b981" /> : <VscCopy size={12} />}
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className={styles.messageRow} style={{ display: 'flex', gap: '8px' }}>
            <div className={styles.avatar}>
              <VscCopilot size={14} color="#06b6d4" />
            </div>
            <div className={styles.bubble}>
              <span className={styles.typingIndicator}>
                <span></span><span></span><span></span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box & Limit Indicator */}
      <div className={styles.inputArea}>
        <div className={styles.inputWrapper}>
          <input 
            type="text" 
            placeholder={msgCount > 0 ? "Ask about workspace files, stack, projects..." : "Message limit reached"}
            value={input}
            disabled={msgCount <= 0 || loading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button onClick={() => handleSendMessage()} disabled={msgCount <= 0 || loading || !input.trim()}>
            <VscSend size={14} />
          </button>
        </div>
        <div className={styles.limitFooter}>
          <span>{msgCount} msgs left</span>
          <span>AI can make mistakes · portIDE v2.5</span>
        </div>
      </div>
    </div>
  );
}