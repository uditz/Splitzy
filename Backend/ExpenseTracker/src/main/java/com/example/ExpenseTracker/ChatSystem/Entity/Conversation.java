package com.example.ExpenseTracker.ChatSystem.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(
        name = "conversation",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user1Id", "user2Id"})
        }
)
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long user1Id;
    private Long user2Id;

    private LocalDateTime createdAt;

    // getters & setters
}
