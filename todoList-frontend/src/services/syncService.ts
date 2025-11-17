import { store } from '../db/store';
import type { FrontendTodo } from '../types/store';
import { indexes } from '../db/store';
import { renderTodoList } from '../ui/render';
import type {
    TodoDTO,
    TodoCreateDTO,
    SyncRequestDTO,
    SyncResponseDTO
} from '../types/apis';

const authService = {
    getToken: () => "DUMMY_AUTH_TOKEN" // Replace with real auth
};

export const syncService = {
    locked: false,

    async triggerSync() {
        if (this.locked) {
            return;
        }
        this.locked = true;
        try {
            const lastSyncTimestamp = store.getValue('lastSyncTimestamp') as string;
            const localChanges = this.getLocalChanges();
            const payload: SyncRequestDTO = {
                lastSyncTimestamp: lastSyncTimestamp ? lastSyncTimestamp : new Date(0).toISOString(),
                changes: {
                    creates: localChanges.creates,
                    updates: localChanges.updates,
                    deletes: localChanges.deletes
                }
            }
            const response = await this.sendRequest(payload);
            if(response.serverChanges.length > 0)
                console.info(response);
            
            await this.processResponse(response, localChanges.pendingDeleteLocalIds);
            store.setValue('lastSyncTimestamp', response.newSyncTimestamp); 
        } catch (e) {
            console.error("Sync failed:", e);
        } finally {
            this.locked = false;
        }
    },

    getLocalChanges() {
        const creates: TodoCreateDTO[] = [];
        const updates: TodoDTO[] = [];
        const deletes: number[] = [];
        const pendingDeleteLocalIds: string[] = [];

        const createIds = indexes.getSliceRowIds('todosBySyncStatus', 'pending_create');
        for (const localId of createIds) {
            const todo = store.getRow('todos', localId) as unknown as FrontendTodo;
            creates.push(this.mapToCreateDTO(todo));
        }

        const updateIds = indexes.getSliceRowIds('todosBySyncStatus', 'pending_update');
        for (const localId of updateIds) {
            const todo = store.getRow('todos', localId) as unknown as FrontendTodo;
            if (todo.id != null) { // Only update if it has a server ID
                updates.push(this.mapToUpdateDTO(todo));
                console.log('Queued update for todo id:', todo.id);
            }
        }

        const deleteIds = indexes.getSliceRowIds('todosBySyncStatus', 'pending_delete');
        for (const localId of deleteIds) {
            pendingDeleteLocalIds.push(localId);
            const todo = store.getRow('todos', localId) as unknown as FrontendTodo;
            if (todo.id != null) { // Only tell server to delete if it knows about it
                deletes.push(todo.id);
            }
        }
        return { creates, updates, deletes, pendingDeleteLocalIds };

    },

    async sendRequest(payload: SyncRequestDTO): Promise<SyncResponseDTO> {
        const token = authService.getToken();
        const response = await fetch('http://localhost:8080/api/todos/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Sync request failed:', payload);
            throw new Error(`Sync request failed with status ${response.status}: ${errorData}`);
        }
        return await response.json() as SyncResponseDTO;
    },

    async processResponse(response: SyncResponseDTO, pendingDeleteLocalIds: string[]) {
        store.startTransaction();
        try {
            for(const change of response.serverChanges){
                if(change.deleted){
                    const t = String(indexes.getSliceRowIds('todosByServerId', String(change.id)));
                    pendingDeleteLocalIds.push(t);
                }

            }
            for (const localId of pendingDeleteLocalIds) {
                if (store.hasRow('todos', localId)) {
                    store.delRow('todos', localId);
                }
            }

            if (response.createdMappings) {
                for (const [localId, serverId] of Object.entries(response.createdMappings)) {
                    if (store.hasRow('todos', localId)) {
                        store.setPartialRow('todos', localId, {
                            id: serverId,
                            syncStatus: 'synced'
                        });
                    }
                }
            }

            indexes.getSliceRowIds('todosBySyncStatus', 'pending_update').forEach(localId => {
                store.setCell('todos', localId, 'syncStatus', 'synced');
            });

            if (response.serverChanges) {
                for (const dto of response.serverChanges.filter(c=>!c.deleted)) {
                    this.mergeServerChange(dto);
                }
            }

            store.finishTransaction();

            if(response.serverChanges.length > 0||response.createdMappings.length > 0){
                renderTodoList();
            }
            
        } catch (e) {
            console.error("Failed to process sync response:", e);
        }
    },

    mergeServerChange(dto: TodoDTO) {
        const matched = indexes.getSliceRowIds('todosByServerId', String(dto.id));
        const localId = (matched && matched.length > 0) ? matched[0] : undefined;

        const targetLocalId = localId ?? crypto.randomUUID();
        const serverTodo = this.mapDtoToFrontend(dto, targetLocalId);

        const safeServerTodo = {
            ...serverTodo,
            dueAt: serverTodo.dueAt ?? -1,
            createdAt: serverTodo.createdAt ?? Date.now(),
            updatedAt: serverTodo.updatedAt ?? Date.now(),
        } as unknown as FrontendTodo;

        if (localId) {
            // Item exists locally — check timestamps and merge (server wins on newer)
            if(dto.deleted){
                store.delRow('todos', localId);
                return;
            }
            const localTodo = store.getRow('todos', localId) as unknown as FrontendTodo | undefined;
            const serverUpdated = Number(safeServerTodo.updatedAt ?? 0);
            const localUpdated = Number(localTodo?.updatedAt ?? 0);

            if (serverUpdated > localUpdated) {
                const rowValues = {
                    localId: localId,
                    id: Number(dto.id ?? -1),
                    title: String(dto.title ?? ''),
                    description: String(dto.description ?? ''),
                    completed: Boolean(dto.completed ?? false),
                    category: String(dto.category ?? 'all'),
                    dueAt: Number(this.mapStringToTimestamp(dto.dueAt) ?? -1),
                    createdAt: Number(this.mapStringToTimestamp(dto.createdAt) ?? Date.now()),
                    updatedAt: Number(this.mapStringToTimestamp(dto.updatedAt) ?? Date.now()),
                    syncStatus: 'synced',
                } as any;

                store.setPartialRow('todos', localId, rowValues);
            }
        } else {
            const rowValues = {
                localId: targetLocalId,
                id: Number(dto.id ?? -1),
                title: String(dto.title ?? ''),
                description: String(dto.description ?? ''),
                completed: Boolean(dto.completed ?? false),
                category: String(dto.category ?? 'all'),
                dueAt: Number(this.mapStringToTimestamp(dto.dueAt) ?? -1),
                createdAt: Number(this.mapStringToTimestamp(dto.createdAt) ?? Date.now()),
                updatedAt: Number(this.mapStringToTimestamp(dto.updatedAt) ?? Date.now()),
                syncStatus: 'synced',
            } as any;

            store.setRow('todos', targetLocalId, rowValues);
        }
    },

    // --- Mappers: Convert between local/API formats ---

    mapTimestampToString: (ts: number | null): string | null => {
        if (ts == null || ts <= 0) return null;
        return new Date(ts).toISOString();
    },

    mapStringToTimestamp: (iso: string | null): number | null => {
        if (!iso) return null;
        const time = new Date(iso).getTime();
        return isNaN(time) ? null : time;
    },

    mapToCreateDTO(todo: FrontendTodo): TodoCreateDTO {
        return {
            localId: todo.localId,
            title: todo.title,
            description: todo.description,
            category: todo.category,
            completed: todo.completed,
            dueAt: this.mapTimestampToString(todo.dueAt),
        };
    },

    mapToUpdateDTO(todo: FrontendTodo): TodoDTO {
        return {
            id: todo.id!, // Filtered to not be null
            title: todo.title,
            description: todo.description,
            completed: todo.completed,
            category: todo.category,
            dueAt: this.mapTimestampToString(todo.dueAt),
            createdAt: this.mapTimestampToString(todo.createdAt)!,
            updatedAt: this.mapTimestampToString(todo.updatedAt)!,
        };
    },

    mapDtoToFrontend(dto: TodoDTO, localId: string): Omit<FrontendTodo, 'syncStatus'> {
        return {
            localId: localId,
            id: dto.id,
            title: dto.title,
            description: dto.description || '', // Ensure not null
            completed: dto.completed,
            category: dto.category || 'inbox', // Ensure not null
            dueAt: this.mapStringToTimestamp(dto.dueAt),
            createdAt: this.mapStringToTimestamp(dto.createdAt)!,
            updatedAt: this.mapStringToTimestamp(dto.updatedAt)!,
        };
    }

}