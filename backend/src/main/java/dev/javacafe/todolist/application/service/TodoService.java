package dev.javacafe.todolist.application.service;

import dev.javacafe.todolist.application.dto.SyncRequestDTO;
import dev.javacafe.todolist.application.dto.SyncResponseDTO;
import dev.javacafe.todolist.application.dto.TodoCreateDTO;
import dev.javacafe.todolist.application.dto.TodoDTO;
import dev.javacafe.todolist.application.mapper.TodoMapper;
import dev.javacafe.todolist.domain.model.todo.Todo;
import dev.javacafe.todolist.domain.model.user.UserId;
import dev.javacafe.todolist.domain.repository.ITodoRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@Slf4j
public class TodoService {
    private final ITodoRepository todoRepository;
    private final TodoMapper todoMapper;

    @Autowired
    public TodoService(ITodoRepository todoRepository, TodoMapper todoMapper) {
        this.todoRepository = todoRepository;
        this.todoMapper = todoMapper;
    }

    @Transactional
    public SyncResponseDTO syncTodos(UserId userId, SyncRequestDTO request) {
        Instant newSyncTimestamp = Instant.now();
        Instant lastSyncTimestamp = request.getLastSyncTimestamp();
        Map<String, Long> createdMappings = new HashMap<>();

        if (request.getChanges() != null) {
            // Process Deletions
            processDeletions(request.getChanges().getDeletes(), userId);

            // Process Updates
            processUpdates(request.getChanges().getUpdates(), userId);

            // Process Creations
            createdMappings = processCreations(request.getChanges().getCreates(), userId);

            List<Todo> serverChanges = (lastSyncTimestamp == null)
                    ? todoRepository.findByUserId(userId)
                    : todoRepository.findByUserIdAndUpdatedAtAfter(userId, lastSyncTimestamp);
            final java.util.Set<Long> newlyCreatedIds = new java.util.HashSet<>(createdMappings.values());
            serverChanges =  serverChanges.stream().filter(todo->!newlyCreatedIds.contains(todo.getId())).toList();
            log.debug(serverChanges.toString());
            List<TodoDTO> serverChangesDTO = todoMapper.toDTOs(serverChanges);

            return new SyncResponseDTO(newSyncTimestamp, createdMappings, serverChangesDTO);
        }

        return null;
    }

    private void processDeletions(List<Long> deleteIds, UserId userId) {
        if (deleteIds == null || deleteIds.isEmpty()) return;

        for (Long todoId : deleteIds) {
            todoRepository.findById(todoId)
                    .ifPresent(todo -> {
                        log.info("Processing deletion for Todo ID: {}", todoId);
                        if (Objects.equals(todo.getUserId().value(), userId.value())) {
                            todo.setDeleted(true);
                            todo.setUpdatedAt(Instant.now());
                            todoRepository.save(todo);
                            // Delete event for Elasticsearch
                        }
                    });
        }
    }

    private void processUpdates(List<TodoDTO> updateDTOs, UserId userId) {
        if (updateDTOs == null || updateDTOs.isEmpty()) return;

        for (TodoDTO dto : updateDTOs) {
            todoRepository.findById(dto.getId())
                    .ifPresent(todo -> {
                        log.info("Processing update for Todo ID: {}", dto.getId());
                        if (!Objects.equals(todo.getUserId().value(), userId.value())) {
                            return;
                        }

                        try {
                            todo.updateText(dto.getTitle(), dto.getDescription());
                            todo.setCategory(dto.getCategory());
                            todo.setDueAt(dto.getDueAt());
                            todo.setUpdatedAt(dto.getUpdatedAt());
                            todo.toggleCompletion(dto.isCompleted());
                            todoRepository.save(todo);
                        } catch (Exception e) {
                            log.error("Error updating Todo ID {}: {}", dto.getId(), e.getMessage());
                        }
                    });
        }
    }
    private Map<String, Long> processCreations(List<TodoCreateDTO> createDTOs, UserId userId) {
        if (createDTOs == null || createDTOs.isEmpty()) {
            return new HashMap<>();
        }

        Map<String, Long> mappings = new HashMap<>();
        for (TodoCreateDTO dto : createDTOs) {
            Todo newTodo = todoMapper.toDomain(dto, userId);
            Todo savedTodo = todoRepository.save(newTodo);
            mappings.put(dto.getLocalId(), savedTodo.getId());
        }
        return mappings;
    }
}
