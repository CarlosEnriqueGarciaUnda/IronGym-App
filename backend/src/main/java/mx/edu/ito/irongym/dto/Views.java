//Cambios en View de Carlos

package mx.edu.ito.irongym.dto;

import mx.edu.ito.irongym.model.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;

public final class Views {
    private Views() {
    }
    public record UserView(Long id, String name, String email, String phone, boolean active, Set<String> roles) {
    }
    public record PlanView(Long id, String name, BigDecimal price, int durationDays, boolean active) {
    }
    public record MembershipView(Long id, Long userId, String userName, Long planId, String planName, BigDecimal price, LocalDate startDate, LocalDate endDate, String status) {
    }
    public record PaymentView(Long id, Long userId, String userName, Long membershipId, BigDecimal amount, String method, LocalDateTime paidAt, String status) {
    }
    public record AttendanceView(Long id, Long userId, String userName, LocalDateTime checkIn, String recordedBy) {
    }
    public record AuthView(String token, UserView user) {
    }
    public static UserView user(User u) {
        return new UserView(u.getId(), u.getName(), u.getEmail(), u.getPhone(), Boolean.TRUE.equals(u.getActive()), u.getRoles().stream().map(Role::getName).collect(java.util.stream.Collectors.toCollection(java.util.TreeSet::new)));
    }
    public static PlanView plan(Plan p) {
        return new PlanView(p.getId(), p.getName(), p.getPrice(), p.getDurationDays(), Boolean.TRUE.equals(p.getActive()));
    }
    public static MembershipView member(Membership m) {
        String status = m.getStatus();
        if (status.equals("ACTIVA") && m.getEndDate().isBefore(LocalDate.now()))status = "VENCIDA";
        return new MembershipView(m.getId(), m.getUser().getId(), m.getUser().getName(), m.getPlan().getId(), m.getPlan().getName(), m.getPlan().getPrice(), m.getStartDate(), m.getEndDate(), status);
    }
    public static PaymentView pay(Payment p) {
        return new PaymentView(p.getId(), p.getUser().getId(), p.getUser().getName(), p.getMembership() == null?null:p.getMembership().getId(), p.getAmount(), p.getMethod(), p.getPaidAt(), p.getStatus());
    }
    public static AttendanceView attendance(Attendance a) {
        return new AttendanceView(a.getId(), a.getUser().getId(), a.getUser().getName(), a.getCheckIn(), a.getRecordedBy() == null?"Sistema":a.getRecordedBy().getName());
    }
}
