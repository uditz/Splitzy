package com.example.ExpenseTracker.entity;

import com.example.ExpenseTracker.Enums.FriendshipStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "friendships",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"requester_id", "accepter_id"}
        )
)
public class Friendship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "accepter_id", nullable = false)
    private User accepter;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FriendshipStatus status = FriendshipStatus.PENDING;

    @Column(nullable = false)
    private LocalDateTime requestedAt = LocalDateTime.now();

    private LocalDateTime respondedAt;

    // Optional: prevent A → B and B → A both existing at same time
    @PrePersist
    private void onCreate() {
        this.requestedAt = LocalDateTime.now();
    }
}