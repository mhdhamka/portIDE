'use client';

import React, { useState, useEffect } from 'react';
import styles from '@/styles/KanbanBoard.module.css';
import { 
  VscChecklist, 
  VscCircleFilled, 
  VscAdd, 
  VscSearch, 
  VscTrash, 
  VscArrowLeft, 
  VscArrowRight, 
  VscClose 
} from 'react-icons/vsc';

interface Task {
  id: string;
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'backlog' | 'in-progress' | 'completed';
}

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Next.js Portfolio Refactor', category: 'Frontend', priority: 'high', status: 'completed' },
  { id: '2', title: 'LeetCode Telemetry Integration', category: 'API Proxy', priority: 'medium', status: 'completed' },
  { id: '3', title: 'Cybersecurity Engineer Certification Project', category: 'Security', priority: 'high', status: 'in-progress' },
  { id: '4', title: 'UX Design Case Studies Integration', category: 'UI/UX', priority: 'low', status: 'backlog' },
  { id: '5', title: 'Data Analytics Dashboard Module', category: 'Data', priority: 'medium', status: 'backlog' },
];

const STORAGE_KEY = 'portide_kanban_tasks_v1';

export default function KanbanBoard() {
  // Initialize state safely from localStorage or fallback to INITIAL_TASKS
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window === 'undefined') return INITIAL_TASKS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load tasks from localStorage', e);
    }
    return INITIAL_TASKS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingOpen, setIsAddingOpen] = useState(false);
  
  // New Task Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newPriority, setNewPriority] = useState<Task['priority']>('medium');

  // Save to localStorage whenever tasks change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to localStorage', e);
    }
  }, [tasks]);

  const moveTask = (id: string, newStatus: Task['status']) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      category: newCategory.trim() || 'General',
      priority: newPriority,
      status: 'backlog',
    };

    setTasks([newTask, ...tasks]);
    setNewTitle('');
    setNewCategory('');
    setIsAddingOpen(false);
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: { key: Task['status']; label: string; color: string }[] = [
    { key: 'backlog', label: 'BACKLOG', color: '#8b949e' },
    { key: 'in-progress', label: 'IN PROGRESS', color: '#d29922' },
    { key: 'completed', label: 'COMPLETED', color: '#3fb950' },
  ];

  return (
    <div className={styles.kanbanWrapper}>
      {/* Top Header Bar */}
      <div className={styles.kanbanHeader}>
        <div className={styles.titleGroup}>
          <VscChecklist size={16} color="#58a6ff" />
          <span>PROJECTS_KANBAN_BOARD.json</span>
        </div>
        
        <div className={styles.headerControls}>
          <div className={styles.searchBox}>
            <VscSearch size={13} color="#8b949e" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button 
            onClick={() => setIsAddingOpen(!isAddingOpen)} 
            className={styles.addTaskBtn}
          >
            <VscAdd size={14} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Inline Add Task Drawer */}
      {isAddingOpen && (
        <form onSubmit={handleAddTask} className={styles.addTaskForm}>
          <div className={styles.formHeader}>
            <span>Create New Roadmap Item</span>
            <button type="button" onClick={() => setIsAddingOpen(false)} className={styles.closeBtn}>
              <VscClose size={16} />
            </button>
          </div>
          <div className={styles.formInputs}>
            <input 
              type="text" 
              placeholder="Task title (e.g., Implement OAuth2)" 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className={styles.formInput}
              required
            />
            <input 
              type="text" 
              placeholder="Category (e.g., Backend)" 
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className={styles.formInput}
            />
            <select 
              value={newPriority} 
              onChange={(e) => setNewPriority(e.target.value as Task['priority'])}
              className={styles.formSelect}
            >
              <option value="low">Priority: Low</option>
              <option value="medium">Priority: Medium</option>
              <option value="high">Priority: High</option>
            </select>
            <button type="submit" className={styles.submitBtn}>Add to Backlog</button>
          </div>
        </form>
      )}

      {/* Columns Grid */}
      <div className={styles.kanbanBoardGrid}>
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.key);
          return (
            <div key={col.key} className={styles.kanbanColumn}>
              <div className={styles.columnHeader} style={{ borderTopColor: col.color }}>
                <span className={styles.columnTitle}>
                  <VscCircleFilled size={10} color={col.color} />
                  {col.label}
                </span>
                <span className={styles.taskCount}>{colTasks.length}</span>
              </div>

              <div className={styles.taskList}>
                {colTasks.length === 0 ? (
                  <div className={styles.emptyColumn}>No tasks found</div>
                ) : (
                  colTasks.map(task => (
                    <div key={task.id} className={styles.taskCard}>
                      <div className={styles.taskCardTop}>
                        <span className={styles.taskCategory}>{task.category}</span>
                        <div className={styles.taskMeta}>
                          <span className={`${styles.priorityBadge} ${styles[task.priority]}`}>
                            {task.priority}
                          </span>
                          <button 
                            onClick={() => deleteTask(task.id)} 
                            className={styles.deleteBtn}
                            title="Delete task"
                          >
                            <VscTrash size={12} />
                          </button>
                        </div>
                      </div>
                      
                      <div className={styles.taskTitle}>{task.title}</div>
                      
                      <div className={styles.taskActions}>
                        {col.key !== 'backlog' && (
                          <button 
                            onClick={() => moveTask(task.id, col.key === 'completed' ? 'in-progress' : 'backlog')}
                            className={styles.actionBtn}
                          >
                            <VscArrowLeft size={11} /> Prev
                          </button>
                        )}
                        {col.key !== 'completed' && (
                          <button 
                            onClick={() => moveTask(task.id, col.key === 'backlog' ? 'in-progress' : 'completed')}
                            className={styles.actionBtn}
                          >
                            Next <VscArrowRight size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}