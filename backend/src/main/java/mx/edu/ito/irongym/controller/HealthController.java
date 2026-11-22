package mx.edu.ito.irongym.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/api/health")
    public Map<String, String> status() {
        return Map.of("service", "IRON GYM", "status", "UP");
    }
}
