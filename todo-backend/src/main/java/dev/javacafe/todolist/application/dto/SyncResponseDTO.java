package dev.javacafe.todolist.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
public class SyncResponseDTO {
    private Instant newSyncTimestamp;
    private Map<String, Long> createdMappings;
    private List<TodoDTO> serverChanges;
}
