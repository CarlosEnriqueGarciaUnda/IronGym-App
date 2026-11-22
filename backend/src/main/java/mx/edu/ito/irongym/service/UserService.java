package mx.edu.ito.irongym.service;

import mx.edu.ito.irongym.dto.Requests.*;
import mx.edu.ito.irongym.dto.Views;
import mx.edu.ito.irongym.exception.ApiException;
import mx.edu.ito.irongym.model.*;
import mx.edu.ito.irongym.repo.*;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {
    private final UserRepository users;
    private final RoleRepository roles;
    private final PasswordEncoder password;
    private final CurrentUser current;
    public UserService(UserRepository users, RoleRepository roles, PasswordEncoder password, CurrentUser current) {
        this.users = users;
        this.roles = roles;
        this.password = password;
        this.current = current;
    }
    public User require(Long id) {
        return users.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }

    @Transactional(readOnly = true)
    public Page<Views.UserView> search(String q, String role, Pageable page) {
        return users.search(q.trim(), role.trim().toUpperCase(), page).map(Views::user);
    }
    public Views.UserView create(UserCreate in) {
        if (users.existsByEmailIgnoreCase(in.email().trim())) throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Correo ya registrado");
        User u = new User();
        u.setName(in.name().trim());
        u.setEmail(in.email().toLowerCase().trim());
        u.setPhone(in.phone());
        u.setPasswordHash(password.encode(in.password()));
        u.getRoles().add(roles.findByName(in.role()).orElseThrow());
        return Views.user(users.save(u));
    }
    public Views.UserView update(Long id, UserUpdate in) {
        User u = require(id);
        users.findByEmailIgnoreCase(in.email().trim()).filter(other -> !other.getId().equals(id)).ifPresent(x -> {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Correo ya utilizado");
        }
        );
        u.setName(in.name().trim());
        u.setEmail(in.email().toLowerCase().trim());
        u.setPhone(in.phone());
        u.setActive(in.active());
        return Views.user(u);
    }
    public Views.UserView updateSelf(UserUpdate in) {
        User u = require(current.get().getId());
        return update(u.getId(), new UserUpdate(in.name(), u.getEmail(), in.phone(), u.getActive()));
    }
    public Views.UserView setRoles(Long id, RoleChange in) {
        User u = require(id);
        if (id.equals(current.get().getId()) && !in.roles().contains("ADMIN")) throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "No puedes quitarte el último rol administrador desde tu sesión");
        u.setRoles(in.roles().stream().map(r -> roles.findByName(r).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Rol inexistente"))).collect(Collectors.toSet()));
        return Views.user(u);
    }
    public void deactivate(Long id) {
        if (id.equals(current.get().getId())) throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "No puedes desactivar tu cuenta abierta");
        require(id).setActive(false);
    }
}
