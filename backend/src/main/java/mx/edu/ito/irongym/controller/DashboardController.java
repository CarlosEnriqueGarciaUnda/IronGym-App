package mx.edu.ito.irongym.controller;

import mx.edu.ito.irongym.service.DashboardService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService service;
    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> admin() {
        return service.admin();
    }

    @GetMapping("/trainer")
    @PreAuthorize("hasRole('ENTRENADOR')")
    public Map<String, Object> trainer() {
        return service.trainer();
    }

    @GetMapping("/member")
    @PreAuthorize("hasRole('SOCIO')")
    public Map<String, Object> member() {
        return service.member();
    }
}
