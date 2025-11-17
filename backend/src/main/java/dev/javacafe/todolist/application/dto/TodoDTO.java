package dev.javacafe.todolist.application.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class TodoDTO {
    private Long id;
    private String title;
    private String description;
    private boolean completed;
    private String category;
    private Instant dueAt;
    private Instant createdAt;
    private Instant updatedAt;
    private boolean deleted;
}
