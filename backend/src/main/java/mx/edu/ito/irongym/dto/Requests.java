//cambios por carlos

package mx.edu.ito.irongym.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public final class Requests {
    private Requests() {
    }
    public static final String PASSWORD_RULE = "^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$";
    public record Login(@NotBlank @Email String email, @NotBlank String password) {
    }
    public record Register(@NotBlank @Size(min = 3, max = 120) String name, @NotBlank @Email String email, @Pattern(regexp = "^$|^[0-9+() -]{10,20}$", message = "Teléfono: mínimo 10 dígitos") String phone, @NotBlank @Pattern(regexp = PASSWORD_RULE, message = "8 caracteres, mayúscula, número y símbolo") String password) {
    }
    public record Forgot(@NotBlank @Email String email) {
    }
    public record Reset(@NotBlank @Email String email, @NotBlank String token, @NotBlank @Pattern(regexp = PASSWORD_RULE, message = "8 caracteres, mayúscula, número y símbolo") String password) {
    }
    public record UserCreate(@NotBlank @Size(min = 3, max = 120) String name, @NotBlank @Email String email, @Pattern(regexp = "^$|^[0-9+() -]{10,20}$") String phone, @NotBlank @Pattern(regexp = PASSWORD_RULE, message = "8 caracteres, mayúscula, número y símbolo") String password, @NotBlank @Pattern(regexp = "ADMIN|ENTRENADOR|SOCIO") String role) {
    }
    public record UserUpdate(@NotBlank @Size(min = 3, max = 120) String name, @NotBlank @Email String email, @Pattern(regexp = "^$|^[0-9+() -]{10,20}$") String phone, @NotNull Boolean active) {
    }
    public record RoleChange(@NotEmpty List<@Pattern(regexp = "ADMIN|ENTRENADOR|SOCIO") String> roles) {
    }
    public record PlanInput(@NotBlank @Size(max = 80) String name, @NotNull @DecimalMin("0.01") BigDecimal price, @NotNull @Min(1) @Max(730) Integer durationDays, @NotNull Boolean active) {
    }
    public record MembershipInput(@NotNull Long userId, @NotNull Long planId, @NotNull LocalDate startDate, @Pattern(regexp = "ACTIVA|VENCIDA|CANCELADA") String status) {
    }
    public record PaymentInput(@NotNull Long userId, Long membershipId, @NotNull @DecimalMin("0.01") BigDecimal amount, @NotBlank @Pattern(regexp = "EFECTIVO|TARJETA|TRANSFERENCIA") String method) {
    }
    public record AttendanceInput(@NotNull Long userId) {
    }
}
