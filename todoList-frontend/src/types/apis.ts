export interface TodoDTOBase{
  title: string;
  description: string | null;
  completed: boolean;
  category: string | null;
  dueAt: string|null;
}

export interface TodoDTO extends TodoDTOBase {
  id: number;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; 
  deleted: boolean;
}



export interface TodoCreateDTO extends TodoDTOBase {
  localId: string;
}

export interface SyncChangesDTO {
  creates: TodoCreateDTO[];
  updates: TodoDTO[];
  deletes: number[]; // An array of server IDs (id) to delete
}

export interface SyncRequestDTO {
  lastSyncTimestamp: string;
  changes: SyncChangesDTO;
}

export interface SyncResponseDTO {
  newSyncTimestamp: string;
  createdMappings: Record<string, number>;
  serverChanges: TodoDTO[];
}