package dev.javacafe.todolist.application.dto;

import lombok.Data;

import java.util.List;

@Data
public class TodoChangesDTO {
    private List<TodoCreateDTO> creates;
    private List<TodoDTO> updates;
    private List<Long> deletes;
}
