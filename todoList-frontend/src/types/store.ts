/**
 * The type used to store a todo entry in the frontend
 *  */ 

export interface FrontendTodo{
    localId: string;
    id: number; // global id created when synchronized
    title: string;
    description: string
    completed: boolean;
    category: string
    dueAt: number|null;
    createdAt: number
    updatedAt: number
    syncStatus: 'synced' | 'pending_create' |'pending_update' | 'pending_delete';
}