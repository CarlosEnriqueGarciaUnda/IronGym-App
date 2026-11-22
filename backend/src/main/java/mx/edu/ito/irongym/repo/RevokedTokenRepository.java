package mx.edu.ito.irongym.repo;

import mx.edu.ito.irongym.model.RevokedToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RevokedTokenRepository extends JpaRepository<RevokedToken, Long> {
    boolean existsByTokenHash(String hash);
}
