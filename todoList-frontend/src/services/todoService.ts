import { store } from '../db/store';

const TABLE = 'todos';
export const todoService = {
  // Accept description, category and dueAt (timestamp ms or -1 for none)
  createTodo: (
    title: string,
    description = '',
    category = 'all',
    dueAt: number = -1
  ): boolean => {
    try {
      const localId = crypto.randomUUID();
      const now = Date.now();

      store.setRow(TABLE, localId, {
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
      return true;
    } catch (e) {
      console.error('Failed to create todo', e);
      return false;
    }
  },

  changeSyncStatus: (localId: string) => {
      store.setCell(TABLE, localId, 'updatedAt', Date.now());
      store.setCell(TABLE, localId, 'syncStatus', 'pending_update');

  },

  toggleTodo: (localId: string): boolean => {
    const todo = store.getRow(TABLE, localId);
    if (!todo) {
      console.error('Todo not found:', localId);
      return false;
    }

    const newCompleted = !Boolean(todo.completed);
    if (newCompleted === Boolean(todo.completed)) return false;

    store.setCell(TABLE, localId, 'completed', newCompleted);
    todoService.changeSyncStatus(localId);
    return true;
  },

  deleteTodo: (localId: string): boolean => {
    if (!store.hasRow(TABLE, localId)) {
      console.error('Todo not found:', localId);
      return false;
    }

    store.setCell(TABLE, localId, 'syncStatus', 'pending_delete');
    return true;
  },

  updateTodoCategory: (
    localId: string,
    newCategory: string = 'all'
  ): boolean => {
    if (!store.hasRow(TABLE, localId)) {
      console.error('Todo not found:', localId);
      return false;
    }
    store.setCell(TABLE, localId, 'category', newCategory);
    todoService.changeSyncStatus(localId);
    return true;
  },

  updateTodoText: (
    localId: string,
    newTitle: string,
    newDescription = ''
  ): boolean => {
    if (!store.hasRow(TABLE, localId)) {
      console.error('Todo not found:', localId);
      return false;
    }

    const cur = store.getRow(TABLE, localId) as Record<string, unknown> | undefined;
    const titleChanged = String(cur?.title ?? '') !== String(newTitle ?? '');
    const descChanged = String(cur?.description ?? '') !== String(newDescription ?? '');

    if (!titleChanged && !descChanged) return false;

    store.setPartialRow(TABLE, localId, {
      title: newTitle,
      description: newDescription,
    });
    todoService.changeSyncStatus(localId);
    return true;
  },

  updateTodoDueDate: (
    localId: string,
    newDueDate: number = -1
  ): boolean => {
    if (!store.hasRow(TABLE, localId)) {
      console.error('Todo not found:', localId);
      return false;
    }

    const cur = store.getRow(TABLE, localId) as Record<string, unknown> | undefined;
    const curDue = Number(cur?.dueAt ?? -1);
    const newDueNum = Number(newDueDate ?? -1);
    if (curDue === newDueNum) return false;

    store.setCell(TABLE, localId, 'dueAt', newDueNum);
    todoService.changeSyncStatus(localId);
    return true;
  },
  // Full update for editable fields: title, description, category, dueAt
  updateTodo: (
    localId: string,
    newTitle: string,
    newDescription: string = '',
    newCategory: string = 'all',
    newDueAt: number = -1
  ) => {
    if (!store.hasRow(TABLE, localId)) {
      console.error('Todo not found:', localId);
      return false;
    }

    todoService.updateTodoText(localId, newTitle, newDescription);
    todoService.updateTodoDueDate(localId, newDueAt);
    todoService.updateTodoCategory(localId, newCategory);
    todoService.updateTodoCategory(localId, newCategory);

    return true;
  }
}
