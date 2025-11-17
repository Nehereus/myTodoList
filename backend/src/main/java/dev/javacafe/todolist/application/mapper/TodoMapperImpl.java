package dev.javacafe.todolist.application.mapper;

import dev.javacafe.todolist.application.dto.TodoCreateDTO;
import dev.javacafe.todolist.application.dto.TodoDTO;
import dev.javacafe.todolist.domain.model.todo.Todo;
import dev.javacafe.todolist.domain.model.user.UserId;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class TodoMapperImpl implements TodoMapper {

    @Override
    public TodoDTO toDTO(Todo todo) {
        if (todo == null) {
            return null;
        }

        TodoDTO todoDTO = new TodoDTO();

        // --- Manually map all fields ---
        todoDTO.setId(todo.getId());
        todoDTO.setTitle(todo.getTitle());
        todoDTO.setDescription(todo.getDescription());
        todoDTO.setCompleted(todo.isCompleted());
        todoDTO.setCategory(todo.getCategory());
        todoDTO.setDueAt(todo.getDueAt());
        todoDTO.setCreatedAt(todo.getCreatedAt());
        todoDTO.setUpdatedAt(todo.getUpdatedAt());
        todoDTO.setDeleted(todo.isDeleted());

        return todoDTO;
    }

    @Override
    public List<TodoDTO> toDTOs(List<Todo> todos) {
        if (todos == null) {
            return null;
        }
        return todos.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Todo toDomain(TodoCreateDTO createDTO, UserId userId) {
        if (createDTO == null) {
            return null;
        }
        Todo todo = Todo.create(userId, createDTO.getTitle());

        todo.setDescription(createDTO.getDescription());
        todo.setCategory(createDTO.getCategory());
        todo.setDueAt(createDTO.getDueAt());

        return todo;
    }
}