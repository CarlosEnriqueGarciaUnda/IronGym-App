package mx.edu.ito.irongym.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import mx.edu.ito.irongym.repo.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {
    private final JwtService jwt;
    private final UserRepository users;
    private final RevokedTokenRepository revoked;
    public JwtFilter(JwtService jwt, UserRepository users, RevokedTokenRepository revoked) {
        this.jwt = jwt;
        this.users = users;
        this.revoked = revoked;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)throws ServletException, IOException {
        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ") && SecurityContextHolder.getContext().getAuthentication() == null) {
            String token = header.substring(7);
            try {
                var claims = jwt.parse(token);
                if (!revoked.existsByTokenHash(jwt.hash(token))) {
                    users.findByEmailIgnoreCase(claims.getSubject()).filter(u -> Boolean.TRUE.equals(u.getActive())).ifPresent(u -> {
                        var authorities = u.getRoles().stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r.getName())).toList();
                        var auth = new UsernamePasswordAuthenticationToken(u, null, authorities);
                        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                    );
                }
            }
            catch (RuntimeException e) {
                SecurityContextHolder.clearContext();
            }
        }
        chain.doFilter(req, res);
    }
}
