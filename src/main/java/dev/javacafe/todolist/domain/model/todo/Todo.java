package dev.javacafe.todolist.domain.model.todo;

import dev.javacafe.todolist.domain.model.user.UserId;
import lombok.Data;

import java.time.Instant;


@Data
public class Todo {

    private Long id;
    private UserId userId;

    private String title;
    private String description;
    private boolean completed;
    private String category;

    private Instant dueAt;
    private Instant createdAt;
    private Instant updatedAt;
    private boolean deleted;


    public static Todo create(UserId userId, String title) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Title cannot be empty.");
        }

        Todo todo = new Todo();
        todo.userId = userId;
        todo.title = title;
        todo.completed = false;
        todo.category = ""; // Default category
        todo.dueAt = Instant.now();
        todo.createdAt = Instant.now();
        todo.updatedAt = Instant.now();
        todo.deleted = false;

        return todo;
    }

    public static Todo from(
            Long id, UserId userId, String title, String description,
            boolean completed, String category,Instant dueAt, Instant createdAt, Instant updatedAt,
            boolean deleted
    ) {
        Todo todo = new Todo();
        todo.id = id;
        todo.userId = userId;
        todo.title = title;
        todo.description = description;
        todo.completed = completed;
        todo.category = category;
        todo.dueAt = dueAt;
        todo.createdAt = createdAt;
        todo.updatedAt = updatedAt;
        todo.deleted = deleted;
        return todo;
    }

    public void updateDueAt(Instant dueAt) {
        this.dueAt = dueAt;
    }

    public void toggleCompletion(boolean completed) {
        if (this.completed) {
            return;
        }
        this.completed = completed;
    }


    public void updateText(String newTitle, String newDescription) {
        this.title = newTitle;
        this.description = newDescription;
    }

    public void changeCategory(String newCategory) {
        this.category = (newCategory == null || newCategory.isBlank()) ? "all" : newCategory;
    }


}