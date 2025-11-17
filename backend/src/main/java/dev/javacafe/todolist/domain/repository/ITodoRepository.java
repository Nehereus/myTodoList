package dev.javacafe.todolist.domain.repository;

import dev.javacafe.todolist.domain.model.todo.Todo;
import dev.javacafe.todolist.domain.model.user.UserId;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface ITodoRepository {
    Todo save(Todo todo);
    Optional<Todo> findById(Long id);
    List<Todo> findByUserId(UserId userId);

    List<Todo> findByUserIdAndUpdatedAtAfter(UserId userId, Instant lastSyncAt);
}
