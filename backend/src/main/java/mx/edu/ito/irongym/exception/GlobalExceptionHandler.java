package mx.edu.ito.irongym.exception;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private ResponseEntity<?> reply(HttpStatus status, String message, Map<String, String> fields) {
        return ResponseEntity.status(status).body(Map.of("status", status.value(), "message", message, "fieldErrors", fields, "timestamp", Instant.now().toString()));
    }

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<?> api(ApiException e) {
        return reply(e.status(), e.getMessage(), Map.of());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> validation(MethodArgumentNotValidException e) {
        Map<String, String> f = new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors().forEach(x -> f.putIfAbsent(x.getField(), x.getDefaultMessage()));
        return reply(HttpStatus.BAD_REQUEST, "Revisa los campos señalados", f);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<?> malformed(HttpMessageNotReadableException e) {
        return reply(HttpStatus.BAD_REQUEST, "El formato de la solicitud es incorrecto", Map.of());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> forbidden(AccessDeniedException e) {
        return reply(HttpStatus.FORBIDDEN, "No tienes permiso para esta operación", Map.of());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> conflict(DataIntegrityViolationException e) {
        return reply(HttpStatus.UNPROCESSABLE_ENTITY, "La operación viola una relación o dato único", Map.of());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> unexpected(Exception e) {
        return reply(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno. Consulta el registro del servidor.", Map.of());
    }
}
