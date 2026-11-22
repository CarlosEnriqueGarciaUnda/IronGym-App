package mx.edu.ito.irongym.controller;

import mx.edu.ito.irongym.dto.Requests.*;
import mx.edu.ito.irongym.dto.Views;
import mx.edu.ito.irongym.service.*;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;
    private final CurrentUser current;
    public AuthController(AuthService auth, CurrentUser current) {
        this.auth = auth;
        this.current = current;
    }

    @PostMapping("/login")
    public Views.AuthView login(@Valid @RequestBody Login body) {
        return auth.login(body);
    }

    @PostMapping("/register")
    public Views.AuthView register(@Valid @RequestBody Register body) {
        return auth.register(body);
    }

    @PostMapping("/logout")
    public Map<String, String> logout(@RequestHeader("Authorization")String bearer) {
        auth.logout(bearer);
        return Map.of("message", "Sesión cerrada. Token invalidado.");
    }

    @PostMapping("/forgot-password")
    public Map<String, String> forgot(@Valid @RequestBody Forgot body) {
        return auth.forgot(body);
    }

    @PostMapping("/reset-password")
    public Map<String, String> reset(@Valid @RequestBody Reset body) {
        return auth.reset(body);
    }

    @GetMapping("/me")
    public Views.UserView me() {
        return Views.user(current.get());
    }
}
