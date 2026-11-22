package mx.edu.ito.irongym.service;

import mx.edu.ito.irongym.dto.Requests.*;
import mx.edu.ito.irongym.dto.Views;
import mx.edu.ito.irongym.exception.ApiException;
import mx.edu.ito.irongym.model.*;
import mx.edu.ito.irongym.repo.*;
import mx.edu.ito.irongym.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;
import java.security.SecureRandom;
import java.time.*;
import java.util.*;

@Service
public class AuthService {
    private final UserRepository users;
    private final RoleRepository roles;
    private final RevokedTokenRepository revoked;
    private final PasswordResetTokenRepository resets;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final JavaMailSender mail;
    @Value("${irongym.mail.enabled:false}")
    private boolean mailEnabled;
    @Value("${irongym.mail.from}")
    private String from;
    @Value("${irongym.frontend-url}")
    private String frontend;
    public AuthService(UserRepository users, RoleRepository roles, RevokedTokenRepository revoked, PasswordResetTokenRepository resets, PasswordEncoder encoder, JwtService jwt, JavaMailSender mail) {
        this.users = users;
        this.roles = roles;
        this.revoked = revoked;
        this.resets = resets;
        this.encoder = encoder;
        this.jwt = jwt;
        this.mail = mail;
    }

    @Transactional
    public Views.AuthView login(Login in) {
        User u = users.findByEmailIgnoreCase(in.email().trim()).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos"));
        if (!u.getActive() || !encoder.matches(in.password(), u.getPasswordHash())) throw new ApiException(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos");
        return new Views.AuthView(jwt.issue(u), Views.user(u));
    }

    @Transactional
    public Views.AuthView register(Register in) {
        if (users.existsByEmailIgnoreCase(in.email().trim())) throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Ya existe una cuenta con ese correo");
        User u = new User();
        u.setName(in.name().trim());
        u.setEmail(in.email().trim().toLowerCase());
        u.setPhone(in.phone());
        u.setPasswordHash(encoder.encode(in.password()));
        u.getRoles().add(roles.findByName("SOCIO").orElseThrow());
        users.save(u);
        return new Views.AuthView(jwt.issue(u), Views.user(u));
    }

    @Transactional
    public void logout(String auth) {
        if (auth == null || !auth.startsWith("Bearer ")) throw new ApiException(HttpStatus.BAD_REQUEST, "Falta token Bearer");
        String token = auth.substring(7);
        String hash = jwt.hash(token);
        if (!revoked.existsByTokenHash(hash)) {
            RevokedToken r = new RevokedToken();
            r.setTokenHash(hash);
            r.setExpiresAt(LocalDateTime.ofInstant(jwt.parse(token).getExpiration().toInstant(), ZoneOffset.UTC));
            revoked.save(r);
        }
    }

    @Transactional
    public Map<String, String> forgot(Forgot in) {
        if (!mailEnabled) throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "El correo aún no está configurado; activa Postfix para recuperar contraseñas");
        users.findByEmailIgnoreCase(in.email().trim()).ifPresent(u -> {
            byte[] b = new byte[32];
            new SecureRandom().nextBytes(b);
            String raw = HexFormat.of().formatHex(b);
            PasswordResetToken rt = new PasswordResetToken();
            rt.setUser(u);
            rt.setTokenHash(jwt.hash(raw));
            rt.setExpiresAt(LocalDateTime.now(ZoneOffset.UTC).plusMinutes(30));
            resets.save(rt);
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(u.getEmail());
            message.setSubject("IRON GYM | Recuperar contraseña");
            message.setText("Visita el siguiente enlace (30 minutos): " + frontend + "/reset-password?email=" + java.net.URLEncoder.encode(u.getEmail(), java.nio.charset.StandardCharsets.UTF_8) + "&token=" + raw);
            mail.send(message);
        }
        );
        return Map.of("message", "Si el correo existe, recibirás instrucciones");
    }

    @Transactional
    public Map<String, String> reset(Reset in) {
        PasswordResetToken r = resets.findByTokenHashAndUsedFalse(jwt.hash(in.token())).orElseThrow(() -> new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Enlace inválido o ya utilizado"));
        if (r.getExpiresAt().isBefore(LocalDateTime.now(ZoneOffset.UTC)) || !r.getUser().getEmail().equalsIgnoreCase(in.email())) throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Enlace vencido o correo incorrecto");
        r.getUser().setPasswordHash(encoder.encode(in.password()));
        r.setUsed(true);
        return Map.of("message", "Contraseña actualizada; inicia sesión");
    }
}
