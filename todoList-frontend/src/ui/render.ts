import { store } from '../db/store';
import { todoService } from '../services/todoService';


// Layout / filter state
const TYPES = ['all', 'inbox', 'personal', 'work', 'shopping'];
let selectedCategory = 'all';

// 1. Get the container elements from the DOM
const listContainer = document.getElementById('todo-list-container');
const typesList = document.getElementById('types-list');

function renderTodoList() {
  if (!listContainer) {
    console.error('List container not found');
    return;
  }

  let todoIds = store.getRowIds('todos');
  if (selectedCategory !== 'all') {
    todoIds = todoIds.filter(id => {
      const r = store.getRow('todos', id);
      return r && r.category === selectedCategory;
    });
  }
  
  listContainer.innerHTML = '';

  todoIds.forEach(id => {
    const todo = store.getRow('todos', id);

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
          <span class="title">${todo.title}</span>
          <span class="category">${todo.category || 'all'}</span>
        </div>
        <div class="todo-body">
          <div class="description">${todo.description || ''}</div>
          <div class="due">${dueText ? `Due: ${dueText}` : ''}</div>
        </div>
      </div>
      <div class="controls">
        <button class="edit">Edit</button>
        <button class="delete">×</button>
      </div>
    `;

    listContainer.appendChild(todoEl);
  });
}

function renderTypes() {
  if (!typesList) return;

  typesList.innerHTML = '';
  TYPES.forEach(type => {
    const li = document.createElement('li');
    li.className = 'type' + (type === selectedCategory ? ' current' : '');
    li.textContent = type[0].toUpperCase() + type.slice(1);
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
      const todo = store.getRow('todos', localId);
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
              ${TYPES.map(t => `<option value="${t}" ${t=== (todo.category||'all') ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </div>
          <div class="edit-actions">
            <button class="save">Save</button>
            <button class="cancel">Cancel</button>
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

  store.addTableListener('todos', () => {
    renderTodoList();
  });

  setupListListeners();
  setupTypesListeners();

  // Render types
  renderTypes();
  renderTodoList();
}