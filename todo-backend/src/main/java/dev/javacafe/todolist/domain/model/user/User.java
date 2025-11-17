package dev.javacafe.todolist.domain.model.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Data
public class User {
    private UserId id;
    private String username;
    private String hashedPassword;

    public static User create(UserId id,String username, String hashedPassword) {
        return new User(id, username, hashedPassword);
    }
    public static User from(UserId id, String username, String hashedPassword) {
        return new User(id, username, hashedPassword);
    }
//    public boolean checkPassword(String rawPassword, PasswordEncoder passwordEncoder) {
//        return passwordEncoder.matches(rawPassword, this.hashedPassword);
//    }
}
