package dev.javacafe.todolist.application.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class TodoCreateDTO {
    private String localId; // Client-generated ID
    private String title;
    private String description;
    private String category;
    private Instant dueAt;
}
