package mx.edu.ito.irongym.repo;

import mx.edu.ito.irongym.model.Attendance;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    @EntityGraph(attributePaths = {
        "user", "recordedBy"
    }
    ) @Query("select a from Attendance a join a.user u where :q = '' or lower(u.name) like lower(concat('%',:q,'%'))") Page<Attendance> search(@Param("q")String q, Pageable pageable);
    @EntityGraph(attributePaths = {
        "user", "recordedBy"
    }
    ) Page<Attendance> findByUserId(Long userId, Pageable pageable);
    long countByCheckInBetween(LocalDateTime from, LocalDateTime to);
    long countByUserIdAndCheckInBetween(Long userId, LocalDateTime from, LocalDateTime to);
}
