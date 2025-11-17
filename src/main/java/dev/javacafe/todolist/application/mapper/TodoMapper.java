package dev.javacafe.todolist.application.mapper;

import dev.javacafe.todolist.application.dto.TodoCreateDTO;
import dev.javacafe.todolist.application.dto.TodoDTO;
import dev.javacafe.todolist.domain.model.todo.Todo;
import dev.javacafe.todolist.domain.model.user.UserId;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TodoMapper {

    TodoDTO toDTO(Todo todo);
    List<TodoDTO> toDTOs(List<Todo> todos);

    default Todo toDomain(TodoCreateDTO createDTO, UserId userId) {
        if (createDTO == null) {
            return null;
        }
        Todo todo = Todo.create(userId, createDTO.getTitle());
        todo.setDescription(createDTO.getDescription());
        todo.setCategory(createDTO.getCategory());
        todo.setDueAt(createDTO.getDueAt());
        return todo;
    }

    default Long map(UserId userId) {
        return userId.value();
    }
}
