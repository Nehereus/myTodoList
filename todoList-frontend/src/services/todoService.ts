import { store } from '../db/store';
import type { FrontendTodo } from '../types/store';

export const todoService = {
  // Accept description, category and dueAt (timestamp ms or -1 for none)
  createTodo: (
    title: string,
    description = '',
    category = 'all',
    dueAt: number = -1
  ): void => {
    const localId = crypto.randomUUID();
    const now = Date.now();

    store.setRow('todos', localId, {
      localId: localId,
      id: -1,
      title: title,
      description: description,
      completed: false,
      category: category,
      dueAt: dueAt,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending_create'
    });

    console.log('Created todo with localId:', localId);
  },

  toggleTodo: (localId: string) => {
    const todo = store.getRow('todos', localId);
    if (!todo) {
      console.error('Todo not found:', localId);
      return;
    }
    store.setCell(
        'todos',
        localId,
        'completed',
        !todo.completed
    ) 
    store.setCell('todos', localId, 'updatedAt', Date.now());
    },

    deleteTodo: (localId: string) => {
    if (!store.hasRow('todos', localId)) {
      console.error('Todo not found:', localId);
      return;
    }
    
    store.delRow('todos', localId);
  },

  updateTodoText: (
    localId: string,
    newTitle: string,
    newDescription = ''
  ) => {
    if (!store.hasRow('todos', localId)) {
      console.error('Todo not found:', localId);
      return;
    }

    store.setPartialRow('todos', localId, {
      title: newTitle,
      description: newDescription,
      updatedAt: Date.now(),
    });
  },

  updateTodoDueDate: (
    localId: string,
    newDueDate: number = -1
  ) => {
    if (!store.hasRow('todos', localId)) {
      console.error('Todo not found:', localId);
      return;
    }

    store.setCell('todos', localId, 'dueAt', newDueDate);
  }
,
  // Full update for editable fields: title, description, category, dueAt
  updateTodo: (
    localId: string,
    newTitle: string,
    newDescription: string = '',
    newCategory: string = 'all',
    newDueAt: number = -1
  ) => {
    if (!store.hasRow('todos', localId)) {
      console.error('Todo not found:', localId);
      return;
    }

    store.setPartialRow('todos', localId, {
      title: newTitle,
      description: newDescription,
      category: newCategory,
      dueAt: newDueAt,
      updatedAt: Date.now(),
    });
  }
}
