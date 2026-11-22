package mx.edu.ito.irongym.repo;

import mx.edu.ito.irongym.model.User;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    long countByActiveTrue();
    @Query("select count(distinct u) from User u join u.roles r where u.active=true and r.name='SOCIO'") long countActiveMembers();
    @Query("select distinct u from User u where (:q = '' or lower(u.name) like lower(concat('%',:q,'%')) or lower(u.email) like lower(concat('%',:q,'%'))) and (:role = '' or exists(select 1 from User u2 join u2.roles r where u2.id=u.id and r.name=:role))") Page<User> search(@Param("q")String q, @Param("role")String role, Pageable pageable);
}
