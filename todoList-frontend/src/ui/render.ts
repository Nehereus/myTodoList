import { store } from '../db/store';
import { todoService } from '../services/todoService';
import {ss} from '../services/searchingService';

// Layout / filter state
const TABLE = 'todos';
const TYPES = ['all', 'inbox', 'personal', 'work', 'shopping'];
const TYPE_LABELS: Record<string, string> = {
  all: '全部',
  inbox: '收件箱',
  personal: '个人',
  work: '工作',
  shopping: '购物',
};
let selectedCategory = 'all';
let isSearching = false;
let searchTerms = '';

// 1. Get the container elements from the DOM
const listContainer = document.getElementById('todo-list-container');
const typesList = document.getElementById('types-list');


export function renderTodoList() {
  if (!listContainer) {
    console.error('List container not found');
    return;
  }
  
  let todoIds;
  if (isSearching &&searchTerms&& searchTerms.trim() !== '') {
    
    try {
      todoIds = ss.search(searchTerms);
    } catch (e) {
      console.error('Search failed:', e);
      todoIds = store.getRowIds(TABLE);
    }
  } else {
   
    todoIds = store.getRowIds(TABLE);
  }

  if (selectedCategory !== 'all') {
    todoIds = todoIds.filter(id => {
      const r = store.getRow(TABLE, id);
      return r && r.category === selectedCategory;
    });
  }
  
  listContainer.innerHTML = '';

  todoIds.forEach(id => {
    const todo = store.getRow(TABLE, id);
    if(todo.syncStatus === 'pending_delete'||todo.deleted) return;
    const todoEl = document.createElement('div');
    todoEl.className = 'todo-item';
    todoEl.setAttribute('data-id', id);

    if (todo.completed) {
      todoEl.classList.add('completed');
    }

    const dueAtNum = Number(todo.dueAt ?? -1);
    const dueText = (Number.isFinite(dueAtNum) && dueAtNum > 0)
      ? new Date(dueAtNum).toLocaleDateString()
      : '';

    todoEl.innerHTML = `
      <input type="checkbox" class="toggle" ${todo.completed ? 'checked' : ''}>
      <div class="todo-main">
        <div class="todo-header">
          <span class="title">${escapeHtml(String(todo.title || ''))}</span>
          <span class="category">${TYPE_LABELS[String(todo.category ?? 'all')]}</span>
        </div>
        <div class="todo-body">
          <div class="description">${escapeHtml(String(todo.description || ''))}</div>
          <div class="due">${dueText ? `截止： ${dueText}` : ''}</div>
        </div>
      </div>
      <div class="controls">
        <button class="edit">编辑</button>
        <button class="delete">×</button>
      </div>
    `;

    listContainer.appendChild(todoEl);
  });
}

function setupSearchListeners() {
  const input = document.getElementById('search-input') as HTMLInputElement | null;
  const searchBtn = document.getElementById('search-button') as HTMLButtonElement | null;
  const clearBtn = document.getElementById('clear-search') as HTMLButtonElement | null;
  console.log("triggers")
  if (searchBtn && (input || input === '')) {
    searchBtn.addEventListener('click', () => {
      const terms = input.value.trim();
      if (terms) {
        isSearching = true;
        searchTerms = terms;
      } else {
        isSearching = false;
        searchTerms = '';
      }
      renderTodoList();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const terms = input.value.trim();
        if (terms) {
          isSearching = true;
          searchTerms = terms;
        } else {
          isSearching = false;
          searchTerms = '';
        }
        renderTodoList();
      }
    });
  }

  if (clearBtn && (input || input === '')) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      isSearching = false;
      searchTerms = '';
      renderTodoList();
    });
  }
}

function renderTypes() {
  if (!typesList) return;

  typesList.innerHTML = '';
  TYPES.forEach(type => {
    const li = document.createElement('li');
    li.className = 'type' + (type === selectedCategory ? ' current' : '');
    li.textContent = TYPE_LABELS[type];
    li.setAttribute('data-type', type);
    typesList.appendChild(li);
  });
}

function setupListListeners() {
  if (!listContainer) return;

  listContainer.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const parentItem = target.closest('.todo-item');
    if (!parentItem) return;

    const localId = parentItem.getAttribute('data-id');
    if (!localId) return;

    if (target.matches('.toggle')) {
      todoService.toggleTodo(localId);
    } else if (target.matches('.delete')) {
      todoService.deleteTodo(localId);
    } else if (target.matches('.edit')) {
      // Replace item with inline edit form
      const todo = store.getRow(TABLE, localId);
      if (!todo) return;

      // Helper to format timestamp to yyyy-mm-dd for input
      const toDateInput = (ms: unknown) => {
        const n = Number(ms ?? -1);
        if (!Number.isFinite(n) || n <= 0) return '';
        const d = new Date(n);
        return d.toISOString().slice(0, 10);
      };

      const safeTitle = escapeHtml(String(todo.title ?? ''));
      const safeDesc = escapeHtml(String(todo.description ?? ''));

      parentItem.innerHTML = `
        <div class="edit-form">
          <input class="edit-title" value="${safeTitle}" />
          <textarea class="edit-description">${safeDesc}</textarea>
          <div class="edit-row">
            <input type="date" class="edit-due" value="${toDateInput(todo.dueAt)}" />
            <select class="edit-category">
              ${TYPES.map(t => `<option value="${t}" ${t=== (todo.category||'all') ? 'selected' : ''}>${TYPE_LABELS[t]}</option>`).join('')}
            </select>
          </div>
          <div class="edit-actions">
            <button class="save">保存</button>
            <button class="cancel">取消</button>
          </div>
        </div>
      `;
    } else if (target.matches('.save')) {
      // Save inline edits
      const todoEl = target.closest('.todo-item');
      if (!todoEl) return;
      const id = todoEl.getAttribute('data-id');
      if (!id) return;
      const titleInput = todoEl.querySelector('.edit-title') as HTMLInputElement | null;
      const descInput = todoEl.querySelector('.edit-description') as HTMLTextAreaElement | null;
      const dueInput = todoEl.querySelector('.edit-due') as HTMLInputElement | null;
      const catSelect = todoEl.querySelector('.edit-category') as HTMLSelectElement | null;

      const newTitle = titleInput ? titleInput.value.trim() : '';
      const newDesc = descInput ? descInput.value.trim() : '';
      let newDue = -1;
      if (dueInput && dueInput.value) {
        const d = new Date(dueInput.value);
        if (!isNaN(d.getTime())) newDue = d.getTime();
      }
      const newCat = catSelect ? catSelect.value : 'all';

      if (newTitle) {
        todoService.updateTodo(id, newTitle, newDesc, newCat, newDue);
      }
    } else if (target.matches('.cancel')) {
      // Re-render list to restore view
      renderTodoList();
    }
  });
}

// Simple escaping to avoid breaking attribute values when inlining text
function escapeHtml(input: string) {
  return (input || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function setupTypesListeners() {
  if (!typesList) return;

  typesList.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest('li');
    if (!t) return;
    const type = t.getAttribute('data-type');
    if (!type) return;
    selectedCategory = type;
    renderTypes();
    renderTodoList();
  });
}

export function initializeRenderer() {
  if (!listContainer) {
    console.error('Cannot initialize renderer: list container not found.');
    return;
  }

  store.addTableListener(TABLE, () => {
    renderTodoList();
  });

  setupListListeners();
  setupTypesListeners();
  setupSearchListeners();

  // Render types
  renderTypes();
  renderTodoList();
}