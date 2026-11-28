package mx.edu.ito.irongym.controller;

import mx.edu.ito.irongym.dto.Requests.AttendanceInput;
import mx.edu.ito.irongym.dto.Views;
import mx.edu.ito.irongym.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/attendances")
public class AttendanceController {
    private final AttendanceService service;
    public AttendanceController(AttendanceService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','ENTRENADOR')")
    public Page<Views.AttendanceView> all(@RequestParam(defaultValue = "")String q, @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC)Pageable page) {
        return service.search(q, page);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('SOCIO')")
    public Page<Views.AttendanceView> mine(@PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC)Pageable page) {
        return service.mine(page);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','ENTRENADOR')")
    public Views.AttendanceView create(@Valid @RequestBody AttendanceInput in) {
        return service.save(null, in);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Views.AttendanceView update(@PathVariable Long id, @Valid @RequestBody AttendanceInput in) {
        return service.save(id, in);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> delete(@PathVariable Long id) {
        service.delete(id);
        return Map.of("message", "Asistencia eliminada");
    }
}
