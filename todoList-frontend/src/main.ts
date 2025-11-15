// Import our styles (Vite will handle this)
// import './style.css';

import { todoService } from './services/todoService';
import { initializeRenderer } from './ui/render';

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

});