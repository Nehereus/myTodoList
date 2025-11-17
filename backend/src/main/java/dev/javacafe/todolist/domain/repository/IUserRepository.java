package dev.javacafe.todolist.domain.repository;

import dev.javacafe.todolist.domain.model.user.User;
import dev.javacafe.todolist.domain.model.user.UserId;

import java.util.Optional;

public interface IUserRepository {
    User save(User user);
    Optional<User> findByName(String username);
    boolean existsByUsername(String username);
}
