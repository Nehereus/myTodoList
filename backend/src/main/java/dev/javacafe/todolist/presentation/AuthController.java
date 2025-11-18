package dev.javacafe.todolist.presentation;

import dev.javacafe.todolist.application.dto.AuthRequestDTO;
import dev.javacafe.todolist.application.dto.AuthResponseDTO;
import dev.javacafe.todolist.application.service.AuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody AuthRequestDTO loginRequest) {
        log.info("Authenticating user {}", loginRequest.getUsername());
        AuthResponseDTO authResponse = authService.loginUser(loginRequest);
        return ResponseEntity.ok(authResponse);
    }
}
