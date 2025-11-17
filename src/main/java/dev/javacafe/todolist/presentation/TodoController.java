package dev.javacafe.todolist.presentation;

import dev.javacafe.todolist.application.service.TodoService;
import dev.javacafe.todolist.application.dto.SyncRequestDTO;
import dev.javacafe.todolist.application.dto.SyncResponseDTO;
import dev.javacafe.todolist.domain.model.user.UserId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/todos")
public class TodoController {
    private final TodoService todoService;

    @Autowired
    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    @PostMapping("/sync")
    public ResponseEntity<SyncResponseDTO> sync(
            @RequestBody SyncRequestDTO syncRequest
            //Authentication authentication
    ) {
        UserId userId = new UserId(1L);

        SyncResponseDTO response = todoService.syncTodos(userId, syncRequest);
        return ResponseEntity.ok(response);
    }
}
