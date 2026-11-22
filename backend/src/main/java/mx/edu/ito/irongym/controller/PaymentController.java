package mx.edu.ito.irongym.controller;

import mx.edu.ito.irongym.dto.Requests.PaymentInput;
import mx.edu.ito.irongym.dto.Views;
import mx.edu.ito.irongym.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService service;
    public PaymentController(PaymentService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Page<Views.PaymentView> all(@RequestParam(defaultValue = "")String q, @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC)Pageable page) {
        return service.search(q, page);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('SOCIO')")
    public Page<Views.PaymentView> mine(@PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC)Pageable page) {
        return service.mine(page);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Views.PaymentView create(@Valid @RequestBody PaymentInput in) {
        return service.save(null, in);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Views.PaymentView update(@PathVariable Long id, @Valid @RequestBody PaymentInput in) {
        return service.save(id, in);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> delete(@PathVariable Long id) {
        service.delete(id);
        return Map.of("message", "Cobro eliminado");
    }
}
