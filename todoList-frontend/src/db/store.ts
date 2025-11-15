import { createStore } from 'tinybase';
import type { FrontendTodo } from '../types/store';
import { createLocalPersister} from 'tinybase/persisters/persister-browser';

const SCHEMA = {
  todos: {
    localId: { type: 'string' }, 
    id: { type: 'number', default: -1 },
    title: { type: 'string' },
    description: { type: 'string', default: '' },
    completed: { type: 'boolean', default: false },
    category: { type: 'string', default: 'all' },
    dueAt: { type: 'number', default: -1},
    createdAt: { type: 'number', default: Date.now() }, // Store as timestamp (number)
    updatedAt: { type: 'number', default: Date.now() },
    syncStatus: { type: 'string', default: 'pending_create' }, 
  },
}

export const store = createStore().setTablesSchema(SCHEMA);

const PERSIST_KEY = 'todos';
const persister = createLocalPersister(store, PERSIST_KEY);

(async () => {
  const saved = localStorage.getItem(PERSIST_KEY);

  if(saved) {
    await persister.startAutoLoad();
  }

  await persister.startAutoSave();
})();