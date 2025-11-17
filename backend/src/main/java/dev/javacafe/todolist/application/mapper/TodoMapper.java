package dev.javacafe.todolist.application.mapper;

import dev.javacafe.todolist.application.dto.TodoCreateDTO;
import dev.javacafe.todolist.application.dto.TodoDTO;
import dev.javacafe.todolist.domain.model.todo.Todo;
import dev.javacafe.todolist.domain.model.user.UserId;

import java.util.List;

public interface TodoMapper {

    TodoDTO toDTO(Todo todo);

    List<TodoDTO> toDTOs(List<Todo> todos);

    Todo toDomain(TodoCreateDTO createDTO, UserId userId);
}