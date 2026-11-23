package mx.edu.ito.irongym.controller;

import mx.edu.ito.irongym.dto.Requests.PlanInput;
import mx.edu.ito.irongym.dto.Views;
import mx.edu.ito.irongym.service.PlanService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.*;
import java.util.*;

@RestController
@RequestMapping("/api/plans")
public class PlanController {
    private final PlanService service;
    public PlanController(PlanService service) {
        this.service = service;
    }

    @GetMapping
    public Page<Views.PlanView> all(@RequestParam(defaultValue = "")String q, @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC)Pageable page) {
        return service.search(q, page);
    }

    @GetMapping("/options")
    public List<Views.PlanView> options() {
        return service.options();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Views.PlanView create(@Valid @RequestBody PlanInput in) {
        return service.create(in);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Views.PlanView update(@PathVariable Long id, @Valid @RequestBody PlanInput in) {
        return service.update(id, in);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> delete(@PathVariable Long id) {
        service.disable(id);
        return Map.of("message", "Plan desactivado");
    }
}
