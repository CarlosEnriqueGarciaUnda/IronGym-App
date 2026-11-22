package mx.edu.ito.irongym.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import mx.edu.ito.irongym.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.time.*;
import java.util.*;
import java.security.*;

@Service
public class JwtService {
    private final SecretKey key;
    private final long minutes;
    public JwtService(@Value("${irongym.jwt.secret-base64}")String secret, @Value("${irongym.jwt.expiration-minutes:480}")long minutes) {
        byte[] raw = Decoders.BASE64.decode(secret);
        if (raw.length<32) throw new IllegalArgumentException("JWT_SECRET_BASE64 debe contener 32 bytes o más");
        this.key = Keys.hmacShaKeyFor(raw);
        this.minutes = minutes;
    }
    public String issue(User u) {
        Instant now = Instant.now();
        return Jwts.builder().subject(u.getEmail()).claim("roles", u.getRoles().stream().map(x -> x.getName()).toList()).issuedAt(Date.from(now)).expiration(Date.from(now.plus(Duration.ofMinutes(minutes)))).signWith(key).compact();
    }
    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }
    public String hash(String token) {
        try {
            byte[] h = MessageDigest.getInstance("SHA-256").digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(h);
        }
        catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
