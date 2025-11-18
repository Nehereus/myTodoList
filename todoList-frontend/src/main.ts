// Import our styles (Vite will handle this)
// import './style.css';

import { todoService } from './services/todoService';
import { initializeRenderer } from './ui/render';
import { syncService } from './services/syncService';
import { authService } from './services/authService';
import { store } from './db/store';
import {ss} from './services/searchingService';

let _syncIntervalId: number | null = null;

export function startPeriodicSync(intervalMs = 1_000) {
  // run an immediate sync then schedule repeating syncs
  syncService.triggerSync().catch((e) => console.error('Initial sync failed:', e));
  stopPeriodicSync();
  _syncIntervalId = window.setInterval(() => {
    syncService.triggerSync().catch((e) => console.error('Periodic sync failed:', e));
  }, intervalMs);
}

export function stopPeriodicSync() {
  if (_syncIntervalId !== null) {
    clearInterval(_syncIntervalId);
    _syncIntervalId = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  
  const newTodoForm = document.getElementById('new-todo-form');
  const titleInput = document.getElementById('new-todo-title') as HTMLInputElement;
  const descInput = document.getElementById('new-todo-description') as HTMLTextAreaElement | null;
  const dueInput = document.getElementById('new-todo-due') as HTMLInputElement | null;
  const categorySelect = document.getElementById('new-todo-category') as HTMLSelectElement | null;

  if (newTodoForm && titleInput) {
    newTodoForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const title = titleInput.value.trim();
      const description = descInput ? descInput.value.trim() : '';
      const category = categorySelect ? categorySelect.value : 'all';

      let dueAt = -1;
      if (dueInput && dueInput.value) {
        const d = new Date(dueInput.value);
        if (!isNaN(d.getTime())) {
          dueAt = d.getTime();
        }
      }

      if (title) {
        todoService.createTodo(title, description, category, dueAt);

        // Clear fields
        titleInput.value = '';
        if (descInput) descInput.value = '';
        if (dueInput) dueInput.value = '';
        if (categorySelect) categorySelect.value = 'all';
      }
    });
  } else {
    console.error('New todo form or input not found');
  }

  initializeRenderer();

  const authOverlay = document.getElementById('auth-overlay');
  const signinBtn = document.getElementById('auth-signin');
  const localBtn = document.getElementById('auth-local');
  const usernameInput = document.getElementById('auth-username') as HTMLInputElement | null;
  const passwordInput = document.getElementById('auth-password') as HTMLInputElement | null;
  const authError = document.getElementById('auth-error');

  function hideOverlay() {
    if (authOverlay) authOverlay.style.display = 'none';
  }

  function showOverlay() {
    if (authOverlay) authOverlay.style.display = 'flex';
  }

  // If there's a saved token, use it and start syncing immediately.
  const saved = (() => { try { return localStorage.getItem('authToken'); } catch (e) { return null; } })();
  if (saved) {
    syncService.setAuthToken(saved);
    hideOverlay();
    startPeriodicSync();
  } else {
    showOverlay();
  }

  if (signinBtn && usernameInput && passwordInput) {
    signinBtn.addEventListener('click', async () => {
      const u = usernameInput.value.trim();
      const p = passwordInput.value;
      if (!u || !p) {
        if (authError) authError.textContent = '请输入用户名和密码。';
        return;
      }
      if (authError) authError.textContent = '';
      const ok = await authService.authenticate(u, p);
      if (ok) {
        hideOverlay();
        startPeriodicSync();
      } else {
        if (authError) authError.textContent = '身份验证失败。请尝试本地模式或重试。';
      }
    });
  }

  if (localBtn) {
    localBtn.addEventListener('click', () => {
      syncService.clearAuthToken();
      hideOverlay();
    });
  }

});

window.addEventListener('beforeunload', () => stopPeriodicSync());

(window as any).startPeriodicSync = startPeriodicSync;
(window as any).stopPeriodicSync = stopPeriodicSync;

//ss.initialize();
store.addRowListener('todos', null, (_storeId, tableId, rowId) => ss.update(tableId, rowId));
