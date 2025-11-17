package dev.javacafe.todolist.infrastructure.security;

import dev.javacafe.todolist.domain.model.user.User;
import dev.javacafe.todolist.domain.repository.IUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class UserDetailsServiceImpl implements UserDetailsService  {
    private final IUserRepository userRepository;
    @Autowired
    public UserDetailsServiceImpl(IUserRepository userRepository) {
        this.userRepository = userRepository;
    }
    @Override
    @NonNull
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByName(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        return new UserPrincipal(
                user.getId().value(),
                user.getUsername(),
                user.getHashedPassword()
        );
    }
}
