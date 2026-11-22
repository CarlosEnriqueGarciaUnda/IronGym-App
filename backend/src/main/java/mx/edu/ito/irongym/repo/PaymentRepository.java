package mx.edu.ito.irongym.repo;

import mx.edu.ito.irongym.model.Payment;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    @EntityGraph(attributePaths = {
        "user", "membership"
    }
    ) @Query("select p from Payment p join p.user u where :q = '' or lower(u.name) like lower(concat('%',:q,'%')) or lower(u.email) like lower(concat('%',:q,'%'))") Page<Payment> search(@Param("q")String q, Pageable pageable);
    @EntityGraph(attributePaths = {
        "user", "membership"
    }
    ) Page<Payment> findByUserId(Long userId, Pageable pageable);
    @Query("select sum(p.amount) from Payment p where p.paidAt >= :start and p.paidAt < :end and p.status='PAGADO'") BigDecimal sumBetween(@Param("start")LocalDateTime start, @Param("end")LocalDateTime end);
}
