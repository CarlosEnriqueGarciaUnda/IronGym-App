package mx.edu.ito.irongym.service;

import mx.edu.ito.irongym.dto.Requests.AttendanceInput;
import mx.edu.ito.irongym.dto.Views;
import mx.edu.ito.irongym.exception.ApiException;
import mx.edu.ito.irongym.model.*;
import mx.edu.ito.irongym.repo.*;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AttendanceService {
    private final AttendanceRepository attendances;
    private final UserService users;
    private final CurrentUser current;
    public AttendanceService(AttendanceRepository attendances, UserService users, CurrentUser current) {
        this.attendances = attendances;
        this.users = users;
        this.current = current;
    }
    private Attendance require(Long id) {
        return attendances.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Asistencia no encontrada"));
    }

    @Transactional(readOnly = true)
    public Page<Views.AttendanceView> search(String q, Pageable p) {
        return attendances.search(q.trim(), p).map(Views::attendance);
    }

    @Transactional(readOnly = true)
    public Page<Views.AttendanceView> mine(Pageable p) {
        return attendances.findByUserId(current.get().getId(), p).map(Views::attendance);
    }
    public Views.AttendanceView save(Long id, AttendanceInput in) {
        User u = users.require(in.userId());
        if (u.getRoles().stream().noneMatch(r -> r.getName().equals("SOCIO"))) throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Solo se registran entradas de socios");
        Attendance a = id == null?new Attendance():require(id);
        a.setUser(u);
        a.setRecordedBy(current.get());
        return Views.attendance(attendances.save(a));
    }
    public void delete(Long id) {
        attendances.delete(require(id));
    }
}
