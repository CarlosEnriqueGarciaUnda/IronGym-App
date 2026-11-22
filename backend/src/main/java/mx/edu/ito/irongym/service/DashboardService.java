package mx.edu.ito.irongym.service;

import mx.edu.ito.irongym.repo.*;
import mx.edu.ito.irongym.dto.Views;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.math.*;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class DashboardService {
    private final UserRepository users;
    private final MembershipRepository memberships;
    private final PaymentRepository payments;
    private final AttendanceRepository attendances;
    private final CurrentUser current;
    public DashboardService(UserRepository users, MembershipRepository memberships, PaymentRepository payments, AttendanceRepository attendances, CurrentUser current) {
        this.users = users;
        this.memberships = memberships;
        this.payments = payments;
        this.attendances = attendances;
        this.current = current;
    }
    public Map<String, Object> admin() {
        LocalDate d = LocalDate.now();
        LocalDateTime start = d.withDayOfMonth(1).atStartOfDay();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("sociosActivos", users.countActiveMembers());
        result.put("ingresosMes", Optional.ofNullable(payments.sumBetween(start, start.plusMonths(1))).orElse(BigDecimal.ZERO));
        result.put("asistenciasHoy", attendances.countByCheckInBetween(d.atStartOfDay(), d.plusDays(1).atStartOfDay()));
        result.put("porVencer", memberships.countByEndDateBetweenAndStatus(d, d.plusDays(7), "ACTIVA"));
        result.put("weeklyAttendance", weekly());
        return result;
    }
    public Map<String, Object> trainer() {
        LocalDate d = LocalDate.now();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("sociosActivos", users.countActiveMembers());
        result.put("asistenciasHoy", attendances.countByCheckInBetween(d.atStartOfDay(), d.plusDays(1).atStartOfDay()));
        result.put("weeklyAttendance", weekly());
        return result;
    }
    private List<Map<String, Object>> weekly() {
        List<Map<String, Object>> days = new ArrayList<>();
        for (int n = 6;n >= 0;n--) {
            LocalDate day = LocalDate.now().minusDays(n);
            days.add(Map.of("label", day.getDayOfWeek().getDisplayName(java.time.format.TextStyle.SHORT, new Locale("es", "MX")), "count", attendances.countByCheckInBetween(day.atStartOfDay(), day.plusDays(1).atStartOfDay())));
        }
        return days;
    }
    public Map<String, Object> member() {
        LocalDate d = LocalDate.now();
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("asistenciasMes", attendances.countByUserIdAndCheckInBetween(current.get().getId(), d.withDayOfMonth(1).atStartOfDay(), d.withDayOfMonth(1).plusMonths(1).atStartOfDay()));
        data.put("membresia", memberships.findTopByUserIdOrderByEndDateDesc(current.get().getId()).map(Views::member).orElse(null));
        return data;
    }
}
