package com.Sehrawat.SmartExpenseTracker.SecurityModule;

import com.Sehrawat.SmartExpenseTracker.Entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepo.count() == 0) {
            User defaultAdmin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .role("ROLE_ADMIN")
                    .build();
            userRepo.save(defaultAdmin);
            System.out.println("----------------------------------------");
            System.out.println("Default user created in database:");
            System.out.println("Username: admin");
            System.out.println("Password: admin123");
            System.out.println("----------------------------------------");
        }
    }
}
