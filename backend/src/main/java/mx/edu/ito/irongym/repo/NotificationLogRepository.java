package mx.edu.ito.irongym.repo;

import mx.edu.ito.irongym.model.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
}
