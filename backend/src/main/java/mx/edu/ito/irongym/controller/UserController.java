package mx.edu.ito.irongym.controller;

import mx.edu.ito.irongym.dto.Requests.*;
import mx.edu.ito.irongym.dto.Views;
import mx.edu.ito.irongym.service.UserService;
import mx.edu.ito.irongym.service.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService service;
    private final CurrentUser current;
    public UserController(UserService service, CurrentUser current) {
        this.service = service;
        this.current = current;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','ENTRENADOR')")
    public Page<Views.UserView> all(@RequestParam(defaultValue = "")String q, @RequestParam(defaultValue = "")String role, @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC)Pageable page) {
        return service.search(q, role, page);
    }

    @GetMapping("/me")
    public Views.UserView me() {
        return Views.user(current.get());
    }

    @PutMapping("/me")
    public Views.UserView updateSelf(@Valid @RequestBody UserUpdate body) {
        return service.updateSelf(body);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Views.UserView add(@Valid @RequestBody UserCreate body) {
        return service.create(body);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Views.UserView update(@PathVariable Long id, @Valid @RequestBody UserUpdate body) {
        return service.update(id, body);
    }

    @PutMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public Views.UserView roles(@PathVariable Long id, @Valid @RequestBody RoleChange body) {
        return service.setRoles(id, body);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> delete(@PathVariable Long id) {
        service.deactivate(id);
        return Map.of("message", "Usuario desactivado");
    }
}
