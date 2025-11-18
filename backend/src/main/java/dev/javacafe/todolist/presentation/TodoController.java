package dev.javacafe.todolist.presentation;

import dev.javacafe.todolist.application.service.TodoService;
import dev.javacafe.todolist.application.dto.SyncRequestDTO;
import dev.javacafe.todolist.application.dto.SyncResponseDTO;
import dev.javacafe.todolist.domain.model.user.UserId;
import dev.javacafe.todolist.infrastructure.security.UserPrincipal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/todos")
@Slf4j
public class TodoController {
    private final TodoService todoService;

    @Autowired
    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    @PostMapping("/sync")
    public ResponseEntity<SyncResponseDTO> sync(
            @RequestBody SyncRequestDTO syncRequest,
            Authentication authentication
    ) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        UserId userId = new UserId(userPrincipal.getId());
        log.info("Sync Request from{}", userId);
        SyncResponseDTO response = todoService.syncTodos(userId, syncRequest);
        return ResponseEntity.ok(response);
    }
}
