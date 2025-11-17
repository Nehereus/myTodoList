package dev.javacafe.todolist.application.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class SyncRequestDTO {
    private Instant lastSyncTimestamp; // Can be null for first sync
    private TodoChangesDTO changes;
}
