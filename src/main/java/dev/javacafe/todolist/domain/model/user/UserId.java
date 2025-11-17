package dev.javacafe.todolist.domain.model.user;


public record UserId(Long value) {
    public UserId{
        if (value == null ) {
            throw new IllegalArgumentException("UserId cannot be null or blank");
        }
    }
}