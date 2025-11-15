/**
 * The type used to store a todo entry in the frontend
 *  */ 

export interface FrontendTodo{
    id: number; // global id created when synchronized
    title: string;
    description: string | null;
    category: string|null
    createAt: Date
    updateAt: Date|null
    localId: String;
    syncStatus: 'synced' | 'pending_create' |'pending_create' | 'pending_delete';
}