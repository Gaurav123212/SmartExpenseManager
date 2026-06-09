package com.Sehrawat.SmartExpenseTracker.SecurityModule;

import com.Sehrawat.SmartExpenseTracker.Entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username and password are required."));
        }

        if (userRepo.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is already taken."));
        }

        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .role("ROLE_USER")
                .build();

        userRepo.save(user);

        return ResponseEntity.ok(Map.of("message", "User registered successfully!"));
    }
}
