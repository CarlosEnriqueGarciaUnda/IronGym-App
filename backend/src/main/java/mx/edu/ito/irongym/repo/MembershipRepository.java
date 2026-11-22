package mx.edu.ito.irongym.repo;

import mx.edu.ito.irongym.model.Membership;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.*;

public interface MembershipRepository extends JpaRepository<Membership, Long> {
    @EntityGraph(attributePaths = {
        "user", "plan"
    }
    ) @Query("select m from Membership m join m.user u where :q = '' or lower(u.name) like lower(concat('%',:q,'%')) or lower(u.email) like lower(concat('%',:q,'%'))") Page<Membership> search(@Param("q")String q, Pageable pageable);
    @EntityGraph(attributePaths = {
        "user", "plan"
    }
    ) Page<Membership> findByUserIdOrderByEndDateDesc(Long userId, Pageable pageable);
    @EntityGraph(attributePaths = {
        "user", "plan"
    }
    ) Optional<Membership> findTopByUserIdOrderByEndDateDesc(Long userId);
    long countByEndDateBetweenAndStatus(LocalDate from, LocalDate to, String status);
}
