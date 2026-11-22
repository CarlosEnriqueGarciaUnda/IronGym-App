package mx.edu.ito.irongym.service;

import mx.edu.ito.irongym.dto.Requests.MembershipInput;
import mx.edu.ito.irongym.dto.Views;
import mx.edu.ito.irongym.exception.ApiException;
import mx.edu.ito.irongym.model.*;
import mx.edu.ito.irongym.repo.*;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@Transactional
public class MembershipService {
    private final MembershipRepository memberships;
    private final UserService users;
    private final PlanService plans;
    private final CurrentUser current;
    public MembershipService(MembershipRepository memberships, UserService users, PlanService plans, CurrentUser current) {
        this.memberships = memberships;
        this.users = users;
        this.plans = plans;
        this.current = current;
    }
    public Membership require(Long id) {
        return memberships.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Membresía no encontrada"));
    }

    @Transactional(readOnly = true)
    public Page<Views.MembershipView> search(String q, Pageable p) {
        return memberships.search(q.trim(), p).map(Views::member);
    }

    @Transactional(readOnly = true)
    public Page<Views.MembershipView> mine(Pageable pageable) {
        return memberships.findByUserIdOrderByEndDateDesc(current.get().getId(), pageable).map(Views::member);
    }
    public Views.MembershipView save(Long id, MembershipInput in) {
        User u = users.require(in.userId());
        if (u.getRoles().stream().noneMatch(r -> r.getName().equals("SOCIO"))) throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "La membresía debe pertenecer a un socio");
        Plan p = plans.require(in.planId());
        Membership m = id == null?new Membership():require(id);
        m.setUser(u);
        m.setPlan(p);
        m.setStartDate(in.startDate());
        m.setEndDate(in.startDate().plusDays(p.getDurationDays()));
        m.setStatus(in.status() == null?"ACTIVA":in.status());
        return Views.member(memberships.save(m));
    }
    public void cancel(Long id) {
        require(id).setStatus("CANCELADA");
    }
}
