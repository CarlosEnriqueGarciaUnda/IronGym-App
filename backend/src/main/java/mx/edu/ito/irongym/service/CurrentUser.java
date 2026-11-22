package mx.edu.ito.irongym.service;

import mx.edu.ito.irongym.model.User;
import mx.edu.ito.irongym.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUser {
    public User get() {
        Object p = SecurityContextHolder.getContext().getAuthentication() == null?null:SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (p instanceof User u)return u;
        throw new ApiException(HttpStatus.UNAUTHORIZED, "Inicia sesión");
    }
    public boolean has(String role) {
        return get().getRoles().stream().anyMatch(r -> r.getName().equals(role));
    }
}
