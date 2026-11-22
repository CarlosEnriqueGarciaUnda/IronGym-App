package mx.edu.ito.irongym.repo;

import mx.edu.ito.irongym.model.Plan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.*;

public interface PlanRepository extends JpaRepository<Plan, Long> {
    @Query("select p from Plan p where :q = '' or lower(p.name) like lower(concat('%',:q,'%'))") Page<Plan> search(@Param("q") String q, Pageable pageable);
}
