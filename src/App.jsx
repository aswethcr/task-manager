import React, { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, googleProvider, db, isFirebaseConfigured } from './firebase';

const STATUS_OPTIONS = ['Planned', 'In Progress', 'Complete'];
const MOCK_USER_KEY = 'tm_mock_user';
const MOCK_TASKS_PREFIX = 'tm_tasks_';

const DEFAULT_MOCK_USER = {
  uid: 'demo-google-user-123',
  displayName: 'Google Test User',
  email: 'testuser@gmail.com',
  photoURL: ''
};

export default function App() {
  const [firebaseActive] = useState(() => isFirebaseConfigured());
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Manage Auth State
  useEffect(() => {
    if (firebaseActive) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setAuthLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Local Dev Mode: load persisted mock user if any
      const savedUser = localStorage.getItem(MOCK_USER_KEY);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    }
  }, [firebaseActive]);

  // 2. Manage Tasks Subscription / Fetching
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setTasksLoading(false);
      return;
    }

    setTasksLoading(true);

    if (firebaseActive) {
      // Real Firebase Firestore
      const q = query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetchedTasks = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
          }));

          // Sort newest first
          fetchedTasks.sort((a, b) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
            return timeB - timeA;
          });

          setTasks(fetchedTasks);
          setTasksLoading(false);
        },
        (error) => {
          console.error('Firestore subscription error:', error);
          setErrorMessage('Failed to load tasks from Firestore. Check your network or rules.');
          setTasksLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      // Local Dev Mode Storage
      const storageKey = `${MOCK_TASKS_PREFIX}${user.uid}`;
      const savedTasks = localStorage.getItem(storageKey);
      if (savedTasks) {
        try {
          const parsed = JSON.parse(savedTasks);
          parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setTasks(parsed);
        } catch {
          setTasks([]);
        }
      } else {
        setTasks([]);
      }
      setTasksLoading(false);
    }
  }, [user, firebaseActive]);

  // Handle Google Sign In
  const handleSignIn = async () => {
    setErrorMessage('');
    if (firebaseActive) {
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (error) {
        console.error('Firebase Login error:', error);
        if (error.code !== 'auth/popup-closed-by-user') {
          setErrorMessage('Failed to sign in with Google Firebase. Please check your .env credentials.');
        }
      }
    } else {
      // Local Dev Mode Instant Sign In
      localStorage.setItem(MOCK_USER_KEY, JSON.stringify(DEFAULT_MOCK_USER));
      setUser(DEFAULT_MOCK_USER);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    setErrorMessage('');
    if (firebaseActive) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error('Sign out error:', error);
        setErrorMessage('Failed to sign out. Please try again.');
      }
    } else {
      localStorage.removeItem(MOCK_USER_KEY);
      setUser(null);
    }
  };

  // Handle Create Task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle || isSubmitting || !user) return;

    if (trimmedTitle.length > 100) {
      setErrorMessage('Task title cannot exceed 100 characters.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    if (firebaseActive) {
      try {
        await addDoc(collection(db, 'tasks'), {
          title: trimmedTitle,
          status: 'Planned',
          userId: user.uid,
          createdAt: serverTimestamp()
        });
        setNewTitle('');
      } catch (error) {
        console.error('Task creation error:', error);
        setErrorMessage('Failed to save task to Firestore. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      try {
        const newTask = {
          id: 'task_' + Date.now().toString(),
          title: trimmedTitle,
          status: 'Planned',
          userId: user.uid,
          createdAt: new Date().toISOString()
        };
        const updated = [newTask, ...tasks];
        localStorage.setItem(`${MOCK_TASKS_PREFIX}${user.uid}`, JSON.stringify(updated));
        setTasks(updated);
        setNewTitle('');
      } catch (error) {
        console.error('Local task save error:', error);
        setErrorMessage('Failed to save task locally.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Handle Status Update
  const handleStatusChange = async (taskId, newStatus) => {
    if (!STATUS_OPTIONS.includes(newStatus)) return;
    setUpdatingTaskId(taskId);
    setErrorMessage('');

    if (firebaseActive) {
      try {
        const taskRef = doc(db, 'tasks', taskId);
        await updateDoc(taskRef, {
          status: newStatus
        });
      } catch (error) {
        console.error('Task status update error:', error);
        setErrorMessage('Failed to update task status in Firestore.');
      } finally {
        setUpdatingTaskId(null);
      }
    } else {
      try {
        const updated = tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t));
        localStorage.setItem(`${MOCK_TASKS_PREFIX}${user.uid}`, JSON.stringify(updated));
        setTasks(updated);
      } catch (error) {
        console.error('Local status update error:', error);
        setErrorMessage('Failed to update task status.');
      } finally {
        setUpdatingTaskId(null);
      }
    }
  };

  // Helpers
  const getBadgeClass = (status) => {
    switch (status) {
      case 'Planned':
        return 'badge-planned';
      case 'In Progress':
        return 'badge-progress';
      case 'Complete':
        return 'badge-complete';
      default:
        return 'badge-default';
    }
  };

  const formatDate = (createdAt) => {
    if (!createdAt) return 'Just now';
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Initial Loading Screen
  if (authLoading) {
    return (
      <div className="center-screen">
        <div className="spinner"></div>
        <p className="loading-text">Loading Task Manager...</p>
      </div>
    );
  }

  // Unauthenticated Screen (Login)
  if (!user) {
    return (
      <div className="center-screen">
        <div className="login-card">
          <div className="app-logo-large">📋</div>
          <h1>Task Manager</h1>
          <p className="login-subtitle">
            A minimal, distraction-free task management tool. Keep track of your daily tasks with ease.
          </p>

          {!firebaseActive && (
            <div className="dev-mode-pill">
              <span className="dot-active"></span>
              Local Dev Mode (Ready to test without Firebase setup)
            </div>
          )}

          {errorMessage && (
            <div className="alert-error" role="alert">
              <span>{errorMessage}</span>
              <button
                type="button"
                className="close-btn"
                onClick={() => setErrorMessage('')}
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          )}

          <button
            type="button"
            className="btn btn-google"
            onClick={handleSignIn}
          >
            <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // Authenticated Screen (Dashboard)
  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <span className="logo-icon">📋</span>
          <span className="app-title">Task Manager</span>
          {!firebaseActive && (
            <span className="mode-badge">Dev Mode</span>
          )}
        </div>
        <div className="header-right">
          <div className="user-profile">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="user-avatar"
              />
            ) : (
              <div className="user-avatar-placeholder">
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <span className="user-name">
              {user.displayName || user.email || 'User'}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-logout"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {errorMessage && (
          <div className="alert-error" role="alert">
            <span>{errorMessage}</span>
            <button
              type="button"
              className="close-btn"
              onClick={() => setErrorMessage('')}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        {/* Task Creation Form */}
        <section className="card form-card">
          <form onSubmit={handleCreateTask} className="task-form">
            <div className="input-group">
              <input
                type="text"
                className="task-input"
                placeholder="What needs to be done? (max 100 characters)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                maxLength={100}
                disabled={isSubmitting}
                autoFocus
              />
              <span className="char-count">
                {newTitle.length}/100
              </span>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!newTitle.trim() || isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </button>
          </form>
        </section>

        {/* Task List */}
        <section className="card list-card">
          <div className="list-header">
            <h2>Your Tasks</h2>
            <span className="task-counter">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>

          {tasksLoading ? (
            <div className="state-container">
              <div className="spinner"></div>
              <p className="loading-text">Loading your tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="state-container empty-state">
              <span className="empty-icon">📝</span>
              <p className="empty-title">No tasks yet</p>
              <p className="empty-desc">Create your first task above to get started!</p>
            </div>
          ) : (
            <ul className="task-list">
              {tasks.map((task) => (
                <li key={task.id} className="task-item">
                  <div className="task-info">
                    <span className="task-title">{task.title}</span>
                    <span className="task-date">{formatDate(task.createdAt)}</span>
                  </div>
                  <div className="task-actions">
                    <span className={`status-badge ${getBadgeClass(task.status)}`}>
                      {task.status}
                    </span>
                    <select
                      className="status-select"
                      value={task.status}
                      disabled={updatingTaskId === task.id}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      aria-label="Update task status"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
