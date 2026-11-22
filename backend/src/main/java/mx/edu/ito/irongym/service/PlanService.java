package mx.edu.ito.irongym.service;

import mx.edu.ito.irongym.dto.Requests.PlanInput;
import mx.edu.ito.irongym.dto.Views;
import mx.edu.ito.irongym.exception.ApiException;
import mx.edu.ito.irongym.model.Plan;
import mx.edu.ito.irongym.repo.PlanRepository;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@Transactional
public class PlanService {
    private final PlanRepository plans;
    public PlanService(PlanRepository plans) {
        this.plans = plans;
    }
    public Plan require(Long id) {
        return plans.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Plan no encontrado"));
    }

    @Transactional(readOnly = true)
    public List<Views.PlanView> options() {
        return plans.findAll().stream().filter(p -> Boolean.TRUE.equals(p.getActive())).map(Views::plan).toList();
    }

    @Transactional(readOnly = true)
    public Page<Views.PlanView> search(String q, Pageable page) {
        return plans.search(q.trim(), page).map(Views::plan);
    }
    public Views.PlanView create(PlanInput in) {
        Plan p = new Plan();
        apply(p, in);
        return Views.plan(plans.save(p));
    }
    public Views.PlanView update(Long id, PlanInput in) {
        Plan p = require(id);
        apply(p, in);
        return Views.plan(p);
    }
    public void disable(Long id) {
        require(id).setActive(false);
    }
    private void apply(Plan p, PlanInput in) {
        p.setName(in.name().trim());
        p.setPrice(in.price());
        p.setDurationDays(in.durationDays());
        p.setActive(in.active());
    }
}
