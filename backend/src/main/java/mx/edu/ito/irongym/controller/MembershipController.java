package mx.edu.ito.irongym.controller;

import mx.edu.ito.irongym.dto.Requests.MembershipInput;
import mx.edu.ito.irongym.dto.Views;
import mx.edu.ito.irongym.service.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/memberships")
public class MembershipController {
    private final MembershipService service;
    private final NotificationService notification;
    public MembershipController(MembershipService service, NotificationService notification) {
        this.service = service;
        this.notification = notification;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Page<Views.MembershipView> all(@RequestParam(defaultValue = "")String q, @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC)Pageable page) {
        return service.search(q, page);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('SOCIO')")
    public Page<Views.MembershipView> mine(@PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC)Pageable page) {
        return service.mine(page);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Views.MembershipView create(@Valid @RequestBody MembershipInput in) {
        return service.save(null, in);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Views.MembershipView update(@PathVariable Long id, @Valid @RequestBody MembershipInput in) {
        return service.save(id, in);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> cancel(@PathVariable Long id) {
        service.cancel(id);
        return Map.of("message", "Membresía cancelada");
    }

    @PostMapping("/{id}/notify")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> notify(@PathVariable Long id, @RequestParam String channel) {
        return notification.notifyMember(id, channel);
    }
}
