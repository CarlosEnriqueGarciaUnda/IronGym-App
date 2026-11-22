package mx.edu.ito.irongym.service;

import mx.edu.ito.irongym.dto.Requests.PaymentInput;
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
public class PaymentService {
    private final PaymentRepository payments;
    private final MembershipService memberships;
    private final UserService users;
    private final CurrentUser current;
    public PaymentService(PaymentRepository payments, MembershipService memberships, UserService users, CurrentUser current) {
        this.payments = payments;
        this.memberships = memberships;
        this.users = users;
        this.current = current;
    }
    private Payment require(Long id) {
        return payments.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Cobro no encontrado"));
    }

    @Transactional(readOnly = true)
    public Page<Views.PaymentView> search(String q, Pageable p) {
        return payments.search(q.trim(), p).map(Views::pay);
    }

    @Transactional(readOnly = true)
    public Page<Views.PaymentView> mine(Pageable p) {
        return payments.findByUserId(current.get().getId(), p).map(Views::pay);
    }
    public Views.PaymentView save(Long id, PaymentInput in) {
        User u = users.require(in.userId());
        Membership m = in.membershipId() == null?null:memberships.require(in.membershipId());
        if (m != null && !m.getUser().getId().equals(u.getId())) throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "La membresía no pertenece al socio seleccionado");
        Payment p = id == null?new Payment():require(id);
        p.setUser(u);
        p.setMembership(m);
        p.setAmount(in.amount());
        p.setMethod(in.method());
        return Views.pay(payments.save(p));
    }
    public void delete(Long id) {
        payments.delete(require(id));
    }
}
