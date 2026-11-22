package mx.edu.ito.irongym.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification_logs")
@Getter
@Setter
@NoArgsConstructor
public class NotificationLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;
    private String channel;
    private String status;
    @Column(length = 600)
    private String message;
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
